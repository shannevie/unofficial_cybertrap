package repository

import (
	"context"
	"mime/multipart"

	"github.com/aws/aws-sdk-go-v2/feature/s3/manager"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/rs/zerolog/log"
	"github.com/shannevie/unofficial_cybertrap/backend/models"
	"go.mongodb.org/mongo-driver/mongo"
)

type TemplatesRepository struct {
	s3Client       *s3.Client
	bucketName     string
	mongoClient    *mongo.Client
	mongoDbName    string
	collectionName string
}

// NewUserRepository creates a new instance of UserRepository
func NewTemplatesRepository(s3Client *s3.Client, bucketName string, mongoClient *mongo.Client, mongoDbName string) *TemplatesRepository {
	return &TemplatesRepository{
		s3Client:       s3Client,
		bucketName:     bucketName,
		mongoClient:    mongoClient,
		mongoDbName:    mongoDbName,
		collectionName: "nucleiTemplates",
	}
}

// Uploads to S3 repository
func (r *TemplatesRepository) UploadToS3(file multipart.File, filename string) (string, error) {
	uploader := manager.NewUploader(r.s3Client)

	result, err := uploader.Upload(context.TODO(), &s3.PutObjectInput{
		Bucket: &r.bucketName,
		Key:    &filename,
		Body:   file,
	})

	if err != nil {
		log.Error().Err(err).Msg("Error uploading file to S3")
		return "", err
	}

	return result.Location, nil
}

func (r *TemplatesRepository) UploadToMongo(template *models.Template) (string, error) {
	collection := r.mongoClient.Database(r.mongoDbName).Collection(r.collectionName)
	result, err := collection.InsertOne(context.Background(), template)

	if err != nil {
		log.Error().Err(err).Msg("Error inserting template into MongoDB")
		return "", err
	}

	return result.InsertedID.(string), nil

}
