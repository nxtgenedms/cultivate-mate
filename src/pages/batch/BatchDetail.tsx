import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BatchLayout } from '@/components/BatchLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BatchProgressTimeline } from '@/components/batch/BatchProgressTimeline';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Edit, TrendingUp, Calendar, Users, Package } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { 
  getStageColor, 
  getStageIcon, 
  getStageLabel, 
  getStatusColor,
  formatBatchNumber,
  calculateDaysInStage,
  getStageProgress
} from '@/lib/batchUtils';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

export default function BatchDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const { data: batch, isLoading } = useQuery({
    queryKey: ['batch-detail', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('batch_lifecycle_records')
        .select('*, created_by_profile:profiles!batch_lifecycle_records_created_by_fkey(full_name)')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <BatchLayout>
        <div className="space-y-6">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </BatchLayout>
    );
  }

  if (!batch) {
    return (
      <BatchLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Batch not found</p>
          <Button className="mt-4" onClick={() => navigate('/batch/master-record')}>
            Back to Batches
          </Button>
        </div>
      </BatchLayout>
    );
  }

  const daysInStage = batch.created_at ? calculateDaysInStage(batch.created_at) : 0;
  const stageProgress = getStageProgress(batch.current_stage);

  return (
    <BatchLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/batch/master-record')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold">{formatBatchNumber(batch.batch_number)}</h1>
                <span className="text-3xl">{getStageIcon(batch.current_stage)}</span>
                <Badge className={cn("border", getStatusColor(batch.status))}>
                  {batch.status?.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
              <p className="text-muted-foreground mt-1">
                Created by {batch.created_by_profile?.full_name || 'Unknown'} • {format(new Date(batch.created_at), 'MMM d, yyyy')}
              </p>
            </div>
          </div>
          <Button onClick={() => navigate('/batch/master-record')}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Batch
          </Button>
        </div>

        {/* Current Stage Card */}
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Badge className={cn("border text-base py-1 px-3", getStageColor(batch.current_stage))}>
                    {getStageLabel(batch.current_stage)}
                  </Badge>
                </CardTitle>
                <CardDescription className="mt-2">
                  {daysInStage} days in current stage
                </CardDescription>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">{Math.round(stageProgress)}%</p>
                <p className="text-sm text-muted-foreground">Complete</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={stageProgress} className="h-3" />
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Strain ID</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{batch.strain_id || 'N/A'}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mother ID</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{batch.mother_no || 'N/A'}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Plants</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{batch.total_clones_plants || 0}</div>
              {batch.clonator_mortalities > 0 && (
                <p className="text-xs text-red-500 mt-1">
                  -{batch.clonator_mortalities} mortalities
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Start Date</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">
                {batch.clone_germination_date 
                  ? format(new Date(batch.clone_germination_date), 'MMM d, yyyy')
                  : 'N/A'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabbed Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="lifecycle">Lifecycle Timeline</TabsTrigger>
            <TabsTrigger value="records">Records & Logs</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Batch Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Batch Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Batch Number:</span>
                    <span className="font-medium">{batch.batch_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Strain:</span>
                    <span className="font-medium">{batch.strain_id || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Mother No:</span>
                    <span className="font-medium">{batch.mother_no || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Dome No:</span>
                    <span className="font-medium">{batch.dome_no || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rack No:</span>
                    <span className="font-medium">{batch.rack_no || 'N/A'}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Dates & Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle>Important Dates</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {batch.clone_germination_date && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Germination:</span>
                      <span className="font-medium">
                        {format(new Date(batch.clone_germination_date), 'MMM d, yyyy')}
                      </span>
                    </div>
                  )}
                  {batch.expected_rooting_date && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Expected Rooting:</span>
                      <span className="font-medium">
                        {format(new Date(batch.expected_rooting_date), 'MMM d, yyyy')}
                      </span>
                    </div>
                  )}
                  {batch.actual_rooting_date && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Actual Rooting:</span>
                      <span className="font-medium">
                        {format(new Date(batch.actual_rooting_date), 'MMM d, yyyy')}
                      </span>
                    </div>
                  )}
                  {batch.move_to_hardening_date && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Hardening Date:</span>
                      <span className="font-medium">
                        {format(new Date(batch.move_to_hardening_date), 'MMM d, yyyy')}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="lifecycle" className="mt-6">
            <BatchProgressTimeline currentStage={batch.current_stage} />
          </TabsContent>

          <TabsContent value="records" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Associated Records & Logs</CardTitle>
                <CardDescription>View all checklists, logs, and documentation</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-8">
                  Records integration coming soon...
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Batch Analytics</CardTitle>
                <CardDescription>Performance metrics and insights</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-8">
                  Analytics coming soon...
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </BatchLayout>
  );
}
