import { useState } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit, Eye, FileText } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SOFForm } from '@/components/admin/SOFForm';
import { SOFFieldsManager } from '@/components/admin/SOFFieldsManager';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

export default function SOFManagement() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSOF, setEditingSOF] = useState<any>(null);
  const [viewingFields, setViewingFields] = useState<any>(null);

  const { data: sofs, isLoading, refetch } = useQuery({
    queryKey: ['sofs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sofs')
        .select('*')
        .order('sof_number', { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  const filteredSOFs = sofs?.filter(sof =>
    sof.sof_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sof.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (sof: any) => {
    setEditingSOF(sof);
    setIsDialogOpen(true);
  };

  const handleViewFields = (sof: any) => {
    setViewingFields(sof);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingSOF(null);
    refetch();
  };

  const getPhaseColor = (phase: string) => {
    const colors: Record<string, string> = {
      cloning: 'bg-green-500/10 text-green-700 dark:text-green-400',
      hardening: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
      vegetative: 'bg-purple-500/10 text-purple-700 dark:text-purple-400',
      flowering: 'bg-pink-500/10 text-pink-700 dark:text-pink-400',
      harvest: 'bg-orange-500/10 text-orange-700 dark:text-orange-400',
      processing: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
      drying: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
      packing: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400',
      mortality: 'bg-red-500/10 text-red-700 dark:text-red-400',
      scouting: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400',
      general: 'bg-gray-500/10 text-gray-700 dark:text-gray-400',
    };
    return colors[phase] || colors.general;
  };

  if (viewingFields) {
    return (
      <AdminLayout>
        <SOFFieldsManager 
          sof={viewingFields} 
          onBack={() => setViewingFields(null)}
        />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">SOF Management</h1>
          <p className="text-muted-foreground">
            Manage Standard Operating Forms (SOFs) and their checklists
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Standard Operating Forms</CardTitle>
                  <CardDescription>
                    Create and manage SOFs used across different lifecycle phases
                  </CardDescription>
                </div>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add SOF
                </Button>
              </div>
              
              {/* Always show search box */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by SOF number or title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : !sofs || sofs.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No SOFs Created Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Get started by creating your first Standard Operating Form
                  </p>
                  <Button
                    onClick={() => setIsDialogOpen(true)}
                    size="lg"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create First SOF
                  </Button>
                </div>
              ) : filteredSOFs && filteredSOFs.length > 0 ? (
                <div className="space-y-3">
                  {filteredSOFs.map((sof) => (
                    <Card key={sof.id} className="hover:border-primary/50 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-3">
                              <FileText className="h-5 w-5 text-primary" />
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold">{sof.sof_number}</span>
                                  <Badge className={getPhaseColor(sof.lifecycle_phase)}>
                                    {sof.lifecycle_phase}
                                  </Badge>
                                  {!sof.is_active && (
                                    <Badge variant="outline">Inactive</Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground">{sof.title}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground ml-8">
                              <span>Rev. {sof.revision_number}</span>
                              {sof.effective_date && (
                                <span>Effective: {new Date(sof.effective_date).toLocaleDateString()}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewFields(sof)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Manage Fields
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(sof)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : searchTerm ? (
                <div className="text-center py-12">
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Results Found</h3>
                  <p className="text-muted-foreground mb-4">
                    No SOFs found matching "{searchTerm}"
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setSearchTerm('')}
                  >
                    Clear Search
                  </Button>
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No SOFs Created Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Get started by creating your first Standard Operating Form
                  </p>
                  <Button
                    onClick={() => setIsDialogOpen(true)}
                    size="lg"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create First SOF
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingSOF ? 'Edit SOF' : 'Create New SOF'}
            </DialogTitle>
          </DialogHeader>
          <SOFForm 
            sof={editingSOF} 
            onClose={handleCloseDialog}
          />
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}