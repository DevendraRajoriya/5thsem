import React, { useState } from 'react';
import { Plus, Calendar, Target, Zap } from 'lucide-react';
import { PlannerItem, PlannerCategory } from '../store/types';
import { usePlannerStore } from '../store/plannerStore';
import TaskCard from './TaskCard';
import FocusMode from './FocusMode';
import { cn } from '../utils/cn';
import { format, addDays } from 'date-fns';

interface DashboardProps {
  className?: string;
}

interface NewItemFormProps {
  category: PlannerCategory;
  onClose: () => void;
}

const NewItemForm: React.FC<NewItemFormProps> = ({ category, onClose }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const { createItem } = usePlannerStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newItem = {
      title: title.trim(),
      description: description.trim() || undefined,
      status: 'pending' as const,
      priority: 'medium' as const,
      category,
      scheduledDate: scheduledDate || undefined,
    };

    createItem(newItem);
    onClose();
    setTitle('');
    setDescription('');
    setScheduledDate('');
  };

  const getDefaultDate = () => {
    const today = new Date();
    if (category === 'today') {
      return format(today, 'yyyy-MM-dd');
    } else if (category === 'upcoming') {
      return format(addDays(today, 1), 'yyyy-MM-dd');
    }
    return '';
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-blue-200 p-4 mb-4">
      <input
        type="text"
        placeholder="Task title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-3"
        autoFocus
      />
      
      <textarea
        placeholder="Add notes (optional)..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none mb-3"
        rows={2}
      />

      {category !== 'habits' && (
        <input
          type="date"
          value={scheduledDate || getDefaultDate()}
          onChange={(e) => setScheduledDate(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
        />
      )}

      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!title.trim()}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Add Task
        </button>
      </div>
    </form>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ className }) => {
  const [expandedItem, setExpandedItem] = useState<PlannerItem | null>(null);
  const [showNewItemForm, setShowNewItemForm] = useState<PlannerCategory | null>(null);
  const { getItemsByCategory } = usePlannerStore();

  const todayItems = getItemsByCategory('today');
  const upcomingItems = getItemsByCategory('upcoming');
  const habitItems = getItemsByCategory('habits');

  const handleExpandItem = (item: PlannerItem) => {
    setExpandedItem(item);
  };

  const handleCloseFocusMode = () => {
    setExpandedItem(null);
  };

  const getCategoryConfig = (category: PlannerCategory) => {
    switch (category) {
      case 'today':
        return {
          title: 'Today',
          icon: Calendar,
          color: 'blue',
          description: "Today's tasks and priorities"
        };
      case 'upcoming':
        return {
          title: 'Upcoming',
          icon: Target,
          color: 'purple',
          description: 'Future tasks and deadlines'
        };
      case 'habits':
        return {
          title: 'Habits',
          icon: Zap,
          color: 'green',
          description: 'Recurring activities and goals'
        };
      default:
        throw new Error(`Unknown category: ${category}`);
    }
  };

  const renderColumn = (category: PlannerCategory, items: PlannerItem[]) => {
    const config = getCategoryConfig(category);
    const Icon = config.icon;

    return (
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
                    <div className={cn(
                      'p-2 rounded-lg',
                      config.color === 'blue' && 'bg-blue-100',
                      config.color === 'purple' && 'bg-purple-100',
                      config.color === 'green' && 'bg-green-100'
                    )}>
                      <Icon className={cn(
                        'w-5 h-5',
                        config.color === 'blue' && 'text-blue-600',
                        config.color === 'purple' && 'text-purple-600',
                        config.color === 'green' && 'text-green-600'
                      )} />
                    </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{config.title}</h2>
              <p className="text-sm text-gray-500">{config.description}</p>
            </div>
          </div>
          
          <button
            onClick={() => setShowNewItemForm(showNewItemForm === category ? null : category)}
            className={cn(
              'p-2 rounded-lg border-2 border-dashed transition-colors',
              'border-gray-300',
              config.color === 'blue' && 'hover:border-blue-400 hover:bg-blue-50',
              config.color === 'purple' && 'hover:border-purple-400 hover:bg-purple-50',
              config.color === 'green' && 'hover:border-green-400 hover:bg-green-50'
            )}
            aria-label={`Add new ${config.title.toLowerCase()} item`}
            title={`Add new ${config.title.toLowerCase()} item`}
          >
            <Plus className={cn(
              'w-4 h-4 text-gray-500',
              config.color === 'blue' && 'hover:text-blue-600',
              config.color === 'purple' && 'hover:text-purple-600',
              config.color === 'green' && 'hover:text-green-600'
            )} />
          </button>
        </div>

        {showNewItemForm === category && (
          <NewItemForm 
            category={category} 
            onClose={() => setShowNewItemForm(null)} 
          />
        )}

        <div className="space-y-3">
          {items.length === 0 && !showNewItemForm && (
            <div className="text-center py-12 text-gray-400">
              <Icon className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No {config.title.toLowerCase()} yet</p>
              <p className="text-xs mt-1">Click + to add your first task</p>
            </div>
          )}
          
          {items.map((item) => (
            <TaskCard
              key={item.id}
              item={item}
              onExpand={handleExpandItem}
            />
          ))}
        </div>
      </div>
    );
  };

  if (expandedItem) {
    return (
      <FocusMode
        item={expandedItem}
        onClose={handleCloseFocusMode}
      />
    );
  }

  return (
    <div className={cn('h-full', className)}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">
          Manage your tasks, habits, and upcoming events in one place
        </p>
      </div>

      <div className="flex space-x-6 h-full overflow-hidden">
        {renderColumn('today', todayItems)}
        {renderColumn('upcoming', upcomingItems)}
        {renderColumn('habits', habitItems)}
      </div>
    </div>
  );
};

export default Dashboard;