package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi"
	"github.com/gorilla/schema"

	"github.com/shannevie/unofficial_cybertrap/backend/internal/domains_api/dto"
	s "github.com/shannevie/unofficial_cybertrap/backend/internal/domains_api/service"
)

type TemplatesHandler struct {
	TemplatesService s.TemplatesService
}

// NewUserHandler creates a new instance of userHandler
func NewTemplatesHandler(r *chi.Mux, service s.TemplatesService) {
	handler := &TemplatesHandler{
		TemplatesService: service,
	}

	r.Route("/v1/templates", func(r chi.Router) {
		r.Post("/upload", handler.UploadNucleiTemplate)
		r.Get("/", handler.GetAllTemplates)
		r.Delete("/", handler.DeleteTemplateById)
	})
}

func (h *TemplatesHandler) UploadNucleiTemplate(w http.ResponseWriter, r *http.Request) {
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

	loc, err := h.TemplatesService.UploadNucleiTemplate(file, file_header)
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

func (h *TemplatesHandler) GetAllTemplates(w http.ResponseWriter, r *http.Request) {
	templates, err := h.TemplatesService.GetAllTemplates()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Convert to json body and return
	w.Header().Set("Content-Type", "application/json")
	// Encode templates and write to response
	json.NewEncoder(w).Encode(templates)
	w.WriteHeader(http.StatusOK)
}

func (h *TemplatesHandler) DeleteTemplateById(w http.ResponseWriter, r *http.Request) {
	req := &dto.TemplateDeleteQuery{}

	if err := schema.NewDecoder().Decode(req, r.URL.Query()); err != nil {
		http.Error(w, "Invalid query parameters", http.StatusBadRequest)
		return
	}

	err := h.TemplatesService.DeleteTemplateById(req.Id)
	if err != nil {
		http.Error(w, "Failed to delete templates", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Template deleted successfully"))
}
