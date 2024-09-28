package dto

import "time"

type ScanDomainRequest struct {
	DomainID    string   `schema:"domainId"`
	TemplateIDs []string `schema:"templateIds"`
}

type ScheduleSingleScanRequest struct {
	Domain      string    `schema:"domain"`
	TemplateIDs []string  `schema:"templateIds"`
	StartScan   time.Time `schema:"start_scan"`
}

type DeleteScheduledScanRequest struct {
	ID string `schema:"ID"`
}
