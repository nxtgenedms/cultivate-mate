import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function LookupManagement() {
  const [isAddValueDialogOpen, setIsAddValueDialogOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
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

  // Fetch values
  const { data: values } = useQuery({
    queryKey: ['lookup-values'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lookup_values')
        .select('*, lookup_categories(category_name)')
        .order('sort_order');

      if (error) throw error;
      return data;
    },
  });

  // Add value mutation
  const addValue = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('lookup_values')
        .insert({
          category_id: selectedCategoryId,
          value_key: valueKey,
          value_display: valueDisplay,
          sort_order: parseInt(sortOrder),
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lookup-values'] });
      toast({
        title: 'Value added',
        description: 'Lookup value has been added successfully.',
      });
      setIsAddValueDialogOpen(false);
      setValueKey('');
      setValueDisplay('');
      setSortOrder('0');
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
      queryClient.invalidateQueries({ queryKey: ['lookup-values'] });
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
      queryClient.invalidateQueries({ queryKey: ['lookup-values'] });
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

  const handleAddValue = () => {
    if (!selectedCategoryId || !valueKey || !valueDisplay) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    addValue.mutate();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Lookup Management</h1>
            <p className="text-muted-foreground">Manage dropdown values and categories</p>
          </div>
          <Dialog open={isAddValueDialogOpen} onOpenChange={setIsAddValueDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Lookup Value
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Lookup Value</DialogTitle>
                <DialogDescription>
                  Add a new dropdown value to a category.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.category_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="value-key">Value Key *</Label>
                  <Input
                    id="value-key"
                    placeholder="e.g., vegetative"
                    value={valueKey}
                    onChange={(e) => setValueKey(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="value-display">Display Text *</Label>
                  <Input
                    id="value-display"
                    placeholder="e.g., Vegetative"
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
                <Button variant="outline" onClick={() => setIsAddValueDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddValue}>Add Value</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="categories" className="space-y-4">
          <TabsList>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="values">Values</TabsTrigger>
          </TabsList>

          <TabsContent value="categories">
            <Card>
              <CardHeader>
                <CardTitle>Lookup Categories</CardTitle>
                <CardDescription>
                  Available categories for dropdown values
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
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories?.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell className="font-medium">{category.category_name}</TableCell>
                        <TableCell><code className="text-xs">{category.category_key}</code></TableCell>
                        <TableCell>{category.description}</TableCell>
                        <TableCell>
                          <Badge variant={category.is_active ? 'default' : 'secondary'}>
                            {category.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="values">
            <Card>
              <CardHeader>
                <CardTitle>Lookup Values</CardTitle>
                <CardDescription>
                  Manage individual dropdown values
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead>Value Key</TableHead>
                      <TableHead>Display Text</TableHead>
                      <TableHead>Sort Order</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {values?.map((value) => (
                      <TableRow key={value.id}>
                        <TableCell>{value.lookup_categories?.category_name}</TableCell>
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
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteValue.mutate(value.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
