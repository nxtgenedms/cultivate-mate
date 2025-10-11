import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BatchLayout } from '@/components/BatchLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Plus, FileText, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';

export default function CloningChecklist() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    motherId: '',
    batchNumber: '',
    quantity: '',
    // Mother Health
    motherHealthVigorous: false,
    motherHealthPestFree: false,
    motherHealthDiseaseFree: false,
    // Preparation
    prepToolsSterilized: false,
    prepMediaReady: false,
    prepEnvironmentClean: false,
    // Hygiene
    hygieneHandsSanitized: false,
    hygienePpeWorn: false,
    hygieneWorkspaceClean: false,
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch checklists
  const { data: checklists, isLoading } = useQuery({
    queryKey: ['cloning-checklists'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cloning_pre_start_checklists')
        .select(`
          *,
          approved_by_profile:profiles!approved_by(full_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Create checklist mutation
  const createChecklist = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from('cloning_pre_start_checklists')
        .insert({
          mother_id: data.motherId,
          batch_number: data.batchNumber,
          quantity: parseInt(data.quantity),
          mother_health_vigorous: data.motherHealthVigorous,
          mother_health_pest_free: data.motherHealthPestFree,
          mother_health_disease_free: data.motherHealthDiseaseFree,
          prep_tools_sterilized: data.prepToolsSterilized,
          prep_media_ready: data.prepMediaReady,
          prep_environment_clean: data.prepEnvironmentClean,
          hygiene_hands_sanitized: data.hygieneHandsSanitized,
          hygiene_ppe_worn: data.hygienePpeWorn,
          hygiene_workspace_clean: data.hygieneWorkspaceClean,
          status: 'draft',
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cloning-checklists'] });
      toast({
        title: 'Checklist created',
        description: 'Cloning pre-start checklist has been saved as draft.',
      });
      setIsCreateDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Submit for approval mutation
  const submitForApproval = useMutation({
    mutationFn: async (checklistId: string) => {
      const { error } = await supabase
        .from('cloning_pre_start_checklists')
        .update({
          status: 'pending',
          submitted_at: new Date().toISOString(),
        })
        .eq('id', checklistId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cloning-checklists'] });
      toast({
        title: 'Submitted for approval',
        description: 'Checklist has been submitted to grower for review.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Approve checklist mutation
  const approveChecklist = useMutation({
    mutationFn: async (checklistId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('cloning_pre_start_checklists')
        .update({
          status: 'approved',
          approved_by: user?.id,
          approved_at: new Date().toISOString(),
        })
        .eq('id', checklistId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cloning-checklists'] });
      toast({
        title: 'Checklist approved',
        description: 'Cloning can proceed.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const resetForm = () => {
    setFormData({
      motherId: '',
      batchNumber: '',
      quantity: '',
      motherHealthVigorous: false,
      motherHealthPestFree: false,
      motherHealthDiseaseFree: false,
      prepToolsSterilized: false,
      prepMediaReady: false,
      prepEnvironmentClean: false,
      hygieneHandsSanitized: false,
      hygienePpeWorn: false,
      hygieneWorkspaceClean: false,
    });
  };

  const handleSubmit = () => {
    if (!formData.motherId || !formData.batchNumber || !formData.quantity) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }
    createChecklist.mutate(formData);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Draft</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge className="bg-green-500"><CheckCircle2 className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <BatchLayout>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Cloning Pre-Start Checklist (HVCSOF0011)
                </CardTitle>
                <CardDescription>
                  Pre-cloning verification checklist - Mother Health, Preparation & Hygiene
                </CardDescription>
              </div>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Checklist
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create Cloning Pre-Start Checklist</DialogTitle>
                    <DialogDescription>
                      Complete all checks before starting cloning operations
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6 py-4">
                    {/* Basic Information */}
                    <div className="space-y-4">
                      <h3 className="font-semibold">Batch Information</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="motherId">Mother ID *</Label>
                          <Input
                            id="motherId"
                            value={formData.motherId}
                            onChange={(e) => setFormData({ ...formData, motherId: e.target.value })}
                            placeholder="M-001"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="batchNumber">Batch Number *</Label>
                          <Input
                            id="batchNumber"
                            value={formData.batchNumber}
                            onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                            placeholder="B-2025-001"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="quantity">Quantity *</Label>
                          <Input
                            id="quantity"
                            type="number"
                            value={formData.quantity}
                            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                            placeholder="100"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Mother Health Checklist */}
                    <div className="space-y-3 border-t pt-4">
                      <h3 className="font-semibold">Mother Health Checklist</h3>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="vigorous"
                            checked={formData.motherHealthVigorous}
                            onCheckedChange={(checked) => 
                              setFormData({ ...formData, motherHealthVigorous: checked as boolean })
                            }
                          />
                          <label htmlFor="vigorous" className="text-sm cursor-pointer">
                            Mother plant is vigorous and healthy
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="pestFree"
                            checked={formData.motherHealthPestFree}
                            onCheckedChange={(checked) => 
                              setFormData({ ...formData, motherHealthPestFree: checked as boolean })
                            }
                          />
                          <label htmlFor="pestFree" className="text-sm cursor-pointer">
                            Mother plant is pest-free
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="diseaseFree"
                            checked={formData.motherHealthDiseaseFree}
                            onCheckedChange={(checked) => 
                              setFormData({ ...formData, motherHealthDiseaseFree: checked as boolean })
                            }
                          />
                          <label htmlFor="diseaseFree" className="text-sm cursor-pointer">
                            Mother plant is disease-free
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Preparation Checklist */}
                    <div className="space-y-3 border-t pt-4">
                      <h3 className="font-semibold">Preparation Checklist</h3>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="toolsSterilized"
                            checked={formData.prepToolsSterilized}
                            onCheckedChange={(checked) => 
                              setFormData({ ...formData, prepToolsSterilized: checked as boolean })
                            }
                          />
                          <label htmlFor="toolsSterilized" className="text-sm cursor-pointer">
                            All tools are sterilized
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="mediaReady"
                            checked={formData.prepMediaReady}
                            onCheckedChange={(checked) => 
                              setFormData({ ...formData, prepMediaReady: checked as boolean })
                            }
                          />
                          <label htmlFor="mediaReady" className="text-sm cursor-pointer">
                            Growing media is ready
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="environmentClean"
                            checked={formData.prepEnvironmentClean}
                            onCheckedChange={(checked) => 
                              setFormData({ ...formData, prepEnvironmentClean: checked as boolean })
                            }
                          />
                          <label htmlFor="environmentClean" className="text-sm cursor-pointer">
                            Environment is clean and prepared
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Hygiene Checklist */}
                    <div className="space-y-3 border-t pt-4">
                      <h3 className="font-semibold">Hygiene Checklist</h3>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="handsSanitized"
                            checked={formData.hygieneHandsSanitized}
                            onCheckedChange={(checked) => 
                              setFormData({ ...formData, hygieneHandsSanitized: checked as boolean })
                            }
                          />
                          <label htmlFor="handsSanitized" className="text-sm cursor-pointer">
                            Hands are properly sanitized
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="ppeWorn"
                            checked={formData.hygienePpeWorn}
                            onCheckedChange={(checked) => 
                              setFormData({ ...formData, hygienePpeWorn: checked as boolean })
                            }
                          />
                          <label htmlFor="ppeWorn" className="text-sm cursor-pointer">
                            PPE (gloves, hairnet) is worn
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="workspaceClean"
                            checked={formData.hygieneWorkspaceClean}
                            onCheckedChange={(checked) => 
                              setFormData({ ...formData, hygieneWorkspaceClean: checked as boolean })
                            }
                          />
                          <label htmlFor="workspaceClean" className="text-sm cursor-pointer">
                            Workspace is clean and organized
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSubmit}>
                      Save as Draft
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12">Loading checklists...</div>
            ) : checklists && checklists.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Batch #</TableHead>
                    <TableHead>Mother ID</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created By</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Approved By</TableHead>
                    <TableHead>Approved At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {checklists.map((checklist: any) => (
                    <TableRow key={checklist.id}>
                      <TableCell className="font-medium">{checklist.batch_number}</TableCell>
                      <TableCell>{checklist.mother_id}</TableCell>
                      <TableCell>{checklist.quantity}</TableCell>
                      <TableCell>{getStatusBadge(checklist.status)}</TableCell>
                      <TableCell>You</TableCell>
                      <TableCell>{format(new Date(checklist.created_at), 'MMM d, yyyy')}</TableCell>
                      <TableCell>
                        {checklist.approved_by_profile?.full_name || '-'}
                      </TableCell>
                      <TableCell>
                        {checklist.approved_at 
                          ? format(new Date(checklist.approved_at), 'MMM d, yyyy h:mm a')
                          : '-'
                        }
                      </TableCell>
                      <TableCell>
                        {checklist.status === 'draft' && (
                          <Button
                            size="sm"
                            onClick={() => submitForApproval.mutate(checklist.id)}
                          >
                            Submit
                          </Button>
                        )}
                        {checklist.status === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => approveChecklist.mutate(checklist.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Approve
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                No checklists yet. Create your first cloning pre-start checklist.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </BatchLayout>
  );
}
