package handler

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi"

	s "github.com/shannevie/unofficial_cybertrap/internal/service"
)

type ArtefactHandler struct {
	ArtefactService s.ArtefactService
}

// NewUserHandler creates a new instance of userHandler
func NewArtefactHandler(r *chi.Mux, service s.ArtefactService) {
	handler := &ArtefactHandler{
		ArtefactService: service,
	}

	r.Route("/v1/artefact", func(r chi.Router) {
		r.Post("/upload", handler.UploadArtefact)
	})
}

func (h *ArtefactHandler) UploadArtefact(w http.ResponseWriter, r *http.Request) {
	// Parse the multipart form in the request
	err := r.ParseMultipartForm(10 << 20) // 10MB
	if err != nil {
		http.Error(w, "Unable to parse form", http.StatusBadRequest)
		return
	}

	// Retrieve the file from form data
	file, file_header, err := r.FormFile("file")
	if err != nil {
		http.Error(w, "Error retrieving the file", http.StatusBadRequest)
		return
	}
	defer file.Close()

	loc, err := h.ArtefactService.UploadArtefact(file, file_header)
	if err != nil {
		http.Error(w, "Error uploading file", http.StatusInternalServerError)
		return
	}

	response := map[string]string{
		"url": loc,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)

}
