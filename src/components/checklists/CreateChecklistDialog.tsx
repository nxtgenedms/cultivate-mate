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
        .select('id, batch_number')
        .order('batch_number', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: open && checklistType === 'batch',
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const template = templates?.find(t => t.id === selectedTemplate);
      if (!template) throw new Error('Template not found');

      const instanceData = {
        template_id: selectedTemplate,
        batch_id: checklistType === 'batch' ? selectedBatch : null,
        instance_name: `${template.template_name} - ${new Date().toLocaleDateString()}`,
        status: 'draft',
        created_by: user?.id,
      };

      const { data, error } = await supabase
        .from('checklist_instances')
        .insert([instanceData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklist-instances'] });
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

    createMutation.mutate();
  };

  const filteredTemplates = templates?.filter(t => 
    checklistType === 'batch' ? t.is_batch_specific : !t.is_batch_specific
  );

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
                <SelectContent>
                  {batches?.map((batch) => (
                    <SelectItem key={batch.id} value={batch.id}>
                      {batch.batch_number}
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
              <SelectContent>
                {filteredTemplates?.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.sof_number} - {template.template_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
