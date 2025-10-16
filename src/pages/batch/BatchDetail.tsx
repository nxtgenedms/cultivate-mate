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

  // Get current quantity based on stage
  const getCurrentQuantity = () => {
    switch (batch.current_stage) {
      case 'cloning':
        return batch.total_clones_plants;
      case 'vegetative':
        return batch.veg_number_plants;
      case 'flowering':
        return batch.flowering_number_plants;
      case 'harvest':
        return batch.harvest_number_plants;
      default:
        return batch.total_clones_plants;
    }
  };

  return (
    <BatchLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/batch/master-record')}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold">{formatBatchNumber(batch.batch_number)}</h1>
                <span className="text-lg">{getStageIcon(batch.current_stage)}</span>
                <Badge className={cn("border text-xs", getStatusColor(batch.status))}>
                  {batch.status?.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Created by {batch.created_by_profile?.full_name || 'Unknown'} • {format(new Date(batch.created_at), 'MMM d, yyyy')}
              </p>
            </div>
          </div>
          <Button size="sm" onClick={() => navigate(`/batch/master-record?edit=${batch.id}`)}>
            <Edit className="h-3 w-3 mr-1" />
            Edit Batch
          </Button>
        </div>

        {/* Current Stage Card */}
        <Card className="border-2 border-primary/20">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Badge className={cn("border text-sm", getStageColor(batch.current_stage))}>
                    {getStageLabel(batch.current_stage)}
                  </Badge>
                </CardTitle>
                <CardDescription className="mt-1 text-xs">
                  {daysInStage} days in current stage
                </CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xl font-bold text-primary">{Math.round(stageProgress)}%</p>
                  <p className="text-xs text-muted-foreground">Complete</p>
                </div>
                <PhaseChangeButton
                  batchId={batch.id}
                  batchNumber={batch.batch_number}
                  currentStage={batch.current_stage}
                  currentQuantity={getCurrentQuantity()}
                  currentDome={batch.dome_no}
                  disabled={batch.status !== 'in_progress'}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <Progress value={stageProgress} className="h-2" />
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <div className="grid gap-3 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 p-3">
              <CardTitle className="text-xs font-medium">Strain ID</CardTitle>
              <Package className="h-3 w-3 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="text-lg font-bold">{getDisplayValue(batch.strain_id || '')}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 p-3">
              <CardTitle className="text-xs font-medium">Mother ID</CardTitle>
              <Users className="h-3 w-3 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="text-lg font-bold">{batch.mother_no || 'N/A'}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 p-3">
              <CardTitle className="text-xs font-medium">Total Plants</CardTitle>
              <TrendingUp className="h-3 w-3 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="text-lg font-bold">{batch.total_clones_plants || 0}</div>
              {batch.clonator_mortalities > 0 && (
                <p className="text-xs text-red-500">
                  -{batch.clonator_mortalities} mortalities
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 p-3">
              <CardTitle className="text-xs font-medium">Start Date</CardTitle>
              <Calendar className="h-3 w-3 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="text-base font-bold">
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

          <TabsContent value="overview" className="space-y-3 mt-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Batch Information */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Batch Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 pt-0">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Batch Number:</span>
                    <span className="font-medium">{batch.batch_number}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Strain:</span>
                    <span className="font-medium">{getDisplayValue(batch.strain_id || '')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Mother No:</span>
                    <span className="font-medium">{batch.mother_no || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Dome No:</span>
                    <span className="font-medium">{batch.dome_no || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Rack No:</span>
                    <span className="font-medium">{batch.rack_no || 'N/A'}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Dates & Timeline */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Important Dates</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 pt-0">
                  {batch.clone_germination_date && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Germination:</span>
                      <span className="font-medium">
                        {format(new Date(batch.clone_germination_date), 'MMM d, yyyy')}
                      </span>
                    </div>
                  )}
                  {batch.expected_rooting_date && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Expected Rooting:</span>
                      <span className="font-medium">
                        {format(new Date(batch.expected_rooting_date), 'MMM d, yyyy')}
                      </span>
                    </div>
                  )}
                  {batch.actual_rooting_date && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Actual Rooting:</span>
                      <span className="font-medium">
                        {format(new Date(batch.actual_rooting_date), 'MMM d, yyyy')}
                      </span>
                    </div>
                  )}
                  {batch.move_to_hardening_date && (
                    <div className="flex justify-between text-sm">
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

          <TabsContent value="lifecycle" className="mt-4">
            <BatchProgressTimeline 
              currentStage={batch.current_stage}
              stageCompletionDates={{
                cloning: batch.clone_germination_date,
                vegetative: batch.move_to_veg_date,
                flowering: batch.move_to_flowering_date,
                harvest: batch.harvest_date
              }}
              stageData={{
                cloning: { 
                  dome: batch.dome_no, 
                  plants: batch.total_clones_plants 
                },
                vegetative: { 
                  dome: batch.dome_no, 
                  plants: batch.veg_number_plants 
                },
                flowering: { 
                  dome: batch.dome_no, 
                  plants: batch.flowering_number_plants 
                },
                harvest: { 
                  dome: batch.dome_no, 
                  plants: batch.harvest_number_plants 
                }
              }}
            />
          </TabsContent>

          <TabsContent value="records" className="mt-4">
            <div className="space-y-3">
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
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Records & Logs</CardTitle>
                    <CardDescription className="text-xs">
                      All checklists and logs associated with this batch
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {checklist ? (
                      <div className="space-y-2">
                        <div 
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                          onClick={() => setSelectedChecklistId(checklist.id)}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-sm font-semibold">HVCSOF0011 - Cloning Pre-Start Checklist</h3>
                              <Badge variant={checklist.status === 'approved' ? 'default' : 'secondary'} className="text-xs">
                                {checklist.status}
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground space-y-0.5">
                              <p>Completed by {(checklist as any).created_by_profile?.full_name || 'Unknown'}</p>
                              <p>{format(new Date(checklist.created_at), 'MMM d, yyyy h:mm a')}</p>
                              <p>Quantity: {checklist.quantity} • Dome: {checklist.dome_no}</p>
                            </div>
                          </div>
                          <ArrowLeft className="h-4 w-4 rotate-180 text-muted-foreground" />
                        </div>
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground text-sm py-6">
                        No records or logs found for this batch.
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Detail View */}
              {selectedChecklistId && checklist && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">HVCSOF0011 - Cloning Pre-Start Checklist</CardTitle>
                    <CardDescription className="text-xs">
                      Completed by {(checklist as any).created_by_profile?.full_name || 'Unknown'} on{' '}
                      {format(new Date(checklist.created_at), 'MMM d, yyyy h:mm a')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Mother ID</p>
                        <p className="text-sm">{checklist.mother_id}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Strain ID</p>
                        <p className="text-sm">{checklist.strain_id}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Quantity</p>
                        <p className="text-sm">{checklist.quantity}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Dome No</p>
                        <p className="text-sm">{checklist.dome_no}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Status</p>
                        <Badge className={getStatusColor(checklist.status)}>
                          {checklist.status?.toUpperCase()}
                        </Badge>
                      </div>
                    </div>

                    <div className="border-t pt-3">
                      <h4 className="text-sm font-semibold mb-2">Mother Plant Checks</h4>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs">Mother plant healthy and disease-free</span>
                          <Badge variant={checklist.mother_plant_healthy ? "default" : "destructive"} className="text-xs">
                            {checklist.mother_plant_healthy ? 'Yes' : 'No'}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs">Mother plant fed and watered 12h prior</span>
                          <Badge variant={checklist.mother_plant_fed_watered_12h ? "default" : "destructive"} className="text-xs">
                            {checklist.mother_plant_fed_watered_12h ? 'Yes' : 'No'}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-3">
                      <h4 className="text-sm font-semibold mb-2">Work Area Preparation</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                        <div className="flex items-center gap-1.5">
                          <Badge variant={checklist.work_area_sharp_clean_scissors ? "default" : "secondary"} className="text-xs">
                            {checklist.work_area_sharp_clean_scissors ? '✓' : '✗'}
                          </Badge>
                          <span className="text-xs">Sharp, clean scissors</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Badge variant={checklist.work_area_sharp_clean_blade ? "default" : "secondary"} className="text-xs">
                            {checklist.work_area_sharp_clean_blade ? '✓' : '✗'}
                          </Badge>
                          <span className="text-xs">Sharp, clean blade</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Badge variant={checklist.work_area_jug_clean_water ? "default" : "secondary"} className="text-xs">
                            {checklist.work_area_jug_clean_water ? '✓' : '✗'}
                          </Badge>
                          <span className="text-xs">Jug with clean water</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Badge variant={checklist.work_area_dome_cleaned_disinfected ? "default" : "secondary"} className="text-xs">
                            {checklist.work_area_dome_cleaned_disinfected ? '✓' : '✗'}
                          </Badge>
                          <span className="text-xs">Dome cleaned/disinfected</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Badge variant={checklist.work_area_dome_prepared_medium ? "default" : "secondary"} className="text-xs">
                            {checklist.work_area_dome_prepared_medium ? '✓' : '✗'}
                          </Badge>
                          <span className="text-xs">Dome with prepared medium</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Badge variant={checklist.work_area_sanitizer_cup ? "default" : "secondary"} className="text-xs">
                            {checklist.work_area_sanitizer_cup ? '✓' : '✗'}
                          </Badge>
                          <span className="text-xs">Cup with sanitizer</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Badge variant={checklist.work_area_rooting_powder ? "default" : "secondary"} className="text-xs">
                            {checklist.work_area_rooting_powder ? '✓' : '✗'}
                          </Badge>
                          <span className="text-xs">Rooting powder/gel</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Badge variant={checklist.work_surface_sterilized ? "default" : "secondary"} className="text-xs">
                            {checklist.work_surface_sterilized ? '✓' : '✗'}
                          </Badge>
                          <span className="text-xs">Work surface sterilized</span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-3">
                      <h4 className="text-sm font-semibold mb-2">Personal Protection</h4>
                      <div className="flex items-center justify-between">
                        <span className="text-xs">Wearing clean gloves</span>
                        <Badge variant={checklist.wearing_clean_gloves ? "default" : "destructive"} className="text-xs">
                          {checklist.wearing_clean_gloves ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Batch Analytics</CardTitle>
                <CardDescription className="text-xs">Performance metrics and insights</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-muted-foreground text-center text-sm py-6">
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
