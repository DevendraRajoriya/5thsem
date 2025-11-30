import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { startOfDay, subDays, parseISO, isAfter, isBefore } from 'date-fns';
import {
  PlannerItem,
  TimeLog,
  PlannerCategory,
  PlannerItemStatus,
  InlineEditMetadata,
  TimeStats,
  DayAggregate,
  PLANNER_CONSTANTS,
} from './types';

interface PlannerState {
  items: PlannerItem[];
  timeLogs: TimeLog[];
  inlineEditMetadata: InlineEditMetadata | null;

  createItem: (item: Omit<PlannerItem, 'id' | 'createdAt' | 'updatedAt' | 'order'>) => PlannerItem;
  updateItem: (id: string, updates: Partial<PlannerItem>) => void;
  deleteItem: (id: string) => void;
  getItem: (id: string) => PlannerItem | undefined;
  getItemsByCategory: (category: PlannerCategory) => PlannerItem[];
  getAllItems: () => PlannerItem[];

  toggleStatus: (id: string, status: PlannerItemStatus) => void;
  updateSchedule: (id: string, scheduledDate?: string, dueDate?: string) => void;
  reorderItems: (category: PlannerCategory, itemIds: string[]) => void;

  startEdit: (itemId: string, field: keyof PlannerItem, originalValue: any) => void;
  cancelEdit: () => void;
  commitEdit: (itemId: string, field: keyof PlannerItem, value: any) => void;

  startTimeLog: (plannerId: string, notes?: string) => TimeLog;
  endTimeLog: (logId: string) => void;
  getActiveTimeLog: (plannerId: string) => TimeLog | undefined;
  getTimeLogsByItem: (plannerId: string) => TimeLog[];
  getAllTimeLogs: () => TimeLog[];

  getTimeStats: (itemId?: string) => TimeStats;
  getDayAggregates: (days: number) => DayAggregate[];

  clearCompleted: () => void;
  archiveItem: (id: string) => void;
}

const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const calculateDuration = (startTime: string, endTime: string): number => {
  const start = parseISO(startTime);
  const end = parseISO(endTime);
  return Math.round((end.getTime() - start.getTime()) / 1000);
};

const getDatesBetween = (startDate: Date, endDate: Date): string[] => {
  const dates: string[] = [];
  const current = new Date(startDate);
  
  while (isBefore(current, endDate) || current.getTime() === endDate.getTime()) {
    dates.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }
  
  return dates;
};

