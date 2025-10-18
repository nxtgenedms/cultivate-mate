import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { TaskValidationStep } from "./TaskValidationStep";
import { TaskDataCopyStep } from "./TaskDataCopyStep";
import { RequiredFieldsStep } from "./RequiredFieldsStep";
import { ExtractedFieldData, TaskFieldMapping } from "@/lib/taskFieldMapper";
import { ArrowLeft, ArrowRight, CheckCircle, AlertCircle } from "lucide-react";

interface StageTransitionWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  batchId: string;
  batchNumber: string;
  currentStage: string;
  nextStage: string;
  currentQuantity: number;
  currentDome: string;
}

export const StageTransitionWizard = ({
  open,
  onOpenChange,
  batchId,
  batchNumber,
  currentStage,
  nextStage,
  currentQuantity,
  currentDome,
}: StageTransitionWizardProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [copiedFieldData, setCopiedFieldData] = useState<ExtractedFieldData[]>([]);
  const [formData, setFormData] = useState<Record<string, any>>({});

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch tasks for this batch
  const { data: tasks = [] } = useQuery({
    queryKey: ['batch-tasks', batchId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('batch_id', batchId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: open,
  });

  // Fetch task field mappings (optional - only used for field data copying)
  const { data: mappings = [] } = useQuery({
    queryKey: ['task-field-mappings', currentStage],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('task_field_mappings')
        .select('*')
        .contains('applicable_stages', [currentStage])
        .eq('is_active', true);
      
      if (error) {
        console.warn('Failed to fetch task field mappings:', error);
        return [];
      }
      
      // Transform data to match TaskFieldMapping interface
      return (data || []).map(item => ({
        ...item,
        field_mappings: item.field_mappings as {
          fields: string[];
          item_mappings: Record<string, string>;
        }
      })) as TaskFieldMapping[];
    },
    enabled: open,
  });

  // Fetch dome values
  const { data: domeValues = [] } = useQuery({
    queryKey: ['lookup-dome-values'],
    queryFn: async () => {
      const { data: category } = await supabase
        .from('lookup_categories')
        .select('id')
        .eq('category_key', 'dome_no')
        .single();

      if (!category) return [];

      const { data } = await supabase
        .from('lookup_values')
        .select('*')
        .eq('category_id', category.id)
        .eq('is_active', true)
        .order('sort_order');

      return data || [];
    },
    enabled: open,
  });

  const updateBatchMutation = useMutation({
    mutationFn: async (updateData: any) => {
      const { error } = await supabase
        .from('batch_lifecycle_records')
        .update(updateData)
        .eq('id', batchId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Stage Updated",
        description: `Batch ${batchNumber} moved to ${nextStage} stage successfully.`,
      });
      // Invalidate all related queries with correct keys
      queryClient.invalidateQueries({ queryKey: ['batch-detail', batchId] });
      queryClient.invalidateQueries({ queryKey: ['batch-tasks', batchId] });
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      onOpenChange(false);
      resetWizard();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update batch stage. Please try again.",
        variant: "destructive",
      });
      console.error('Stage update error:', error);
    },
  });

  const resetWizard = () => {
    setCurrentStep(1);
    setSelectedTaskIds([]);
    setCopiedFieldData([]);
    setFormData({});
  };

  const handleTaskSelection = (taskId: string, checked: boolean) => {
    setSelectedTaskIds(prev =>
      checked ? [...prev, taskId] : prev.filter(id => id !== taskId)
    );
  };

  const handleFieldDataSelect = (data: ExtractedFieldData[]) => {
    setCopiedFieldData(data);
    
    // Auto-fill form data
    const newFormData = { ...formData };
    data.forEach(item => {
      newFormData[item.fieldName] = item.value;
    });
    setFormData(newFormData);
  };

  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    const updateData = {
      current_stage: nextStage,
      last_transition_tasks: selectedTaskIds,
      stage_transition_history: [
        {
          from_stage: currentStage,
          to_stage: nextStage,
          timestamp: new Date().toISOString(),
          user_id: null, // Will be set by RLS
          associated_tasks: selectedTaskIds,
          field_data: formData,
        }
      ],
      ...formData,
    };

    console.log('Stage Transition Update Data:', {
      currentStage,
      nextStage,
      updateData,
      formData
    });

    updateBatchMutation.mutate(updateData);
  };

  const progress = (currentStep / 3) * 100;

  const canProceed = () => {
    if (currentStep === 1) {
      // Filter tasks by current stage
      const stageSpecificTasks = tasks.filter(t => t.lifecycle_stage === currentStage);
      
      // Block if no stage-specific tasks have been created
      if (stageSpecificTasks.length === 0) {
        return false;
      }
      
      // Block if there are any incomplete stage-specific tasks
      const hasIncompleteStageTasks = stageSpecificTasks.some(task => 
        task.status !== 'completed'
      );
      
      if (hasIncompleteStageTasks) {
        return false;
      }
      
      // Also check if any selected tasks are incomplete
      const hasIncompleteSelectedTasks = selectedTaskIds.some(id => {
        const task = tasks.find(t => t.id === id);
        return task && task.status !== 'completed';
      });
      
      return !hasIncompleteSelectedTasks;
    }
    return true;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Stage Transition: {currentStage} → {nextStage}
          </DialogTitle>
          <DialogDescription>
            Batch: {batchNumber} | Step {currentStep} of 3
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Progress value={progress} className="w-full" />

          <div className="min-h-[400px]">
            {currentStep === 1 && (
              <TaskValidationStep
                tasks={tasks.map(t => ({
                  ...t,
                  checklist_items: Array.isArray(t.checklist_items) ? t.checklist_items : []
                }))}
                mappings={mappings}
                selectedTaskIds={selectedTaskIds}
                currentStage={currentStage}
                onTaskSelectionChange={handleTaskSelection}
              />
            )}

            {currentStep === 2 && (
              <TaskDataCopyStep
                tasks={tasks.map(t => ({
                  ...t,
                  checklist_items: Array.isArray(t.checklist_items) ? t.checklist_items : []
                }))}
                selectedTaskIds={selectedTaskIds}
                mappings={mappings}
                onFieldDataSelect={handleFieldDataSelect}
              />
            )}

            {currentStep === 3 && (
              <RequiredFieldsStep
                currentStage={currentStage}
                nextStage={nextStage}
                formData={formData}
                copiedFieldData={copiedFieldData}
                domeValues={domeValues}
                onFieldChange={handleFieldChange}
              />
            )}
          </div>
        </div>

        <DialogFooter className="flex-col gap-2">
          {currentStep === 1 && !canProceed() && (
            <Alert variant="destructive" className="w-full">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="font-bold">Cannot Proceed</AlertTitle>
              <AlertDescription className="space-y-2">
                {tasks.filter(t => t.lifecycle_stage === currentStage).length === 0 ? (
                  <div>
                    <p className="font-medium mb-2">
                      No stage-specific tasks have been created for the <strong>{currentStage}</strong> stage.
                    </p>
                    <p className="text-sm">
                      Please create and complete the required tasks before proceeding.
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="font-medium mb-2">
                      The following required tasks for <strong>{currentStage}</strong> stage must be completed:
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-2 text-sm">
                      {tasks
                        .filter(t => t.lifecycle_stage === currentStage && t.status !== 'completed')
                        .map(task => (
                          <li key={task.id}>
                            <strong>{task.name}</strong> - Status: {task.status}
                          </li>
                        ))
                      }
                    </ul>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
          
          <div className="flex justify-between w-full">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>

            {currentStep < 3 ? (
              <Button onClick={handleNext} disabled={!canProceed()}>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                disabled={updateBatchMutation.isPending}
              >
                {updateBatchMutation.isPending ? (
                  "Updating..."
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Complete Transition
                  </>
                )}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
