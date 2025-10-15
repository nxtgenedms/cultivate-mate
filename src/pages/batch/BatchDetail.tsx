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
import { PhaseChangeButton } from '@/components/batch/PhaseChangeButton';

export default function BatchDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedChecklistId, setSelectedChecklistId] = useState<string | null>(null);

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

  // Fetch lookup values for display
  const { data: lookupValues } = useQuery({
    queryKey: ['lookup-values-display'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lookup_values')
        .select('id, value_display');
      if (error) throw error;
      return data;
    },
  });

  // Fetch checklist data
  const { data: checklist } = useQuery({
    queryKey: ['batch-checklist', batch?.batch_number],
    enabled: !!batch?.batch_number,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cloning_pre_start_checklists')
        .select('*')
        .eq('batch_number', batch.batch_number)
        .maybeSingle();

      if (error) throw error;
      
      // Get creator profile if exists
      if (data && data.created_by) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', data.created_by)
          .single();
        
        return { ...data, created_by_profile: profile };
      }
      
      return data;
    },
  });

  const getDisplayValue = (id: string) => {
    if (!id) return 'N/A';
    return lookupValues?.find(v => v.id === id)?.value_display || id;
  };

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
                <h1 className="text-xl font-bold">{formatBatchNumber(batch.batch_number)}</h1>
                <span className="text-xl">{getStageIcon(batch.current_stage)}</span>
                <Badge className={cn("border", getStatusColor(batch.status))}>
                  {batch.status?.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Created by {batch.created_by_profile?.full_name || 'Unknown'} • {format(new Date(batch.created_at), 'MMM d, yyyy')}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <PhaseChangeButton
              batchId={batch.id}
              batchNumber={batch.batch_number}
              currentStage={batch.current_stage}
              responsiblePersonId={batch.created_by}
              disabled={batch.status !== 'in_progress'}
            />
            <Button onClick={() => navigate('/batch/master-record')}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Batch
            </Button>
          </div>
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
              <div className="text-2xl font-bold">{getDisplayValue(batch.strain_id || '')}</div>
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
                  <CardTitle className="text-xl">Batch Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Batch Number:</span>
                    <span className="font-medium">{batch.batch_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Strain:</span>
                    <span className="font-medium">{getDisplayValue(batch.strain_id || '')}</span>
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
                  <CardTitle className="text-xl">Important Dates</CardTitle>
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
            <div className="space-y-4">
              {/* Back button when viewing details */}
              {selectedChecklistId && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSelectedChecklistId(null)}
                  className="mb-4"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Records List
                </Button>
              )}

              {/* List View */}
              {!selectedChecklistId && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Records & Logs</CardTitle>
                    <CardDescription>
                      All checklists and logs associated with this batch
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {checklist ? (
                      <div className="space-y-3">
                        <div 
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                          onClick={() => setSelectedChecklistId(checklist.id)}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold">HVCSOF0011 - Cloning Pre-Start Checklist</h3>
                              <Badge variant={checklist.status === 'approved' ? 'default' : 'secondary'}>
                                {checklist.status}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground space-y-1">
                              <p>Completed by {(checklist as any).created_by_profile?.full_name || 'Unknown'}</p>
                              <p>{format(new Date(checklist.created_at), 'MMM d, yyyy h:mm a')}</p>
                              <p>Quantity: {checklist.quantity} • Dome: {checklist.dome_no}</p>
                            </div>
                          </div>
                          <ArrowLeft className="h-5 w-5 rotate-180 text-muted-foreground" />
                        </div>
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">
                        No records or logs found for this batch.
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Detail View */}
              {selectedChecklistId && checklist && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">HVCSOF0011 - Cloning Pre-Start Checklist</CardTitle>
                    <CardDescription>
                      Completed by {(checklist as any).created_by_profile?.full_name || 'Unknown'} on{' '}
                      {format(new Date(checklist.created_at), 'MMM d, yyyy h:mm a')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Mother ID</p>
                        <p className="text-base">{checklist.mother_id}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Strain ID</p>
                        <p className="text-base">{checklist.strain_id}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Quantity</p>
                        <p className="text-base">{checklist.quantity}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Dome No</p>
                        <p className="text-base">{checklist.dome_no}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Status</p>
                        <Badge className={getStatusColor(checklist.status)}>
                          {checklist.status?.toUpperCase()}
                        </Badge>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="font-semibold mb-3">Mother Plant Checks</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Mother plant healthy and disease-free</span>
                          <Badge variant={checklist.mother_plant_healthy ? "default" : "destructive"}>
                            {checklist.mother_plant_healthy ? 'Yes' : 'No'}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Mother plant fed and watered 12h prior</span>
                          <Badge variant={checklist.mother_plant_fed_watered_12h ? "default" : "destructive"}>
                            {checklist.mother_plant_fed_watered_12h ? 'Yes' : 'No'}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="font-semibold mb-3">Work Area Preparation</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={checklist.work_area_sharp_clean_scissors ? "default" : "secondary"}>
                            {checklist.work_area_sharp_clean_scissors ? '✓' : '✗'}
                          </Badge>
                          <span className="text-sm">Sharp, clean scissors</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={checklist.work_area_sharp_clean_blade ? "default" : "secondary"}>
                            {checklist.work_area_sharp_clean_blade ? '✓' : '✗'}
                          </Badge>
                          <span className="text-sm">Sharp, clean blade</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={checklist.work_area_jug_clean_water ? "default" : "secondary"}>
                            {checklist.work_area_jug_clean_water ? '✓' : '✗'}
                          </Badge>
                          <span className="text-sm">Jug with clean water</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={checklist.work_area_dome_cleaned_disinfected ? "default" : "secondary"}>
                            {checklist.work_area_dome_cleaned_disinfected ? '✓' : '✗'}
                          </Badge>
                          <span className="text-sm">Dome cleaned/disinfected</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={checklist.work_area_dome_prepared_medium ? "default" : "secondary"}>
                            {checklist.work_area_dome_prepared_medium ? '✓' : '✗'}
                          </Badge>
                          <span className="text-sm">Dome with prepared medium</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={checklist.work_area_sanitizer_cup ? "default" : "secondary"}>
                            {checklist.work_area_sanitizer_cup ? '✓' : '✗'}
                          </Badge>
                          <span className="text-sm">Cup with sanitizer</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={checklist.work_area_rooting_powder ? "default" : "secondary"}>
                            {checklist.work_area_rooting_powder ? '✓' : '✗'}
                          </Badge>
                          <span className="text-sm">Rooting powder/gel</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={checklist.work_surface_sterilized ? "default" : "secondary"}>
                            {checklist.work_surface_sterilized ? '✓' : '✗'}
                          </Badge>
                          <span className="text-sm">Work surface sterilized</span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="font-semibold mb-3">Personal Protection</h4>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Wearing clean gloves</span>
                        <Badge variant={checklist.wearing_clean_gloves ? "default" : "destructive"}>
                          {checklist.wearing_clean_gloves ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Batch Analytics</CardTitle>
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
