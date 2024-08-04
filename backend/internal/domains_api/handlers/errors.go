package handlers

import "errors"

// Service Errors
var (
	ErrReadingFile = errors.New("Failed to read uploaded file")
)
