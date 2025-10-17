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

  return (
    <div className="space-y-6">
      {/* Source Selection */}
      <div className="space-y-2">
        <Label className="text-base font-semibold">Select Batch Source *</Label>
        <RadioGroup
          value={data?.starting_phase || ''}
          onValueChange={(value) => handleChange('starting_phase', value)}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div className={cn(
            "flex items-start space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all",
            data?.starting_phase === 'mother_plant' 
              ? "border-primary bg-primary/5" 
              : "border-border hover:border-primary/50"
          )}>
            <RadioGroupItem value="mother_plant" id="source-mother" className="mt-1" />
            <Label htmlFor="source-mother" className="cursor-pointer flex-1">
              <div className="font-semibold mb-1">Clone from Mother Plant</div>
              <div className="text-sm text-muted-foreground">
                Start batch by cloning from an existing mother plant
              </div>
            </Label>
          </div>

          <div className={cn(
            "flex items-start space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all",
            data?.starting_phase === 'seed' 
              ? "border-primary bg-primary/5" 
              : "border-border hover:border-primary/50"
          )}>
            <RadioGroupItem value="seed" id="source-seed" className="mt-1" />
            <Label htmlFor="source-seed" className="cursor-pointer flex-1">
              <div className="font-semibold mb-1">Seed</div>
              <div className="text-sm text-muted-foreground">
                Start batch from seed germination
              </div>
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          {/* 1. Batch Number */}
          <div className="space-y-2">
            <Label htmlFor="batch_number">Batch Number *</Label>
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
                title="Generate new Batch Number"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Format: [YYYYMMDD]-[COUNT] (auto-generated from creation date)
            </p>
          </div>

          {/* 2. Strain ID */}
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
                  <SelectItem key={option.id} value={option.id}>
                    {option.value_display}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 3. Dome No */}
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
                  <SelectItem key={option.id} value={option.id}>
                    {option.value_display}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 4. Clone / Germination Date */}
          <div className="space-y-2">
            <Label htmlFor="clone_germination_date">Clone / Germination Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !data?.clone_germination_date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {data?.clone_germination_date ? (
                    format(new Date(data.clone_germination_date), "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={data?.clone_germination_date ? new Date(data.clone_germination_date) : undefined}
                  onSelect={(date) => handleChange('clone_germination_date', date?.toISOString().split('T')[0])}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* 5. Mother No */}
          <div className="space-y-2">
            <Label htmlFor="mother_no">Mother No *</Label>
            <Select
              value={data?.mother_no || ''}
              onValueChange={(value) => handleChange('mother_no', value)}
            >
              <SelectTrigger id="mother_no">
                <SelectValue placeholder="Select Mother No" />
              </SelectTrigger>
              <SelectContent>
                {getValuesByCategory('mother_id').map((option: any) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.value_display}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 6. Total number of clones / plants */}
          <div className="space-y-2">
            <Label htmlFor="total_clones_plants">Total number of clones / plants *</Label>
            <Input
              id="total_clones_plants"
              type="number"
              value={data?.total_clones_plants || ''}
              onChange={(e) => handleChange('total_clones_plants', parseInt(e.target.value))}
              required
            />
          </div>

          {/* 7. Clonator 1 – Rack No */}
          <div className="space-y-2">
            <Label htmlFor="rack_no">Clonator 1 – Rack No</Label>
            <Input
              id="rack_no"
              value={data?.rack_no || ''}
              onChange={(e) => handleChange('rack_no', e.target.value)}
            />
          </div>

          {/* 8. Clonator / Germination Mortalities */}
          <div className="space-y-2">
            <Label htmlFor="clonator_mortalities">Clonator / Germination Mortalities</Label>
            <Input
              id="clonator_mortalities"
              type="number"
              value={data?.clonator_mortalities || ''}
              onChange={(e) => handleChange('clonator_mortalities', parseInt(e.target.value))}
            />
          </div>

          {/* 9. Expected Rooting Date */}
          <div className="space-y-2">
            <Label htmlFor="expected_rooting_date">Expected Rooting Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !data?.expected_rooting_date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {data?.expected_rooting_date ? (
                    format(new Date(data.expected_rooting_date), "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={data?.expected_rooting_date ? new Date(data.expected_rooting_date) : undefined}
                  onSelect={(date) => handleChange('expected_rooting_date', date?.toISOString().split('T')[0])}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* 10. Actual Rooting Date */}
          <div className="space-y-2">
            <Label htmlFor="actual_rooting_date">Actual Rooting Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !data?.actual_rooting_date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {data?.actual_rooting_date ? (
                    format(new Date(data.actual_rooting_date), "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={data?.actual_rooting_date ? new Date(data.actual_rooting_date) : undefined}
                  onSelect={(date) => handleChange('actual_rooting_date', date?.toISOString().split('T')[0])}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
    </div>
  );
}
