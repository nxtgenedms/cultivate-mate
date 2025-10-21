import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, BookOpen, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function QuickTaskReference() {
  const navigate = useNavigate();

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
          <div>
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              <CardTitle>Quick Task Reference</CardTitle>
            </div>
            <CardDescription className="mt-1.5">
              Common daily and weekly tasks. Reference guide - go to task page to create them.
            </CardDescription>
          </div>
          <Button onClick={() => navigate('/tasks')} variant="default">
            Go to Task Page
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
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
                    className="p-3 border rounded-lg"
                  >
                    <div className="space-y-1">
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
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {template.description}
                        </p>
                      )}
                    </div>
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
                    className="p-3 border rounded-lg"
                  >
                    <div className="space-y-1">
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
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {template.description}
                        </p>
                      )}
                    </div>
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
