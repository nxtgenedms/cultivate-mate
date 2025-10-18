import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BatchLayout } from '@/components/BatchLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BatchProgressTimeline } from '@/components/batch/BatchProgressTimeline';
import { BatchDetailAccordions } from '@/components/batch/BatchDetailAccordions';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Edit, TrendingUp, Calendar, Users, Package, ListChecks, Clock, Info, FileText } from 'lucide-react';
import { generateBatchRecordPDF } from '@/lib/batchPdfGenerator';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TaskDetailsPopoverContent } from '@/components/tasks/TaskDetailsPopover';
import { TaskApprovalActions } from '@/components/tasks/TaskApprovalActions';
import { ApprovalProgressBadge } from '@/components/tasks/ApprovalProgressBadge';
import { TaskItemsManager } from '@/components/tasks/TaskItemsManager';
import { toast } from 'sonner';
import { useUserRoles } from '@/hooks/useUserRoles';
import { getApprovalWorkflow, TASK_CATEGORIES, TaskCategory, getCategoryColor, canUserApprove } from '@/lib/taskCategoryUtils';
import { 
  getStageColor, 
  getStageIcon, 
  getStageLabel, 
  getStatusColor,
  formatBatchNumber
} from '@/lib/batchUtils';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

export default function BatchDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  
  const [showItemsDialog, setShowItemsDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [taskToSubmit, setTaskToSubmit] = useState<string | null>(null);
  
  const queryClient = useQueryClient();
  const userRoles = useUserRoles();

  const { data: batch, isLoading } = useQuery({
    queryKey: ['batch-detail', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('batch_lifecycle_records')
        .select(`
          *, 
          created_by_profile:profiles!batch_lifecycle_records_created_by_fkey(full_name)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  // Fetch lookup values for display
  const { data: lookupValues } = useQuery({
    queryKey: ['lookup-values-display'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lookup_values')
        .select('id, value_display');
      if (error) throw error;
      return data;
    },
  });


  // Fetch tasks related to this batch
  const { data: batchTasks } = useQuery({
    queryKey: ['batch-tasks', batch?.id],
    enabled: !!batch?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          creator:profiles!tasks_created_by_fkey(full_name),
          assigned_to:profiles!tasks_assignee_fkey(full_name)
        `)
        .eq('batch_id', batch.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Fetch all profiles for assignee selection
  const { data: profiles } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('is_active', true)
        .order('full_name');
      
      if (error) throw error;
      return data;
    },
  });

  // Mutation handlers
  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, updates }: { taskId: string; updates: any }) => {
      const { error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batch-tasks'] });
      toast.success('Task updated successfully');
    },
    onError: (error) => {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batch-tasks'] });
      toast.success('Task deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    },
  });

  const submitForApprovalMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const task = batchTasks?.find(t => t.id === taskId);
      if (!task || !task.task_category) {
        throw new Error('Task category not found');
      }

      const workflow = getApprovalWorkflow(task.task_category);
      const { error } = await supabase
        .from('tasks')
        .update({
          approval_status: 'pending_approval',
          current_approval_stage: 0,
          approval_history: [
            {
              stage: 0,
              action: 'submitted',
              timestamp: new Date().toISOString(),
              notes: 'Task submitted for approval'
            }
          ]
        })
        .eq('id', taskId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batch-tasks'] });
      setShowSubmitDialog(false);
      setTaskToSubmit(null);
      toast.success('Task submitted for approval');
    },
    onError: (error) => {
      console.error('Error submitting task:', error);
      toast.error('Failed to submit task for approval');
    },
  });

  const handleStatusChange = (taskId: string, newStatus: string) => {
    if (newStatus === 'pending_approval') {
      setTaskToSubmit(taskId);
      setShowSubmitDialog(true);
    } else {
      updateTaskMutation.mutate({ taskId, updates: { status: newStatus } });
    }
  };

  const handleAssigneeChange = (taskId: string, assigneeId: string) => {
    updateTaskMutation.mutate({ taskId, updates: { assignee: assigneeId || null } });
  };

  const handleDueDateChange = (taskId: string, dueDate: string) => {
    updateTaskMutation.mutate({ taskId, updates: { due_date: dueDate || null } });
  };

  const handleManageItems = (task: any) => {
    setSelectedTask(task);
    setShowItemsDialog(true);
  };

  const handleDelete = (taskId: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      deleteTaskMutation.mutate(taskId);
    }
  };

  const getDisplayValue = (id: string) => {
    if (!id) return 'N/A';
    return lookupValues?.find(v => v.id === id)?.value_display || id;
  };

  const getUserName = (userId: string | null) => {
    if (!userId) return 'N/A';
    return profiles?.find(p => p.id === userId)?.full_name || 'N/A';
  };

  if (isLoading) {
    return (
      <BatchLayout>
        <div className="space-y-6">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </BatchLayout>
    );
  }

  if (!batch) {
    return (
      <BatchLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Batch not found</p>
          <Button className="mt-4" onClick={() => navigate('/batch/master-record')}>
            Back to Batches
          </Button>
        </div>
      </BatchLayout>
    );
  }

  return (
    <BatchLayout>
      <div className="space-y-3">
        {/* Compact Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/batch/master-record')} className="h-8">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <h1 className="text-lg font-bold">{formatBatchNumber(batch.batch_number)}</h1>
            <span className="text-base">{getStageIcon(batch.current_stage)}</span>
            <Badge className={cn("border text-xs", getStatusColor(batch.status))}>
              {batch.status?.replace('_', ' ').toUpperCase()}
            </Badge>
            <span className="text-xs text-muted-foreground">
              • Created by {batch.created_by_profile?.full_name || 'Unknown'} • {format(new Date(batch.created_at), 'MMM d, yyyy')}
            </span>
          </div>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => generateBatchRecordPDF(batch, getUserName, getDisplayValue)} 
              className="h-8"
            >
              <FileText className="h-3 w-3 mr-1" />
              Batch Record Report
            </Button>
            <Button size="sm" onClick={() => navigate(`/batch/master-record?edit=${batch.id}`)} className="h-8">
              <Edit className="h-3 w-3 mr-1" />
              Edit Batch
            </Button>
          </div>
        </div>

        {/* Tabbed Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Batch Overview</TabsTrigger>
            <TabsTrigger value="tasks">Batch Tasks</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            {/* Lifecycle Timeline */}
            <BatchProgressTimeline 
              batchId={batch.id}
              batchNumber={batch.batch_number}
              currentStage={batch.current_stage}
              currentQuantity={
                batch.current_stage === 'preclone' ? 0 :
                batch.current_stage === 'clone_germination' ? batch.total_clones_plants :
                batch.current_stage === 'hardening' ? batch.hardening_number_clones :
                batch.current_stage === 'vegetative' ? batch.veg_number_plants :
                batch.current_stage === 'flowering_grow_room' ? batch.flowering_number_plants :
                batch.current_stage === 'harvest' ? batch.harvest_number_plants :
                batch.current_stage === 'processing_drying' ? batch.drying_total_plants : 0
              }
              currentDome={batch.dome_no || ''}
              stageCompletionDates={{
                preclone: null,
                clone_germination: batch.clone_germination_date,
                hardening: batch.move_to_hardening_date,
                vegetative: batch.move_to_veg_date,
                flowering_grow_room: batch.move_to_flowering_date,
                preharvest: batch.actual_flowering_date,
                harvest: batch.harvest_date,
                processing_drying: batch.drying_date,
                packing_storage: batch.packing_date
              }}
              stageData={{
                preclone: { 
                  dome: null, 
                  plants: null 
                },
                clone_germination: { 
                  dome: batch.dome_no, 
                  plants: batch.total_clones_plants 
                },
                hardening: { 
                  dome: batch.dome_no, 
                  plants: batch.hardening_number_clones 
                },
                vegetative: { 
                  dome: batch.dome_no, 
                  plants: batch.veg_number_plants 
                },
                flowering_grow_room: { 
                  dome: batch.dome_no, 
                  plants: batch.flowering_number_plants 
                },
                preharvest: { 
                  dome: null, 
                  plants: null 
                },
                harvest: { 
                  dome: null, 
                  plants: batch.harvest_number_plants 
                },
                processing_drying: { 
                  dome: null, 
                  plants: batch.drying_total_plants 
                },
                packing_storage: { 
                  dome: null, 
                  plants: null 
                }
              }}
            />

            {/* Stage-Organized Accordion */}
            <Card>
              <CardHeader>
                <CardTitle>Stage Details</CardTitle>
                <CardDescription>View detailed information for each lifecycle stage</CardDescription>
              </CardHeader>
              <CardContent>
                <BatchDetailAccordions 
                  batch={batch}
                  getUserName={getUserName}
                  getDisplayValue={getDisplayValue}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks" className="mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Batch Tasks</CardTitle>
                <CardDescription className="text-xs">
                  All tasks associated with this batch
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                {batchTasks && batchTasks.length > 0 ? (
                  <div className="space-y-6">
                    {batchTasks.map((task) => {
                      const hasItems = task.checklist_items && Array.isArray(task.checklist_items) && task.checklist_items.length > 0;
                      const progress = (task.completion_progress as any) || { completed: 0, total: 0 };
                      const progressPercent = progress.total > 0 
                        ? (progress.completed / progress.total) * 100 
                        : 0;

                      const getStatusColor = (status: string) => {
                        switch (status) {
                          case "completed":
                            return "bg-success text-success-foreground";
                          case "in_progress":
                            return "bg-warning text-warning-foreground";
                          case "cancelled":
                            return "bg-destructive text-destructive-foreground";
                          default:
                            return "bg-muted text-muted-foreground";
                        }
                      };

                      return (
                        <Card key={task.id} className="hover:shadow-md transition-shadow">
                          <CardHeader className="p-4 pb-2">
                            <div className="flex justify-between items-start gap-4">
                              <div className="space-y-0.5 flex-1">
                                <div className="flex items-center gap-3 flex-wrap">
                                  <CardTitle className="text-lg flex items-center gap-2">
                                    {task.name}
                                    <Popover>
                                      <PopoverTrigger asChild>
                                        <Button 
                                          variant="outline" 
                                          size="sm" 
                                          className="h-7 w-7 p-0 rounded-full border-2 border-primary/20 bg-primary/5 hover:bg-primary/10 hover:border-primary/40 transition-all"
                                        >
                                          <Info className="h-4 w-4 text-primary" />
                                        </Button>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-96 p-4 bg-background" align="start">
                                        <TaskDetailsPopoverContent task={task} />
                                      </PopoverContent>
                                    </Popover>
                                  </CardTitle>
                                  {task.task_category && (
                                    <Badge className={getCategoryColor(task.task_category)}>
                                      {TASK_CATEGORIES[task.task_category as TaskCategory]}
                                    </Badge>
                                  )}
                                  {task.task_category && (
                                    <ApprovalProgressBadge
                                      category={task.task_category}
                                      currentStage={task.current_approval_stage || 0}
                                      approvalStatus={task.approval_status || "draft"}
                                    />
                                  )}
                                  {hasItems && (
                                    <Badge variant="outline" className="flex items-center gap-1">
                                      <ListChecks className="h-3 w-3" />
                                      {progress.completed}/{progress.total} items
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-3 flex-wrap">
                                  <Badge variant="secondary" className="font-mono text-xs">
                                    {task.task_number}
                                  </Badge>
                                  {task.description && (
                                    <span className="text-sm text-muted-foreground line-clamp-1">
                                      {task.description}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                {task.task_category && task.status === 'in_progress' && (!task.approval_status || task.approval_status === 'draft') && (
                                  <Button
                                    variant="default"
                                    size="sm"
                                    onClick={() => {
                                      const items = task.checklist_items as any[];
                                      const hasItems = items && items.length > 0;
                                      const prog = task.completion_progress as any || { completed: 0, total: 0 };
                                      
                                      if (hasItems && prog.completed < prog.total) {
                                        toast.error("Please complete all items before submitting for approval");
                                        return;
                                      }
                                      
                                      setTaskToSubmit(task.id);
                                      setShowSubmitDialog(true);
                                    }}
                                  >
                                    Submit for Approval
                                  </Button>
                                )}
                                {task.task_category && canUserApprove(task.task_category, task.current_approval_stage || 0, userRoles.data || []) && task.approval_status === 'pending_approval' && (
                                  <TaskApprovalActions
                                    taskId={task.id}
                                    taskName={task.name}
                                    currentStage={task.current_approval_stage || 0}
                                    totalStages={getApprovalWorkflow(task.task_category).totalStages}
                                    onSuccess={() => queryClient.invalidateQueries({ queryKey: ['batch-tasks'] })}
                                  />
                                )}
                                {hasItems && task.status !== 'completed' && task.approval_status !== 'approved' && (
                                  <Button
                                    variant="default"
                                    size="sm"
                                    onClick={() => handleManageItems(task)}
                                  >
                                    <ListChecks className="mr-2 h-4 w-4" />
                                    Manage Items
                                  </Button>
                                )}
                                {hasItems && (task.status === 'completed' || task.approval_status === 'approved') && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleManageItems(task)}
                                  >
                                    <ListChecks className="mr-2 h-4 w-4" />
                                    View Items
                                  </Button>
                                )}
                                {task.status !== 'completed' && task.approval_status !== 'approved' && (
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleDelete(task.id)}
                                  >
                                    Delete
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="px-4 py-2 pt-1">
                            {hasItems && progress.total > 0 && (
                              <div className="mb-2">
                                <div className="flex items-center gap-3 mb-1">
                                  <span className="text-xs text-muted-foreground font-semibold">Progress</span>
                                  <Progress value={progressPercent} className="h-2 flex-1" />
                                  <span className="text-xs font-medium">{Math.round(progressPercent)}%</span>
                                </div>
                              </div>
                            )}

                            {/* Read-only Display Fields */}
                            <div className="flex items-center gap-3 px-2 py-1.5 bg-muted/50 rounded-lg">
                              <div className="flex items-center gap-2 flex-1">
                                <Label className="text-xs text-muted-foreground whitespace-nowrap font-semibold">Status</Label>
                                <Badge variant={
                                  task.approval_status === 'pending_approval' ? 'default' :
                                  task.status === 'completed' ? 'default' :
                                  task.status === 'in_progress' ? 'secondary' :
                                  'outline'
                                }>
                                  {task.approval_status === 'pending_approval' ? 'Pending Approval' :
                                   task.status === 'in_progress' ? 'In Progress' :
                                   task.status === 'completed' ? 'Completed' :
                                   task.status === 'cancelled' ? 'Cancelled' : task.status}
                                </Badge>
                              </div>

                              <div className="flex items-center gap-2 flex-1">
                                <Label className="text-xs text-muted-foreground whitespace-nowrap font-semibold">Assignee</Label>
                                <span className="text-sm">
                                  {task.assigned_to?.full_name || 'Unassigned'}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 flex-1">
                                <Label className="text-xs text-muted-foreground whitespace-nowrap font-semibold">Due Date</Label>
                                <span className="text-sm">
                                  {task.due_date ? format(new Date(task.due_date), "MMM dd, yyyy") : 'No due date'}
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground text-sm py-6">
                    No tasks found for this batch.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Batch Analytics</CardTitle>
                <CardDescription className="text-xs">Performance metrics and insights</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-muted-foreground text-center text-sm py-6">
                  Analytics coming soon...
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Manage Items Dialog */}
        <Dialog open={showItemsDialog} onOpenChange={setShowItemsDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedTask?.status === 'completed' || selectedTask?.approval_status === 'approved' 
                  ? 'View Task Items' 
                  : 'Manage Task Items'}
              </DialogTitle>
            </DialogHeader>
            {selectedTask && (
              <TaskItemsManager
                task={selectedTask}
                readOnly={selectedTask.status === 'completed' || selectedTask.approval_status === 'approved'}
                onClose={() => {
                  setShowItemsDialog(false);
                  setSelectedTask(null);
                  queryClient.invalidateQueries({ queryKey: ['batch-tasks'] });
                }}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Submit for Approval Dialog */}
        <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Submit Task for Approval</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Are you sure you want to submit this task for approval? Once submitted, you won't be able to edit it until the approval process is complete.
              </p>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowSubmitDialog(false);
                    setTaskToSubmit(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (taskToSubmit) {
                      submitForApprovalMutation.mutate(taskToSubmit);
                    }
                  }}
                  disabled={submitForApprovalMutation.isPending}
                >
                  {submitForApprovalMutation.isPending ? 'Submitting...' : 'Submit for Approval'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </BatchLayout>
  );
}
