import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import ChecklistTemplateItemDialog from "./ChecklistTemplateItemDialog";

interface ChecklistTemplateItemsManagerProps {
  template: any;
  onBack: () => void;
}

const ChecklistTemplateItemsManager = ({
  template,
  onBack,
}: ChecklistTemplateItemsManagerProps) => {
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: items, isLoading } = useQuery({
    queryKey: ["checklist-template-items", template.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("checklist_template_items")
        .select("*")
        .eq("template_id", template.id)
        .order("sort_order");

      if (error) throw error;
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const { error } = await supabase
        .from("checklist_template_items")
        .delete()
        .eq("id", itemId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklist-template-items"] });
      toast.success("Item deleted successfully");
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    },
    onError: (error) => {
      toast.error("Failed to delete item: " + error.message);
    },
  });

  const handleEdit = (item: any) => {
    setSelectedItem(item);
    setItemDialogOpen(true);
  };

  const handleNew = () => {
    setSelectedItem(null);
    setItemDialogOpen(true);
  };

  const handleDelete = (item: any) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const getItemTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      yes_no: "bg-blue-500",
      text: "bg-green-500",
      number: "bg-purple-500",
      date: "bg-orange-500",
      select: "bg-pink-500",
      batch_info: "bg-cyan-500",
    };

    return (
      <Badge className={colors[type] || "bg-gray-500"}>
        {type.replace("_", " ")}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h2 className="text-2xl font-bold">{template.template_name}</h2>
            <p className="text-sm text-muted-foreground">
              SOF: {template.sof_number}
            </p>
          </div>
        </div>
        <Button onClick={handleNew}>
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Checklist Items</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading items...
            </div>
          ) : items && items.length > 0 ? (
            <div className="space-y-2">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-medium">{item.item_label}</span>
                      {getItemTypeBadge(item.item_type)}
                      {item.is_required && (
                        <Badge variant="destructive">Required</Badge>
                      )}
                    </div>
                    {item.section_name && (
                      <p className="text-sm text-muted-foreground">
                        Section: {item.section_name}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Sort Order: {item.sort_order}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(item)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(item)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No items added yet. Click "Add Item" to create one.
            </div>
          )}
        </CardContent>
      </Card>

      <ChecklistTemplateItemDialog
        open={itemDialogOpen}
        onOpenChange={setItemDialogOpen}
        templateId={template.id}
        item={selectedItem}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{itemToDelete?.item_label}"? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => itemToDelete && deleteMutation.mutate(itemToDelete.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ChecklistTemplateItemsManager;
