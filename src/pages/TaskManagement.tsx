import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Calendar, User, Search } from "lucide-react";
import { toast } from "sonner";
import { TaskDialog } from "@/components/tasks/TaskDialog";
import { format } from "date-fns";
import { Layout } from "@/components/Layout";
import { useIsAdmin } from "@/hooks/useUserRoles";
import { useAuth } from "@/contexts/AuthContext";

export default function TaskManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const queryClient = useQueryClient();
  const isAdmin = useIsAdmin();
  const { user } = useAuth();

  const { data: tasks, isLoading } = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select(`
          *,
          creator:profiles!tasks_created_by_fkey(full_name),
          assigned_to:profiles!tasks_assignee_fkey(full_name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

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
      
      return matchesSearch && matchesDate;
    });
  }, [tasks, searchTerm, dateFilter]);

  const myTasks = useMemo(() => 
    filteredTasks.filter(task => task.created_by === user?.id || task.assignee === user?.id),
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

    return (
      <div className="grid gap-4">
        {taskList.map((task) => (
          <Card key={task.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-xl">{task.name}</CardTitle>
                    <Badge className={getStatusColor(task.status)}>
                      {getStatusLabel(task.status)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {task.task_number}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(task)}
                  >
                    Edit
                  </Button>
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
              {task.description && (
                <p className="text-sm text-muted-foreground mb-4">
                  {task.description}
                </p>
              )}
              <div className="flex flex-wrap gap-4 text-sm">
                {task.due_date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      Due: {format(new Date(task.due_date), "PPP")}
                    </span>
                  </div>
                )}
                {task.creator && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>Created by: {task.creator.full_name}</span>
                  </div>
                )}
                {task.assigned_to && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>Assigned to: {task.assigned_to.full_name}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">Task Management</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage and track your tasks
            </p>
          </div>
          <Button onClick={handleNewTask}>
            <Plus className="mr-2 h-4 w-4" />
            New Task
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

        {isLoading ? (
          <div className="text-center py-12">Loading tasks...</div>
        ) : isAdmin ? (
          <Tabs defaultValue="my-tasks" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="my-tasks">My Tasks</TabsTrigger>
              <TabsTrigger value="all-tasks">All Tasks</TabsTrigger>
            </TabsList>
            <TabsContent value="my-tasks" className="mt-6">
              {renderTaskList(myTasks)}
            </TabsContent>
            <TabsContent value="all-tasks" className="mt-6">
              {renderTaskList(filteredTasks)}
            </TabsContent>
          </Tabs>
        ) : (
          renderTaskList(myTasks)
        )}

        <TaskDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          task={selectedTask}
          nomenclature={nomenclature}
          tasksCount={tasks?.length || 0}
          generateTaskNumber={generateTaskNumber}
        />
      </div>
    </Layout>
  );
}
