package main

import (
	"context"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/go-chi/chi"
	"github.com/go-chi/chi/middleware"
	"github.com/go-chi/httplog"
	_ "github.com/lib/pq"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	awsConfig "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	appConfig "github.com/shannevie/unofficial_cybertrap/backend/configs"
	"github.com/shannevie/unofficial_cybertrap/backend/internal/domains_api/handlers"
	r "github.com/shannevie/unofficial_cybertrap/backend/internal/domains_api/repository"
	s "github.com/shannevie/unofficial_cybertrap/backend/internal/domains_api/service"
	"github.com/shannevie/unofficial_cybertrap/backend/internal/rabbitmq"
)

func main() {
	// Start logger
	log.Logger = log.Output(zerolog.ConsoleWriter{Out: os.Stderr})
	httplog.Configure(httplog.Options{Concise: true, TimeFieldFormat: time.DateTime})

	// load env configurations
	appConfig, err := appConfig.LoadDomainsConfig(".")
	if err != nil {
		log.Fatal().Err(err).Msg("unable to load configurations")
	}

	log.Info().Msg("appConfig mongo uri: " + appConfig.MongoDbUri)

	// Prepare external services such as db, cache, etc.
	// AWS Setup
	awsCfg, err := awsConfig.LoadDefaultConfig(context.TODO(), awsConfig.WithRegion("ap-southeast-1"), awsConfig.WithCredentialsProvider(
		credentials.NewStaticCredentialsProvider(appConfig.AwsAccessKeyId, appConfig.AwsSecretAccessKey, ""),
	))
	if err != nil {
		log.Fatal().Err(err).Msg("failed to load AWS configuration, please check your AWS credentials")
	}
	s3Client := s3.NewFromConfig(awsCfg)

	// Setup mongodb
	clientOpts := options.Client().ApplyURI(appConfig.MongoDbUri)
	mongoClient, err := mongo.Connect(context.Background(), clientOpts)
	if err != nil {
		log.Fatal().Err(err).Msg("failed to connect to MongoDB")
	}

	// Setup rabbitmq client
	mqClient, err := rabbitmq.NewRabbitMQClient(appConfig.RabbitMqUri)
	if err != nil {
		log.Fatal().Err(err).Msg("failed to connect to RabbitMQ")
	}

	// Create router and setup middlewares
	router := chi.NewRouter()
	// middleware
	router.Use(httplog.RequestLogger(log.Logger))
	router.Use(middleware.Timeout(60 * time.Second))
	router.Use(middleware.RequestID)
	router.Use(middleware.RealIP)
	router.Use(middleware.Recoverer)

	// repositories DI
	domainsRepo := r.NewDomainsRepository(mongoClient, appConfig.MongoDbName)
	templatesRepo := r.NewTemplatesRepository(s3Client, appConfig.BucketName, mongoClient, appConfig.MongoDbName)

	// service DI
	domainsService := s.NewDomainsService(domainsRepo, mqClient)
	templatesService := s.NewTemplatesService(templatesRepo)

	// HTTP handlers
	handlers.NewDomainsHandler(router, *domainsService)
	handlers.NewTemplatesHandler(router, *templatesService)

	// Start the server
	server := &http.Server{
		Addr:    appConfig.ServeAddress,
		Handler: router,
	}

	go func() {
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatal().Err(err).Msg("failed to start server")
		}
	}()

	log.Info().Str("address", appConfig.ServeAddress).Msg("Server started successfully")

	// graceful shutdown
	waitForShutdown(server)
}

// waitForShutdown graceful shutdown
func waitForShutdown(server *http.Server) {
	sig := make(chan os.Signal, 1)
	signal.Notify(sig, os.Interrupt, syscall.SIGTERM)
	<-sig

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		log.Fatal().Err(err).Msg("failed to gracefully shut down server")
	}
}
