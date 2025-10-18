import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Clock, AlertTriangle, Info } from "lucide-react";
import { groupTasksByStatus, TaskData, TaskFieldMapping } from "@/lib/taskFieldMapper";
import { Progress } from "@/components/ui/progress";

interface TaskValidationStepProps {
  tasks: TaskData[];
  mappings: TaskFieldMapping[];
  selectedTaskIds: string[];
  currentStage: string;
  onTaskSelectionChange: (taskId: string, checked: boolean) => void;
}

export const TaskValidationStep = ({
  tasks,
  mappings,
  selectedTaskIds,
  currentStage,
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

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Task Validation & Selection</h3>
        <p className="text-sm text-muted-foreground">
          Review required stage-specific tasks and select any additional batch tasks relevant for this transition.
        </p>
      </div>

      {/* ========== SECTION 1: REQUIRED STAGE-SPECIFIC TASKS ========== */}
      <div className="space-y-4 border-2 border-primary/20 rounded-lg p-4 bg-primary/5">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-primary" />
          <h4 className="text-base font-bold">Required Tasks for {currentStage} Stage</h4>
        </div>

        {/* Critical Warning: No stage tasks created */}
        {hasNoStageTasksCreated && (
          <Alert variant="destructive" className="border-2">
            <AlertTriangle className="h-5 w-5" />
            <AlertTitle className="font-bold">🚫 No Required Tasks Created</AlertTitle>
            <AlertDescription className="mt-2">
              <div className="space-y-2">
                <p className="font-medium">
                  No tasks have been created for the <strong>{currentStage}</strong> lifecycle stage.
                </p>
                <p className="text-sm font-semibold">
                  ⚠️ You must create and complete all required stage-specific tasks before proceeding to the next stage.
                </p>
                <p className="text-sm mt-2">
                  Please close this dialog, create the required tasks for this stage, complete them, and try again.
                </p>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Warning: Incomplete stage tasks */}
        {!hasNoStageTasksCreated && hasIncompleteStageTasks && (
          <Alert variant="destructive" className="border-2">
            <AlertTriangle className="h-5 w-5" />
            <AlertTitle className="font-bold">⚠️ Mandatory Tasks Incomplete</AlertTitle>
            <AlertDescription className="mt-2">
              <div className="space-y-2">
                <p className="font-medium">
                  You have {stagePending.length} incomplete required task{stagePending.length > 1 ? 's' : ''}:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  {stagePending.map(task => (
                    <li key={task.id} className="text-sm">
                      <strong>{task.name}</strong> - Status: {task.status}
                    </li>
                  ))}
                </ul>
                <p className="text-sm mt-2 font-semibold">
                  ⚠️ Complete all stage-specific tasks before proceeding.
                </p>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Stage Task Progress */}
        {stageSpecificTasks.length > 0 && (
          <Card className="border-primary/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Required Task Completion Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {stageCompleted.length} of {stageSpecificTasks.length} required tasks completed
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
              <AlertCircle className="h-4 w-4 text-destructive" />
              Incomplete Required Tasks ({stagePending.length})
            </h5>
            <div className="space-y-2">
              {stagePending.map(task => (
                <Card key={task.id} className="border-2 border-destructive/50 bg-destructive/5">
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id={`stage-task-${task.id}`}
                        checked={selectedTaskIds.includes(task.id)}
                        onCheckedChange={(checked) => onTaskSelectionChange(task.id, checked as boolean)}
                        className="mt-1"
                        disabled
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
                          <Badge variant="destructive">
                            ⚠️ {task.status === 'in_progress' ? 'In Progress' : 'Not Started'}
                          </Badge>
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

        {/* Stage-Specific: Completed Tasks */}
        {stageCompleted.length > 0 && (
          <div className="space-y-2">
            <h5 className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              Completed Required Tasks ({stageCompleted.length})
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
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ========== SECTION 2: ALL BATCH TASKS (OPTIONAL) ========== */}
      {otherBatchTasks.length > 0 && (
        <div className="space-y-4 border border-muted rounded-lg p-4 bg-muted/30">
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5 text-muted-foreground" />
            <h4 className="text-base font-semibold">Other Batch Tasks (Optional Selection)</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            These are other tasks associated with this batch. You can optionally select them if they're relevant to this transition.
          </p>

          {/* Other: Pending Tasks */}
          {otherPending.length > 0 && (
            <div className="space-y-2">
              <h5 className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-600" />
                Pending Batch Tasks ({otherPending.length})
              </h5>
              <div className="space-y-2">
                {otherPending.map(task => (
                  <Card key={task.id} className="border-muted">
                    <CardContent className="p-3">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id={`other-task-${task.id}`}
                          checked={selectedTaskIds.includes(task.id)}
                          onCheckedChange={(checked) => onTaskSelectionChange(task.id, checked as boolean)}
                          className="mt-1"
                        />
                        <div className="flex-1 space-y-2">
                          <Label
                            htmlFor={`other-task-${task.id}`}
                            className="text-sm font-medium cursor-pointer block"
                          >
                            {task.name}
                          </Label>
                          <div className="flex gap-2 flex-wrap">
                            <Badge variant="outline" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                              {task.status === 'in_progress' ? 'In Progress' : 'Pending'}
                            </Badge>
                            {task.lifecycle_stage && (
                              <Badge variant="secondary" className="text-xs">
                                Stage: {task.lifecycle_stage}
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

          {/* Other: Completed Tasks */}
          {otherCompleted.length > 0 && (
            <div className="space-y-2">
              <h5 className="text-sm font-medium flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                Completed Batch Tasks ({otherCompleted.length})
              </h5>
              <div className="space-y-2">
                {otherCompleted.map(task => (
                  <Card key={task.id} className="border-muted">
                    <CardContent className="p-3">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id={`other-task-${task.id}`}
                          checked={selectedTaskIds.includes(task.id)}
                          onCheckedChange={(checked) => onTaskSelectionChange(task.id, checked as boolean)}
                          className="mt-1"
                        />
                        <div className="flex-1 space-y-2">
                          <Label
                            htmlFor={`other-task-${task.id}`}
                            className="text-sm font-medium cursor-pointer block"
                          >
                            {task.name}
                          </Label>
                          <div className="flex gap-2 flex-wrap">
                            <Badge className="bg-green-600 hover:bg-green-700">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Completed
                            </Badge>
                            {task.lifecycle_stage && (
                              <Badge variant="secondary" className="text-xs">
                                Stage: {task.lifecycle_stage}
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
        </div>
      )}

      {/* Selection Warning */}
      {hasIncompleteSelectedTasks && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Some selected tasks are not completed. You cannot proceed until all selected tasks are completed, or you deselect them.
          </AlertDescription>
        </Alert>
      )}

      {/* Info about next steps */}
      {!hasNoStageTasksCreated && !hasIncompleteStageTasks && (
        <Alert className="bg-green-50 dark:bg-green-950/20 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            ✅ All required stage-specific tasks are completed! Select any additional tasks you want to associate with this transition, then proceed to the next step.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
