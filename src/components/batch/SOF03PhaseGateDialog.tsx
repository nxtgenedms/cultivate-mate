import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface SOF03PhaseGateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  batchId: string;
  batchNumber: string;
  onSubmit: (data: SOF03FormData) => Promise<void>;
  isSubmitting?: boolean;
}

export interface SOF03FormData {
  clones_healthy: boolean;
  root_development_adequate: boolean;
  no_disease_present: boolean;
  no_pest_infestation: boolean;
  environmental_conditions_met: boolean;
  documentation_complete: boolean;
  quality_check_passed: boolean;
  notes: string;
}

const complianceChecks = [
  {
    key: 'clones_healthy' as keyof SOF03FormData,
    label: 'All clones are healthy and vigorous',
    description: 'Visual inspection confirms no wilting, discoloration, or stunted growth'
  },
  {
    key: 'root_development_adequate' as keyof SOF03FormData,
    label: 'Root development is adequate for transplant',
    description: 'Minimum 2-3 inch root length with visible white healthy roots'
  },
  {
    key: 'no_disease_present' as keyof SOF03FormData,
    label: 'No disease or pathogen symptoms present',
    description: 'No signs of fungal, bacterial, or viral infections observed'
  },
  {
    key: 'no_pest_infestation' as keyof SOF03FormData,
    label: 'No pest infestation detected',
    description: 'Visual inspection confirms absence of insects, mites, or pest damage'
  },
  {
    key: 'environmental_conditions_met' as keyof SOF03FormData,
    label: 'Environmental conditions meet specifications',
    description: 'Temperature, humidity, and light levels are within acceptable ranges'
  },
  {
    key: 'documentation_complete' as keyof SOF03FormData,
    label: 'All required documentation is complete',
    description: 'SOF04 weekly checks, SOF12 daily records, and batch logs are up to date'
  },
  {
    key: 'quality_check_passed' as keyof SOF03FormData,
    label: 'Final quality check passed',
    description: 'Batch meets all quality standards for progression to Vegetative phase'
  }
];

export function SOF03PhaseGateDialog({
  open,
  onOpenChange,
  batchId,
  batchNumber,
  onSubmit,
  isSubmitting = false
}: SOF03PhaseGateDialogProps) {
  const [formData, setFormData] = useState<SOF03FormData>({
    clones_healthy: false,
    root_development_adequate: false,
    no_disease_present: false,
    no_pest_infestation: false,
    environmental_conditions_met: false,
    documentation_complete: false,
    quality_check_passed: false,
    notes: ''
  });

  const allChecked = complianceChecks.every(check => formData[check.key] === true);
  const someChecked = complianceChecks.some(check => formData[check.key] === true);

  const handleCheckChange = (key: keyof SOF03FormData, checked: boolean) => {
    setFormData(prev => ({ ...prev, [key]: checked }));
  };

  const handleSubmit = async () => {
    await onSubmit(formData);
    // Reset form after submission
    setFormData({
      clones_healthy: false,
      root_development_adequate: false,
      no_disease_present: false,
      no_pest_infestation: false,
      environmental_conditions_met: false,
      documentation_complete: false,
      quality_check_passed: false,
      notes: ''
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-5 w-5 text-primary" />
            <DialogTitle>SOF03: Phase Change Compliance Check</DialogTitle>
          </div>
          <DialogDescription>
            Batch: <span className="font-medium">{batchNumber}</span> • Cloning → Vegetative
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Indicator */}
          <Card className={allChecked ? 'border-green-500' : someChecked ? 'border-yellow-500' : 'border-border'}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Compliance Status</p>
                  <p className="text-xs text-muted-foreground">
                    {complianceChecks.filter(c => formData[c.key]).length} of {complianceChecks.length} checks passed
                  </p>
                </div>
                <Badge variant={allChecked ? 'default' : 'secondary'} className={allChecked ? 'bg-green-500' : ''}>
                  {allChecked ? 'Ready to Proceed' : 'Incomplete'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Compliance Checks */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <h3 className="font-semibold">Mandatory Compliance Checks</h3>
            </div>
            
            {complianceChecks.map((check) => {
              const isChecked = formData[check.key] as boolean;
              return (
                <Card key={check.key} className={isChecked ? 'border-green-500/50' : ''}>
                  <CardContent className="pt-4">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id={check.key}
                        checked={isChecked}
                        onCheckedChange={(checked) => handleCheckChange(check.key, checked === true)}
                        className="mt-1"
                      />
                      <div className="flex-1 space-y-1">
                        <Label
                          htmlFor={check.key}
                          className="text-sm font-medium leading-none cursor-pointer"
                        >
                          {check.label}
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          {check.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Additional Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Enter any additional observations or comments..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
            />
          </div>

          {/* Warning Alert */}
          {!allChecked && someChecked && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                All compliance checks must pass to proceed with the phase change. Any failed check will block the transition and create a rework task.
              </AlertDescription>
            </Alert>
          )}

          {/* Success Preview */}
          {allChecked && (
            <Alert className="border-green-500 bg-green-500/10">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-600">
                All compliance checks passed! Submitting will approve the phase change to Vegetative.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !someChecked}
          >
            {isSubmitting ? 'Submitting...' : allChecked ? 'Approve Phase Change' : 'Submit for Review'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
