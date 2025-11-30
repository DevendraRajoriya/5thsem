import React, { useState } from 'react';
import { ArrowLeft, Clock, Calendar, Flag, Trash2, Edit2 } from 'lucide-react';
import { PlannerItem } from '../store/types';
import { usePlannerStore } from '../store/plannerStore';
import TimerWidget from './TimerWidget';
import { cn } from '../utils/cn';
import { format, parseISO } from 'date-fns';

interface FocusModeProps {
  item: PlannerItem;
  onClose: () => void;
}

const FocusMode: React.FC<FocusModeProps> = ({ item, onClose }) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editTitle, setEditTitle] = useState(item.title);
  const [editDescription, setEditDescription] = useState(item.description || '');
  
  const { updateItem, deleteItem, getActiveTimeLog } = usePlannerStore();
  const activeLog = getActiveTimeLog(item.id);

  const handleSaveTitle = () => {
    if (editTitle.trim() && editTitle !== item.title) {
      updateItem(item.id, { title: editTitle.trim() });
    }
    setIsEditingTitle(false);
  };

  const handleSaveDescription = () => {
    if (editDescription !== item.description) {
      updateItem(item.id, { description: editDescription.trim() || undefined });
    }
    setIsEditingDescription(false);
  };

  const handleCancelEdit = () => {
    setEditTitle(item.title);
    setEditDescription(item.description || '');
    setIsEditingTitle(false);
    setIsEditingDescription(false);
  };

  const handleDelete = () => {
    deleteItem(item.id);
    onClose();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-500 bg-red-50 border-red-200';
      case 'high': return 'text-orange-500 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-500 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-500 bg-green-50 border-green-200';
      default: return 'text-gray-500 bg-gray-50 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    const date = parseISO(dateString);
    return format(date, 'EEEE, MMMM d, yyyy');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={onClose}
                className="p-2 rounded-md hover:bg-gray-100 transition-colors"
                aria-label="Back to dashboard"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Focus Mode</h1>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsEditingTitle(true)}
                className="p-2 rounded-md hover:bg-gray-100 transition-colors"
                aria-label="Edit title"
              >
                <Edit2 className="w-4 h-4 text-gray-600" />
              </button>
              
              <button
                onClick={handleDelete}
                className="p-2 rounded-md hover:bg-red-100 transition-colors"
                aria-label="Delete task"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Task Details */}
          <div className="space-y-6">
            {/* Title */}
            <div>
              {isEditingTitle ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveTitle();
                      if (e.key === 'Escape') handleCancelEdit();
                    }}
                    className="w-full px-4 py-3 text-2xl font-bold border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSaveTitle}
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <h2 className="text-2xl font-bold text-gray-900">{item.title}</h2>
              )}
            </div>

            {/* Metadata */}
            <div className="flex flex-wrap gap-3">
              <div className={cn('flex items-center px-3 py-1.5 rounded-full border', getPriorityColor(item.priority))}>
                <Flag className="w-4 h-4 mr-2" />
                {item.priority}
              </div>
              
              {item.scheduledDate && (
                <div className="flex items-center px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  {formatDate(item.scheduledDate)}
                </div>
              )}
              
              {activeLog && (
                <div className="flex items-center px-3 py-1.5 rounded-full bg-green-50 border border-green-200 text-green-600">
                  <Clock className="w-4 h-4 mr-2 animate-pulse" />
                  Timer Active
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900">Notes</h3>
                <button
                  onClick={() => setIsEditingDescription(true)}
                  className="p-1.5 rounded hover:bg-gray-100 transition-colors"
                  aria-label="Edit description"
                >
                  <Edit2 className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              
              {isEditingDescription ? (
                <div className="space-y-2">
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={6}
                    placeholder="Add notes about this task..."
                    autoFocus
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSaveDescription}
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  {item.description ? (
                    <p className="text-gray-700 whitespace-pre-wrap">{item.description}</p>
                  ) : (
                    <p className="text-gray-400 italic">No notes added yet</p>
                  )}
                </div>
              )}
            </div>

            {/* Additional Details */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Details</h3>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="text-sm text-gray-900 capitalize">{item.status.replace('-', ' ')}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">Category</dt>
                  <dd className="text-sm text-gray-900 capitalize">{item.category}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">Created</dt>
                  <dd className="text-sm text-gray-900">{format(parseISO(item.createdAt), 'MMM d, yyyy')}</dd>
                </div>
                {item.updatedAt !== item.createdAt && (
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Updated</dt>
                    <dd className="text-sm text-gray-900">{format(parseISO(item.updatedAt), 'MMM d, yyyy')}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>

          {/* Timer Widget */}
          <div className="lg:sticky lg:top-8 lg:h-fit">
            <TimerWidget
              plannerId={item.id}
              showModeToggle={true}
              showSettings={true}
              compact={false}
              className="w-full"
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default FocusMode;