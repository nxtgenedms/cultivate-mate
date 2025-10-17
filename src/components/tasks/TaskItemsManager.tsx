import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Calendar as CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

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
  readOnly?: boolean;
}

export function TaskItemsManager({ task, onClose, readOnly = false }: TaskItemsManagerProps) {
  const [items, setItems] = useState<TaskItem[]>(task.checklist_items || []);
  const [datePickerOpen, setDatePickerOpen] = useState<string | null>(null);
  const [tempDate, setTempDate] = useState<Date | undefined>();
  const [tempHour, setTempHour] = useState<string>("12");
  const [tempMinute, setTempMinute] = useState<string>("00");
  const [tempPeriod, setTempPeriod] = useState<"AM" | "PM">("AM");
  const queryClient = useQueryClient();

  // Initialize items from task
  useEffect(() => {
    setItems(task.checklist_items || []);
  }, [task.checklist_items]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      const completed = items.filter(item => item.completed).length;
      const total = items.length;

      const { error } = await supabase
        .from("tasks")
        .update({
          checklist_items: items as any,
          completion_progress: { completed, total } as any,
          // Don't auto-change status - user must manually submit for approval
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
    setItems(items.map(item => {
      if (item.id === itemId) {
        // Auto-check the item when notes are entered
        const shouldBeCompleted = notes && notes.trim() !== '';
        return { ...item, notes, completed: shouldBeCompleted };
      }
      return item;
    }));
  };

  const handleResponseValueChange = (itemId: string, response_value: string) => {
    setItems(items.map(item => {
      if (item.id === itemId) {
        // Auto-check the item when data is entered
        const shouldBeCompleted = response_value && response_value.trim() !== '';
        return { ...item, response_value, completed: shouldBeCompleted };
      }
      return item;
    }));
  };

  const handleDateTimeSelect = (itemId: string) => {
    if (!tempDate) return;
    
    let hour = parseInt(tempHour);
    if (tempPeriod === "PM" && hour !== 12) hour += 12;
    if (tempPeriod === "AM" && hour === 12) hour = 0;
    
    const dateTime = new Date(tempDate);
    dateTime.setHours(hour, parseInt(tempMinute));
    
    const formattedDateTime = format(dateTime, "yyyy-MM-dd'T'HH:mm");
    handleResponseValueChange(itemId, formattedDateTime);
    setDatePickerOpen(null);
    setTempDate(undefined);
  };

  const openDatePicker = (itemId: string, currentValue?: string) => {
    setDatePickerOpen(itemId);
    if (currentValue) {
      const date = new Date(currentValue);
      setTempDate(date);
      let hours = date.getHours();
      const period: "AM" | "PM" = hours >= 12 ? "PM" : "AM";
      if (hours > 12) hours -= 12;
      if (hours === 0) hours = 12;
      setTempHour(hours.toString().padStart(2, "0"));
      setTempMinute(date.getMinutes().toString().padStart(2, "0"));
      setTempPeriod(period);
    } else {
      setTempDate(new Date());
      setTempHour("12");
      setTempMinute("00");
      setTempPeriod("AM");
    }
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
                      disabled={readOnly}
                    />
                    <div className="flex-1 space-y-2">
                      <label
                        htmlFor={item.id}
                        className="text-sm font-medium leading-none cursor-pointer flex items-center gap-2"
                      >
                        {item.completed && (
                          <CheckCircle2 className="h-4 w-4 text-success" />
                        )}
                        {item.label}
                        {item.is_required && (
                          <Badge variant="outline" className="ml-2">Required</Badge>
                        )}
                      </label>
                      
                      {/* Render input based on item type - Generic logic */}
                      {item.item_type === 'date' ? (
                        <Popover open={datePickerOpen === item.id} onOpenChange={(open) => {
                          if (open && !readOnly) {
                            openDatePicker(item.id, item.response_value);
                          } else {
                            setDatePickerOpen(null);
                          }
                        }}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !item.response_value && "text-muted-foreground"
                              )}
                              disabled={readOnly}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {item.response_value ? (
                                format(new Date(item.response_value), "PPP 'at' p")
                              ) : (
                                <span>Pick date and time</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <div className="p-4 space-y-4">
                              <Calendar
                                mode="single"
                                selected={tempDate}
                                onSelect={setTempDate}
                                initialFocus
                                className="pointer-events-auto"
                              />
                              <div className="space-y-2">
                                <div className="text-sm font-medium">Time</div>
                                <div className="flex gap-2">
                                  <Select value={tempHour} onValueChange={setTempHour}>
                                    <SelectTrigger className="w-20">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {Array.from({ length: 12 }, (_, i) => {
                                        const hour = (i + 1).toString().padStart(2, "0");
                                        return (
                                          <SelectItem key={hour} value={hour}>
                                            {hour}
                                          </SelectItem>
                                        );
                                      })}
                                    </SelectContent>
                                  </Select>
                                  <span className="flex items-center">:</span>
                                  <Select value={tempMinute} onValueChange={setTempMinute}>
                                    <SelectTrigger className="w-20">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {["00", "15", "30", "45"].map((min) => (
                                        <SelectItem key={min} value={min}>
                                          {min}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <Select value={tempPeriod} onValueChange={(v) => setTempPeriod(v as "AM" | "PM")}>
                                    <SelectTrigger className="w-20">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="AM">AM</SelectItem>
                                      <SelectItem value="PM">PM</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  className="flex-1"
                                  onClick={() => setDatePickerOpen(null)}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  className="flex-1"
                                  onClick={() => handleDateTimeSelect(item.id)}
                                  disabled={!tempDate}
                                >
                                  Select
                                </Button>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      ) : item.item_type === 'number' ? (
                        <Input
                          type="number"
                          value={item.response_value || ""}
                          onChange={(e) => handleResponseValueChange(item.id, e.target.value)}
                          className="text-sm"
                          placeholder="Enter number..."
                          disabled={readOnly}
                        />
                      ) : item.item_type === 'textarea' ? (
                        <Textarea
                          placeholder="Enter text..."
                          value={item.response_value || ""}
                          onChange={(e) => handleResponseValueChange(item.id, e.target.value)}
                          rows={3}
                          className="text-sm"
                          disabled={readOnly}
                        />
                      ) : item.item_type === 'text' ? (
                        <Input
                          type="text"
                          value={item.response_value || ""}
                          onChange={(e) => handleResponseValueChange(item.id, e.target.value)}
                          className="text-sm"
                          placeholder="Enter text..."
                          disabled={readOnly}
                        />
                      ) : (
                        <Textarea
                          placeholder="Add notes..."
                          value={item.notes}
                          onChange={(e) => handleNotesChange(item.id, e.target.value)}
                          rows={2}
                          className="text-sm"
                          disabled={readOnly}
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
        {readOnly ? (
          <Button onClick={onClose}>
            Close
          </Button>
        ) : (
          <>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending}>
              Save Changes
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
