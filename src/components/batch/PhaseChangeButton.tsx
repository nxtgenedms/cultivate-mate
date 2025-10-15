import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { SOF03PhaseGateDialog, SOF03FormData } from './SOF03PhaseGateDialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

interface PhaseChangeButtonProps {
  batchId: string;
  batchNumber: string;
  currentStage: string;
  responsiblePersonId?: string;
  disabled?: boolean;
}

export function PhaseChangeButton({
  batchId,
  batchNumber,
  currentStage,
  responsiblePersonId,
  disabled = false
}: PhaseChangeButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Only show button for Cloning -> Vegetative transition
  if (currentStage !== 'cloning') {
    return null;
  }

  const handleSOF03Submit = async (formData: SOF03FormData) => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Check if all checks passed
      const allPassed = formData.clones_healthy &&
        formData.root_development_adequate &&
        formData.no_disease_present &&
        formData.no_pest_infestation &&
        formData.environmental_conditions_met &&
        formData.documentation_complete &&
        formData.quality_check_passed;

      // Create SOF03 submission record
      const { data: submission, error: submissionError } = await supabase
        .from('sof03_phase_gate_submissions')
        .insert({
          batch_id: batchId,
          batch_number: batchNumber,
          ...formData,
          submitted_by: user.id,
          phase_change_approved: allPassed
        })
        .select()
        .single();

      if (submissionError) throw submissionError;

      if (allPassed) {
        // Update batch stage to Vegetative
        const { error: updateError } = await supabase
          .from('batch_lifecycle_records')
          .update({ current_stage: 'vegetative' })
          .eq('id', batchId);

        if (updateError) throw updateError;

        toast({
          title: 'Phase Change Approved',
          description: `Batch ${batchNumber} has been successfully moved to Vegetative phase.`,
        });

        // Refresh batch data
        queryClient.invalidateQueries({ queryKey: ['batch-detail', batchId] });
        queryClient.invalidateQueries({ queryKey: ['batch-lifecycle-records'] });
        
        setDialogOpen(false);
      } else {
        // Create rework task
        const { count: taskCount } = await supabase
          .from('tasks')
          .select('*', { count: 'exact', head: true });

        const taskNumber = `T-${String((taskCount || 0) + 1).padStart(4, '0')}`;
        const dueDate = new Date();
        dueDate.setHours(dueDate.getHours() + 48); // 48 hours from now

        const { data: task, error: taskError } = await supabase
          .from('tasks')
          .insert({
            task_number: taskNumber,
            name: `SOF03 Rework Required: ${batchNumber}`,
            description: `Phase change from Cloning to Vegetative was blocked due to failed compliance checks. Please address all issues and resubmit SOF03 for approval.`,
            status: 'pending',
            due_date: dueDate.toISOString().split('T')[0],
            assignee: responsiblePersonId || user.id,
            created_by: user.id,
            batch_id: batchId
          })
          .select()
          .single();

        if (taskError) throw taskError;

        // Update submission with task reference
        await supabase
          .from('sof03_phase_gate_submissions')
          .update({ rework_task_id: task.id })
          .eq('id', submission.id);

        toast({
          title: 'Phase Change Blocked',
          description: `SOF03 compliance check failed. A rework task has been created and assigned.`,
          variant: 'destructive'
        });

        setDialogOpen(false);
      }
    } catch (error) {
      console.error('Error processing SOF03:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to process phase change request',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setDialogOpen(true)}
        disabled={disabled || isSubmitting}
        size="lg"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <ArrowRight className="h-4 w-4 mr-2" />
            Move to Vegetative
          </>
        )}
      </Button>

      <SOF03PhaseGateDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        batchId={batchId}
        batchNumber={batchNumber}
        onSubmit={handleSOF03Submit}
        isSubmitting={isSubmitting}
      />
    </>
  );
}
