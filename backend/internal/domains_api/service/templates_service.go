package service

import (
	"mime/multipart"
	"path/filepath"
	"strings"
	"time"

	"github.com/rs/zerolog/log"
	"go.mongodb.org/mongo-driver/bson/primitive"

	r "github.com/shannevie/unofficial_cybertrap/backend/internal/domains_api/repository"
	"github.com/shannevie/unofficial_cybertrap/backend/models"
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

	// Create a new template record
	template := models.Template{
		ID:          primitive.NewObjectID(), // Generate a new ObjectID
		TemplateID:  primitive.NewObjectID().Hex(),
		Name:        filename,
		Description: "Description for " + filename, // You can modify this as needed
		S3URL:       loc,
		Metadata:    map[string]interface{}{}, // Empty metadata for now, can be updated later
		Type:        "nuclei",
		CreatedAt:   time.Now(),
	}

	// Insert the template record into MongoDB
	_, err = s.templatesRepo.UploadToMongo(&template)
	if err != nil {
		log.Error().Err(err).Msg("Error inserting template into MongoDB")
		return "", err
	}

	return loc, nil
}

// TODO: GET endpoints for templates
func (s *TemplatesService) GetAllTemplates() ([]models.Template, error) {
	templates, err := s.templatesRepo.GetAllTemplates()
	if err != nil {
		log.Error().Err(err).Msg("Error fetching templates from the database")
		return nil, err
	}

	return templates, nil
}

// TODO: DELETE endpoints for templates

// Only accept .yml or .yaml for now
func (s *TemplatesService) isValidFileType(filename string) bool {
	ext := strings.ToLower(filepath.Ext(filename))
	return ext == ".yml" || ext == ".yaml"
}

func (s *TemplatesService) DeleteTemplateById(id string) error {
	err := s.templatesRepo.DeleteTemplateById(id)
	if err != nil {
		log.Error().Err(err).Msg("Error deleting template from the database")
		return err
	}

	return nil
}
