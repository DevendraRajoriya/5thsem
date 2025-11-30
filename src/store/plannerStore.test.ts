import { usePlannerStore } from './plannerStore';
import { PlannerItem, TimeLog } from './types';

const createMockItem = (overrides?: Partial<PlannerItem>): Omit<PlannerItem, 'id' | 'createdAt' | 'updatedAt' | 'order'> => ({
  title: 'Test Task',
  description: 'Test Description',
  status: 'pending',
  priority: 'medium',
  category: 'today',
  tags: ['test'],
  ...overrides,
});

describe('PlannerStore - CRUD Operations', () => {
  beforeEach(() => {
    const state = usePlannerStore.getState();
    state.items.forEach(item => state.deleteItem(item.id));
    state.timeLogs.forEach(log => state.endTimeLog(log.id));
  });

  test('createItem: should create a new item with generated id and timestamps', () => {
    const store = usePlannerStore.getState();
    const itemData = createMockItem({ title: 'New Task' });
    
    const created = store.createItem(itemData);
    
    expect(created.id).toBeDefined();
    expect(created.title).toBe('New Task');
    expect(created.createdAt).toBeDefined();
    expect(created.updatedAt).toBeDefined();
    expect(created.order).toBe(0);
  });

  test('createItem: should assign correct order within category', () => {
    const store = usePlannerStore.getState();
    
    const item1 = store.createItem(createMockItem({ category: 'today' }));
    const item2 = store.createItem(createMockItem({ category: 'today' }));
    const item3 = store.createItem(createMockItem({ category: 'upcoming' }));
    
    expect(item1.order).toBe(0);
    expect(item2.order).toBe(1);
    expect(item3.order).toBe(0);
  });

  test('updateItem: should update item fields and timestamp', () => {
    const store = usePlannerStore.getState();
    const item = store.createItem(createMockItem());
    const originalUpdatedAt = item.updatedAt;
    
    setTimeout(() => {
      store.updateItem(item.id, { title: 'Updated Title' });
      
      const updated = store.getItem(item.id);
      expect(updated?.title).toBe('Updated Title');
      expect(updated?.updatedAt).not.toBe(originalUpdatedAt);
    }, 10);
  });

  test('deleteItem: should remove item and associated time logs', () => {
    const store = usePlannerStore.getState();
    const item = store.createItem(createMockItem());
    store.startTimeLog(item.id);
    
    store.deleteItem(item.id);
    
    expect(store.getItem(item.id)).toBeUndefined();
    expect(store.getTimeLogsByItem(item.id).length).toBe(0);
  });

  test('getItemsByCategory: should return items in correct category ordered', () => {
    const store = usePlannerStore.getState();
    
    store.createItem(createMockItem({ category: 'today', title: 'Task 1' }));
    store.createItem(createMockItem({ category: 'upcoming', title: 'Task 2' }));
    store.createItem(createMockItem({ category: 'today', title: 'Task 3' }));
    
    const todayItems = store.getItemsByCategory('today');
    
    expect(todayItems.length).toBe(2);
    expect(todayItems[0].title).toBe('Task 1');
    expect(todayItems[1].title).toBe('Task 3');
  });

  test('getItemsByCategory: should exclude archived items', () => {
    const store = usePlannerStore.getState();
    
    const item1 = store.createItem(createMockItem({ category: 'today' }));
    const item2 = store.createItem(createMockItem({ category: 'today' }));
    store.archiveItem(item2.id);
    
    const todayItems = store.getItemsByCategory('today');
    
    expect(todayItems.length).toBe(1);
    expect(todayItems[0].id).toBe(item1.id);
  });
});

