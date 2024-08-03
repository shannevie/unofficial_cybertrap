package main

import (
	"context"
	"encoding/json"
	"os"

	nuclei "github.com/projectdiscovery/nuclei/v3/lib"
	amqp "github.com/rabbitmq/amqp091-go"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
	appConfig "github.com/shannevie/unofficial_cybertrap/backend/configs"
	"github.com/shannevie/unofficial_cybertrap/backend/internal/nuclei_scanner/repository"
	"github.com/shannevie/unofficial_cybertrap/backend/internal/rabbitmq"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// ScanMessage defines the structure of the message received from RabbitMQ
// TODO: DomainID and TemplateId will be an array of strings
type ScanMessage struct {
	ScanID     string `json:"scan_id"`
	TemplateID string `json:"template_id"`
	DomainID   string `json:"domain_id"`
}

func main() {
	// Start logger
	log.Logger = log.Output(zerolog.ConsoleWriter{Out: os.Stderr})

	// Load application config
	config, err := appConfig.LoadNucleiConfig(".")
	if err != nil {
		log.Fatal().Err(err).Msg("Failed to load app config")
	}

	// Initialize MongoDB client
	clientOpts := options.Client().ApplyURI(config.MongoDbUri)
	mongoClient, err := mongo.Connect(context.Background(), clientOpts)
	if err != nil {
		log.Fatal().Err(err).Msg("Failed to connect to MongoDB")
	}
	defer mongoClient.Disconnect(context.Background())

	// Initialize MongoDB repository
	repo := repository.NewMongoRepository(mongoClient, config.MongoDbName, log.Logger)

	// Initialize RabbitMQ client
	rabbitClient, err := rabbitmq.NewRabbitMQClient(config.RabbitMqUrl, log.Logger)
	if err != nil {
		log.Fatal().Err(err).Msg("Failed to create rabbitmq client")
	}
	defer rabbitClient.Close()

	// Declare exchange and queue
	err = rabbitClient.DeclareExchangeAndQueue()
	if err != nil {
		log.Fatal().Err(err).Msg("Failed to declare exchange and queue")
	}

	// Consume messages from RabbitMQ
	messages, err := rabbitClient.Consume()
	if err != nil {
		log.Fatal().Err(err).Msg("Failed to consume messages")
	}

	// Process messages from RabbitMQ
	// TODO: For now this is to work on a single scan at a time due to ScanMessage being a single
	for msg := range messages {
		go func(msg amqp.Delivery) {
			var scanMsg ScanMessage
			if err := json.Unmarshal(msg.Body, &scanMsg); err != nil {
				log.Error().Err(err).Msg("Failed to unmarshal message")
				return
			}

			log.Info().Msgf("Received message: %s", msg.Body)

			// Fetch template and domain from MongoDB
			templateID, _ := primitive.ObjectIDFromHex(scanMsg.TemplateID)
			template, err := repo.FindTemplateByID(context.Background(), templateID)
			// Download TODO: the template using the s3 url

			if err != nil {
				log.Error().Err(err).Msg("Failed to find template by ID")
				return
			}

			domainID, _ := primitive.ObjectIDFromHex(scanMsg.DomainID)
			domain, err := repo.FindDomainByID(context.Background(), domainID)
			if err != nil {
				log.Error().Err(err).Msg("Failed to find domain by ID")
				return
			}

			// Update scan status to "in-progress"
			scanID, _ := primitive.ObjectIDFromHex(scanMsg.ScanID)
			err = repo.UpdateScanStatus(context.Background(), scanID, "in-progress")
			if err != nil {
				log.Error().Err(err).Msg("Failed to update scan status")
				return
			}

			// Create Nuclei engine and run the scan
			ne, err := nuclei.NewNucleiEngineCtx(context.TODO())
			if err != nil {
				log.Error().Err(err).Msg("Failed to create Nuclei engine")
				return
			}
			defer ne.Close()

			// Load the targets from the domain fetched from MongoDB
			targets := []string{domain.Domain}
			ne.LoadTargets(targets, false)

			err = ne.ExecuteWithCallback(nil)
			if err != nil {
				log.Error().Err(err).Msg("Failed to execute scan")
				// Update scan status to "failed"
				repo.UpdateScanStatus(context.Background(), scanID, "failed")
				return
			}

			// Update scan status to "completed"
			err = repo.UpdateScanStatus(context.Background(), scanID, "completed")
			if err != nil {
				log.Error().Err(err).Msg("Failed to update scan status")
				return
			}
		}(msg)
	}
}
