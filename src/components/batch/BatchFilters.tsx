import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import { BATCH_STAGES, BATCH_STATUS, getStageLabel } from '@/lib/batchUtils';

interface BatchFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  stageFilter: string;
  onStageFilterChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  onClearFilters: () => void;
}

export function BatchFilters({
  searchQuery,
  onSearchChange,
  stageFilter,
  onStageFilterChange,
  statusFilter,
  onStatusFilterChange,
  onClearFilters,
}: BatchFiltersProps) {
  const hasActiveFilters = searchQuery || stageFilter !== 'all' || statusFilter !== 'all';

  return (
    <div className="flex flex-wrap gap-4 items-center">
      {/* Search */}
      <div className="relative flex-1 min-w-[250px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by batch number, strain, or mother ID..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Stage Filter */}
      <Select value={stageFilter} onValueChange={onStageFilterChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="All Stages" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Stages</SelectItem>
          {Object.values(BATCH_STAGES).map((stage) => (
            <SelectItem key={stage} value={stage}>
              {getStageLabel(stage)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Status Filter */}
      <Select value={statusFilter} onValueChange={onStatusFilterChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="All Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value={BATCH_STATUS.DRAFT}>Draft</SelectItem>
          <SelectItem value={BATCH_STATUS.IN_PROGRESS}>In Progress</SelectItem>
          <SelectItem value={BATCH_STATUS.COMPLETED}>Completed</SelectItem>
        </SelectContent>
      </Select>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={onClearFilters}>
          <X className="h-4 w-4 mr-1" />
          Clear Filters
        </Button>
      )}
    </div>
  );
}
