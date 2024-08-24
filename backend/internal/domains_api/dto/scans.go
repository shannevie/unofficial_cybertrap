package dto

type ScanDomainRequest struct {
	DomainID    string   `schema:"domainId"`
	TemplateIDs []string `schema:"templateIds"`
}
