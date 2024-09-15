package main

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"os/signal"
	"path/filepath"
	"sync"
	"syscall"

	awsConfig "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	nuclei "github.com/projectdiscovery/nuclei/v3/lib"
	amqp "github.com/rabbitmq/amqp091-go"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
	appConfig "github.com/shannevie/unofficial_cybertrap/backend/configs"
	helpers "github.com/shannevie/unofficial_cybertrap/backend/internal/nuclei_scanner/helpers"
	"github.com/shannevie/unofficial_cybertrap/backend/internal/rabbitmq"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

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
	mongoHelper := helpers.NewMongoHelper(mongoClient, config.MongoDbName)
	log.Info().Msg("MongoDB client initialized")

	// Initialize RabbitMQ client
	rabbitClient, err := rabbitmq.NewRabbitMQClient(config.RabbitMqUri)
	if err != nil {
		log.Fatal().Err(err).Msg("Failed to create rabbitmq client")
	}
	log.Info().Msg("RabbitMQ client initialized")
	defer rabbitClient.Close()

	// Declare exchange and queue
	err = rabbitClient.DeclareExchangeAndQueue()
	if err != nil {
		log.Fatal().Err(err).Msg("Failed to declare exchange and queue")
	}

	// Initialize S3 helper
	awsCfg, err := awsConfig.LoadDefaultConfig(context.TODO(), awsConfig.WithRegion("ap-southeast-1"), awsConfig.WithCredentialsProvider(
		credentials.NewStaticCredentialsProvider(config.AwsAccessKeyId, config.AwsSecretAccessKey, ""),
	))
	if err != nil {
		log.Fatal().Err(err).Msg("Failed to load AWS config")
	}

	s3Helper, err := helpers.NewS3Helper(awsCfg, config.BucketName)
	if err != nil {
		log.Fatal().Err(err).Msg("Failed to create S3 helper")
	}

	// Consume messages from RabbitMQ
	messages, err := rabbitClient.Consume()
	if err != nil {
		log.Fatal().Err(err).Msg("Failed to consume messages")
	}

	// Set the maximum number of concurrent scans (customize this value based on your requirements)
	maxConcurrentScans := 5 // Example: max 5 concurrent scans
	semaphore := make(chan struct{}, maxConcurrentScans)

	// Signal handling for graceful shutdown
	signalChan := make(chan os.Signal, 1)
	signal.Notify(signalChan, syscall.SIGINT, syscall.SIGTERM)

	templateDir := filepath.Join(os.TempDir(), "nuclei-templates")
	nuclei.DefaultConfig.TemplatesDirectory = templateDir

	// Process messages from RabbitMQ
	log.Info().Msg("Listening for messages from RabbitMQ")
	for msg := range messages {
		// This would block until a slot is available
		// API level will do a check on max number of items in the rabbitmq queue
		// before sending a message to the queue to prevent overloading the queue
		semaphore <- struct{}{} // Acquire a slot

		go func(msg amqp.Delivery) {
			defer func() { <-semaphore }() // Release the slot once the goroutine is finished

			// We ack the message first, so the mq can remove it
			// then if any processing fails, we simply log it as error into the logs db
			msg.Ack(false)

			var scanMsg rabbitmq.ScanMessage
			if err := json.Unmarshal(msg.Body, &scanMsg); err != nil {
				log.Error().Err(err).Msg("Failed to unmarshal message")
				msg.Nack(false, true) // Nack the message so another free machine can pick it up
				return
			}

			log.Info().Msgf("Received message: %s", msg.Body)

			// Create a scan ID for the scan which will be used to store the results
			scanID, _ := primitive.ObjectIDFromHex(scanMsg.ScanID)
			nh := helpers.NewNucleiHelper(s3Helper, mongoHelper)

			// Update scan status to "in-progress"
			err = mongoHelper.UpdateScanStatus(context.Background(), scanID, "in-progress")
			if err != nil {
				log.Error().Err(err).Msg("Failed to update scan status")
				msg.Nack(false, true) // Nack the message so another machine can pick it up
				return
			}

			// Fetch the domain from MongoDB
			domainID, err := primitive.ObjectIDFromHex(scanMsg.DomainID)
			if err != nil {
				log.Error().Err(err).Msg("Failed to convert domain ID to ObjectID")
				return
			}

			domain, err := mongoHelper.FindDomainByID(context.Background(), domainID)
			if err != nil {
				log.Error().Err(err).Msg("Failed to find domain by ID")
				// TODO: Log the error into the logs db
				return
			}

			// Concurrently download the templates
			// Fetch template and domain from MongoDB
			var wg sync.WaitGroup

			templateFiles := make([]string, 0, len(scanMsg.TemplateIDs))
			errChan := make(chan error, len(scanMsg.TemplateIDs))

			log.Info().Msgf("Downloading templates")
			for _, templateIDStr := range scanMsg.TemplateIDs {
				wg.Add(1)
				go func(idStr string) {
					defer wg.Done()

					templateID, err := primitive.ObjectIDFromHex(idStr)
					if err != nil {
						errChan <- fmt.Errorf("invalid template ID: %s, error: %w", idStr, err)
						return
					}

					template, err := mongoHelper.FindTemplateByID(context.Background(), templateID)
					if err != nil {
						errChan <- fmt.Errorf("failed to find template by ID: %s, error: %w", idStr, err)
						return
					}

					templateFilePath := filepath.Join(templateDir, fmt.Sprintf("template-%s.yaml", idStr))

					log.Info().Msgf("Downloading template %s to %s", template.S3URL, templateFilePath)

					err = s3Helper.DownloadFileFromURL(template.S3URL, templateFilePath)
					if err != nil {
						errChan <- fmt.Errorf("failed to download template file from S3 for ID: %s, error: %w", idStr, err)
						return
					}

					templateFiles = append(templateFiles, templateFilePath)
				}(templateIDStr)
			}

			wg.Wait()
			close(errChan)

			for err := range errChan {
				log.Error().Err(err).Msg("Error occurred during template processing")

				if err != nil {
					log.Error().Err(err).Msg("Failed to download template file from S3")
					// TODO: Log the error into the logs db
					return
				}
			}

			// Ensure all downloaded files are deleted after scan
			defer func() {
				for _, file := range templateFiles {
					// Don't delete TemplatesDirectory
					if file == nuclei.DefaultConfig.TemplatesDirectory {
						continue
					}
					os.Remove(file)
				}
			}()

			log.Info().Msg("Successfully downloaded templates")

			nh.ScanWithNuclei(scanID, domain.Domain, domainID.Hex(), templateFiles)
		}(msg)
	}

	// Block until a signal is received
	sig := <-signalChan
	log.Info().Msgf("Received signal %s. Shutting down gracefully...", sig)

	// Perform any cleanup tasks here before exiting
	// Ensure all goroutines are finished
	close(semaphore)
	for i := 0; i < maxConcurrentScans; i++ {
		semaphore <- struct{}{}
	}
}
