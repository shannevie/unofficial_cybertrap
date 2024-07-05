package repository

import "github.com/aws/aws-sdk-go-v2/service/s3"

type ArtefactRepository struct {
	s3Client *s3.Client
}

// NewUserRepository creates a new instance of UserRepository
func NewArtefactRepository(s3Client *s3.Client) *ArtefactRepository {
	return &ArtefactRepository{
		s3Client: s3Client,
	}
}

// Get gets user info by id
func (r *ArtefactRepository) Upload() {
	
}
