import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Plus, Search, Calendar, User, ListChecks, Info, MoreVertical, Eye, Trash2, Send, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { TaskDialog } from "@/components/tasks/TaskDialog";
import { TaskItemsManager } from "@/components/tasks/TaskItemsManager";
import { TwoLevelCategoryFilter } from "@/components/tasks/TwoLevelCategoryFilter";
import { TaskApprovalActions } from "@/components/tasks/TaskApprovalActions";
import { ApprovalProgressBadge } from "@/components/tasks/ApprovalProgressBadge";
import { TaskDetailsPopoverContent } from "@/components/tasks/TaskDetailsPopover";
import CreateChecklistDialog from "@/components/checklists/CreateChecklistDialog";
import { SignatureDialog } from "@/components/checklists/SignatureDialog";
import { format } from "date-fns";
import { Layout } from "@/components/Layout";
import { useIsAdmin, useUserRoles } from "@/hooks/useUserRoles";
import { useAuth } from "@/contexts/AuthContext";
import { TaskCategory, TASK_CATEGORIES, getCategoryColor, getApprovalWorkflow, canUserApprove } from "@/lib/taskCategoryUtils";
import { useHasPermission } from "@/hooks/useUserPermissions";

export default function TaskManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isItemsDialogOpen, setIsItemsDialogOpen] = useState(false);
  const [isChecklistDialogOpen, setIsChecklistDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory | "all">("all");
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showSignatureDialog, setShowSignatureDialog] = useState(false);
  const [taskToSubmit, setTaskToSubmit] = useState<string | null>(null);
  const [selectedApprover, setSelectedApprover] = useState("");
  const queryClient = useQueryClient();
  const isAdmin = useIsAdmin();
  const { user } = useAuth();
  const { data: userRoles = [] } = useUserRoles();
  const hasApprovePermission = useHasPermission('approve_tasks');
  const hasViewAllPermission = useHasPermission('view_all_tasks');

  const handleCategoryChange = (category: TaskCategory | "all") => {
    setSelectedCategory(category);
    // Force refetch to ensure fresh data
    refetch();
  };

  const { data: tasks, isLoading, refetch } = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select(`
          *,
          creator:profiles!tasks_created_by_fkey(full_name),
          assigned_to:profiles!tasks_assignee_fkey(full_name),
          batch:batch_lifecycle_records!tasks_batch_id_fkey(batch_number)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const { data: profiles } = useQuery({
    queryKey: ["profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name")
        .eq("is_active", true)
        .order("full_name");

      if (error) throw error;
      return data;
    },
  });

  // Real-time subscription to automatically show new tasks
  useEffect(() => {
    const channel = supabase
      .channel('tasks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["tasks"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const { data: nomenclature } = useQuery({
    queryKey: ["nomenclature-task"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("nomenclature_templates")
        .select("*")
        .eq("entity_type", "task")
        .eq("is_active", true)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const { data: highestTaskNumber } = useQuery({
    queryKey: ['tasks-highest-number'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('task_number')
        .order('task_number', { ascending: false })
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      
      // Extract the sequence number from the task_number (e.g., "TA-0015" -> 15)
      if (data?.task_number) {
        const match = data.task_number.match(/(\d+)$/);
        return match ? parseInt(match[1]) : 0;
      }
      return 0;
    },
  });

  const generateTaskNumber = (formatPattern: string, count: number) => {
    const counterMatch = formatPattern.match(/\{counter:(\d+)\}/);
    if (counterMatch) {
      const padding = parseInt(counterMatch[1]);
      const counterValue = String(count + 1).padStart(padding, "0");
      return formatPattern.replace(/\{counter:\d+\}/, counterValue);
    }
    return formatPattern;
  };

  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, updates }: { taskId: string; updates: any }) => {
      const { error } = await supabase
        .from("tasks")
        .update(updates)
        .eq("id", taskId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["tasks-highest-number"] });
      toast.success("Task updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update task: " + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase.from("tasks").delete().eq("id", taskId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["tasks-highest-number"] });
      toast.success("Task deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete task: " + error.message);
    },
  });

  const submitForApprovalMutation = useMutation({
    mutationFn: async ({ taskId, approverId, signatures }: { taskId: string; approverId: string; signatures?: any }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const task = tasks?.find(t => t.id === taskId);
      let updatedChecklistItems = (task?.checklist_items as any[]) || [];
      
      // For SOF-22, SOF-15, SOF-30, and SOF-19, add signature fields if provided
      if ((task?.name?.includes('HVCSOF022') || task?.name?.includes('HVCSOF015') || task?.name?.includes('HVCSOF030') || task?.name?.includes('HVCSOF019')) && signatures) {
        const { data: qaProfile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', signatures.qa_id)
          .single();

        const { data: managerProfile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', signatures.manager_id)
          .single();

        // Add QA and Manager signature items to checklist
        updatedChecklistItems = [
          ...updatedChecklistItems,
          {
            id: crypto.randomUUID(),
            label: 'QA Signature',
            completed: true,
            section: 'approvals',
            type: 'signature',
            notes: `QA Approver: ${qaProfile?.full_name} (ID: ${signatures.qa_id})`,
          },
          {
            id: crypto.randomUUID(),
            label: 'Manager Signature',
            completed: true,
            section: 'approvals',
            type: 'signature',
            notes: `Manager Approver: ${managerProfile?.full_name} (ID: ${signatures.manager_id})`,
          }
        ];
      }

      // Create initial approval history
      const approvalHistory = [{
        stage: 0,
        submitted_by: user.id,
        submitted_at: new Date().toISOString(),
        action: "submitted",
        approver_id: approverId,
      }];

      const completedCount = updatedChecklistItems.filter((item: any) => item.completed).length;

      // Prepare update payload
      const updatePayload: any = {
        approval_status: 'pending_approval',
        current_approval_stage: 0, // Start at stage 0
        assignee: signatures?.grower_id || approverId, // Assign to the grower selected in signature dialog
        checklist_items: updatedChecklistItems as any,
        completion_progress: {
          completed: completedCount,
          total: updatedChecklistItems.length
        } as any,
        approval_history: approvalHistory,
      };

      // Set category for SOF-22, SOF-15, SOF-30, and SOF-19 if not already set
      if (task?.name?.includes('HVCSOF022') && !task?.task_category) {
        updatePayload.task_category = 'scouting_corrective';
      }
      if (task?.name?.includes('HVCSOF015') && !task?.task_category) {
        updatePayload.task_category = 'mortality_discard';
      }
      if (task?.name?.includes('HVCSOF030') && !task?.task_category) {
        updatePayload.task_category = 'fertigation_application';
      }
      if (task?.name?.includes('HVCSOF019') && !task?.task_category) {
        updatePayload.task_category = 'ipm_chemical_mixing';
      }

      const { error } = await supabase
        .from("tasks")
        .update(updatePayload)
        .eq("id", taskId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task submitted for approval");
      setShowSubmitDialog(false);
      setShowSignatureDialog(false);
      setTaskToSubmit(null);
      setSelectedApprover("");
    },
    onError: (error) => {
      toast.error("Failed to submit task: " + error.message);
    },
  });

  const handleEdit = (task: any) => {
    setSelectedTask(task);
    setIsDialogOpen(true);
  };

  const handleStatusChange = (taskId: string, newStatus: string) => {
    // Prevent marking as completed if checklist items are not all done
    if (newStatus === 'completed') {
      const task = tasks?.find(t => t.id === taskId);
      if (task?.checklist_items) {
        const items = task.checklist_items as any[];
        const progress = task.completion_progress as any;
        if (items.length > 0 && progress?.completed < progress?.total) {
          toast.error("Cannot mark as completed", {
            description: "Please complete all items by clicking on the Manage Items button."
          });
          return;
        }
      }
    }
    
    updateTaskMutation.mutate({ taskId, updates: { status: newStatus } });
  };

  const handleAssigneeChange = (taskId: string, newAssignee: string) => {
    updateTaskMutation.mutate({ 
      taskId, 
      updates: { assignee: newAssignee || null } 
    });
  };

  const handleDueDateChange = (taskId: string, newDueDate: string) => {
    updateTaskMutation.mutate({ 
      taskId, 
      updates: { due_date: newDueDate || null } 
    });
  };

  const handleManageItems = (task: any) => {
    setSelectedTask(task);
    setIsItemsDialogOpen(true);
  };

  const handleDelete = (taskId: string) => {
    if (confirm("Are you sure you want to delete this task?")) {
      deleteMutation.mutate(taskId);
    }
  };

  const handleNewTask = () => {
    setSelectedTask(null);
    setIsDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-success text-success-foreground";
      case "pending_approval":
        return "bg-blue-500 text-white";
      case "in_progress":
        return "bg-warning text-warning-foreground";
      case "cancelled":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending_approval":
        return "PENDING APPROVAL";
      case "in_progress":
        return "IN PROGRESS";
      default:
        return status.replace("_", " ").toUpperCase();
    }
  };

  const filteredTasks = useMemo(() => {
    if (!tasks) return [];
    
    return tasks.filter(task => {
      const matchesSearch = !searchTerm || 
        task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.task_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.creator?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.assigned_to?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDate = !dateFilter || 
        (task.due_date && task.due_date.startsWith(dateFilter));
      
      const matchesCategory = selectedCategory === "all" || task.task_category === selectedCategory;
      
      return matchesSearch && matchesDate && matchesCategory;
    });
  }, [tasks, searchTerm, dateFilter, selectedCategory]);

  const myTasks = useMemo(() => {
    // Filter out tasks that current user submitted for approval
    const tasksForUser = hasViewAllPermission ? filteredTasks : filteredTasks.filter(task => task.assignee === user?.id);
    
    // Exclude tasks submitted by current user from My Tasks view
    return tasksForUser.filter(task => {
      if (task.approval_status !== 'pending_approval') return true;
      
      const approvalHistory = Array.isArray(task.approval_history) ? task.approval_history : [];
      const submittedByCurrentUser = approvalHistory.some((entry: any) => 
        entry.action === 'submitted' && entry.submitted_by === user?.id
      );
      
      return !submittedByCurrentUser;
    });
  }, [filteredTasks, user?.id, hasViewAllPermission]);

  // Determine which view to show based on permissions
  const showAllTasksView = isAdmin || hasViewAllPermission;

  const renderTaskList = (taskList: any[]) => {
    if (!taskList || taskList.length === 0) {
      return (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No tasks found</p>
          </CardContent>
        </Card>
      );
    }

    // Group tasks by status and approval
    const tasksByStatus = {
      pending_approval: taskList.filter(task => {
        // Don't show tasks that the current user submitted for approval
        const approvalHistory = Array.isArray(task.approval_history) ? task.approval_history : [];
        const submittedByCurrentUser = approvalHistory.some((entry: any) => 
          entry.action === 'submitted' && entry.submitted_by === user?.id
        );
        
        return task.approval_status === 'pending_approval' &&
          !submittedByCurrentUser &&
          (hasApprovePermission || (task.task_category ? canUserApprove(task.task_category, task.current_approval_stage || 0, userRoles) : false));
      }),
      in_progress: taskList.filter(task => task.status === 'in_progress' && task.approval_status !== 'pending_approval'),
      completed: taskList.filter(task => task.status === 'completed'),
      cancelled: taskList.filter(task => task.status === 'cancelled' || task.approval_status === 'rejected'),
    };

    const renderTaskCard = (task: any) => {
      const hasItems = task.checklist_items && task.checklist_items.length > 0;
      const progress = task.completion_progress || { completed: 0, total: 0 };
      const progressPercent = progress.total > 0 
        ? (progress.completed / progress.total) * 100 
        : 0;
      const isCompleted = task.status === 'completed' || task.approval_status === 'approved';
      const showProgress = hasItems && progress.total > 0 && progressPercent < 100;

      return (
        <Card key={task.id} className="group hover:shadow-md transition-shadow">
          <CardContent className="p-3">
            <div className="flex items-center justify-between gap-3">
              {/* Left: Task info + badges */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-base font-semibold truncate">{task.name}</h3>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 w-6 p-0 rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
                      >
                        <Info className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-96 p-4 bg-popover z-50" align="start">
                      <TaskDetailsPopoverContent task={task} />
                    </PopoverContent>
                  </Popover>
                  <span className="text-xs font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{task.task_number}</span>
                </div>
                
                {/* Badges + Info in one line */}
                <div className="flex items-center gap-2 flex-wrap text-xs">
                  {task.task_category && (
                    <Badge variant="outline" className={`${getCategoryColor(task.task_category)} border-0 text-xs py-0`}>
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
                    <Badge variant="outline" className="bg-muted/50 text-muted-foreground border-0 text-xs py-0">
                      <ListChecks className="mr-1 h-3 w-3" />
                      {progress.completed}/{progress.total}
                    </Badge>
                  )}
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground">
                    {task.approval_status === 'pending_approval' ? 'Pending Approval' :
                     task.status === 'completed' ? 'Completed' :
                     task.status === 'in_progress' ? 'In Progress' : 'Cancelled'}
                  </span>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground">{task.assigned_to?.full_name || 'Unassigned'}</span>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground">
                    {task.due_date ? format(new Date(task.due_date), "MMM dd, yyyy") : 'No due date'}
                  </span>
                </div>
                
                {/* Progress bar inline if needed */}
                {showProgress && (
                  <div className="flex items-center gap-2 mt-1.5">
                    <Progress value={progressPercent} className="h-1.5 flex-1" />
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{Math.round(progressPercent)}%</span>
                  </div>
                )}
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-1.5">
                {((task.task_category && task.status === 'in_progress' && (!task.approval_status || task.approval_status === 'draft')) || 
                  (hasItems && task.status === 'in_progress' && (!task.approval_status || task.approval_status === 'draft'))) && (
                  <Button
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => {
                      if (hasItems && progress.completed < progress.total) {
                        toast.error("Please complete all checklist items first");
                        return;
                      }
                      setTaskToSubmit(task.id);
                      
                      // For SOF-22, SOF-15, SOF-30, and SOF-19, show signature dialog first
                      if (task.name?.includes('HVCSOF022') || task.name?.includes('HVCSOF015') || task.name?.includes('HVCSOF030') || task.name?.includes('HVCSOF019')) {
                        setShowSignatureDialog(true);
                      } else {
                        setShowSubmitDialog(true);
                      }
                    }}
                  >
                    <Send className="mr-1 h-3 w-3" />
                    Submit
                  </Button>
                )}
                {task.task_category && task.approval_status === 'pending_approval' && (() => {
                  // Check if current user submitted the task
                  const approvalHistory = Array.isArray(task.approval_history) ? task.approval_history : [];
                  const submittedByCurrentUser = approvalHistory.some((entry: any) => 
                    entry.action === 'submitted' && entry.submitted_by === user?.id
                  );
                  
                  return !submittedByCurrentUser && (hasApprovePermission || canUserApprove(task.task_category, task.current_approval_stage || 0, userRoles));
                })() && (
                  <TaskApprovalActions
                    taskId={task.id}
                    taskName={task.name}
                    currentStage={task.current_approval_stage || 0}
                    totalStages={getApprovalWorkflow(task.task_category).totalStages}
                  />
                )}
                {hasItems && !isCompleted && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => handleManageItems(task)}
                  >
                    <ListChecks className="mr-1 h-3 w-3" />
                    Manage
                  </Button>
                )}
                {hasItems && isCompleted && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => handleManageItems(task)}
                  >
                    <Eye className="mr-1 h-3 w-3" />
                    View
                  </Button>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                      <MoreVertical className="h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40 bg-popover z-50">
                    {!isCompleted && (
                      <DropdownMenuItem 
                        onClick={() => handleDelete(task.id)}
                        className="cursor-pointer text-destructive focus:text-destructive text-sm"
                      >
                        <Trash2 className="mr-2 h-3.5 w-3.5" />
                        Delete
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    };

    return (
      <div className="space-y-4">
        {/* Pending My Approval */}
        {tasksByStatus.pending_approval.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 pb-1 border-b">
              <h3 className="text-base font-semibold">Pending My Approval</h3>
              <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-0 text-xs">
                {tasksByStatus.pending_approval.length}
              </Badge>
            </div>
            <div className="space-y-2">
              {tasksByStatus.pending_approval.map(renderTaskCard)}
            </div>
          </div>
        )}

        {/* In Progress Tasks */}
        {tasksByStatus.in_progress.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 pb-1 border-b">
              <h3 className="text-base font-semibold">In Progress</h3>
              <Badge variant="secondary" className="bg-warning/10 text-warning border-0 text-xs">
                {tasksByStatus.in_progress.length}
              </Badge>
            </div>
            <div className="space-y-2">
              {tasksByStatus.in_progress.map(renderTaskCard)}
            </div>
          </div>
        )}

        {/* Completed Tasks */}
        {tasksByStatus.completed.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 pb-1 border-b">
              <h3 className="text-base font-semibold">Completed</h3>
              <Badge variant="secondary" className="bg-success/10 text-success border-0 text-xs">
                {tasksByStatus.completed.length}
              </Badge>
            </div>
            <div className="space-y-2">
              {tasksByStatus.completed.map(renderTaskCard)}
            </div>
          </div>
        )}

        {/* Cancelled Tasks */}
        {tasksByStatus.cancelled.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 pb-1 border-b">
              <h3 className="text-base font-semibold">Cancelled</h3>
              <Badge variant="secondary" className="bg-destructive/10 text-destructive border-0 text-xs">
                {tasksByStatus.cancelled.length}
              </Badge>
            </div>
            <div className="space-y-2">
              {tasksByStatus.cancelled.map(renderTaskCard)}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-6">
        {isLoading ? (
          <div className="text-center py-12">Loading tasks...</div>
        ) : showAllTasksView ? (
          <Tabs defaultValue="my-tasks" className="w-full" onValueChange={() => {
            setSelectedCategory("all");
          }}>
            <div className="flex items-center justify-between gap-4">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="my-tasks">My Tasks</TabsTrigger>
                <TabsTrigger value="all-tasks">All Tasks</TabsTrigger>
              </TabsList>
              <Button onClick={() => setIsChecklistDialogOpen(true)} className="ml-auto">
                <Plus className="mr-2 h-4 w-4" />
                Create Checklist
              </Button>
            </div>
            
            <div className="flex gap-4 mt-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by task name, number, or owner..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-48"
                placeholder="Filter by date"
              />
            </div>

            <div className="mt-4">
              <TwoLevelCategoryFilter
                selectedCategory={selectedCategory}
                onCategoryChange={handleCategoryChange}
              />
            </div>

            <TabsContent value="my-tasks" className="mt-6">
              {renderTaskList(myTasks)}
            </TabsContent>
            <TabsContent value="all-tasks" className="mt-6">
              {renderTaskList(filteredTasks)}
            </TabsContent>
          </Tabs>
        ) : (
          <>
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex gap-4 flex-1">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by task name, number, or owner..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-48"
                  placeholder="Filter by date"
                />
              </div>
              <Button onClick={() => setIsChecklistDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Checklist
              </Button>
            </div>
            <div className="mb-4">
              <TwoLevelCategoryFilter
                selectedCategory={selectedCategory}
                onCategoryChange={handleCategoryChange}
              />
            </div>
            {renderTaskList(myTasks)}
          </>
        )}

        <TaskDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          task={selectedTask}
          nomenclature={nomenclature}
          tasksCount={highestTaskNumber || 0}
          generateTaskNumber={generateTaskNumber}
        />

        <Dialog open={isItemsDialogOpen} onOpenChange={setIsItemsDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedTask && (selectedTask.status === 'completed' || selectedTask.approval_status === 'approved')
                  ? 'View Task Items'
                  : 'Manage Task Items'}
              </DialogTitle>
            </DialogHeader>
            {selectedTask && (
              <TaskItemsManager
                task={selectedTask}
                onClose={() => setIsItemsDialogOpen(false)}
                readOnly={selectedTask.status === 'completed' || selectedTask.approval_status === 'approved'}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Create Checklist Dialog */}
        <CreateChecklistDialog
          open={isChecklistDialogOpen}
          onOpenChange={setIsChecklistDialogOpen}
        />

        {/* Submit for Approval Dialog */}
        <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Submit for Approval</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="approver">Select Approver *</Label>
                <Select
                  value={selectedApprover}
                  onValueChange={setSelectedApprover}
                >
                  <SelectTrigger id="approver">
                    <SelectValue placeholder="Select an approver" />
                  </SelectTrigger>
                  <SelectContent>
                    {profiles?.map((profile) => (
                      <SelectItem key={profile.id} value={profile.id}>
                        {profile.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowSubmitDialog(false);
                  setTaskToSubmit(null);
                  setSelectedApprover("");
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (!selectedApprover) {
                    toast.error("Please select an approver");
                    return;
                  }
                  if (taskToSubmit) {
                    submitForApprovalMutation.mutate({ 
                      taskId: taskToSubmit, 
                      approverId: selectedApprover 
                    });
                  }
                }}
                disabled={!selectedApprover || submitForApprovalMutation.isPending}
              >
                Submit
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Signature Dialog for SOF-22 */}
        <SignatureDialog
          open={showSignatureDialog}
          onOpenChange={(open) => {
            setShowSignatureDialog(open);
            if (!open) setTaskToSubmit(null);
          }}
          onConfirm={(signatures) => {
            if (taskToSubmit) {
              // For SOF-22, we don't need a separate approver since signatures include QA and Manager
              submitForApprovalMutation.mutate({ 
                taskId: taskToSubmit, 
                approverId: signatures.qa_id, // Use QA as primary approver
                signatures 
              });
            }
          }}
          isPending={submitForApprovalMutation.isPending}
        />
      </div>
    </Layout>
  );
}
