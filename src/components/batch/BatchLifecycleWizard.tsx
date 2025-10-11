import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  ChevronLeft, 
  ChevronRight, 
  Save,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { InitialPhaseStep } from './steps/InitialPhaseStep';
import { HeaderInfoStep } from './steps/HeaderInfoStep';

interface BatchLifecycleWizardProps {
  recordId?: string;
  onSave: (data: any, isDraft: boolean) => Promise<void>;
}

export function BatchLifecycleWizard({ recordId, onSave }: BatchLifecycleWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);

  const stepLabels = [
    'Starting Phase',
    'Batch Details',
    'Cloning & Rooting',
    'Hardening',
    'Vegetative Stage',
    'Flowering/Grow Room',
    'Harvest',
    'Processing & Inspection',
    'Drying',
    'Packing',
    'Mortality Summary',
  ];

  const progress = ((currentStep + 1) / stepLabels.length) * 100;

  const handleNext = () => {
    if (currentStep < stepLabels.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

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

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <InitialPhaseStep data={formData} onChange={setFormData} />;
      case 1:
        return <HeaderInfoStep data={formData} onChange={setFormData} />;
      default:
        return (
          <div className="flex items-center justify-center h-[400px] text-muted-foreground">
            Form content for {stepLabels[currentStep]} coming soon
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Step {currentStep + 1} of {stepLabels.length}</span>
          <span className="text-muted-foreground">{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step Navigation */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
        {stepLabels.map((label, index) => (
          <button
            key={index}
            onClick={() => setCurrentStep(index)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-center justify-center",
              currentStep === index
                ? "bg-primary text-primary-foreground"
                : index < currentStep
                ? "bg-muted text-foreground hover:bg-muted/80"
                : "bg-muted/50 text-muted-foreground hover:bg-muted"
            )}
          >
            {index < currentStep && <CheckCircle2 className="h-3 w-3 flex-shrink-0" />}
            <span className="line-clamp-1">{label}</span>
          </button>
        ))}
      </div>

      {/* Step Content */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">{stepLabels[currentStep]}</h2>
              <p className="text-muted-foreground mt-1">
                Complete the information for this stage
              </p>
            </div>

            {/* Step component will be rendered here */}
            <div className="min-h-[400px]">
              {renderStepContent()}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 0 || isSaving}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>

        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleSaveDraft}
            disabled={isSaving}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>

          {currentStep === stepLabels.length - 1 ? (
            <Button 
              onClick={handleSubmit}
              disabled={isSaving}
            >
              Submit Record
            </Button>
          ) : (
            <Button 
              onClick={handleNext}
              disabled={isSaving}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
