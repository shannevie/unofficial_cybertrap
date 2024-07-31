package main

import (
	"context"
	"os"

	nuclei "github.com/projectdiscovery/nuclei/v3/lib"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
	appConfig "github.com/shannevie/unofficial_cybertrap/backend/configs"
	"github.com/shannevie/unofficial_cybertrap/backend/internal/rabbitmq"
)

func main() {
	// Start logger
	log.Logger = log.Output(zerolog.ConsoleWriter{Out: os.Stderr})

	// TODO: Add mongodb client
	// Mongodb client is for us to grab information upon we get a message from rabbitmq
	// TODO: Design the message struct in a package that can be used by both the apis and the scanner

	appConfig, err := appConfig.LoadNucleiConfig(".")
	if err != nil {
		log.Fatal().Err(err).Msg("Failed to load app config")
	}

	rabbitClient, err := rabbitmq.NewRabbitMQClient(appConfig.RabbitMqUrl, log.Logger)
	if err != nil {
		log.Fatal().Err(err).Msg("Failed to create rabbitmq client")
	}
	defer rabbitClient.Close()

	err = rabbitClient.DeclareExchangeAndQueue()
	if err != nil {
		log.Fatal().Err(err).Msg("Failed to declare exchange and queue")
	}

	messages, err := rabbitClient.Consume()
	if err != nil {
		log.Fatal().Err(err).Msg("Failed to consume messages")
	}

	// TODO: Once we get a message we will need to scan the target
	for msg := range messages {
		log.Info().Msgf("Received message: %s", msg)

		// Create nuclei engine with options
		// TODO: Explore NucleiSDKOptions to see what options we can set
		ne, err := nuclei.NewNucleiEngineCtx(
			context.TODO(),
		)
		if err != nil {
			panic(err)
		}

		// TODO: Load the targets via downloading the files from mongodb or use the strings from rabbitmq
		ne.LoadTargets([]string{"scanme.sh"}, false)
		err = ne.ExecuteWithCallback(nil)
		if err != nil {
			panic(err)
		}
		defer ne.Close()
	}
}
