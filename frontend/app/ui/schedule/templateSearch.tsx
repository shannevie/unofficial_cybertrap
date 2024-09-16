import { useState } from 'react';
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type Template = {
  id: string;
  name: string;
};

type TemplateSearchProps = {
  templates: Template[];
  selectedTemplates: Template[];
  onTemplateSelect: (template: Template) => void;
  onTemplateDeselect: (template: Template) => void;
};

export default function TemplateSearch({ templates, selectedTemplates, onTemplateSelect, onTemplateDeselect }: TemplateSearchProps) {
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Filter templates based on the search term
  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isSelected = (template: Template) => selectedTemplates.some(t => t.id === template.id);

  return (
    <Popover>
      <PopoverTrigger className="border px-4 py-2 rounded cursor-pointer w-full text-left">
        {selectedTemplates.length > 0 ? `Selected (${selectedTemplates.length})` : 'Select Templates'}
      </PopoverTrigger>
      <PopoverContent className="w-72 p-4">
        <Input
          placeholder="Search Templates"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-4"
        />
        <div className="max-h-48 overflow-y-auto">
          {filteredTemplates.length > 0 ? (
            filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="flex justify-between items-center p-2 hover:bg-gray-100 cursor-pointer"
              >
                <span>{template.name}</span>
                {isSelected(template) ? (
                  <Button onClick={() => onTemplateDeselect(template)} variant="secondary" size="sm">Deselect</Button>
                ) : (
                  <Button onClick={() => onTemplateSelect(template)} variant="primary" size="sm">Select</Button>
                )}
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No matching templates found</p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
