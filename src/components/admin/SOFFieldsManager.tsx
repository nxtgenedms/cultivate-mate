import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Plus, Edit, Trash2, GripVertical } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SOFFieldForm } from '@/components/admin/SOFFieldForm';
import { SOFAuditHistory } from '@/components/admin/SOFAuditHistory';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SOFFieldsManagerProps {
  sof: any;
  onBack: () => void;
}

export function SOFFieldsManager({ sof, onBack }: SOFFieldsManagerProps) {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingField, setEditingField] = useState<any>(null);

  const { data: fields, isLoading, refetch } = useQuery({
    queryKey: ['sof-fields', sof.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sof_fields')
        .select('*')
        .eq('sof_id', sof.id)
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (fieldId: string) => {
      const { error } = await supabase
        .from('sof_fields')
        .delete()
        .eq('id', fieldId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Field deleted successfully',
      });
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleEdit = (field: any) => {
    setEditingField(field);
    setIsDialogOpen(true);
  };

  const handleDelete = (fieldId: string) => {
    if (confirm('Are you sure you want to delete this field?')) {
      deleteMutation.mutate(fieldId);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingField(null);
    refetch();
  };

  const getFieldTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      text: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
      number: 'bg-purple-500/10 text-purple-700 dark:text-purple-400',
      date: 'bg-green-500/10 text-green-700 dark:text-green-400',
      checkbox: 'bg-orange-500/10 text-orange-700 dark:text-orange-400',
      textarea: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400',
      select: 'bg-pink-500/10 text-pink-700 dark:text-pink-400',
      signature: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
    };
    return colors[type] || colors.text;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to SOFs
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold">{sof.sof_number}</h1>
        <p className="text-muted-foreground">{sof.title}</p>
      </div>

      <Tabs defaultValue="fields" className="space-y-4">
        <TabsList>
          <TabsTrigger value="fields">Fields</TabsTrigger>
          <TabsTrigger value="history">Audit History</TabsTrigger>
        </TabsList>

        <TabsContent value="fields">
          <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>SOF Fields</CardTitle>
              <CardDescription>
                Manage the fields and checklist items for this SOF
              </CardDescription>
            </div>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Field
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : fields && fields.length > 0 ? (
            <div className="space-y-2">
              {fields.map((field, index) => (
                <Card key={field.id} className="hover:border-primary/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{field.field_label}</span>
                          <Badge className={getFieldTypeColor(field.field_type)}>
                            {field.field_type}
                          </Badge>
                          {field.is_required && (
                            <Badge variant="outline">Required</Badge>
                          )}
                          {field.field_group && (
                            <Badge variant="secondary">{field.field_group}</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Field Key: <code className="text-xs bg-muted px-1 py-0.5 rounded">{field.field_key}</code>
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(field)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(field.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No fields created yet</p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Field
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
        </TabsContent>

        <TabsContent value="history">
          <SOFAuditHistory sofId={sof.id} />
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingField ? 'Edit Field' : 'Add New Field'}
            </DialogTitle>
          </DialogHeader>
          <SOFFieldForm 
            sofId={sof.id}
            field={editingField}
            onClose={handleCloseDialog}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}