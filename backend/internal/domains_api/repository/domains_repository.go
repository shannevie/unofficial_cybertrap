package repository

import (
	"context"
	"mime/multipart"

	"github.com/aws/aws-sdk-go-v2/feature/s3/manager"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/rs/zerolog/log"
)

type ArtefactRepository struct {
	s3Client   *s3.Client
	bucketName string
}

// NewUserRepository creates a new instance of UserRepository
func NewDomainsRepository(s3Client *s3.Client, bucketName string) *ArtefactRepository {
	return &ArtefactRepository{
		s3Client:   s3Client,
		bucketName: bucketName,
	}
}

// Uploads to S3 repository
func (r *ArtefactRepository) Upload(file multipart.File, filename string) (string, error) {
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
