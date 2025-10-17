import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, FileText } from "lucide-react";
import ChecklistTemplateDialog from "@/components/checklists/ChecklistTemplateDialog";
import ChecklistTemplateList from "@/components/checklists/ChecklistTemplateList";
import ChecklistTemplateItemsManager from "@/components/checklists/ChecklistTemplateItemsManager";

const ChecklistManagement = () => {
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [managingItems, setManagingItems] = useState(false);
  const [templateForItems, setTemplateForItems] = useState<any>(null);

  const { data: templates, isLoading } = useQuery({
    queryKey: ['checklist-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('checklist_templates')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const handleEditTemplate = (template: any) => {
    setSelectedTemplate(template);
    setTemplateDialogOpen(true);
  };

  const handleNewTemplate = () => {
    setSelectedTemplate(null);
    setTemplateDialogOpen(true);
  };

  const handleManageItems = (template: any) => {
    setTemplateForItems(template);
    setManagingItems(true);
  };

  const handleBackFromItems = () => {
    setManagingItems(false);
    setTemplateForItems(null);
  };

  if (managingItems && templateForItems) {
    return (
      <AdminLayout>
        <ChecklistTemplateItemsManager
          template={templateForItems}
          onBack={handleBackFromItems}
        />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Checklist Management</h1>
            <p className="text-muted-foreground">
              Manage checklist templates and items
            </p>
          </div>
          <Button onClick={handleNewTemplate}>
            <Plus className="mr-2 h-4 w-4" />
            New Template
          </Button>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Checklist Templates</CardTitle>
              <CardDescription>
                Define reusable checklist templates with SOF numbers
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading templates...
                </div>
              ) : templates && templates.length > 0 ? (
                <ChecklistTemplateList
                  templates={templates}
                  onEdit={handleEditTemplate}
                  onManageItems={handleManageItems}
                />
              ) : (
                <div className="text-center py-8">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">
                    No templates created yet
                  </p>
                  <Button onClick={handleNewTemplate}>
                    Create First Template
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <ChecklistTemplateDialog
          open={templateDialogOpen}
          onOpenChange={setTemplateDialogOpen}
          template={selectedTemplate}
        />
      </div>
    </AdminLayout>
  );
};

export default ChecklistManagement;
