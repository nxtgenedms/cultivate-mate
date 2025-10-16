import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle } from "lucide-react";
import { toast } from "sonner";

interface TaskItem {
  id: string;
  label: string;
  section?: string;
  is_required: boolean;
  completed: boolean;
  notes: string;
  sort_order: number;
  item_type?: string;
  response_value?: string;
}

interface TaskItemsManagerProps {
  task: any;
  onClose: () => void;
}

export function TaskItemsManager({ task, onClose }: TaskItemsManagerProps) {
  const [items, setItems] = useState<TaskItem[]>(task.checklist_items || []);
  const queryClient = useQueryClient();

  // Fetch template items to get item_type information
  const { data: templateItems } = useQuery({
    queryKey: ["template-items-for-task", task.id],
    queryFn: async () => {
      const itemIds = (task.checklist_items || []).map((item: any) => item.id);
      if (itemIds.length === 0) return [];

      const { data, error } = await supabase
        .from("checklist_template_items")
        .select("id, item_type")
        .in("id", itemIds);

      if (error) throw error;
      return data;
    },
    enabled: (task.checklist_items || []).length > 0,
  });

  // Merge template item types with task items
  useEffect(() => {
    if (templateItems && templateItems.length > 0) {
      const enrichedItems = (task.checklist_items || []).map((item: any) => {
        const templateItem = templateItems.find(ti => ti.id === item.id);
        return {
          ...item,
          item_type: templateItem?.item_type || item.item_type,
        };
      });
      setItems(enrichedItems);
    }
  }, [templateItems, task.checklist_items]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      const completed = items.filter(item => item.completed).length;
      const total = items.length;

        const { error } = await supabase
        .from("tasks")
        .update({
          checklist_items: items as any,
          completion_progress: { completed, total } as any,
          status: completed === total && total > 0 ? "completed" : task.status,
        })
        .eq("id", task.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task items updated successfully");
      onClose();
    },
    onError: (error) => {
      toast.error("Failed to update task items: " + error.message);
    },
  });

  const handleToggleItem = (itemId: string) => {
    setItems(items.map(item =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    ));
  };

  const handleNotesChange = (itemId: string, notes: string) => {
    setItems(items.map(item =>
      item.id === itemId ? { ...item, notes } : item
    ));
  };

  const handleResponseValueChange = (itemId: string, response_value: string) => {
    setItems(items.map(item =>
      item.id === itemId ? { ...item, response_value } : item
    ));
  };

  const groupedItems = items.reduce((acc, item) => {
    const section = item.section || "General";
    if (!acc[section]) acc[section] = [];
    acc[section].push(item);
    return acc;
  }, {} as Record<string, TaskItem[]>);

  const completedCount = items.filter(item => item.completed).length;
  const totalCount = items.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{task.name}</h3>
          <p className="text-sm text-muted-foreground">
            {completedCount} of {totalCount} items completed
          </p>
        </div>
        <Badge variant={completedCount === totalCount ? "default" : "secondary"}>
          {Math.round((completedCount / totalCount) * 100)}% Complete
        </Badge>
      </div>

      <div className="space-y-4">
        {Object.entries(groupedItems).map(([section, sectionItems]) => (
          <Card key={section}>
            <CardHeader>
              <CardTitle className="text-base">{section}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {sectionItems.map((item) => (
                <div key={item.id} className="space-y-2 border-b pb-4 last:border-b-0">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id={item.id}
                      checked={item.completed}
                      onCheckedChange={() => handleToggleItem(item.id)}
                      className="mt-1"
                    />
                    <div className="flex-1 space-y-2">
                      <label
                        htmlFor={item.id}
                        className={`text-sm font-medium leading-none cursor-pointer flex items-center gap-2 ${
                          item.completed ? "line-through text-muted-foreground" : ""
                        }`}
                      >
                        {item.completed ? (
                          <CheckCircle2 className="h-4 w-4 text-success" />
                        ) : (
                          <Circle className="h-4 w-4" />
                        )}
                        {item.label}
                        {item.is_required && (
                          <Badge variant="outline" className="ml-2">Required</Badge>
                        )}
                      </label>
                      
                      {/* Render input based on item type */}
                      {item.item_type === 'date' && (
                        <Input
                          type="datetime-local"
                          value={item.response_value || ""}
                          onChange={(e) => handleResponseValueChange(item.id, e.target.value)}
                          className="text-sm"
                        />
                      )}
                      {item.item_type === 'number' && (
                        <Input
                          type="number"
                          value={item.response_value || ""}
                          onChange={(e) => handleResponseValueChange(item.id, e.target.value)}
                          className="text-sm"
                          placeholder="Enter number..."
                        />
                      )}
                      {item.item_type === 'text' && (
                        <Input
                          type="text"
                          value={item.response_value || ""}
                          onChange={(e) => handleResponseValueChange(item.id, e.target.value)}
                          className="text-sm"
                          placeholder="Enter text..."
                        />
                      )}
                      {(!item.item_type || item.item_type === 'yes_no' || item.item_type === 'select' || item.item_type === 'batch_info') && (
                        <Textarea
                          placeholder="Add notes..."
                          value={item.notes}
                          onChange={(e) => handleNotesChange(item.id, e.target.value)}
                          rows={2}
                          className="text-sm"
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending}>
          Save Changes
        </Button>
      </div>
    </div>
  );
}
