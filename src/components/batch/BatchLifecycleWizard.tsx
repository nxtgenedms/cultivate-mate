import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, X } from 'lucide-react';
import { HeaderInfoStep } from './steps/HeaderInfoStep';

interface BatchLifecycleWizardProps {
  recordId?: string;
  onSave: (data: any, isDraft: boolean) => Promise<void>;
  onCancel: () => void;
}

export function BatchLifecycleWizard({ recordId, onSave, onCancel }: BatchLifecycleWizardProps) {
  const [formData, setFormData] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async () => {
    // Validate mandatory fields
    const errors: string[] = [];
    
    // Check batch source is selected
    if (!formData.starting_phase) {
      errors.push("Please select a batch source (Mother Plant or Seed)");
    }
    
    // Check batch number
    if (!formData.batch_number) {
      errors.push("Batch Number is required");
    }
    
    // If there are validation errors, show them and return
    if (errors.length > 0) {
      const toast = await import('sonner');
      toast.toast.error("Please fill in all mandatory fields", {
        description: errors.join(", ")
      });
      return;
    }
    
    setIsSaving(true);
    try {
      await onSave(formData, false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    onCancel();
  };

  return (
    <div className="space-y-6">
      {/* Step Content */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Consolidated form content */}
            <div className="min-h-[400px]">
              <HeaderInfoStep data={formData} onChange={setFormData} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3">
        <Button
          variant="outline"
          onClick={handleCancel}
          disabled={isSaving}
        >
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>

        <Button 
          onClick={handleSubmit}
          disabled={isSaving}
        >
          <CheckCircle2 className="h-4 w-4 mr-2" />
          Create Batch
        </Button>
      </div>
    </div>
  );
}
