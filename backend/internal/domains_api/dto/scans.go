package dto

import "time"

type ScanDomainRequest struct {
	DomainID    string   `schema:"domainId"`
	TemplateIDs []string `schema:"templateIds"`
}

type ScheduleSingleScanRequest struct {
	DomainID    string    `schema:"domainId"`
	TemplateIDs []string  `schema:"templateIds"`
	StartScan   time.Time `schema:"startScan"`
}

type DeleteScheduledScanRequest struct {
	ID string `schema:"ID"`
}
