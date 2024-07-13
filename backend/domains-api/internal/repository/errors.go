package repository

import "errors"

// Service Errors
var (
	ErrS3Upload = errors.New("Failed to upload to s3 bucket")
)
