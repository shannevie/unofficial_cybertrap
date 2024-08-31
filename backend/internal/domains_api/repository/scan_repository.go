package repository

import (
	"context"

	"github.com/rs/zerolog/log"
	"github.com/shannevie/unofficial_cybertrap/backend/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type ScansRepository struct {
	mongoClient    *mongo.Client
	mongoDbName    string
	collectionName string
}

// NewUserRepository creates a new instance of UserRepository
func NewScansRepository(mongoClient *mongo.Client, mongoDbName string) *ScansRepository {
	return &ScansRepository{
		mongoClient:    mongoClient,
		mongoDbName:    mongoDbName,
		collectionName: "scans",
	}
}

func (r *ScansRepository) GetAllScans() ([]models.Scan, error) {
	collection := r.mongoClient.Database(r.mongoDbName).Collection(r.collectionName)
	cursor, err := collection.Find(context.Background(), bson.M{})
	if err != nil {
		log.Error().Err(err).Msg("Error fetching scans from MongoDB")
		return nil, err
	}

	var scans []models.Scan

	if err = cursor.All(context.Background(), &scans); err != nil {
		log.Error().Err(err).Msg("Error populating scans from MongoDB cursor")
		return nil, err
	}

	return scans, nil
}

func (r *ScansRepository) InsertSingleScan(scan models.Scan) error {
	collection := r.mongoClient.Database(r.mongoDbName).Collection(r.collectionName)

	_, err := collection.InsertOne(context.Background(), scan)

	if err != nil {
		log.Error().Err(err).Msg("Error inserting scans into MongoDB")
		return err
	}

	return nil

}
