import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { ExtractedFieldData } from "@/lib/taskFieldMapper";

interface RequiredFieldsStepProps {
  currentStage: string;
  nextStage: string;
  formData: Record<string, any>;
  copiedFieldData: ExtractedFieldData[];
  domeValues: any[];
  onFieldChange: (field: string, value: any) => void;
}

const STAGE_FIELD_REQUIREMENTS: Record<string, {
  required: { field: string; label: string; type: string }[];
  optional: { field: string; label: string; type: string }[];
}> = {
  cloning_to_vegetative: {
    required: [
      { field: 'actual_rooting_date', label: 'Actual Rooting Date', type: 'date' },
      { field: 'move_to_hardening_date', label: 'Move to Hardening Date', type: 'date' },
      { field: 'hardening_number_clones', label: 'Number of Clones (Hardening)', type: 'number' },
      { field: 'dome_no', label: 'Dome Number', type: 'select' },
    ],
    optional: [
      // Clonator 2 fields
      { field: 'clonator_2_date', label: 'Clonator 2 - Date Moved', type: 'date' },
      { field: 'clonator_2', label: 'Clonator 2 - Unit Name', type: 'text' },
      { field: 'clonator_2_number_clones', label: 'Clonator 2 - Number of Clones', type: 'number' },
      { field: 'clonator_2_area_placed', label: 'Clonator 2 - Area Placed', type: 'text' },
      { field: 'clonator_2_rack_no', label: 'Clonator 2 - Rack No', type: 'text' },
      { field: 'clonator_2_no_of_days', label: 'Clonator 2 - No of Days', type: 'number' },
      { field: 'clonator_2_completed_by', label: 'Clonator 2 - Completed By', type: 'text' },
      
      // Hardening stage fields
      { field: 'hardening_area_placed', label: 'Hardening - Area Placed', type: 'text' },
      { field: 'hardening_rack_no', label: 'Hardening - Rack No', type: 'text' },
      { field: 'hardening_no_of_days', label: 'Hardening - No of Days', type: 'number' },
      { field: 'hardening_completed_by', label: 'Hardening - Completed By', type: 'text' },
    ],
  },
  vegetative_to_flowering: {
    required: [
      { field: 'move_to_flowering_date', label: 'Move to Flowering Date', type: 'date' },
      { field: 'flowering_number_plants', label: 'Number of Plants', type: 'number' },
      { field: 'veg_actual_days', label: 'Actual Days in Veg', type: 'number' },
    ],
    optional: [
      { field: 'veg_diseases', label: 'Diseases Detected', type: 'checkbox' },
      { field: 'veg_pests', label: 'Pests Detected', type: 'checkbox' },
    ],
  },
  flowering_to_harvest: {
    required: [
      { field: 'harvest_date', label: 'Harvest Date', type: 'date' },
      { field: 'harvest_number_plants', label: 'Number of Plants', type: 'number' },
    ],
    optional: [
      { field: 'flowering_diseases', label: 'Diseases Detected', type: 'checkbox' },
      { field: 'flowering_pests', label: 'Pests Detected', type: 'checkbox' },
    ],
  },
};

export const RequiredFieldsStep = ({
  currentStage,
  nextStage,
  formData,
  copiedFieldData,
  domeValues,
  onFieldChange,
}: RequiredFieldsStepProps) => {
  const transitionKey = `${currentStage}_to_${nextStage}`;
  const fieldRequirements = STAGE_FIELD_REQUIREMENTS[transitionKey];

  if (!fieldRequirements) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No field configuration found for this stage transition.
        </AlertDescription>
      </Alert>
    );
  }

  const renderField = (fieldDef: { field: string; label: string; type: string }, isRequired: boolean) => {
    const isCopied = copiedFieldData.some(d => d.fieldName === fieldDef.field);
    
    return (
      <div key={fieldDef.field} className="space-y-2">
        <Label htmlFor={fieldDef.field}>
          {fieldDef.label}
          {isRequired && <span className="text-destructive ml-1">*</span>}
          {isCopied && (
            <span className="ml-2 text-xs text-green-600 dark:text-green-400">
              (Auto-filled from task)
            </span>
          )}
        </Label>
        
        {fieldDef.type === 'select' && fieldDef.field === 'dome_no' ? (
          <Select
            value={formData[fieldDef.field] || ''}
            onValueChange={(value) => onFieldChange(fieldDef.field, value)}
          >
            <SelectTrigger id={fieldDef.field}>
              <SelectValue placeholder="Select dome..." />
            </SelectTrigger>
            <SelectContent>
              {domeValues.map((dome) => (
                <SelectItem key={dome.value_key} value={dome.value_key}>
                  {dome.value_display}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : fieldDef.type === 'checkbox' ? (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={fieldDef.field}
              checked={formData[fieldDef.field] || false}
              onChange={(e) => onFieldChange(fieldDef.field, e.target.checked)}
              className="rounded border-input"
            />
            <Label htmlFor={fieldDef.field} className="font-normal cursor-pointer">
              Yes
            </Label>
          </div>
        ) : (
          <Input
            id={fieldDef.field}
            type={fieldDef.type}
            value={formData[fieldDef.field] || ''}
            onChange={(e) => onFieldChange(fieldDef.field, 
              fieldDef.type === 'number' ? parseInt(e.target.value) || 0 : e.target.value
            )}
            required={isRequired}
            className={isCopied ? 'border-green-500' : ''}
          />
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Required Fields</h3>
        <p className="text-sm text-muted-foreground">
          Fill in the required information for moving from <strong>{currentStage}</strong> to <strong>{nextStage}</strong>.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Required Information</h4>
          {fieldRequirements.required.map(field => renderField(field, true))}
        </div>

        {fieldRequirements.optional.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Optional Information</h4>
            {fieldRequirements.optional.map(field => renderField(field, false))}
          </div>
        )}
      </div>
    </div>
  );
};
