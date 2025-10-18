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
  // Filter tasks that are tagged to the current lifecycle stage
  const stageSpecificTasks = tasks.filter(task => 
    task.lifecycle_stage === currentStage
  );
  
  const { completed, pending } = groupTasksByStatus(stageSpecificTasks);
  
  const incompleteTasks = pending;
  const hasIncompleteTasks = incompleteTasks.length > 0;
  const completionPercentage = stageSpecificTasks.length > 0 
    ? (completed.length / stageSpecificTasks.length) * 100 
    : 100;

  const hasIncompleteSelectedTasks = selectedTaskIds.some(id => {
    const task = stageSpecificTasks.find(t => t.id === id);
    return task && task.status !== 'completed';
  });

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Tasks Required for Current Stage</h3>
        <p className="text-sm text-muted-foreground">
          These tasks are tagged to the <strong>{currentStage}</strong> lifecycle stage and must be completed before transitioning.
        </p>
      </div>

      {/* Critical Warning for Incomplete Tasks */}
      {hasIncompleteTasks && (
        <Alert variant="destructive" className="border-2">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle className="font-bold">⚠️ Mandatory Tasks Incomplete</AlertTitle>
          <AlertDescription className="mt-2">
            <div className="space-y-2">
              <p className="font-medium">
                You have {incompleteTasks.length} incomplete task{incompleteTasks.length > 1 ? 's' : ''} for this stage:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                {incompleteTasks.map(task => (
                  <li key={task.id} className="text-sm">
                    <strong>{task.name}</strong> - Status: {task.status}
                  </li>
                ))}
              </ul>
              <p className="text-sm mt-2 font-semibold">
                ⚠️ All stage-specific tasks must be completed before you can proceed to the next stage.
              </p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Completion Progress */}
      {stageSpecificTasks.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Stage Task Completion</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {completed.length} of {stageSpecificTasks.length} tasks completed
              </span>
              <span className="font-semibold">{Math.round(completionPercentage)}%</span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
          </CardContent>
        </Card>
      )}

      {/* Info about task selection */}
      {stageSpecificTasks.length > 0 && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Select the tasks you want to associate with this stage transition. Data from completed tasks can be copied to batch records in the next step.
          </AlertDescription>
        </Alert>
      )}

      {hasIncompleteSelectedTasks && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Some selected tasks are not completed. You cannot proceed until all selected tasks are completed, or you deselect them.
          </AlertDescription>
        </Alert>
      )}

      {/* Incomplete Tasks - Show First */}
      {incompleteTasks.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-destructive" />
            Incomplete Tasks ({incompleteTasks.length}) - Action Required
          </h4>
          <div className="space-y-2 pl-6">
            {incompleteTasks.map(task => (
              <Card key={task.id} className="border-2 border-destructive/50 bg-destructive/5">
                <CardContent className="p-3">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id={`task-${task.id}`}
                      checked={selectedTaskIds.includes(task.id)}
                      onCheckedChange={(checked) => onTaskSelectionChange(task.id, checked as boolean)}
                      className="mt-1"
                    />
                    <div className="flex-1 space-y-2">
                      <Label
                        htmlFor={`task-${task.id}`}
                        className="text-sm font-semibold cursor-pointer block"
                      >
                        {task.name}
                      </Label>
                      {task.description && (
                        <p className="text-xs text-muted-foreground">{task.description}</p>
                      )}
                      <div className="flex gap-2 flex-wrap">
                        <Badge variant="destructive">
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

      {/* Completed Tasks */}
      {completed.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            Completed Tasks ({completed.length})
          </h4>
          <div className="space-y-2 pl-6">
            {completed.map(task => (
              <Card key={task.id} className="border-green-200 bg-green-50/50 dark:bg-green-950/20 dark:border-green-900">
                <CardContent className="p-3">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id={`task-${task.id}`}
                      checked={selectedTaskIds.includes(task.id)}
                      onCheckedChange={(checked) => onTaskSelectionChange(task.id, checked as boolean)}
                      className="mt-1"
                    />
                    <div className="flex-1 space-y-2">
                      <Label
                        htmlFor={`task-${task.id}`}
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

      {/* No tasks found for current stage */}
      {stageSpecificTasks.length === 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Stage-Specific Tasks Found</AlertTitle>
          <AlertDescription>
            No tasks are tagged to the <strong>{currentStage}</strong> lifecycle stage for this batch. 
            You can proceed to the next step.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
