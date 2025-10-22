import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QuickTaskReference } from '@/components/dashboard/QuickTaskReference';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, isToday, isPast, parseISO } from 'date-fns';
import { Loader2, CheckCircle2, Clock, AlertCircle, ArrowRight, Plus } from 'lucide-react';
import { TASK_CATEGORIES } from '@/lib/taskCategoryUtils';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Fetch user's tasks
  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: ['user-tasks', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('assignee', user!.id)
        .in('status', ['draft', 'in_progress', 'pending'])
        .order('due_date', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch user profile
  const { data: profile } = useQuery({
    queryKey: ['user-profile', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user!.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading || tasksLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const userName = profile?.full_name || user?.email?.split('@')[0] || 'User';
  const currentDate = format(new Date(), 'EEEE, MMMM d, yyyy');

  // Calculate task stats - only for open tasks
  const openTasks = tasks || [];
  const pendingApprovals = openTasks.filter(t => t.status === 'pending_approval').length;
  const inProgress = openTasks.filter(t => t.status === 'in_progress').length;
  const draftTasks = openTasks.filter(t => t.status === 'draft').length;
  const overdue = openTasks.filter(t => t.due_date && isPast(parseISO(t.due_date))).length;

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      draft: 'secondary',
      in_progress: 'default',
      completed: 'outline',
      cancelled: 'destructive',
    };
    return <Badge variant={variants[status] || 'secondary'}>{status.replace('_', ' ')}</Badge>;
  };

  const getApprovalBadge = (status: string | null) => {
    if (!status) return null;
    const colors: Record<string, string> = {
      draft: 'bg-gray-500',
      pending: 'bg-yellow-500',
      approved: 'bg-green-500',
      rejected: 'bg-red-500',
    };
    return <Badge className={colors[status] || 'bg-gray-500'}>{status}</Badge>;
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {userName}</h1>
          <p className="text-sm text-muted-foreground">{currentDate}</p>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open Tasks</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{openTasks.length}</div>
              <p className="text-xs text-muted-foreground">Assigned to you</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingApprovals}</div>
              <p className="text-xs text-muted-foreground">Awaiting review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inProgress}</div>
              <p className="text-xs text-muted-foreground">Active tasks</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overdue}</div>
              <p className="text-xs text-muted-foreground">Past due date</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabbed Task Views */}
        <Card>
          <Tabs defaultValue="open-tasks" className="w-full">
            <CardHeader className="pb-3">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="open-tasks">
                  Open Tasks ({openTasks.length})
                </TabsTrigger>
                <TabsTrigger value="task-reference">
                  Daily/Weekly Task Guide
                </TabsTrigger>
              </TabsList>
            </CardHeader>
            
            <TabsContent value="open-tasks" className="mt-0">
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">Tasks requiring your attention</p>
                {openTasks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle2 className="mx-auto h-12 w-12 mb-2 opacity-50" />
                    <p>No open tasks - you're all caught up!</p>
                    <Button variant="link" onClick={() => navigate('/tasks')} className="mt-2">
                      Browse all tasks
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {openTasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                        onClick={() => navigate('/tasks')}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm truncate">{task.name}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{task.task_number}</span>
                            {task.due_date && (
                              <>
                                <span>•</span>
                                <span className={isPast(parseISO(task.due_date)) ? 'text-red-500 font-medium' : ''}>
                                  Due: {format(parseISO(task.due_date), 'MMM d, yyyy')}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {task.status === 'pending_approval' && getApprovalBadge('pending')}
                          {getStatusBadge(task.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </TabsContent>

            <TabsContent value="task-reference" className="mt-0">
              <div className="px-6 pb-6">
                <QuickTaskReference />
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </Layout>
  );
}
