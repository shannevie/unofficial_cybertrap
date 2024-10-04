"use client";
import { useEffect, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline'; // Import the Heroicon

// Define the shape of the data you're fetching
type ScheduledScan = {
  domain: string;
  templateIDs: string[];
  scanDate: string;
};

const mockScheduledScans = [
  {
    domain: 'example.com',
    templateIDs: ['T1', 'T2'],
    scanDate: '2023-10-05T00:00:00Z',
  },
  {
    domain: 'test.com',
    templateIDs: ['T3'],
    scanDate: '2023-11-12T00:00:00Z',
  },
];

  // Fetch the scheduled scans when the component mounts
//   useEffect(() => {
//     async function fetchScans() {
//       try {
//         const response = await fetch('/api/scheduled-scans');
//         if (!response.ok) {
//           throw new Error('Failed to fetch scans');
//         }
//         const data = await response.json();
//         setScans(data);
//       } catch (error) {
//         console.error('Error fetching scheduled scans:', error);
//       }
//     }
//     fetchScans();
//   }, []);

export default function ScheduleScanTable() {
  const [scans, setScans] = useState<ScheduledScan[]>([]);

  // Fetch scheduled scans on component mount
  useEffect(() => {
    fetchScans();
  }, []);

  const fetchScans = () => {
    const data = mockScheduledScans;
    setScans(data);
  };

  // Function to delete a scheduled scan
  const handleDelete = async (domain: string) => {
    try {
      const response = await fetch('/v1/scans/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ domain }), // Send the domain for deletion
      });

      if (!response.ok) {
        throw new Error('Failed to delete scan');
      }

      // Update state to remove the deleted scan
      setScans(prevScans => prevScans.filter(scan => scan.domain !== domain));
      console.log('Scan deleted successfully');
    } catch (error) {
      console.error('Error deleting scheduled scan:', error);
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse table-auto">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="px-4 py-2">Domain</th>
            <th className="px-4 py-2">Templates</th>
            <th className="px-4 py-2">Scheduled Date</th>
            <th className="px-4 py-2">Actions</th> {/* New Actions Column */}
          </tr>
        </thead>
        <tbody>
          {scans.map((scan, index) => (
            <tr key={index} className="border-t">
              <td className="px-4 py-2">{scan.domain}</td>
              <td className="px-4 py-2">{scan.templateIDs.join(', ')}</td>
              <td className="px-4 py-2">{new Date(scan.scanDate).toLocaleDateString()}</td>
              <td className="px-4 py-2 flex justify-center">
                <button
                  onClick={() => handleDelete(scan.domain)}
                  className="bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                  title="Delete"
                >
                  <XMarkIcon className="h-4 w-4 text-white" />
                  {/* <span>Delete</span> */}
                </button>
              </td>

            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
