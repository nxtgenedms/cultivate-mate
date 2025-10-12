import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, ArrowLeft, ChevronRight } from 'lucide-react';

export default function LookupManagement() {
  const [isAddValueDialogOpen, setIsAddValueDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [editingValue, setEditingValue] = useState<any>(null);
  const [valueKey, setValueKey] = useState('');
  const [valueDisplay, setValueDisplay] = useState('');
  const [sortOrder, setSortOrder] = useState('0');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['lookup-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lookup_categories')
        .select('*')
        .order('category_name');

      if (error) throw error;
      return data;
    },
  });

  // Fetch values for selected category
  const { data: values } = useQuery({
    queryKey: ['lookup-values', selectedCategory?.id],
    enabled: !!selectedCategory,
    queryFn: async () => {
      if (!selectedCategory) return [];
      const { data, error } = await supabase
        .from('lookup_values')
        .select('*')
        .eq('category_id', selectedCategory.id)
        .order('sort_order');

      if (error) throw error;
      return data;
    },
  });

  // Add/Update value mutation
  const saveValue = useMutation({
    mutationFn: async () => {
      if (editingValue) {
        // Update existing value
        const { error } = await supabase
          .from('lookup_values')
          .update({
            value_key: valueKey,
            value_display: valueDisplay,
            sort_order: parseInt(sortOrder),
          })
          .eq('id', editingValue.id);
        if (error) throw error;
      } else {
        // Insert new value
        const { error } = await supabase
          .from('lookup_values')
          .insert({
            category_id: selectedCategory.id,
            value_key: valueKey,
            value_display: valueDisplay,
            sort_order: parseInt(sortOrder),
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lookup-values', selectedCategory?.id] });
      toast({
        title: editingValue ? 'Value updated' : 'Value added',
        description: `Lookup value has been ${editingValue ? 'updated' : 'added'} successfully.`,
      });
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

  // Toggle value status
  const toggleValue = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('lookup_values')
        .update({ is_active: !isActive })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lookup-values', selectedCategory?.id] });
      toast({
        title: 'Status updated',
        description: 'Lookup value status has been updated.',
      });
    },
  });

  // Delete value mutation
  const deleteValue = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('lookup_values')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lookup-values', selectedCategory?.id] });
      toast({
        title: 'Value deleted',
        description: 'Lookup value has been deleted successfully.',
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
    setValueKey('');
    setValueDisplay('');
    setSortOrder('0');
    setEditingValue(null);
    setIsAddValueDialogOpen(false);
  };

  const handleEdit = (value: any) => {
    setEditingValue(value);
    setValueKey(value.value_key);
    setValueDisplay(value.value_display);
    setSortOrder(value.sort_order.toString());
    setIsAddValueDialogOpen(true);
  };

  const handleSaveValue = () => {
    if (!valueKey || !valueDisplay) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }
    saveValue.mutate();
  };

  // If category is selected, show its values
  if (selectedCategory) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedCategory(null)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold">{selectedCategory.category_name}</h1>
              <p className="text-muted-foreground">{selectedCategory.description}</p>
            </div>
            <Button onClick={() => { setEditingValue(null); resetForm(); setIsAddValueDialogOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Value
            </Button>
          </div>

          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Value Key</TableHead>
                    <TableHead>Display Text</TableHead>
                    <TableHead>Sort Order</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {values?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        No values found. Click "Add Value" to create one.
                      </TableCell>
                    </TableRow>
                  ) : (
                    values?.map((value) => (
                      <TableRow key={value.id}>
                        <TableCell><code className="text-xs">{value.value_key}</code></TableCell>
                        <TableCell className="font-medium">{value.value_display}</TableCell>
                        <TableCell>{value.sort_order}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={value.is_active}
                              onCheckedChange={() => 
                                toggleValue.mutate({ id: value.id, isActive: value.is_active })
                              }
                            />
                            <span className="text-sm">
                              {value.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(value)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteValue.mutate(value.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Dialog open={isAddValueDialogOpen} onOpenChange={setIsAddValueDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingValue ? 'Edit Value' : 'Add Value'}</DialogTitle>
                <DialogDescription>
                  {editingValue ? 'Update the lookup value details.' : 'Add a new value to this category.'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="value-key">Value Key *</Label>
                  <Input
                    id="value-key"
                    placeholder="e.g., strain_1"
                    value={valueKey}
                    onChange={(e) => setValueKey(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="value-display">Display Text *</Label>
                  <Input
                    id="value-display"
                    placeholder="e.g., Strain 1"
                    value={valueDisplay}
                    onChange={(e) => setValueDisplay(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sort-order">Sort Order</Label>
                  <Input
                    id="sort-order"
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button onClick={handleSaveValue}>
                  {editingValue ? 'Update' : 'Add'} Value
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </AdminLayout>
    );
  }

  // Show categories list
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Lookup Management</h1>
            <p className="text-muted-foreground">Manage dropdown values and categories</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lookup Categories</CardTitle>
            <CardDescription>
              Click on a category to view and manage its values
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category Name</TableHead>
                  <TableHead>Key</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories?.map((category) => (
                  <TableRow 
                    key={category.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setSelectedCategory(category)}
                  >
                    <TableCell className="font-medium">{category.category_name}</TableCell>
                    <TableCell><code className="text-xs">{category.category_key}</code></TableCell>
                    <TableCell>{category.description}</TableCell>
                    <TableCell>
                      <Badge variant={category.is_active ? 'default' : 'secondary'}>
                        {category.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
