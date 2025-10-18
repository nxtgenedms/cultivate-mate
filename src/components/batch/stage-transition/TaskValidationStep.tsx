import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Clock, AlertTriangle, Info } from "lucide-react";
import { groupTasksByStatus, TaskData, TaskFieldMapping } from "@/lib/taskFieldMapper";
import { Progress } from "@/components/ui/progress";

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

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Task Validation & Selection</h3>
        <p className="text-sm text-muted-foreground">
          Review required checklists and batch tasks before proceeding with the stage transition.
        </p>
      </div>

      {/* ========== SECTION 1: REQUIRED CHECKLISTS FOR CURRENT STAGE ========== */}
      <div className="space-y-4 border-2 border-orange-500/30 rounded-lg p-4 bg-orange-50/30 dark:bg-orange-950/20">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-600" />
          <h4 className="text-base font-bold">Required Checklists for {currentStage} Stage</h4>
        </div>
        
        <p className="text-sm text-muted-foreground">
          The following checklists are required for this stage. You must create and complete tasks for each checklist before proceeding.
        </p>

        {checklistTemplates.length === 0 ? (
          <Alert className="bg-muted">
            <Info className="h-4 w-4" />
            <AlertDescription>
              No checklists are required for the <strong>{currentStage}</strong> lifecycle stage.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-2">
            {checklistStatus.map(({ template, tasksCreated, totalTasks, completedTasks, tasks: checklistTasks }) => (
              <Card key={template.id} className={`border-2 ${
                !tasksCreated 
                  ? 'border-red-500 bg-red-50/50 dark:bg-red-950/20' 
                  : completedTasks === totalTasks
                  ? 'border-green-500 bg-green-50/50 dark:bg-green-950/20'
                  : 'border-orange-300 bg-orange-50/30 dark:bg-orange-950/20'
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h5 className="font-semibold">{template.template_name}</h5>
                      <p className="text-sm text-muted-foreground">{template.sof_number}</p>
                      {template.description && (
                        <p className="text-xs text-muted-foreground mt-1">{template.description}</p>
                      )}
                    </div>
                    <div>
                      {!tasksCreated ? (
                        <Badge variant="destructive" className="ml-2">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Not Created
                        </Badge>
                      ) : completedTasks === totalTasks ? (
                        <Badge className="bg-green-600 hover:bg-green-700 ml-2">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          All Completed ({completedTasks}/{totalTasks})
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-orange-100 text-orange-800 dark:bg-orange-900 ml-2">
                          <Clock className="h-3 w-3 mr-1" />
                          In Progress ({completedTasks}/{totalTasks})
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* ========== SECTION 2: BATCH TASKS (FOR SELECTION) ========== */}
      <div className="space-y-4 border-2 border-primary/20 rounded-lg p-4 bg-primary/5">
        <div className="flex items-center gap-2">
          <Info className="h-5 w-5 text-primary" />
          <h4 className="text-base font-bold">All Batch Tasks</h4>
        </div>
        
        <p className="text-sm text-muted-foreground">
          Select the tasks you want to associate with this stage transition. All selected tasks must be completed before proceeding.
        </p>

        {/* Stage Task Progress - Only show if tasks exist */}
        {stageSpecificTasks.length > 0 && (
          <Card className="border-primary/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Stage-Specific Task Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {stageCompleted.length} of {stageSpecificTasks.length} stage tasks completed
                </span>
                <span className="font-semibold">{Math.round(stageCompletionPercentage)}%</span>
              </div>
              <Progress value={stageCompletionPercentage} className="h-2" />
            </CardContent>
          </Card>
        )}

        {/* Stage-Specific: Incomplete Tasks */}
        {stagePending.length > 0 && (
          <div className="space-y-2">
            <h5 className="text-sm font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              Incomplete Stage Tasks ({stagePending.length})
            </h5>
            <div className="space-y-2">
              {stagePending.map(task => (
                <Card key={task.id} className="border-2 border-orange-200 bg-orange-50/30 dark:bg-orange-950/20 dark:border-orange-900">
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id={`stage-task-${task.id}`}
                        checked={selectedTaskIds.includes(task.id)}
                        onCheckedChange={(checked) => onTaskSelectionChange(task.id, checked as boolean)}
                        className="mt-1"
                      />
                      <div className="flex-1 space-y-2">
                        <Label
                          htmlFor={`stage-task-${task.id}`}
                          className="text-sm font-semibold cursor-pointer block"
                        >
                          {task.name}
                        </Label>
                        {task.description && (
                          <p className="text-xs text-muted-foreground">{task.description}</p>
                        )}
                        <div className="flex gap-2 flex-wrap">
                          <Badge variant="outline" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                            {task.status === 'in_progress' ? 'In Progress' : 'Not Started'}
                          </Badge>
                          {task.task_category && (
                            <Badge variant="outline" className="text-xs">
                              {task.task_category}
                            </Badge>
                          )}
                          {task.due_date && (
                            <Badge variant="outline" className="text-xs">
                              Due: {new Date(task.due_date).toLocaleDateString()}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Stage-Specific: Completed Tasks */}
        {stageCompleted.length > 0 && (
          <div className="space-y-2">
            <h5 className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              Completed Stage Tasks ({stageCompleted.length})
            </h5>
            <div className="space-y-2">
              {stageCompleted.map(task => (
                <Card key={task.id} className="border-green-200 bg-green-50/50 dark:bg-green-950/20 dark:border-green-900">
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id={`stage-task-${task.id}`}
                        checked={selectedTaskIds.includes(task.id)}
                        onCheckedChange={(checked) => onTaskSelectionChange(task.id, checked as boolean)}
                        className="mt-1"
                      />
                      <div className="flex-1 space-y-2">
                        <Label
                          htmlFor={`stage-task-${task.id}`}
                          className="text-sm font-medium cursor-pointer block"
                        >
                          {task.name}
                        </Label>
                        <div className="flex gap-2 flex-wrap">
                          <Badge className="bg-green-600 hover:bg-green-700">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Completed
                          </Badge>
                          {task.approval_status === 'approved' && (
                            <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                              Approved
                            </Badge>
                          )}
                          {task.task_category && (
                            <Badge variant="outline" className="text-xs">
                              {task.task_category}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Other Batch Tasks */}
        {otherBatchTasks.length > 0 && (
          <>
            <div className="border-t pt-4 mt-4">
              <h5 className="text-sm font-medium mb-2">Other Batch Tasks (Optional)</h5>
              <p className="text-xs text-muted-foreground mb-3">
                These tasks are not tagged to this specific stage but are associated with the batch.
              </p>
            </div>

            {/* Other: Pending Tasks */}
            {otherPending.length > 0 && (
              <div className="space-y-2">
                <h6 className="text-xs font-medium flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  Pending ({otherPending.length})
                </h6>
                <div className="space-y-2">
                  {otherPending.map(task => (
                    <Card key={task.id} className="border-muted">
                      <CardContent className="p-2">
                        <div className="flex items-start gap-2">
                          <Checkbox
                            id={`other-task-${task.id}`}
                            checked={selectedTaskIds.includes(task.id)}
                            onCheckedChange={(checked) => onTaskSelectionChange(task.id, checked as boolean)}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <Label
                              htmlFor={`other-task-${task.id}`}
                              className="text-xs font-medium cursor-pointer block"
                            >
                              {task.name}
                            </Label>
                            <div className="flex gap-1 flex-wrap mt-1">
                              <Badge variant="outline" className="text-xs bg-orange-100 text-orange-800 dark:bg-orange-900">
                                {task.status === 'in_progress' ? 'In Progress' : 'Pending'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Other: Completed Tasks */}
            {otherCompleted.length > 0 && (
              <div className="space-y-2">
                <h6 className="text-xs font-medium flex items-center gap-2 text-muted-foreground">
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                  Completed ({otherCompleted.length})
                </h6>
                <div className="space-y-2">
                  {otherCompleted.map(task => (
                    <Card key={task.id} className="border-muted">
                      <CardContent className="p-2">
                        <div className="flex items-start gap-2">
                          <Checkbox
                            id={`other-task-${task.id}`}
                            checked={selectedTaskIds.includes(task.id)}
                            onCheckedChange={(checked) => onTaskSelectionChange(task.id, checked as boolean)}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <Label
                              htmlFor={`other-task-${task.id}`}
                              className="text-xs font-medium cursor-pointer block"
                            >
                              {task.name}
                            </Label>
                            <div className="flex gap-1 flex-wrap mt-1">
                              <Badge className="text-xs bg-green-600 hover:bg-green-700">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Completed
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Selection Warning - Only for selected incomplete tasks */}
      {hasIncompleteSelectedTasks && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Some selected tasks are not completed. You cannot proceed until all selected tasks are completed, or you deselect them.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
