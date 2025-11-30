export type PlannerItemStatus = 'pending' | 'in-progress' | 'completed' | 'archived';

export type PlannerItemPriority = 'low' | 'medium' | 'high' | 'urgent';

export type PlannerCategory = 'today' | 'upcoming' | 'habits';

export type RecurrencePattern = 'daily' | 'weekly' | 'monthly' | 'custom';

export interface RecurrenceRule {
  pattern: RecurrencePattern;
  interval?: number;
  daysOfWeek?: number[];
  endDate?: string;
}

export interface PlannerItem {
  id: string;
  title: string;
  description?: string;
  status: PlannerItemStatus;
  priority: PlannerItemPriority;
  category: PlannerCategory;
  dueDate?: string;
  scheduledDate?: string;
  estimatedDuration?: number;
  tags?: string[];
  recurrence?: RecurrenceRule;
  isEditing?: boolean;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  order: number;
}

export interface TimeLog {
  id: string;
  plannerId: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DayAggregate {
  date: string;
  totalDuration: number;
  itemCount: number;
  logs: TimeLog[];
}

export interface TimeStats {
  today: number;
  last7Days: number;
  last30Days: number;
  averagePerDay7: number;
  averagePerDay30: number;
  byDate: DayAggregate[];
  byItem: Record<string, number>;
}

export interface InlineEditMetadata {
  itemId: string;
  field: keyof PlannerItem;
  originalValue: unknown;
}

export const PLANNER_CONSTANTS = {
  STORAGE_KEY: 'planner-storage',
  MAX_TITLE_LENGTH: 200,
  MAX_DESCRIPTION_LENGTH: 2000,
  DEFAULT_PRIORITY: 'medium' as PlannerItemPriority,
  DEFAULT_STATUS: 'pending' as PlannerItemStatus,
  ANALYTICS_WINDOW_7_DAYS: 7,
  ANALYTICS_WINDOW_30_DAYS: 30,
} as const;

export const STATUS_LABELS: Record<PlannerItemStatus, string> = {
  pending: 'Pending',
  'in-progress': 'In Progress',
  completed: 'Completed',
  archived: 'Archived',
};

export const PRIORITY_LABELS: Record<PlannerItemPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};

export const CATEGORY_LABELS: Record<PlannerCategory, string> = {
  today: 'Today',
  upcoming: 'Upcoming',
  habits: 'Habits',
};
