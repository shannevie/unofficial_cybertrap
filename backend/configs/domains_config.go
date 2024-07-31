package configs

import (
	"fmt"

	"github.com/spf13/viper"
)

type DomainsConfig struct {
	// Server configs
	ServeAddress string `mapstructure:"SERVE_ADDRESS"`

	AwsAccessKeyId     string `mapstructure:"AWS_ACCESS_KEY_ID"`
	AwsSecretAccessKey string `mapstructure:"AWS_SECRET_ACCESS_KEY"`

	// Aws S3
	BucketName string `mapstructure:"BUCKET_NAME"`
}

func LoadDomainsConfig(path string) (DomainsConfig, error) {
	if path == "" {
		return DomainsConfig{}, fmt.Errorf("config path is empty")
	}

	viper.AddConfigPath(path)
	viper.SetConfigName(".env.domains")
	viper.SetConfigType("env")
	viper.AutomaticEnv()

	if err := viper.ReadInConfig(); err != nil {
		if _, ok := err.(viper.ConfigFileNotFoundError); ok {
			return DomainsConfig{}, fmt.Errorf("config file not found: %s", path)
		}
		return DomainsConfig{}, fmt.Errorf("failed to read config file: %w", err)
	}

	var config DomainsConfig
	if err := viper.Unmarshal(&config); err != nil {
		return DomainsConfig{}, fmt.Errorf("failed to unmarshal config: %w", err)
	}

	return config, nil
}
