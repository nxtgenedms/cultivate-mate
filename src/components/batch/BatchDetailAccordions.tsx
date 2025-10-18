import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { PhaseChangeButton } from './PhaseChangeButton';
import { getStageColor, getStageLabel, calculateDaysInStage, getStageProgress } from '@/lib/batchUtils';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Dna, Sprout, Shield, Leaf, Flower, Search, Scissors, Wind, Package } from 'lucide-react';

interface BatchDetailAccordionsProps {
  batch: any;
  getUserName: (userId: string | null) => string;
  getDisplayValue: (id: string) => string;
}

export function BatchDetailAccordions({ batch, getUserName, getDisplayValue }: BatchDetailAccordionsProps) {
  const daysInStage = batch.created_at ? calculateDaysInStage(batch.created_at) : 0;
  const stageProgress = getStageProgress(batch.current_stage);

  const getCurrentQuantity = () => {
    switch (batch.current_stage) {
      case 'preclone':
        return null;
      case 'clone_germination':
        return batch.total_clones_plants || 0;
      case 'hardening':
        return batch.hardening_number_clones || 0;
      case 'vegetative':
        return batch.veg_number_plants || 0;
      case 'flowering_grow_room':
        return batch.flowering_number_plants || 0;
      case 'preharvest':
        return batch.flowering_number_plants || 0;
      case 'harvest':
        return batch.harvest_number_plants || 0;
      case 'processing_drying':
        return batch.drying_total_plants || 0;
      case 'packing_storage':
        return batch.dry_weight_no_plants || 0;
      default:
        return 0;
    }
  };

  const renderStageProgress = (stage: string) => {
    if (batch.current_stage !== stage) return null;
    
    return (
      <div className="mb-6 p-4 border rounded-lg bg-primary/5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <Badge className={cn("border mb-2", getStageColor(batch.current_stage))}>
              {getStageLabel(batch.current_stage)}
            </Badge>
            <p className="text-sm text-muted-foreground">{daysInStage} days in current stage</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-primary">{Math.round(stageProgress)}%</p>
            <p className="text-xs text-muted-foreground">Complete</p>
          </div>
        </div>
        <Progress value={stageProgress} className="h-2 mb-4" />
        <PhaseChangeButton
          batchId={batch.id}
          batchNumber={batch.batch_number}
          currentStage={batch.current_stage}
          currentQuantity={getCurrentQuantity()}
          currentDome={batch.dome_no}
          disabled={batch.status !== 'in_progress'}
        />
      </div>
    );
  };

  return (
    <Accordion type="multiple" className="w-full">
      {/* 1. Preclone Phase */}
      <AccordionItem value="preclone">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center gap-3">
            <Dna className="h-5 w-5 text-slate-600" />
            <span className="font-semibold">Preclone</span>
            {batch.current_stage === 'preclone' && (
              <Badge variant="default" className="ml-2">Current</Badge>
            )}
          </div>
        </AccordionTrigger>
        <AccordionContent>
          {renderStageProgress('preclone')}
          <div className="grid gap-4 md:grid-cols-2 pt-4">
            <div className="space-y-3 border-l-2 border-slate-600/20 pl-4">
              <h4 className="font-semibold text-sm text-muted-foreground">Batch Information</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Batch Number:</span>
                  <span className="font-medium">{batch.batch_number}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Batch Source:</span>
                  <Badge variant="outline">
                    {batch.starting_phase === 'mother_plant' ? 'Clone from Mother Plant' : 
                     batch.starting_phase === 'seed' ? 'Seed Germination' : 'N/A'}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant="outline">{batch.status}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Created:</span>
                  <span className="font-medium">
                    {batch.created_at 
                      ? format(new Date(batch.created_at), 'MMM d, yyyy')
                      : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
            <div className="space-y-3 border-l-2 border-slate-600/20 pl-4">
              <h4 className="font-semibold text-sm text-muted-foreground">Note</h4>
              <p className="text-sm text-muted-foreground">
                Detailed information like Strain ID, Mother No, Dome No, Clone/Germination Date, etc. will be collected when transitioning to the Clone/Germination stage.
              </p>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* 2. Clone / Germination Phase */}
      <AccordionItem value="clone_germination">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center gap-3">
            <Sprout className="h-5 w-5 text-cyan-600" />
            <span className="font-semibold">Clone / Germination</span>
            {batch.current_stage === 'clone_germination' && (
              <Badge variant="default" className="ml-2">Current</Badge>
            )}
          </div>
        </AccordionTrigger>
        <AccordionContent>
          {renderStageProgress('clone_germination')}
          <div className="grid gap-4 md:grid-cols-2 pt-4">
            <div className="space-y-3 border-l-2 border-cyan-600/20 pl-4">
              <h4 className="font-semibold text-sm text-muted-foreground">Initial Setup</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Strain ID:</span>
                  <span className="font-medium">{getDisplayValue(batch.strain_id || '')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Mother No:</span>
                  <span className="font-medium">{batch.mother_no || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Clone Germination Date:</span>
                  <span className="font-medium">
                    {batch.clone_germination_date 
                      ? format(new Date(batch.clone_germination_date), 'MMM d, yyyy')
                      : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Clones/Plants:</span>
                  <span className="font-medium">{batch.total_clones_plants || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Clonator 1:</span>
                  <span className="font-medium">{batch.clonator_1 || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Rack No:</span>
                  <span className="font-medium">{batch.rack_no || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Dome No:</span>
                  <span className="font-medium">{batch.dome_no || 'N/A'}</span>
                </div>
              </div>
            </div>
            <div className="space-y-3 border-l-2 border-cyan-600/20 pl-4">
              <h4 className="font-semibold text-sm text-muted-foreground">Rooting & Clonator 2</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Expected Rooting Date:</span>
                  <span className="font-medium">
                    {batch.expected_rooting_date 
                      ? format(new Date(batch.expected_rooting_date), 'MMM d, yyyy')
                      : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Actual Rooting Date:</span>
                  <span className="font-medium">
                    {batch.actual_rooting_date 
                      ? format(new Date(batch.actual_rooting_date), 'MMM d, yyyy')
                      : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Clonator Mortalities:</span>
                  <span className={cn("font-medium", batch.clonator_mortalities > 0 && "text-red-500")}>
                    {batch.clonator_mortalities || 0}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Clonator 2:</span>
                  <span className="font-medium">{batch.clonator_2 || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Clonator 2 Date:</span>
                  <span className="font-medium">
                    {batch.clonator_2_date 
                      ? format(new Date(batch.clonator_2_date), 'MMM d, yyyy')
                      : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Clonator 2 Clones:</span>
                  <span className="font-medium">{batch.clonator_2_number_clones || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* 3. Hardening Phase */}
      <AccordionItem value="hardening">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-blue-600" />
            <span className="font-semibold">Hardening</span>
            {batch.current_stage === 'hardening' && (
              <Badge variant="default" className="ml-2">Current</Badge>
            )}
          </div>
        </AccordionTrigger>
        <AccordionContent>
          {renderStageProgress('hardening')}
          <div className="grid gap-4 md:grid-cols-2 pt-4">
            <div className="space-y-3 border-l-2 border-blue-600/20 pl-4">
              <h4 className="font-semibold text-sm text-muted-foreground">Hardening Details</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Move to Hardening Date:</span>
                  <span className="font-medium">
                    {batch.move_to_hardening_date 
                      ? format(new Date(batch.move_to_hardening_date), 'MMM d, yyyy')
                      : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Number of Clones:</span>
                  <span className="font-medium">{batch.hardening_number_clones || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Area Placed:</span>
                  <span className="font-medium">{batch.hardening_area_placed || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Rack No:</span>
                  <span className="font-medium">{batch.hardening_rack_no || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">No of Days:</span>
                  <span className="font-medium">{batch.hardening_no_of_days || 'N/A'}</span>
                </div>
              </div>
            </div>
            <div className="space-y-3 border-l-2 border-blue-600/20 pl-4">
              <h4 className="font-semibold text-sm text-muted-foreground">Personnel & Mortalities</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Completed By:</span>
                  <span className="font-medium">{getUserName(batch.hardening_completed_by)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Checked By:</span>
                  <span className="font-medium">{getUserName(batch.hardening_checked_by)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Mortalities:</span>
                  <span className="font-medium">
                    {Array.isArray(batch.hardening_mortalities) && batch.hardening_mortalities.length > 0
                      ? batch.hardening_mortalities.length
                      : 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* 4. Vegetative Phase */}
      <AccordionItem value="vegetative">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center gap-3">
            <Leaf className="h-5 w-5 text-green-600" />
            <span className="font-semibold">Vegetative</span>
            {batch.current_stage === 'vegetative' && (
              <Badge variant="default" className="ml-2">Current</Badge>
            )}
          </div>
        </AccordionTrigger>
        <AccordionContent>
          {renderStageProgress('vegetative')}
          <div className="grid gap-4 md:grid-cols-2 pt-4">
            <div className="space-y-3 border-l-2 border-green-600/20 pl-4">
              <h4 className="font-semibold text-sm text-muted-foreground">Vegetative Details</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Move to Veg Date:</span>
                  <span className="font-medium">
                    {batch.move_to_veg_date 
                      ? format(new Date(batch.move_to_veg_date), 'MMM d, yyyy')
                      : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Number of Plants:</span>
                  <span className="font-medium">{batch.veg_number_plants || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Dome No:</span>
                  <span className="font-medium">{batch.dome_no || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Table No:</span>
                  <span className="font-medium">{batch.veg_table_no || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Expected Days:</span>
                  <span className="font-medium">{batch.veg_expected_days || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Actual Days:</span>
                  <span className="font-medium">{batch.veg_actual_days || 'N/A'}</span>
                </div>
              </div>
            </div>
            <div className="space-y-3 border-l-2 border-green-600/20 pl-4">
              <h4 className="font-semibold text-sm text-muted-foreground">Health & Personnel</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Completed By:</span>
                  <span className="font-medium">{getUserName(batch.veg_completed_by)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Diseases:</span>
                  <Badge variant={batch.veg_diseases ? "destructive" : "secondary"} className="text-xs">
                    {batch.veg_diseases ? "Yes" : "No"}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Pests:</span>
                  <Badge variant={batch.veg_pests ? "destructive" : "secondary"} className="text-xs">
                    {batch.veg_pests ? "Yes" : "No"}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Mortalities:</span>
                  <span className="font-medium">
                    {Array.isArray(batch.veg_mortalities) && batch.veg_mortalities.length > 0
                      ? batch.veg_mortalities.length
                      : 0}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Mortality Checked By:</span>
                  <span className="font-medium">{getUserName(batch.veg_checked_by)}</span>
                </div>
              </div>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* 5. Flowering / Grow Room Phase */}
      <AccordionItem value="flowering_grow_room">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center gap-3">
            <Flower className="h-5 w-5 text-purple-600" />
            <span className="font-semibold">Flowering / Grow Room</span>
            {batch.current_stage === 'flowering_grow_room' && (
              <Badge variant="default" className="ml-2">Current</Badge>
            )}
          </div>
        </AccordionTrigger>
        <AccordionContent>
          {renderStageProgress('flowering_grow_room')}
          <div className="grid gap-4 md:grid-cols-2 pt-4">
            <div className="space-y-3 border-l-2 border-purple-600/20 pl-4">
              <h4 className="font-semibold text-sm text-muted-foreground">Flowering Details</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Move to Flowering Date:</span>
                  <span className="font-medium">
                    {batch.move_to_flowering_date 
                      ? format(new Date(batch.move_to_flowering_date), 'MMM d, yyyy')
                      : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Number of Plants:</span>
                  <span className="font-medium">{batch.flowering_number_plants || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Table No:</span>
                  <span className="font-medium">{batch.flowering_table_no || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Nutrients Used:</span>
                  <span className="font-medium">{batch.nutrients_used || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Estimated Days:</span>
                  <span className="font-medium">{batch.estimated_days || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Actual Days:</span>
                  <span className="font-medium">{batch.actual_days || 'N/A'}</span>
                </div>
              </div>
            </div>
            <div className="space-y-3 border-l-2 border-purple-600/20 pl-4">
              <h4 className="font-semibold text-sm text-muted-foreground">Conditions & Health</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Using Extra Lights:</span>
                  <Badge variant={batch.using_extra_lights ? "default" : "secondary"} className="text-xs">
                    {batch.using_extra_lights ? "Yes" : "No"}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Eight Nodes:</span>
                  <Badge variant={batch.eight_nodes ? "default" : "secondary"} className="text-xs">
                    {batch.eight_nodes ? "Yes" : "No"}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Diseases:</span>
                  <Badge variant={batch.flowering_diseases ? "destructive" : "secondary"} className="text-xs">
                    {batch.flowering_diseases ? "Yes" : "No"}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Pests:</span>
                  <Badge variant={batch.flowering_pests ? "destructive" : "secondary"} className="text-xs">
                    {batch.flowering_pests ? "Yes" : "No"}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Completed By:</span>
                  <span className="font-medium">{getUserName(batch.flowering_completed_by)}</span>
                </div>
              </div>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* 6. Preharvest Phase */}
      <AccordionItem value="preharvest">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center gap-3">
            <Search className="h-5 w-5 text-pink-600" />
            <span className="font-semibold">Preharvest</span>
            {batch.current_stage === 'preharvest' && (
              <Badge variant="default" className="ml-2">Current</Badge>
            )}
          </div>
        </AccordionTrigger>
        <AccordionContent>
          {renderStageProgress('preharvest')}
          <div className="grid gap-4 md:grid-cols-2 pt-4">
            <div className="space-y-3 border-l-2 border-pink-600/20 pl-4">
              <h4 className="font-semibold text-sm text-muted-foreground">Preharvest Information</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Expected Flowering Date:</span>
                  <span className="font-medium">
                    {batch.expected_flowering_date 
                      ? format(new Date(batch.expected_flowering_date), 'MMM d, yyyy')
                      : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Actual Flowering Date:</span>
                  <span className="font-medium">
                    {batch.actual_flowering_date 
                      ? format(new Date(batch.actual_flowering_date), 'MMM d, yyyy')
                      : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Increase in Yield:</span>
                  <span className="font-medium">{batch.increase_in_yield || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* 7. Harvest Phase */}
      <AccordionItem value="harvest">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center gap-3">
            <Scissors className="h-5 w-5 text-orange-600" />
            <span className="font-semibold">Harvest</span>
            {batch.current_stage === 'harvest' && (
              <Badge variant="default" className="ml-2">Current</Badge>
            )}
          </div>
        </AccordionTrigger>
        <AccordionContent>
          {renderStageProgress('harvest')}
          <div className="grid gap-4 md:grid-cols-2 pt-4">
            <div className="space-y-3 border-l-2 border-orange-600/20 pl-4">
              <h4 className="font-semibold text-sm text-muted-foreground">Harvest Details</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Harvest Date:</span>
                  <span className="font-medium">
                    {batch.harvest_date 
                      ? format(new Date(batch.harvest_date), 'MMM d, yyyy')
                      : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Number of Plants:</span>
                  <span className="font-medium">{batch.harvest_number_plants || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Table No:</span>
                  <span className="font-medium">{batch.harvest_table_no || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Completed By:</span>
                  <span className="font-medium">{getUserName(batch.harvest_completed_by)}</span>
                </div>
              </div>
            </div>
            <div className="space-y-3 border-l-2 border-orange-600/20 pl-4">
              <h4 className="font-semibold text-sm text-muted-foreground">Inspection</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Inspection Date:</span>
                  <span className="font-medium">
                    {batch.inspection_date 
                      ? format(new Date(batch.inspection_date), 'MMM d, yyyy')
                      : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Inspected Plants:</span>
                  <span className="font-medium">{batch.inspection_number_plants || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Inspection Table No:</span>
                  <span className="font-medium">{batch.inspection_table_no || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Completed By:</span>
                  <span className="font-medium">{getUserName(batch.inspection_completed_by)}</span>
                </div>
              </div>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* 8. Processing / Drying Phase */}
      <AccordionItem value="processing_drying">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center gap-3">
            <Wind className="h-5 w-5 text-amber-600" />
            <span className="font-semibold">Processing / Drying</span>
            {batch.current_stage === 'processing_drying' && (
              <Badge variant="default" className="ml-2">Current</Badge>
            )}
          </div>
        </AccordionTrigger>
        <AccordionContent>
          {renderStageProgress('processing_drying')}
          <div className="grid gap-4 md:grid-cols-2 pt-4">
            <div className="space-y-3 border-l-2 border-amber-600/20 pl-4">
              <h4 className="font-semibold text-sm text-muted-foreground">Processing Details</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Plants Processed:</span>
                  <span className="font-medium">{batch.total_plants_processed || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Wet Weight:</span>
                  <span className="font-medium">{batch.total_wet_weight ? `${batch.total_wet_weight} kg` : 'N/A'}</span>
                </div>
              </div>
            </div>
            <div className="space-y-3 border-l-2 border-amber-600/20 pl-4">
              <h4 className="font-semibold text-sm text-muted-foreground">Drying Details</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Drying Date:</span>
                  <span className="font-medium">
                    {batch.drying_date 
                      ? format(new Date(batch.drying_date), 'MMM d, yyyy')
                      : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Plants:</span>
                  <span className="font-medium">{batch.drying_total_plants || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Days Drying:</span>
                  <span className="font-medium">{batch.no_of_days_drying || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Rack No:</span>
                  <span className="font-medium">{batch.drying_rack_no || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Completed By:</span>
                  <span className="font-medium">{getUserName(batch.drying_completed_by)}</span>
                </div>
              </div>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* 9. Packing / Storage Phase */}
      <AccordionItem value="packing_storage">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center gap-3">
            <Package className="h-5 w-5 text-emerald-600" />
            <span className="font-semibold">Packing / Storage</span>
            {batch.current_stage === 'packing_storage' && (
              <Badge variant="default" className="ml-2">Current</Badge>
            )}
          </div>
        </AccordionTrigger>
        <AccordionContent>
          {renderStageProgress('packing_storage')}
          <div className="grid gap-4 md:grid-cols-2 pt-4">
            <div className="space-y-3 border-l-2 border-emerald-600/20 pl-4">
              <h4 className="font-semibold text-sm text-muted-foreground">Dry Weight</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Dry Weight:</span>
                  <span className="font-medium">{batch.total_dry_weight ? `${batch.total_dry_weight} kg` : 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Dry Weight Date:</span>
                  <span className="font-medium">
                    {batch.dry_weight_date 
                      ? format(new Date(batch.dry_weight_date), 'MMM d, yyyy')
                      : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">No of Plants:</span>
                  <span className="font-medium">{batch.dry_weight_no_plants || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Completed By:</span>
                  <span className="font-medium">{getUserName(batch.dry_weight_completed_by)}</span>
                </div>
              </div>
            </div>
            <div className="space-y-3 border-l-2 border-emerald-600/20 pl-4">
              <h4 className="font-semibold text-sm text-muted-foreground">Packing & Grades</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Packing Date:</span>
                  <span className="font-medium">
                    {batch.packing_date 
                      ? format(new Date(batch.packing_date), 'MMM d, yyyy')
                      : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">A Grade:</span>
                  <span className="font-medium">{batch.packing_a_grade ? `${batch.packing_a_grade} kg` : 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">B Grade:</span>
                  <span className="font-medium">{batch.packing_b_grade ? `${batch.packing_b_grade} kg` : 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">C Grade:</span>
                  <span className="font-medium">{batch.packing_c_grade ? `${batch.packing_c_grade} kg` : 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Storage Area:</span>
                  <span className="font-medium">{batch.packing_storage_area || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Bag IDs:</span>
                  <span className="font-medium">{batch.packing_bag_ids || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
