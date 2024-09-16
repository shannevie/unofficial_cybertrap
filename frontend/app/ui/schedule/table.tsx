"use client"
import { useEffect, useState } from 'react';

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

export default function ScheduleScanTable() {
  const [scans, setScans] = useState<ScheduledScan[]>([]);

  //mockScheduledScans
  useEffect(() => {
    fetchScans()
  }, [])

const fetchScans = () => {
    const data = mockScheduledScans;
    setScans(data);
}


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

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse table-auto">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="px-4 py-2">Domain</th>
            <th className="px-4 py-2">Templates</th>
            <th className="px-4 py-2">Scheduled Date</th>
          </tr>
        </thead>
        <tbody>
          {scans.map((scan, index) => (
            <tr key={index} className="border-t">
              <td className="px-4 py-2">{scan.domain}</td>
              <td className="px-4 py-2">{scan.templateIDs.join(', ')}</td>
              <td className="px-4 py-2">{new Date(scan.scanDate).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}