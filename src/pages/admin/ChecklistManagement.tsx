import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, FileText, Settings } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ChecklistTemplateDialog from "@/components/checklists/ChecklistTemplateDialog";
import ChecklistTemplateList from "@/components/checklists/ChecklistTemplateList";

const ChecklistManagement = () => {
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

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

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Checklist Management</h1>
            <p className="text-muted-foreground">
              Manage checklist templates, items, and automation rules
            </p>
          </div>
          <Button onClick={handleNewTemplate}>
            <Plus className="mr-2 h-4 w-4" />
            New Template
          </Button>
        </div>

        <Tabs defaultValue="templates" className="space-y-4">
          <TabsList>
            <TabsTrigger value="templates">
              <FileText className="mr-2 h-4 w-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="rules">
              <Settings className="mr-2 h-4 w-4" />
              Task Rules
            </TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="space-y-4">
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
          </TabsContent>

          <TabsContent value="rules" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Task Generation Rules</CardTitle>
                <CardDescription>
                  Configure automatic task creation based on checklist responses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  Task rules configuration coming soon
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

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
