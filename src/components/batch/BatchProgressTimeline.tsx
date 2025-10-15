import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { STAGE_ORDER, getStageLabel, getStageIcon, getStageColor } from '@/lib/batchUtils';
import { format } from 'date-fns';

interface BatchProgressTimelineProps {
  currentStage: string;
  completedStages?: string[];
  stageCompletionDates?: {
    cloning?: string | null;
    vegetative?: string | null;
    flowering?: string | null;
    harvest?: string | null;
  };
}

export function BatchProgressTimeline({ currentStage, completedStages = [], stageCompletionDates = {} }: BatchProgressTimelineProps) {
  const currentIndex = STAGE_ORDER.indexOf(currentStage as any);

  const getCompletionDate = (stage: string) => {
    let dateValue: string | null | undefined;
    
    switch (stage) {
      case 'cloning':
        // Cloning is completed when moved to veg
        dateValue = stageCompletionDates.vegetative;
        break;
      case 'vegetative':
        dateValue = stageCompletionDates.flowering;
        break;
      case 'flowering':
        dateValue = stageCompletionDates.harvest;
        break;
      case 'harvest':
        dateValue = stageCompletionDates.harvest;
        break;
    }

    if (dateValue) {
      try {
        return format(new Date(dateValue), 'MMM d, yyyy');
      } catch {
        return null;
      }
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lifecycle Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Progress Line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-muted" />
          
          {/* Stages */}
          <div className="space-y-6">
            {STAGE_ORDER.map((stage, index) => {
              const isCompleted = completedStages.includes(stage) || index < currentIndex;
              const isCurrent = stage === currentStage;
              const isFuture = index > currentIndex;
              const completionDate = getCompletionDate(stage);

              return (
                <div key={stage} className="relative flex items-center gap-4">
                  {/* Stage Indicator */}
                  <div
                    className={cn(
                      'relative z-10 w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all',
                      isCompleted
                        ? 'bg-green-500 border-green-500'
                        : isCurrent
                        ? 'bg-primary border-primary animate-pulse'
                        : 'bg-background border-muted'
                    )}
                  >
                    {isCompleted ? (
                      <Check className="h-6 w-6 text-white" />
                    ) : isCurrent ? (
                      <Circle className="h-6 w-6 text-primary-foreground fill-current" />
                    ) : (
                      <Circle className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>

                  {/* Stage Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">{getStageIcon(stage)}</span>
                      <h4 className={cn(
                        'font-semibold',
                        isCurrent && 'text-primary',
                        isFuture && 'text-muted-foreground'
                      )}>
                        {getStageLabel(stage)}
                      </h4>
                      {isCurrent && (
                        <Badge variant="default" className="ml-2">
                          Current
                        </Badge>
                      )}
                      {isCompleted && (
                        <Badge variant="secondary" className="ml-2 bg-green-500/10 text-green-700 dark:text-green-400">
                          Completed
                        </Badge>
                      )}
                    </div>
                    <p className={cn(
                      'text-sm',
                      isFuture ? 'text-muted-foreground' : 'text-foreground'
                    )}>
                      {isCompleted
                        ? completionDate 
                          ? `Completed on ${completionDate}`
                          : 'Stage completed successfully'
                        : isCurrent
                        ? 'In progress'
                        : 'Upcoming stage'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
