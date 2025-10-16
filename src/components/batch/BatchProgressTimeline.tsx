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
  stageData?: {
    cloning?: { dome?: string; plants?: number };
    vegetative?: { dome?: string; plants?: number };
    flowering?: { dome?: string; plants?: number };
    harvest?: { dome?: string; plants?: number };
  };
}

export function BatchProgressTimeline({ currentStage, completedStages = [], stageCompletionDates = {}, stageData = {} }: BatchProgressTimelineProps) {
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

  const getStageInfo = (stage: string) => {
    const stageKey = stage as keyof typeof stageData;
    return stageData[stageKey] || {};
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Lifecycle Progress</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Horizontal Timeline */}
        <div className="relative">
          {/* Progress Line */}
          <div className="absolute top-6 left-0 right-0 h-0.5 bg-muted" style={{ left: '24px', right: '24px' }} />
          
          {/* Stages - Horizontal Layout */}
          <div className="grid grid-cols-4 gap-2">
            {STAGE_ORDER.map((stage, index) => {
              const isCompleted = completedStages.includes(stage) || index < currentIndex;
              const isCurrent = stage === currentStage;
              const isFuture = index > currentIndex;
              const completionDate = getCompletionDate(stage);
              const { dome, plants } = getStageInfo(stage);

              return (
                <div key={stage} className="relative flex flex-col items-center text-center">
                  {/* Stage Indicator */}
                  <div
                    className={cn(
                      'relative z-10 w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all mb-2',
                      isCompleted
                        ? 'bg-green-500 border-green-500'
                        : isCurrent
                        ? 'bg-primary border-primary'
                        : 'bg-background border-muted'
                    )}
                  >
                    {isCompleted ? (
                      <Check className="h-5 w-5 text-white" />
                    ) : isCurrent ? (
                      <Circle className="h-5 w-5 text-primary-foreground fill-current" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>

                  {/* Stage Info */}
                  <div className="w-full">
                    <div className="flex flex-col items-center gap-1 mb-2">
                      <span className="text-xl">{getStageIcon(stage)}</span>
                      <h4 className={cn(
                        'text-sm font-semibold',
                        isCurrent && 'text-primary',
                        isFuture && 'text-muted-foreground'
                      )}>
                        {getStageLabel(stage)}
                      </h4>
                      {isCurrent && (
                        <Badge variant="default" className="text-xs">
                          Current
                        </Badge>
                      )}
                      {isCompleted && (
                        <Badge variant="secondary" className="text-xs bg-green-500/10 text-green-700 dark:text-green-400">
                          Completed
                        </Badge>
                      )}
                    </div>
                    
                    {/* Stage Details */}
                    <div className="space-y-1 text-xs">
                      {isCompleted && completionDate && (
                        <p className="text-muted-foreground">
                          {completionDate}
                        </p>
                      )}
                      {isCurrent && (
                        <p className="text-muted-foreground">In progress</p>
                      )}
                      {isFuture && (
                        <p className="text-muted-foreground">Upcoming</p>
                      )}
                      
                      {/* Dome and Plants Info */}
                      {(dome || plants !== undefined) && (
                        <div className="mt-2 p-2 bg-muted/50 rounded space-y-0.5">
                          {dome && (
                            <p className="font-medium">Dome: {dome}</p>
                          )}
                          {plants !== undefined && (
                            <p className="font-medium">Plants: {plants}</p>
                          )}
                        </div>
                      )}
                    </div>
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
