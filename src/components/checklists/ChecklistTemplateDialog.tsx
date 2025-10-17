import { useState, useEffect } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { toast } from "sonner";
import { TASK_CATEGORIES, type TaskCategory } from "@/lib/taskCategoryUtils";

interface ChecklistTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template?: any;
}

const ChecklistTemplateDialog = ({ open, onOpenChange, template }: ChecklistTemplateDialogProps) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    template_name: "",
    sof_number: "",
    description: "",
    frequency: "on_demand",
    is_batch_specific: false,
    lifecycle_phase: "",
    task_category: "",
  });

  useEffect(() => {
    if (template) {
      setFormData({
        template_name: template.template_name || "",
        sof_number: template.sof_number || "",
        description: template.description || "",
        frequency: template.frequency || "on_demand",
        is_batch_specific: template.is_batch_specific || false,
        lifecycle_phase: template.lifecycle_phase || "",
        task_category: template.task_category || "",
      });
    } else if (open) {
      setFormData({
        template_name: "",
        sof_number: "",
        description: "",
        frequency: "on_demand",
        is_batch_specific: false,
        lifecycle_phase: "",
        task_category: "",
      });
    }
  }, [template, open]);

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (template) {
        const { error } = await supabase
          .from('checklist_templates')
          .update(data)
          .eq('id', template.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('checklist_templates')
          .insert([{ ...data, created_by: user?.id }]);
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklist-templates'] });
      toast.success(template ? "Template updated successfully" : "Template created successfully");
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(`Failed to save template: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  const getApprovalWorkflow = (category: string) => {
    const workflows: Record<string, string> = {
      'daily_cloning_transplant': 'Assistant Grower → Grower/Manager',
      'mortality_discard': 'Grower → Manager → QA',
      'weekly_cultivation': 'Grower → Manager',
      'clonator_weekly': 'Grower → Supervisor → Manager',
      'soil_moisture': 'Grower → Manager',
      'scouting_corrective': 'Grower → Manager → QA',
      'chemical_delivery': 'Receiver Signature',
      'fertigation_application': 'Grower → Manager → QA',
      'ipm_chemical_mixing': 'Grower → Manager → QA',
      'hygiene_check': 'Staff → Manager/Supervisor',
      'cultivation_cleaning': 'Performer → Manager → QA',
      'processing_cleaning': 'Performer → Manager → QA',
      'pre_harvest': 'Grower → Supervisor',
      'final_harvest': 'Manager → QA',
    };
    return workflows[category] || 'Creator → Manager';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {template ? 'Edit Checklist Template' : 'Create Checklist Template'}
          </DialogTitle>
          <DialogDescription>
            Define a reusable checklist template with SOF number and items
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="template_name">Template Name *</Label>
            <Input
              id="template_name"
              value={formData.template_name}
              onChange={(e) => setFormData({ ...formData, template_name: e.target.value })}
              placeholder="e.g., Weekly Cloning Inspection"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sof_number">SOF Number *</Label>
            <Input
              id="sof_number"
              value={formData.sof_number}
              onChange={(e) => setFormData({ ...formData, sof_number: e.target.value })}
              placeholder="e.g., SOF04"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the purpose of this checklist"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="frequency">Frequency *</Label>
            <Select
              value={formData.frequency}
              onValueChange={(value) => setFormData({ ...formData, frequency: value })}
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
              onCheckedChange={(checked) => setFormData({ ...formData, is_batch_specific: checked })}
            />
            <Label htmlFor="is_batch_specific">Batch Specific</Label>
          </div>

          {formData.is_batch_specific && (
            <div className="space-y-2">
              <Label htmlFor="lifecycle_phase">Lifecycle Phase</Label>
              <Select
                value={formData.lifecycle_phase}
                onValueChange={(value) => setFormData({ ...formData, lifecycle_phase: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select phase" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cloning">Cloning</SelectItem>
                  <SelectItem value="rooting">Rooting</SelectItem>
                  <SelectItem value="hardening">Hardening</SelectItem>
                  <SelectItem value="vegetative">Vegetative</SelectItem>
                  <SelectItem value="flowering">Flowering</SelectItem>
                  <SelectItem value="harvest">Harvest</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="drying">Drying</SelectItem>
                  <SelectItem value="packaging">Packaging</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="task_category">Task Category</Label>
            <Select
              value={formData.task_category}
              onValueChange={(value) => setFormData({ ...formData, task_category: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TASK_CATEGORIES).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {formData.task_category && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Approval Workflow:</strong> {getApprovalWorkflow(formData.task_category)}
              </AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? "Saving..." : "Save Template"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ChecklistTemplateDialog;
