'use client'

import { formatDateToLocal } from '@/app/lib/utils'
import { useRouter } from 'next/navigation'
import { InformationCircleIcon, BoltIcon } from '@heroicons/react/24/outline'
import { useState, useEffect } from 'react'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import FilterByString from '@/components/ui/filterString'
import FilterByDropdown from '@/components/ui/filterDropdown'


type Scan = {
  ID: string
  DomainID: string
  Domain: string
  TemplateIDs: string[]
  ScanDate: string
  Status: string
  Error: string | null
  S3ResultURL: string | null
}

const mockScans: Scan[] = [
  {
    ID: "1",
    DomainID: "101",
    Domain: "Target A",
    TemplateIDs: ["T1", "T2"],
    ScanDate: "2023-07-01T00:00:00Z",
    Status: "Completed",
    Error: null,
    S3ResultURL: "https://example.com/results/1"
  },
  {
    ID: "2",
    DomainID: "102",
    Domain: "Target B",
    TemplateIDs: ["T3", "T4"],
    ScanDate: "2023-07-10T00:00:00Z",
    Status: "Completed",
    Error: null,
    S3ResultURL: "https://example.com/results/2"
  },
  {
    ID: "3",
    DomainID: "103",
    Domain: "Target C",
    TemplateIDs: ["T5", "T6"],
    ScanDate: "2023-07-15T00:00:00Z",
    Status: "Failed",
    Error: null,
    S3ResultURL: "https://example.com/results/3"
  },
  {
    ID: "4",
    DomainID: "104",
    Domain: "Target D",
    TemplateIDs: ["T6", "T7"],
    ScanDate: "2023-07-20T00:00:00Z",
    Status: "Completed",
    Error: null,
    S3ResultURL: "https://example.com/results/4"
  },
  {
    ID: "5",
    DomainID: "105",
    Domain: "Target E",
    TemplateIDs: ["T8"],
    ScanDate: "2023-07-25T00:00:00Z",
    Status: "In Progress",
    Error: null,
    S3ResultURL: "https://example.com/results/5"
  }
]

export default function ScanResultsTable() {
  const [scans, setScans] = useState<Scan[]>([])
  const [filteredScans, setFilteredScans] = useState<Scan[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 7
  const router = useRouter()

  const [filters, setFilters] = useState({
    domain: '',
    templateID: '',
    status: ''
  })

  useEffect(() => {
    fetchScans()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [scans, filters])

  //mock scan
  const fetchScans = () => {
    const data = mockScans;

  // //for api call to uncomment later
  // const fetchScans = async () => {
  //   try {
      // const response = await fetch('http://localhost:5000/v1/scans/')
      // console.log(response)
      // if (!response.ok) {
      //   throw new Error('Failed to fetch scans')
      // }
      // const data = await response.json()


      // Sort scans by ScanDate in descending order
      const sortedScans = data.sort((a: Scan, b: Scan) => 
        new Date(b.ScanDate).getTime() - new Date(a.ScanDate).getTime()
      )
  
      setScans(sortedScans)
      setFilteredScans(sortedScans)
    // } catch (error) {
    //   console.error('Error fetching scans:', error)
    // }
  }  
  
  // Apply filter to scan based on the selected filter
  const applyFilters = () => {
    let filtered = mockScans
    console.log('apply filter function')
    console.log(filters)
    if (filters.domain) {
      console.log('domain',filters.domain)
      filtered = filtered.filter(scan =>
        scan.Domain.toLowerCase().includes(filters.domain.toLowerCase())
      )
    }

    if (filters.templateID) {
      console.log('template', filters.templateID)
      filtered = filtered.filter(scan =>
        scan.TemplateIDs.some(templateID =>
          templateID.toLowerCase().includes(filters.templateID.toLowerCase())
        )
      )
    }

    if (filters.status) {
      console.log('status',filters.status)
      filtered = filtered.filter(scan =>
        scan.Status.toLowerCase().includes(filters.status.toLowerCase())
      )
      console.log('apply status function')
      console.log(filters.status)
    }

    setFilteredScans(filtered)
    console.log(filtered)
    setCurrentPage(1) // Reset to the first page on filter
  }
  const handleFilter = (filterType: string, filterValue: string) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [filterType]: filterValue
    }))
  } //TODO: add reset filter function here in handleFilter ?
  const handleViewDetails = (scanId: string) => {
    router.push(`/dashboard/scans/${encodeURIComponent(scanId)}`)
  }

  const resetFilters = () => {
    setFilters({
      domain: '',
      templateID: '',
      status: ''
    });
    setFilteredScans(scans);
    setCurrentPage(1);
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <span className="bg-green-500 text-white px-2 py-1 rounded">Completed</span>
      case 'in progress':
        return <span className="bg-yellow-500 text-white px-2 py-1 rounded">In Progress</span>
      case 'pending':
        return <span className="bg-blue-500 text-white px-2 py-1 rounded">Pending</span>
      case 'failed':
        return <span className="bg-red-500 text-white px-2 py-1 rounded">Failed</span>
      default:
        return <span className="bg-gray-300 text-white px-2 py-1 rounded">Unknown</span>
    }
  }

  const pageCount = Math.ceil(scans.length / itemsPerPage)
  const paginatedScans = filteredScans.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          <div className="md:hidden">
            {paginatedScans.map((scan) => (
              <div
                key={scan.ID}
                className="mb-2 w-full rounded-md bg-white p-4"
              >
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <p className="text-xl font-medium">{scan.Domain || scan.DomainID}</p>
                  </div>
                </div>
                <div className="flex w-full items-center justify-between pt-4">
                  <div>
                    <p>{formatDateToLocal(scan.ScanDate)}</p>
                    <p>{getStatusBadge(scan.Status)}</p>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleViewDetails(scan.ID)}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                    >
                      <InformationCircleIcon className="h-4 w-4 text-white" />
                      <span>Details</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div>
            <FilterByString
              filterType="domain"
              placeholder="Filter by Domain"
              onFilter={handleFilter}
              value={filters.domain}
            />    
            <FilterByString
              filterType="templateID"
              placeholder="Filter by Template ID"
              onFilter={handleFilter}
              value={filters.templateID}
            />  
            <FilterByDropdown 
              filterType="status"
              placeholder="Filter By Status" 
              onFilter={handleFilter}
              value={filters.status}
            /> 
            <button
                // onClick={() => setFilteredScans(scans)}
                onClick={resetFilters}
                className="bg-gray-600 text-white px-4 py-2 rounded"
              >
                Reset Filters
              </button>       
          </div>
          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                Domain
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Template IDs
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Scan Date
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Status
                </th>
                <th scope="col" className="relative py-3 pl-6 pr-3">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {paginatedScans.map((scan) => (
                <tr
                  key={scan.ID}
                  className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                >
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    {scan.Domain || scan.DomainID}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {scan.TemplateIDs.join(', ') || 'N/A'}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {formatDateToLocal(scan.ScanDate)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {getStatusBadge(scan.Status)}
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex space-x-4">
                      <button
                        onClick={() => handleViewDetails(scan.ID)}
                        className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2"
                      >
                        <InformationCircleIcon className="h-4 w-4 text-white" />
                        <span>Details</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-6">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
                {[...Array(pageCount)].map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      onClick={() => setCurrentPage(i + 1)}
                      isActive={currentPage === i + 1}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, pageCount))}
                    className={currentPage === pageCount ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      </div>
    </div>
  )
}
