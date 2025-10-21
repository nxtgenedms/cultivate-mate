import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle2, FileText, Calendar, ArrowRight } from 'lucide-react';
import { getStageLabel, getStageIcon } from '@/lib/batchUtils';
import { cn } from '@/lib/utils';

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
  currentStage: string;
  onGoToTasks: () => void;
}

export function TaskGuideTab({ currentStage, onGoToTasks }: TaskGuideTabProps) {

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
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Task Guide - What to do at each stage
            </CardTitle>
            <CardDescription className="mt-1.5">
              Reference guide for tasks at each lifecycle stage. Go to tasks tab to create them.
            </CardDescription>
          </div>
          <Button onClick={onGoToTasks} variant="default">
            Go to Tasks
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
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
                          "p-3 border rounded-lg bg-card",
                          isCurrent && "border-primary/30 bg-primary/5"
                        )}
                      >
                        <div className="space-y-1">
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
