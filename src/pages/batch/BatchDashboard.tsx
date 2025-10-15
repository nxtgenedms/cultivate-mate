import { useState } from 'react';
import { BatchLayout } from '@/components/BatchLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BatchStatsCard } from '@/components/batch/BatchStatsCard';
import { BatchCard } from '@/components/batch/BatchCard';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Leaf, TrendingUp, AlertCircle, Package, Plus, LayoutGrid, Table2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { getStageLabel, BATCH_STAGES } from '@/lib/batchUtils';

export default function BatchDashboard() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Fetch batch statistics
  const { data: batches, isLoading } = useQuery({
    queryKey: ['batch-lifecycle-records'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('batch_lifecycle_records')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Fetch lookup values for strain display
  const { data: lookupValues } = useQuery({
    queryKey: ['lookup-values-strains'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lookup_values')
        .select('id, value_display, value_key')
        .order('value_display');
      if (error) throw error;
      return data || [];
    },
  });

  const getStrainDisplay = (strainId: string) => {
    if (!strainId) return 'N/A';
    const strain = lookupValues?.find(v => v.id === strainId);
    return strain?.value_display || strainId;
  };

  // Calculate statistics
  const stats = {
    totalActive: batches?.filter(b => b.status === 'in_progress').length || 0,
    totalCompleted: batches?.filter(b => b.status === 'completed').length || 0,
    byStage: batches?.reduce((acc, batch) => {
      const stage = batch.current_stage || 'unknown';
      acc[stage] = (acc[stage] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {},
    recentBatches: batches?.slice(0, 6).map(batch => ({
      ...batch,
      strainDisplay: getStrainDisplay(batch.strain_id)
    })) || [],
  };

  const handleCreateBatch = () => {
    navigate('/batch/master-record?create=true');
  };

  const handleViewBatch = (batch: any) => {
    navigate(`/batch/detail/${batch.id}`);
  };

  const handleEditBatch = (batch: any) => {
    navigate('/batch/master-record');
  };

  return (
    <BatchLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Batch Management Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Complete lifecycle tracking and analytics
            </p>
          </div>
          <Button onClick={handleCreateBatch} size="lg">
            <Plus className="h-4 w-4 mr-2" />
            Create New Batch
          </Button>
        </div>

        {/* Stats Cards */}
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <BatchStatsCard
              title="Active Batches"
              value={stats.totalActive}
              description="Currently in progress"
              icon={Leaf}
              trend={{ value: 12, isPositive: true }}
            />
            <BatchStatsCard
              title="Completed"
              value={stats.totalCompleted}
              description="All lifecycle stages done"
              icon={Package}
            />
            <BatchStatsCard
              title="In Flowering"
              value={stats.byStage[BATCH_STAGES.FLOWERING] || 0}
              description="Critical growth stage"
              icon={TrendingUp}
            />
            <BatchStatsCard
              title="Need Attention"
              value={0}
              description="Overdue or issues"
              icon={AlertCircle}
            />
          </div>
        )}

        {/* Stage Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Batches by Stage</CardTitle>
            <CardDescription>Current distribution across lifecycle stages</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {Object.entries(stats.byStage).map(([stage, count]) => (
                  <div key={stage} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="min-w-[120px]">
                        {getStageLabel(stage)}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {count} {count === 1 ? 'batch' : 'batches'}
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-primary">{count}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Batches */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Recent Batches</CardTitle>
                <CardDescription>Latest batch activities and updates</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <Table2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-64" />
                ))}
              </div>
            ) : stats.recentBatches.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Leaf className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>No batches found</p>
                <p className="text-sm mt-2">Create your first batch to get started</p>
                <Button className="mt-4" onClick={handleCreateBatch}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Batch
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {stats.recentBatches.map((batch) => (
                  <BatchCard
                    key={batch.id}
                    batch={batch}
                    onView={handleViewBatch}
                    onEdit={handleEditBatch}
                  />
                ))}
              </div>
            )}
            
            {stats.recentBatches.length > 0 && (
              <div className="mt-6 text-center">
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/batch/master-record')}
                >
                  View All Batches
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Recent Activity</CardTitle>
            <CardDescription>Latest batch lifecycle events</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : batches && batches.length > 0 ? (
              <div className="space-y-3">
                {batches.slice(0, 5).map((batch) => (
                  <div 
                    key={batch.id} 
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => handleViewBatch(batch)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                      <div>
                        <p className="font-medium">{batch.batch_number}</p>
                        <p className="text-sm text-muted-foreground">
                          {getStageLabel(batch.current_stage)} • {batch.status}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(batch.created_at), 'MMM d, h:mm a')}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No recent activity</p>
            )}
          </CardContent>
        </Card>
      </div>
    </BatchLayout>
  );
}
