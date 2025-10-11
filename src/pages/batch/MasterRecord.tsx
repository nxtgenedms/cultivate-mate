import { BatchLayout } from '@/components/BatchLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

export default function MasterRecord() {
  return (
    <BatchLayout>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Batch Lifecycle Master Record (HVCSOF009)
          </CardTitle>
          <CardDescription>
            Centralized aggregation of all batch data and lifecycle events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            Master Record dashboard coming soon
          </div>
        </CardContent>
      </Card>
    </BatchLayout>
  );
}
