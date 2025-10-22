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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface ChecklistTemplateItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templateId: string;
  item?: any;
}

const ChecklistTemplateItemDialog = ({ 
  open, 
  onOpenChange, 
  templateId, 
  item 
}: ChecklistTemplateItemDialogProps) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    section_name: "",
    item_label: "",
    item_type: "checkbox",
    is_required: false,
    sort_order: 0,
  });

  useEffect(() => {
    if (item) {
      setFormData({
        section_name: item.section_name || "",
        item_label: item.item_label || "",
        item_type: item.item_type || "checkbox",
        is_required: item.is_required || false,
        sort_order: item.sort_order || 0,
      });
    } else if (open) {
      setFormData({
        section_name: "",
        item_label: "",
        item_type: "checkbox",
        is_required: false,
        sort_order: 0,
      });
    }
  }, [item, open]);

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (item) {
        const { error } = await supabase
          .from('checklist_template_items')
          .update(data)
          .eq('id', item.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('checklist_template_items')
          .insert([{ ...data, template_id: templateId }]);
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklist-template-items', templateId] });
      toast.success(item ? "Item updated successfully" : "Item added successfully");
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(`Failed to save item: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {item ? 'Edit Checklist Item' : 'Add Checklist Item'}
          </DialogTitle>
          <DialogDescription>
            Define an item for this checklist template
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="section_name">Section Name</Label>
            <Input
              id="section_name"
              value={formData.section_name}
              onChange={(e) => setFormData({ ...formData, section_name: e.target.value })}
              placeholder="e.g., Pre-Cloning Checks"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="item_label">Item Label *</Label>
            <Input
              id="item_label"
              value={formData.item_label}
              onChange={(e) => setFormData({ ...formData, item_label: e.target.value })}
              placeholder="e.g., Check temperature"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="item_type">Item Type *</Label>
            <Select
              value={formData.item_type}
              onValueChange={(value) => setFormData({ ...formData, item_type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="checkbox">Checkbox</SelectItem>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="number">Number</SelectItem>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="textarea">Textarea</SelectItem>
                <SelectItem value="signature">Signature</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sort_order">Sort Order</Label>
            <Input
              id="sort_order"
              type="number"
              value={formData.sort_order}
              onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_required"
              checked={formData.is_required}
              onCheckedChange={(checked) => setFormData({ ...formData, is_required: checked })}
            />
            <Label htmlFor="is_required">Required</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? "Saving..." : "Save Item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ChecklistTemplateItemDialog;