describe('PlannerStore - Status & Schedule Management', () => {
  beforeEach(() => {
    const state = usePlannerStore.getState();
    state.items.forEach(item => state.deleteItem(item.id));
  });

  test('toggleStatus: should update item status', () => {
    const store = usePlannerStore.getState();
    const item = store.createItem(createMockItem());
    
    store.toggleStatus(item.id, 'in-progress');
    
    const updated = store.getItem(item.id);
    expect(updated?.status).toBe('in-progress');
  });

  test('toggleStatus: should set completedAt when status is completed', () => {
    const store = usePlannerStore.getState();
    const item = store.createItem(createMockItem());
    
    store.toggleStatus(item.id, 'completed');
    
    const updated = store.getItem(item.id);
    expect(updated?.status).toBe('completed');
    expect(updated?.completedAt).toBeDefined();
  });

  test('updateSchedule: should update scheduled and due dates', () => {
    const store = usePlannerStore.getState();
    const item = store.createItem(createMockItem());
    
    const scheduledDate = '2024-01-15T10:00:00Z';
    const dueDate = '2024-01-20T18:00:00Z';
    
    store.updateSchedule(item.id, scheduledDate, dueDate);
    
    const updated = store.getItem(item.id);
    expect(updated?.scheduledDate).toBe(scheduledDate);
    expect(updated?.dueDate).toBe(dueDate);
  });

  test('reorderItems: should update order of items in category', () => {
    const store = usePlannerStore.getState();
    
    const item1 = store.createItem(createMockItem({ category: 'today', title: 'Task 1' }));
    const item2 = store.createItem(createMockItem({ category: 'today', title: 'Task 2' }));
    const item3 = store.createItem(createMockItem({ category: 'today', title: 'Task 3' }));
    
    store.reorderItems('today', [item3.id, item1.id, item2.id]);
    
    const items = store.getItemsByCategory('today');
    expect(items[0].id).toBe(item3.id);
    expect(items[1].id).toBe(item1.id);
    expect(items[2].id).toBe(item2.id);
  });
});

describe('PlannerStore - Inline Editing', () => {
  beforeEach(() => {
    const state = usePlannerStore.getState();
    state.items.forEach(item => state.deleteItem(item.id));
  });

  test('startEdit: should set inline edit metadata and mark item as editing', () => {
    const store = usePlannerStore.getState();
    const item = store.createItem(createMockItem({ title: 'Original Title' }));
    
    store.startEdit(item.id, 'title', 'Original Title');
    
    expect(store.inlineEditMetadata).toEqual({
      itemId: item.id,
      field: 'title',
      originalValue: 'Original Title',
    });
    
    const updated = store.getItem(item.id);
    expect(updated?.isEditing).toBe(true);
  });

  test('commitEdit: should update field and clear editing state', () => {
    const store = usePlannerStore.getState();
    const item = store.createItem(createMockItem({ title: 'Original Title' }));
    
    store.startEdit(item.id, 'title', 'Original Title');
    store.commitEdit(item.id, 'title', 'New Title');
    
    const updated = store.getItem(item.id);
    expect(updated?.title).toBe('New Title');
    expect(updated?.isEditing).toBe(false);
    expect(store.inlineEditMetadata).toBeNull();
  });

  test('cancelEdit: should restore original value and clear editing state', () => {
    const store = usePlannerStore.getState();
    const item = store.createItem(createMockItem({ title: 'Original Title' }));
    
    store.startEdit(item.id, 'title', 'Original Title');
    store.updateItem(item.id, { title: 'Temp Title' });
    store.cancelEdit();
    
    const updated = store.getItem(item.id);
    expect(updated?.title).toBe('Original Title');
    expect(updated?.isEditing).toBe(false);
    expect(store.inlineEditMetadata).toBeNull();
  });
});

