import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { format } from 'date-fns';

interface InventorySummary {
  receipt_type: string;
  total_received: number;
  total_used: number;
  available: number;
  unit: string;
}

export const TotalInventoryView = () => {

  // Fetch all receipts
  const { data: receipts = [] } = useQuery({
    queryKey: ['inventory-receipts-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory_receipts')
        .select('*')
        .order('receipt_date', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch all usage records
  const { data: usageRecords = [] } = useQuery({
    queryKey: ['inventory-usage-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory_usage')
        .select('*')
        .order('usage_date', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });

  // Calculate inventory summary by receipt type
  const inventorySummary: InventorySummary[] = (() => {
    const summaryMap = new Map<string, InventorySummary>();
    
    // Create a mapping of product_name to receipt_type from receipts
    const productToReceiptType = new Map<string, string>();
    receipts.forEach((receipt) => {
      productToReceiptType.set(receipt.product_name, receipt.receipt_type);
    });

    // Add receipts grouped by receipt_type
    receipts.forEach((receipt) => {
      const key = `${receipt.receipt_type}-${receipt.unit}`;
      if (!summaryMap.has(key)) {
        summaryMap.set(key, {
          receipt_type: receipt.receipt_type,
          total_received: 0,
          total_used: 0,
          available: 0,
          unit: receipt.unit,
        });
      }
      const summary = summaryMap.get(key)!;
      summary.total_received += Number(receipt.quantity);
    });

    // Subtract usage (map product_name to receipt_type)
    usageRecords.forEach((usage) => {
      const receiptType = productToReceiptType.get(usage.product_name);
      if (receiptType) {
        const key = `${receiptType}-${usage.unit}`;
        if (!summaryMap.has(key)) {
          summaryMap.set(key, {
            receipt_type: receiptType,
            total_received: 0,
            total_used: 0,
            available: 0,
            unit: usage.unit,
          });
        }
        const summary = summaryMap.get(key)!;
        summary.total_used += Number(usage.quantity);
      }
    });

    // Calculate available
    summaryMap.forEach((summary) => {
      summary.available = summary.total_received - summary.total_used;
    });

    return Array.from(summaryMap.values());
  })();

  return (
    <div className="space-y-6">
      {/* Summary Section */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory Summary</CardTitle>
          <CardDescription>Total available quantity by receipt type</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Receipt Type</TableHead>
                <TableHead className="text-right">Total Received</TableHead>
                <TableHead className="text-right">Total Used</TableHead>
                <TableHead className="text-right">Available</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventorySummary.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No inventory data available
                  </TableCell>
                </TableRow>
              ) : (
                inventorySummary.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium capitalize">{item.receipt_type}</TableCell>
                    <TableCell className="text-right">
                      {item.total_received.toFixed(2)} {item.unit}
                    </TableCell>
                    <TableCell className="text-right">
                      {item.total_used.toFixed(2)} {item.unit}
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      {item.available.toFixed(2)} {item.unit}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant={item.available > 0 ? 'default' : 'destructive'}>
                        {item.available > 0 ? 'In Stock' : 'Out of Stock'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Bottom Section - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Receivables */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <CardTitle>Receivables</CardTitle>
                <CardDescription>All incoming inventory receipts</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="max-h-[400px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {receipts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground">
                        No receipts found
                      </TableCell>
                    </TableRow>
                  ) : (
                    receipts.slice(0, 10).map((receipt) => (
                      <TableRow key={receipt.id}>
                        <TableCell>{format(new Date(receipt.receipt_date), 'MMM d, yyyy')}</TableCell>
                        <TableCell className="font-medium">{receipt.product_name}</TableCell>
                        <TableCell className="text-right text-green-600 font-medium">
                          +{receipt.quantity} {receipt.unit}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Used Items */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-600" />
              <div>
                <CardTitle>Used Inventory</CardTitle>
                <CardDescription>Inventory usage records</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="max-h-[400px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usageRecords.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground">
                        No usage records found
                      </TableCell>
                    </TableRow>
                  ) : (
                    usageRecords.slice(0, 10).map((usage) => (
                      <TableRow key={usage.id}>
                        <TableCell>{format(new Date(usage.usage_date), 'MMM d, yyyy')}</TableCell>
                        <TableCell className="font-medium">{usage.product_name}</TableCell>
                        <TableCell className="text-right text-red-600 font-medium">
                          -{usage.quantity} {usage.unit}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};