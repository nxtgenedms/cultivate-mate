import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { format, differenceInDays, isAfter } from 'date-fns';
import { cn } from '@/lib/utils';
import { getStageColor, getStageLabel, STAGE_ORDER } from '@/lib/batchUtils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { AlertCircle, Calendar, Package, TrendingUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function Reports() {
  // Fetch all active batches for lifecycle view
  const { data: batches, isLoading: batchesLoading } = useQuery({
    queryKey: ['batches-lifecycle'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('batch_lifecycle_records')
        .select('*')
        .in('status', ['active', 'in_progress'])
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch all tasks with user info
  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks-pending'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          assignee_profile:profiles!tasks_assignee_fkey(full_name, email)
        `)
        .in('status', ['pending', 'in_progress'])
        .order('due_date', { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch inventory receipts grouped by product
  const { data: inventoryReceipts, isLoading: inventoryLoading } = useQuery({
    queryKey: ['inventory-receipts-summary'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory_receipts')
        .select('product_name, quantity, unit')
        .order('product_name');
      
      if (error) throw error;
      
      // Group by product
      const grouped = data.reduce((acc: any, item) => {
        const key = `${item.product_name}`;
        if (!acc[key]) {
          acc[key] = { product_name: item.product_name, quantity: 0, unit: item.unit };
        }
        acc[key].quantity += Number(item.quantity);
        return acc;
      }, {});
      
      return Object.values(grouped);
    },
  });

  // Fetch harvest inventory (dry weight by batch)
  const { data: harvestInventory, isLoading: harvestLoading } = useQuery({
    queryKey: ['harvest-inventory'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('batch_lifecycle_records')
        .select('batch_number, total_dry_weight, packing_a_grade, packing_b_grade, packing_c_grade')
        .not('total_dry_weight', 'is', null)
        .order('batch_number', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data;
    },
  });

  // Calculate task metrics by user
  const tasksByUser = tasks?.reduce((acc: any, task) => {
    const userName = task.assignee_profile?.full_name || 'Unassigned';
    const userId = task.assignee || 'unassigned';
    
    if (!acc[userId]) {
      acc[userId] = {
        userName,
        total: 0,
        overdue: 0,
        pending: 0,
        inProgress: 0,
      };
    }
    
    acc[userId].total += 1;
    if (task.status === 'pending') acc[userId].pending += 1;
    if (task.status === 'in_progress') acc[userId].inProgress += 1;
    if (task.due_date && isAfter(new Date(), new Date(task.due_date))) {
      acc[userId].overdue += 1;
    }
    
    return acc;
  }, {});

  const userTaskData = Object.values(tasksByUser || {});

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Management Reports</h1>
          <p className="text-muted-foreground">Comprehensive insights and analytics</p>
        </div>

        <Tabs defaultValue="batches" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="batches">Batch Lifecycle</TabsTrigger>
            <TabsTrigger value="tasks">Tasks Overview</TabsTrigger>
            <TabsTrigger value="inventory">Inventory Levels</TabsTrigger>
            <TabsTrigger value="harvest">Harvest Inventory</TabsTrigger>
          </TabsList>

          {/* Batch Lifecycle Report */}
          <TabsContent value="batches" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Current Batches Lifecycle View
                </CardTitle>
                <CardDescription>
                  Timeline view of all active batches and their current stage
                </CardDescription>
              </CardHeader>
              <CardContent>
                {batchesLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : batches && batches.length > 0 ? (
                  <div className="space-y-3">
                    {batches.map((batch) => {
                      const stageIndex = STAGE_ORDER.indexOf(batch.current_stage);
                      const progress = ((stageIndex + 1) / STAGE_ORDER.length) * 100;
                      const daysInStage = batch.created_at 
                        ? differenceInDays(new Date(), new Date(batch.created_at))
                        : 0;

                      return (
                        <Card key={batch.id} className="overflow-hidden">
                          <div className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <h3 className="font-semibold text-lg">{batch.batch_number}</h3>
                                <Badge className={cn("text-xs", getStageColor(batch.current_stage))}>
                                  {getStageLabel(batch.current_stage)}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                  {daysInStage} days in stage
                                </span>
                              </div>
                              <div className="text-sm font-medium text-primary">
                                {Math.round(progress)}% Complete
                              </div>
                            </div>
                            
                            {/* Gantt-style timeline */}
                            <div className="relative h-10 bg-muted rounded-lg overflow-hidden">
                              <div 
                                className="absolute inset-y-0 left-0 bg-primary/20 transition-all"
                                style={{ width: `${progress}%` }}
                              />
                              <div className="absolute inset-0 flex items-center px-2">
                                <div className="flex w-full justify-between text-xs font-medium">
                                  {STAGE_ORDER.map((stage, idx) => (
                                    <div
                                      key={stage}
                                      className={cn(
                                        "flex items-center gap-1 px-2 py-1 rounded",
                                        idx <= stageIndex 
                                          ? "bg-primary text-primary-foreground" 
                                          : "text-muted-foreground"
                                      )}
                                    >
                                      {idx === stageIndex && "▶ "}
                                      {getStageLabel(stage).split(' ')[0]}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Stage dates */}
                            <div className="mt-2 grid grid-cols-5 gap-2 text-xs text-muted-foreground">
                              <div>Clone: {batch.clone_germination_date ? format(new Date(batch.clone_germination_date), 'MMM dd') : 'N/A'}</div>
                              <div>Hardening: {batch.move_to_hardening_date ? format(new Date(batch.move_to_hardening_date), 'MMM dd') : 'N/A'}</div>
                              <div>Veg: {batch.move_to_veg_date ? format(new Date(batch.move_to_veg_date), 'MMM dd') : 'N/A'}</div>
                              <div>Flowering: {batch.move_to_flowering_date ? format(new Date(batch.move_to_flowering_date), 'MMM dd') : 'N/A'}</div>
                              <div>Harvest: {batch.harvest_date ? format(new Date(batch.harvest_date), 'MMM dd') : 'N/A'}</div>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No active batches found</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tasks Overview Report */}
          <TabsContent value="tasks" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Tasks by User - Overdue Highlighted
                </CardTitle>
                <CardDescription>
                  Pending and in-progress tasks grouped by assignee
                </CardDescription>
              </CardHeader>
              <CardContent>
                {tasksLoading ? (
                  <Skeleton className="h-96 w-full" />
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={userTaskData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="userName" 
                          angle={-45} 
                          textAnchor="end" 
                          height={100}
                          fontSize={12}
                        />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="pending" fill="hsl(var(--warning))" name="Pending" />
                        <Bar dataKey="inProgress" fill="hsl(var(--primary))" name="In Progress" />
                        <Bar dataKey="overdue" fill="hsl(var(--destructive))" name="Overdue" />
                      </BarChart>
                    </ResponsiveContainer>

                    {/* Detailed task list */}
                    <div className="mt-6 space-y-3">
                      <h3 className="font-semibold text-lg">Overdue Tasks Detail</h3>
                      {tasks?.filter(t => t.due_date && isAfter(new Date(), new Date(t.due_date))).map((task) => (
                        <Card key={task.id} className="border-l-4 border-l-destructive">
                          <div className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="space-y-1">
                                <h4 className="font-medium">{task.name}</h4>
                                <p className="text-sm text-muted-foreground">
                                  Assigned to: {task.assignee_profile?.full_name || 'Unassigned'}
                                </p>
                              </div>
                              <div className="text-right">
                                <Badge variant="destructive">
                                  {differenceInDays(new Date(), new Date(task.due_date))} days overdue
                                </Badge>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Due: {format(new Date(task.due_date), 'MMM dd, yyyy')}
                                </p>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                      {tasks?.filter(t => t.due_date && isAfter(new Date(), new Date(t.due_date))).length === 0 && (
                        <p className="text-center text-muted-foreground py-4">No overdue tasks</p>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Inventory Levels Report */}
          <TabsContent value="inventory" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Inventory Levels by Product
                </CardTitle>
                <CardDescription>
                  Current inventory levels grouped by received product
                </CardDescription>
              </CardHeader>
              <CardContent>
                {inventoryLoading ? (
                  <Skeleton className="h-96 w-full" />
                ) : inventoryReceipts && inventoryReceipts.length > 0 ? (
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={inventoryReceipts}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="product_name" 
                        angle={-45} 
                        textAnchor="end" 
                        height={100}
                        fontSize={12}
                      />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="quantity" name="Quantity">
                        {inventoryReceipts.map((entry: any, index: number) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={`hsl(${(index * 40) % 360}, 70%, 50%)`} 
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No inventory data found</p>
                )}

                {/* Summary table */}
                {inventoryReceipts && inventoryReceipts.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-semibold text-lg mb-3">Inventory Summary</h3>
                    <div className="rounded-lg border">
                      <table className="w-full">
                        <thead className="bg-muted">
                          <tr>
                            <th className="text-left p-3 font-semibold">Product Name</th>
                            <th className="text-right p-3 font-semibold">Quantity</th>
                            <th className="text-right p-3 font-semibold">Unit</th>
                          </tr>
                        </thead>
                        <tbody>
                          {inventoryReceipts.map((item: any, idx: number) => (
                            <tr key={idx} className="border-t">
                              <td className="p-3">{item.product_name}</td>
                              <td className="p-3 text-right font-medium">{item.quantity}</td>
                              <td className="p-3 text-right text-muted-foreground">{item.unit}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Harvest Inventory Report */}
          <TabsContent value="harvest" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Harvest Inventory Levels
                </CardTitle>
                <CardDescription>
                  Dry weight and grades by batch
                </CardDescription>
              </CardHeader>
              <CardContent>
                {harvestLoading ? (
                  <Skeleton className="h-96 w-full" />
                ) : harvestInventory && harvestInventory.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={harvestInventory}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="batch_number" 
                          angle={-45} 
                          textAnchor="end" 
                          height={100}
                          fontSize={12}
                        />
                        <YAxis label={{ value: 'Weight (kg)', angle: -90, position: 'insideLeft' }} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="packing_a_grade" stackId="a" fill="hsl(var(--success))" name="A Grade" />
                        <Bar dataKey="packing_b_grade" stackId="a" fill="hsl(var(--warning))" name="B Grade" />
                        <Bar dataKey="packing_c_grade" stackId="a" fill="hsl(var(--destructive))" name="C Grade" />
                      </BarChart>
                    </ResponsiveContainer>

                    {/* Summary table */}
                    <div className="mt-6">
                      <h3 className="font-semibold text-lg mb-3">Harvest Summary</h3>
                      <div className="rounded-lg border">
                        <table className="w-full">
                          <thead className="bg-muted">
                            <tr>
                              <th className="text-left p-3 font-semibold">Batch Number</th>
                              <th className="text-right p-3 font-semibold">Total Dry Weight (kg)</th>
                              <th className="text-right p-3 font-semibold">A Grade (kg)</th>
                              <th className="text-right p-3 font-semibold">B Grade (kg)</th>
                              <th className="text-right p-3 font-semibold">C Grade (kg)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {harvestInventory.map((item, idx) => (
                              <tr key={idx} className="border-t">
                                <td className="p-3 font-medium">{item.batch_number}</td>
                                <td className="p-3 text-right font-semibold">{item.total_dry_weight || 'N/A'}</td>
                                <td className="p-3 text-right text-success">{item.packing_a_grade || '0'}</td>
                                <td className="p-3 text-right text-warning">{item.packing_b_grade || '0'}</td>
                                <td className="p-3 text-right text-destructive">{item.packing_c_grade || '0'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No harvest data found</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
