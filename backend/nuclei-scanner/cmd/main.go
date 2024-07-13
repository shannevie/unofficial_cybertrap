package main

import (
	"context"
	"os"

	nuclei "github.com/projectdiscovery/nuclei/v3/lib"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
	appConfig "github.com/shannevie/unofficial_cybertrap/backend/nuclei-scanner/config"
)

func main() {
	// Start logger
	log.Logger = log.Output(zerolog.ConsoleWriter{Out: os.Stderr})

	appConfig, err := appConfig.LoadAppConfig(".")
	if err != nil {
		log.Fatal().Err(err).Msg("Failed to load app config")
	}

	// TODO: Add rabbitmq listener
	// TODO: Add mongodb client
	// Mongodb client is for us to grab information upon we get a message from rabbitmq
	// TODO: Design the message struct in a package that can be used by both the apis and the scanner

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
