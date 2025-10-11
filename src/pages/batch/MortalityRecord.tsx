import { BatchLayout } from '@/components/BatchLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skull } from 'lucide-react';

export default function MortalityRecord() {
  return (
    <BatchLayout>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Skull className="h-5 w-5" />
            Mortality & Discard Record (HVCSOF0015)
          </CardTitle>
          <CardDescription>
            Track plant mortality and discard events with mandatory details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            Mortality & Discard Record feature coming soon
          </div>
        </CardContent>
      </Card>
    </BatchLayout>
  );
}
