import { useState } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Loader2 } from 'lucide-react';
import { useApprovalWorkflows, useUpdateApprovalWorkflow, ApprovalWorkflow } from '@/hooks/useApprovalWorkflows';
import { ApprovalWorkflowDialog } from '@/components/admin/ApprovalWorkflowDialog';

export default function ApprovalWorkflows() {
  const { data: workflows, isLoading } = useApprovalWorkflows();
  const updateWorkflow = useUpdateApprovalWorkflow();
  const [selectedWorkflow, setSelectedWorkflow] = useState<ApprovalWorkflow | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleEdit = (workflow: ApprovalWorkflow) => {
    setSelectedWorkflow(workflow);
    setDialogOpen(true);
  };

  const handleSave = (stages: string[]) => {
    if (!selectedWorkflow) return;

    updateWorkflow.mutate({
      id: selectedWorkflow.id,
      stages,
    });
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Approval Workflows</h1>
          <p className="text-muted-foreground mt-2">
            Manage approval stages for different task categories
          </p>
        </div>

        <div className="grid gap-4">
          {workflows?.map((workflow) => (
            <Card key={workflow.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle>{workflow.category_display_name}</CardTitle>
                    <CardDescription>
                      Category: {workflow.task_category}
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(workflow)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium mb-2">
                      Approval Stages ({workflow.total_stages} total):
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {workflow.stages.map((stage, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Badge variant="secondary">
                            Stage {index + 1}: {stage}
                          </Badge>
                          {index < workflow.stages.length - 1 && (
                            <span className="text-muted-foreground">→</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <ApprovalWorkflowDialog
        workflow={selectedWorkflow}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSave}
      />
    </AdminLayout>
  );
}
