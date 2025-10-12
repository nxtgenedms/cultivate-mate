import { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';

interface HeaderInfoStepProps {
  data: any;
  onChange: (data: any) => void;
}

export function HeaderInfoStep({ data, onChange }: HeaderInfoStepProps) {
  const { toast } = useToast();

  // Fetch lookup values for dropdowns
  const { data: lookupCategories } = useQuery({
    queryKey: ['lookup-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lookup_categories')
        .select('id, category_key')
        .in('category_key', ['strain_id', 'mother_id', 'dome_no']);
      if (error) throw error;
      return data;
    },
  });

  const { data: lookupValues } = useQuery({
    queryKey: ['lookup-values', lookupCategories],
    enabled: !!lookupCategories,
    queryFn: async () => {
      if (!lookupCategories) return [];
      const categoryIds = lookupCategories.map(c => c.id);
      const { data, error } = await supabase
        .from('lookup_values')
        .select('id, category_id, value_key, value_display, lookup_categories(category_key)')
        .in('category_id', categoryIds)
        .eq('is_active', true)
        .order('sort_order');
      if (error) throw error;
      return data;
    },
  });

  const getValuesByCategory = (categoryKey: string) => {
    if (!lookupValues) return [];
    return lookupValues.filter(
      (v: any) => v.lookup_categories?.category_key === categoryKey
    );
  };

  const handleChange = (field: string, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const generateBatchNumber = async () => {
    try {
      const { data: result, error } = await supabase.rpc('generate_batch_number');
      
      if (error) throw error;
      
      handleChange('batch_number', result);
      toast({ title: 'Batch ID generated successfully' });
    } catch (error: any) {
      toast({
        title: 'Failed to generate Batch ID',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    // Auto-generate batch number if not already set
    if (!data?.batch_number) {
      generateBatchNumber();
    }
  }, []);

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
            <Label htmlFor="batch_number">Batch ID *</Label>
            <div className="flex gap-2">
              <Input
                id="batch_number"
                value={data?.batch_number || ''}
                onChange={(e) => handleChange('batch_number', e.target.value)}
                required
                readOnly
                className="bg-muted"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={generateBatchNumber}
                title="Generate new Batch ID"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Format: [YYYYMMDD]-[COUNT] (auto-generated from creation date)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mother_no">Mother ID *</Label>
            <Select
              value={data?.mother_no || ''}
              onValueChange={(value) => handleChange('mother_no', value)}
            >
              <SelectTrigger id="mother_no">
                <SelectValue placeholder="Select Mother ID" />
              </SelectTrigger>
              <SelectContent>
                {getValuesByCategory('mother_id').map((option: any) => (
                  <SelectItem key={option.id} value={option.value_display}>
                    {option.value_display}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="strain_id">Strain ID *</Label>
            <Select
              value={data?.strain_id || ''}
              onValueChange={(value) => handleChange('strain_id', value)}
            >
              <SelectTrigger id="strain_id">
                <SelectValue placeholder="Select Strain ID" />
              </SelectTrigger>
              <SelectContent>
                {getValuesByCategory('strain_id').map((option: any) => (
                  <SelectItem key={option.id} value={option.value_display}>
                    {option.value_display}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            <Label htmlFor="dome_no">Dome No *</Label>
            <Select
              value={data?.dome_no || ''}
              onValueChange={(value) => handleChange('dome_no', value)}
            >
              <SelectTrigger id="dome_no">
                <SelectValue placeholder="Select Dome No" />
              </SelectTrigger>
              <SelectContent>
                {getValuesByCategory('dome_no').map((option: any) => (
                  <SelectItem key={option.id} value={option.value_display}>
                    {option.value_display}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t">
          <h4 className="font-semibold">Mother Plant Checks</h4>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm">Mother plant is healthy and disease-free</Label>
              <RadioGroup
                value={data?.mother_plant_healthy === true ? "yes" : data?.mother_plant_healthy === false ? "no" : ""}
                onValueChange={(value) => handleChange('mother_plant_healthy', value === "yes")}
                className="flex gap-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="mother-healthy-yes" />
                  <Label htmlFor="mother-healthy-yes" className="cursor-pointer font-normal">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="mother-healthy-no" />
                  <Label htmlFor="mother-healthy-no" className="cursor-pointer font-normal">No</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Mother plant fed and watered 12 hours prior</Label>
              <RadioGroup
                value={data?.mother_plant_fed_watered_12h === true ? "yes" : data?.mother_plant_fed_watered_12h === false ? "no" : ""}
                onValueChange={(value) => handleChange('mother_plant_fed_watered_12h', value === "yes")}
                className="flex gap-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="mother-fed-yes" />
                  <Label htmlFor="mother-fed-yes" className="cursor-pointer font-normal">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="mother-fed-no" />
                  <Label htmlFor="mother-fed-no" className="cursor-pointer font-normal">No</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t">
          <h4 className="font-semibold">Work Area Preparation</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="work_area_sharp_clean_scissors"
                checked={data?.work_area_sharp_clean_scissors || false}
                onCheckedChange={(checked) => handleChange('work_area_sharp_clean_scissors', checked)}
              />
              <Label htmlFor="work_area_sharp_clean_scissors" className="cursor-pointer font-normal">
                Sharp, clean scissors
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="work_area_sharp_clean_blade"
                checked={data?.work_area_sharp_clean_blade || false}
                onCheckedChange={(checked) => handleChange('work_area_sharp_clean_blade', checked)}
              />
              <Label htmlFor="work_area_sharp_clean_blade" className="cursor-pointer font-normal">
                Sharp, clean blade
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="work_area_jug_clean_water"
                checked={data?.work_area_jug_clean_water || false}
                onCheckedChange={(checked) => handleChange('work_area_jug_clean_water', checked)}
              />
              <Label htmlFor="work_area_jug_clean_water" className="cursor-pointer font-normal">
                Jug with clean water
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="work_area_dome_cleaned_disinfected"
                checked={data?.work_area_dome_cleaned_disinfected || false}
                onCheckedChange={(checked) => handleChange('work_area_dome_cleaned_disinfected', checked)}
              />
              <Label htmlFor="work_area_dome_cleaned_disinfected" className="cursor-pointer font-normal">
                Dome cleaned and disinfected
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="work_area_dome_prepared_medium"
                checked={data?.work_area_dome_prepared_medium || false}
                onCheckedChange={(checked) => handleChange('work_area_dome_prepared_medium', checked)}
              />
              <Label htmlFor="work_area_dome_prepared_medium" className="cursor-pointer font-normal">
                Dome with prepared medium
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="work_area_sanitizer_cup"
                checked={data?.work_area_sanitizer_cup || false}
                onCheckedChange={(checked) => handleChange('work_area_sanitizer_cup', checked)}
              />
              <Label htmlFor="work_area_sanitizer_cup" className="cursor-pointer font-normal">
                Cup with sanitizer
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="work_area_rooting_powder"
                checked={data?.work_area_rooting_powder || false}
                onCheckedChange={(checked) => handleChange('work_area_rooting_powder', checked)}
              />
              <Label htmlFor="work_area_rooting_powder" className="cursor-pointer font-normal">
                Rooting powder/gel
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="work_surface_sterilized"
                checked={data?.work_surface_sterilized || false}
                onCheckedChange={(checked) => handleChange('work_surface_sterilized', checked)}
              />
              <Label htmlFor="work_surface_sterilized" className="cursor-pointer font-normal">
                Work surface sterilized
              </Label>
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t">
          <h4 className="font-semibold">Personal Protection</h4>
          <div className="space-y-2">
            <Label className="text-sm">Wearing clean gloves</Label>
            <RadioGroup
              value={data?.wearing_clean_gloves === true ? "yes" : data?.wearing_clean_gloves === false ? "no" : ""}
              onValueChange={(value) => handleChange('wearing_clean_gloves', value === "yes")}
              className="flex gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="gloves-yes" />
                <Label htmlFor="gloves-yes" className="cursor-pointer font-normal">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="gloves-no" />
                <Label htmlFor="gloves-no" className="cursor-pointer font-normal">No</Label>
              </div>
            </RadioGroup>
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
            <div className="flex gap-2">
              <Input
                id="batch_number"
                value={data?.batch_number || ''}
                onChange={(e) => handleChange('batch_number', e.target.value)}
                required
                readOnly
                className="bg-muted"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={generateBatchNumber}
                title="Generate new Batch ID"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Format: [YYYYMMDD]-[COUNT] (auto-generated from creation date)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="strain_id">Strain ID *</Label>
            <Select
              value={data?.strain_id || ''}
              onValueChange={(value) => handleChange('strain_id', value)}
            >
              <SelectTrigger id="strain_id">
                <SelectValue placeholder="Select Strain ID" />
              </SelectTrigger>
              <SelectContent>
                {getValuesByCategory('strain_id').map((option: any) => (
                  <SelectItem key={option.id} value={option.value_display}>
                    {option.value_display}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
