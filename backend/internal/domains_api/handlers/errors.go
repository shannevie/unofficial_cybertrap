package handlers

import "errors"

// Service Errors
var (
	ErrReadingFile = errors.New("failed to read uploaded file")
)
