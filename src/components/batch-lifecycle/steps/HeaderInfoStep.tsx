import { StepProps } from '../BatchLifecycleWizard';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export function HeaderInfoStep({ data, updateData }: StepProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="batch_number">Batch Number *</Label>
          <Input
            id="batch_number"
            value={data.batch_number || ''}
            onChange={(e) => updateData({ batch_number: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="strain_id">Strain ID</Label>
          <Input
            id="strain_id"
            value={data.strain_id || ''}
            onChange={(e) => updateData({ strain_id: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dome_no">Dome No</Label>
          <Input
            id="dome_no"
            value={data.dome_no || ''}
            onChange={(e) => updateData({ dome_no: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="mother_no">Mother No</Label>
          <Input
            id="mother_no"
            value={data.mother_no || ''}
            onChange={(e) => updateData({ mother_no: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>Clone/Germination Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !data.clone_germination_date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {data.clone_germination_date ? format(new Date(data.clone_germination_date), "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={data.clone_germination_date ? new Date(data.clone_germination_date) : undefined}
                onSelect={(date) => updateData({ clone_germination_date: date?.toISOString() })}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="total_clones_plants">Total Number of Clones/Plants</Label>
          <Input
            id="total_clones_plants"
            type="number"
            value={data.total_clones_plants || ''}
            onChange={(e) => updateData({ total_clones_plants: parseInt(e.target.value) || 0 })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="clonator_1">Clonator 1</Label>
          <Input
            id="clonator_1"
            value={data.clonator_1 || ''}
            onChange={(e) => updateData({ clonator_1: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="rack_no">Rack No</Label>
          <Input
            id="rack_no"
            value={data.rack_no || ''}
            onChange={(e) => updateData({ rack_no: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}
