package dto

type DomainDeleteQuery struct {
	Id string `schema:"id"`
}

type DomainCreateQuery struct {
	Domain string `schema:"domain"`
	Page   int16  `schema:"page"`
}
