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

	nuclei "github.com/projectdiscovery/nuclei/v3/lib"
	"github.com/projectdiscovery/nuclei/v3/pkg/output"
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
	mongoHelper := helpers.NewMongoHelper(mongoClient, config.MongoDbName, log.Logger)

	// Initialize RabbitMQ client
	rabbitClient, err := rabbitmq.NewRabbitMQClient(config.RabbitMqUri)
	if err != nil {
		log.Fatal().Err(err).Msg("Failed to create rabbitmq client")
	}
	defer rabbitClient.Close()

	// Declare exchange and queue
	err = rabbitClient.DeclareExchangeAndQueue()
	if err != nil {
		log.Fatal().Err(err).Msg("Failed to declare exchange and queue")
	}

	// Initialize S3 helper
	s3Helper, err := helpers.NewS3Helper()
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

	// Process messages from RabbitMQ
	for msg := range messages {
		// This would block until a slot is available
		// API level will do a check on max number of items in the rabbitmq queue
		// before sending a message to the queue to prevent overloading the queue
		semaphore <- struct{}{} // Acquire a slot

		go func(msg amqp.Delivery) {
			defer func() { <-semaphore }() // Release the slot once the goroutine is finished

			scanResults := []output.ResultEvent{}

			var scanMsg rabbitmq.ScanMessage
			if err := json.Unmarshal(msg.Body, &scanMsg); err != nil {
				log.Error().Err(err).Msg("Failed to unmarshal message")
				msg.Nack(false, true) // Nack the message so another free machine can pick it up
				return
			}

			log.Info().Msgf("Received message: %s", msg.Body)

			// We ack the message first, so the mq can remove it
			// then if any processing fails, we simply log it as error into the logs db
			msg.Ack(false)

			// Create a scan ID for the scan which will be used to store the results
			scanID, _ := primitive.ObjectIDFromHex(scanMsg.ScanID)

			// Update scan status to "in-progress"
			err = mongoHelper.UpdateScanStatus(context.Background(), scanID, "in-progress")
			if err != nil {
				log.Error().Err(err).Msg("Failed to update scan status")
				msg.Nack(false, true) // Nack the message so another machine can pick it up
				return
			}

			// Fetch the domain from MongoDB
			domainID, _ := primitive.ObjectIDFromHex(scanMsg.DomainID)
			domain, err := mongoHelper.FindDomainByID(context.Background(), domainID)
			if err != nil {
				log.Error().Err(err).Msg("Failed to find domain by ID")
				// TODO: Log the error into the logs db
				return
			}

			// Do a default scan if no templates are provided
			if len(scanMsg.TemplateIDs) == 0 {
				// Create the nuclei engine with the template sources
				ne, err := nuclei.NewNucleiEngineCtx(context.TODO())
				if err != nil {
					log.Error().Err(err).Msg("Failed to create Nuclei engine")
					// TODO: Log the error into the logs db
					return
				}
				defer ne.Close()

				err = ne.LoadAllTemplates()
				if err != nil {
					log.Error().Err(err).Msg("Failed to load templates")
					// TODO: Log the error into the logs db
					return
				}

				// Load the targets from the domain fetched from MongoDB
				targets := []string{domain.Domain}
				ne.LoadTargets(targets, false)

				// Update the scan results
				err = ne.ExecuteCallbackWithCtx(context.TODO(), func(event *output.ResultEvent) {
					scanResults = append(scanResults, *event)
				})

				if err != nil {
					log.Error().Err(err).Msg("Failed to execute scan")
					// Update scan status to "failed"
					mongoHelper.UpdateScanStatus(context.Background(), scanID, "failed")
					msg.Nack(false, true) // Nack the message so another machine can pick it up
					return
				}

				// TODO: Handle the scan results
				// Update the logs too and upload into s3
				// update scan status to "completed"
				// err = mongoHelper.UpdateScanStatus(context.Background(), scanID, "completed")
				// if err != nil {
				// 	log.Error().Err(err).Msg("Failed to update scan status")
				// 	msg.Nack(false, true) // Nack the message so another machine can pick it up
				// 	return
				// }

				return
			}

			// Concurrently download the templates
			// Fetch template and domain from MongoDB
			var wg sync.WaitGroup
			templateFiles := make([]string, 0, len(scanMsg.TemplateIDs))
			errChan := make(chan error, len(scanMsg.TemplateIDs))

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

					templateFilePath := filepath.Join(os.TempDir(), fmt.Sprintf("template_%s.json", idStr))
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
					s3Helper.DeleteFile(file)
				}
			}()

			// Append the default templates directory to the template files
			templateFiles = append(templateFiles, nuclei.DefaultConfig.TemplatesDirectory)

			templateSources := nuclei.TemplateSources{
				Templates: templateFiles,
			}

			// Create the nuclei engine with the template sources
			ne, err := nuclei.NewNucleiEngineCtx(context.TODO(), nuclei.WithTemplatesOrWorkflows(templateSources))
			if err != nil {
				log.Error().Err(err).Msg("Failed to create Nuclei engine")
				// TODO: Log the error into the logs db
				return
			}
			err = ne.LoadAllTemplates()
			if err != nil {
				log.Error().Err(err).Msg("Failed to load templates")
				// TODO: Log the error into the logs db
				return
			}

			// Load the targets from the domain fetched from MongoDB
			targets := []string{domain.Domain}
			ne.LoadTargets(targets, false)

			// Update the scan results
			err = ne.ExecuteCallbackWithCtx(context.TODO(), func(event *output.ResultEvent) {
				scanResults = append(scanResults, *event)
			})
			if err != nil {
				log.Error().Err(err).Msg("Failed to execute scan")
				// Update scan status to "failed"
				mongoHelper.UpdateScanStatus(context.Background(), scanID, "failed")
				return
			}

			// TODO: Handle the scan results
			// Update the logs too and upload into s3
			// update scan status to "completed"
			// err = mongoHelper.UpdateScanStatus(context.Background(), scanID, "completed")
			// if err != nil {
			// 	log.Error().Err(err).Msg("Failed to update scan status")
			// 	msg.Nack(false, true) // Nack the message so another machine can pick it up
			// 	return
			// }

			msg.Ack(false) // Acknowledge the message after successful processing
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
