import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Calendar, FileText, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export function QuickTaskReference() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch daily and weekly templates
  const { data: templates, isLoading } = useQuery({
    queryKey: ['quick-task-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('checklist_templates')
        .select('*')
        .eq('is_active', true)
        .in('frequency', ['daily', 'weekly'])
        .order('frequency', { ascending: true })
        .order('template_name', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
  });

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async ({ templateId, templateName, sofNumber, isBatchSpecific }: { 
      templateId: string; 
      templateName: string; 
      sofNumber: string;
      isBatchSpecific: boolean;
    }) => {
      // Generate task number
      const { data: taskNumber, error: taskNumberError } = await supabase
        .rpc('generate_task_number');
      
      if (taskNumberError) throw taskNumberError;

      // Fetch template items
      const { data: templateItems, error: itemsError } = await supabase
        .from('checklist_template_items')
        .select('*')
        .eq('template_id', templateId)
        .order('sort_order', { ascending: true });
      
      if (itemsError) throw itemsError;

      // Create checklist items
      const checklistItems = templateItems?.map(item => ({
        id: crypto.randomUUID(),
        label: item.item_label,
        section: item.section_name || 'General',
        item_type: item.item_type,
        is_required: item.is_required,
        sort_order: item.sort_order,
        completed: false,
        response_value: null,
        notes: null
      })) || [];

      // Create task
      const { error: taskError } = await supabase
        .from('tasks')
        .insert({
          task_number: taskNumber,
          name: `${sofNumber}: ${templateName}`,
          description: isBatchSpecific 
            ? 'Created from quick reference - Please assign to a batch' 
            : 'Created from quick reference',
          status: 'draft',
          checklist_items: checklistItems as any,
          completion_progress: {
            completed: 0,
            total: checklistItems.length
          } as any,
          created_by: user?.id,
          assignee: user?.id,
        });

      if (taskError) throw taskError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-tasks'] });
      toast.success('Task created successfully');
      navigate('/tasks');
    },
    onError: (error) => {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
    },
  });

  const dailyTasks = templates?.filter(t => t.frequency === 'daily') || [];
  const weeklyTasks = templates?.filter(t => t.frequency === 'weekly') || [];

  if (isLoading) {
    return null;
  }

  if (dailyTasks.length === 0 && weeklyTasks.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            <CardTitle>Quick Task Reference</CardTitle>
          </div>
        </div>
        <CardDescription>
          Common daily and weekly tasks. Click to create a task from any template.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="daily" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="daily">
              Daily Tasks ({dailyTasks.length})
            </TabsTrigger>
            <TabsTrigger value="weekly">
              Weekly Tasks ({weeklyTasks.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="daily" className="mt-4">
            {dailyTasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No daily tasks configured
              </div>
            ) : (
              <div className="space-y-2">
                {dailyTasks.map((template) => (
                  <div
                    key={template.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="font-mono text-xs">
                          {template.sof_number}
                        </Badge>
                        <span className="font-medium text-sm">{template.template_name}</span>
                        {template.is_batch_specific && (
                          <Badge variant="secondary" className="text-xs">
                            Batch-specific
                          </Badge>
                        )}
                      </div>
                      {template.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {template.description}
                        </p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => createTaskMutation.mutate({
                        templateId: template.id,
                        templateName: template.template_name,
                        sofNumber: template.sof_number,
                        isBatchSpecific: template.is_batch_specific
                      })}
                      disabled={createTaskMutation.isPending}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Create
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="weekly" className="mt-4">
            {weeklyTasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No weekly tasks configured
              </div>
            ) : (
              <div className="space-y-2">
                {weeklyTasks.map((template) => (
                  <div
                    key={template.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="font-mono text-xs">
                          {template.sof_number}
                        </Badge>
                        <span className="font-medium text-sm">{template.template_name}</span>
                        {template.is_batch_specific && (
                          <Badge variant="secondary" className="text-xs">
                            Batch-specific
                          </Badge>
                        )}
                      </div>
                      {template.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {template.description}
                        </p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => createTaskMutation.mutate({
                        templateId: template.id,
                        templateName: template.template_name,
                        sofNumber: template.sof_number,
                        isBatchSpecific: template.is_batch_specific
                      })}
                      disabled={createTaskMutation.isPending}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Create
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
