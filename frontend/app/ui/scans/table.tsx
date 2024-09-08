"use client"

// import Image from 'next/image';
// import { UpdateInvoice, DeleteInvoice } from '@/app/ui/invoices/buttons';
// import InvoiceStatus from '@/app/ui/invoices/status';
// import { formatDateToLocal, formatCurrency } from '@/app/lib/utils';
// import { fetchFilteredInvoices } from '@/app/lib/data';
import { formatDateToLocal } from '@/app/lib/utils';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import DynamicDropdown from '@/components/ui/dynamic-dropdown';
import { Filter } from "lucide-react"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"


// export default async function ScansTable({
//   query,
//   currentPage,
// }: {
//   query: string;
//   currentPage: number;
// }) {
//   // const invoices = await fetchFilteredInvoices(query, currentPage);
    
//     const router = useRouter();
//     const handleViewDetails = (target: string) => {
//       router.push(`/dashboard/scans/${encodeURIComponent(target)}`);  // Redirect to the target detail page
//     };

    // // for api call 
    type Scan = {
      id: string;
      target: string;
      numberOfVulnerabilitiesFound: number;
      scanDate: string;
      statusOfScan: string;
    };

    // mock scan
    const mockScans: Scan[] = [
      {
        "id": "1",
        "target": "Target A",
        "numberOfVulnerabilitiesFound": 5,
        "scanDate": "2023-07-01T00:00:00Z",
        "statusOfScan": "Completed"
      },
      {
        "id": "2",
        "target": "Target B",
        "numberOfVulnerabilitiesFound": 3,
        "scanDate": "2023-07-10T00:00:00Z",
        "statusOfScan": "Completed"
      },
      {
        "id": "3",
        "target": "Target C",
        "numberOfVulnerabilitiesFound": 7,
        "scanDate": "2023-07-15T00:00:00Z",
        "statusOfScan": "Completed"
      },
      {
        "id": "4",
        "target": "Target D",
        "numberOfVulnerabilitiesFound": 2,
        "scanDate": "2023-07-20T00:00:00Z",
        "statusOfScan": "Completed"
      },
      {
        "id": "5",
        "target": "Target E",
        "numberOfVulnerabilitiesFound": 4,
        "scanDate": "2023-07-25T00:00:00Z",
        "statusOfScan": "Completed"
      }
    ]

    const VulnerabilityTable = () => {
      const [scans, setScans] = useState<Scan[]>(mockScans); // TODO: replace (scans) with []
      const [filteredScans, setFilteredScans] = useState<Scan[]>(mockScans);
      
      useEffect(() => {
        setScans(mockScans);
        setFilteredScans(mockScans); //TODO: replace with code below

    //     // Fetch the scan data and store it in the state
    //     fetch("/api/scans")  // Replace with your actual API endpoint
    //       .then((res) => res.json())
    //       .then((data: Scan[]) => {
    //         setScans(data);
    //         setFilteredScans(data); // Initialize filteredScans to be same as scans
    //       });
      }, []);

      const router = useRouter();
      const handleViewDetails = (target: string) => {
        router.push(`/dashboard/scans/${encodeURIComponent(target)}`);  // Redirect to the target detail page
      };

      const handleFilter = (filterType: string, filterValue: string | number) => {
        let filtered = scans;
    
        if (filterType === "target") {
          filtered = scans.filter((scan) =>
            scan.target.toLowerCase().includes((filterValue as string).toLowerCase())
          );
        } else if (filterType === "numberOfVulnerabilitiesFound") {
          filtered = scans.filter(
            (scan) => scan.numberOfVulnerabilitiesFound === parseInt(filterValue as string)
          );
        } else if (filterType === "statusOfScan") {
          filtered = scans.filter(
            (scan) => scan.statusOfScan === (filterValue as string)
          );
        }
        setFilteredScans(filtered);
      };
  

    return (
      <div className="mt-6 flow-root">
        <div className="inline-block min-w-full align-middle">
          <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
            <div className="md:hidden">
              {scans?.map((scans) => (
                <div
                  key={scans.id}
                  className="mb-2 w-full rounded-md bg-white p-4"
                >
                  <div className="flex items-center justify-between border-b pb-4">
                    <div>
                      <div className="mb-2 flex items-center">
                        <p>{scans.target}</p>
                        <p>{scans.numberOfVulnerabilitiesFound}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex w-full items-center justify-between pt-4">
                    <div>
                      <p>{formatDateToLocal(scans.scanDate)}</p>
                    </div>
                    <div className="flex justify-end gap-2">
                      {/* <UpdateInvoice id={invoice.id} />
                      <DeleteInvoice id={invoice.id} /> */}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <FilterByTarget onFilter={handleFilter} />
              <FilterByVulnerabilities onFilter={handleFilter} />
              <FilterByStatus onFilter={handleFilter} />
              <button
                onClick={() => setFilteredScans(scans)}
                className="bg-gray-600 text-white px-4 py-2 rounded"
              >
                Reset Filters
              </button>
            </div>

            <table className="hidden min-w-full text-gray-900 md:table">
              <thead className="rounded-lg text-left text-sm font-normal">
                <tr>
                  <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                    Name
                  </th>
                  <th scope="col" className="px-3 py-5 font-medium">
                    Number of Vulnerabilities Found
                  </th>
                  <th scope="col" className="px-3 py-5 font-medium">
                    Scan Date
                  </th>
                  <th scope="col" className="px-3 py-5 font-medium">
                    Status
                  </th>
                  <th scope="col" className="px-3 py-5 font-medium">
                    Action
                  </th>
                  <th scope="col" className="relative py-3 pl-6 pr-3">
                    <span className="sr-only">Edit</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {filteredScans?.map((scans) => (
                  <tr
                    key={scans.id}
                    className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                  >
                    <td className="whitespace-nowrap py-3 pl-6 pr-3">
                      <div className="flex items-center gap-3">
                        <p>{scans.target}</p>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">
                      {scans.numberOfVulnerabilitiesFound}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">
                      {formatDateToLocal(scans.scanDate)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">
                    <p>{scans.statusOfScan}</p>
                    </td>
                    <td className="whitespace-nowrap py-3 pl-6 pr-3">
                      <button
                        onClick={() => handleViewDetails(scans.target)}
                        className="bg-green-600 text-white px-4 py-2 rounded">
                          Show Full Summary
                      </button>
                      {/* <div className="flex justify-end gap-3">
                        <UpdateInvoice id={invoice.id} />
                        <DeleteInvoice id={invoice.id} />
                      </div> */}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
}



// Filter by Target Component
type FilterProps = {
  onFilter: (filterType: string, filterValue: string) => void;
};

const FilterByTarget: React.FC<FilterProps> = ({ onFilter }) => {
  return (
    <div className="mb-4">
      <Input
        placeholder="Filter by Target"
        onChange={(e) => onFilter("target", e.target.value)}
      />
    </div>
  );
};
const FilterByVulnerabilities: React.FC<FilterProps> = ({ onFilter }) => {
  return (
    <div className="mb-4">
      <Input
        placeholder="Filter by Vulnerabilities Found"
        onChange={(e) => onFilter("numberOfVulnerabilitiesFound", e.target.value)}
      />
    </div>
  );
};

// Filter By Status Component
const FilterByStatus: React.FC<FilterProps> = ({ onFilter }) => {
  return (
    <div className="mb-4">
      <Select onValueChange={(value) => onFilter("statusOfScan", value)}>
        <SelectTrigger>
          <SelectValue placeholder="Filter by Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Completed">Completed</SelectItem>
          <SelectItem value="In Progress">In Progress</SelectItem>
          <SelectItem value="Failed">Failed</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default VulnerabilityTable;