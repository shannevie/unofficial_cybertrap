package service

import (
	r "github.com/shannevie/unofficial_cybertrap/internal/repository"
)

type ArtefactService struct {
	artefactRepo *r.ArtefactRepository
}

// NewUserUseCase creates a new instance of userUseCase
func NewArtefactService(repository *r.ArtefactRepository) *ArtefactService {
	return &ArtefactService{
		artefactRepo: repository,
	}
}

func (s *ArtefactService) UploadArtefact() {
	// TODO: Upload to aws
}
