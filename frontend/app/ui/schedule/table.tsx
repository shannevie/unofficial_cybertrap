"use client";
import { useEffect, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline'; // Import the Heroicon
import { BASE_URL } from '@/data';

// Define the shape of the data you're fetching
type ScheduledScan = {
  domain: string;
  templateIDs: string[];
  scanDate: string;
};


export default function ScheduleScanTable() {
  const [scans, setScans] = useState<ScheduledScan[]>([]);

  // Fetch scheduled scans on component mount
  // useEffect(() => {
  //   fetchScans();
  // }, []);

  // const fetchScans = () => {
  //   const data = mockScheduledScans;
  //   setScans(data);
  // };
  // Fetch the scheduled scans when the component mounts
  const fetchScans = async () => {
    const endpoint = `${BASE_URL}/v1/scans/schedule`;
    try {
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data: ScheduledScan[] = await response.json();
      setScans(data);
      console.log('scan', data);
    } catch (error) {
      console.error('Error fetching domains:', error);
    }
  };

  useEffect(() => {
    fetchScans();
  }, []);

  // Function to delete a scheduled scan
  const handleDelete = async (domain: string) => {
    try {
      const response = await fetch(`${BASE_URL}/v1/scans/delete`, {
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
              <td className="px-4 py-2">{scan.ID}</td>
              <td className="px-4 py-2">{scan.DomainID}</td>

              {/* <td className="px-4 py-2">{scan.TemplateIDs.join(', ')}</td> */}
              <td className="px-4 py-2">{new Date(scan.StartScan).toLocaleDateString()}</td>
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
