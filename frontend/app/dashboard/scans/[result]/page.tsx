"use client";

// import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';

import React from 'react';
import DashboardCard from "@/components/dashboard/DashboardCard";;

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

const TargetDetailPage: React.FC = () => {
//   const router = useRouter();
//   const { target } = router.target;  // Extract the target name from the URL
    const params = useParams();
    const target = params.result;
    console.log(params)
    console.log(target)

  return (
    <>
      <div className="max-w-3xl mx-auto mt-8">
        <h1 className="text-2xl font-bold">Scan Summary</h1>
        <p className="mt-4">Target Name: {target}</p>
        {/* Add more details about the target as needed */}
      </div>

      <div className='flex flex-col md:flex-row justify-between gap-5 mb-5'>
      <DashboardCard
        title='Subdomains Discovered'
        count={100}
        tag="Active domains"
      />
    </div>   
    </>
  );
};

export default TargetDetailPage;

// export default function TargetDetailPage({ params }: { params: {result: string} }) {
//   return (
//     <div className="max-w-3xl mx-auto mt-8">
//       <h1 className="text-2xl font-bold">Scan Summary</h1>
//       <p className="mt-4">Target Name: { result } </p>
//       {/* Add more details about the target as needed */}
//     </div>
//   );
// }