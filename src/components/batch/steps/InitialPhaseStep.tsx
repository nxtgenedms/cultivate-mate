import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card } from '@/components/ui/card';
import { Sprout, Search } from 'lucide-react';

interface InitialPhaseStepProps {
  data: any;
  onChange: (data: any) => void;
}

export function InitialPhaseStep({ data, onChange }: InitialPhaseStepProps) {
  const handlePhaseChange = (phase: string) => {
    onChange({ ...data, starting_phase: phase });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Select Starting Phase</h3>
        <p className="text-sm text-muted-foreground">
          Choose whether to start from cloning phase or scouting phase
        </p>
      </div>

      <RadioGroup
        value={data?.starting_phase || ''}
        onValueChange={handlePhaseChange}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <Label htmlFor="cloning" className="cursor-pointer">
          <Card className={`p-6 border-2 transition-colors ${
            data?.starting_phase === 'cloning' 
              ? 'border-primary bg-primary/5' 
              : 'border-muted hover:border-primary/50'
          }`}>
            <div className="flex items-start gap-4">
              <RadioGroupItem value="cloning" id="cloning" className="mt-1" />
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <Sprout className="h-5 w-5 text-primary" />
                  <span className="font-semibold">Cloning Phase</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Start with HVCSOF0011 - Cloning Pre-Start Checklist. 
                  Complete all checklist items before proceeding.
                </p>
              </div>
            </div>
          </Card>
        </Label>

        <Label htmlFor="scouting" className="cursor-pointer">
          <Card className={`p-6 border-2 transition-colors ${
            data?.starting_phase === 'scouting' 
              ? 'border-primary bg-primary/5' 
              : 'border-muted hover:border-primary/50'
          }`}>
            <div className="flex items-start gap-4">
              <RadioGroupItem value="scouting" id="scouting" className="mt-1" />
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <Search className="h-5 w-5 text-primary" />
                  <span className="font-semibold">Scouting Phase</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Start with basic batch information including batch ID, strain, 
                  mother ID, facility, and location.
                </p>
              </div>
            </div>
          </Card>
        </Label>
      </RadioGroup>

      {!data?.starting_phase && (
        <p className="text-sm text-amber-600 bg-amber-50 dark:bg-amber-950/20 p-3 rounded-lg">
          Please select a starting phase to continue
        </p>
      )}
    </div>
  );
}
