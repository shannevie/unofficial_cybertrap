package dto

type ScanDomainRequest struct {
	DomainID    string   `schema:"domainId"`
	TemplateIDs []string `schema:"templateIds"`
}

type ScheduleSingleScanRequest struct {
	Domain      string   `schema:"domain"`
	TemplateIDs []string `schema:"templateIds"`
}
