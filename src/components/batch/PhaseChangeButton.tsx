import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { StageTransitionWizard } from './stage-transition/StageTransitionWizard';
import { ArrowRight } from 'lucide-react';
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
  currentQuantity = 0,
  currentDome = '',
  disabled = false
}: PhaseChangeButtonProps) {
  const [wizardOpen, setWizardOpen] = useState(false);

  // Get next stage for button label
  const getNextStage = () => {
    const stages = [
      'preclone',
      'clone_germination',
      'hardening',
      'vegetative',
      'flowering_grow_room',
      'preharvest',
      'harvest',
      'processing_drying',
      'packing_storage'
    ];
    const currentIndex = stages.indexOf(currentStage);
    if (currentIndex < stages.length - 1) {
      return stages[currentIndex + 1];
    }
    return currentStage;
  };

  const nextStage = getNextStage();
  const buttonLabel = `Move to ${STAGE_LABELS[nextStage as keyof typeof STAGE_LABELS] || 'Next Phase'}`;

  return (
    <>
      <Button
        onClick={() => setWizardOpen(true)}
        disabled={disabled}
        size="lg"
      >
        <ArrowRight className="h-4 w-4 mr-2" />
        {buttonLabel}
      </Button>

      <StageTransitionWizard
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        batchId={batchId}
        batchNumber={batchNumber}
        currentStage={currentStage}
        nextStage={nextStage}
        currentQuantity={currentQuantity}
        currentDome={currentDome}
      />
    </>
  );
}
