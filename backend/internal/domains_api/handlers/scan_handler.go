package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi"

	s "github.com/shannevie/unofficial_cybertrap/backend/internal/domains_api/service"
)

type ScansHandler struct {
	ScansService s.ScansService
}

// NewUserHandler creates a new instance of userHandler
func NewScansHandler(r *chi.Mux, service s.ScansService) {
	handler := &ScansHandler{
		ScansService: service,
	}

	r.Route("/v1/scans", func(r chi.Router) {
		r.Get("/", handler.GetAllScans)
	})
}

func (h *ScansHandler) GetAllScans(w http.ResponseWriter, r *http.Request) {
	scans, err := h.ScansService.GetAllScans()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Convert to json body and return
	w.Header().Set("Content-Type", "application/json")
	// Encode domains and write to response
	json.NewEncoder(w).Encode(scans)
	w.WriteHeader(http.StatusOK)
}
