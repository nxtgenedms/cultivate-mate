// Task to Field Mapping Utilities

export interface TaskFieldMapping {
  id: string;
  task_category: string;
  sof_number: string;
  applicable_stages: string[];
  field_mappings: {
    fields: string[];
    item_mappings: Record<string, string>;
  };
}

export interface TaskData {
  id: string;
  name: string;
  status: string;
  approval_status: string;
  checklist_items?: any[];
  task_category?: string;
  lifecycle_stage?: string;
  description?: string;
  due_date?: string;
  batch_id?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  assignee?: string;
  task_number?: string;
}

export interface ExtractedFieldData {
  fieldName: string;
  value: any;
  source: string; // task name/id
}

/**
 * Extract field values from completed task items
 */
export function extractFieldsFromTask(
  task: TaskData,
  mapping: TaskFieldMapping
): ExtractedFieldData[] {
  const extractedData: ExtractedFieldData[] = [];

  if (!task.checklist_items || task.checklist_items.length === 0) {
    return extractedData;
  }

  const { item_mappings } = mapping.field_mappings;

  // Go through each checklist item and extract mapped values
  task.checklist_items.forEach((item: any) => {
    const itemKey = item.item_key || item.label?.toLowerCase().replace(/\s+/g, '_');
    
    // Try to find matching mapping (case-insensitive)
    let mappedField: string | undefined;
    let mappingKey: string | undefined;
    
    for (const [key, field] of Object.entries(item_mappings)) {
      if (key.toLowerCase() === itemKey?.toLowerCase()) {
        mappedField = field as string;
        mappingKey = key;
        break;
      }
    }
    
    if (mappedField) {
      const value = item.response_value || item.is_completed;
      
      // Only include if value is not empty/null
      if (value !== null && value !== undefined && value !== '') {
        extractedData.push({
          fieldName: mappedField,
          value,
          source: `${task.name} - ${item.label || item.item_key}`
        });
      }
    }
  });

  return extractedData;
}

/**
 * Get applicable task mappings for a specific stage
 */
export function getApplicableMappings(
  allMappings: TaskFieldMapping[],
  stage: string
): TaskFieldMapping[] {
  return allMappings.filter(mapping =>
    mapping.applicable_stages.includes(stage)
  );
}

/**
 * Check if a task has field mappings available for data extraction
 */
export function isTaskRelevantForStage(
  task: TaskData,
  mappings: TaskFieldMapping[]
): boolean {
  // This now only checks if mappings exist for optional data copying
  return mappings.some(mapping =>
    task.name.includes(mapping.sof_number) ||
    task.task_category === mapping.task_category
  );
}

/**
 * Group tasks by their completion status
 */
export function groupTasksByStatus(tasks: TaskData[]) {
  return {
    completed: tasks.filter(t => t.status === 'completed' && t.approval_status === 'approved'),
    pending: tasks.filter(t => t.status === 'pending' || t.status === 'in_progress'),
    other: tasks.filter(t => !['completed', 'pending', 'in_progress'].includes(t.status))
  };
}
