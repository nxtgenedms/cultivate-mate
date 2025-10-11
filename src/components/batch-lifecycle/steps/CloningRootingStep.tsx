import { StepProps } from '../BatchLifecycleWizard';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export function CloningRootingStep({ data, updateData }: StepProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="clonator_mortalities">Clonator/Germination Mortalities</Label>
          <Input
            id="clonator_mortalities"
            type="number"
            value={data.clonator_mortalities || ''}
            onChange={(e) => updateData({ clonator_mortalities: parseInt(e.target.value) || 0 })}
          />
        </div>

        <div className="space-y-2">
          <Label>Expected Rooting Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !data.expected_rooting_date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {data.expected_rooting_date ? format(new Date(data.expected_rooting_date), "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={data.expected_rooting_date ? new Date(data.expected_rooting_date) : undefined}
                onSelect={(date) => updateData({ expected_rooting_date: date?.toISOString() })}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label>Actual Rooting Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !data.actual_rooting_date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {data.actual_rooting_date ? format(new Date(data.actual_rooting_date), "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={data.actual_rooting_date ? new Date(data.actual_rooting_date) : undefined}
                onSelect={(date) => updateData({ actual_rooting_date: date?.toISOString() })}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="border-t pt-4">
        <h3 className="font-semibold mb-4">Move to Clonator 2</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="clonator_2">Clonator 2</Label>
            <Input
              id="clonator_2"
              value={data.clonator_2 || ''}
              onChange={(e) => updateData({ clonator_2: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !data.clonator_2_date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {data.clonator_2_date ? format(new Date(data.clonator_2_date), "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={data.clonator_2_date ? new Date(data.clonator_2_date) : undefined}
                  onSelect={(date) => updateData({ clonator_2_date: date?.toISOString() })}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="clonator_2_number_clones">Number of Clones</Label>
            <Input
              id="clonator_2_number_clones"
              type="number"
              value={data.clonator_2_number_clones || ''}
              onChange={(e) => updateData({ clonator_2_number_clones: parseInt(e.target.value) || 0 })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="clonator_2_area_placed">Area Placed</Label>
            <Input
              id="clonator_2_area_placed"
              value={data.clonator_2_area_placed || ''}
              onChange={(e) => updateData({ clonator_2_area_placed: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="clonator_2_rack_no">Rack No</Label>
            <Input
              id="clonator_2_rack_no"
              value={data.clonator_2_rack_no || ''}
              onChange={(e) => updateData({ clonator_2_rack_no: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="clonator_2_no_of_days">No of Days</Label>
            <Input
              id="clonator_2_no_of_days"
              type="number"
              value={data.clonator_2_no_of_days || ''}
              onChange={(e) => updateData({ clonator_2_no_of_days: parseInt(e.target.value) || 0 })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
