import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, ArrowRight, X } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

interface TaskFieldMapping {
  id: string;
  task_category: string;
  sof_number: string;
  applicable_stages: string[];
  field_mappings: {
    fields: string[];
    item_mappings: Record<string, string>;
  };
  is_active: boolean;
}

interface FieldMapping {
  taskField: string;
  batchField: string;
}

const BATCH_STAGES = ['preclone', 'cloning', 'hardening', 'vegetative', 'flowering', 'harvest', 'drying', 'processing'];

const BATCH_RECORD_FIELDS = [
  'mother_no', 'dome_no', 'clonator_1', 'clonator_2', 'rack_no',
  'clone_germination_date', 'total_clones_plants', 'clonator_mortalities',
  'expected_rooting_date', 'actual_rooting_date', 'clonator_2_number_clones',
  'clonator_2_date', 'clonator_2_area_placed', 'clonator_2_rack_no',
  'move_to_hardening_date', 'hardening_number_clones', 'hardening_rack_no',
  'hardening_area_placed', 'hardening_no_of_days',
  'move_to_veg_date', 'veg_table_no', 'veg_number_plants', 'veg_expected_days',
  'veg_actual_days', 'veg_pests', 'veg_diseases',
  'move_to_flowering_date', 'flowering_table_no', 'flowering_number_plants',
  'expected_flowering_date', 'actual_flowering_date', 'estimated_days',
  'actual_days', 'eight_nodes', 'using_extra_lights', 'extra_lights_from_day',
  'extra_lights_no_of_days', 'flowering_pests', 'flowering_diseases',
  'harvest_date', 'harvest_number_plants', 'harvest_table_no',
  'inspection_date', 'inspection_number_plants', 'inspection_table_no',
  'inspection_rack_no', 'total_plants_processed', 'total_wet_weight',
  'drying_date', 'drying_total_plants', 'drying_rack_no', 'no_of_days_drying',
  'dry_weight_date', 'dry_weight_no_plants', 'total_dry_weight',
  'packing_date', 'packing_a_grade', 'packing_b_grade', 'packing_c_grade',
  'packing_bag_ids', 'packing_storage_area'
];

