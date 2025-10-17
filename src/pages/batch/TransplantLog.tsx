import { BatchLayout } from '@/components/BatchLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

export default function TransplantLog() {
  return (
    <BatchLayout>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Daily Cloning & Transplant Log (HVCSOF0012)
          </CardTitle>
          <CardDescription>
            Track daily cloning activities and transplant progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            Cloning & Transplant Log feature coming soon
          </div>
        </CardContent>
      </Card>
    </BatchLayout>
  );
}
