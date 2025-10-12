import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SOFFormProps {
  sof?: any;
  onClose: () => void;
}

const lifecyclePhases = [
  { value: 'cloning', label: 'Cloning' },
  { value: 'hardening', label: 'Hardening' },
  { value: 'vegetative', label: 'Vegetative' },
  { value: 'flowering', label: 'Flowering' },
  { value: 'harvest', label: 'Harvest' },
  { value: 'processing', label: 'Processing' },
  { value: 'drying', label: 'Drying' },
  { value: 'packing', label: 'Packing' },
  { value: 'mortality', label: 'Mortality' },
  { value: 'scouting', label: 'Scouting' },
  { value: 'general', label: 'General' },
];

export function SOFForm({ sof, onClose }: SOFFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    sof_number: sof?.sof_number || '',
    title: sof?.title || '',
    description: sof?.description || '',
    lifecycle_phase: sof?.lifecycle_phase || 'general',
    effective_date: sof?.effective_date ? new Date(sof.effective_date) : undefined,
    revision_number: sof?.revision_number || 1,
    supersedes: sof?.supersedes || '',
    review_date: sof?.review_date ? new Date(sof.review_date) : undefined,
    is_active: sof?.is_active ?? true,
    compiled_by: sof?.compiled_by || '',
    authorised_by: sof?.authorised_by || '',
    approved_by: sof?.approved_by || '',
  });

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const payload = {
        ...data,
        effective_date: data.effective_date ? format(data.effective_date, 'yyyy-MM-dd') : null,
        review_date: data.review_date ? format(data.review_date, 'yyyy-MM-dd') : null,
      };

      if (sof?.id) {
        const { error } = await supabase
          .from('sofs')
          .update(payload)
          .eq('id', sof.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('sofs')
          .insert([payload]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: `SOF ${sof ? 'updated' : 'created'} successfully`,
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="sof_number">SOF Number *</Label>
          <Input
            id="sof_number"
            value={formData.sof_number}
            onChange={(e) => setFormData({ ...formData, sof_number: e.target.value })}
            placeholder="HVCSOF001"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="revision_number">Revision Number</Label>
          <Input
            id="revision_number"
            type="number"
            value={formData.revision_number}
            onChange={(e) => setFormData({ ...formData, revision_number: parseInt(e.target.value) })}
            min="1"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="e.g., Cloning Checklist and Procedure"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Brief description of this SOF..."
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="lifecycle_phase">Lifecycle Phase *</Label>
        <Select
          value={formData.lifecycle_phase}
          onValueChange={(value) => setFormData({ ...formData, lifecycle_phase: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {lifecyclePhases.map((phase) => (
              <SelectItem key={phase.value} value={phase.value}>
                {phase.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Effective Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !formData.effective_date && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.effective_date ? (
                  format(formData.effective_date, 'PPP')
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={formData.effective_date}
                onSelect={(date) => setFormData({ ...formData, effective_date: date })}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label>Review Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !formData.review_date && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.review_date ? (
                  format(formData.review_date, 'PPP')
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={formData.review_date}
                onSelect={(date) => setFormData({ ...formData, review_date: date })}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="supersedes">Supersedes</Label>
        <Input
          id="supersedes"
          value={formData.supersedes}
          onChange={(e) => setFormData({ ...formData, supersedes: e.target.value })}
          placeholder="Previous version reference"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="compiled_by">Compiled By</Label>
          <Input
            id="compiled_by"
            value={formData.compiled_by}
            onChange={(e) => setFormData({ ...formData, compiled_by: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="authorised_by">Authorised By</Label>
          <Input
            id="authorised_by"
            value={formData.authorised_by}
            onChange={(e) => setFormData({ ...formData, authorised_by: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="approved_by">Approved By</Label>
          <Input
            id="approved_by"
            value={formData.approved_by}
            onChange={(e) => setFormData({ ...formData, approved_by: e.target.value })}
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="is_active"
          checked={formData.is_active}
          onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
        />
        <Label htmlFor="is_active" className="cursor-pointer">Active</Label>
      </div>

      <div className="flex gap-3 justify-end">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={saveMutation.isPending}>
          {saveMutation.isPending ? 'Saving...' : 'Save SOF'}
        </Button>
      </div>
    </form>
  );
}