package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi"

	s "github.com/shannevie/unofficial_cybertrap/backend/internal/domains_api/service"
)

type DomainsHandler struct {
	DomainsService s.DomainsService
}

// NewUserHandler creates a new instance of userHandler
func NewDomainsHandler(r *chi.Mux, service s.DomainsService) {
	handler := &DomainsHandler{
		DomainsService: service,
	}

	r.Route("/v1/domains", func(r chi.Router) {
		r.Get("/", handler.GetAllDomains)
		r.Post("/upload-txt", handler.UploadDomainsTxt)
	})
}

func (h *DomainsHandler) GetAllDomains(w http.ResponseWriter, r *http.Request) {
	domains, err := h.DomainsService.GetAllDomains()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Convert to json body and return
	w.Header().Set("Content-Type", "application/json")
	// Encode domains and write to response
	json.NewEncoder(w).Encode(domains)
	w.WriteHeader(http.StatusOK)
}

// Allows uploading of domain targets in a text file
// The file should contain a list of domains separated by new lines
// limitations: if a single domain is already in the database, the whole file will be rejected
func (h *DomainsHandler) UploadDomainsTxt(w http.ResponseWriter, r *http.Request) {
	// Parse the multipart form in the request
	err := r.ParseMultipartForm(10 << 20) // 10MB
	if err != nil {
		http.Error(w, "Unable to parse form", http.StatusBadRequest)
		return
	}

	// Retrieve the file from form data
	file, file_header, err := r.FormFile("file")
	if err != nil {
		http.Error(w, ErrReadingFile.Error(), http.StatusBadRequest)
		return
	}
	defer file.Close()

	err = h.DomainsService.ProcessDomainsFile(file, file_header)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
}

// TODO: Get endpoints for domains

// TODO: Regina to write an endpoint to allow upload of domain targets via a string

// TODO: Change to scan domains
