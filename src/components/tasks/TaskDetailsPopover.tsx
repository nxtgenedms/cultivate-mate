import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FileCheck, User, Calendar } from "lucide-react";
import { format } from "date-fns";

interface TaskDetailsPopoverContentProps {
  task: any;
}

export const TaskDetailsPopoverContent = ({ task }: TaskDetailsPopoverContentProps) => {
  // Fetch user names for approval history
  const userIds = new Set<string>();
  if (task.approval_history) {
    task.approval_history.forEach((history: any) => {
      if (history.submitted_by) userIds.add(history.submitted_by);
      if (history.approved_by) userIds.add(history.approved_by);
      if (history.rejected_by) userIds.add(history.rejected_by);
      if (history.approver_id) userIds.add(history.approver_id);
    });
  }

  const { data: usersMap } = useQuery({
    queryKey: ['approval-history-users', Array.from(userIds)],
    queryFn: async () => {
      if (userIds.size === 0) return {};
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', Array.from(userIds));
      
      if (error) throw error;
      
      const map: Record<string, string> = {};
      data?.forEach(user => {
        map[user.id] = user.full_name;
      });
      return map;
    },
    enabled: userIds.size > 0,
  });

  const getUserName = (userId: string | undefined) => {
    if (!userId) return 'Unknown';
    return usersMap?.[userId] || 'Loading...';
  };

  return (
    <div className="space-y-3">
      <h4 className="font-semibold text-sm border-b pb-2">Task Details</h4>
      
      {task.batch?.batch_number && (
        <div className="flex items-start gap-2 text-sm">
          <FileCheck className="h-4 w-4 text-muted-foreground mt-0.5" />
          <div>
            <span className="font-medium">Batch:</span>
            <p className="text-muted-foreground">{task.batch.batch_number}</p>
          </div>
        </div>
      )}
      
      {task.creator && (
        <div className="flex items-start gap-2 text-sm">
          <User className="h-4 w-4 text-muted-foreground mt-0.5" />
          <div>
            <span className="font-medium">Created by:</span>
            <p className="text-muted-foreground">
              {task.creator.full_name} on {format(new Date(task.created_at), "PPP")}
            </p>
          </div>
        </div>
      )}
      
      {task.assigned_to && (
        <div className="flex items-start gap-2 text-sm">
          <User className="h-4 w-4 text-muted-foreground mt-0.5" />
          <div>
            <span className="font-medium">Assigned to:</span>
            <p className="text-muted-foreground">
              {task.assigned_to.full_name} on {format(new Date(task.updated_at), "PPP")}
            </p>
          </div>
        </div>
      )}
      
      {task.approval_history && task.approval_history.length > 0 && (
        <div className="border-t pt-3 space-y-2">
          <h5 className="font-medium text-sm">Workflow History</h5>
          {task.approval_history.map((history: any, index: number) => (
            <div key={index} className="flex items-start gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <span className="font-medium capitalize">{history.action}:</span>
                <p className="text-muted-foreground">
                  {history.action === 'submitted' && (
                    <>
                      Submitted by {getUserName(history.submitted_by)}
                      {history.submitted_at && ` on ${format(new Date(history.submitted_at), "PPP")}`}
                    </>
                  )}
                  {history.action === 'approved' && (
                    <>
                      Approved by {getUserName(history.approved_by)} at stage {history.stage}
                      {history.approved_at && ` on ${format(new Date(history.approved_at), "PPP")}`}
                    </>
                  )}
                  {history.action === 'rejected' && (
                    <>
                      Rejected by {getUserName(history.rejected_by)} at stage {history.stage}
                      {history.rejected_at && ` on ${format(new Date(history.rejected_at), "PPP")}`}
                    </>
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