export default function TaskFieldMappings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMapping, setEditingMapping] = useState<TaskFieldMapping | null>(null);
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1 data
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [sofNumber, setSofNumber] = useState('');
  const [selectedStages, setSelectedStages] = useState<string[]>([]);

  // Step 2 data
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([]);
  const [currentTaskField, setCurrentTaskField] = useState('');
  const [currentBatchField, setCurrentBatchField] = useState('');

  const { data: mappings, isLoading } = useQuery({
    queryKey: ['task-field-mappings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('task_field_mappings')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map(item => ({
        ...item,
        field_mappings: item.field_mappings as any as { fields: string[]; item_mappings: Record<string, string> }
      })) as TaskFieldMapping[];
    },
  });

  const { data: templates } = useQuery({
    queryKey: ['checklist-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('checklist_templates')
        .select('*, checklist_template_items!inner(*)')
        .order('template_name');
      if (error) throw error;
      console.log('Loaded templates:', data);
      return data;
    },
  });

  const selectedTemplateData = templates?.find(t => t.id === selectedTemplate);
  
  // Get available task fields (not yet mapped)
  const availableTaskFields = selectedTemplateData?.checklist_template_items?.filter(
    (item: any) => !fieldMappings.some(fm => fm.taskField === item.item_label)
  ) || [];
  
  console.log('Selected template:', selectedTemplateData);
  console.log('Available fields:', availableTaskFields);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const itemMappings: Record<string, string> = {};
      fieldMappings.forEach(fm => {
        itemMappings[fm.taskField] = fm.batchField;
      });

      const payload = {
        task_category: selectedTemplateData?.task_category || '',
        sof_number: sofNumber,
        applicable_stages: selectedStages,
        field_mappings: {
          fields: fieldMappings.map(fm => fm.batchField),
          item_mappings: itemMappings,
        },
        is_active: true,
      };

      if (editingMapping) {
        const { error } = await supabase
          .from('task_field_mappings')
          .update(payload)
          .eq('id', editingMapping.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('task_field_mappings')
          .insert([payload]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-field-mappings'] });
      toast({ title: 'Success', description: 'Mapping saved successfully' });
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

  const toggleMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('task_field_mappings')
        .update({ is_active: !isActive })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-field-mappings'] });
      toast({ title: 'Success', description: 'Status updated' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('task_field_mappings')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-field-mappings'] });
      toast({ title: 'Success', description: 'Mapping deleted' });
    },
  });

  const resetForm = () => {
    setSelectedTemplate('');
    setSofNumber('');
    setSelectedStages([]);
    setFieldMappings([]);
    setCurrentTaskField('');
    setCurrentBatchField('');
    setEditingMapping(null);
    setIsDialogOpen(false);
    setCurrentStep(1);
  };

  const handleEdit = (mapping: TaskFieldMapping) => {
    setEditingMapping(mapping);
    
    // Find template by task_category
    const template = templates?.find(t => t.task_category === mapping.task_category);
    if (template) {
      setSelectedTemplate(template.id);
    }
    
    setSofNumber(mapping.sof_number);
    setSelectedStages(mapping.applicable_stages);
    
    // Convert item_mappings to FieldMapping[]
    const mappings: FieldMapping[] = Object.entries(mapping.field_mappings.item_mappings).map(
      ([taskField, batchField]) => ({
        taskField,
        batchField: batchField as string,
      })
    );
    setFieldMappings(mappings);
    
    setCurrentStep(2);
    setIsDialogOpen(true);
  };

  const handleAddMapping = () => {
    if (!currentTaskField || !currentBatchField) {
      toast({
        title: 'Validation Error',
        description: 'Please select both task field and batch field',
        variant: 'destructive',
      });
      return;
    }

    // Check for duplicate
    if (fieldMappings.some(fm => fm.taskField === currentTaskField)) {
      toast({
        title: 'Duplicate Mapping',
        description: 'This task field is already mapped',
        variant: 'destructive',
      });
      return;
    }

    setFieldMappings([...fieldMappings, { taskField: currentTaskField, batchField: currentBatchField }]);
    setCurrentTaskField('');
    setCurrentBatchField('');
  };

  const handleRemoveMapping = (taskField: string) => {
    setFieldMappings(fieldMappings.filter(fm => fm.taskField !== taskField));
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!selectedTemplate || !sofNumber || selectedStages.length === 0) {
        toast({
          title: 'Validation Error',
          description: 'Please fill in all required fields',
          variant: 'destructive',
        });
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (fieldMappings.length === 0) {
        toast({
          title: 'Validation Error',
          description: 'Please add at least one field mapping',
          variant: 'destructive',
        });
        return;
      }
      setCurrentStep(3);
    }
  };

  const handleSave = () => {
    saveMutation.mutate();
  };

  const toggleStage = (stage: string) => {
    if (selectedStages.includes(stage)) {
      setSelectedStages(selectedStages.filter(s => s !== stage));
    } else {
      setSelectedStages([...selectedStages, stage]);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Task Field Mappings</h2>
            <p className="text-muted-foreground">
              Map task checklist items to batch record fields
            </p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Mapping
          </Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task Category</TableHead>
                <TableHead>SOF Number</TableHead>
                <TableHead>Applicable Stages</TableHead>
                <TableHead>Mappings</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : mappings?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    No mappings found
                  </TableCell>
                </TableRow>
              ) : (
                mappings?.map((mapping) => (
                  <TableRow key={mapping.id}>
                    <TableCell className="font-medium">{mapping.task_category}</TableCell>
                    <TableCell>{mapping.sof_number}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {mapping.applicable_stages.map((stage) => (
                          <Badge key={stage} variant="secondary">
                            {stage}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {Object.keys(mapping.field_mappings.item_mappings).length} fields
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={mapping.is_active}
                        onCheckedChange={() =>
                          toggleMutation.mutate({
                            id: mapping.id,
                            isActive: mapping.is_active,
                          })
                        }
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(mapping)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteMutation.mutate(mapping.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingMapping ? 'Edit Mapping' : 'Add New Mapping'}
              </DialogTitle>
              <DialogDescription>
                Step {currentStep} of 3: {currentStep === 1 ? 'Basic Information' : currentStep === 2 ? 'Field Mapping' : 'Review & Save'}
              </DialogDescription>
            </DialogHeader>

            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="template">Checklist Template *</Label>
                  <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                    <SelectTrigger id="template">
                      <SelectValue placeholder="Select a template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates?.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.template_name} ({template.sof_number})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedTemplateData && (
                  <div className="p-3 bg-muted rounded-md text-sm">
                    <div className="font-medium">Template Info:</div>
                    <div>Category: {selectedTemplateData.task_category}</div>
                    <div>Items: {selectedTemplateData.checklist_template_items?.length || 0}</div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="sofNumber">SOF Number *</Label>
                  <Select value={sofNumber} onValueChange={setSofNumber}>
                    <SelectTrigger id="sofNumber">
                      <SelectValue placeholder="Select SOF number" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedTemplateData && (
                        <SelectItem value={selectedTemplateData.sof_number}>
                          {selectedTemplateData.sof_number}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Applicable Stages *</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {BATCH_STAGES.map((stage) => (
                      <div key={stage} className="flex items-center space-x-2">
                        <Checkbox
                          id={stage}
                          checked={selectedStages.includes(stage)}
                          onCheckedChange={() => toggleStage(stage)}
                        />
                        <Label htmlFor={stage} className="cursor-pointer capitalize">
                          {stage}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button onClick={handleNextStep}>
                    Next Step
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Field Mapping */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* Left: Task Fields */}
                  <div className="space-y-2">
                    <Label>Task Checklist Item</Label>
                    <Select value={currentTaskField} onValueChange={setCurrentTaskField}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select task field" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableTaskFields.length === 0 ? (
                          <div className="px-2 py-1 text-sm text-muted-foreground">
                            {selectedTemplateData ? 'All fields mapped' : 'Select a template first'}
                          </div>
                        ) : (
                          availableTaskFields.map((item: any) => (
                            <SelectItem key={item.id} value={item.item_label}>
                              {item.item_label}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Right: Batch Fields */}
                  <div className="space-y-2">
                    <Label>Batch Record Field</Label>
                    <Select value={currentBatchField} onValueChange={setCurrentBatchField}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select batch field" />
                      </SelectTrigger>
                      <SelectContent>
                        {BATCH_RECORD_FIELDS.map((field) => (
                          <SelectItem key={field} value={field}>
                            {field}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button onClick={handleAddMapping} className="w-full" variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Mapping
                </Button>

                {/* Mappings List */}
                <div className="border rounded-md p-4 space-y-2 min-h-[200px]">
                  <div className="font-medium mb-2">Current Mappings ({fieldMappings.length})</div>
                  {fieldMappings.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      No mappings added yet
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {fieldMappings.map((fm, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-muted rounded-md"
                        >
                          <div className="flex items-center gap-2 flex-1">
                            <Badge variant="secondary">{fm.taskField}</Badge>
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                            <Badge>{fm.batchField}</Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveMapping(fm.taskField)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-between gap-2 pt-4">
                  <Button variant="outline" onClick={() => setCurrentStep(1)}>
                    Previous
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                    <Button onClick={handleNextStep}>
                      Review
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-md space-y-2">
                    <div className="font-medium text-lg">Summary</div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="font-medium">Template:</div>
                      <div>{selectedTemplateData?.template_name}</div>
                      <div className="font-medium">Task Category:</div>
                      <div>{selectedTemplateData?.task_category}</div>
                      <div className="font-medium">SOF Number:</div>
                      <div>{sofNumber}</div>
                      <div className="font-medium">Applicable Stages:</div>
                      <div className="flex flex-wrap gap-1">
                        {selectedStages.map((stage) => (
                          <Badge key={stage} variant="secondary">
                            {stage}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-md p-4">
                    <div className="font-medium mb-3">Field Mappings ({fieldMappings.length})</div>
                    <div className="space-y-2">
                      {fieldMappings.map((fm, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 p-2 bg-muted rounded-md"
                        >
                          <Badge variant="secondary">{fm.taskField}</Badge>
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          <Badge>{fm.batchField}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between gap-2 pt-4">
                  <Button variant="outline" onClick={() => setCurrentStep(2)}>
                    Previous
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={saveMutation.isPending}>
                      {saveMutation.isPending ? 'Saving...' : 'Save Mapping'}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
