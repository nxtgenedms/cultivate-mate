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
  // Fetch all active batches for lifecycle view with strain info
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

  // Fetch lookup values separately
  const { data: lookupValues } = useQuery({
    queryKey: ['lookup-values-strains'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lookup_values')
        .select('id, value_display');
      if (error) throw error;
      return data;
    },
  });

  const getStrainName = (strainId: string) => {
    return lookupValues?.find(v => v.id === strainId)?.value_display || 'Unknown';
  };

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

  // Calculate batch metrics
  const batchesByStrain = batches?.reduce((acc: any, batch) => {
    const strain = getStrainName(batch.strain_id || '');
    acc[strain] = (acc[strain] || 0) + 1;
    return acc;
  }, {});

  const batchesByStage = batches?.reduce((acc: any, batch) => {
    const stage = getStageLabel(batch.current_stage);
    acc[stage] = (acc[stage] || 0) + 1;
    return acc;
  }, {});

  const strainChartData = Object.entries(batchesByStrain || {}).map(([name, value]) => ({
    name,
    value,
  }));

  const stageChartData = Object.entries(batchesByStage || {}).map(([name, value]) => ({
    name,
    value,
  }));

  const totalBatches = batches?.length || 0;
  const totalPlants = batches?.reduce((sum, batch) => {
    const plants = 
      batch.current_stage === 'clone_germination' ? batch.total_clones_plants :
      batch.current_stage === 'hardening' ? batch.hardening_number_clones :
      batch.current_stage === 'vegetative' ? batch.veg_number_plants :
      batch.current_stage === 'flowering_grow_room' ? batch.flowering_number_plants :
      batch.current_stage === 'harvest' ? batch.harvest_number_plants : 0;
    return sum + (plants || 0);
  }, 0) || 0;

  const survivalRate = 100; // Default for now, can be calculated based on mortality data

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
            {batchesLoading ? (
              <div className="grid grid-cols-4 gap-4">
                <Skeleton className="h-64 col-span-2" />
                <Skeleton className="h-64" />
                <Skeleton className="h-64" />
              </div>
            ) : (
              <>
                {/* Top Row - 3 Cards */}
                <div className="grid grid-cols-4 gap-4">
                  {/* Batches per Strain Chart - 2 columns */}
                  <Card className="col-span-2">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-semibold">No. batches per strain</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={strainChartData} layout="vertical" margin={{ left: 10, right: 10 }}>
                          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                          <XAxis type="number" fontSize={11} />
                          <YAxis dataKey="name" type="category" width={80} fontSize={11} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'hsl(var(--background))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '6px',
                              fontSize: '12px'
                            }}
                          />
                          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                            {strainChartData.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={
                                  index === 0 ? 'hsl(0, 70%, 60%)' :
                                  index === 1 ? 'hsl(100, 60%, 50%)' :
                                  index === 2 ? 'hsl(200, 65%, 55%)' :
                                  `hsl(${(index * 60) % 360}, 60%, 55%)`
                                } 
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Batches per Stage Chart - 1 column */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-semibold">No. batches per stage</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={stageChartData} layout="vertical" margin={{ left: 10, right: 10 }}>
                          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                          <XAxis type="number" fontSize={11} />
                          <YAxis dataKey="name" type="category" width={70} fontSize={10} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'hsl(var(--background))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '6px',
                              fontSize: '12px'
                            }}
                          />
                          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                            {stageChartData.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={
                                  entry.name.includes('Hardening') ? 'hsl(220, 70%, 60%)' :
                                  entry.name.includes('Clone') || entry.name.includes('Germination') ? 'hsl(150, 60%, 50%)' :
                                  entry.name.includes('Vegetative') ? 'hsl(140, 55%, 50%)' :
                                  entry.name.includes('Harvest') ? 'hsl(160, 55%, 50%)' :
                                  'hsl(200, 60%, 55%)'
                                } 
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Metrics Card - 1 column */}
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-xs font-medium text-muted-foreground">No. Batches</CardTitle>
                        <TrendingUp className="h-4 w-4 text-success" />
                      </div>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <div className="text-5xl font-bold mb-6">{totalBatches}</div>
                      <div className="pt-4 border-t">
                        <div className="flex items-start justify-between mb-1">
                          <span className="text-xs font-medium text-muted-foreground">Survival Rate</span>
                          <TrendingUp className="h-4 w-4 text-success" />
                        </div>
                        <div className="text-3xl font-bold text-success">{survivalRate}%</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Full Width - Plants in Active Batches */}
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-xs font-medium text-muted-foreground">No. Plants in Active Batches</CardTitle>
                      <Package className="h-5 w-5 text-success" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-5xl font-bold">{totalPlants.toLocaleString()}</div>
                  </CardContent>
                </Card>

                {/* Batch List Table */}
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg">Batch List</CardTitle>
                    <CardDescription className="text-sm">Detailed view of all active batches</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-lg border overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-muted/50">
                          <tr>
                            <th className="text-left p-3 font-semibold text-xs">ID</th>
                            <th className="text-left p-3 font-semibold text-xs">Nomenclature</th>
                            <th className="text-left p-3 font-semibold text-xs">No. Plants</th>
                            <th className="text-left p-3 font-semibold text-xs">Strain</th>
                            <th className="text-left p-3 font-semibold text-xs">Plant Stage</th>
                            <th className="text-left p-3 font-semibold text-xs">Status</th>
                            <th className="text-left p-3 font-semibold text-xs">Creation Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {batches && batches.length > 0 ? (
                            batches.map((batch, idx) => {
                              const currentPlants = 
                                batch.current_stage === 'clone_germination' ? batch.total_clones_plants :
                                batch.current_stage === 'hardening' ? batch.hardening_number_clones :
                                batch.current_stage === 'vegetative' ? batch.veg_number_plants :
                                batch.current_stage === 'flowering_grow_room' ? batch.flowering_number_plants :
                                batch.current_stage === 'harvest' ? batch.harvest_number_plants : 0;

                              return (
                                <tr key={batch.id} className="border-t hover:bg-muted/30 transition-colors">
                                  <td className="p-3 text-xs">{idx + 1}</td>
                                  <td className="p-3 text-xs font-medium">{batch.batch_number}</td>
                                  <td className="p-3 text-xs font-bold text-success">
                                    {currentPlants || 'N/A'}
                                  </td>
                                  <td className="p-3 text-xs">{getStrainName(batch.strain_id || '')}</td>
                                  <td className="p-3">
                                    <Badge variant="secondary" className="text-xs font-normal">
                                      {getStageLabel(batch.current_stage)}
                                    </Badge>
                                  </td>
                                  <td className="p-3 text-xs">{batch.status}</td>
                                  <td className="p-3 text-xs text-muted-foreground">
                                    {format(new Date(batch.created_at), 'yyyy-MM-dd HH:mm')}
                                  </td>
                                </tr>
                              );
                            })
                          ) : (
                            <tr>
                              <td colSpan={7} className="p-8 text-center text-sm text-muted-foreground">
                                No active batches found
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
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
                  <div className="space-y-6">
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={userTaskData}>
                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
                        <XAxis 
                          dataKey="userName" 
                          angle={-45} 
                          textAnchor="end" 
                          height={100}
                          fontSize={12}
                        />
                        <YAxis />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--background))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                        />
                        <Legend 
                          wrapperStyle={{ paddingTop: '20px' }}
                          iconType="square"
                        />
                        <Bar 
                          dataKey="pending" 
                          stackId="a"
                          fill="hsl(45, 90%, 55%)" 
                          name="Pending" 
                          radius={[0, 0, 0, 0]}
                        />
                        <Bar 
                          dataKey="inProgress" 
                          stackId="a"
                          fill="hsl(142, 70%, 45%)" 
                          name="In Progress" 
                          radius={[0, 0, 0, 0]}
                        />
                        <Bar 
                          dataKey="overdue" 
                          stackId="a"
                          fill="hsl(0, 85%, 60%)" 
                          name="Overdue" 
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Overdue Tasks Detail */}
            <Card>
              <CardHeader>
                <CardTitle>Overdue Tasks Detail</CardTitle>
              </CardHeader>
              <CardContent>
                {tasksLoading ? (
                  <Skeleton className="h-32 w-full" />
                ) : tasks?.filter(t => t.due_date && isAfter(new Date(), new Date(t.due_date))).length > 0 ? (
                  <div className="rounded-lg border overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-muted">
                        <tr>
                          <th className="text-left p-3 font-semibold text-sm">Task Name</th>
                          <th className="text-left p-3 font-semibold text-sm">Assigned To</th>
                          <th className="text-left p-3 font-semibold text-sm">Due Date</th>
                          <th className="text-left p-3 font-semibold text-sm">Days Overdue</th>
                          <th className="text-left p-3 font-semibold text-sm">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tasks?.filter(t => t.due_date && isAfter(new Date(), new Date(t.due_date))).map((task) => (
                          <tr key={task.id} className="border-t hover:bg-muted/50">
                            <td className="p-3 text-sm font-medium">{task.name}</td>
                            <td className="p-3 text-sm">{task.assignee_profile?.full_name || 'Unassigned'}</td>
                            <td className="p-3 text-sm text-muted-foreground">
                              {format(new Date(task.due_date), 'MMM dd, yyyy')}
                            </td>
                            <td className="p-3">
                              <Badge variant="destructive" className="font-semibold">
                                {differenceInDays(new Date(), new Date(task.due_date))} days
                              </Badge>
                            </td>
                            <td className="p-3">
                              <Badge variant="outline" className="text-xs">
                                {task.status}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground text-lg">No overdue tasks</p>
                  </div>
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
