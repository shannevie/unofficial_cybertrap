package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Template struct {
	ID           primitive.ObjectID `bson:"_id,omitempty"`
	TemplateID   string             `bson:"template_id"`
	TemplatePath string             `bson:"template_path"`
	S3URL        string             `bson:"s3_url"`
	Info         TemplateInfo       `bson:"info"`
	Type         string             `bson:"type"`
	CreatedAt    time.Time          `bson:"created_at"`
}

type TemplateInfo struct {
	Name      string   `bson:"name"`
	Author    []string `bson:"author"`
	Tags      []string `bson:"tags"`
	Reference []string `bson:"reference"`
	Severity  string   `bson:"severity"`
	Metadata  Metadata `bson:"metadata"`
}

type Metadata struct {
	MaxRequest  int    `bson:"max_request"`
	ShodanQuery string `bson:"shodan_query"`
	Verified    bool   `bson:"verified"`
}
