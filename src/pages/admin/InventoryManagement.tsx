import { useState } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Leaf } from 'lucide-react';
import InventoryReceiptList from '@/components/inventory/InventoryReceiptList';

const InventoryManagement = () => {
  const [activeTab, setActiveTab] = useState('receipts');

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
          <p className="text-muted-foreground mt-2">
            Track all incoming inventory receipts and harvest outputs
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="receipts" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Receipts
            </TabsTrigger>
            <TabsTrigger value="harvest" className="flex items-center gap-2">
              <Leaf className="h-4 w-4" />
              Harvest
            </TabsTrigger>
          </TabsList>

          <TabsContent value="receipts" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>External Delivery Receipts</CardTitle>
                <CardDescription>
                  Manage chemical, fertilizer, and all other incoming inventory receipts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <InventoryReceiptList />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="harvest" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Harvest Outputs</CardTitle>
                <CardDescription>
                  Track harvest outputs from batches (Coming Soon)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-48 text-muted-foreground">
                  <div className="text-center space-y-2">
                    <Leaf className="h-12 w-12 mx-auto opacity-50" />
                    <p>Harvest tracking will be implemented here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default InventoryManagement;
