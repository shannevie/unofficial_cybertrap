"use client";

import { formatDateToLocal } from '@/app/lib/utils';
import { useRouter } from 'next/navigation';
import { InformationCircleIcon, BoltIcon } from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';

interface Domain {
  ID: string;
  Domain: string;
  UploadedAt: string;
  UserID: string;
}

interface TargetsTableProps {
  query: string;
  currentPage: number;
}

// Mock data
const mockDomains: Domain[] = [
  { ID: '1', Domain: 'example.com', UploadedAt: '2023-08-01T12:00:00Z', UserID: 'user123' },
  { ID: '2', Domain: 'testsite.org', UploadedAt: '2023-08-02T15:30:00Z', UserID: 'user456' },
  { ID: '3', Domain: 'mysite.net', UploadedAt: '2023-08-03T18:45:00Z', UserID: 'user789' },
  { ID: '4', Domain: 'sampledomain.io', UploadedAt: '2023-08-04T10:15:00Z', UserID: 'user321' },
  { ID: '5', Domain: 'anotherexample.dev', UploadedAt: '2023-08-05T11:20:00Z', UserID: 'user654' },
];

export default function TargetsTable({ query, currentPage }: TargetsTableProps) {
  const [domains, setDomains] = useState<Domain[]>(mockDomains); // Use mock data
  const router = useRouter();

  useEffect(() => {
    const endpoint = 'http://localhost:5000/v1/domains';

    fetch(endpoint)
      .then(response => {
        console.log(response);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data: Domain[]) => { // Type the data response
        setDomains(data); // Store the fetched domains in state
      })
      .catch(error => {
        console.error('Error fetching domains:', error);
      });
  }, []); // Run only once on component mount

  const handleViewDetails = (target: string) => {
    router.push(`/dashboard/scans/${encodeURIComponent(target)}`);  // Redirect to the target detail page
  };

  const selectScanEngine = (target: string) => {
    router.push(`/dashboard/targets/select-scan?target=${encodeURIComponent(target)}`);
  }

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          <div className="md:hidden">
            {domains.map((domain) => (
              <div
                key={domain.ID}
                className="mb-2 w-full rounded-md bg-white p-4"
              >
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <p className="text-xl font-medium">{domain.Domain}</p>
                    <p className="text-sm text-gray-500">{`User ID: ${domain.UserID}`}</p>
                  </div>
                </div>
                <div className="flex w-full items-center justify-between pt-4">
                  <div>
                    <p>{formatDateToLocal(domain.UploadedAt)}</p>
                  </div>
                  <div className="flex justify-end gap-2">
                    {/* Buttons for actions like Update and Delete could go here */}
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
                  User ID
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Uploaded At
                </th>
                <th scope="col" className="relative py-3 pl-6 pr-3">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {domains.map((domain) => (
                <tr
                  key={domain.ID}
                  className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                >
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    {domain.Domain}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {domain.UserID}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {formatDateToLocal(domain.UploadedAt)}
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex space-x-4">
                      <button
                        onClick={() => handleViewDetails(domain.Domain)}
                        className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2"
                      >
                        <InformationCircleIcon className="h-4 w-4 text-white" />
                        <span>Target Summary</span>
                      </button>
                      <button 
                      onClick={() => selectScanEngine(domain.Domain)}
                      className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2">
                      <BoltIcon className="h-4 w-4 text-white" />
                        <span>Initiate Scan</span>
                      </button>
                    </div>
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
