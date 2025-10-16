import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import InventoryReceiptDialog from './InventoryReceiptDialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

const InventoryReceiptList = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const { data: receipts, isLoading } = useQuery({
    queryKey: ['inventory-receipts', typeFilter],
    queryFn: async () => {
      let query = supabase
        .from('inventory_receipts')
        .select('*')
        .order('receipt_date', { ascending: false });

      if (typeFilter !== 'all') {
        query = query.eq('receipt_type', typeFilter as any);
      }

      const { data: receiptsData, error } = await query;
      if (error) throw error;

      // Fetch related user profiles separately
      if (receiptsData && receiptsData.length > 0) {
        const userIds = new Set<string>();
        receiptsData.forEach((r: any) => {
          if (r.responsible_person_id) userIds.add(r.responsible_person_id);
          if (r.received_by_id) userIds.add(r.received_by_id);
          if (r.receiver_signature_id) userIds.add(r.receiver_signature_id);
        });

        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', Array.from(userIds));

        const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);

        return receiptsData.map((receipt: any) => ({
          ...receipt,
          responsible_person: receipt.responsible_person_id
            ? profileMap.get(receipt.responsible_person_id)
            : null,
          received_by: receipt.received_by_id
            ? profileMap.get(receipt.received_by_id)
            : null,
          receiver_signature: receipt.receiver_signature_id
            ? profileMap.get(receipt.receiver_signature_id)
            : null,
        }));
      }

      return receiptsData || [];
    },
  });

  const filteredReceipts = receipts?.filter((receipt) =>
    receipt.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    receipt.supplier_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    receipt.receipt_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (receipt: any) => {
    setSelectedReceipt(receipt);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setSelectedReceipt(null);
    setDialogOpen(true);
  };

  const getReceiptTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      chemical: 'bg-red-500',
      fertilizer: 'bg-green-500',
      seeds: 'bg-blue-500',
      growing_media: 'bg-amber-500',
      packaging: 'bg-purple-500',
      equipment: 'bg-gray-500',
      harvest_output: 'bg-emerald-500',
      other: 'bg-slate-500',
    };

    return (
      <Badge className={colors[type] || 'bg-gray-500'}>
        {type.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters and Actions */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by product, supplier, or receipt #"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent className="bg-background z-50">
              <SelectItem value="all">All Types</SelectItem>
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
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add Receipt
        </Button>
      </div>

      {/* Receipts Table */}
      {filteredReceipts && filteredReceipts.length > 0 ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Receipt #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Received By</TableHead>
                <TableHead>Usage Area</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReceipts.map((receipt) => (
                <TableRow key={receipt.id}>
                  <TableCell className="font-mono text-sm">
                    {receipt.receipt_number}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {format(new Date(receipt.receipt_date), 'MMM dd, yyyy')}
                    </div>
                  </TableCell>
                  <TableCell>{getReceiptTypeBadge(receipt.receipt_type)}</TableCell>
                  <TableCell className="font-medium">{receipt.product_name}</TableCell>
                  <TableCell>{receipt.supplier_name}</TableCell>
                  <TableCell>
                    {receipt.quantity} {receipt.unit}
                  </TableCell>
                  <TableCell>
                    {receipt.received_by?.full_name || 'Unknown'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{receipt.usage_area || 'N/A'}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(receipt)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-48 text-muted-foreground border rounded-md">
          <Search className="h-12 w-12 mb-2 opacity-50" />
          <p>No receipts found</p>
          <Button variant="link" onClick={handleAdd} className="mt-2">
            Add your first receipt
          </Button>
        </div>
      )}

      <InventoryReceiptDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        receipt={selectedReceipt}
      />
    </div>
  );
};

export default InventoryReceiptList;
