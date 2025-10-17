import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BatchLayout } from '@/components/BatchLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BatchProgressTimeline } from '@/components/batch/BatchProgressTimeline';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Edit, TrendingUp, Calendar, Users, Package, ListChecks, Clock, Info } from 'lucide-react';
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
  formatBatchNumber,
  calculateDaysInStage,
  getStageProgress
} from '@/lib/batchUtils';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { PhaseChangeButton } from '@/components/batch/PhaseChangeButton';

export default function BatchDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedChecklistId, setSelectedChecklistId] = useState<string | null>(null);
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
        .select('*, created_by_profile:profiles!batch_lifecycle_records_created_by_fkey(full_name)')
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

  // Fetch checklist data
  const { data: checklist } = useQuery({
    queryKey: ['batch-checklist', batch?.batch_number],
    enabled: !!batch?.batch_number,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cloning_pre_start_checklists')
        .select('*')
        .eq('batch_number', batch.batch_number)
        .maybeSingle();

      if (error) throw error;
      
      // Get creator profile if exists
      if (data && data.created_by) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', data.created_by)
          .single();
        
        return { ...data, created_by_profile: profile };
      }
      
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

  const daysInStage = batch.created_at ? calculateDaysInStage(batch.created_at) : 0;
  const stageProgress = getStageProgress(batch.current_stage);

  // Get current quantity based on stage
  const getCurrentQuantity = () => {
    switch (batch.current_stage) {
      case 'cloning':
        return batch.total_clones_plants;
      case 'vegetative':
        return batch.veg_number_plants;
      case 'flowering':
        return batch.flowering_number_plants;
      case 'harvest':
        return batch.harvest_number_plants;
      default:
        return batch.total_clones_plants;
    }
  };

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
          <Button size="sm" onClick={() => navigate(`/batch/master-record?edit=${batch.id}`)} className="h-8">
            <Edit className="h-3 w-3 mr-1" />
            Edit Batch
          </Button>
        </div>

        {/* Unified Stage Progress & Key Metrics Card */}
        <Card className="border-2 border-primary/20">
          <CardContent className="p-3">
            <div className="grid gap-3 md:grid-cols-6">
              {/* Stage Progress Section - Takes 2 columns */}
              <div className="md:col-span-2 space-y-1.5">
                <div className="flex items-center justify-between">
                  <Badge className={cn("border text-xs", getStageColor(batch.current_stage))}>
                    {getStageLabel(batch.current_stage)}
                  </Badge>
                  <div className="text-right">
                    <p className="text-xl font-bold text-primary">{Math.round(stageProgress)}%</p>
                    <p className="text-[10px] text-muted-foreground leading-none">Complete</p>
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground">{daysInStage} days in current stage</p>
                <Progress value={stageProgress} className="h-1.5" />
                <PhaseChangeButton
                  batchId={batch.id}
                  batchNumber={batch.batch_number}
                  currentStage={batch.current_stage}
                  currentQuantity={getCurrentQuantity()}
                  currentDome={batch.dome_no}
                  disabled={batch.status !== 'in_progress'}
                />
              </div>

              {/* Key Metrics - 4 columns */}
              <div className="md:col-span-4 grid grid-cols-4 gap-2">
                <div className="border rounded-lg p-2 bg-muted/30">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="text-[10px] font-medium text-muted-foreground">Strain ID</p>
                    <Package className="h-3 w-3 text-muted-foreground" />
                  </div>
                  <p className="text-lg font-bold leading-tight">{getDisplayValue(batch.strain_id || '')}</p>
                </div>

                <div className="border rounded-lg p-2 bg-muted/30">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="text-[10px] font-medium text-muted-foreground">Mother ID</p>
                    <Users className="h-3 w-3 text-muted-foreground" />
                  </div>
                  <p className="text-lg font-bold leading-tight">{batch.mother_no || 'N/A'}</p>
                </div>

                <div className="border rounded-lg p-2 bg-muted/30">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="text-[10px] font-medium text-muted-foreground">Total Plants</p>
                    <TrendingUp className="h-3 w-3 text-muted-foreground" />
                  </div>
                  <p className="text-lg font-bold leading-tight">{batch.total_clones_plants || 0}</p>
                  {batch.clonator_mortalities > 0 && (
                    <p className="text-[10px] text-red-500 leading-none mt-0.5">-{batch.clonator_mortalities} lost</p>
                  )}
                </div>

                <div className="border rounded-lg p-2 bg-muted/30">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="text-[10px] font-medium text-muted-foreground">Start Date</p>
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-bold leading-tight">
                    {batch.clone_germination_date 
                      ? format(new Date(batch.clone_germination_date), 'MMM d, yyyy')
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabbed Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="lifecycle">Lifecycle Timeline</TabsTrigger>
            <TabsTrigger value="records">Records & Logs</TabsTrigger>
            <TabsTrigger value="tasks">Batch Tasks</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-3 mt-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Batch Information */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Batch Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 pt-0">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Batch Number:</span>
                    <span className="font-medium">{batch.batch_number}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Strain:</span>
                    <span className="font-medium">{getDisplayValue(batch.strain_id || '')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Mother No:</span>
                    <span className="font-medium">{batch.mother_no || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Dome No:</span>
                    <span className="font-medium">{batch.dome_no || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Rack No:</span>
                    <span className="font-medium">{batch.rack_no || 'N/A'}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Dates & Timeline */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Important Dates</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 pt-0">
                  {batch.clone_germination_date && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Germination:</span>
                      <span className="font-medium">
                        {format(new Date(batch.clone_germination_date), 'MMM d, yyyy')}
                      </span>
                    </div>
                  )}
                  {batch.expected_rooting_date && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Expected Rooting:</span>
                      <span className="font-medium">
                        {format(new Date(batch.expected_rooting_date), 'MMM d, yyyy')}
                      </span>
                    </div>
                  )}
                  {batch.actual_rooting_date && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Actual Rooting:</span>
                      <span className="font-medium">
                        {format(new Date(batch.actual_rooting_date), 'MMM d, yyyy')}
                      </span>
                    </div>
                  )}
                  {batch.move_to_hardening_date && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Hardening Date:</span>
                      <span className="font-medium">
                        {format(new Date(batch.move_to_hardening_date), 'MMM d, yyyy')}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="lifecycle" className="mt-4">
            <BatchProgressTimeline 
              currentStage={batch.current_stage}
              stageCompletionDates={{
                cloning: batch.clone_germination_date,
                vegetative: batch.move_to_veg_date,
                flowering: batch.move_to_flowering_date,
                harvest: batch.harvest_date
              }}
              stageData={{
                cloning: { 
                  dome: batch.dome_no, 
                  plants: batch.total_clones_plants 
                },
                vegetative: { 
                  dome: batch.dome_no, 
                  plants: batch.veg_number_plants 
                },
                flowering: { 
                  dome: batch.dome_no, 
                  plants: batch.flowering_number_plants 
                },
                harvest: { 
                  dome: batch.dome_no, 
                  plants: batch.harvest_number_plants 
                }
              }}
            />
          </TabsContent>

          <TabsContent value="records" className="mt-4">
            <div className="space-y-3">
              {/* Back button when viewing details */}
              {selectedChecklistId && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSelectedChecklistId(null)}
                  className="mb-4"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Records List
                </Button>
              )}

              {/* List View */}
              {!selectedChecklistId && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Records & Logs</CardTitle>
                    <CardDescription className="text-xs">
                      All checklists and logs associated with this batch
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {checklist ? (
                      <div className="space-y-2">
                        <div 
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                          onClick={() => setSelectedChecklistId(checklist.id)}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-sm font-semibold">HVCSOF0011 - Cloning Pre-Start Checklist</h3>
                              <Badge variant={checklist.status === 'approved' ? 'default' : 'secondary'} className="text-xs">
                                {checklist.status}
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground space-y-0.5">
                              <p>Completed by {(checklist as any).created_by_profile?.full_name || 'Unknown'}</p>
                              <p>{format(new Date(checklist.created_at), 'MMM d, yyyy h:mm a')}</p>
                              <p>Quantity: {checklist.quantity} • Dome: {checklist.dome_no}</p>
                            </div>
                          </div>
                          <ArrowLeft className="h-4 w-4 rotate-180 text-muted-foreground" />
                        </div>
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground text-sm py-6">
                        No records or logs found for this batch.
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Detail View */}
              {selectedChecklistId && checklist && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">HVCSOF0011 - Cloning Pre-Start Checklist</CardTitle>
                    <CardDescription className="text-xs">
                      Completed by {(checklist as any).created_by_profile?.full_name || 'Unknown'} on{' '}
                      {format(new Date(checklist.created_at), 'MMM d, yyyy h:mm a')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Mother ID</p>
                        <p className="text-sm">{checklist.mother_id}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Strain ID</p>
                        <p className="text-sm">{checklist.strain_id}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Quantity</p>
                        <p className="text-sm">{checklist.quantity}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Dome No</p>
                        <p className="text-sm">{checklist.dome_no}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Status</p>
                        <Badge className={getStatusColor(checklist.status)}>
                          {checklist.status?.toUpperCase()}
                        </Badge>
                      </div>
                    </div>

                    <div className="border-t pt-3">
                      <h4 className="text-sm font-semibold mb-2">Mother Plant Checks</h4>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs">Mother plant healthy and disease-free</span>
                          <Badge variant={checklist.mother_plant_healthy ? "default" : "destructive"} className="text-xs">
                            {checklist.mother_plant_healthy ? 'Yes' : 'No'}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs">Mother plant fed and watered 12h prior</span>
                          <Badge variant={checklist.mother_plant_fed_watered_12h ? "default" : "destructive"} className="text-xs">
                            {checklist.mother_plant_fed_watered_12h ? 'Yes' : 'No'}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-3">
                      <h4 className="text-sm font-semibold mb-2">Work Area Preparation</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                        <div className="flex items-center gap-1.5">
                          <Badge variant={checklist.work_area_sharp_clean_scissors ? "default" : "secondary"} className="text-xs">
                            {checklist.work_area_sharp_clean_scissors ? '✓' : '✗'}
                          </Badge>
                          <span className="text-xs">Sharp, clean scissors</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Badge variant={checklist.work_area_sharp_clean_blade ? "default" : "secondary"} className="text-xs">
                            {checklist.work_area_sharp_clean_blade ? '✓' : '✗'}
                          </Badge>
                          <span className="text-xs">Sharp, clean blade</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Badge variant={checklist.work_area_jug_clean_water ? "default" : "secondary"} className="text-xs">
                            {checklist.work_area_jug_clean_water ? '✓' : '✗'}
                          </Badge>
                          <span className="text-xs">Jug with clean water</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Badge variant={checklist.work_area_dome_cleaned_disinfected ? "default" : "secondary"} className="text-xs">
                            {checklist.work_area_dome_cleaned_disinfected ? '✓' : '✗'}
                          </Badge>
                          <span className="text-xs">Dome cleaned/disinfected</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Badge variant={checklist.work_area_dome_prepared_medium ? "default" : "secondary"} className="text-xs">
                            {checklist.work_area_dome_prepared_medium ? '✓' : '✗'}
                          </Badge>
                          <span className="text-xs">Dome with prepared medium</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Badge variant={checklist.work_area_sanitizer_cup ? "default" : "secondary"} className="text-xs">
                            {checklist.work_area_sanitizer_cup ? '✓' : '✗'}
                          </Badge>
                          <span className="text-xs">Cup with sanitizer</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Badge variant={checklist.work_area_rooting_powder ? "default" : "secondary"} className="text-xs">
                            {checklist.work_area_rooting_powder ? '✓' : '✗'}
                          </Badge>
                          <span className="text-xs">Rooting powder/gel</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Badge variant={checklist.work_surface_sterilized ? "default" : "secondary"} className="text-xs">
                            {checklist.work_surface_sterilized ? '✓' : '✗'}
                          </Badge>
                          <span className="text-xs">Work surface sterilized</span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-3">
                      <h4 className="text-sm font-semibold mb-2">Personal Protection</h4>
                      <div className="flex items-center justify-between">
                        <span className="text-xs">Wearing clean gloves</span>
                        <Badge variant={checklist.wearing_clean_gloves ? "default" : "destructive"} className="text-xs">
                          {checklist.wearing_clean_gloves ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
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
                                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                  <span>{task.task_number}</span>
                                  {task.description && (
                                    <>
                                      <span>•</span>
                                      <span className="line-clamp-1">{task.description}</span>
                                    </>
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

                            {/* Inline Edit Controls */}
                            <div className="flex items-center gap-3 px-2 py-1.5 bg-muted/50 rounded-lg">
                              <div className="flex items-center gap-2 flex-1">
                                <Label htmlFor={`status-${task.id}`} className="text-xs text-muted-foreground whitespace-nowrap font-semibold">Status</Label>
                                <Select
                                  value={task.approval_status === 'pending_approval' ? 'pending_approval' : task.status}
                                  onValueChange={(value) => handleStatusChange(task.id, value)}
                                  disabled={task.approval_status === 'pending_approval' || task.approval_status === 'approved'}
                                >
                                  <SelectTrigger id={`status-${task.id}`} className="h-8">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                    <SelectItem value="pending_approval">Pending Approval</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="flex items-center gap-2 flex-1">
                                <Label htmlFor={`assignee-${task.id}`} className="text-xs text-muted-foreground whitespace-nowrap font-semibold">Assignee</Label>
                                <Select
                                  value={task.assignee || "unassigned"}
                                  onValueChange={(value) => handleAssigneeChange(task.id, value === "unassigned" ? "" : value)}
                                >
                                  <SelectTrigger id={`assignee-${task.id}`} className="h-8">
                                    <SelectValue placeholder="Select assignee" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="unassigned">Unassigned</SelectItem>
                                    {profiles?.map((profile) => (
                                      <SelectItem key={profile.id} value={profile.id}>
                                        {profile.full_name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="flex items-center gap-2 flex-1">
                                <Label htmlFor={`due-date-${task.id}`} className="text-xs text-muted-foreground whitespace-nowrap font-semibold">Due Date</Label>
                                <Input
                                  id={`due-date-${task.id}`}
                                  type="date"
                                  value={task.due_date || ""}
                                  onChange={(e) => handleDueDateChange(task.id, e.target.value)}
                                  className="h-8"
                                />
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
