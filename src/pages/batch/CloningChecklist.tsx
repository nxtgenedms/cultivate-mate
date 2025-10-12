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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, FileText, CheckCircle2, XCircle, Clock, Check, Edit } from 'lucide-react';
import { format } from 'date-fns';

export default function CloningChecklist() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingChecklistId, setEditingChecklistId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    motherId: '',
    strainId: '',
    domeNo: '',
    batchNumber: '',
    quantity: '',
    // Mother Plant Checks
    motherPlantHealthy: false,
    motherPlantFedWatered12h: false,
    // Work Area Preparation
    workAreaSharpCleanScissors: false,
    workAreaSharpCleanBlade: false,
    workAreaJugCleanWater: false,
    workAreaDomeCleanedDisinfected: false,
    workAreaDomePreparedMedium: false,
    workAreaSanitizerCup: false,
    workAreaRootingPowder: false,
    workSurfaceSterilized: false,
    // Personal Protection
    wearingCleanGloves: false,
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch lookup categories for dropdowns
  const { data: lookupCategories } = useQuery({
    queryKey: ['lookup-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lookup_categories')
        .select('*')
        .in('category_key', ['strain_id', 'dome_no']);
      if (error) throw error;
      return data;
    },
  });

  const { data: lookupValues } = useQuery({
    queryKey: ['lookup-values'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lookup_values')
        .select('*')
        .order('sort_order');
      if (error) throw error;
      return data;
    },
  });

  const getValuesByCategory = (categoryKey: string) => {
    const category = lookupCategories?.find(c => c.category_key === categoryKey);
    if (!category) return [];
    return lookupValues?.filter(v => v.category_id === category.id) || [];
  };

  // Fetch checklists
  const { data: checklists, isLoading } = useQuery({
    queryKey: ['cloning-checklists'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cloning_pre_start_checklists')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Fetch profiles for created_by and approved_by users
      if (data && data.length > 0) {
        const userIds = [
          ...data.map(c => c.created_by),
          ...data.map(c => c.approved_by)
        ].filter(Boolean);
        
        const uniqueUserIds = [...new Set(userIds)];
        
        if (uniqueUserIds.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, full_name')
            .in('id', uniqueUserIds);
          
          // Add profile data to checklists
          return data.map(checklist => ({
            ...checklist,
            created_by_profile: profiles?.find(p => p.id === checklist.created_by),
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
      const { data: { user } } = await supabase.auth.getUser();
      
      if (editingChecklistId) {
        // Update existing checklist
        const { error } = await supabase
          .from('cloning_pre_start_checklists')
          .update({
            mother_id: data.motherId,
            strain_id: data.strainId,
            dome_no: data.domeNo,
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
            strain_id: data.strainId,
            dome_no: data.domeNo,
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
            created_by: user?.id,
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
      strainId: '',
      domeNo: '',
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
      strainId: checklist.strain_id || '',
      domeNo: checklist.dome_no || '',
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
    if (!formData.strainId || !formData.quantity || !formData.domeNo) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in Strain ID, Quantity, and Dome No.',
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
                  <div className="space-y-6 py-4">
                    {/* Header Information */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="strainId">Strain ID *</Label>
                        <Select 
                          value={formData.strainId} 
                          onValueChange={(value) => setFormData({ ...formData, strainId: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select strain" />
                          </SelectTrigger>
                          <SelectContent>
                            {getValuesByCategory('strain_id').map((value) => (
                              <SelectItem key={value.id} value={value.value_display}>
                                {value.value_display}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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

                    <div className="space-y-2">
                      <Label htmlFor="domeNo">Dome No *</Label>
                      <Select 
                        value={formData.domeNo} 
                        onValueChange={(value) => setFormData({ ...formData, domeNo: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select dome" />
                        </SelectTrigger>
                        <SelectContent>
                          {getValuesByCategory('dome_no').map((value) => (
                            <SelectItem key={value.id} value={value.value_display}>
                              {value.value_display}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Mother Plant Checks */}
                    <div className="space-y-4 border-t pt-4">
                      <h3 className="font-semibold">Mother Plant Checks</h3>
                      
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label className="text-sm">Mother plant is healthy and disease-free</Label>
                          <RadioGroup
                            value={formData.motherPlantHealthy ? "yes" : "no"}
                            onValueChange={(value) => setFormData({ ...formData, motherPlantHealthy: value === "yes" })}
                            className="flex gap-6"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="yes" id="mother-healthy-yes" />
                              <Label htmlFor="mother-healthy-yes" className="cursor-pointer font-normal">Yes</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="no" id="mother-healthy-no" />
                              <Label htmlFor="mother-healthy-no" className="cursor-pointer font-normal">No</Label>
                            </div>
                          </RadioGroup>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm">Mother plant fed and watered 12 hours prior</Label>
                          <RadioGroup
                            value={formData.motherPlantFedWatered12h ? "yes" : "no"}
                            onValueChange={(value) => setFormData({ ...formData, motherPlantFedWatered12h: value === "yes" })}
                            className="flex gap-6"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="yes" id="mother-fed-yes" />
                              <Label htmlFor="mother-fed-yes" className="cursor-pointer font-normal">Yes</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="no" id="mother-fed-no" />
                              <Label htmlFor="mother-fed-no" className="cursor-pointer font-normal">No</Label>
                            </div>
                          </RadioGroup>
                        </div>
                      </div>
                    </div>

                    {/* Work Area Preparation */}
                    <div className="space-y-4 border-t pt-4">
                      <h3 className="font-semibold">Work Area Preparation</h3>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm">Sharp, clean scissors</Label>
                          <RadioGroup
                            value={formData.workAreaSharpCleanScissors ? "yes" : "no"}
                            onValueChange={(value) => setFormData({ ...formData, workAreaSharpCleanScissors: value === "yes" })}
                            className="flex gap-6"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="yes" id="scissors-yes" />
                              <Label htmlFor="scissors-yes" className="cursor-pointer font-normal">Yes</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="no" id="scissors-no" />
                              <Label htmlFor="scissors-no" className="cursor-pointer font-normal">No</Label>
                            </div>
                          </RadioGroup>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm">Sharp, clean blade</Label>
                          <RadioGroup
                            value={formData.workAreaSharpCleanBlade ? "yes" : "no"}
                            onValueChange={(value) => setFormData({ ...formData, workAreaSharpCleanBlade: value === "yes" })}
                            className="flex gap-6"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="yes" id="blade-yes" />
                              <Label htmlFor="blade-yes" className="cursor-pointer font-normal">Yes</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="no" id="blade-no" />
                              <Label htmlFor="blade-no" className="cursor-pointer font-normal">No</Label>
                            </div>
                          </RadioGroup>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm">Jug with clean water</Label>
                          <RadioGroup
                            value={formData.workAreaJugCleanWater ? "yes" : "no"}
                            onValueChange={(value) => setFormData({ ...formData, workAreaJugCleanWater: value === "yes" })}
                            className="flex gap-6"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="yes" id="jug-yes" />
                              <Label htmlFor="jug-yes" className="cursor-pointer font-normal">Yes</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="no" id="jug-no" />
                              <Label htmlFor="jug-no" className="cursor-pointer font-normal">No</Label>
                            </div>
                          </RadioGroup>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm">Dome cleaned and disinfected</Label>
                          <RadioGroup
                            value={formData.workAreaDomeCleanedDisinfected ? "yes" : "no"}
                            onValueChange={(value) => setFormData({ ...formData, workAreaDomeCleanedDisinfected: value === "yes" })}
                            className="flex gap-6"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="yes" id="dome-clean-yes" />
                              <Label htmlFor="dome-clean-yes" className="cursor-pointer font-normal">Yes</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="no" id="dome-clean-no" />
                              <Label htmlFor="dome-clean-no" className="cursor-pointer font-normal">No</Label>
                            </div>
                          </RadioGroup>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm">Dome with prepared medium</Label>
                          <RadioGroup
                            value={formData.workAreaDomePreparedMedium ? "yes" : "no"}
                            onValueChange={(value) => setFormData({ ...formData, workAreaDomePreparedMedium: value === "yes" })}
                            className="flex gap-6"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="yes" id="dome-prep-yes" />
                              <Label htmlFor="dome-prep-yes" className="cursor-pointer font-normal">Yes</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="no" id="dome-prep-no" />
                              <Label htmlFor="dome-prep-no" className="cursor-pointer font-normal">No</Label>
                            </div>
                          </RadioGroup>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm">Cup with sanitizer</Label>
                          <RadioGroup
                            value={formData.workAreaSanitizerCup ? "yes" : "no"}
                            onValueChange={(value) => setFormData({ ...formData, workAreaSanitizerCup: value === "yes" })}
                            className="flex gap-6"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="yes" id="sanitizer-yes" />
                              <Label htmlFor="sanitizer-yes" className="cursor-pointer font-normal">Yes</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="no" id="sanitizer-no" />
                              <Label htmlFor="sanitizer-no" className="cursor-pointer font-normal">No</Label>
                            </div>
                          </RadioGroup>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm">Rooting powder/gel</Label>
                          <RadioGroup
                            value={formData.workAreaRootingPowder ? "yes" : "no"}
                            onValueChange={(value) => setFormData({ ...formData, workAreaRootingPowder: value === "yes" })}
                            className="flex gap-6"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="yes" id="rooting-yes" />
                              <Label htmlFor="rooting-yes" className="cursor-pointer font-normal">Yes</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="no" id="rooting-no" />
                              <Label htmlFor="rooting-no" className="cursor-pointer font-normal">No</Label>
                            </div>
                          </RadioGroup>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm">Work surface sterilized</Label>
                          <RadioGroup
                            value={formData.workSurfaceSterilized ? "yes" : "no"}
                            onValueChange={(value) => setFormData({ ...formData, workSurfaceSterilized: value === "yes" })}
                            className="flex gap-6"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="yes" id="surface-yes" />
                              <Label htmlFor="surface-yes" className="cursor-pointer font-normal">Yes</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="no" id="surface-no" />
                              <Label htmlFor="surface-no" className="cursor-pointer font-normal">No</Label>
                            </div>
                          </RadioGroup>
                        </div>
                      </div>
                    </div>

                    {/* Personal Protection */}
                    <div className="space-y-4 border-t pt-4">
                      <h3 className="font-semibold">Personal Protection</h3>
                      
                      <div className="space-y-2">
                        <Label className="text-sm">Wearing clean gloves</Label>
                        <RadioGroup
                          value={formData.wearingCleanGloves ? "yes" : "no"}
                          onValueChange={(value) => setFormData({ ...formData, wearingCleanGloves: value === "yes" })}
                          className="flex gap-6"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="yes" id="gloves-yes" />
                            <Label htmlFor="gloves-yes" className="cursor-pointer font-normal">Yes</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="no" id="gloves-no" />
                            <Label htmlFor="gloves-no" className="cursor-pointer font-normal">No</Label>
                          </div>
                        </RadioGroup>
                      </div>
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
                      <TableCell>
                        {checklist.created_by_profile?.full_name || 'Unknown'}
                      </TableCell>
                      <TableCell>
                        {format(new Date(checklist.created_at), 'MMM d, yyyy h:mm a')}
                      </TableCell>
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
