import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Calendar, User, ChevronDown, ChevronRight, CheckCircle2, Circle } from "lucide-react";
import { format } from "date-fns";

interface TaskTreeViewProps {
  task: any;
  onEdit: (task: any) => void;
  onDelete: (taskId: string) => void;
  getStatusColor: (status: string) => string;
  getStatusLabel: (status: string) => string;
}

export function TaskTreeView({ 
  task, 
  onEdit, 
  onDelete, 
  getStatusColor, 
  getStatusLabel 
}: TaskTreeViewProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { data: checklistItems, isLoading: itemsLoading } = useQuery({
    queryKey: ["checklist-items", task.checklist_id],
    queryFn: async () => {
      if (!task.checklist_id) return null;

      const { data, error } = await supabase
        .from("checklist_item_responses")
        .select(`
          *,
          template_item:checklist_template_items(
            item_label,
            item_type,
            section_name
          )
        `)
        .eq("instance_id", task.checklist_id)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!task.checklist_id && isOpen,
  });

  const hasChecklist = !!task.checklist_id;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-3">
                {hasChecklist && (
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="p-0 h-6 w-6">
                      {isOpen ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                )}
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
                onClick={() => onEdit(task)}
              >
                Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDelete(task.id)}
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

          {hasChecklist && (
            <CollapsibleContent className="mt-4">
              {itemsLoading ? (
                <div className="text-sm text-muted-foreground py-4">
                  Loading checklist items...
                </div>
              ) : checklistItems && checklistItems.length > 0 ? (
                <div className="space-y-2 border-l-2 border-muted pl-4 ml-2">
                  <h4 className="text-sm font-semibold mb-3">Checklist Items:</h4>
                  {checklistItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start gap-3 py-2 text-sm"
                    >
                      {item.response_value === "yes" || item.response_value === "true" ? (
                        <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                      ) : (
                        <Circle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <div className="font-medium">
                          {item.template_item?.item_label || "Checklist Item"}
                        </div>
                        {item.template_item?.section_name && (
                          <div className="text-xs text-muted-foreground">
                            Section: {item.template_item.section_name}
                          </div>
                        )}
                        {item.notes && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Note: {item.notes}
                          </div>
                        )}
                        {item.action_required && (
                          <Badge variant="destructive" className="mt-1 text-xs">
                            Action Required
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground py-4">
                  No checklist items found
                </div>
              )}
            </CollapsibleContent>
          )}
        </CardContent>
      </Collapsible>
    </Card>
  );
}
