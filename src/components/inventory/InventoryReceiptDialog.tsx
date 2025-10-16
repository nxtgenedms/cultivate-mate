import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface InventoryReceiptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  receipt?: any;
}

const InventoryReceiptDialog = ({
  open,
  onOpenChange,
  receipt,
}: InventoryReceiptDialogProps) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    receipt_type: 'chemical',
    receipt_date: new Date(),
    receipt_time: format(new Date(), 'HH:mm'),
    month: format(new Date(), 'MMMM yyyy'),
    responsible_person_id: '',
    received_by_id: '',
    receiver_signature_id: '',
    product_name: '',
    supplier_name: '',
    quantity: '',
    unit: 'kg',
    usage_area: '',
    batch_number: '',
    notes: '',
  });

  // Fetch users for dropdowns
  const { data: users } = useQuery({
    queryKey: ['users-for-inventory'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('is_active', true)
        .order('full_name');
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (receipt) {
      setFormData({
        receipt_type: receipt.receipt_type,
        receipt_date: new Date(receipt.receipt_date),
        receipt_time: receipt.receipt_time,
        month: receipt.month,
        responsible_person_id: receipt.responsible_person_id || '',
        received_by_id: receipt.received_by_id,
        receiver_signature_id: receipt.receiver_signature_id || '',
        product_name: receipt.product_name,
        supplier_name: receipt.supplier_name,
        quantity: receipt.quantity.toString(),
        unit: receipt.unit,
        usage_area: receipt.usage_area || '',
        batch_number: receipt.batch_number || '',
        notes: receipt.notes || '',
      });
    } else {
      // Reset for new receipt
      setFormData({
        receipt_type: 'chemical',
        receipt_date: new Date(),
        receipt_time: format(new Date(), 'HH:mm'),
        month: format(new Date(), 'MMMM yyyy'),
        responsible_person_id: '',
        received_by_id: '',
        receiver_signature_id: '',
        product_name: '',
        supplier_name: '',
        quantity: '',
        unit: 'kg',
        usage_area: '',
        batch_number: '',
        notes: '',
      });
    }
  }, [receipt, open]);

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Generate receipt number if new
      let receiptNumber = receipt?.receipt_number;
      if (!receiptNumber) {
        const { data: generatedNumber, error: genError } = await supabase.rpc(
          'generate_receipt_number',
          { receipt_date: format(data.receipt_date, 'yyyy-MM-dd') }
        );
        if (genError) throw genError;
        receiptNumber = generatedNumber;
      }

      const receiptData = {
        ...data,
        receipt_number: receiptNumber,
        receipt_date: format(data.receipt_date, 'yyyy-MM-dd'),
        quantity: parseFloat(data.quantity),
        created_by: user.id,
      };

      if (receipt) {
        const { error } = await supabase
          .from('inventory_receipts')
          .update(receiptData)
          .eq('id', receipt.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('inventory_receipts')
          .insert([receiptData]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-receipts'] });
      toast({
        title: 'Success',
        description: `Receipt ${receipt ? 'updated' : 'created'} successfully`,
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {receipt ? 'Edit Receipt' : 'Add Inventory Receipt'}
          </DialogTitle>
          <DialogDescription>
            Record external delivery of chemicals, fertilizers, and other inventory
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Header Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="responsible_person_id">Responsible Person</Label>
              <Select
                value={formData.responsible_person_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, responsible_person_id: value })
                }
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select person" />
                </SelectTrigger>
                <SelectContent className="bg-background z-50">
                  {users?.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="month">Month</Label>
              <Input
                id="month"
                value={formData.month}
                onChange={(e) =>
                  setFormData({ ...formData, month: e.target.value })
                }
                required
              />
            </div>
          </div>

          {/* Receipt Type */}
          <div className="space-y-2">
            <Label htmlFor="receipt_type">Receipt Type *</Label>
            <Select
              value={formData.receipt_type}
              onValueChange={(value) =>
                setFormData({ ...formData, receipt_type: value })
              }
            >
              <SelectTrigger className="bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background z-50">
                <SelectItem value="chemical">Chemical</SelectItem>
                <SelectItem value="fertilizer">Fertilizer</SelectItem>
                <SelectItem value="seeds">Seeds</SelectItem>
                <SelectItem value="growing_media">Growing Media</SelectItem>
                <SelectItem value="packaging">Packaging</SelectItem>
                <SelectItem value="equipment">Equipment</SelectItem>
                <SelectItem value="harvest_output">Harvest Output</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !formData.receipt_date && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.receipt_date ? (
                      format(formData.receipt_date, 'PPP')
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-background z-50" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.receipt_date}
                    onSelect={(date) =>
                      date && setFormData({ ...formData, receipt_date: date })
                    }
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="receipt_time">Time *</Label>
              <Input
                id="receipt_time"
                type="time"
                value={formData.receipt_time}
                onChange={(e) =>
                  setFormData({ ...formData, receipt_time: e.target.value })
                }
                required
              />
            </div>
          </div>

          {/* Product Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="product_name">Product Name *</Label>
              <Input
                id="product_name"
                value={formData.product_name}
                onChange={(e) =>
                  setFormData({ ...formData, product_name: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplier_name">Supplier *</Label>
              <Input
                id="supplier_name"
                value={formData.supplier_name}
                onChange={(e) =>
                  setFormData({ ...formData, supplier_name: e.target.value })
                }
                required
              />
            </div>
          </div>

          {/* Quantity */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                step="0.01"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">Unit *</Label>
              <Select
                value={formData.unit}
                onValueChange={(value) =>
                  setFormData({ ...formData, unit: value })
                }
              >
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background z-50">
                  <SelectItem value="kg">Kilograms (kg)</SelectItem>
                  <SelectItem value="g">Grams (g)</SelectItem>
                  <SelectItem value="l">Liters (L)</SelectItem>
                  <SelectItem value="ml">Milliliters (mL)</SelectItem>
                  <SelectItem value="units">Units</SelectItem>
                  <SelectItem value="boxes">Boxes</SelectItem>
                  <SelectItem value="bags">Bags</SelectItem>
                  <SelectItem value="packs">Packs</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* People */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="received_by_id">Received By *</Label>
              <Select
                value={formData.received_by_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, received_by_id: value })
                }
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select person" />
                </SelectTrigger>
                <SelectContent className="bg-background z-50">
                  {users?.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="receiver_signature_id">Receiver Signature</Label>
              <Select
                value={formData.receiver_signature_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, receiver_signature_id: value })
                }
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select person" />
                </SelectTrigger>
                <SelectContent className="bg-background z-50">
                  {users?.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Usage Area & Batch */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="usage_area">Usage Area</Label>
              <Input
                id="usage_area"
                value={formData.usage_area}
                onChange={(e) =>
                  setFormData({ ...formData, usage_area: e.target.value })
                }
                placeholder="e.g., Cloning, Flowering"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="batch_number">Batch Number (if applicable)</Label>
              <Input
                id="batch_number"
                value={formData.batch_number}
                onChange={(e) =>
                  setFormData({ ...formData, batch_number: e.target.value })
                }
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Saving...' : receipt ? 'Update' : 'Create'} Receipt
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default InventoryReceiptDialog;
