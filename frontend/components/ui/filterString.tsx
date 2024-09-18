import { Input } from "@/components/ui/input"

// Filter by Target Component
type FilterProps = {
    filterType : string;
    placeholder : string;
    onFilter: (filterType: string, filterValue: string) => void;
    value: string;
};
  
const FilterByString: React.FC<FilterProps> = ({ filterType, placeholder, onFilter, value }) => {
    return (
      <div className="mb-4">
        <Input
          value={value}
          placeholder= {placeholder}
          onChange={(e) => onFilter(filterType, e.target.value)}
        />
      </div>
    );
};
 
export default FilterByString