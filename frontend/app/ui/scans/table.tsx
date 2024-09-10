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

export default function ScanResultsTable() {
  const [scans, setScans] = useState<Scan[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 7
  const router = useRouter()

  useEffect(() => {
    fetchScans()
  }, [])

  const fetchScans = async () => {
    try {
      const response = await fetch('http://localhost:5000/v1/scans/')
      if (!response.ok) {
        throw new Error('Failed to fetch scans')
      }
      const data = await response.json()
  
      // Sort scans by ScanDate in descending order
      const sortedScans = data.sort((a: Scan, b: Scan) => 
        new Date(b.ScanDate).getTime() - new Date(a.ScanDate).getTime()
      )
  
      setScans(sortedScans)
    } catch (error) {
      console.error('Error fetching scans:', error)
    }
  }  

  const handleViewDetails = (scanId: string) => {
    router.push(`/dashboard/scans/${encodeURIComponent(scanId)}`)
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
  const paginatedScans = scans.slice(
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
