import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Save, CheckCircle2, X } from 'lucide-react';
import { HeaderInfoStep } from './steps/HeaderInfoStep';

interface BatchLifecycleWizardProps {
  recordId?: string;
  onSave: (data: any, isDraft: boolean) => Promise<void>;
  onCancel: () => void;
}

export function BatchLifecycleWizard({ recordId, onSave, onCancel }: BatchLifecycleWizardProps) {
  const [formData, setFormData] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      await onSave(formData, true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async () => {
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
