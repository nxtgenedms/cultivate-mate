import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Eye, Edit, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { 
  getStageColor, 
  getStageIcon, 
  getStageLabel, 
  getStageProgress,
  getStatusColor,
  formatBatchNumber,
  calculateDaysInStage
} from '@/lib/batchUtils';
import { cn } from '@/lib/utils';

interface BatchCardProps {
  batch: any;
  onView?: (batch: any) => void;
  onEdit?: (batch: any) => void;
}

export function BatchCard({ batch, onView, onEdit }: BatchCardProps) {
  const stageProgress = getStageProgress(batch.current_stage);
  const daysInStage = batch.created_at ? calculateDaysInStage(batch.created_at) : 0;
  
  return (
    <Card className="hover:shadow-lg transition-all hover:scale-[1.02] duration-200 animate-fade-in">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">
                {formatBatchNumber(batch.batch_number)}
              </h3>
              <span className="text-2xl">{getStageIcon(batch.current_stage)}</span>
            </div>
            {batch.strain_id && (
              <Badge variant="outline" className="text-xs">
                Strain: {batch.strain_id}
              </Badge>
            )}
          </div>
          <Badge className={cn("border", getStatusColor(batch.status))}>
            {batch.status?.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Current Stage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <Badge className={cn("border", getStageColor(batch.current_stage))}>
              {getStageLabel(batch.current_stage)}
            </Badge>
            <span className="text-muted-foreground">{daysInStage} days</span>
          </div>
          <Progress value={stageProgress} className="h-2" />
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t">
          <div>
            <p className="text-xs text-muted-foreground">Mother ID</p>
            <p className="text-sm font-medium">{batch.mother_no || 'N/A'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Plants</p>
            <p className="text-sm font-medium flex items-center gap-1">
              {batch.total_clones_plants || 0}
              {batch.clonator_mortalities > 0 && (
                <span className="text-xs text-red-500">
                  (-{batch.clonator_mortalities})
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Dates */}
        <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
          <div className="flex justify-between">
            <span>Started:</span>
            <span>{batch.clone_germination_date ? format(new Date(batch.clone_germination_date), 'MMM d, yyyy') : 'N/A'}</span>
          </div>
          {batch.expected_rooting_date && (
            <div className="flex justify-between">
              <span>Expected Rooting:</span>
              <span>{format(new Date(batch.expected_rooting_date), 'MMM d, yyyy')}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => onView?.(batch)}
          >
            <Eye className="h-3 w-3 mr-1" />
            View
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            className="flex-1"
            onClick={() => onEdit?.(batch)}
          >
            <Edit className="h-3 w-3 mr-1" />
            Edit
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
