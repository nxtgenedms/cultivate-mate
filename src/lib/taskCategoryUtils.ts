export type TaskCategory =
  | 'daily_cloning_transplant'
  | 'mortality_discard'
  | 'weekly_cultivation'
  | 'clonator_weekly'
  | 'soil_moisture'
  | 'scouting_corrective'
  | 'chemical_delivery'
  | 'fertigation_application'
  | 'ipm_chemical_mixing'
  | 'hygiene_check'
  | 'cultivation_cleaning'
  | 'processing_cleaning'
  | 'pre_harvest'
  | 'final_harvest'
  | 'cloning_pre_start';

export type ApprovalWorkflow = {
  stages: string[];
  totalStages: number;
};

export const TASK_CATEGORIES: Record<TaskCategory, string> = {
  daily_cloning_transplant: 'Daily Cloning & Transplant Log',
  mortality_discard: 'Mortality & Discard Record',
  weekly_cultivation: 'Weekly Cultivation Checklist',
  clonator_weekly: 'Clonator Weekly Checklist',
  soil_moisture: 'Soil Moisture Records',
  scouting_corrective: 'Scouting & Corrective Action',
  chemical_delivery: 'Chemical Delivery Receipt',
  fertigation_application: 'Fertigation Application Record',
  ipm_chemical_mixing: 'IPM Chemical Mixing Record',
  hygiene_check: 'Personnel/Facility Hygiene Check',
  cultivation_cleaning: 'Cultivation Cleaning Checklist',
  processing_cleaning: 'Processing Cleaning Checklist',
  pre_harvest: 'Pre-Harvest Checklist',
  final_harvest: 'Final Harvest Record',
  cloning_pre_start: 'Cloning Pre-Start Checklist',
};

export const APPROVAL_WORKFLOWS: Record<TaskCategory, ApprovalWorkflow> = {
  daily_cloning_transplant: {
    stages: ['Assistant Grower', 'Grower/Manager'],
    totalStages: 2,
  },
  mortality_discard: {
    stages: ['Grower', 'Manager', 'QA'],
    totalStages: 3,
  },
  weekly_cultivation: {
    stages: ['Grower', 'Manager'],
    totalStages: 2,
  },
  clonator_weekly: {
    stages: ['Grower', 'Supervisor', 'Manager'],
    totalStages: 3,
  },
  soil_moisture: {
    stages: ['Grower', 'Manager'],
    totalStages: 2,
  },
  scouting_corrective: {
    stages: ['Grower', 'Manager', 'QA'],
    totalStages: 3,
  },
  chemical_delivery: {
    stages: ['Receiver Signature'],
    totalStages: 1,
  },
  fertigation_application: {
    stages: ['Grower', 'Manager', 'QA'],
    totalStages: 3,
  },
  ipm_chemical_mixing: {
    stages: ['Grower', 'Manager', 'QA'],
    totalStages: 3,
  },
  hygiene_check: {
    stages: ['Staff', 'Manager/Supervisor'],
    totalStages: 2,
  },
  cultivation_cleaning: {
    stages: ['Performer', 'Manager', 'QA'],
    totalStages: 3,
  },
  processing_cleaning: {
    stages: ['Performer', 'Manager', 'QA'],
    totalStages: 3,
  },
  pre_harvest: {
    stages: ['Grower', 'Supervisor'],
    totalStages: 2,
  },
  final_harvest: {
    stages: ['Manager', 'QA'],
    totalStages: 2,
  },
  cloning_pre_start: {
    stages: ['Grower', 'Manager'],
    totalStages: 2,
  },
};

export type CategoryGroup = 
  | 'daily_weekly'
  | 'cloning'
  | 'quality_safety'
  | 'chemical_management'
  | 'sanitation'
  | 'harvest';

export const CATEGORY_GROUPS: Record<CategoryGroup, { label: string; icon: string; categories: TaskCategory[] }> = {
  daily_weekly: {
    label: 'Daily/Weekly',
    icon: '📋',
    categories: [
      'daily_cloning_transplant',
      'weekly_cultivation',
      'clonator_weekly',
      'soil_moisture',
    ],
  },
  cloning: {
    label: 'Cloning',
    icon: '🌱',
    categories: [
      'cloning_pre_start',
    ],
  },
  quality_safety: {
    label: 'Quality & Safety',
    icon: '📊',
    categories: [
      'scouting_corrective',
      'mortality_discard',
      'hygiene_check',
    ],
  },
  chemical_management: {
    label: 'Chemical Mgmt',
    icon: '🧪',
    categories: [
      'chemical_delivery',
      'fertigation_application',
      'ipm_chemical_mixing',
    ],
  },
  sanitation: {
    label: 'Sanitation',
    icon: '🧹',
    categories: [
      'cultivation_cleaning',
      'processing_cleaning',
    ],
  },
  harvest: {
    label: 'Harvest',
    icon: '🌾',
    categories: [
      'pre_harvest',
      'final_harvest',
    ],
  },
};

export const getCategoryColor = (category: TaskCategory): string => {
  const colors: Record<TaskCategory, string> = {
    daily_cloning_transplant: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    mortality_discard: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    weekly_cultivation: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    clonator_weekly: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
    soil_moisture: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
    scouting_corrective: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    chemical_delivery: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    fertigation_application: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
    ipm_chemical_mixing: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
    hygiene_check: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    cultivation_cleaning: 'bg-lime-100 text-lime-800 dark:bg-lime-900 dark:text-lime-200',
    processing_cleaning: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
    pre_harvest: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    final_harvest: 'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200',
    cloning_pre_start: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  };
  return colors[category];
};

export const getApprovalWorkflow = (category: TaskCategory): ApprovalWorkflow => {
  return APPROVAL_WORKFLOWS[category];
};

export const canUserApprove = (
  category: TaskCategory,
  currentStage: number,
  userRoles: string[]
): boolean => {
  const workflow = APPROVAL_WORKFLOWS[category];
  if (currentStage >= workflow.totalStages) return false;

  const requiredStageRole = workflow.stages[currentStage].toLowerCase();

  // Map workflow stages to actual user roles
  const roleMapping: Record<string, string[]> = {
    'assistant grower': ['assistant_grower'],
    'grower/manager': ['grower', 'manager'],
    'grower': ['grower'],
    'manager': ['manager'],
    'qa': ['qa'],
    'supervisor': ['supervisor'],
    'manager/supervisor': ['manager', 'supervisor'],
    'staff': ['assistant_grower', 'grower'],
    'performer': ['assistant_grower', 'grower'],
    'receiver signature': ['assistant_grower', 'grower', 'manager'],
  };

  const allowedRoles = roleMapping[requiredStageRole] || [];
  return userRoles.some((role) => allowedRoles.includes(role)) || userRoles.includes('it_admin') || userRoles.includes('business_admin');
};
