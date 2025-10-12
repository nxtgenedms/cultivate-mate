import { useState } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface NomenclatureTemplate {
  id: string;
  entity_type: string;
  format_pattern: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

export default function NomenclatureManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<NomenclatureTemplate | null>(null);
  const [formData, setFormData] = useState({
    entity_type: '',
    format_pattern: '',
    description: '',
  });

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['nomenclature-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('nomenclature_templates')
        .select('*')
        .order('entity_type');
      
      if (error) throw error;
      return data as NomenclatureTemplate[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from('nomenclature_templates')
        .insert([data]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nomenclature-templates'] });
      toast({ title: 'Template created successfully' });
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to create template',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase
        .from('nomenclature_templates')
        .update(data)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nomenclature-templates'] });
      toast({ title: 'Template updated successfully' });
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to update template',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('nomenclature_templates')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nomenclature-templates'] });
      toast({ title: 'Template deleted successfully' });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to delete template',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const resetForm = () => {
    setFormData({
      entity_type: '',
      format_pattern: '',
      description: '',
    });
    setEditingTemplate(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (template: NomenclatureTemplate) => {
    setEditingTemplate(template);
    setFormData({
      entity_type: template.entity_type,
      format_pattern: template.format_pattern,
      description: template.description || '',
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTemplate) {
      updateMutation.mutate({ id: editingTemplate.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Nomenclature Templates</h1>
            <p className="text-muted-foreground mt-2">
              Define custom ID formats for various entities like Batches, Plants, and Equipment
            </p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Template
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-8">Loading templates...</div>
        ) : (
          <div className="grid gap-4">
            {templates.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="capitalize">{template.entity_type}</CardTitle>
                      <CardDescription>{template.description}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(template)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteMutation.mutate(template.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium">Format Pattern:</span>
                      <code className="ml-2 px-2 py-1 bg-muted rounded text-sm">
                        {template.format_pattern}
                      </code>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <strong>Placeholders:</strong>
                      <ul className="list-disc list-inside mt-1 space-y-1">
                        <li>[YYYYMMDD] - Creation date in YYYYMMDD format</li>
                        <li>[COUNT] - Auto-incrementing daily counter (3 digits)</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingTemplate ? 'Edit Template' : 'Add New Template'}
              </DialogTitle>
              <DialogDescription>
                Define how IDs should be formatted for different entities
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="entity_type">Entity Type</Label>
                <Input
                  id="entity_type"
                  value={formData.entity_type}
                  onChange={(e) =>
                    setFormData({ ...formData, entity_type: e.target.value })
                  }
                  placeholder="e.g., batch, plant, equipment"
                  required
                  disabled={!!editingTemplate}
                />
              </div>
              <div>
                <Label htmlFor="format_pattern">Format Pattern</Label>
                <Input
                  id="format_pattern"
                  value={formData.format_pattern}
                  onChange={(e) =>
                    setFormData({ ...formData, format_pattern: e.target.value })
                  }
                  placeholder="e.g., [YYYYMMDD]-[COUNT]"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Use [YYYYMMDD] for date and [COUNT] for auto-increment
                </p>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Describe what this format is used for"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button type="submit">
                  <Save className="h-4 w-4 mr-2" />
                  {editingTemplate ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
