import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { SimplePhaseChangeDialog } from './SimplePhaseChangeDialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { STAGE_LABELS } from '@/lib/batchUtils';

interface PhaseChangeButtonProps {
  batchId: string;
  batchNumber: string;
  currentStage: string;
  currentQuantity?: number;
  currentDome?: string;
  disabled?: boolean;
}

export function PhaseChangeButton({
  batchId,
  batchNumber,
  currentStage,
  currentQuantity,
  currentDome,
  disabled = false
}: PhaseChangeButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get next stage for button label
  const getNextStage = () => {
    const stages = ['cloning', 'vegetative', 'flowering', 'harvest'];
    const currentIndex = stages.indexOf(currentStage);
    if (currentIndex < stages.length - 1) {
      return stages[currentIndex + 1];
    }
    return currentStage;
  };

  const nextStage = getNextStage();
  const buttonLabel = `Move to ${STAGE_LABELS[nextStage as keyof typeof STAGE_LABELS] || 'Next Phase'}`;

  const handleSubmit = async (data: { stage: string; quantity: number; dome: string }) => {
    setIsSubmitting(true);
    try {
      // Update batch stage, quantity, and dome
      const { error: updateError } = await supabase
        .from('batch_lifecycle_records')
        .update({ 
          current_stage: data.stage as any,
          veg_number_plants: data.quantity,
          dome_no: data.dome
        })
        .eq('id', batchId);

      if (updateError) throw updateError;

      toast({
        title: 'Batch Updated',
        description: `Batch ${batchNumber} has been updated successfully.`,
      });

      // Refresh batch data
      queryClient.invalidateQueries({ queryKey: ['batch-detail', batchId] });
      queryClient.invalidateQueries({ queryKey: ['batch-lifecycle-records'] });
      
      setDialogOpen(false);
    } catch (error) {
      console.error('Error updating batch:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update batch',
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
            {buttonLabel}
          </>
        )}
      </Button>

      <SimplePhaseChangeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        batchNumber={batchNumber}
        currentStage={currentStage}
        currentQuantity={currentQuantity}
        currentDome={currentDome}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </>
  );
}
