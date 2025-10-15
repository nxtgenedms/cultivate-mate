import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { SimplePhaseChangeDialog } from './SimplePhaseChangeDialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

interface PhaseChangeButtonProps {
  batchId: string;
  batchNumber: string;
  currentStage: string;
  currentQuantity?: number;
  disabled?: boolean;
}

export function PhaseChangeButton({
  batchId,
  batchNumber,
  currentStage,
  currentQuantity,
  disabled = false
}: PhaseChangeButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSubmit = async (data: { stage: string; quantity: number }) => {
    setIsSubmitting(true);
    try {
      // Update batch stage and quantity
      const { error: updateError } = await supabase
        .from('batch_lifecycle_records')
        .update({ 
          current_stage: data.stage as any,
          veg_number_plants: data.quantity
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
            Update Phase
          </>
        )}
      </Button>

      <SimplePhaseChangeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        batchNumber={batchNumber}
        currentStage={currentStage}
        currentQuantity={currentQuantity}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </>
  );
}