export const usePlannerStore = create<PlannerState>()(
  persist(
    (set, get) => ({
      items: [],
      timeLogs: [],
      inlineEditMetadata: null,

      createItem: (itemData) => {
        const now = new Date().toISOString();
        const items = get().items;
        const categoryItems = items.filter((item) => item.category === itemData.category);
        const maxOrder = categoryItems.length > 0
          ? Math.max(...categoryItems.map((item) => item.order))
          : -1;

        const newItem: PlannerItem = {
          ...itemData,
          id: generateId(),
          createdAt: now,
          updatedAt: now,
          order: maxOrder + 1,
        };

        set((state) => ({
          items: [...state.items, newItem],
        }));

        return newItem;
      },

      updateItem: (id, updates) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id
              ? { ...item, ...updates, updatedAt: new Date().toISOString() }
              : item
          ),
        }));
      },

      deleteItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
          timeLogs: state.timeLogs.filter((log) => log.plannerId !== id),
        }));
      },

      getItem: (id) => {
        return get().items.find((item) => item.id === id);
      },

      getItemsByCategory: (category) => {
        return get()
          .items.filter((item) => item.category === category && item.status !== 'archived')
          .sort((a, b) => a.order - b.order);
      },

      getAllItems: () => {
        return get().items.filter((item) => item.status !== 'archived');
      },

      toggleStatus: (id, status) => {
        const now = new Date().toISOString();
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id
              ? {
                  ...item,
                  status,
                  updatedAt: now,
                  completedAt: status === 'completed' ? now : item.completedAt,
                }
              : item
          ),
        }));
      },

      updateSchedule: (id, scheduledDate, dueDate) => {
        get().updateItem(id, { scheduledDate, dueDate });
      },

      reorderItems: (category, itemIds) => {
        set((state) => ({
          items: state.items.map((item) => {
            if (item.category === category) {
              const newOrder = itemIds.indexOf(item.id);
              if (newOrder !== -1) {
                return { ...item, order: newOrder, updatedAt: new Date().toISOString() };
              }
            }
            return item;
          }),
        }));
      },

      startEdit: (itemId, field, originalValue) => {
        set({
          inlineEditMetadata: { itemId, field, originalValue },
        });
        get().updateItem(itemId, { isEditing: true });
      },

      cancelEdit: () => {
        const metadata = get().inlineEditMetadata;
        if (metadata) {
          get().updateItem(metadata.itemId, { 
            isEditing: false,
            [metadata.field]: metadata.originalValue,
          });
          set({ inlineEditMetadata: null });
        }
      },

      commitEdit: (itemId, field, value) => {
        get().updateItem(itemId, { 
          isEditing: false,
          [field]: value,
        });
        set({ inlineEditMetadata: null });
      },

      startTimeLog: (plannerId, notes) => {
        const existingActiveLog = get().getActiveTimeLog(plannerId);
        if (existingActiveLog) {
          get().endTimeLog(existingActiveLog.id);
        }

        const now = new Date().toISOString();
        const newLog: TimeLog = {
          id: generateId(),
          plannerId,
          startTime: now,
          notes,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          timeLogs: [...state.timeLogs, newLog],
        }));

        get().updateItem(plannerId, { status: 'in-progress' });

        return newLog;
      },

      endTimeLog: (logId) => {
        const now = new Date().toISOString();
        set((state) => ({
          timeLogs: state.timeLogs.map((log) =>
            log.id === logId && !log.endTime
              ? {
                  ...log,
                  endTime: now,
                  duration: calculateDuration(log.startTime, now),
                  updatedAt: now,
                }
              : log
          ),
        }));
      },

      getActiveTimeLog: (plannerId) => {
        return get().timeLogs.find(
          (log) => log.plannerId === plannerId && !log.endTime
        );
      },

      getTimeLogsByItem: (plannerId) => {
        return get()
          .timeLogs.filter((log) => log.plannerId === plannerId)
          .sort((a, b) => parseISO(b.startTime).getTime() - parseISO(a.startTime).getTime());
      },

      getAllTimeLogs: () => {
        return get().timeLogs;
      },

      getTimeStats: (itemId) => {
        const logs = itemId
          ? get().getTimeLogsByItem(itemId)
          : get().timeLogs;

        const now = new Date();
        const today = startOfDay(now);
        const last7Days = subDays(today, PLANNER_CONSTANTS.ANALYTICS_WINDOW_7_DAYS);
        const last30Days = subDays(today, PLANNER_CONSTANTS.ANALYTICS_WINDOW_30_DAYS);

        let todayDuration = 0;
        let last7DaysDuration = 0;
        let last30DaysDuration = 0;
        const byItem: Record<string, number> = {};

        logs.forEach((log) => {
          if (!log.duration) return;

          const logDate = parseISO(log.startTime);

          if (logDate >= today) {
            todayDuration += log.duration;
          }
          if (logDate >= last7Days) {
            last7DaysDuration += log.duration;
          }
          if (logDate >= last30Days) {
            last30DaysDuration += log.duration;
          }

          byItem[log.plannerId] = (byItem[log.plannerId] || 0) + log.duration;
        });

        const dayAggregates = get().getDayAggregates(
          itemId ? 365 : PLANNER_CONSTANTS.ANALYTICS_WINDOW_30_DAYS
        );

        return {
          today: todayDuration,
          last7Days: last7DaysDuration,
          last30Days: last30DaysDuration,
          averagePerDay7: Math.round(last7DaysDuration / PLANNER_CONSTANTS.ANALYTICS_WINDOW_7_DAYS),
          averagePerDay30: Math.round(last30DaysDuration / PLANNER_CONSTANTS.ANALYTICS_WINDOW_30_DAYS),
          byDate: dayAggregates,
          byItem,
        };
      },

      getDayAggregates: (days) => {
        const logs = get().timeLogs;
        const now = new Date();
        const startDate = subDays(startOfDay(now), days - 1);
        const dates = getDatesBetween(startDate, now);

        const aggregateMap: Record<string, DayAggregate> = {};

        dates.forEach((date) => {
          aggregateMap[date] = {
            date,
            totalDuration: 0,
            itemCount: 0,
            logs: [],
          };
        });

        logs.forEach((log) => {
          if (!log.duration) return;

          const logDateStr = log.startTime.split('T')[0];
          if (aggregateMap[logDateStr]) {
            aggregateMap[logDateStr].totalDuration += log.duration;
            aggregateMap[logDateStr].logs.push(log);
            
            const uniqueItems = new Set(aggregateMap[logDateStr].logs.map(l => l.plannerId));
            aggregateMap[logDateStr].itemCount = uniqueItems.size;
          }
        });

        return Object.values(aggregateMap).sort((a, b) => a.date.localeCompare(b.date));
      },

      clearCompleted: () => {
        set((state) => ({
          items: state.items.filter((item) => item.status !== 'completed'),
        }));
      },

      archiveItem: (id) => {
        get().toggleStatus(id, 'archived');
      },
    }),
    {
      name: PLANNER_CONSTANTS.STORAGE_KEY,
      version: 1,
    }
  )
);