describe('PlannerStore - Time Logging', () => {
  beforeEach(() => {
    const state = usePlannerStore.getState();
    state.items.forEach(item => state.deleteItem(item.id));
    state.timeLogs.forEach(log => state.endTimeLog(log.id));
  });

  test('startTimeLog: should create a new time log and set item to in-progress', () => {
    const store = usePlannerStore.getState();
    const item = store.createItem(createMockItem());
    
    const log = store.startTimeLog(item.id, 'Working on this task');
    
    expect(log.id).toBeDefined();
    expect(log.plannerId).toBe(item.id);
    expect(log.startTime).toBeDefined();
    expect(log.endTime).toBeUndefined();
    expect(log.notes).toBe('Working on this task');
    
    const updated = store.getItem(item.id);
    expect(updated?.status).toBe('in-progress');
  });

  test('startTimeLog: should end existing active log before starting new one', () => {
    const store = usePlannerStore.getState();
    const item = store.createItem(createMockItem());
    
    const log1 = store.startTimeLog(item.id);
    const log2 = store.startTimeLog(item.id);
    
    const logs = store.getTimeLogsByItem(item.id);
    expect(logs.length).toBe(2);
    expect(logs.find(l => l.id === log1.id)?.endTime).toBeDefined();
    expect(logs.find(l => l.id === log2.id)?.endTime).toBeUndefined();
  });

  test('endTimeLog: should set end time and calculate duration', (done) => {
    const store = usePlannerStore.getState();
    const item = store.createItem(createMockItem());
    
    const log = store.startTimeLog(item.id);
    
    setTimeout(() => {
      store.endTimeLog(log.id);
      
      const logs = store.getTimeLogsByItem(item.id);
      const endedLog = logs.find(l => l.id === log.id);
      
      expect(endedLog?.endTime).toBeDefined();
      expect(endedLog?.duration).toBeGreaterThan(0);
      done();
    }, 100);
  });

  test('getActiveTimeLog: should return active log for item', () => {
    const store = usePlannerStore.getState();
    const item = store.createItem(createMockItem());
    
    store.startTimeLog(item.id);
    
    const activeLog = store.getActiveTimeLog(item.id);
    expect(activeLog).toBeDefined();
    expect(activeLog?.endTime).toBeUndefined();
  });

  test('getTimeLogsByItem: should return logs sorted by start time descending', (done) => {
    const store = usePlannerStore.getState();
    const item = store.createItem(createMockItem());
    
    const log1 = store.startTimeLog(item.id);
    store.endTimeLog(log1.id);
    
    setTimeout(() => {
      const log2 = store.startTimeLog(item.id);
      
      const logs = store.getTimeLogsByItem(item.id);
      expect(logs.length).toBe(2);
      expect(logs[0].id).toBe(log2.id);
      expect(logs[1].id).toBe(log1.id);
      done();
    }, 10);
  });
});

describe('PlannerStore - Time Statistics & Aggregates', () => {
  beforeEach(() => {
    const state = usePlannerStore.getState();
    state.items.forEach(item => state.deleteItem(item.id));
  });

  test('getTimeStats: should calculate today duration', (done) => {
    const store = usePlannerStore.getState();
    const item = store.createItem(createMockItem());
    
    const log = store.startTimeLog(item.id);
    
    setTimeout(() => {
      store.endTimeLog(log.id);
      
      const stats = store.getTimeStats();
      expect(stats.today).toBeGreaterThan(0);
      done();
    }, 100);
  });

  test('getTimeStats: should calculate stats by item', (done) => {
    const store = usePlannerStore.getState();
    const item1 = store.createItem(createMockItem({ title: 'Task 1' }));
    const item2 = store.createItem(createMockItem({ title: 'Task 2' }));
    
    const log1 = store.startTimeLog(item1.id);
    const log2 = store.startTimeLog(item2.id);
    
    setTimeout(() => {
      store.endTimeLog(log1.id);
      store.endTimeLog(log2.id);
      
      const stats = store.getTimeStats();
      expect(stats.byItem[item1.id]).toBeGreaterThan(0);
      expect(stats.byItem[item2.id]).toBeGreaterThan(0);
      done();
    }, 100);
  });

  test('getTimeStats: should calculate stats for specific item', (done) => {
    const store = usePlannerStore.getState();
    const item = store.createItem(createMockItem());
    
    const log = store.startTimeLog(item.id);
    
    setTimeout(() => {
      store.endTimeLog(log.id);
      
      const stats = store.getTimeStats(item.id);
      expect(stats.byItem[item.id]).toBeGreaterThan(0);
      expect(Object.keys(stats.byItem).length).toBe(1);
      done();
    }, 100);
  });

  test('getDayAggregates: should group logs by date', (done) => {
    const store = usePlannerStore.getState();
    const item = store.createItem(createMockItem());
    
    const log = store.startTimeLog(item.id);
    
    setTimeout(() => {
      store.endTimeLog(log.id);
      
      const aggregates = store.getDayAggregates(7);
      expect(aggregates.length).toBe(7);
      
      const today = aggregates[aggregates.length - 1];
      expect(today.totalDuration).toBeGreaterThan(0);
      expect(today.itemCount).toBe(1);
      expect(today.logs.length).toBe(1);
      done();
    }, 100);
  });

  test('getDayAggregates: should initialize all days in range', () => {
    const store = usePlannerStore.getState();
    
    const aggregates = store.getDayAggregates(30);
    
    expect(aggregates.length).toBe(30);
    aggregates.forEach(aggregate => {
      expect(aggregate.date).toBeDefined();
      expect(aggregate.totalDuration).toBe(0);
      expect(aggregate.itemCount).toBe(0);
      expect(aggregate.logs).toEqual([]);
    });
  });
});

