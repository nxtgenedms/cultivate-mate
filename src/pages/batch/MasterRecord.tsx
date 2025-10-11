import { useState } from 'react';
import { BatchLayout } from '@/components/BatchLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Plus, Edit } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { BatchLifecycleWizard } from '@/components/batch/BatchLifecycleWizard';

export default function MasterRecord() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState<string | undefined>();
  const [wizardData, setWizardData] = useState<any>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all batch lifecycle records
  const { data: records, isLoading } = useQuery({
    queryKey: ['batch-lifecycle-records'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('batch_lifecycle_records')
        .select(`
          *,
          created_by_profile:profiles!batch_lifecycle_records_created_by_fkey(full_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Save/Update mutation
  const saveMutation = useMutation({
    mutationFn: async ({ data, isDraft }: { data: any; isDraft: boolean }) => {
      const { data: { user } } = await supabase.auth.getUser();

      if (editingRecordId) {
        const { error } = await supabase
          .from('batch_lifecycle_records')
          .update({
            ...data,
            status: isDraft ? 'draft' : 'in_progress',
          })
          .eq('id', editingRecordId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('batch_lifecycle_records')
          .insert({
            ...data,
            created_by: user?.id,
            status: isDraft ? 'draft' : 'in_progress',
          });

        if (error) throw error;
      }
    },
    onSuccess: (_, { isDraft }) => {
      queryClient.invalidateQueries({ queryKey: ['batch-lifecycle-records'] });
      toast({
        title: isDraft ? 'Draft saved' : 'Record saved',
        description: `Batch lifecycle record has been ${editingRecordId ? 'updated' : 'created'} successfully.`,
      });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to save record: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const resetForm = () => {
    setWizardData({});
    setEditingRecordId(undefined);
  };

  const handleEdit = (record: any) => {
    setEditingRecordId(record.id);
    setWizardData(record);
    setIsDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      draft: 'secondary',
      in_progress: 'default',
      completed: 'success',
    };
    return <Badge variant={variants[status] || 'default'}>{status.replace('_', ' ').toUpperCase()}</Badge>;
  };

  return (
    <BatchLayout>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Batch Lifecycle Master Record (HVCSOF009)
                </CardTitle>
                <CardDescription>
                  Complete batch lifecycle tracking from cloning to packing
                </CardDescription>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open) resetForm();
              }}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Batch Record
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-7xl max-h-[95vh] overflow-hidden flex flex-col">
                  <DialogHeader>
                    <DialogTitle>
                      {editingRecordId ? 'Edit' : 'Create'} Batch Lifecycle Record
                    </DialogTitle>
                  </DialogHeader>
                  <div className="overflow-y-auto flex-1 pr-2">
                    <BatchLifecycleWizard
                      recordId={editingRecordId}
                      onSave={async (data, isDraft) => {
                        return saveMutation.mutateAsync({ data, isDraft });
                      }}
                    />
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading records...</div>
            ) : !records || records.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>No batch lifecycle records found</p>
                <p className="text-sm mt-2">Create your first batch record to get started</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Batch Number</TableHead>
                    <TableHead>Strain ID</TableHead>
                    <TableHead>Mother No</TableHead>
                    <TableHead>Current Stage</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created By</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{record.batch_number}</TableCell>
                      <TableCell>{record.strain_id || '-'}</TableCell>
                      <TableCell>{record.mother_no || '-'}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{record.current_stage}</Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(record.status)}</TableCell>
                      <TableCell>{record.created_by_profile?.full_name || 'Unknown'}</TableCell>
                      <TableCell>
                        {format(new Date(record.created_at), 'MMM d, yyyy h:mm a')}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(record)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </BatchLayout>
  );
}
