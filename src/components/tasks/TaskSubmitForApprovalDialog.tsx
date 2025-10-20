import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRoles } from '@/hooks/useUserRoles';
import { useUsersWithPermissions } from '@/hooks/useUserPermissions';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { CheckCircle, Send } from 'lucide-react';

interface TaskSubmitForApprovalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskId: string;
  taskName: string;
  onSuccess?: () => void;
}

export function TaskSubmitForApprovalDialog({
  open,
  onOpenChange,
  taskId,
  taskName,
  onSuccess
}: TaskSubmitForApprovalDialogProps) {
  const { user } = useAuth();
  const { data: roles = [] } = useUserRoles();
  const { data: users = [] } = useUsersWithPermissions();
  
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [remarks, setRemarks] = useState('');
  const queryClient = useQueryClient();

  const currentUserProfile = users.find(u => u.id === user?.id);
  const currentUserRole = roles[0] || 'user';

  const submitMutation = useMutation({
    mutationFn: async (action: 'self_approve' | 'submit_to_other') => {
      if (!user) throw new Error('Not authenticated');

      const now = new Date().toISOString();
      const approvalEntry = {
        action: action === 'self_approve' ? 'completed' : 'submitted',
        user_id: user.id,
        user_name: currentUserProfile?.full_name || user.email || 'Unknown',
        role: currentUserRole,
        target_user_id: action === 'submit_to_other' ? selectedUserId : null,
        target_user_name: action === 'submit_to_other' 
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

      if (action === 'self_approve') {
        updateData.approval_status = 'approved';
        updateData.status = 'completed';
      } else {
        updateData.approval_status = 'pending_approval';
        updateData.status = 'pending';
        updateData.assignee = selectedUserId;
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
      
      toast.success(
        action === 'self_approve' 
          ? 'Task completed successfully' 
          : 'Task submitted for approval'
      );
      
      onOpenChange(false);
      setSelectedUserId('');
      setRemarks('');
      onSuccess?.();
    },
    onError: (error) => {
      toast.error('Failed to submit task', {
        description: error.message
      });
    }
  });

  const handleSelfApprove = () => {
    submitMutation.mutate('self_approve');
  };

  const handleSubmitToOther = () => {
    if (!selectedUserId) {
      toast.error('Please select a user');
      return;
    }
    submitMutation.mutate('submit_to_other');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Submit for Approval</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Current User Info */}
          <div className="space-y-2">
            <Label>Current User</Label>
            <div className="p-3 bg-muted rounded-md">
              <p className="font-medium">{currentUserProfile?.full_name || user?.email}</p>
              <p className="text-sm text-muted-foreground capitalize">{currentUserRole.replace('_', ' ')}</p>
            </div>
          </div>

          {/* Task Info */}
          <div className="space-y-2">
            <Label>Task</Label>
            <div className="p-3 bg-muted rounded-md">
              <p className="text-sm font-medium">{taskName}</p>
            </div>
          </div>

          {/* Select User for Submission */}
          <div className="space-y-2">
            <Label>Submit to User (optional)</Label>
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger>
                <SelectValue placeholder="Select user for approval" />
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

          {/* Remarks */}
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

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="secondary"
            onClick={handleSelfApprove}
            disabled={submitMutation.isPending}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Self Approve & Complete
          </Button>
          <Button
            onClick={handleSubmitToOther}
            disabled={!selectedUserId || submitMutation.isPending}
          >
            <Send className="mr-2 h-4 w-4" />
            Submit to Selected User
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
