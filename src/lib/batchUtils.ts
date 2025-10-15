// Batch Management Utilities and Constants

export const BATCH_STAGES = {
  CLONING: 'cloning',
  VEGETATIVE: 'vegetative',
  FLOWERING: 'flowering',
  HARVEST: 'harvest',
} as const;

export const BATCH_STATUS = {
  DRAFT: 'draft',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  ARCHIVED: 'archived',
} as const;

export type BatchStage = typeof BATCH_STAGES[keyof typeof BATCH_STAGES];
export type BatchStatus = typeof BATCH_STATUS[keyof typeof BATCH_STATUS];

export const STAGE_COLORS = {
  [BATCH_STAGES.CLONING]: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
  [BATCH_STAGES.VEGETATIVE]: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20',
  [BATCH_STAGES.FLOWERING]: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20',
  [BATCH_STAGES.HARVEST]: 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20',
};

export const STAGE_ICONS = {
  [BATCH_STAGES.CLONING]: '🌱',
  [BATCH_STAGES.VEGETATIVE]: '🌳',
  [BATCH_STAGES.FLOWERING]: '🌸',
  [BATCH_STAGES.HARVEST]: '✂️',
};

export const STAGE_LABELS = {
  [BATCH_STAGES.CLONING]: 'Cloning',
  [BATCH_STAGES.VEGETATIVE]: 'Vegetative',
  [BATCH_STAGES.FLOWERING]: 'Flowering',
  [BATCH_STAGES.HARVEST]: 'Harvest',
};

export const STATUS_COLORS = {
  [BATCH_STATUS.DRAFT]: 'bg-gray-500/10 text-gray-700 dark:text-gray-400',
  [BATCH_STATUS.IN_PROGRESS]: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
  [BATCH_STATUS.COMPLETED]: 'bg-green-500/10 text-green-700 dark:text-green-400',
  [BATCH_STATUS.ARCHIVED]: 'bg-slate-500/10 text-slate-700 dark:text-slate-400',
};

export const STAGE_ORDER = [
  BATCH_STAGES.CLONING,
  BATCH_STAGES.VEGETATIVE,
  BATCH_STAGES.FLOWERING,
  BATCH_STAGES.HARVEST,
];

export function getStageProgress(currentStage: string): number {
  const index = STAGE_ORDER.indexOf(currentStage as BatchStage);
  return index >= 0 ? ((index + 1) / STAGE_ORDER.length) * 100 : 0;
}

export function getStageColor(stage: string): string {
  return STAGE_COLORS[stage as BatchStage] || STAGE_COLORS[BATCH_STAGES.CLONING];
}

export function getStageIcon(stage: string): string {
  return STAGE_ICONS[stage as BatchStage] || '🌱';
}

export function getStageLabel(stage: string): string {
  return STAGE_LABELS[stage as BatchStage] || stage;
}

export function getStatusColor(status: string): string {
  return STATUS_COLORS[status as BatchStatus] || STATUS_COLORS[BATCH_STATUS.DRAFT];
}

export function formatBatchNumber(batchNumber: string): string {
  return batchNumber.toUpperCase();
}

export function calculateDaysInStage(stageStartDate: string): number {
  const start = new Date(stageStartDate);
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
