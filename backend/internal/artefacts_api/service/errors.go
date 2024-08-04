package service

import "errors"

// Service Errors
var (
	ErrInvalidFileType = errors.New("invalid file type, only .yml, .yaml, .json are accepted")
	ErrReadingFile     = errors.New("error reading file")
)
