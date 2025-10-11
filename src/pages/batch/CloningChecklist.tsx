import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BatchLayout } from '@/components/BatchLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Plus, FileText, CheckCircle2, XCircle, Clock, Check, Edit } from 'lucide-react';
import { format } from 'date-fns';

export default function CloningChecklist() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingChecklistId, setEditingChecklistId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    motherId: '',
    batchNumber: '',
    quantity: '',
    // Question 1
    motherPlantHealthy: false,
    // Question 2
    motherPlantFedWatered12h: false,
    // Question 3 - Work Area Prepared
    workAreaSharpCleanScissors: false,
    workAreaSharpCleanBlade: false,
    workAreaJugCleanWater: false,
    workAreaDomeCleanedDisinfected: false,
    workAreaDomePreparedMedium: false,
    workAreaSanitizerCup: false,
    workAreaRootingPowder: false,
    // Question 4
    workSurfaceSterilized: false,
    // Question 5
    wearingCleanGloves: false,
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch checklists
  const { data: checklists, isLoading } = useQuery({
    queryKey: ['cloning-checklists'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cloning_pre_start_checklists')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Fetch profiles for approved_by users
      if (data && data.length > 0) {
        const approverIds = data
          .map(c => c.approved_by)
          .filter(Boolean);
        
        if (approverIds.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, full_name')
            .in('id', approverIds);
          
          // Add profile data to checklists
          return data.map(checklist => ({
            ...checklist,
            approved_by_profile: profiles?.find(p => p.id === checklist.approved_by)
          }));
        }
      }
      
      return data;
    },
  });

  // Create checklist mutation
  const createChecklist = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (editingChecklistId) {
        // Update existing checklist
        const { error } = await supabase
          .from('cloning_pre_start_checklists')
          .update({
            mother_id: data.motherId,
            batch_number: data.batchNumber,
            quantity: parseInt(data.quantity),
            mother_plant_healthy: data.motherPlantHealthy,
            mother_plant_fed_watered_12h: data.motherPlantFedWatered12h,
            work_area_sharp_clean_scissors: data.workAreaSharpCleanScissors,
            work_area_sharp_clean_blade: data.workAreaSharpCleanBlade,
            work_area_jug_clean_water: data.workAreaJugCleanWater,
            work_area_dome_cleaned_disinfected: data.workAreaDomeCleanedDisinfected,
            work_area_dome_prepared_medium: data.workAreaDomePreparedMedium,
            work_area_sanitizer_cup: data.workAreaSanitizerCup,
            work_area_rooting_powder: data.workAreaRootingPowder,
            work_surface_sterilized: data.workSurfaceSterilized,
            wearing_clean_gloves: data.wearingCleanGloves,
          })
          .eq('id', editingChecklistId);

        if (error) throw error;
      } else {
        // Create new checklist
        const { error } = await supabase
          .from('cloning_pre_start_checklists')
          .insert({
            mother_id: data.motherId,
            batch_number: data.batchNumber,
            quantity: parseInt(data.quantity),
            mother_plant_healthy: data.motherPlantHealthy,
            mother_plant_fed_watered_12h: data.motherPlantFedWatered12h,
            work_area_sharp_clean_scissors: data.workAreaSharpCleanScissors,
            work_area_sharp_clean_blade: data.workAreaSharpCleanBlade,
            work_area_jug_clean_water: data.workAreaJugCleanWater,
            work_area_dome_cleaned_disinfected: data.workAreaDomeCleanedDisinfected,
            work_area_dome_prepared_medium: data.workAreaDomePreparedMedium,
            work_area_sanitizer_cup: data.workAreaSanitizerCup,
            work_area_rooting_powder: data.workAreaRootingPowder,
            work_surface_sterilized: data.workSurfaceSterilized,
            wearing_clean_gloves: data.wearingCleanGloves,
            status: 'draft',
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cloning-checklists'] });
      toast({
        title: editingChecklistId ? 'Checklist updated' : 'Checklist created',
        description: editingChecklistId 
          ? 'Cloning pre-start checklist has been updated.' 
          : 'Cloning pre-start checklist has been saved as draft.',
      });
      setIsCreateDialogOpen(false);
      setEditingChecklistId(null);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Submit for approval mutation
  const submitForApproval = useMutation({
    mutationFn: async (checklistId: string) => {
      const { error } = await supabase
        .from('cloning_pre_start_checklists')
        .update({
          status: 'pending',
          submitted_at: new Date().toISOString(),
        })
        .eq('id', checklistId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cloning-checklists'] });
      toast({
        title: 'Submitted for approval',
        description: 'Checklist has been submitted to grower for review.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Approve checklist mutation
  const approveChecklist = useMutation({
    mutationFn: async (checklistId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('cloning_pre_start_checklists')
        .update({
          status: 'approved',
          approved_by: user?.id,
          approved_at: new Date().toISOString(),
        })
        .eq('id', checklistId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cloning-checklists'] });
      toast({
        title: 'Checklist approved',
        description: 'Cloning can proceed.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const resetForm = () => {
    setFormData({
      motherId: '',
      batchNumber: '',
      quantity: '',
      motherPlantHealthy: false,
      motherPlantFedWatered12h: false,
      workAreaSharpCleanScissors: false,
      workAreaSharpCleanBlade: false,
      workAreaJugCleanWater: false,
      workAreaDomeCleanedDisinfected: false,
      workAreaDomePreparedMedium: false,
      workAreaSanitizerCup: false,
      workAreaRootingPowder: false,
      workSurfaceSterilized: false,
      wearingCleanGloves: false,
    });
    setEditingChecklistId(null);
  };

  const handleEditChecklist = (checklist: any) => {
    setFormData({
      motherId: checklist.mother_id,
      batchNumber: checklist.batch_number,
      quantity: checklist.quantity.toString(),
      motherPlantHealthy: checklist.mother_plant_healthy,
      motherPlantFedWatered12h: checklist.mother_plant_fed_watered_12h,
      workAreaSharpCleanScissors: checklist.work_area_sharp_clean_scissors,
      workAreaSharpCleanBlade: checklist.work_area_sharp_clean_blade,
      workAreaJugCleanWater: checklist.work_area_jug_clean_water,
      workAreaDomeCleanedDisinfected: checklist.work_area_dome_cleaned_disinfected,
      workAreaDomePreparedMedium: checklist.work_area_dome_prepared_medium,
      workAreaSanitizerCup: checklist.work_area_sanitizer_cup,
      workAreaRootingPowder: checklist.work_area_rooting_powder,
      workSurfaceSterilized: checklist.work_surface_sterilized,
      wearingCleanGloves: checklist.wearing_clean_gloves,
    });
    setEditingChecklistId(checklist.id);
    setIsCreateDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.motherId || !formData.batchNumber || !formData.quantity) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }
    createChecklist.mutate(formData);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Draft</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge className="bg-green-500"><CheckCircle2 className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getChecklistSummary = (checklist: any) => {
    const checks = [
      { label: 'Mother Healthy', value: checklist.mother_plant_healthy },
      { label: 'Fed/Watered', value: checklist.mother_plant_fed_watered_12h },
      { label: 'Scissors', value: checklist.work_area_sharp_clean_scissors },
      { label: 'Blade', value: checklist.work_area_sharp_clean_blade },
      { label: 'Water Jug', value: checklist.work_area_jug_clean_water },
      { label: 'Dome Clean', value: checklist.work_area_dome_cleaned_disinfected },
      { label: 'Medium', value: checklist.work_area_dome_prepared_medium },
      { label: 'Sanitizer', value: checklist.work_area_sanitizer_cup },
      { label: 'Rooting Powder', value: checklist.work_area_rooting_powder },
      { label: 'Surface Sterilized', value: checklist.work_surface_sterilized },
      { label: 'Gloves', value: checklist.wearing_clean_gloves },
    ];

    const checkedItems = checks.filter(c => c.value);
    const totalItems = checks.length;

    return (
      <div className="space-y-1">
        <div className="text-sm font-medium">
          {checkedItems.length}/{totalItems} checks completed
        </div>
        <div className="flex flex-wrap gap-1">
          {checkedItems.map((item, idx) => (
            <Badge key={idx} variant="outline" className="text-xs">
              <Check className="h-3 w-3 mr-1" />
              {item.label}
            </Badge>
          ))}
        </div>
      </div>
    );
  };

  return (
    <BatchLayout>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Cloning Pre-Start Checklist (HVCSOF0011)
                </CardTitle>
                <CardDescription>
                  Pre-cloning verification checklist - Mother Health, Preparation & Hygiene
                </CardDescription>
              </div>
              <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
                setIsCreateDialogOpen(open);
                if (!open) {
                  resetForm();
                }
              }}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Checklist
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingChecklistId ? 'Edit' : 'Create'} Cloning Pre-Start Checklist
                    </DialogTitle>
                    <DialogDescription>
                      Complete all checks before starting cloning operations
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    {/* Basic Information */}
                    <div className="space-y-4">
                      <h3 className="font-semibold">Batch Information</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="motherId">Mother ID *</Label>
                          <Input
                            id="motherId"
                            value={formData.motherId}
                            onChange={(e) => setFormData({ ...formData, motherId: e.target.value })}
                            placeholder="M-001"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="batchNumber">Batch Number *</Label>
                          <Input
                            id="batchNumber"
                            value={formData.batchNumber}
                            onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                            placeholder="B-2025-001"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="quantity">Quantity *</Label>
                          <Input
                            id="quantity"
                            type="number"
                            value={formData.quantity}
                            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                            placeholder="100"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Question 1 */}
                    <div className="space-y-2 border-t pt-3">
                      <h3 className="font-semibold text-sm">1. Is the mother plant that you're taking cuttings from healthy?</h3>
                      <RadioGroup
                        value={formData.motherPlantHealthy ? "yes" : "no"}
                        onValueChange={(value) => setFormData({ ...formData, motherPlantHealthy: value === "yes" })}
                        className="flex gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id="q1-yes" />
                          <Label htmlFor="q1-yes" className="cursor-pointer">YES</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="q1-no" />
                          <Label htmlFor="q1-no" className="cursor-pointer">NO</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Question 2 */}
                    <div className="space-y-2 border-t pt-3">
                      <h3 className="font-semibold text-sm">2. Has the mother plant been fed/watered in the last 12 hours?</h3>
                      <RadioGroup
                        value={formData.motherPlantFedWatered12h ? "yes" : "no"}
                        onValueChange={(value) => setFormData({ ...formData, motherPlantFedWatered12h: value === "yes" })}
                        className="flex gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id="q2-yes" />
                          <Label htmlFor="q2-yes" className="cursor-pointer">YES</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="q2-no" />
                          <Label htmlFor="q2-no" className="cursor-pointer">NO</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Question 3 - Work Area Prepared */}
                    <div className="space-y-2 border-t pt-3">
                      <h3 className="font-semibold text-sm">3. Is your work area prepared?</h3>
                      <div className="grid grid-cols-2 gap-2 ml-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="sharpScissors"
                            checked={formData.workAreaSharpCleanScissors}
                            onCheckedChange={(checked) => 
                              setFormData({ ...formData, workAreaSharpCleanScissors: checked as boolean })
                            }
                          />
                          <label htmlFor="sharpScissors" className="text-sm cursor-pointer">
                            Sharp, clean scissors
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="sharpBlade"
                            checked={formData.workAreaSharpCleanBlade}
                            onCheckedChange={(checked) => 
                              setFormData({ ...formData, workAreaSharpCleanBlade: checked as boolean })
                            }
                          />
                          <label htmlFor="sharpBlade" className="text-sm cursor-pointer">
                            Sharp, clean blade
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="jugWater"
                            checked={formData.workAreaJugCleanWater}
                            onCheckedChange={(checked) => 
                              setFormData({ ...formData, workAreaJugCleanWater: checked as boolean })
                            }
                          />
                          <label htmlFor="jugWater" className="text-sm cursor-pointer">
                            Jug with clean water
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="domeCleaned"
                            checked={formData.workAreaDomeCleanedDisinfected}
                            onCheckedChange={(checked) => 
                              setFormData({ ...formData, workAreaDomeCleanedDisinfected: checked as boolean })
                            }
                          />
                          <label htmlFor="domeCleaned" className="text-sm cursor-pointer">
                            Dome has been cleaned and disinfected
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="domePrepared"
                            checked={formData.workAreaDomePreparedMedium}
                            onCheckedChange={(checked) => 
                              setFormData({ ...formData, workAreaDomePreparedMedium: checked as boolean })
                            }
                          />
                          <label htmlFor="domePrepared" className="text-sm cursor-pointer">
                            Dome has been prepared with grow medium (Jiffy) and the correct moisture content
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="sanitizerCup"
                            checked={formData.workAreaSanitizerCup}
                            onCheckedChange={(checked) => 
                              setFormData({ ...formData, workAreaSanitizerCup: checked as boolean })
                            }
                          />
                          <label htmlFor="sanitizerCup" className="text-sm cursor-pointer">
                            Cup of sanitizer (70% alcohol content) to sterilize and equipment
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="rootingPowder"
                            checked={formData.workAreaRootingPowder}
                            onCheckedChange={(checked) => 
                              setFormData({ ...formData, workAreaRootingPowder: checked as boolean })
                            }
                          />
                          <label htmlFor="rootingPowder" className="text-sm cursor-pointer">
                            Rooting powder
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Question 4 */}
                    <div className="space-y-2 border-t pt-3">
                      <h3 className="font-semibold text-sm">4. Has your work surface area been sterilized?</h3>
                      <RadioGroup
                        value={formData.workSurfaceSterilized ? "yes" : "no"}
                        onValueChange={(value) => setFormData({ ...formData, workSurfaceSterilized: value === "yes" })}
                        className="flex gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id="q4-yes" />
                          <Label htmlFor="q4-yes" className="cursor-pointer">YES</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="q4-no" />
                          <Label htmlFor="q4-no" className="cursor-pointer">NO</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Question 5 */}
                    <div className="space-y-2 border-t pt-3">
                      <h3 className="font-semibold text-sm">5. Are you wearing clean gloves?</h3>
                      <RadioGroup
                        value={formData.wearingCleanGloves ? "yes" : "no"}
                        onValueChange={(value) => setFormData({ ...formData, wearingCleanGloves: value === "yes" })}
                        className="flex gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id="q5-yes" />
                          <Label htmlFor="q5-yes" className="cursor-pointer">YES</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="q5-no" />
                          <Label htmlFor="q5-no" className="cursor-pointer">NO</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => {
                      setIsCreateDialogOpen(false);
                      resetForm();
                    }}>
                      Cancel
                    </Button>
                    <Button onClick={handleSubmit}>
                      {editingChecklistId ? 'Update Draft' : 'Save as Draft'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12">Loading checklists...</div>
            ) : checklists && checklists.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Batch #</TableHead>
                    <TableHead>Mother ID</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Checklist Items</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created By</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Approved By</TableHead>
                    <TableHead>Approved At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {checklists.map((checklist: any) => (
                    <TableRow key={checklist.id}>
                      <TableCell className="font-medium">{checklist.batch_number}</TableCell>
                      <TableCell>{checklist.mother_id}</TableCell>
                      <TableCell>{checklist.quantity}</TableCell>
                      <TableCell>{getChecklistSummary(checklist)}</TableCell>
                      <TableCell>{getStatusBadge(checklist.status)}</TableCell>
                      <TableCell>You</TableCell>
                      <TableCell>{format(new Date(checklist.created_at), 'MMM d, yyyy')}</TableCell>
                      <TableCell>
                        {checklist.approved_by_profile?.full_name || '-'}
                      </TableCell>
                      <TableCell>
                        {checklist.approved_at 
                          ? format(new Date(checklist.approved_at), 'MMM d, yyyy h:mm a')
                          : '-'
                        }
                      </TableCell>
                      <TableCell>
                        {checklist.status === 'draft' && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditChecklist(checklist)}
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => submitForApproval.mutate(checklist.id)}
                            >
                              Submit
                            </Button>
                          </div>
                        )}
                        {checklist.status === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => approveChecklist.mutate(checklist.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Approve
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                No checklists yet. Create your first cloning pre-start checklist.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </BatchLayout>
  );
}
