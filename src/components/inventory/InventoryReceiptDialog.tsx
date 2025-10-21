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
import { CalendarIcon, Upload, X } from 'lucide-react';
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [existingFilePath, setExistingFilePath] = useState<string | null>(null);

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

  // Fetch existing product names
  const { data: existingProducts = [] } = useQuery({
    queryKey: ['inventory-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory_receipts')
        .select('product_name')
        .order('product_name');
      
      if (error) throw error;
      
      // Get unique product names
      const uniqueProducts = Array.from(new Set(data?.map(r => r.product_name) || []));
      return uniqueProducts;
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
      setExistingFilePath(receipt.receipt_file_path || null);
      setSelectedFile(null);
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
      setExistingFilePath(null);
      setSelectedFile(null);
    }
  }, [receipt, open]);

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Upload file if selected
      let filePath = existingFilePath;
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('receipt-attachments')
          .upload(fileName, selectedFile);
        
        if (uploadError) throw uploadError;
        filePath = fileName;
      }

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
        receipt_file_path: filePath,
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type (images and PDFs)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an image (JPG, PNG, WEBP) or PDF file',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please upload a file smaller than 10MB',
        variant: 'destructive',
      });
      return;
    }

    setSelectedFile(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setExistingFilePath(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {receipt ? 'Edit Receipt' : 'Add External Delivery Receipt (HVCSOF038)'}
          </DialogTitle>
          <DialogDescription>
            Record external delivery of chemicals, fertilizers, and other inventory
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Header Info - 3 columns */}
          <div className="grid grid-cols-3 gap-4 bg-card p-4 rounded-lg border-2">
            <div className="space-y-2">
              <Label htmlFor="responsible_person_id" className="text-sm font-semibold text-foreground">Responsible Person</Label>
              <Select
                value={formData.responsible_person_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, responsible_person_id: value })
                }
              >
                <SelectTrigger className="bg-background border-2 border-input hover:border-ring focus:border-ring h-11 font-medium">
                  <SelectValue placeholder="Select person" />
                </SelectTrigger>
                <SelectContent className="z-[100] bg-popover border-2">
                  {users?.map((user) => (
                    <SelectItem key={user.id} value={user.id} className="font-medium">
                      {user.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="month" className="text-sm font-semibold text-foreground">Month</Label>
              <Input
                id="month"
                value={formData.month}
                onChange={(e) =>
                  setFormData({ ...formData, month: e.target.value })
                }
                required
                className="bg-background border-2 border-input hover:border-ring focus:border-ring h-11 font-medium"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="receipt_type" className="text-sm font-semibold text-foreground">
                Receipt Type <span className="text-destructive ml-1 font-bold">*</span>
              </Label>
              <Select
                value={formData.receipt_type}
                onValueChange={(value) =>
                  setFormData({ ...formData, receipt_type: value })
                }
              >
                <SelectTrigger className="bg-background border-2 border-input hover:border-ring focus:border-ring h-11 font-medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[100] bg-popover border-2">
                  <SelectItem value="chemical" className="font-medium">Chemical</SelectItem>
                  <SelectItem value="fertilizer" className="font-medium">Fertilizer</SelectItem>
                  <SelectItem value="seeds" className="font-medium">Seeds</SelectItem>
                  <SelectItem value="growing_media" className="font-medium">Growing Media</SelectItem>
                  <SelectItem value="packaging" className="font-medium">Packaging</SelectItem>
                  <SelectItem value="equipment" className="font-medium">Equipment</SelectItem>
                  <SelectItem value="harvest_output" className="font-medium">Harvest Output</SelectItem>
                  <SelectItem value="other" className="font-medium">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-6 gap-4 bg-card p-4 rounded-lg border-2">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-foreground">
                Date <span className="text-destructive ml-1 font-bold">*</span>
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left h-11 font-medium border-2 border-input hover:border-ring',
                      !formData.receipt_date && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.receipt_date ? (
                      format(formData.receipt_date, 'MMM dd')
                    ) : (
                      <span>Pick date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 z-[100] bg-popover border-2" align="start">
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
              <Label htmlFor="receipt_time" className="text-sm font-semibold text-foreground">
                Time <span className="text-destructive ml-1 font-bold">*</span>
              </Label>
              <Input
                id="receipt_time"
                type="time"
                value={formData.receipt_time}
                onChange={(e) =>
                  setFormData({ ...formData, receipt_time: e.target.value })
                }
                required
                className="bg-background border-2 border-input hover:border-ring focus:border-ring h-11 font-medium"
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="product_name" className="text-sm font-semibold text-foreground">
                Product Name <span className="text-destructive ml-1 font-bold">*</span>
              </Label>
              <Input
                id="product_name"
                value={formData.product_name}
                onChange={(e) =>
                  setFormData({ ...formData, product_name: e.target.value })
                }
                required
                className="bg-background border-2 border-input hover:border-ring focus:border-ring h-11 font-medium"
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="supplier_name" className="text-sm font-semibold text-foreground">
                Supplier <span className="text-destructive ml-1 font-bold">*</span>
              </Label>
              <Input
                id="supplier_name"
                value={formData.supplier_name}
                onChange={(e) =>
                  setFormData({ ...formData, supplier_name: e.target.value })
                }
                required
                className="bg-background border-2 border-input hover:border-ring focus:border-ring h-11 font-medium"
              />
            </div>
          </div>

          {/* Quantity, Unit, Received By, Receiver Signature - 4 columns */}
          <div className="grid grid-cols-4 gap-4 bg-card p-4 rounded-lg border-2">
            <div className="space-y-2">
              <Label htmlFor="quantity" className="text-sm font-semibold text-foreground">
                Quantity <span className="text-destructive ml-1 font-bold">*</span>
              </Label>
              <Input
                id="quantity"
                type="number"
                step="0.01"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: e.target.value })
                }
                required
                className="bg-background border-2 border-input hover:border-ring focus:border-ring h-11 font-medium"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit" className="text-sm font-semibold text-foreground">
                Unit <span className="text-destructive ml-1 font-bold">*</span>
              </Label>
              <Select
                value={formData.unit}
                onValueChange={(value) =>
                  setFormData({ ...formData, unit: value })
                }
              >
                <SelectTrigger className="bg-background border-2 border-input hover:border-ring focus:border-ring h-11 font-medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[100] bg-popover border-2">
                  <SelectItem value="kg" className="font-medium">Kilograms (kg)</SelectItem>
                  <SelectItem value="g" className="font-medium">Grams (g)</SelectItem>
                  <SelectItem value="l" className="font-medium">Liters (L)</SelectItem>
                  <SelectItem value="ml" className="font-medium">Milliliters (mL)</SelectItem>
                  <SelectItem value="units" className="font-medium">Units</SelectItem>
                  <SelectItem value="boxes" className="font-medium">Boxes</SelectItem>
                  <SelectItem value="bags" className="font-medium">Bags</SelectItem>
                  <SelectItem value="packs" className="font-medium">Packs</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="received_by_id" className="text-sm font-semibold text-foreground">
                Received By <span className="text-destructive ml-1 font-bold">*</span>
              </Label>
              <Select
                value={formData.received_by_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, received_by_id: value })
                }
              >
                <SelectTrigger className="bg-background border-2 border-input hover:border-ring focus:border-ring h-11 font-medium">
                  <SelectValue placeholder="Select person" />
                </SelectTrigger>
                <SelectContent className="z-[100] bg-popover border-2">
                  {users?.map((user) => (
                    <SelectItem key={user.id} value={user.id} className="font-medium">
                      {user.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="receiver_signature_id" className="text-sm font-semibold text-foreground">Receiver Signature</Label>
              <Select
                value={formData.receiver_signature_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, receiver_signature_id: value })
                }
              >
                <SelectTrigger className="bg-background border-2 border-input hover:border-ring focus:border-ring h-11 font-medium">
                  <SelectValue placeholder="Select person" />
                </SelectTrigger>
                <SelectContent className="z-[100] bg-popover border-2">
                  {users?.map((user) => (
                    <SelectItem key={user.id} value={user.id} className="font-medium">
                      {user.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Usage Area, Batch Number, Notes - combined row */}
          <div className="grid grid-cols-3 gap-4 bg-card p-4 rounded-lg border-2">
            <div className="space-y-2">
              <Label htmlFor="usage_area" className="text-sm font-semibold text-foreground">Usage Area</Label>
              <Input
                id="usage_area"
                value={formData.usage_area}
                onChange={(e) =>
                  setFormData({ ...formData, usage_area: e.target.value })
                }
                placeholder="e.g., Cloning, Flowering"
                className="bg-background border-2 border-input hover:border-ring focus:border-ring h-11 font-medium placeholder:text-muted-foreground/60 placeholder:font-normal"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="batch_number" className="text-sm font-semibold text-foreground">Batch Number</Label>
              <Input
                id="batch_number"
                value={formData.batch_number}
                onChange={(e) =>
                  setFormData({ ...formData, batch_number: e.target.value })
                }
                className="bg-background border-2 border-input hover:border-ring focus:border-ring h-11 font-medium"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-semibold text-foreground">Notes</Label>
              <Input
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Additional notes"
                className="bg-background border-2 border-input hover:border-ring focus:border-ring h-11 font-medium placeholder:text-muted-foreground/60 placeholder:font-normal"
              />
            </div>
          </div>

          {/* File Upload */}
          <div className="space-y-2 bg-card p-4 rounded-lg border-2">
            <Label htmlFor="receipt_file" className="text-sm font-semibold text-foreground">Receipt Attachment</Label>
            <div className="flex items-center gap-2">
              <Input
                id="receipt_file"
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('receipt_file')?.click()}
                className="w-full h-11 font-medium border-2 border-input hover:border-ring"
              >
                <Upload className="h-4 w-4 mr-2" />
                {selectedFile ? selectedFile.name : existingFilePath ? 'Replace file' : 'Upload receipt scan'}
              </Button>
              {(selectedFile || existingFilePath) && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleRemoveFile}
                  className="h-11 w-11"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            {existingFilePath && !selectedFile && (
              <p className="text-sm text-muted-foreground">Current file attached</p>
            )}
            <p className="text-xs text-muted-foreground">
              Accepted formats: JPG, PNG, WEBP, PDF (max 10MB)
            </p>
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
