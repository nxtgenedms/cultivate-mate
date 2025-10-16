import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight } from "lucide-react";
import { toast } from "sonner";

interface ChecklistItem {
  id: string;
  label: string;
  section: string | null;
  is_required: boolean;
  completed: boolean;
  notes: string;
}

interface TaskChecklistViewProps {
  task: any;
}

export function TaskChecklistView({ task }: TaskChecklistViewProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [items, setItems] = useState<ChecklistItem[]>(task.checklist_items || []);
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async (updatedItems: ChecklistItem[]) => {
      const completedCount = updatedItems.filter(item => item.completed).length;
      
      const { error } = await supabase
        .from("tasks")
        .update({
          checklist_items: updatedItems as any,
          completion_progress: {
            completed: completedCount,
            total: updatedItems.length
          } as any,
          status: completedCount === updatedItems.length ? "completed" : task.status
        })
        .eq("id", task.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Checklist updated");
    },
    onError: (error) => {
      toast.error("Failed to update: " + error.message);
    },
  });

  const handleCheckItem = (itemId: string, checked: boolean) => {
    const updatedItems = items.map(item =>
      item.id === itemId ? { ...item, completed: checked } : item
    );
    setItems(updatedItems);
    updateMutation.mutate(updatedItems);
  };

  const handleNotesChange = (itemId: string, notes: string) => {
    const updatedItems = items.map(item =>
      item.id === itemId ? { ...item, notes } : item
    );
    setItems(updatedItems);
  };

  const handleSaveNotes = (itemId: string) => {
    updateMutation.mutate(items);
  };

  const progress = task.completion_progress || { completed: 0, total: 0 };
  const hasItems = items && items.length > 0;

  if (!hasItems) return null;

  // Group items by section
  const itemsBySection = items.reduce((acc, item) => {
    const section = item.section || "General";
    if (!acc[section]) acc[section] = [];
    acc[section].push(item);
    return acc;
  }, {} as Record<string, ChecklistItem[]>);

  return (
    <Card className="mt-4">
      <CardHeader className="cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
            <CardTitle className="text-lg">
              Checklist Items ({progress.completed}/{progress.total})
            </CardTitle>
          </div>
          <div className="text-sm text-muted-foreground">
            {Math.round((progress.completed / progress.total) * 100)}% Complete
          </div>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-6">
          {Object.entries(itemsBySection).map(([section, sectionItems]) => (
            <div key={section} className="space-y-3">
              <h4 className="font-semibold text-sm text-muted-foreground">{section}</h4>
              {sectionItems.map((item) => (
                <div key={item.id} className="space-y-2 border-l-2 border-border pl-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id={item.id}
                      checked={item.completed}
                      onCheckedChange={(checked) => handleCheckItem(item.id, checked as boolean)}
                      className="mt-1"
                    />
                    <div className="flex-1 space-y-2">
                      <label
                        htmlFor={item.id}
                        className={`text-sm font-medium leading-none cursor-pointer ${
                          item.completed ? "line-through text-muted-foreground" : ""
                        }`}
                      >
                        {item.label}
                        {item.is_required && <span className="text-destructive ml-1">*</span>}
                      </label>
                      <Textarea
                        placeholder="Add notes..."
                        value={item.notes}
                        onChange={(e) => handleNotesChange(item.id, e.target.value)}
                        onBlur={() => handleSaveNotes(item.id)}
                        className="min-h-[60px]"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </CardContent>
      )}
    </Card>
  );
}
