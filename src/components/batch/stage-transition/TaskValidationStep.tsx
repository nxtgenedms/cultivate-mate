import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Clock, AlertTriangle, ChevronDown } from "lucide-react";
import { groupTasksByStatus, TaskData, TaskFieldMapping } from "@/lib/taskFieldMapper";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface ChecklistTemplate {
  id: string;
  template_name: string;
  sof_number: string;
  lifecycle_phase: string;
  description?: string;
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

  const allBatchTasks = [...stageSpecificTasks, ...otherBatchTasks];

  return (
    <div className="space-y-4">
      {/* ========== REQUIRED CHECKLISTS ========== */}
      <Card className="border-orange-500/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <CardTitle className="text-base">Required Checklists ({checklistTemplates.length})</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {checklistTemplates.length === 0 ? (
            <p className="text-sm text-muted-foreground">No checklists required for {currentStage} stage.</p>
          ) : (
            checklistStatus.map(({ template, tasksCreated, totalTasks, completedTasks }) => (
              <div key={template.id} className={`flex items-center justify-between p-3 rounded-md border ${
                !tasksCreated 
                  ? 'border-red-300 bg-red-50 dark:bg-red-950/20' 
                  : completedTasks === totalTasks
                  ? 'border-green-300 bg-green-50 dark:bg-green-950/20'
                  : 'border-orange-200 bg-orange-50 dark:bg-orange-950/10'
              }`}>
                <div className="flex-1">
                  <p className="font-medium text-sm">{template.template_name}</p>
                  <p className="text-xs text-muted-foreground">{template.sof_number}</p>
                </div>
                {!tasksCreated ? (
                  <Badge variant="destructive" className="text-xs">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Not Created
                  </Badge>
                ) : completedTasks === totalTasks ? (
                  <Badge className="bg-green-600 hover:bg-green-700 text-xs">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    {completedTasks}/{totalTasks}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-orange-100 text-orange-800 dark:bg-orange-900 text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    {completedTasks}/{totalTasks}
                  </Badge>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>

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
                    {[...stagePending, ...stageCompleted].map(task => (
                      <div key={task.id} className={`flex items-center gap-2 p-2 rounded border ${
                        task.status === 'completed' 
                          ? 'border-green-200 bg-green-50/30 dark:bg-green-950/10' 
                          : 'border-orange-200 bg-orange-50/30 dark:bg-orange-950/10'
                      }`}>
                        <Checkbox
                          id={`task-${task.id}`}
                          checked={selectedTaskIds.includes(task.id)}
                          onCheckedChange={(checked) => onTaskSelectionChange(task.id, checked as boolean)}
                        />
                        <Label htmlFor={`task-${task.id}`} className="flex-1 text-sm cursor-pointer">
                          {task.name}
                        </Label>
                        {task.status === 'completed' ? (
                          <Badge className="bg-green-600 text-xs">
                            <CheckCircle2 className="h-3 w-3" />
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-orange-100 text-orange-800 text-xs">
                            <Clock className="h-3 w-3" />
                          </Badge>
                        )}
                      </div>
                    ))}
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
                    {[...otherPending, ...otherCompleted].map(task => (
                      <div key={task.id} className={`flex items-center gap-2 p-2 rounded border ${
                        task.status === 'completed' 
                          ? 'border-green-200 bg-green-50/30 dark:bg-green-950/10' 
                          : 'border-muted'
                      }`}>
                        <Checkbox
                          id={`task-${task.id}`}
                          checked={selectedTaskIds.includes(task.id)}
                          onCheckedChange={(checked) => onTaskSelectionChange(task.id, checked as boolean)}
                        />
                        <Label htmlFor={`task-${task.id}`} className="flex-1 text-sm cursor-pointer">
                          {task.name}
                        </Label>
                        {task.status === 'completed' ? (
                          <Badge className="bg-green-600 text-xs">
                            <CheckCircle2 className="h-3 w-3" />
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            <Clock className="h-3 w-3" />
                          </Badge>
                        )}
                      </div>
                    ))}
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
