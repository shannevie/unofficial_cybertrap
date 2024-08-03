"use client";

// import { UpdateInvoice, DeleteInvoice } from '@/app/ui/invoices/buttons';
import { formatDateToLocal } from '@/app/lib/utils';
import { fetchFilteredInvoices } from '@/app/lib/data';
import { useRouter } from 'next/navigation';

export default async function TargetsTable({
  query,
  currentPage,
}: {
  query: string;
  currentPage: number;
}) {
  //const targets = await fetchFilteredInvoices(query, currentPage);

  const router = useRouter();
  const handleViewDetails = (target: string) => {
    router.push(`/dashboard/scans/${encodeURIComponent(target)}`);  // Redirect to the target detail page
  };

  const targets = [
    {
      id: '1',
      target: 'Target A',
      description: 'Description for Target A',
      addedOn: '2023-01-01T00:00:00Z',
      lastScanned: '2023-07-01T00:00:00Z',
    },
    {
      id: '2',
      target: 'Target B',
      description: 'Description for Target B',
      addedOn: '2023-02-15T00:00:00Z',
      lastScanned: '2023-07-10T00:00:00Z',
    },
    {
      id: '3',
      target: 'Target C',
      description: 'Description for Target C',
      addedOn: '2023-03-20T00:00:00Z',
      lastScanned: '2023-07-15T00:00:00Z',
    },
    {
      id: '4',
      target: 'Target D',
      description: 'Description for Target D',
      addedOn: '2023-04-25T00:00:00Z',
      lastScanned: '2023-07-20T00:00:00Z',
    },
    {
      id: '5',
      target: 'Target E',
      description: 'Description for Target E',
      addedOn: '2023-05-30T00:00:00Z',
      lastScanned: '2023-07-25T00:00:00Z',
    },
  ];
  

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          <div className="md:hidden">
            {targets?.map((target) => (
              <div
                key={target.id}
                className="mb-2 w-full rounded-md bg-white p-4"
              >
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <p className="text-xl font-medium">{target.target}</p>
                    <p className="text-sm text-gray-500">{target.description}</p>
                  </div>
                </div>
                <div className="flex w-full items-center justify-between pt-4">
                  <div>
                    <p>{formatDateToLocal(target.addedOn)}</p>
                    <p>{formatDateToLocal(target.lastScanned)}</p>
                  </div>
                  <div className="flex justify-end gap-2">
                    {/* <UpdateInvoice id={target.id} />
                    <DeleteInvoice id={target.id} /> */}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                  Target
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Description
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Added On
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Last Scanned
                </th>
                <th scope="col" className="relative py-3 pl-6 pr-3">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {targets?.map((target) => (
                <tr
                  key={target.id}
                  className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                >
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    {target.target}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {target.description}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {formatDateToLocal(target.addedOn)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {formatDateToLocal(target.lastScanned)}
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                        <button
                          onClick={() => handleViewDetails(targets.target)}
                          className="bg-blue-500 text-white px-4 py-2 rounded">
                            Target Summary / Initiate Scan 
                        </button>
                      {/* <UpdateInvoice id={target.id} />
                      <DeleteInvoice id={target.id} /> */}
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
