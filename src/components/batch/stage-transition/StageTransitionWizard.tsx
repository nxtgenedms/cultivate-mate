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
import { STAGE_LABELS } from "@/lib/batchUtils";

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
        .select('id, name, status, description, due_date, lifecycle_stage, task_category, approval_status, batch_id, checklist_items, created_at, updated_at, created_by, assignee')
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

  // Fetch checklist templates for current stage
  const { data: checklistTemplates = [] } = useQuery({
    queryKey: ['checklist-templates-stage', currentStage],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('checklist_templates')
        .select('*')
        .eq('lifecycle_phase', currentStage)
        .eq('is_active', true);
      
      if (error) {
        console.warn('Failed to fetch checklist templates:', error);
        return [];
      }
      
      return data || [];
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

  // Fetch batch details for auto-calculations
  const { data: batchDetails } = useQuery({
    queryKey: ['batch-detail', batchId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('batch_lifecycle_records')
        .select('*')
        .eq('id', batchId)
        .single();
      
      if (error) throw error;
      return data;
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
    
    // Auto-fill form data with proper formatting
    const newFormData = { ...formData };
    data.forEach(item => {
      let value = item.value;
      
      // If value looks like a datetime string, extract just the date part
      if (typeof value === 'string' && value.includes('T')) {
        value = value.split('T')[0];
      }
      
      newFormData[item.fieldName] = value;
    });
    setFormData(newFormData);
  };

  const handleFieldChange = (field: string, value: any) => {
    const newFormData = { ...formData, [field]: value };
    
    // Auto-calculate Clonator 1 No of Days when relevant dates change
    if (currentStage === 'clone_germination' && nextStage === 'hardening' && batchDetails) {
      if (field === 'move_to_hardening_date' || field === 'clonator_2_no_of_days') {
        const hardeningDate = field === 'move_to_hardening_date' ? value : newFormData.move_to_hardening_date;
        const germinationDate = batchDetails.clone_germination_date;
        
        if (hardeningDate && germinationDate) {
          const days = Math.floor(
            (new Date(hardeningDate).getTime() - new Date(germinationDate).getTime()) / (1000 * 60 * 60 * 24)
          );
          newFormData.clonator_2_no_of_days = days;
        }
      }
    }
    
    setFormData(newFormData);
  };

  const handleNext = () => {
    if (currentStep < 3) {
      const nextStep = currentStep + 1;
      
      // Auto-calculate hardening_number_clones when moving to step 3 for clone_germination -> hardening
      if (nextStep === 3 && currentStage === 'clone_germination' && nextStage === 'hardening' && batchDetails) {
        const totalClones = batchDetails.total_clones_plants || 0;
        const mortalities = formData.clonator_mortalities || 0;
        const calculatedHardeningClones = totalClones - mortalities;
        
        // Only set if not already set by user
        if (!formData.hardening_number_clones) {
          setFormData(prev => ({
            ...prev,
            hardening_number_clones: calculatedHardeningClones
          }));
        }
      }
      
      setCurrentStep(nextStep);
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
      // Check if any checklist templates exist for this stage but tasks haven't been created
      const missingChecklists = checklistTemplates.filter(template => {
        // Check if any tasks exist for this template's SOF number and batch
        const tasksForTemplate = tasks.filter(t => 
          t.name.includes(template.sof_number) && t.batch_id === batchId
        );
        return tasksForTemplate.length === 0;
      });

      // Block if checklist templates exist but no tasks created for them
      if (missingChecklists.length > 0) {
        return false;
      }

      // Filter tasks by current stage
      const stageSpecificTasks = tasks.filter(t => t.lifecycle_stage === currentStage);
      
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
            Stage Transition: {currentStage === 'clone_germination' && nextStage === 'hardening' 
              ? 'Germination(Clonator1) → Hardening(Clonator2)' 
              : `${STAGE_LABELS[currentStage as keyof typeof STAGE_LABELS] || currentStage} → ${STAGE_LABELS[nextStage as keyof typeof STAGE_LABELS] || nextStage}`}
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
                batchId={batchId}
                checklistTemplates={checklistTemplates}
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
              <AlertDescription>
                {(() => {
                  // Check for missing checklist tasks first
                  const missingChecklists = checklistTemplates.filter(template => {
                    const tasksForTemplate = tasks.filter(t => 
                      t.name.includes(template.sof_number) && t.batch_id === batchId
                    );
                    return tasksForTemplate.length === 0;
                  });

                  if (missingChecklists.length > 0) {
                    const checklistNames = missingChecklists.map(t => `${t.template_name} (${t.sof_number})`).join(', ');
                    return `Required checklists for ${currentStage} stage have not been created yet. Please create tasks for: ${checklistNames}`;
                  }

                  // Check for incomplete stage tasks
                  const incompleteStageTasks = tasks.filter(
                    t => t.lifecycle_stage === currentStage && t.status !== 'completed'
                  );

                  if (incompleteStageTasks.length > 0) {
                    const taskCount = incompleteStageTasks.length;
                    return `${taskCount} required task${taskCount > 1 ? 's' : ''} for ${currentStage} stage must be completed before proceeding.`;
                  }

                  return null;
                })()}
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
