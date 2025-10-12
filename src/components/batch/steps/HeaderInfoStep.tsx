import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface HeaderInfoStepProps {
  data: any;
  onChange: (data: any) => void;
}

export function HeaderInfoStep({ data, onChange }: HeaderInfoStepProps) {
  const handleChange = (field: string, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const isCloning = data?.starting_phase === 'mother_plant';
  const isScouting = data?.starting_phase === 'seed';

  // Cloning Pre-Start Checklist (HVCSOF0011)
  if (isCloning) {
    return (
      <div className="space-y-6">
        <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
          <h3 className="font-semibold text-primary mb-1">HVCSOF0011 - Cloning Pre-Start Checklist</h3>
          <p className="text-sm text-muted-foreground">Complete all checklist items before proceeding</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <div className="space-y-2">
            <Label htmlFor="batch_number">Batch Number *</Label>
            <Input
              id="batch_number"
              value={data?.batch_number || ''}
              onChange={(e) => handleChange('batch_number', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mother_no">Mother ID *</Label>
            <Input
              id="mother_no"
              value={data?.mother_no || ''}
              onChange={(e) => handleChange('mother_no', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="strain_id">Strain ID</Label>
            <Input
              id="strain_id"
              value={data?.strain_id || ''}
              onChange={(e) => handleChange('strain_id', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="total_clones_plants">Quantity *</Label>
            <Input
              id="total_clones_plants"
              type="number"
              value={data?.total_clones_plants || ''}
              onChange={(e) => handleChange('total_clones_plants', parseInt(e.target.value))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dome_no">Dome No</Label>
            <Input
              id="dome_no"
              value={data?.dome_no || ''}
              onChange={(e) => handleChange('dome_no', e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t">
          <h4 className="font-semibold">Mother Plant Checks</h4>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="mother_plant_healthy"
                checked={data?.mother_plant_healthy || false}
                onCheckedChange={(checked) => handleChange('mother_plant_healthy', checked)}
              />
              <Label htmlFor="mother_plant_healthy" className="font-normal cursor-pointer">
                Mother plant is healthy and disease-free
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="mother_plant_fed_watered_12h"
                checked={data?.mother_plant_fed_watered_12h || false}
                onCheckedChange={(checked) => handleChange('mother_plant_fed_watered_12h', checked)}
              />
              <Label htmlFor="mother_plant_fed_watered_12h" className="font-normal cursor-pointer">
                Mother plant fed and watered 12 hours prior
              </Label>
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t">
          <h4 className="font-semibold">Work Area Preparation</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="work_area_sharp_clean_scissors"
                checked={data?.work_area_sharp_clean_scissors || false}
                onCheckedChange={(checked) => handleChange('work_area_sharp_clean_scissors', checked)}
              />
              <Label htmlFor="work_area_sharp_clean_scissors" className="font-normal cursor-pointer">
                Sharp, clean scissors
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="work_area_sharp_clean_blade"
                checked={data?.work_area_sharp_clean_blade || false}
                onCheckedChange={(checked) => handleChange('work_area_sharp_clean_blade', checked)}
              />
              <Label htmlFor="work_area_sharp_clean_blade" className="font-normal cursor-pointer">
                Sharp, clean blade
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="work_area_jug_clean_water"
                checked={data?.work_area_jug_clean_water || false}
                onCheckedChange={(checked) => handleChange('work_area_jug_clean_water', checked)}
              />
              <Label htmlFor="work_area_jug_clean_water" className="font-normal cursor-pointer">
                Jug with clean water
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="work_area_dome_cleaned_disinfected"
                checked={data?.work_area_dome_cleaned_disinfected || false}
                onCheckedChange={(checked) => handleChange('work_area_dome_cleaned_disinfected', checked)}
              />
              <Label htmlFor="work_area_dome_cleaned_disinfected" className="font-normal cursor-pointer">
                Dome cleaned and disinfected
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="work_area_dome_prepared_medium"
                checked={data?.work_area_dome_prepared_medium || false}
                onCheckedChange={(checked) => handleChange('work_area_dome_prepared_medium', checked)}
              />
              <Label htmlFor="work_area_dome_prepared_medium" className="font-normal cursor-pointer">
                Dome with prepared medium
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="work_area_sanitizer_cup"
                checked={data?.work_area_sanitizer_cup || false}
                onCheckedChange={(checked) => handleChange('work_area_sanitizer_cup', checked)}
              />
              <Label htmlFor="work_area_sanitizer_cup" className="font-normal cursor-pointer">
                Cup with sanitizer
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="work_area_rooting_powder"
                checked={data?.work_area_rooting_powder || false}
                onCheckedChange={(checked) => handleChange('work_area_rooting_powder', checked)}
              />
              <Label htmlFor="work_area_rooting_powder" className="font-normal cursor-pointer">
                Rooting powder/gel
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="work_surface_sterilized"
                checked={data?.work_surface_sterilized || false}
                onCheckedChange={(checked) => handleChange('work_surface_sterilized', checked)}
              />
              <Label htmlFor="work_surface_sterilized" className="font-normal cursor-pointer">
                Work surface sterilized
              </Label>
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t">
          <h4 className="font-semibold">Personal Protection</h4>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="wearing_clean_gloves"
              checked={data?.wearing_clean_gloves || false}
              onCheckedChange={(checked) => handleChange('wearing_clean_gloves', checked)}
            />
            <Label htmlFor="wearing_clean_gloves" className="font-normal cursor-pointer">
              Wearing clean gloves
            </Label>
          </div>
        </div>
      </div>
    );
  }

  // Scouting Phase
  if (isScouting) {
    return (
      <div className="space-y-6">
        <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
          <h3 className="font-semibold text-primary mb-1">Seed Phase - Basic Information</h3>
          <p className="text-sm text-muted-foreground">Enter batch details and location information</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <div className="space-y-2">
            <Label htmlFor="batch_number">Batch ID *</Label>
            <Input
              id="batch_number"
              value={data?.batch_number || ''}
              onChange={(e) => handleChange('batch_number', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="strain_id">Strain ID *</Label>
            <Input
              id="strain_id"
              value={data?.strain_id || ''}
              onChange={(e) => handleChange('strain_id', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="facility">Facility</Label>
            <Input
              id="facility"
              value={data?.facility || ''}
              onChange={(e) => handleChange('facility', e.target.value)}
              placeholder="e.g., Facility A"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={data?.location || ''}
              onChange={(e) => handleChange('location', e.target.value)}
              placeholder="e.g., Room 101, Section B"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-[400px]">
      <p className="text-muted-foreground">Please select a starting phase in the previous step</p>
    </div>
  );
}
