"use client"

// import Image from 'next/image';
// import { UpdateInvoice, DeleteInvoice } from '@/app/ui/invoices/buttons';
// import InvoiceStatus from '@/app/ui/invoices/status';
// import { formatDateToLocal, formatCurrency } from '@/app/lib/utils';
// import { fetchFilteredInvoices } from '@/app/lib/data';
import { formatDateToLocal } from '@/app/lib/utils';
import { useRouter } from 'next/navigation';

export default async function ScansTable({
  query,
  currentPage,
}: {
  query: string;
  currentPage: number;
}) {
  // const invoices = await fetchFilteredInvoices(query, currentPage);
    
    const router = useRouter();
    const handleViewDetails = (target: string) => {
      router.push(`/dashboard/scans/${encodeURIComponent(target)}`);  // Redirect to the target detail page
    };

    const scans = [
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
              {scans?.map((scans) => (
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
                      className="bg-blue-500 text-white px-4 py-2 rounded">
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
