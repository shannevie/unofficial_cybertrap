package service

import (
	"bufio"
	"mime/multipart"
	"path/filepath"
	"strings"
	"time"

	"github.com/rs/zerolog/log"
	"go.mongodb.org/mongo-driver/bson/primitive"

	r "github.com/shannevie/unofficial_cybertrap/backend/internal/domains_api/repository"
	"github.com/shannevie/unofficial_cybertrap/backend/models"
)

type DomainsService struct {
	domainsRepo *r.DomainsRepository
}

// NewUserUseCase creates a new instance of userUseCase
func NewDomainsService(repository *r.DomainsRepository) *DomainsService {
	return &DomainsService{
		domainsRepo: repository,
	}
}

// Checks the file if its a valid type
// Accepted file types are:
// .yml .yaml .json
func (s *DomainsService) isValidFileType(filename string) bool {
	ext := strings.ToLower(filepath.Ext(filename))
	return ext == ".yml" || ext == ".yaml" || ext == ".json"
}

// ProcessDomainsFile reads the file content and inserts all domains into the database
func (s *DomainsService) ProcessDomainsFile(file multipart.File) error {
	// Read the file content
	var domains []models.Domain
	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		domain := strings.TrimSpace(scanner.Text())
		if domain != "" {
			domains = append(domains, models.Domain{
				ID:         primitive.NewObjectID(),
				Domain:     domain,
				UploadedAt: time.Now(),
			})
		}
	}

	if err := scanner.Err(); err != nil {
		return err
	}

	// Insert the domains into the database
	err := s.domainsRepo.InsertDomains(domains)
	if err != nil {
		log.Error().Err(err).Msg("Error inserting domains into the database")
		return err
	}

	return nil
}

func (s *DomainsService) UploadArtefact(file multipart.File, file_header *multipart.FileHeader) (string, error) {
	filename := file_header.Filename
	// First check the file type
	if !s.isValidFileType(filename) {
		return "", ErrInvalidFileType
	}

	loc, err := s.domainsRepo.Upload(file, filename)
	if err != nil {
		log.Error().Err(err).Msg("Error uploading file")
		return "", r.ErrS3Upload
	}

	return loc, nil

}
