import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Clock, AlertTriangle, ChevronDown, User, Calendar, ArrowRight } from "lucide-react";
import { groupTasksByStatus, TaskData, TaskFieldMapping } from "@/lib/taskFieldMapper";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

interface ChecklistTemplate {
  id: string;
  template_name: string;
  sof_number: string;
  lifecycle_phase: string;
  description?: string;
  isRequired?: boolean;
  isOptional?: boolean;
}

interface TaskValidationStepProps {
  tasks: TaskData[];
  mappings: TaskFieldMapping[];
  selectedTaskIds: string[];
  currentStage: string;
  batchId: string;
  checklistTemplates: ChecklistTemplate[];
  onTaskSelectionChange: (taskId: string, checked: boolean) => void;
}

export const TaskValidationStep = ({
  tasks,
  mappings,
  selectedTaskIds,
  currentStage,
  batchId,
  checklistTemplates,
  onTaskSelectionChange,
}: TaskValidationStepProps) => {
  const navigate = useNavigate();
  
  // Fetch user profiles for creator/completer names
  const { data: profiles = [] } = useQuery({
    queryKey: ['profiles-for-tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('is_active', true);
      
      if (error) throw error;
      return data || [];
    },
  });

  const getUserName = (userId: string | null | undefined) => {
    if (!userId) return 'Unknown';
    const profile = profiles.find(p => p.id === userId);
    return profile?.full_name || profile?.email || 'Unknown';
  };
  // 1. REQUIRED: Tasks tagged to the current lifecycle stage (MANDATORY)
  const stageSpecificTasks = tasks.filter(task => 
    task.lifecycle_stage === currentStage
  );
  
  // 2. OPTIONAL: All other batch tasks (can be selected if relevant)
  const otherBatchTasks = tasks.filter(task =>
    !task.lifecycle_stage || task.lifecycle_stage !== currentStage
  );
  
  const { completed: stageCompleted, pending: stagePending } = groupTasksByStatus(stageSpecificTasks);
  const { completed: otherCompleted, pending: otherPending } = groupTasksByStatus(otherBatchTasks);
  
  const hasNoStageTasksCreated = stageSpecificTasks.length === 0;
  const hasIncompleteStageTasks = stagePending.length > 0;
  const stageCompletionPercentage = stageSpecificTasks.length > 0 
    ? (stageCompleted.length / stageSpecificTasks.length) * 100 
    : 0;

  const hasIncompleteSelectedTasks = selectedTaskIds.some(id => {
    const task = tasks.find(t => t.id === id);
    return task && task.status !== 'completed';
  });

  // Check which checklists have tasks created
  const checklistStatus = checklistTemplates.map(template => {
    const tasksForChecklist = tasks.filter(t => 
      t.name.includes(template.sof_number) && t.batch_id === batchId
    );
    const completed = tasksForChecklist.filter(t => t.status === 'completed').length;
    return {
      template,
      tasksCreated: tasksForChecklist.length > 0,
      totalTasks: tasksForChecklist.length,
      completedTasks: completed,
      tasks: tasksForChecklist
    };
  });

  // Separate required and optional checklists
  const requiredChecklists = checklistStatus.filter(cs => cs.template.isRequired !== false && !cs.template.isOptional);
  const optionalChecklists = checklistStatus.filter(cs => cs.template.isOptional === true);

  const allBatchTasks = [...stageSpecificTasks, ...otherBatchTasks];

  const renderTaskCard = (task: TaskData) => {
    const isCompleted = task.status === 'completed';
    const completedItems = task.checklist_items?.filter((item: any) => item.completed).length || 0;
    const totalItems = task.checklist_items?.length || 0;
    
    return (
      <div key={task.id} className={`rounded border ${
        isCompleted 
          ? 'border-green-200 bg-green-50/30 dark:bg-green-950/10' 
          : 'border-orange-200 bg-orange-50/30 dark:bg-orange-950/10'
      }`}>
        <div className="p-2 space-y-2">
          {/* Task Header */}
          <div className="flex items-start gap-2">
            <Checkbox
              id={`task-${task.id}`}
              checked={selectedTaskIds.includes(task.id)}
              onCheckedChange={(checked) => onTaskSelectionChange(task.id, checked as boolean)}
              className="mt-1"
            />
            <div className="flex-1 min-w-0">
              {/* Task name and status on same line */}
              <div className="flex items-center gap-2 flex-wrap">
                <Label htmlFor={`task-${task.id}`} className="text-sm font-medium cursor-pointer">
                  {task.name}
                </Label>
                {isCompleted ? (
                  <Badge className="bg-green-600 text-xs flex-shrink-0">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Completed
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-orange-100 text-orange-800 text-xs flex-shrink-0">
                    <Clock className="h-3 w-3 mr-1" />
                    {task.status === 'in_progress' ? 'In Progress' : 'Pending'}
                  </Badge>
                )}
              </div>
              
              {/* Task Number Badge and Progress */}
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {task.task_number && (
                  <Badge variant="secondary" className="font-mono text-xs">
                    {task.task_number}
                  </Badge>
                )}
                {totalItems > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {completedItems}/{totalItems} items
                  </span>
                )}
              </div>

              {/* Creation & Completion Info */}
              <div className="mt-1 space-y-0.5 text-xs text-muted-foreground">
                {task.created_at && (
                  <div className="flex items-center gap-1 flex-wrap">
                    <Calendar className="h-3 w-3" />
                    <span>Created: {format(new Date(task.created_at), 'MMM dd, yyyy')}</span>
                    {task.created_by && (
                      <>
                        <span>by</span>
                        <User className="h-3 w-3 ml-1" />
                        <span>{getUserName(task.created_by)}</span>
                      </>
                    )}
                  </div>
                )}
                {isCompleted && task.updated_at && (
                  <div className="flex items-center gap-1 flex-wrap">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Completed: {format(new Date(task.updated_at), 'MMM dd, yyyy')}</span>
                    {task.assignee && (
                      <>
                        <span>by</span>
                        <User className="h-3 w-3 ml-1" />
                        <span>{getUserName(task.assignee)}</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Checklist Items */}
              {totalItems > 0 && (
                <Accordion type="single" collapsible className="mt-1">
                  <AccordionItem value="items" className="border-0">
                    <AccordionTrigger className="py-1 text-xs hover:no-underline">
                      View {totalItems} checklist item{totalItems !== 1 ? 's' : ''}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-1 mt-1">
                        {task.checklist_items?.map((item: any, idx: number) => (
                          <div key={idx} className="flex items-start gap-2 text-xs p-1 rounded bg-background/50">
                            <div className="mt-0.5">
                              {item.completed ? (
                                <CheckCircle2 className="h-3 w-3 text-green-600" />
                              ) : (
                                <Clock className="h-3 w-3 text-orange-600" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium">{item.label}</p>
                              {item.response_value && (
                                <p className="text-muted-foreground mt-0.5">
                                  Value: {item.response_value}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* ========== REQUIRED CHECKLISTS ========== */}
      {requiredChecklists.length > 0 && (
        <Card className="border-orange-500/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <CardTitle className="text-base">Required Checklists ({requiredChecklists.length})</CardTitle>
              </div>
              <Button 
                onClick={() => navigate('/tasks')} 
                variant="outline" 
                size="sm"
                className="gap-2"
              >
                Go to Task Page
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {requiredChecklists.map(({ template, tasksCreated, totalTasks, completedTasks }) => (
              <div key={template.id} className={`flex items-center justify-between p-2 rounded-md border ${
                !tasksCreated 
                  ? 'border-red-300 bg-red-50 dark:bg-red-950/20' 
                  : completedTasks === totalTasks
                  ? 'border-green-300 bg-green-50 dark:bg-green-950/20'
                  : 'border-orange-200 bg-orange-50 dark:bg-orange-950/10'
              }`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <p className="font-medium text-sm">{template.template_name}</p>
                    <p className="text-xs text-muted-foreground">({template.sof_number})</p>
                  </div>
                </div>
                {!tasksCreated ? (
                  <Badge variant="destructive" className="text-xs flex-shrink-0 ml-2">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Not Created
                  </Badge>
                ) : completedTasks === totalTasks ? (
                  <Badge className="bg-green-600 hover:bg-green-700 text-xs flex-shrink-0 ml-2">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    {completedTasks}/{totalTasks}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-orange-100 text-orange-800 dark:bg-orange-900 text-xs flex-shrink-0 ml-2">
                    <Clock className="h-3 w-3 mr-1" />
                    {completedTasks}/{totalTasks}
                  </Badge>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* ========== OPTIONAL CHECKLISTS ========== */}
      {optionalChecklists.length > 0 && (
        <Card className="border-blue-500/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-base">Optional Checklists ({optionalChecklists.length})</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {optionalChecklists.map(({ template, tasksCreated, totalTasks, completedTasks }) => (
              <div key={template.id} className={`flex items-center justify-between p-2 rounded-md border ${
                !tasksCreated 
                  ? 'border-blue-200 bg-blue-50 dark:bg-blue-950/20' 
                  : completedTasks === totalTasks
                  ? 'border-green-300 bg-green-50 dark:bg-green-950/20'
                  : 'border-orange-200 bg-orange-50 dark:bg-orange-950/10'
              }`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <p className="font-medium text-sm">{template.template_name}</p>
                    <p className="text-xs text-muted-foreground">({template.sof_number} - Optional)</p>
                  </div>
                </div>
                {!tasksCreated ? (
                  <Badge variant="secondary" className="text-xs flex-shrink-0 ml-2">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Not Created
                  </Badge>
                ) : completedTasks === totalTasks ? (
                  <Badge className="bg-green-600 hover:bg-green-700 text-xs flex-shrink-0 ml-2">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    {completedTasks}/{totalTasks}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-orange-100 text-orange-800 dark:bg-orange-900 text-xs flex-shrink-0 ml-2">
                    <Clock className="h-3 w-3 mr-1" />
                    {completedTasks}/{totalTasks}
                  </Badge>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* ========== BATCH TASKS ========== */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Batch Tasks</CardTitle>
            {stageSpecificTasks.length > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">{stageCompleted.length}/{stageSpecificTasks.length}</span>
                <Progress value={stageCompletionPercentage} className="h-2 w-20" />
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>

          {allBatchTasks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tasks associated with this batch.</p>
          ) : (
            <Accordion type="multiple" defaultValue={["stage-tasks"]} className="space-y-2">
              {/* Stage-Specific Tasks */}
              {stageSpecificTasks.length > 0 && (
                <AccordionItem value="stage-tasks" className="border rounded-md px-4">
                  <AccordionTrigger className="hover:no-underline py-3">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                      <span>Stage Tasks ({stageCompleted.length}/{stageSpecificTasks.length} completed)</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2 pb-3">
                    {[...stagePending, ...stageCompleted].map(task => renderTaskCard(task))}
                  </AccordionContent>
                </AccordionItem>
              )}

              {/* Other Batch Tasks */}
              {otherBatchTasks.length > 0 && (
                <AccordionItem value="other-tasks" className="border rounded-md px-4">
                  <AccordionTrigger className="hover:no-underline py-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <span>Other Tasks ({otherCompleted.length}/{otherBatchTasks.length} completed)</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2 pb-3">
                    {[...otherPending, ...otherCompleted].map(task => renderTaskCard(task))}
                  </AccordionContent>
                </AccordionItem>
              )}
            </Accordion>
          )}
        </CardContent>
      </Card>

    </div>
  );
};
