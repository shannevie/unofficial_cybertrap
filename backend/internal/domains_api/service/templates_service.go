package service

import (
	"mime/multipart"
	"path/filepath"
	"strings"

	"github.com/rs/zerolog/log"

	r "github.com/shannevie/unofficial_cybertrap/backend/internal/domains_api/repository"
)

type TemplatesService struct {
	templatesRepo *r.TemplatesRepository
}

// NewUserUseCase creates a new instance of userUseCase
func NewTemplatesService(repository *r.TemplatesRepository) *TemplatesService {
	return &TemplatesService{
		templatesRepo: repository,
	}
}

func (s *TemplatesService) UploadNucleiTemplate(file multipart.File, file_header *multipart.FileHeader) (string, error) {
	filename := file_header.Filename
	// First check the file type
	if !s.isValidFileType(filename) {
		return "", ErrInvalidFileType
	}

	loc, err := s.templatesRepo.UploadToS3(file, filename)
	if err != nil {
		log.Error().Err(err).Msg("Error uploading file")
		return "", r.ErrS3Upload
	}

	// TODO: Upload to MongoDB the template with the filename and location

	return loc, nil
}

// TODO: GET endpoints for templates

// TODO: DELETE endpoints for templates

// Checks the file if its a valid type
// Accepted file types are:
// .yml .yaml .json
func (s *TemplatesService) isValidFileType(filename string) bool {
	ext := strings.ToLower(filepath.Ext(filename))
	return ext == ".yml" || ext == ".yaml" || ext == ".json"
}
