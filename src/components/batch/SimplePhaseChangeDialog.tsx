import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BATCH_STAGES, STAGE_LABELS } from '@/lib/batchUtils';
import { Loader2 } from 'lucide-react';

interface SimplePhaseChangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  batchNumber: string;
  currentStage: string;
  currentQuantity?: number;
  onSubmit: (data: { stage: string; quantity: number }) => void;
  isSubmitting?: boolean;
}

export function SimplePhaseChangeDialog({
  open,
  onOpenChange,
  batchNumber,
  currentStage,
  currentQuantity,
  onSubmit,
  isSubmitting = false
}: SimplePhaseChangeDialogProps) {
  const [stage, setStage] = useState(currentStage);
  const [quantity, setQuantity] = useState(currentQuantity?.toString() || '');

  useEffect(() => {
    if (open) {
      setStage(currentStage);
      setQuantity(currentQuantity?.toString() || '');
    }
  }, [open, currentStage, currentQuantity]);

  const handleSubmit = () => {
    const qty = parseInt(quantity) || 0;
    onSubmit({ stage, quantity: qty });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Batch Phase</DialogTitle>
          <DialogDescription>
            Update the phase and quantity for batch {batchNumber}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="stage">Current Phase</Label>
            <Select value={stage} onValueChange={setStage}>
              <SelectTrigger id="stage">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(BATCH_STAGES).map((stageKey) => (
                  <SelectItem key={stageKey} value={stageKey}>
                    {STAGE_LABELS[stageKey as keyof typeof STAGE_LABELS]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Enter quantity"
              min="0"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !quantity}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              'Update Batch'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
