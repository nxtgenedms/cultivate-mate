import { useState } from 'react';
import { BatchLayout } from '@/components/BatchLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { BatchLifecycleWizard, BatchLifecycleData } from '@/components/batch-lifecycle/BatchLifecycleWizard';
import { HeaderInfoStep } from '@/components/batch-lifecycle/steps/HeaderInfoStep';
import { CloningRootingStep } from '@/components/batch-lifecycle/steps/CloningRootingStep';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const wizardSteps = [
  {
    id: 'header',
    title: 'Batch Information',
    description: 'Enter basic batch details',
    component: HeaderInfoStep,
  },
  {
    id: 'cloning',
    title: 'Cloning & Rooting',
    description: 'Record cloning and rooting information',
    component: CloningRootingStep,
  },
  // More steps will be added progressively
];

export default function MasterRecord() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch existing records
  const { data: records, isLoading } = useQuery({
    queryKey: ['batch-lifecycle-records'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('batch_lifecycle_records')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async ({ data, isDraft }: { data: BatchLifecycleData; isDraft: boolean }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const recordData: any = {
        batch_number: data.batch_number || '',
        strain_id: data.strain_id,
        dome_no: data.dome_no,
        mother_no: data.mother_no,
        clone_germination_date: data.clone_germination_date,
        total_clones_plants: data.total_clones_plants,
        clonator_1: data.clonator_1,
        rack_no: data.rack_no,
        clonator_mortalities: data.clonator_mortalities,
        expected_rooting_date: data.expected_rooting_date,
        actual_rooting_date: data.actual_rooting_date,
        clonator_2: data.clonator_2,
        clonator_2_date: data.clonator_2_date,
        clonator_2_number_clones: data.clonator_2_number_clones,
        clonator_2_area_placed: data.clonator_2_area_placed,
        clonator_2_rack_no: data.clonator_2_rack_no,
        clonator_2_no_of_days: data.clonator_2_no_of_days,
        status: isDraft ? 'draft' : 'in_progress',
        current_stage: 'cloning',
        created_by: user?.id,
      };

      const { error } = await supabase
        .from('batch_lifecycle_records')
        .insert(recordData);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['batch-lifecycle-records'] });
      toast({
        title: variables.isDraft ? "Draft saved" : "Record saved",
        description: "Batch lifecycle record has been saved successfully.",
      });
      if (!variables.isDraft) {
        setIsDialogOpen(false);
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSave = async (data: BatchLifecycleData, isDraft: boolean) => {
    await saveMutation.mutateAsync({ data, isDraft });
  };

  const handleComplete = async (data: BatchLifecycleData) => {
    await saveMutation.mutateAsync({ data, isDraft: false });
  };

  return (
    <BatchLayout>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Batch Lifecycle Master Record (HVCSOF009)
              </CardTitle>
              <CardDescription>
                Complete lifecycle tracking from cloning to packaging
              </CardDescription>
            </div>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Batch Record
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              Loading records...
            </div>
          ) : records && records.length > 0 ? (
            <div className="space-y-4">
              {records.map((record) => (
                <Card key={record.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{record.batch_number}</CardTitle>
                    <CardDescription>
                      Status: {record.status} | Stage: {record.current_stage}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No batch lifecycle records yet. Create your first one!
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Batch Lifecycle Record</DialogTitle>
          </DialogHeader>
          <BatchLifecycleWizard
            steps={wizardSteps}
            onSave={handleSave}
            onComplete={handleComplete}
          />
        </DialogContent>
      </Dialog>
    </BatchLayout>
  );
}
