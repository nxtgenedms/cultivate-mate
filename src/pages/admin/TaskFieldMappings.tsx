import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2 } from 'lucide-react';

interface TaskFieldMapping {
  id: string;
  task_category: string;
  sof_number: string;
  applicable_stages: string[];
  field_mappings: {
    fields: string[];
    item_mappings: Record<string, string>;
  };
  is_active: boolean;
}

export default function TaskFieldMappings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMapping, setEditingMapping] = useState<TaskFieldMapping | null>(null);
  
  const [taskCategory, setTaskCategory] = useState('');
  const [sofNumber, setSofNumber] = useState('');
  const [applicableStages, setApplicableStages] = useState('');
  const [fields, setFields] = useState('');
  const [itemMappings, setItemMappings] = useState('');

  const { data: mappings, isLoading } = useQuery({
    queryKey: ['task-field-mappings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('task_field_mappings')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map(item => ({
        ...item,
        field_mappings: item.field_mappings as any as { fields: string[]; item_mappings: Record<string, string> }
      })) as TaskFieldMapping[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (mapping: Partial<TaskFieldMapping>) => {
      const payload = {
        task_category: taskCategory,
        sof_number: sofNumber,
        applicable_stages: applicableStages.split(',').map(s => s.trim()),
        field_mappings: {
          fields: fields.split(',').map(f => f.trim()),
          item_mappings: JSON.parse(itemMappings || '{}'),
        },
        is_active: true,
      };

      if (editingMapping) {
        const { error } = await supabase
          .from('task_field_mappings')
          .update(payload)
          .eq('id', editingMapping.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('task_field_mappings')
          .insert([payload]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-field-mappings'] });
      toast({ title: 'Success', description: 'Mapping saved successfully' });
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('task_field_mappings')
        .update({ is_active: !isActive })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-field-mappings'] });
      toast({ title: 'Success', description: 'Status updated' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('task_field_mappings')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-field-mappings'] });
      toast({ title: 'Success', description: 'Mapping deleted' });
    },
  });

  const resetForm = () => {
    setTaskCategory('');
    setSofNumber('');
    setApplicableStages('');
    setFields('');
    setItemMappings('');
    setEditingMapping(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (mapping: TaskFieldMapping) => {
    setEditingMapping(mapping);
    setTaskCategory(mapping.task_category);
    setSofNumber(mapping.sof_number);
    setApplicableStages(mapping.applicable_stages.join(', '));
    setFields(mapping.field_mappings.fields.join(', '));
    setItemMappings(JSON.stringify(mapping.field_mappings.item_mappings, null, 2));
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!taskCategory || !sofNumber || !applicableStages) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      JSON.parse(itemMappings || '{}');
    } catch {
      toast({
        title: 'Validation Error',
        description: 'Item mappings must be valid JSON',
        variant: 'destructive',
      });
      return;
    }

    saveMutation.mutate({});
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Task Field Mappings</h2>
          <p className="text-muted-foreground">
            Manage mappings between task items and batch record fields
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Mapping
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Task Category</TableHead>
              <TableHead>SOF Number</TableHead>
              <TableHead>Applicable Stages</TableHead>
              <TableHead>Fields</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : mappings?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  No mappings found
                </TableCell>
              </TableRow>
            ) : (
              mappings?.map((mapping) => (
                <TableRow key={mapping.id}>
                  <TableCell className="font-medium">{mapping.task_category}</TableCell>
                  <TableCell>{mapping.sof_number}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {mapping.applicable_stages.map((stage) => (
                        <Badge key={stage} variant="secondary">
                          {stage}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {mapping.field_mappings.fields.slice(0, 3).map((field) => (
                        <Badge key={field} variant="outline">
                          {field}
                        </Badge>
                      ))}
                      {mapping.field_mappings.fields.length > 3 && (
                        <Badge variant="outline">
                          +{mapping.field_mappings.fields.length - 3}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={mapping.is_active}
                      onCheckedChange={() =>
                        toggleMutation.mutate({
                          id: mapping.id,
                          isActive: mapping.is_active,
                        })
                      }
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(mapping)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteMutation.mutate(mapping.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingMapping ? 'Edit Mapping' : 'Add New Mapping'}
            </DialogTitle>
            <DialogDescription>
              Configure how task checklist items map to batch record fields
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="taskCategory">Task Category *</Label>
              <Input
                id="taskCategory"
                value={taskCategory}
                onChange={(e) => setTaskCategory(e.target.value)}
                placeholder="e.g., cloning_rooting"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sofNumber">SOF Number *</Label>
              <Input
                id="sofNumber"
                value={sofNumber}
                onChange={(e) => setSofNumber(e.target.value)}
                placeholder="e.g., SOF03"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stages">Applicable Stages * (comma-separated)</Label>
              <Input
                id="stages"
                value={applicableStages}
                onChange={(e) => setApplicableStages(e.target.value)}
                placeholder="e.g., cloning, hardening"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fields">Fields (comma-separated)</Label>
              <Input
                id="fields"
                value={fields}
                onChange={(e) => setFields(e.target.value)}
                placeholder="e.g., mother_no, dome_no, clonator_1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="itemMappings">Item Mappings (JSON)</Label>
              <Textarea
                id="itemMappings"
                value={itemMappings}
                onChange={(e) => setItemMappings(e.target.value)}
                placeholder='{"mother_number": "mother_no", "dome_number": "dome_no"}'
                rows={8}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Map checklist item keys to batch record field names
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={resetForm}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Saving...' : 'Save Mapping'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
