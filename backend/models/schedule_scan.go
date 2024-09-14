package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type ScheduleScan struct {
	ID           primitive.ObjectID `bson:"_id,omitempty"`
	DomainID     string             `bson:"domain_id"`
	TemplatesIDs []string           `bson:"template_ids"`
	StartScan    time.Time          `bson:"start_scan"`
}
