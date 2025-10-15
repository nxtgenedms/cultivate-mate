import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BATCH_STAGES, STAGE_LABELS } from '@/lib/batchUtils';
import { Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SimplePhaseChangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  batchNumber: string;
  currentStage: string;
  nextStage: string;
  currentQuantity?: number;
  currentDome?: string;
  onSubmit: (data: { quantity: number; dome: string }) => void;
  isSubmitting?: boolean;
}

export function SimplePhaseChangeDialog({
  open,
  onOpenChange,
  batchNumber,
  currentStage,
  nextStage,
  currentQuantity,
  currentDome,
  onSubmit,
  isSubmitting = false
}: SimplePhaseChangeDialogProps) {
  const [quantity, setQuantity] = useState(currentQuantity?.toString() || '');
  const [dome, setDome] = useState(currentDome || '');

  // Fetch dome lookup values
  const { data: lookupCategories } = useQuery({
    queryKey: ['lookup-categories-dome'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lookup_categories')
        .select('id, category_key')
        .eq('category_key', 'dome_no')
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: domeValues } = useQuery({
    queryKey: ['lookup-values-dome', lookupCategories?.id],
    enabled: !!lookupCategories?.id,
    queryFn: async () => {
      if (!lookupCategories?.id) return [];
      const { data, error } = await supabase
        .from('lookup_values')
        .select('id, value_display')
        .eq('category_id', lookupCategories.id)
        .eq('is_active', true)
        .order('sort_order');
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (open) {
      setQuantity(currentQuantity?.toString() || '');
      setDome(currentDome || '');
    }
  }, [open, currentQuantity, currentDome]);

  const handleSubmit = () => {
    const qty = parseInt(quantity) || 0;
    onSubmit({ quantity: qty, dome });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Batch Phase - Move to {STAGE_LABELS[nextStage as keyof typeof STAGE_LABELS]}</DialogTitle>
          <DialogDescription>
            Update quantity and dome for batch {batchNumber}
            {currentQuantity && (
              <span className="block mt-1 text-sm font-medium text-foreground">
                Current Total Plants: {currentQuantity}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="dome">Dome Number</Label>
            <Select value={dome} onValueChange={setDome}>
              <SelectTrigger id="dome">
                <SelectValue placeholder="Select Dome No" />
              </SelectTrigger>
              <SelectContent className="bg-background z-50">
                {domeValues?.map((option: any) => (
                  <SelectItem key={option.id} value={option.value_display}>
                    {option.value_display}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Total Plants</Label>
            <Input
              id="quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Enter total plants"
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
