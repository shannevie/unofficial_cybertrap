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

	awsConfig "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	appConfig "github.com/shannevie/unofficial_cybertrap/backend/configs"
	handler "github.com/shannevie/unofficial_cybertrap/backend/internal/artefacts_api/http"
	r "github.com/shannevie/unofficial_cybertrap/backend/internal/artefacts_api/repository"
	s "github.com/shannevie/unofficial_cybertrap/backend/internal/artefacts_api/service"
)

func main() {
	// Start logger
	log.Logger = log.Output(zerolog.ConsoleWriter{Out: os.Stderr})
	httplog.Configure(httplog.Options{Concise: true, TimeFieldFormat: time.DateTime})

	// load env configurations
	appConfig, err := appConfig.LoadArtefactConfig(".")
	if err != nil {
		log.Fatal().Err(err).Msg("unable to load configurations")
	}

	// Prepare external services such as db, cache, etc.
	// AWS Setup
	awsCfg, err := awsConfig.LoadDefaultConfig(context.TODO(), awsConfig.WithCredentialsProvider(
		credentials.NewStaticCredentialsProvider(appConfig.AwsAccessKeyId, appConfig.AwsSecretAccessKey, ""),
	))
	if err != nil {
		log.Fatal().Err(err).Msg("failed to load AWS configuration, please check your AWS credentials")
	}
	s3Client := s3.NewFromConfig(awsCfg)

	// Create router and setup middlewares
	router := chi.NewRouter()
	// middleware
	router.Use(httplog.RequestLogger(log.Logger))
	router.Use(middleware.Timeout(60 * time.Second))
	router.Use(middleware.RequestID)
	router.Use(middleware.RealIP)
	router.Use(middleware.Recoverer)

	// repositories DI
	artefactRepo := r.NewArtefactRepository(s3Client, appConfig.BucketName)

	// service DI
	artefactService := s.NewArtefactService(artefactRepo)

	// HTTP handlers
	handler.NewArtefactHandler(router, *artefactService)

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
