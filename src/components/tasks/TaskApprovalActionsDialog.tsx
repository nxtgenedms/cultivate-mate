import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRoles, useIsAdmin } from '@/hooks/useUserRoles';
import { useUsersWithPermissions } from '@/hooks/useUserPermissions';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { CheckCircle, UserPlus, XCircle, ChevronDown } from 'lucide-react';

interface TaskApprovalActionsDialogProps {
  taskId: string;
  taskName: string;
  currentAssignee?: string;
  taskStatus?: string;
  approvalStatus?: string;
  checklistItems?: any[];
  completionProgress?: { completed: number; total: number };
  onSuccess?: () => void;
}

export function TaskApprovalActionsDialog({
  taskId,
  taskName,
  currentAssignee,
  taskStatus,
  approvalStatus,
  checklistItems = [],
  completionProgress = { completed: 0, total: 0 },
  onSuccess
}: TaskApprovalActionsDialogProps) {
  const { user } = useAuth();
  const { data: roles = [] } = useUserRoles();
  const isAdmin = useIsAdmin();
  const { data: users = [] } = useUsersWithPermissions();
  const queryClient = useQueryClient();

  const [showFullApprove, setShowFullApprove] = useState(false);
  const [showApproveNext, setShowApproveNext] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [remarks, setRemarks] = useState('');

  const currentUserProfile = users.find(u => u.id === user?.id);
  const currentUserRole = roles[0] || 'user';

  const canTakeAction = user?.id === currentAssignee || isAdmin;
  // Hide reject option only for in_progress tasks that are NOT in pending_approval state
  const shouldHideReject = taskStatus === 'in_progress' && approvalStatus !== 'pending_approval';
  const hasChecklistItems = checklistItems.length > 0;
  const allItemsCompleted = completionProgress.completed >= completionProgress.total;

  // Validation function for checklist items
  const validateChecklistItems = () => {
    if (hasChecklistItems && !allItemsCompleted) {
      toast.error("Cannot approve task", {
        description: "Please complete all checklist items first."
      });
      return false;
    }
    return true;
  };

  const actionMutation = useMutation({
    mutationFn: async (action: 'fully_approve' | 'approve_next' | 'reject') => {
      if (!user) throw new Error('Not authenticated');

      const now = new Date().toISOString();
      const approvalEntry = {
        action,
        user_id: user.id,
        user_name: currentUserProfile?.full_name || user.email || 'Unknown',
        role: currentUserRole,
        target_user_id: action !== 'fully_approve' ? selectedUserId : null,
        target_user_name: action !== 'fully_approve'
          ? users.find(u => u.id === selectedUserId)?.full_name || 'Unknown'
          : null,
        remarks: remarks || null,
        timestamp: now
      };

      // Get current approval history
      const { data: task } = await supabase
        .from('tasks')
        .select('approval_history')
        .eq('id', taskId)
        .single();

      const currentHistory = Array.isArray(task?.approval_history) ? task.approval_history : [];

      const updateData: any = {
        approval_history: [...currentHistory, approvalEntry] as any,
        updated_at: now
      };

      if (action === 'fully_approve') {
        updateData.approval_status = 'approved';
        updateData.status = 'completed';
      } else if (action === 'approve_next') {
        updateData.approval_status = 'pending_approval';
        updateData.status = 'pending';
        updateData.assignee = selectedUserId;
      } else if (action === 'reject') {
        updateData.approval_status = 'rejected';
        updateData.status = 'pending';
        updateData.assignee = selectedUserId;
        updateData.rejection_reason = remarks;
      }

      const { error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', taskId);

      if (error) throw error;
    },
    onSuccess: (_, action) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['batch-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-tasks'] });
      
      const messages = {
        fully_approve: 'Task fully approved and completed',
        approve_next: 'Task approved and forwarded to next approver',
        reject: 'Task rejected and reassigned'
      };
      
      toast.success(messages[action]);
      
      setShowFullApprove(false);
      setShowApproveNext(false);
      setShowReject(false);
      setSelectedUserId('');
      setRemarks('');
      onSuccess?.();
    },
    onError: (error) => {
      toast.error('Failed to process action', {
        description: error.message
      });
    }
  });

  if (!canTakeAction) {
    return null;
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="outline">
            Approval Actions
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onClick={() => {
            if (validateChecklistItems()) {
              setShowFullApprove(true);
            }
          }}>
            <CheckCircle className="mr-2 h-4 w-4" />
            Fully Approve
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => {
            if (validateChecklistItems()) {
              setShowApproveNext(true);
            }
          }}>
            <UserPlus className="mr-2 h-4 w-4" />
            Approve & Submit Next
          </DropdownMenuItem>
          {!shouldHideReject && (
            <DropdownMenuItem onClick={() => setShowReject(true)} className="text-destructive">
              <XCircle className="mr-2 h-4 w-4" />
              Reject & Assign Back
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Fully Approve Confirmation Dialog */}
      <AlertDialog open={showFullApprove} onOpenChange={setShowFullApprove}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Fully Approve Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to fully approve and complete this task?
              <div className="mt-3 p-3 bg-muted rounded-md">
                <p className="font-medium text-foreground">{taskName}</p>
              </div>
              This action will mark the task as completed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => actionMutation.mutate('fully_approve')}
              disabled={actionMutation.isPending}
            >
              Confirm Approval
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Approve & Submit Next Dialog */}
      <Dialog open={showApproveNext} onOpenChange={setShowApproveNext}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve & Submit to Next Approver</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Task</Label>
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm font-medium">{taskName}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Select Next Approver *</Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select user for next approval" />
                </SelectTrigger>
                <SelectContent>
                  {users
                    .filter(u => u.id !== user?.id)
                    .map(u => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.full_name} - {u.roles?.join(', ') || 'No role'}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Remarks (optional)</Label>
              <Textarea
                placeholder="Add any comments..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowApproveNext(false)}
              disabled={actionMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={() => actionMutation.mutate('approve_next')}
              disabled={!selectedUserId || actionMutation.isPending}
            >
              Approve & Forward
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject & Assign Back Dialog */}
      <Dialog open={showReject} onOpenChange={setShowReject}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject & Assign Back</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Task</Label>
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm font-medium">{taskName}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Assign Back To *</Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select user to reassign" />
                </SelectTrigger>
                <SelectContent>
                  {users.map(u => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.full_name} - {u.roles?.join(', ') || 'No role'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Rejection Reason *</Label>
              <Textarea
                placeholder="Please provide a reason for rejection..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowReject(false)}
              disabled={actionMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => actionMutation.mutate('reject')}
              disabled={!selectedUserId || !remarks || actionMutation.isPending}
            >
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
