import { useState, useEffect } from 'react';
import { BatchLayout } from '@/components/BatchLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Plus, LayoutGrid, Table2, ChevronDown } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { BatchLifecycleWizard } from '@/components/batch/BatchLifecycleWizard';
import { BatchCard } from '@/components/batch/BatchCard';
import { BatchFilters } from '@/components/batch/BatchFilters';
import { getStageLabel, getStatusColor } from '@/lib/batchUtils';

export default function MasterRecord() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isDialogOpen, setIsDialogOpen] = useState(searchParams.get('create') === 'true' || !!searchParams.get('edit'));
  const [editingRecordId, setEditingRecordId] = useState<string | undefined>(searchParams.get('edit') || undefined);
  const [wizardData, setWizardData] = useState<any>({});
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Fetch all batch lifecycle records
  const { data: records, isLoading } = useQuery({
    queryKey: ['batch-lifecycle-records'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('batch_lifecycle_records')
        .select(`
          *,
          created_by_profile:profiles!batch_lifecycle_records_created_by_fkey(full_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Fetch lookup values for display
  const { data: lookupValues } = useQuery({
    queryKey: ['lookup-values-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lookup_values')
        .select('id, value_display');
      if (error) throw error;
      return data;
    },
  });

  const getDisplayValue = (id: string) => {
    return lookupValues?.find(v => v.id === id)?.value_display || id;
  };

  // Save/Update mutation
  const saveMutation = useMutation({
    mutationFn: async ({ data, isDraft }: { data: any; isDraft: boolean }) => {
      const { data: { user } } = await supabase.auth.getUser();

      // Fetch lookup values to get display names
      const { data: lookupData } = await supabase
        .from('lookup_values')
        .select('id, value_display')
        .in('id', [data.strain_id, data.mother_no, data.dome_no].filter(Boolean));

      const getDisplayValue = (id: string) => {
        return lookupData?.find(l => l.id === id)?.value_display || id;
      };

      // Separate checklist fields from batch lifecycle fields
      const checklistFields = {
        batch_number: data.batch_number,
        mother_id: getDisplayValue(data.mother_no),
        strain_id: getDisplayValue(data.strain_id),
        quantity: data.total_clones_plants,
        dome_no: getDisplayValue(data.dome_no),
        mother_plant_healthy: data.mother_plant_healthy,
        mother_plant_fed_watered_12h: data.mother_plant_fed_watered_12h,
        work_area_sharp_clean_scissors: data.work_area_sharp_clean_scissors,
        work_area_sharp_clean_blade: data.work_area_sharp_clean_blade,
        work_area_jug_clean_water: data.work_area_jug_clean_water,
        work_area_dome_cleaned_disinfected: data.work_area_dome_cleaned_disinfected,
        work_area_dome_prepared_medium: data.work_area_dome_prepared_medium,
        work_area_sanitizer_cup: data.work_area_sanitizer_cup,
        work_area_rooting_powder: data.work_area_rooting_powder,
        work_surface_sterilized: data.work_surface_sterilized,
        wearing_clean_gloves: data.wearing_clean_gloves,
        status: (isDraft ? 'draft' : 'pending') as 'draft' | 'pending',
        created_by: user?.id,
      };

      // Batch lifecycle record fields
      const batchFields = {
        batch_number: data.batch_number,
        strain_id: data.strain_id, // UUID
        mother_no: getDisplayValue(data.mother_no),
        dome_no: getDisplayValue(data.dome_no),
        total_clones_plants: data.total_clones_plants,
        status: isDraft ? 'draft' : 'in_progress',
        created_by: user?.id,
      };

      if (editingRecordId) {
        // Update batch lifecycle record
        const { error: batchError } = await supabase
          .from('batch_lifecycle_records')
          .update(batchFields)
          .eq('id', editingRecordId);

        if (batchError) throw batchError;
      } else {
        // Insert batch lifecycle record
        const { error: batchError } = await supabase
          .from('batch_lifecycle_records')
          .insert(batchFields);

        if (batchError) throw batchError;
      }
    },
    onSuccess: (_, { isDraft }) => {
      queryClient.invalidateQueries({ queryKey: ['batch-lifecycle-records'] });
      toast({
        title: isDraft ? 'Draft saved' : 'Record saved',
        description: `Batch lifecycle record has been ${editingRecordId ? 'updated' : 'created'} successfully.`,
      });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to save record: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const resetForm = () => {
    setWizardData({});
    setEditingRecordId(undefined);
  };

  useEffect(() => {
    if (searchParams.get('create') === 'true') {
      setIsDialogOpen(true);
      setSearchParams({}, { replace: true });
    } else if (searchParams.get('edit')) {
      const editId = searchParams.get('edit');
      const recordToEdit = records?.find(r => r.id === editId);
      if (recordToEdit) {
        setEditingRecordId(editId!);
        setWizardData(recordToEdit);
        setIsDialogOpen(true);
      }
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams, records]);

  const handleEdit = (record: any) => {
    setEditingRecordId(record.id);
    setWizardData(record);
    setIsDialogOpen(true);
  };

  const handleView = (record: any) => {
    navigate(`/batch/detail/${record.id}`);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setStageFilter('all');
    setStatusFilter('all');
  };

  // Filter records
  const filteredRecords = records?.filter(record => {
    const strainDisplay = getDisplayValue(record.strain_id || '');
    const matchesSearch = !searchQuery || 
      record.batch_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      strainDisplay?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.mother_no?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStage = stageFilter === 'all' || record.current_stage === stageFilter;
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;

    return matchesSearch && matchesStage && matchesStatus;
  }) || [];

  return (
    <BatchLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <BarChart3 className="h-6 w-6" />
              All Batches
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Complete batch lifecycle master records (HVCSOF009)
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button size="lg">
                <Plus className="h-4 w-4 mr-2" />
                Create New Batch
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-7xl max-h-[95vh] overflow-hidden flex flex-col">
              <DialogHeader>
                <DialogTitle>
                  {editingRecordId ? 'Edit Batch' : 'Create New Batch'}
                </DialogTitle>
              </DialogHeader>
              <div className="overflow-y-auto flex-1 pr-2">
                <BatchLifecycleWizard
                  recordId={editingRecordId}
                  onSave={async (data, isDraft) => {
                    return saveMutation.mutateAsync({ data, isDraft });
                  }}
                  onCancel={() => {
                    setIsDialogOpen(false);
                    resetForm();
                  }}
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters and View Toggle */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <BatchFilters
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  stageFilter={stageFilter}
                  onStageFilterChange={setStageFilter}
                  statusFilter={statusFilter}
                  onStatusFilterChange={setStatusFilter}
                  onClearFilters={handleClearFilters}
                />
              </div>
              <div className="flex gap-2 ml-4">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'table' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                >
                  <Table2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading records...</div>
            ) : filteredRecords.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>No batch records found</p>
                <p className="text-sm mt-2">
                  {records && records.length > 0 
                    ? 'Try adjusting your filters' 
                    : 'Create your first batch record to get started'}
                </p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredRecords.map((record) => (
                  <BatchCard
                    key={record.id}
                    batch={record}
                    onView={handleView}
                    onEdit={handleEdit}
                  />
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Batch Number</TableHead>
                    <TableHead>Strain ID</TableHead>
                    <TableHead>Mother No</TableHead>
                    <TableHead>Dome No</TableHead>
                    <TableHead>Current Stage</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created By</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">
                        <button
                          onClick={() => handleView(record)}
                          className="text-primary hover:underline"
                        >
                          {record.batch_number}
                        </button>
                      </TableCell>
                      <TableCell>{getDisplayValue(record.strain_id || '') || '-'}</TableCell>
                      <TableCell>{record.mother_no || '-'}</TableCell>
                      <TableCell>{getDisplayValue(record.dome_no || '') || '-'}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{getStageLabel(record.current_stage)}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(record.status)}>
                          {record.status?.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>{record.created_by_profile?.full_name || 'Unknown'}</TableCell>
                      <TableCell>
                        {format(new Date(record.created_at), 'MMM d, yyyy h:mm a')}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(record)}>
                              Move to Next Phase
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </BatchLayout>
  );
}
