import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CheckCircle2, XCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface TaskApprovalActionsProps {
  taskId: string;
  taskName: string;
  currentStage: number;
  totalStages: number;
  onSuccess?: () => void;
}

export const TaskApprovalActions = ({
  taskId,
  taskName,
  currentStage,
  totalStages,
  onSuccess,
}: TaskApprovalActionsProps) => {
  const queryClient = useQueryClient();
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const approveMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Fetch current task to get approval history
      const { data: task, error: fetchError } = await supabase
        .from("tasks")
        .select("approval_history")
        .eq("id", taskId)
        .single();

      if (fetchError) throw fetchError;

      const newStage = currentStage + 1;
      const isFullyApproved = newStage >= totalStages;

      const approvalHistory = Array.isArray(task?.approval_history) ? task.approval_history : [];
      const newHistory = [
        ...approvalHistory,
        {
          stage: currentStage + 1,
          approved_by: user.id,
          approved_at: new Date().toISOString(),
          action: "approved",
        },
      ];

        const { error } = await supabase
          .from("tasks")
          .update({
            current_approval_stage: newStage,
            status: isFullyApproved ? "completed" : "pending_approval",
            approval_history: newHistory,
          })
          .eq("id", taskId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Task Approved",
        description: `You have approved "${taskName}"`,
      });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast({
        title: "Approval Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async () => {
      if (!rejectionReason.trim()) {
        throw new Error("Rejection reason is required");
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Fetch current task to get approval history
      const { data: task, error: fetchError } = await supabase
        .from("tasks")
        .select("approval_history")
        .eq("id", taskId)
        .single();

      if (fetchError) throw fetchError;

      const approvalHistory = Array.isArray(task?.approval_history) ? task.approval_history : [];
      const newHistory = [
        ...approvalHistory,
        {
          stage: currentStage + 1,
          rejected_by: user.id,
          rejected_at: new Date().toISOString(),
          action: "rejected",
          reason: rejectionReason,
        },
      ];

      const { error} = await supabase
        .from("tasks")
        .update({
          status: "rejected",
          rejection_reason: rejectionReason,
          approval_history: newHistory,
        })
        .eq("id", taskId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Task Rejected",
        description: `You have rejected "${taskName}"`,
      });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setShowRejectDialog(false);
      setRejectionReason("");
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast({
        title: "Rejection Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <>
      <div className="flex gap-2">
        <Button
          onClick={() => approveMutation.mutate()}
          disabled={approveMutation.isPending}
          className="flex-1"
        >
          <CheckCircle2 className="mr-2 h-4 w-4" />
          Approve
        </Button>
        <Button
          variant="destructive"
          onClick={() => setShowRejectDialog(true)}
          disabled={rejectMutation.isPending}
          className="flex-1"
        >
          <XCircle className="mr-2 h-4 w-4" />
          Reject
        </Button>
      </div>

      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Task</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason for rejecting this task. The task will be
              sent back to the creator.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Enter rejection reason..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => rejectMutation.mutate()}
              disabled={!rejectionReason.trim() || rejectMutation.isPending}
            >
              Confirm Rejection
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
