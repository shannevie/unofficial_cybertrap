package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Scan struct {
	ID          primitive.ObjectID `bson:"_id,omitempty"`
	InstanceID  string             `bson:"instance_id"`
	Domain      primitive.ObjectID `bson:"domain"`
	TemplateID  string             `bson:"template_id"`
	ScanDate    time.Time          `bson:"scan_date"`
	Status      string             `bson:"status"`                  // pending, in-progress, completed, failed
	Result      interface{}        `bson:"result,omitempty"`        // Store JSON result if not using S3
	Error       interface{}        `bson:"error,omitempty"`         // Store error information if the scan fails
	S3ResultURL string             `bson:"s3_result_url,omitempty"` // URL to result stored in S3, if applicable
}
