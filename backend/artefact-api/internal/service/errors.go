package service

import "errors"

// Service Errors
var (
	ErrInvalidFileType = errors.New("Invalid file type, only .yml, .yaml, .json are accepted")
	ErrReadingFile     = errors.New("Error reading file")
)
