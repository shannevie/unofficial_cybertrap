package dto

type ScanDomainRequest struct {
	DomainID    string   `schema:"domainId"`
	TemplateIDs []string `schema:"templateIds"`
}

type ScheduleSingleScanRequest struct {
	DomainID    string   `schema:"domainId"`
	TemplateIDs []string `schema:"templateIds"`
	StartScan   string   `schema:"startScan"`
}

type DeleteScheduledScanRequest struct {
	ID string `schema:"ID"`
}
