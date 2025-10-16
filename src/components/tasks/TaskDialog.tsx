import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: any;
  nomenclature: any;
  tasksCount: number;
  generateTaskNumber: (formatPattern: string, count: number) => string;
}

export function TaskDialog({
  open,
  onOpenChange,
  task,
  nomenclature,
  tasksCount,
  generateTaskNumber,
}: TaskDialogProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    due_date: "",
    assignee: "",
    status: "draft",
    template_id: "",
  });

  const { data: templates } = useQuery({
    queryKey: ["checklist-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("checklist_templates")
        .select("*")
        .eq("is_active", true)
        .order("template_name");

      if (error) throw error;
      return data;
    },
  });

  const { data: templateItems } = useQuery({
    queryKey: ["template-items", formData.template_id],
    queryFn: async () => {
      if (!formData.template_id) return [];
      
      const { data, error } = await supabase
        .from("checklist_template_items")
        .select("*")
        .eq("template_id", formData.template_id)
        .eq("is_required", true)
        .order("sort_order");

      if (error) throw error;
      return data;
    },
    enabled: !!formData.template_id,
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

  useEffect(() => {
    if (task) {
      setFormData({
        name: task.name || "",
        description: task.description || "",
        due_date: task.due_date || "",
        assignee: task.assignee || "",
        status: task.status || "draft",
        template_id: "",
      });
    } else {
      setFormData({
        name: "",
        description: "",
        due_date: "",
        assignee: "",
        status: "draft",
        template_id: "",
      });
    }
  }, [task, open]);

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const taskNumber = generateTaskNumber(
        nomenclature?.format_pattern || "TA-{counter:4}",
        tasksCount
      );

      // If template is selected, create ONE task with all checklist items
      if (data.template_id && templateItems && templateItems.length > 0) {
        const template = templates?.find(t => t.id === data.template_id);
        
        const checklistItems = templateItems.map((item, index) => ({
          id: item.id,
          label: item.item_label,
          section: item.section_name,
          is_required: item.is_required,
          completed: false,
          notes: "",
          item_type: item.item_type,
          response_value: "",
          sort_order: index
        }));

        const { error } = await supabase.from("tasks").insert({
          task_number: taskNumber,
          name: `${template?.sof_number}: ${template?.template_name}`,
          description: template?.description || null,
          due_date: data.due_date || null,
          assignee: data.assignee || null,
          status: data.status,
          template_item_id: data.template_id,
          checklist_items: checklistItems as any,
          completion_progress: { completed: 0, total: checklistItems.length } as any,
          created_by: user.id,
        });

        if (error) throw error;
      } else {
        // Single task creation without checklist
        const { error } = await supabase.from("tasks").insert({
          name: data.name,
          description: data.description || null,
          due_date: data.due_date || null,
          assignee: data.assignee || null,
          status: data.status,
          task_number: taskNumber,
          checklist_items: [] as any,
          completion_progress: { completed: 0, total: 0 } as any,
          created_by: user.id,
        });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task created successfully");
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error("Failed to create task: " + error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase
        .from("tasks")
        .update(data)
        .eq("id", task.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task updated successfully");
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error("Failed to update task: " + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.template_id && !formData.name.trim()) {
      toast.error("Task name is required");
      return;
    }

    if (task) {
      // For updates, don't include template_id as it's not a field in the tasks table
      const updateData = {
        name: formData.name,
        description: formData.description || null,
        due_date: formData.due_date || null,
        assignee: formData.assignee || null,
        status: formData.status,
      };
      updateMutation.mutate(updateData);
    } else {
      const submitData = {
        name: formData.name,
        description: formData.description || null,
        due_date: formData.due_date || null,
        assignee: formData.assignee || null,
        status: formData.status,
        template_id: formData.template_id || null,
      };
      createMutation.mutate(submitData);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{task ? "Edit Task" : "Create New Task"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!task && (
            <div className="space-y-2">
              <Label htmlFor="template">Create from Template (Optional)</Label>
              <Select
                value={formData.template_id || "none"}
                onValueChange={(value) =>
                  setFormData({ ...formData, template_id: value === "none" ? "" : value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Template (Single Task)</SelectItem>
                  {templates?.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.template_name} ({template.sof_number})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formData.template_id && templateItems && templateItems.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  Will create {templateItems.length} task(s) from template items
                </p>
              )}
            </div>
          )}

          {!formData.template_id && (
            <div className="space-y-2">
              <Label htmlFor="name">Task Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter task name"
                required={!formData.template_id}
              />
            </div>
          )}

          {!formData.template_id && (
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Enter task description"
                rows={3}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="due_date">Due Date & Time</Label>
            <Input
              id="due_date"
              type="datetime-local"
              value={formData.due_date}
              onChange={(e) =>
                setFormData({ ...formData, due_date: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="assignee">Assignee</Label>
            <Select
              value={formData.assignee || "unassigned"}
              onValueChange={(value) =>
                setFormData({ ...formData, assignee: value === "unassigned" ? "" : value })
              }
            >
              <SelectTrigger>
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

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) =>
                setFormData({ ...formData, status: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {task ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
