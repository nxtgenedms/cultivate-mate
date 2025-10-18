import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";
import { extractFieldsFromTask, ExtractedFieldData, TaskData, TaskFieldMapping } from "@/lib/taskFieldMapper";

interface TaskDataCopyStepProps {
  tasks: TaskData[];
  selectedTaskIds: string[];
  mappings: TaskFieldMapping[];
  onFieldDataSelect: (data: ExtractedFieldData[]) => void;
}

export const TaskDataCopyStep = ({
  tasks,
  selectedTaskIds,
  mappings,
  onFieldDataSelect,
}: TaskDataCopyStepProps) => {
  const selectedTasks = tasks.filter(task => 
    selectedTaskIds.includes(task.id) && task.status === 'completed'
  );

  const allExtractedData: Map<string, ExtractedFieldData[]> = new Map();

  selectedTasks.forEach(task => {
    const taskMapping = mappings.find(m => 
      task.name.includes(m.sof_number) || task.task_category === m.task_category
    );
    
    if (taskMapping) {
      const extracted = extractFieldsFromTask(task, taskMapping);
      if (extracted.length > 0) {
        allExtractedData.set(task.id, extracted);
      }
    }
  });

  const handleTaskDataSelection = (taskId: string, checked: boolean) => {
    if (checked) {
      const data = allExtractedData.get(taskId) || [];
      onFieldDataSelect(data);
    } else {
      onFieldDataSelect([]);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Copy Task Data (Optional)</h3>
        <p className="text-sm text-muted-foreground">
          If available, you can auto-fill form fields with data from completed tasks. This step is optional - you can skip it and manually enter all fields in the next step.
        </p>
      </div>

      {selectedTasks.length === 0 ? (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            No completed tasks selected. You can skip this step and manually fill the required fields.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-3">
          {selectedTasks.map(task => {
            const extractedData = allExtractedData.get(task.id);
            
            if (!extractedData || extractedData.length === 0) {
              return null;
            }

            return (
              <div key={task.id} className="border rounded-lg p-3 space-y-2">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id={`copy-${task.id}`}
                    onCheckedChange={(checked) => handleTaskDataSelection(task.id, checked as boolean)}
                  />
                  <div className="flex-1">
                    <Label htmlFor={`copy-${task.id}`} className="text-sm font-medium cursor-pointer">
                      {task.name}
                    </Label>
                    <Badge variant="outline" className="mt-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      {extractedData.length} field{extractedData.length !== 1 ? 's' : ''} available
                    </Badge>
                  </div>
                </div>

                <div className="pl-7 space-y-1">
                  <p className="text-xs text-muted-foreground">Available fields:</p>
                  <ul className="text-xs space-y-1">
                    {extractedData.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="font-mono bg-muted px-2 py-0.5 rounded">
                          {item.fieldName}
                        </span>
                        <span className="text-muted-foreground">
                          = {String(item.value)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedTasks.length > 0 && allExtractedData.size === 0 && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            No field mappings configured for the selected tasks. You can proceed to the next step and manually enter the required fields.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
