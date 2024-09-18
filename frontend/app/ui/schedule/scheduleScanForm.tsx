'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { format } from 'date-fns';
import DomainSearch from './DomainSearch';
import TemplateSearch from './TemplateSearch';

// TODO: add API to retrieve domain and templates for selection
const domains = [
  {ID: "1", DomainID: "101", Domain: "Target A"},
  {ID: "2", DomainID: "102", Domain: "Target B"},
  {ID: "3", DomainID: "103", Domain: "Target C"},
  {ID: "4", DomainID: "104", Domain: "Target D"},
  {ID: "5", DomainID: "105", Domain: "Target E",}
]

const templates = [
  { id: 'template1', name: 'Template 1' },
  { id: 'template2', name: 'Template 2' },
  { id: 'template3', name: 'Template 3' },
];

type ScheduleScanFormProps = {
  onSubmit: (formData: any) => void;
};

export default function ScheduleScanForm({ onSubmit }: ScheduleScanFormProps) {
  const [selectedDomain, setSelectedDomain] = useState<any>(null);
  const [selectedTemplates, setSelectedTemplates] = useState<any[]>([])
  const [scanDate, setScanDate] = useState<Date | null>(null);

  
  const handleTemplateSelect = (template: any) => {
    setSelectedTemplates((prev) => [...prev, template]);
  };

  const handleTemplateDeselect = (template: any) => {
    setSelectedTemplates((prev) =>
      prev.filter((t) => t.id !== template.id)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const scanData = {
      domain: selectedDomain,
      templateIDs: selectedTemplates,
      startDate: scanDate ? format(scanDate, 'yyyy-MM-dd') : null,
    };

    // onSubmit(scanData);
    setSelectedDomain(null);
    setSelectedTemplates([]);
    setScanDate(null);
    console.log(scanData);



    // POST request to your API or backend for scheduling scans
    // const response = await fetch('/api/scheduledscans', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(scanData),
    // });

    // if (response.ok) {
    //   console.log('Scan scheduled successfully');
    // } else {
    //   console.error('Error scheduling scan');
    // }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 mx-lg">
      {/* Domain Input */}
      <div className="space-y-2">
        <label htmlFor="domain" className="block text-sm font-medium">
          Domain
        </label>
        <DomainSearch
          domains={domains}
          selectedDomain={selectedDomain}
          onDomainSelect={setSelectedDomain}
        />
      </div>

      {/* Multi-Select for Template IDs */}
      <div className="space-y-2">
        <label htmlFor="templates" className="block text-sm font-medium">
          Select Templates
        </label>
        <TemplateSearch
          templates={templates}
          selectedTemplates={selectedTemplates}
          onTemplateSelect={handleTemplateSelect}
          onTemplateDeselect={handleTemplateDeselect}
        />
        <p className="mt-2 text-sm">Selected Templates: {selectedTemplates.map(t => t.name).join(', ') || 'None'}</p>

      </div>

      {/* Scan Date Picker */}
      <div className="space-y-2">
        <label htmlFor="scanDate" className="block text-sm font-medium">
          Select Scan Date
        </label>
        <Popover>
          <PopoverTrigger className="border px-4 py-2 rounded cursor-pointer w-full text-left">
            {scanDate ? format(scanDate, 'PPP') : 'Pick a date'}
          </PopoverTrigger>
          <PopoverContent className="p-0 w-auto">
            <Calendar
              mode="single"
              selected={scanDate}
              onSelect={setScanDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Submit Button */}
      <Button type="submit" className="w-full">
        Schedule Scan
      </Button>
    </form>
  );
}