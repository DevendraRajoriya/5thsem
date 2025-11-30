import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Clock, Timer, Settings } from 'lucide-react';
import { useTimer, TimerMode } from '../hooks/useTimer';
import { usePlannerStore } from '../store/plannerStore';
import { cn } from '../utils/cn';

export interface TimerWidgetProps {
  plannerId?: string;
  initialMode?: TimerMode;
  initialTarget?: number;
  showModeToggle?: boolean;
  showSettings?: boolean;
  compact?: boolean;
  className?: string;
  onTimeLogComplete?: (duration: number) => void;
}

export const TimerWidget: React.FC<TimerWidgetProps> = ({
  plannerId,
  initialMode = 'stopwatch',
  initialTarget,
  showModeToggle = true,
  showSettings = true,
  compact = false,
  className,
  onTimeLogComplete,
}) => {
  const [notes, setNotes] = useState('');
  const [activeLogId, setActiveLogId] = useState<string | null>(null);
  const [targetInput, setTargetInput] = useState(
    initialTarget ? Math.floor(initialTarget / 60).toString() : '25'
  );
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);

  const { startTimeLog, endTimeLog, getActiveTimeLog, updateItem } = usePlannerStore();

  const timer = useTimer({
    mode: initialMode,
    targetDuration: initialTarget,
    onComplete: () => {
      handleStop();
    },
  });

  const { isRunning, isPaused, mode, elapsedSeconds } = timer;

  useEffect(() => {
    if (plannerId) {
      const existingLog = getActiveTimeLog(plannerId);
      if (existingLog) {
        setActiveLogId(existingLog.id);
        timer.reset();
        timer.setMode('stopwatch');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plannerId]);

  const handleStart = () => {
    if (plannerId) {
      const log = startTimeLog(plannerId, notes);
      setActiveLogId(log.id);
      if (notes) {
        updateItem(plannerId, { description: notes });
      }
    }
    timer.start();
  };

  const handlePause = () => {
    timer.pause();
  };

  const handleResume = () => {
    timer.resume();
  };

  const handleStop = () => {
    if (activeLogId) {
      endTimeLog(activeLogId);
      setActiveLogId(null);
      if (onTimeLogComplete) {
        onTimeLogComplete(elapsedSeconds);
      }
    }
    timer.reset();
    setNotes('');
  };

  const handleReset = () => {
    if (activeLogId) {
      endTimeLog(activeLogId);
      setActiveLogId(null);
    }
    timer.reset();
    setNotes('');
  };

  const handleModeToggle = () => {
    const newMode: TimerMode = mode === 'stopwatch' ? 'countdown' : 'stopwatch';
    timer.setMode(newMode);
    if (newMode === 'countdown' && !timer.targetDuration) {
      const defaultTarget = parseInt(targetInput) * 60 || 25 * 60;
      timer.setTargetDuration(defaultTarget);
    }
  };

  const handleTargetChange = () => {
    const minutes = parseInt(targetInput);
    if (!isNaN(minutes) && minutes > 0) {
      timer.setTargetDuration(minutes * 60);
      setShowSettingsPanel(false);
    }
  };

  const displayTime =
    mode === 'countdown' ? timer.getFormattedRemaining() : timer.getFormattedElapsed();

  const progressPercentage = mode === 'countdown' ? timer.getProgressPercentage() : 0;

  if (compact) {
    return (
      <div className={cn('flex items-center space-x-2', className)}>
        <button
          onClick={isRunning ? handlePause : isPaused ? handleResume : handleStart}
          className="p-2 rounded-md hover:bg-gray-100 transition-colors"
          aria-label={isRunning ? 'Pause timer' : 'Start timer'}
        >
          {isRunning ? (
            <Pause className="w-4 h-4 text-gray-700" />
          ) : (
            <Play className="w-4 h-4 text-gray-700" />
          )}
        </button>
        <span className="font-mono text-sm text-gray-700">{displayTime.formatted}</span>
        {(isRunning || isPaused) && (
          <button
            onClick={handleReset}
            className="p-2 rounded-md hover:bg-gray-100 transition-colors"
            aria-label="Reset timer"
          >
            <RotateCcw className="w-4 h-4 text-gray-500" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={cn('card p-6 space-y-4', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {mode === 'countdown' ? (
            <Timer className="w-5 h-5 text-gray-700" />
          ) : (
            <Clock className="w-5 h-5 text-gray-700" />
          )}
          <h3 className="text-lg font-semibold text-gray-900">
            {mode === 'countdown' ? 'Countdown Timer' : 'Stopwatch'}
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          {showModeToggle && !isRunning && (
            <button
              onClick={handleModeToggle}
              className="p-2 rounded-md hover:bg-gray-100 transition-colors"
              aria-label={`Switch to ${mode === 'stopwatch' ? 'countdown' : 'stopwatch'} mode`}
              title={`Switch to ${mode === 'stopwatch' ? 'countdown' : 'stopwatch'} mode`}
            >
              {mode === 'countdown' ? (
                <Clock className="w-4 h-4 text-gray-500" />
              ) : (
                <Timer className="w-4 h-4 text-gray-500" />
              )}
            </button>
          )}
          {showSettings && mode === 'countdown' && !isRunning && (
            <button
              onClick={() => setShowSettingsPanel(!showSettingsPanel)}
              className="p-2 rounded-md hover:bg-gray-100 transition-colors"
              aria-label="Timer settings"
              title="Timer settings"
            >
              <Settings className="w-4 h-4 text-gray-500" />
            </button>
          )}
        </div>
      </div>

      {showSettingsPanel && mode === 'countdown' && !isRunning && (
        <div className="p-4 bg-gray-50 rounded-md space-y-3">
          <label htmlFor="target-duration" className="block text-sm font-medium text-gray-700">
            Target Duration (minutes)
          </label>
          <div className="flex space-x-2">
            <input
              id="target-duration"
              type="number"
              min="1"
              value={targetInput}
              onChange={(e) => setTargetInput(e.target.value)}
              className="input flex-1"
              aria-label="Target duration in minutes"
            />
            <button
              onClick={handleTargetChange}
              className="btn btn-primary"
              aria-label="Apply target duration"
            >
              Apply
            </button>
          </div>
        </div>
      )}

      {mode === 'countdown' && timer.targetDuration && (
        <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
            role="progressbar"
            aria-valuenow={progressPercentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Timer progress"
          />
        </div>
      )}

      <div className="text-center">
        <div className="font-mono text-5xl font-bold text-gray-900" aria-live="polite">
          {displayTime.formatted}
        </div>
        {mode === 'countdown' && timer.targetDuration && (
          <div className="mt-1 text-sm text-gray-500">
            {timer.getFormattedElapsed().formatted} elapsed
          </div>
        )}
      </div>

      {!isRunning && !isPaused && plannerId && (
        <div className="space-y-2">
          <label htmlFor="timer-notes" className="block text-sm font-medium text-gray-700">
            Notes (optional)
          </label>
          <textarea
            id="timer-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes about this time log..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={2}
            aria-label="Timer notes"
          />
        </div>
      )}

      <div className="flex items-center justify-center space-x-3">
        <button
          onClick={isRunning ? handlePause : isPaused ? handleResume : handleStart}
          className={cn(
            'btn flex items-center space-x-2 px-6 py-3',
            isRunning
              ? 'bg-yellow-500 text-white hover:bg-yellow-600'
              : 'btn-primary'
          )}
          aria-label={isRunning ? 'Pause timer' : isPaused ? 'Resume timer' : 'Start timer'}
        >
          {isRunning ? (
            <>
              <Pause className="w-5 h-5" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              <span>{isPaused ? 'Resume' : 'Start'}</span>
            </>
          )}
        </button>

        {(isRunning || isPaused) && (
          <button
            onClick={handleReset}
            className="btn btn-secondary flex items-center space-x-2 px-6 py-3"
            aria-label="Reset timer"
          >
            <RotateCcw className="w-5 h-5" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {isRunning && (
        <div className="text-center">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
            Timer running
          </span>
        </div>
      )}
    </div>
  );
};

export default TimerWidget;
