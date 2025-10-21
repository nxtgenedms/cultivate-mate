import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Plus, CheckCircle2, FileText, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { getStageLabel, getStageIcon } from '@/lib/batchUtils';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

const STAGE_ORDER = [
  'preclone',
  'clone_germination',
  'hardening',
  'vegetative',
  'flowering_grow_room',
  'preharvest',
  'harvest',
  'processing_drying',
  'packing_storage'
];

interface TaskGuideTabProps {
  batchId: string;
  currentStage: string;
  onTaskCreated?: () => void;
}

export function TaskGuideTab({ batchId, currentStage, onTaskCreated }: TaskGuideTabProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch checklist templates
  const { data: templates, isLoading } = useQuery({
    queryKey: ['checklist-templates-guide'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('checklist_templates')
        .select('*')
        .eq('is_active', true)
        .eq('is_batch_specific', true)
        .order('lifecycle_phase', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
  });

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async ({ templateId, templateName, sofNumber }: { templateId: string; templateName: string; sofNumber: string }) => {
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
          description: `Created from task guide`,
          batch_id: batchId,
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
      queryClient.invalidateQueries({ queryKey: ['batch-tasks'] });
      toast.success('Task created successfully');
      onTaskCreated?.();
    },
    onError: (error) => {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
    },
  });

  // Group templates by lifecycle phase
  const templatesByStage = templates?.reduce((acc, template) => {
    const stage = template.lifecycle_phase || 'general';
    if (!acc[stage]) acc[stage] = [];
    acc[stage].push(template);
    return acc;
  }, {} as Record<string, typeof templates>);

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading task guide...</div>;
  }

  const currentStageIndex = STAGE_ORDER.indexOf(currentStage);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Task Guide - What to do at each stage
        </CardTitle>
        <CardDescription>
          Click on any task below to create it for this batch. Tasks are organized by lifecycle stage.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible defaultValue={currentStage} className="w-full">
          {STAGE_ORDER.map((stage, index) => {
            const stageTemplates = templatesByStage?.[stage] || [];
            const isCurrent = stage === currentStage;
            const isPast = index < currentStageIndex;
            const isFuture = index > currentStageIndex;

            if (stageTemplates.length === 0) return null;

            return (
              <AccordionItem key={stage} value={stage}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-2xl">{getStageIcon(stage)}</span>
                    <div className="flex flex-col items-start">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{getStageLabel(stage)}</span>
                        {isCurrent && (
                          <Badge variant="default" className="text-xs">
                            Current Stage
                          </Badge>
                        )}
                        {isPast && (
                          <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/20">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Completed
                          </Badge>
                        )}
                        {isFuture && (
                          <Badge variant="secondary" className="text-xs">
                            Upcoming
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {stageTemplates.length} task{stageTemplates.length !== 1 ? 's' : ''} available
                      </span>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 pt-2">
                    {stageTemplates.map((template) => (
                      <div
                        key={template.id}
                        className={cn(
                          "flex items-center justify-between p-3 border rounded-lg bg-card",
                          isCurrent && "border-primary/30 bg-primary/5"
                        )}
                      >
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="font-mono text-xs">
                              {template.sof_number}
                            </Badge>
                            <span className="font-medium">{template.template_name}</span>
                          </div>
                          {template.description && (
                            <p className="text-sm text-muted-foreground">{template.description}</p>
                          )}
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>Frequency: {template.frequency}</span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => createTaskMutation.mutate({
                            templateId: template.id,
                            templateName: template.template_name,
                            sofNumber: template.sof_number
                          })}
                          disabled={createTaskMutation.isPending}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Create Task
                        </Button>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </CardContent>
    </Card>
  );
}
