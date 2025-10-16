import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";

interface CreateChecklistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateChecklistDialog = ({
  open,
  onOpenChange,
}: CreateChecklistDialogProps) => {
  const [checklistType, setChecklistType] = useState<"general" | "batch">("general");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [selectedBatch, setSelectedBatch] = useState<string>("");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch templates based on selected type
  const { data: templates } = useQuery({
    queryKey: ['checklist-templates', checklistType],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('checklist_templates')
        .select('*')
        .eq('is_active', true)
        .eq('is_batch_specific', checklistType === 'batch')
        .order('template_name');
      
      if (error) throw error;
      return data;
    },
    enabled: open,
  });

  // Fetch batches if batch type selected
  const { data: batches } = useQuery({
    queryKey: ['active-batches'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('batch_lifecycle_records')
        .select('id, batch_number, current_stage, strain_id')
        .order('batch_number', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data;
    },
    enabled: open && checklistType === 'batch',
  });

  // Reset selections when type changes
  useEffect(() => {
    setSelectedTemplate("");
    setSelectedBatch("");
  }, [checklistType]);

  const createMutation = useMutation({
    mutationFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      
      // Generate instance number
      const timestamp = format(new Date(), 'yyyyMMddHHmmss');
      const instanceNumber = `CL-${timestamp}`;

      const { error } = await supabase
        .from('checklist_instances')
        .insert({
          template_id: selectedTemplate,
          batch_id: checklistType === 'batch' ? selectedBatch : null,
          instance_number: instanceNumber,
          status: 'in_progress',
          created_by: userData.user?.id,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklist-instances'] });
      toast({
        title: "Success",
        description: "Checklist created successfully",
      });
      onOpenChange(false);
      // Reset form
      setChecklistType("general");
      setSelectedTemplate("");
      setSelectedBatch("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCreate = () => {
    if (!selectedTemplate) {
      toast({
        title: "Validation Error",
        description: "Please select a checklist template",
        variant: "destructive",
      });
      return;
    }

    if (checklistType === 'batch' && !selectedBatch) {
      toast({
        title: "Validation Error",
        description: "Please select a batch",
        variant: "destructive",
      });
      return;
    }

    createMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Checklist</DialogTitle>
          <DialogDescription>
            Select checklist type and template to create a new checklist
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Checklist Type Selection */}
          <div className="space-y-3">
            <Label>Checklist Type</Label>
            <RadioGroup
              value={checklistType}
              onValueChange={(value) => setChecklistType(value as "general" | "batch")}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="general" id="general" />
                <Label htmlFor="general" className="cursor-pointer font-normal">
                  General Checklist
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="batch" id="batch" />
                <Label htmlFor="batch" className="cursor-pointer font-normal">
                  Batch-Related Checklist
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Batch Selection (only for batch type) */}
          {checklistType === 'batch' && (
            <div className="space-y-2">
              <Label htmlFor="batch">Select Batch *</Label>
              <Select
                value={selectedBatch}
                onValueChange={setSelectedBatch}
              >
                <SelectTrigger id="batch">
                  <SelectValue placeholder="Select a batch" />
                </SelectTrigger>
                <SelectContent>
                  {batches?.map((batch) => (
                    <SelectItem key={batch.id} value={batch.id}>
                      {batch.batch_number} - {batch.current_stage}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Template Selection */}
          <div className="space-y-2">
            <Label htmlFor="template">Checklist Template *</Label>
            <Select
              value={selectedTemplate}
              onValueChange={setSelectedTemplate}
            >
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
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? 'Creating...' : 'Create Checklist'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateChecklistDialog;
