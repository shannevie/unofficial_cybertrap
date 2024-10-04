'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { format } from 'date-fns';
import DomainSearch from './DomainSearch';
import TemplateSearch from './TemplateSearch';

interface Domain {
  ID: string;
  Domain: string;
  UploadedAt: string;
  UserID: string; 
}
interface Template {
  ID: string;
  TemplateID: string;
  Name: string;
  Description: string;
  S3URL: string;
  Metadata: null | any;
  Type: string;
  CreatedAt: string;
}


type ScheduleScanFormProps = {
  onSubmit: (formData: any) => void;
};

export default function ScheduleScanForm({ onSubmit }: ScheduleScanFormProps) {
  const [selectedDomain, setSelectedDomain] = useState<any>(null);
  const [selectedTemplates, setSelectedTemplates] = useState<any[]>([])
  const [scanDate, setScanDate] = useState<Date | null>(null);

  //domains
  const [domains, setDomains] = useState<Domain[]>([]);
  const fetchDomains = async () => {
    const endpoint = 'http://localhost:5000/v1/domains';
    try {
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data: Domain[] = await response.json();
      setDomains(data);
      console.log('domain', data);
    } catch (error) {
      console.error('Error fetching domains:', error);
    }
  };
  useEffect(() => {
    fetchDomains();
  }, []);

  //templates
  const [templates, setTemplates] = useState<Template[]>([]);
  const fetchTemplates = async () => {
    const endpoint = 'http://localhost:5000/v1/templates';
    try {
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data: Template[] = await response.json();
      setTemplates(data);
      console.log('template', data);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  }
  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleTemplateSelect = (template: any) => {
    setSelectedTemplates((prev) => [...prev, template]);
  };

  const handleTemplateDeselect = (template: any) => {
    setSelectedTemplates((prev) =>
      prev.filter((t) => t.id !== template.id)
    );
  };

  // submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const scanData = {
      domain: selectedDomain,
      templateIDs: selectedTemplates,
      startDate: scanDate ? format(scanDate, 'yyyy-MM-dd') : null,
    };
    console.log('scan submitted: ', scanData);

    // onSubmit(scanData);
    setSelectedDomain(null);
    setSelectedTemplates([]);
    setScanDate(null);
    console.log('form submitted', selectedDomain);



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
      <Button type="submit" className="w-full bg-green-600 hover:bg-green-500 text-white">
        Schedule Scan
      </Button>
    </form>
  );
}