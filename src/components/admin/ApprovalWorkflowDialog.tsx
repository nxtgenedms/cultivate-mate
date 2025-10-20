import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';
import { ApprovalWorkflow } from '@/hooks/useApprovalWorkflows';

interface ApprovalWorkflowDialogProps {
  workflow: ApprovalWorkflow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (stages: string[]) => void;
}

export const ApprovalWorkflowDialog = ({
  workflow,
  open,
  onOpenChange,
  onSave,
}: ApprovalWorkflowDialogProps) => {
  const [stages, setStages] = useState<string[]>(workflow?.stages || []);

  const handleAddStage = () => {
    setStages([...stages, '']);
  };

  const handleRemoveStage = (index: number) => {
    setStages(stages.filter((_, i) => i !== index));
  };

  const handleStageChange = (index: number, value: string) => {
    const newStages = [...stages];
    newStages[index] = value;
    setStages(newStages);
  };

  const handleSave = () => {
    const validStages = stages.filter(s => s.trim() !== '');
    if (validStages.length === 0) {
      return;
    }
    onSave(validStages);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Approval Workflow</DialogTitle>
          <DialogDescription>
            {workflow?.category_display_name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Approval Stages (in order)</Label>
            <p className="text-sm text-muted-foreground">
              Define the approval stages in the order they should be completed.
            </p>
          </div>

          {stages.map((stage, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground w-8">
                    {index + 1}.
                  </span>
                  <Input
                    value={stage}
                    onChange={(e) => handleStageChange(index, e.target.value)}
                    placeholder="e.g., Grower, Manager, QA"
                  />
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveStage(index)}
                disabled={stages.length === 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddStage}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Stage
          </Button>

          <div className="bg-muted p-3 rounded-lg text-sm">
            <p className="font-medium mb-1">Stage Naming Guide:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Assistant Grower - For assistant grower role</li>
              <li>Grower - For grower role</li>
              <li>Manager - For manager role</li>
              <li>Supervisor - For supervisor role</li>
              <li>QA - For quality assurance role</li>
              <li>Grower/Manager - For either grower or manager</li>
              <li>Staff - For assistant growers and growers</li>
              <li>Performer - For task performers</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={stages.filter(s => s.trim()).length === 0}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
