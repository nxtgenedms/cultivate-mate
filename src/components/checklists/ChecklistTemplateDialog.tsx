import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ChecklistTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template?: any;
}

const ChecklistTemplateDialog = ({
  open,
  onOpenChange,
  template,
}: ChecklistTemplateDialogProps) => {
  const [formData, setFormData] = useState<{
    template_name: string;
    sof_number: string;
    description: string;
    frequency: "daily" | "weekly" | "monthly" | "on_demand";
    is_batch_specific: boolean;
    lifecycle_phase: "cloning" | "flowering" | "harvest" | "vegetative" | "none";
  }>({
    template_name: "",
    sof_number: "",
    description: "",
    frequency: "on_demand",
    is_batch_specific: false,
    lifecycle_phase: "none",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (template) {
      setFormData({
        template_name: template.template_name || "",
        sof_number: template.sof_number || "",
        description: template.description || "",
        frequency: template.frequency || "on_demand",
        is_batch_specific: template.is_batch_specific || false,
        lifecycle_phase: template.lifecycle_phase || "none",
      });
    } else {
      setFormData({
        template_name: "",
        sof_number: "",
        description: "",
        frequency: "on_demand",
        is_batch_specific: false,
        lifecycle_phase: "none",
      });
    }
  }, [template, open]);

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { data: userData } = await supabase.auth.getUser();
      
      if (template) {
        const { error } = await supabase
          .from('checklist_templates')
          .update({
            template_name: data.template_name,
            sof_number: data.sof_number,
            description: data.description,
            frequency: data.frequency,
            is_batch_specific: data.is_batch_specific,
            lifecycle_phase: data.lifecycle_phase === "none" ? null : data.lifecycle_phase as "cloning" | "flowering" | "harvest" | "vegetative",
          })
          .eq('id', template.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('checklist_templates')
          .insert([{
            template_name: data.template_name,
            sof_number: data.sof_number,
            description: data.description,
            frequency: data.frequency,
            is_batch_specific: data.is_batch_specific,
            lifecycle_phase: data.lifecycle_phase === "none" ? null : data.lifecycle_phase as "cloning" | "flowering" | "harvest" | "vegetative",
            created_by: userData.user?.id,
          }]);
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklist-templates'] });
      toast({
        title: "Success",
        description: `Template ${template ? 'updated' : 'created'} successfully`,
      });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {template ? 'Edit Template' : 'Create Checklist Template'}
          </DialogTitle>
          <DialogDescription>
            Define a reusable checklist template with SOF number
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="template_name">Template Name</Label>
            <Input
              id="template_name"
              value={formData.template_name}
              onChange={(e) => setFormData({ ...formData, template_name: e.target.value })}
              placeholder="e.g., Daily Cloning Record"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sof_number">SOF Number</Label>
            <Input
              id="sof_number"
              value={formData.sof_number}
              onChange={(e) => setFormData({ ...formData, sof_number: e.target.value })}
              placeholder="e.g., HVCSOF0011"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of this checklist"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="frequency">Frequency</Label>
            <Select
              value={formData.frequency}
              onValueChange={(value) => setFormData({ ...formData, frequency: value as "daily" | "weekly" | "monthly" | "on_demand" })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="on_demand">On Demand</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_batch_specific"
              checked={formData.is_batch_specific}
              onCheckedChange={(checked) => 
                setFormData({ ...formData, is_batch_specific: checked })
              }
            />
            <Label htmlFor="is_batch_specific">Batch-Specific Checklist</Label>
          </div>

          {formData.is_batch_specific && (
            <div className="space-y-2">
              <Label htmlFor="lifecycle_phase">Lifecycle Phase (Optional)</Label>
              <Select
                value={formData.lifecycle_phase}
                onValueChange={(value) => setFormData({ ...formData, lifecycle_phase: value as "cloning" | "flowering" | "harvest" | "vegetative" | "none" })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select phase" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Any Phase</SelectItem>
                  <SelectItem value="cloning">Cloning</SelectItem>
                  <SelectItem value="vegetation">Vegetation</SelectItem>
                  <SelectItem value="flowering">Flowering</SelectItem>
                  <SelectItem value="harvest">Harvest</SelectItem>
                  <SelectItem value="drying">Drying</SelectItem>
                  <SelectItem value="curing">Curing</SelectItem>
                  <SelectItem value="packaging">Packaging</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Saving...' : template ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ChecklistTemplateDialog;
