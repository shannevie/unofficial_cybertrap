package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Template struct {
	ID          primitive.ObjectID     `bson:"_id,omitempty"`
	TemplateID  string                 `bson:"template_id"`
	Name        string                 `bson:"name"`
	Description string                 `bson:"description"`
	S3URL       string                 `bson:"s3_url"`
	Metadata    map[string]interface{} `bson:"metadata,omitempty"`
	Type        string                 `bson:"type"`
	CreatedAt   time.Time              `bson:"created_at"`
}
