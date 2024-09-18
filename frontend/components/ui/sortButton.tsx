import { ChevronUpIcon, ChevronDownIcon } from 'lucide-react'

type SortButtonProps = {
  sortKey: string;
  sortConfig: { key: string; direction: string };
  onSort: (key: string) => void;
  label: string;
};

const SortButton: React.FC<SortButtonProps> = ({ sortKey, sortConfig, onSort, label }) => {
  const isActive = sortConfig.key === sortKey;

  return (
    <button
      onClick={() => onSort(sortKey)}
      className="flex items-center space-x-1 text-sm font-medium text-gray-900 hover:text-gray-600"
    >
      <span>{label}</span>
      {isActive ? (
        sortConfig.direction === 'asc' ? (
          <ChevronUpIcon className="h-4 w-4" />
        ) : (
          <ChevronDownIcon className="h-4 w-4" />
        )
      ) : (
        // Default icon when not active
        <ChevronDownIcon className="h-4 w-4" />
      )}
    </button>
  );
};

export default SortButton;