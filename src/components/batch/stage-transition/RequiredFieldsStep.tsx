import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { ExtractedFieldData } from "@/lib/taskFieldMapper";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface RequiredFieldsStepProps {
  currentStage: string;
  nextStage: string;
  formData: Record<string, any>;
  copiedFieldData: ExtractedFieldData[];
  domeValues: any[];
  onFieldChange: (field: string, value: any) => void;
}

interface FieldDefinition {
  field: string;
  label: string;
  type: string;
  options?: 'profiles' | 'domes';
}

const STAGE_FIELD_REQUIREMENTS: Record<string, {
  required: FieldDefinition[];
  optional: FieldDefinition[];
}> = {
  cloning_to_vegetative: {
    required: [
      { field: 'actual_rooting_date', label: 'Actual Rooting Date', type: 'date' },
      { field: 'move_to_hardening_date', label: 'Move to Hardening Date', type: 'date' },
      { field: 'hardening_number_clones', label: 'Number of Clones (Hardening)', type: 'number' },
      { field: 'dome_no', label: 'Dome Number', type: 'select', options: 'domes' },
      { field: 'move_to_veg_date', label: 'Move to Veg Date', type: 'date' },
      { field: 'veg_number_plants', label: 'Number of Plants (Veg)', type: 'number' },
    ],
    optional: [
      // Clonator 2 fields
      { field: 'clonator_2_date', label: 'Clonator 2 - Date Moved', type: 'date' },
      { field: 'clonator_2', label: 'Clonator 2 - Unit Name', type: 'text' },
      { field: 'clonator_2_number_clones', label: 'Clonator 2 - Number of Clones', type: 'number' },
      { field: 'clonator_2_area_placed', label: 'Clonator 2 - Area Placed', type: 'text' },
      { field: 'clonator_2_rack_no', label: 'Clonator 2 - Rack No', type: 'text' },
      { field: 'clonator_2_no_of_days', label: 'Clonator 2 - No of Days', type: 'number' },
      
      // Hardening stage fields
      { field: 'hardening_area_placed', label: 'Hardening - Area Placed', type: 'text' },
      { field: 'hardening_rack_no', label: 'Hardening - Rack No', type: 'text' },
      { field: 'hardening_no_of_days', label: 'Hardening - No of Days', type: 'number' },
      { field: 'hardening_completed_by', label: 'Hardening - Completed By', type: 'select', options: 'profiles' },
      { field: 'hardening_checked_by', label: 'Hardening - Checked By', type: 'select', options: 'profiles' },
      
      // Veg preparation fields
      { field: 'veg_table_no', label: 'Veg - Table No', type: 'text' },
      { field: 'veg_expected_days', label: 'Veg - Expected Days', type: 'number' },
      { field: 'veg_completed_by', label: 'Veg - Completed By', type: 'select', options: 'profiles' },
    ],
  },
  vegetative_to_flowering: {
    required: [
      { field: 'move_to_flowering_date', label: 'Move to Flowering Date', type: 'date' },
      { field: 'flowering_number_plants', label: 'Number of Plants', type: 'number' },
      { field: 'veg_actual_days', label: 'Actual Days in Veg', type: 'number' },
      { field: 'flowering_table_no', label: 'Flowering Table No', type: 'text' },
    ],
    optional: [
      { field: 'veg_diseases', label: 'Veg - Diseases Detected', type: 'checkbox' },
      { field: 'veg_pests', label: 'Veg - Pests Detected', type: 'checkbox' },
      { field: 'veg_checked_by', label: 'Veg - Mortality Checked By', type: 'select', options: 'profiles' },
      
      // Flowering preparation fields
      { field: 'nutrients_used', label: 'Flowering - Nutrients Used', type: 'text' },
      { field: 'using_extra_lights', label: 'Flowering - Using Extra Lights', type: 'checkbox' },
      { field: 'extra_lights_from_day', label: 'Extra Lights - From Day', type: 'number' },
      { field: 'extra_lights_no_of_days', label: 'Extra Lights - No of Days', type: 'number' },
      { field: 'eight_nodes', label: 'Flowering - Eight Nodes', type: 'checkbox' },
      { field: 'increase_in_yield', label: 'Flowering - Increase in Yield', type: 'text' },
      { field: 'expected_flowering_date', label: 'Expected Flowering Date', type: 'date' },
      { field: 'estimated_days', label: 'Estimated Days (Flowering)', type: 'number' },
      { field: 'flowering_completed_by', label: 'Flowering - Completed By', type: 'select', options: 'profiles' },
    ],
  },
  flowering_to_harvest: {
    required: [
      { field: 'harvest_date', label: 'Harvest Date', type: 'date' },
      { field: 'harvest_number_plants', label: 'Number of Plants Harvested', type: 'number' },
      { field: 'actual_flowering_date', label: 'Actual Flowering Date', type: 'date' },
      { field: 'actual_days', label: 'Actual Days (Flowering)', type: 'number' },
    ],
    optional: [
      { field: 'flowering_diseases', label: 'Flowering - Diseases Detected', type: 'checkbox' },
      { field: 'flowering_pests', label: 'Flowering - Pests Detected', type: 'checkbox' },
      { field: 'flowering_checked_by', label: 'Flowering - Mortality Checked By', type: 'select', options: 'profiles' },
      
      // Harvest preparation fields
      { field: 'harvest_table_no', label: 'Harvest - Table No', type: 'text' },
      { field: 'harvest_completed_by', label: 'Harvest - Completed By', type: 'select', options: 'profiles' },
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

  // Fetch active profiles with their roles for user selection
  const { data: profiles } = useQuery({
    queryKey: ['profiles-with-roles'],
    queryFn: async () => {
      // Fetch profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('is_active', true)
        .order('full_name');
      
      if (profilesError) throw profilesError;
      if (!profilesData) return [];

      // Fetch all user roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('user_id', profilesData.map(p => p.id));
      
      if (rolesError) throw rolesError;

      // Combine profiles with their roles
      return profilesData.map(profile => {
        const userRoles = rolesData?.filter(r => r.user_id === profile.id) || [];
        const roleDisplay = userRoles.length > 0
          ? userRoles.map(r => {
              // Format role for display
              const role = r.role as string;
              return role.split('_').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
              ).join(' ');
            }).join(', ')
          : 'No Role';
        
        return {
          ...profile,
          roleDisplay
        };
      });
    },
  });

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

  const renderField = (fieldDef: FieldDefinition, isRequired: boolean) => {
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
        
        {fieldDef.type === 'select' ? (
          <Select
            value={formData[fieldDef.field] || ''}
            onValueChange={(value) => onFieldChange(fieldDef.field, value)}
          >
            <SelectTrigger id={fieldDef.field}>
              <SelectValue placeholder={
                fieldDef.options === 'profiles' ? 'Select user...' : 
                fieldDef.options === 'domes' ? 'Select dome...' : 
                'Select...'
              } />
            </SelectTrigger>
            <SelectContent className="z-50 bg-background">
              {fieldDef.options === 'domes' && domeValues.map((dome) => (
                <SelectItem key={dome.value_key} value={dome.value_key}>
                  {dome.value_display}
                </SelectItem>
              ))}
              {fieldDef.options === 'profiles' && profiles?.map((profile) => (
                <SelectItem key={profile.id} value={profile.id}>
                  <div className="flex items-center justify-between w-full gap-2">
                    <span className="font-medium">{profile.full_name}</span>
                    <span className="text-xs text-muted-foreground">({profile.roleDisplay})</span>
                  </div>
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

      <div className="space-y-6">
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Required Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fieldRequirements.required.map(field => renderField(field, true))}
          </div>
        </div>

        {fieldRequirements.optional.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Optional Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fieldRequirements.optional.map(field => renderField(field, false))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
