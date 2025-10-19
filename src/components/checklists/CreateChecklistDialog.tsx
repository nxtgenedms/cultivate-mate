import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface CreateChecklistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateChecklistDialog = ({ open, onOpenChange }: CreateChecklistDialogProps) => {
  const queryClient = useQueryClient();
  const [checklistType, setChecklistType] = useState<'general' | 'batch'>('general');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [selectedBatch, setSelectedBatch] = useState<string>('');

  const { data: templates } = useQuery({
    queryKey: ['checklist-templates-active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('checklist_templates')
        .select('*')
        .eq('is_active', true)
        .order('template_name');
      
      if (error) throw error;
      return data;
    },
    enabled: open,
  });

  const { data: batches } = useQuery({
    queryKey: ['batches-active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('batch_lifecycle_records')
        .select('id, batch_number, mother_no, current_stage, strain_id')
        .order('batch_number', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: open && checklistType === 'batch',
  });

  const { data: nomenclature } = useQuery({
    queryKey: ['nomenclature-task'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('nomenclature_templates')
        .select('*')
        .eq('entity_type', 'task')
        .eq('is_active', true)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: open,
  });

  const { data: tasksCount } = useQuery({
    queryKey: ['tasks-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      return count || 0;
    },
    enabled: open,
  });

  const createMutation = useMutation({
    mutationFn: async (signatures?: any) => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('You must be logged in to create a checklist');
      }
      
      const template = templates?.find(t => t.id === selectedTemplate);
      if (!template) throw new Error('Template not found');

      // Fetch template items
      const { data: templateItems, error: itemsError } = await supabase
        .from('checklist_template_items')
        .select('*')
        .eq('template_id', selectedTemplate)
        .order('sort_order');
      
      if (itemsError) throw itemsError;

      // Create checklist instance
      const instanceData = {
        template_id: selectedTemplate,
        batch_id: checklistType === 'batch' ? selectedBatch : null,
        instance_name: `${template.template_name} - ${new Date().toLocaleDateString()}`,
        status: 'draft',
        created_by: user?.id,
      };

      const { data: instance, error: instanceError } = await supabase
        .from('checklist_instances')
        .insert([instanceData])
        .select()
        .single();
      
      if (instanceError) throw instanceError;

      // Generate task number
      const generateTaskNumber = (formatPattern: string, count: number) => {
        const counterMatch = formatPattern.match(/\{counter:(\d+)\}/) || formatPattern.match(/\{seq\}/);
        if (counterMatch) {
          const padding = counterMatch[1] ? parseInt(counterMatch[1]) : 4;
          const counterValue = String(count + 1).padStart(padding, "0");
          return formatPattern.replace(/\{counter:\d+\}|\{seq\}/, counterValue);
        }
        return formatPattern;
      };

      const taskNumber = nomenclature 
        ? generateTaskNumber(nomenclature.format_pattern, tasksCount || 0)
        : `TASK-${String((tasksCount || 0) + 1).padStart(4, '0')}`;

      // Get batch details if batch-specific
      let batchInfo = null;
      if (checklistType === 'batch' && selectedBatch) {
        const batch = batches?.find(b => b.id === selectedBatch);
        batchInfo = batch;
        console.log('Batch Info:', batchInfo);
      }

      // Convert template items to checklist items format
      let checklistItems = templateItems?.map(item => ({
        id: crypto.randomUUID(),
        label: item.item_label,
        section: item.section_name || 'General',
        item_type: item.item_type,
        is_required: item.is_required,
        sort_order: item.sort_order,
        completed: false,
        response_value: '',
        notes: '',
      })) || [];

      console.log('Initial checklist items:', checklistItems.map(i => i.label));

      // For SOF-22, filter out signature fields and auto-populate batch info
      if (template.sof_number === 'HVCSOF022') {
        console.log('Processing SOF-22 template');
        
        // Remove signature fields from the checklist (they'll be added on submit)
        checklistItems = checklistItems.filter(item => {
          const label = item.label.toLowerCase();
          return !label.includes('grower sign') && 
                 !label.includes('manager sign') && 
                 !label.includes('qa sign');
        });
        
        console.log('After filtering signatures:', checklistItems.map(i => i.label));
        
        // Auto-populate batch info if batch is selected
        if (batchInfo) {
          console.log('Auto-populating batch data...', batchInfo);
          checklistItems = checklistItems.map(item => {
            const label = item.label.toLowerCase();
            console.log('Checking label:', label);
            
            // More flexible matching for batch ID/number
            if ((label.includes('batch') && (label.includes('id') || label.includes('number'))) ||
                label.includes('batch no') || 
                label.includes('batch#')) {
              console.log('Matched batch field, setting:', batchInfo.batch_number);
              return { ...item, response_value: batchInfo.batch_number, completed: true };
            }
            
            // More flexible matching for strain
            if (label.includes('strain') || label.includes('cultivar')) {
              console.log('Matched strain field, setting:', batchInfo.strain_id);
              return { ...item, response_value: batchInfo.strain_id || '', completed: !!batchInfo.strain_id };
            }
            
            return item;
          });
          
          console.log('After population:', checklistItems.filter(i => i.response_value).map(i => ({ label: i.label, value: i.response_value })));
        }
      }

      // Validate task_category - only use if it's a valid enum value
      const validTaskCategories = [
        'daily_cloning_transplant',
        'mortality_discard',
        'weekly_cultivation',
        'clonator_weekly',
        'soil_moisture',
        'scouting_corrective',
        'chemical_delivery',
        'fertigation_application',
        'ipm_chemical_mixing',
        'hygiene_check',
        'cultivation_cleaning',
        'processing_cleaning',
        'pre_harvest',
        'final_harvest'
      ];
      
      const taskCategory = template.task_category && validTaskCategories.includes(template.task_category)
        ? template.task_category
        : null;

      // Create task
      const taskData = {
        task_number: taskNumber,
        name: `${template.sof_number}: ${template.template_name}`,
        description: template.description,
        status: 'in_progress',
        created_by: user?.id,
        assignee: user?.id,
        batch_id: checklistType === 'batch' ? selectedBatch : null,
        checklist_id: instance.id,
        task_category: taskCategory as any,
        lifecycle_stage: (checklistType === 'batch' && template.lifecycle_phase ? template.lifecycle_phase : null) as any,
        checklist_items: checklistItems,
        completion_progress: {
          total: checklistItems.length,
          completed: 0,
        },
        approval_status: 'draft',
        current_approval_stage: 0,
      };

      const { error: taskError } = await supabase
        .from('tasks')
        .insert([taskData]);
      
      if (taskError) throw taskError;

      return instance;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklist-instances'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks-count'] });
      toast.success("Checklist created successfully");
      onOpenChange(false);
      setSelectedTemplate('');
      setSelectedBatch('');
      setChecklistType('general');
    },
    onError: (error) => {
      toast.error(`Failed to create checklist: ${error.message}`);
    },
  });

  const handleCreate = () => {
    if (!selectedTemplate) {
      toast.error('Please select a template');
      return;
    }
    
    if (checklistType === 'batch' && !selectedBatch) {
      toast.error('Please select a batch');
      return;
    }

    // Create checklist without signatures (added on submit for SOF-22)
    createMutation.mutate(undefined);
  };

  const filteredTemplates = templates?.filter(t => 
    checklistType === 'batch' ? t.is_batch_specific : !t.is_batch_specific
  );

  const selectedTemplateData = templates?.find(t => t.id === selectedTemplate);
  const templateLifecycleStage = selectedTemplateData?.lifecycle_phase;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Checklist</DialogTitle>
          <DialogDescription>
            Create a new checklist instance from a template
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Checklist Type</Label>
            <RadioGroup value={checklistType} onValueChange={(value: any) => setChecklistType(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="general" id="general" />
                <Label htmlFor="general">General Checklist</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="batch" id="batch" />
                <Label htmlFor="batch">Batch-Specific Checklist</Label>
              </div>
            </RadioGroup>
          </div>

          {checklistType === 'batch' && (
            <div className="space-y-2">
              <Label htmlFor="batch">Select Batch *</Label>
              <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                <SelectTrigger>
                  <SelectValue placeholder="Select batch" />
                </SelectTrigger>
                <SelectContent className="z-50 bg-background">
                  {batches?.map((batch) => (
                    <SelectItem key={batch.id} value={batch.id}>
                      <div className="flex flex-col gap-1">
                        <span className="font-medium">{batch.batch_number}</span>
                        <span className="text-xs text-muted-foreground">
                          Mother: {batch.mother_no || 'N/A'} • Stage: {batch.current_stage || 'N/A'}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="template">Select Template *</Label>
            <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
              <SelectTrigger>
                <SelectValue placeholder="Select template" />
              </SelectTrigger>
              <SelectContent className="z-50 bg-background">
                {filteredTemplates?.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.sof_number} - {template.template_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedTemplate && templateLifecycleStage && (
            <div className="space-y-2">
              <Label>Template Lifecycle Stage</Label>
              <div className="px-3 py-2 border rounded-md bg-muted/50 text-sm">
                {templateLifecycleStage.split('_').map((word: string) => 
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ')}
              </div>
              <p className="text-xs text-muted-foreground">
                This lifecycle stage is automatically set from the template
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={createMutation.isPending}>
            {createMutation.isPending ? "Creating..." : "Create Checklist"}
          </Button>
        </DialogFooter>
      </DialogContent>

    </Dialog>
  );
};

export default CreateChecklistDialog;
