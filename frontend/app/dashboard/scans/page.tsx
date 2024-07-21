// export default function Scans() {
//     return <p>Scans for scan history</p>;
// }

// pages/history.tsx
// import React from 'react';
// import ScanHistoryList from '../../../components/scanHistoryList';

// const HistoryPage: React.FC = () => {
//   return (
//     <div>
//       <h1 className="text-2xl font-bold text-center mt-8">Scan History</h1>
//       <ScanHistoryList />
//     </div>
//   );
// };

// export default Scans Page;

import ScansTable from "@/app/ui/scans/table";

// const sampleTargets = [
//     {
//       id: '1',
//       target: 'Target A',
//       description: 'Description for Target A',
//       addedOn: '2023-01-01T00:00:00Z',
//       lastScanned: '2023-07-01T00:00:00Z',
//     },
//     {
//       id: '2',
//       target: 'Target B',
//       description: 'Description for Target B',
//       addedOn: '2023-02-15T00:00:00Z',
//       lastScanned: '2023-07-10T00:00:00Z',
//     },
//     {
//       id: '3',
//       target: 'Target C',
//       description: 'Description for Target C',
//       addedOn: '2023-03-20T00:00:00Z',
//       lastScanned: '2023-07-15T00:00:00Z',
//     },
//     {
//       id: '4',
//       target: 'Target D',
//       description: 'Description for Target D',
//       addedOn: '2023-04-25T00:00:00Z',
//       lastScanned: '2023-07-20T00:00:00Z',
//     },
//     {
//       id: '5',
//       target: 'Target E',
//       description: 'Description for Target E',
//       addedOn: '2023-05-30T00:00:00Z',
//       lastScanned: '2023-07-25T00:00:00Z',
//     },
//   ];
  

export default function Scans() {
    return (
        <div>
          <b>Targets</b>
          <ScansTable query="" currentPage={1} />
        </div>
      );


}