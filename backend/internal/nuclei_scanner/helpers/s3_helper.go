package helpers

import (
	"context"
	"fmt"
	"io"
	"net/url"
	"os"
	"strings"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/rs/zerolog/log"
)

type S3Helper struct {
	client *s3.Client
}

func NewS3Helper(cfg aws.Config) (*S3Helper, error) {
	client := s3.NewFromConfig(cfg)
	return &S3Helper{client: client}, nil
}

func (s *S3Helper) DownloadFileFromURL(s3URL, dest string) error {
	parsedURL, err := url.Parse(s3URL)
	if err != nil {
		return fmt.Errorf("invalid S3 URL: %w", err)
	}

	bucket := parsedURL.Host[:strings.Index(parsedURL.Host, ".")]
	key := parsedURL.Path[1:]

	log.Info().Msgf("Downloading bucket: %s, key: %s", bucket, key)

	input := &s3.GetObjectInput{
		Bucket: aws.String(bucket),
		Key:    aws.String(key),
	}

	result, err := s.client.GetObject(context.TODO(), input)
	if err != nil {
		return fmt.Errorf("failed to download file from S3: %w", err)
	}
	defer result.Body.Close()

	file, err := os.Create(dest)
	if err != nil {
		return fmt.Errorf("failed to create file: %w", err)
	}
	defer file.Close()

	_, err = io.Copy(file, result.Body)
	if err != nil {
		return fmt.Errorf("failed to write file to local destination: %w", err)
	}

	return nil
}

func (s *S3Helper) DeleteFile(filepath string) error {
	err := os.Remove(filepath)
	if err != nil {
		return fmt.Errorf("failed to delete file: %w", err)
	}
	return nil
}
