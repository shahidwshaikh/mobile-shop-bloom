
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

interface OrderFiltersProps {
  searchQuery: string;
  statusFilter: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onStatusChange: (value: string) => void;
  statusOptions: string[];
}

export const OrderFilters = ({
  searchQuery,
  statusFilter,
  onSearchChange,
  onStatusChange,
  statusOptions
}: OrderFiltersProps) => {
  return (
    <div className="flex gap-2 mb-4">
      <Input
        placeholder="Search orders..."
        value={searchQuery}
        onChange={onSearchChange}
        className="flex-1"
      />
      <Select value={statusFilter} onValueChange={onStatusChange}>
        <SelectTrigger className="w-[130px]">
          <SelectValue placeholder="Filter Status" />
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map((status) => (
            <SelectItem key={status} value={status}>
              {status}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
