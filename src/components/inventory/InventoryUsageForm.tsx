import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { FileCheck } from 'lucide-react';

export const InventoryUsageForm = () => {
  const [formData, setFormData] = useState({
    usage_date: new Date().toISOString().split('T')[0],
    product_name: '',
    quantity: '',
    unit: 'kg',
    batch_number: '',
    usage_area: '',
    notes: '',
  });

  const queryClient = useQueryClient();

  const createUsageMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('inventory_usage')
        .insert([{
          usage_date: data.usage_date,
          product_name: data.product_name,
          quantity: parseFloat(data.quantity),
          unit: data.unit as any,
          batch_number: data.batch_number || null,
          usage_area: data.usage_area || null,
          notes: data.notes || null,
          created_by: user.id,
        }]);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Usage record created successfully');
      queryClient.invalidateQueries({ queryKey: ['inventory-usage-all'] });
      resetForm();
    },
    onError: (error) => {
      console.error('Error creating usage record:', error);
      toast.error('Failed to create usage record');
    },
  });

  const resetForm = () => {
    setFormData({
      usage_date: new Date().toISOString().split('T')[0],
      product_name: '',
      quantity: '',
      unit: 'kg',
      batch_number: '',
      usage_area: '',
      notes: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.product_name || !formData.quantity) {
      toast.error('Please fill in all required fields');
      return;
    }
    createUsageMutation.mutate(formData);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileCheck className="h-5 w-5 text-primary" />
          <div>
            <CardTitle>Record Inventory Usage</CardTitle>
            <CardDescription>Track inventory consumption and usage</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="usage_date">Usage Date *</Label>
              <Input
                id="usage_date"
                type="date"
                value={formData.usage_date}
                onChange={(e) => setFormData({ ...formData, usage_date: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="product_name">Product Name *</Label>
              <Input
                id="product_name"
                value={formData.product_name}
                onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                placeholder="Enter product name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                step="0.01"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">Unit *</Label>
              <Select value={formData.unit} onValueChange={(value) => setFormData({ ...formData, unit: value })}>
                <SelectTrigger id="unit">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">Kilograms (kg)</SelectItem>
                  <SelectItem value="g">Grams (g)</SelectItem>
                  <SelectItem value="l">Liters (L)</SelectItem>
                  <SelectItem value="ml">Milliliters (mL)</SelectItem>
                  <SelectItem value="units">Units</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="batch_number">Batch Number</Label>
              <Input
                id="batch_number"
                value={formData.batch_number}
                onChange={(e) => setFormData({ ...formData, batch_number: e.target.value })}
                placeholder="Optional"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="usage_area">Usage Area</Label>
              <Input
                id="usage_area"
                value={formData.usage_area}
                onChange={(e) => setFormData({ ...formData, usage_area: e.target.value })}
                placeholder="e.g., Dome 1, Lab"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes (optional)"
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={createUsageMutation.isPending}>
              {createUsageMutation.isPending ? 'Recording...' : 'Record Usage'}
            </Button>
            <Button type="button" variant="outline" onClick={resetForm}>
              Clear Form
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};