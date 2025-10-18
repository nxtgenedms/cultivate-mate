import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { groupTasksByStatus, TaskData, TaskFieldMapping } from "@/lib/taskFieldMapper";

interface TaskValidationStepProps {
  tasks: TaskData[];
  mappings: TaskFieldMapping[];
  selectedTaskIds: string[];
  onTaskSelectionChange: (taskId: string, checked: boolean) => void;
}

export const TaskValidationStep = ({
  tasks,
  mappings,
  selectedTaskIds,
  onTaskSelectionChange,
}: TaskValidationStepProps) => {
  // Show ALL tasks for this batch (mappings are only used for optional data copying later)
  const { completed, pending } = groupTasksByStatus(tasks);

  const hasIncompleteSelectedTasks = selectedTaskIds.some(id => {
    const task = tasks.find(t => t.id === id);
    return task && task.status !== 'completed';
  });

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Task Validation</h3>
        <p className="text-sm text-muted-foreground">
          Select which tasks are relevant for this stage transition. Tasks marked as incomplete will show a warning.
        </p>
      </div>

      {hasIncompleteSelectedTasks && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Some selected tasks are not completed. Please complete them before proceeding, or deselect them to continue.
          </AlertDescription>
        </Alert>
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
              <div key={task.id} className="flex items-start gap-3 p-2 rounded-lg border bg-muted/30">
                <Checkbox
                  id={`task-${task.id}`}
                  checked={selectedTaskIds.includes(task.id)}
                  onCheckedChange={(checked) => onTaskSelectionChange(task.id, checked as boolean)}
                />
                <div className="flex-1">
                  <Label
                    htmlFor={`task-${task.id}`}
                    className="text-sm font-medium cursor-pointer"
                  >
                    {task.name}
                  </Label>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
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
            ))}
          </div>
        </div>
      )}

      {/* Pending Tasks */}
      {pending.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Clock className="h-4 w-4 text-orange-600" />
            Pending Tasks ({pending.length})
          </h4>
          <div className="space-y-2 pl-6">
            {pending.map(task => (
              <div key={task.id} className="flex items-start gap-3 p-2 rounded-lg border bg-muted/30">
                <Checkbox
                  id={`task-${task.id}`}
                  checked={selectedTaskIds.includes(task.id)}
                  onCheckedChange={(checked) => onTaskSelectionChange(task.id, checked as boolean)}
                />
                <div className="flex-1">
                  <Label
                    htmlFor={`task-${task.id}`}
                    className="text-sm font-medium cursor-pointer"
                  >
                    {task.name}
                  </Label>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="outline" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                      {task.status === 'in_progress' ? 'In Progress' : 'Pending'}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tasks.length === 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No tasks found for this batch.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
