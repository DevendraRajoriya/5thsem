import React, { useState, useRef, useEffect } from 'react';
import { 
  Check, 
  Calendar, 
  Trash2, 
  MoreVertical,
  Flag,
  Timer,
  Play
} from 'lucide-react';
import { PlannerItem, PlannerItemPriority, PlannerItemStatus } from '../store/types';
import { usePlannerStore } from '../store/plannerStore';
import { cn } from '../utils/cn';
import { format, parseISO, isToday, isTomorrow, isBefore, startOfDay } from 'date-fns';

interface TaskCardProps {
  item: PlannerItem;
  onExpand?: (item: PlannerItem) => void;
  className?: string;
}

export const TaskCard: React.FC<TaskCardProps> = ({ 
  item, 
  onExpand, 
  className 
}) => {
  const [editValue, setEditValue] = useState('');
  const [showActions, setShowActions] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);
  const notesRef = useRef<HTMLTextAreaElement>(null);
  
  const { 
    toggleStatus, 
    deleteItem, 
    startTimeLog,
    getActiveTimeLog,
    startEdit,
    cancelEdit,
    commitEdit,
    inlineEditMetadata
  } = usePlannerStore();

  const activeLog = getActiveTimeLog(item.id);
  const isEditingInline = inlineEditMetadata?.itemId === item.id;

  useEffect(() => {
    if (isEditingInline && inlineEditMetadata?.field === 'title' && titleRef.current) {
      titleRef.current.focus();
      titleRef.current.select();
    }
    if (isEditingInline && inlineEditMetadata?.field === 'description' && notesRef.current) {
      notesRef.current.focus();
      notesRef.current.select();
    }
  }, [isEditingInline, inlineEditMetadata]);

  const handleStatusToggle = () => {
    const newStatus: PlannerItemStatus = 
      item.status === 'completed' ? 'pending' : 'completed';
    toggleStatus(item.id, newStatus);
  };

  const handleStartEdit = (field: 'title' | 'description') => {
    const value = field === 'title' ? item.title : (item.description || '');
    startEdit(item.id, field, value);
    setEditValue(value);
  };

  const handleSaveEdit = () => {
    if (isEditingInline && editValue.trim()) {
      commitEdit(item.id, inlineEditMetadata.field, editValue.trim());
    }
  };

  const handleCancelEdit = () => {
    cancelEdit();
    setEditValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const handleDelete = () => {
    deleteItem(item.id);
  };

  const handleStartTimer = () => {
    startTimeLog(item.id);
  };

  const getPriorityColor = (priority: PlannerItemPriority) => {
    switch (priority) {
      case 'urgent': return 'text-red-500 bg-red-50 border-red-200';
      case 'high': return 'text-orange-500 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-500 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-500 bg-green-50 border-green-200';
      default: return 'text-gray-500 bg-gray-50 border-gray-200';
    }
  };

  const getDueDateDisplay = () => {
    if (!item.scheduledDate && !item.dueDate) return null;
    
    const date = item.scheduledDate || item.dueDate;
    if (!date) return null;
    
    const parsedDate = parseISO(date);
    let dateText = format(parsedDate, 'MMM d');
    let colorClass = 'text-gray-500';
    
    if (isToday(parsedDate)) {
      dateText = 'Today';
      colorClass = 'text-blue-500';
    } else if (isTomorrow(parsedDate)) {
      dateText = 'Tomorrow';
      colorClass = 'text-purple-500';
    } else if (isBefore(parsedDate, startOfDay(new Date()))) {
      colorClass = 'text-red-500';
    }
    
    return (
      <div className={cn('flex items-center text-xs', colorClass)}>
        <Calendar className="w-3 h-3 mr-1" />
        {dateText}
      </div>
    );
  };

  return (
    <div className={cn(
      'group bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all duration-200 relative',
      item.status === 'completed' && 'opacity-60',
      activeLog && 'ring-2 ring-blue-400',
      className
    )}>
      <div className="flex items-start space-x-3">
        {/* Checkbox */}
        <button
          onClick={handleStatusToggle}
          className={cn(
            'mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors',
            item.status === 'completed'
              ? 'bg-blue-500 border-blue-500 text-white'
              : 'border-gray-300 hover:border-blue-400'
          )}
          aria-label={item.status === 'completed' ? 'Mark as incomplete' : 'Mark as complete'}
        >
          {item.status === 'completed' && <Check className="w-3 h-3" />}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          {isEditingInline && inlineEditMetadata?.field === 'title' ? (
            <input
              ref={titleRef}
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleSaveEdit}
              onKeyDown={handleKeyDown}
              className="w-full px-2 py-1 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Task title"
            />
          ) : (
            <h3 
              className={cn(
                'font-medium text-gray-900 cursor-text hover:text-blue-600 transition-colors',
                item.status === 'completed' && 'line-through text-gray-500'
              )}
              onClick={() => handleStartEdit('title')}
            >
              {item.title}
            </h3>
          )}

          {/* Description/Notes */}
          {item.description && (
            <div className="mt-2">
              {isEditingInline && inlineEditMetadata?.field === 'description' ? (
                <textarea
                  ref={notesRef}
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={handleSaveEdit}
                  onKeyDown={handleKeyDown}
                  className="w-full px-2 py-1 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={2}
                  aria-label="Task notes"
                />
              ) : (
                <p 
                  className="text-sm text-gray-600 cursor-text hover:text-gray-800 transition-colors"
                  onClick={() => handleStartEdit('description')}
                >
                  {item.description}
                </p>
              )}
            </div>
          )}

          {/* Metadata */}
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center space-x-3 text-xs">
              {/* Priority */}
              <div className={cn('flex items-center px-2 py-1 rounded-full border', getPriorityColor(item.priority))}>
                <Flag className="w-3 h-3 mr-1" />
                {item.priority}
              </div>

              {/* Due Date */}
              {getDueDateDisplay()}

              {/* Timer Status */}
              {activeLog && (
                <div className="flex items-center text-green-500">
                  <Timer className="w-3 h-3 mr-1 animate-pulse" />
                  Active
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {onExpand && (
                <button
                  onClick={() => onExpand(item)}
                  className="p-1.5 rounded hover:bg-gray-100 transition-colors"
                  aria-label="Expand task"
                  title="Focus mode"
                >
                  <Play className="w-3 h-3 text-gray-500" />
                </button>
              )}
              
              <button
                onClick={() => setShowActions(!showActions)}
                className="p-1.5 rounded hover:bg-gray-100 transition-colors"
                aria-label="More actions"
              >
                <MoreVertical className="w-3 h-3 text-gray-500" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Actions Dropdown */}
      {showActions && (
        <div className="absolute right-4 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-10">
          {!activeLog && (
            <button
              onClick={() => {
                handleStartTimer();
                setShowActions(false);
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            >
              <Play className="w-4 h-4 mr-2" />
              Start Timer
            </button>
          )}
          
          {onExpand && (
            <button
              onClick={() => {
                onExpand(item);
                setShowActions(false);
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            >
              <Timer className="w-4 h-4 mr-2" />
              Focus Mode
            </button>
          )}
          
          <button
            onClick={handleDelete}
            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default TaskCard;