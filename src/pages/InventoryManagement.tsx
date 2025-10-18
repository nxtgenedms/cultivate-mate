import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Leaf, BarChart3 } from 'lucide-react';
import InventoryReceiptList from '@/components/inventory/InventoryReceiptList';
import { TotalInventoryView } from '@/components/inventory/TotalInventoryView';

const InventoryManagement = () => {
  const [activeTab, setActiveTab] = useState('total');

  return (
    <Layout>
      <div className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-3xl grid-cols-3">
            <TabsTrigger value="total" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Total Inventory
            </TabsTrigger>
            <TabsTrigger value="receipts" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Receipts
            </TabsTrigger>
            <TabsTrigger value="harvest" className="flex items-center gap-2">
              <Leaf className="h-4 w-4" />
              Harvest
            </TabsTrigger>
          </TabsList>

          <TabsContent value="total" className="mt-6">
            <TotalInventoryView />
          </TabsContent>

          <TabsContent value="receipts" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>External Delivery Receipts (HVCSOF038)</CardTitle>
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
    </Layout>
  );
};

export default InventoryManagement;
