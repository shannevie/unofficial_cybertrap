package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi"

	"github.com/shannevie/unofficial_cybertrap/backend/internal/domains_api/dto"
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
		r.Post("/", handler.SingleScanDomain)
		r.Post("/multi", handler.MultiScanDomain)
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

func (h *ScansHandler) SingleScanDomain(w http.ResponseWriter, r *http.Request) {
	req := &dto.ScanDomainRequest{}

	if err := json.NewDecoder(r.Body).Decode(req); err != nil {
		http.Error(w, "Invalid JSON body", http.StatusBadRequest)
		return
	}
	defer r.Body.Close()

	err := h.ScansService.ScanDomain(req.DomainID, req.TemplateIDs)
	if err != nil {
		http.Error(w, "Failed to scan domain", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func (h *ScansHandler) MultiScanDomain(w http.ResponseWriter, r *http.Request) {
	req := &[]dto.ScanDomainRequest{}

	if err := json.NewDecoder(r.Body).Decode(req); err != nil {
		http.Error(w, "Invalid JSON body", http.StatusBadRequest)
		return
	}
	defer r.Body.Close()

	err := h.ScansService.ScanMultiDomain(*req)
	if err != nil {
		http.Error(w, "Failed to scan domain", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}
