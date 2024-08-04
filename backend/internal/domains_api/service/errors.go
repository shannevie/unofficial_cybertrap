package service

import "errors"

// Service Errors
var (
	ErrInvalidFileType = errors.New("invalid file type")
	ErrReadingFile     = errors.New("error reading file")
)
