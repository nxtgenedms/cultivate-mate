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

export interface BatchLifecycleData {
  [key: string]: any;
}

interface Step {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<StepProps>;
}

export interface StepProps {
  data: BatchLifecycleData;
  updateData: (newData: Partial<BatchLifecycleData>) => void;
  onNext: () => void;
  onPrevious: () => void;
  isFirst: boolean;
  isLast: boolean;
}

interface BatchLifecycleWizardProps {
  steps: Step[];
  initialData?: BatchLifecycleData;
  onSave: (data: BatchLifecycleData, isDraft: boolean) => Promise<void>;
  onComplete: (data: BatchLifecycleData) => Promise<void>;
}

export function BatchLifecycleWizard({ 
  steps, 
  initialData = {}, 
  onSave,
  onComplete 
}: BatchLifecycleWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<BatchLifecycleData>(initialData);
  const [isSaving, setIsSaving] = useState(false);

  const progress = ((currentStep + 1) / steps.length) * 100;
  const CurrentStepComponent = steps[currentStep].component;

  const updateData = (newData: Partial<BatchLifecycleData>) => {
    setData(prev => ({ ...prev, ...newData }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      await onSave(data, true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleComplete = async () => {
    setIsSaving(true);
    try {
      await onComplete(data);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="font-medium">Step {currentStep + 1} of {steps.length}</span>
          <span className="text-muted-foreground">{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step Indicators */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2">
        {steps.map((step, index) => (
          <button
            key={step.id}
            onClick={() => setCurrentStep(index)}
            className={cn(
              "flex-1 min-w-[120px] p-3 rounded-lg border-2 transition-all text-left",
              index === currentStep
                ? "border-primary bg-primary/5"
                : index < currentStep
                ? "border-green-500 bg-green-50 dark:bg-green-950"
                : "border-border hover:border-primary/50"
            )}
          >
            <div className="flex items-start gap-2">
              <div className={cn(
                "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                index === currentStep
                  ? "bg-primary text-primary-foreground"
                  : index < currentStep
                  ? "bg-green-500 text-white"
                  : "bg-muted text-muted-foreground"
              )}>
                {index < currentStep ? <CheckCircle2 className="w-4 h-4" /> : index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-xs truncate">{step.title}</div>
                <div className="text-xs text-muted-foreground truncate">{step.description}</div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Step Content */}
      <Card>
        <CardContent className="pt-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold">{steps[currentStep].title}</h2>
            <p className="text-muted-foreground">{steps[currentStep].description}</p>
          </div>

          <CurrentStepComponent
            data={data}
            updateData={updateData}
            onNext={handleNext}
            onPrevious={handlePrevious}
            isFirst={currentStep === 0}
            isLast={currentStep === steps.length - 1}
          />
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center gap-4">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 0}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>

        <Button
          variant="outline"
          onClick={handleSaveDraft}
          disabled={isSaving}
        >
          <Save className="w-4 h-4 mr-2" />
          Save Draft
        </Button>

        {currentStep === steps.length - 1 ? (
          <Button onClick={handleComplete} disabled={isSaving}>
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Complete Record
          </Button>
        ) : (
          <Button onClick={handleNext}>
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}
