package dto

type ScanDomainRequest struct {
	DomainID    string   `schema:"domain_id"`
	TemplateIDs []string `schema:"template_ids"`
}