describe('PlannerStore - Utility Actions', () => {
  beforeEach(() => {
    const state = usePlannerStore.getState();
    state.items.forEach(item => state.deleteItem(item.id));
  });

  test('clearCompleted: should remove all completed items', () => {
    const store = usePlannerStore.getState();
    
    const item1 = store.createItem(createMockItem({ status: 'pending' }));
    const item2 = store.createItem(createMockItem({ status: 'completed' }));
    const item3 = store.createItem(createMockItem({ status: 'in-progress' }));
    
    store.clearCompleted();
    
    const remaining = store.getAllItems();
    expect(remaining.length).toBe(2);
    expect(remaining.find(i => i.id === item2.id)).toBeUndefined();
  });

  test('archiveItem: should set item status to archived', () => {
    const store = usePlannerStore.getState();
    const item = store.createItem(createMockItem());
    
    store.archiveItem(item.id);
    
    const updated = store.getItem(item.id);
    expect(updated?.status).toBe('archived');
  });

  test('getAllItems: should exclude archived items', () => {
    const store = usePlannerStore.getState();
    
    const item1 = store.createItem(createMockItem({ status: 'pending' }));
    const item2 = store.createItem(createMockItem({ status: 'archived' }));
    
    const items = store.getAllItems();
    
    expect(items.length).toBe(1);
    expect(items[0].id).toBe(item1.id);
  });
});

export const examples = {
  basicUsage: () => {
    const store = usePlannerStore.getState();

    const task = store.createItem({
      title: 'Complete project documentation',
      description: 'Write comprehensive docs for the new feature',
      status: 'pending',
      priority: 'high',
      category: 'today',
      tags: ['documentation', 'important'],
      estimatedDuration: 7200,
    });

    console.log('Created task:', task);

    store.updateItem(task.id, { status: 'in-progress' });

    const log = store.startTimeLog(task.id, 'Starting work on docs');
    console.log('Started time log:', log);

    setTimeout(() => {
      store.endTimeLog(log.id);
      
      const stats = store.getTimeStats(task.id);
      console.log('Time stats:', stats);
      
      store.toggleStatus(task.id, 'completed');
    }, 5000);
  },

  categoryManagement: () => {
    const store = usePlannerStore.getState();

    store.createItem({
      title: 'Morning standup',
      status: 'pending',
      priority: 'medium',
      category: 'today',
      scheduledDate: new Date().toISOString(),
    });

    store.createItem({
      title: 'Plan next sprint',
      status: 'pending',
      priority: 'medium',
      category: 'upcoming',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    });

    store.createItem({
      title: 'Daily exercise',
      status: 'pending',
      priority: 'medium',
      category: 'habits',
      recurrence: {
        pattern: 'daily',
        interval: 1,
      },
    });

    const todayTasks = store.getItemsByCategory('today');
    const upcomingTasks = store.getItemsByCategory('upcoming');
    const habits = store.getItemsByCategory('habits');

    console.log('Today:', todayTasks.length);
    console.log('Upcoming:', upcomingTasks.length);
    console.log('Habits:', habits.length);
  },

  timeAnalytics: () => {
    const store = usePlannerStore.getState();

    const task = store.createItem({
      title: 'Code review',
      status: 'pending',
      priority: 'high',
      category: 'today',
    });

    const log1 = store.startTimeLog(task.id);
    setTimeout(() => store.endTimeLog(log1.id), 3600000);

    const stats = store.getTimeStats();
    console.log('Total time today:', stats.today / 3600, 'hours');
    console.log('Average per day (7 days):', stats.averagePerDay7 / 3600, 'hours');
    console.log('Average per day (30 days):', stats.averagePerDay30 / 3600, 'hours');

    const aggregates = store.getDayAggregates(7);
    console.log('Last 7 days activity:', aggregates);
  },
};
