import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SOFFieldFormProps {
  sofId: string;
  field?: any;
  onClose: () => void;
}

const fieldTypes = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'textarea', label: 'Textarea' },
  { value: 'select', label: 'Select' },
  { value: 'signature', label: 'Signature' },
];

export function SOFFieldForm({ sofId, field, onClose }: SOFFieldFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    field_key: field?.field_key || '',
    field_label: field?.field_label || '',
    field_type: field?.field_type || 'text',
    field_group: field?.field_group || '',
    is_required: field?.is_required ?? false,
    sort_order: field?.sort_order || 0,
    options: field?.options ? JSON.stringify(field.options) : '',
  });

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const payload = {
        ...data,
        sof_id: sofId,
        options: data.options ? JSON.parse(data.options) : null,
      };

      if (field?.id) {
        const { error } = await supabase
          .from('sof_fields')
          .update(payload)
          .eq('id', field.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('sof_fields')
          .insert([payload]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: `Field ${field ? 'updated' : 'created'} successfully`,
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="field_key">Field Key *</Label>
        <Input
          id="field_key"
          value={formData.field_key}
          onChange={(e) => setFormData({ ...formData, field_key: e.target.value })}
          placeholder="e.g., mother_plant_healthy"
          required
        />
        <p className="text-xs text-muted-foreground">
          Unique identifier for this field (use snake_case)
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="field_label">Field Label *</Label>
        <Input
          id="field_label"
          value={formData.field_label}
          onChange={(e) => setFormData({ ...formData, field_label: e.target.value })}
          placeholder="e.g., Mother plant is healthy"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="field_type">Field Type *</Label>
          <Select
            value={formData.field_type}
            onValueChange={(value) => setFormData({ ...formData, field_type: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {fieldTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="sort_order">Sort Order</Label>
          <Input
            id="sort_order"
            type="number"
            value={formData.sort_order}
            onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="field_group">Field Group</Label>
        <Input
          id="field_group"
          value={formData.field_group}
          onChange={(e) => setFormData({ ...formData, field_group: e.target.value })}
          placeholder="e.g., Mother Plant Checks"
        />
        <p className="text-xs text-muted-foreground">
          Group related fields together
        </p>
      </div>

      {formData.field_type === 'select' && (
        <div className="space-y-2">
          <Label htmlFor="options">Options (JSON) *</Label>
          <Textarea
            id="options"
            value={formData.options}
            onChange={(e) => setFormData({ ...formData, options: e.target.value })}
            placeholder='["Option 1", "Option 2", "Option 3"]'
            rows={3}
          />
          <p className="text-xs text-muted-foreground">
            Enter options as a JSON array
          </p>
        </div>
      )}

      <div className="flex items-center space-x-2">
        <Switch
          id="is_required"
          checked={formData.is_required}
          onCheckedChange={(checked) => setFormData({ ...formData, is_required: checked })}
        />
        <Label htmlFor="is_required" className="cursor-pointer">Required Field</Label>
      </div>

      <div className="flex gap-3 justify-end pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={saveMutation.isPending}>
          {saveMutation.isPending ? 'Saving...' : 'Save Field'}
        </Button>
      </div>
    </form>
  );
}