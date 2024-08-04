package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Domain struct {
	ID         primitive.ObjectID `bson:"_id,omitempty"`
	Domain     string             `bson:"domain"`
	UploadedAt time.Time          `bson:"uploaded_at"`
	UserID     string             `bson:"user_id,"`
}
