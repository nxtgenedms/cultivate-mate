import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, FileCheck, Calendar, User, ListChecks } from "lucide-react";
import { toast } from "sonner";
import { TaskDialog } from "@/components/tasks/TaskDialog";
import { TaskItemsManager } from "@/components/tasks/TaskItemsManager";
import { TaskCategoryFilter } from "@/components/tasks/TaskCategoryFilter";
import { TaskApprovalActions } from "@/components/tasks/TaskApprovalActions";
import { format } from "date-fns";
import { Layout } from "@/components/Layout";
import { useIsAdmin, useUserRoles } from "@/hooks/useUserRoles";
import { useAuth } from "@/contexts/AuthContext";
import CreateChecklistDialog from "@/components/checklists/CreateChecklistDialog";
import { TaskCategory, TASK_CATEGORIES, getCategoryColor, getApprovalWorkflow, canUserApprove } from "@/lib/taskCategoryUtils";

export default function TaskManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isChecklistDialogOpen, setIsChecklistDialogOpen] = useState(false);
  const [isItemsDialogOpen, setIsItemsDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory | "all">("all");
  const queryClient = useQueryClient();
  const isAdmin = useIsAdmin();
  const { user } = useAuth();
  const { data: userRoles = [] } = useUserRoles();

  const { data: tasks, isLoading } = useQuery({
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
      toast.success("Task deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete task: " + error.message);
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
      case "in_progress":
        return "bg-warning text-warning-foreground";
      case "cancelled":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusLabel = (status: string) => {
    return status.replace("_", " ").toUpperCase();
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

  const myTasks = useMemo(() => 
    filteredTasks.filter(task => task.assignee === user?.id),
    [filteredTasks, user?.id]
  );

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
      pending_approval: taskList.filter(task => 
        task.task_category && 
        task.approval_status === 'pending_approval' &&
        canUserApprove(task.task_category, task.current_approval_stage || 0, userRoles)
      ),
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

      return (
        <Card key={task.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex justify-between items-start gap-4">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <CardTitle className="text-xl">{task.name}</CardTitle>
                  {task.task_category && (
                    <Badge className={getCategoryColor(task.task_category)}>
                      {TASK_CATEGORIES[task.task_category as TaskCategory]}
                    </Badge>
                  )}
                  {hasItems && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <ListChecks className="h-3 w-3" />
                      {progress.completed}/{progress.total} items
                    </Badge>
                  )}
                  {task.task_category && task.approval_status === 'pending_approval' && (
                    <Badge variant="secondary">
                      Stage {(task.current_approval_stage || 0) + 1}/{getApprovalWorkflow(task.task_category).totalStages}
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
                {task.task_category && canUserApprove(task.task_category, task.current_approval_stage || 0, userRoles) && task.approval_status === 'pending_approval' && (
                  <TaskApprovalActions
                    taskId={task.id}
                    taskName={task.name}
                    currentStage={task.current_approval_stage || 0}
                    totalStages={getApprovalWorkflow(task.task_category).totalStages}
                  />
                )}
                {hasItems && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleManageItems(task)}
                  >
                    <ListChecks className="mr-2 h-4 w-4" />
                    Manage Items
                  </Button>
                )}
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(task.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {hasItems && progress.total > 0 && (
              <div className="mb-3">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-xs text-muted-foreground font-semibold">Progress</span>
                  <Progress value={progressPercent} className="h-2 flex-1" />
                  <span className="text-xs font-medium">{Math.round(progressPercent)}%</span>
                </div>
              </div>
            )}

            {/* Inline Edit Controls */}
            <div className="flex items-center gap-3 mb-3 p-2 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 flex-1">
                <Label htmlFor={`status-${task.id}`} className="text-xs text-muted-foreground whitespace-nowrap font-semibold">Status</Label>
                <Select
                  value={task.status}
                  onValueChange={(value) => handleStatusChange(task.id, value)}
                >
                  <SelectTrigger id={`status-${task.id}`} className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in_progress">In Progress</SelectItem>
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

            <div className="flex flex-wrap gap-4 text-sm">
              {task.batch?.batch_number && (
                <div className="flex items-center gap-2">
                  <FileCheck className="h-4 w-4 text-muted-foreground" />
                  <span><span className="font-semibold">Batch:</span> {task.batch.batch_number}</span>
                </div>
              )}
              {task.due_date && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    <span className="font-semibold">Due:</span> {format(new Date(task.due_date), "PPP")}
                  </span>
                </div>
              )}
              {task.creator && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span><span className="font-semibold">Created by:</span> {task.creator.full_name} on {format(new Date(task.created_at), "PPP")}</span>
                </div>
              )}
              {task.assigned_to && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span><span className="font-semibold">Assigned to:</span> {task.assigned_to.full_name} on {format(new Date(task.updated_at), "PPP")}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      );
    };

    return (
      <div className="space-y-6">
        {/* Pending My Approval */}
        {tasksByStatus.pending_approval.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold">Pending My Approval</h3>
              <Badge variant="default" className="bg-blue-500">
                {tasksByStatus.pending_approval.length}
              </Badge>
            </div>
            <div className="grid gap-4">
              {tasksByStatus.pending_approval.map(renderTaskCard)}
            </div>
          </div>
        )}

        {/* In Progress Tasks */}
        {tasksByStatus.in_progress.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold">In Progress</h3>
              <Badge variant="default" className="bg-warning text-warning-foreground">
                {tasksByStatus.in_progress.length}
              </Badge>
            </div>
            <div className="grid gap-4">
              {tasksByStatus.in_progress.map(renderTaskCard)}
            </div>
          </div>
        )}

        {/* Completed Tasks */}
        {tasksByStatus.completed.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold">Completed</h3>
              <Badge className="bg-success text-success-foreground">
                {tasksByStatus.completed.length}
              </Badge>
            </div>
            <div className="grid gap-4">
              {tasksByStatus.completed.map(renderTaskCard)}
            </div>
          </div>
        )}

        {/* Cancelled Tasks */}
        {tasksByStatus.cancelled.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold">Cancelled</h3>
              <Badge variant="destructive">
                {tasksByStatus.cancelled.length}
              </Badge>
            </div>
            <div className="grid gap-4">
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
        ) : isAdmin ? (
          <Tabs defaultValue="my-tasks" className="w-full">
            <div className="flex items-center justify-between gap-4">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="my-tasks">My Tasks</TabsTrigger>
                <TabsTrigger value="all-tasks">All Tasks</TabsTrigger>
              </TabsList>
              <Button onClick={() => setIsChecklistDialogOpen(true)}>
                <FileCheck className="mr-2 h-4 w-4" />
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

            <TabsContent value="my-tasks" className="mt-6">
              {renderTaskList(myTasks)}
            </TabsContent>
            <TabsContent value="all-tasks" className="mt-6">
              {renderTaskList(filteredTasks)}
            </TabsContent>
          </Tabs>
        ) : (
          <>
            <div className="flex items-center justify-end mb-4">
              <Button onClick={() => setIsChecklistDialogOpen(true)}>
                <FileCheck className="mr-2 h-4 w-4" />
                Create Checklist
              </Button>
            </div>
            <div className="flex gap-4">
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
            {renderTaskList(myTasks)}
          </>
        )}

        <TaskDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          task={selectedTask}
          nomenclature={nomenclature}
          tasksCount={tasks?.length || 0}
          generateTaskNumber={generateTaskNumber}
        />

        <CreateChecklistDialog
          open={isChecklistDialogOpen}
          onOpenChange={setIsChecklistDialogOpen}
        />

        <Dialog open={isItemsDialogOpen} onOpenChange={setIsItemsDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Manage Task Items</DialogTitle>
            </DialogHeader>
            {selectedTask && (
              <TaskItemsManager
                task={selectedTask}
                onClose={() => setIsItemsDialogOpen(false)}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
