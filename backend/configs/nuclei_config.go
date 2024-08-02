package configs

import (
	"fmt"

	"github.com/spf13/viper"
)

type NucleiConfig struct {
	// Server configs
	RabbitMqUrl string `mapstructure:"RabbitMqUrl"`
	MongoDbUri  string `mapstructure:"MONGO_DB_URI"`
	MongoDbName string `mapstructure:"MONGO_DB_NAME"`
}

func LoadNucleiConfig(path string) (NucleiConfig, error) {
	if path == "" {
		return NucleiConfig{}, fmt.Errorf("config path is empty")
	}

	viper.AddConfigPath(path)
	viper.SetConfigName(".env.nuclei")
	viper.SetConfigType("env")
	viper.AutomaticEnv()

	if err := viper.ReadInConfig(); err != nil {
		if _, ok := err.(viper.ConfigFileNotFoundError); ok {
			return NucleiConfig{}, fmt.Errorf("config file not found: %s", path)
		}
		return NucleiConfig{}, fmt.Errorf("failed to read config file: %w", err)
	}

	var config NucleiConfig
	if err := viper.Unmarshal(&config); err != nil {
		return NucleiConfig{}, fmt.Errorf("failed to unmarshal config: %w", err)
	}

	return config, nil
}
