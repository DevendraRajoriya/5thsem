import { useState, useEffect, useCallback, useRef } from 'react';

export type TimerMode = 'stopwatch' | 'countdown';

export interface TimerConfig {
  mode?: TimerMode;
  targetDuration?: number;
  onComplete?: () => void;
}

export interface TimerState {
  elapsedSeconds: number;
  isRunning: boolean;
  isPaused: boolean;
  mode: TimerMode;
  targetDuration: number | null;
}

export interface TimerActions {
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  setMode: (mode: TimerMode) => void;
  setTargetDuration: (seconds: number) => void;
}

export interface FormattedTime {
  hours: string;
  minutes: string;
  seconds: string;
  formatted: string;
  totalSeconds: number;
}

export interface UseTimerReturn extends TimerState, TimerActions {
  getFormattedElapsed: () => FormattedTime;
  getFormattedRemaining: () => FormattedTime;
  getRemainingSeconds: () => number;
  getProgressPercentage: () => number;
}

const formatTimeValue = (value: number): string => {
  return value.toString().padStart(2, '0');
};

const formatSeconds = (totalSeconds: number): FormattedTime => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const formattedHours = formatTimeValue(hours);
  const formattedMinutes = formatTimeValue(minutes);
  const formattedSeconds = formatTimeValue(seconds);

  const formatted = hours > 0
    ? `${formattedHours}:${formattedMinutes}:${formattedSeconds}`
    : `${formattedMinutes}:${formattedSeconds}`;

  return {
    hours: formattedHours,
    minutes: formattedMinutes,
    seconds: formattedSeconds,
    formatted,
    totalSeconds,
  };
};

export const useTimer = (config: TimerConfig = {}): UseTimerReturn => {
  const {
    mode: initialMode = 'stopwatch',
    targetDuration: initialTarget = null,
    onComplete,
  } = config;

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [mode, setMode] = useState<TimerMode>(initialMode);
  const [targetDuration, setTargetDuration] = useState<number | null>(initialTarget);

  const intervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const accumulatedTimeRef = useRef(0);

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const checkCompletion = useCallback(
    (currentElapsed: number) => {
      if (mode === 'countdown' && targetDuration !== null && currentElapsed >= targetDuration) {
        clearTimer();
        setIsRunning(false);
        setIsPaused(false);
        setElapsedSeconds(targetDuration);
        if (onComplete) {
          onComplete();
        }
        return true;
      }
      return false;
    },
    [mode, targetDuration, clearTimer, onComplete]
  );

  const start = useCallback(() => {
    if (isRunning) return;

    setIsRunning(true);
    setIsPaused(false);
    startTimeRef.current = Date.now();
    accumulatedTimeRef.current = elapsedSeconds;

    intervalRef.current = window.setInterval(() => {
      if (startTimeRef.current === null) return;

      const currentElapsed = Math.floor(
        accumulatedTimeRef.current + (Date.now() - startTimeRef.current) / 1000
      );

      setElapsedSeconds(currentElapsed);

      if (checkCompletion(currentElapsed)) {
        clearTimer();
      }
    }, 100);
  }, [isRunning, elapsedSeconds, checkCompletion, clearTimer]);

  const pause = useCallback(() => {
    if (!isRunning || isPaused) return;

    clearTimer();
    setIsRunning(false);
    setIsPaused(true);
    accumulatedTimeRef.current = elapsedSeconds;
    startTimeRef.current = null;
  }, [isRunning, isPaused, elapsedSeconds, clearTimer]);

  const resume = useCallback(() => {
    if (isRunning || !isPaused) return;

    start();
  }, [isRunning, isPaused, start]);

  const reset = useCallback(() => {
    clearTimer();
    setElapsedSeconds(0);
    setIsRunning(false);
    setIsPaused(false);
    accumulatedTimeRef.current = 0;
    startTimeRef.current = null;
  }, [clearTimer]);

  const getRemainingSeconds = useCallback((): number => {
    if (mode === 'stopwatch' || targetDuration === null) {
      return 0;
    }
    return Math.max(0, targetDuration - elapsedSeconds);
  }, [mode, targetDuration, elapsedSeconds]);

  const getProgressPercentage = useCallback((): number => {
    if (mode === 'stopwatch' || targetDuration === null || targetDuration === 0) {
      return 0;
    }
    return Math.min(100, (elapsedSeconds / targetDuration) * 100);
  }, [mode, targetDuration, elapsedSeconds]);

  const getFormattedElapsed = useCallback((): FormattedTime => {
    return formatSeconds(elapsedSeconds);
  }, [elapsedSeconds]);

  const getFormattedRemaining = useCallback((): FormattedTime => {
    return formatSeconds(getRemainingSeconds());
  }, [getRemainingSeconds]);

  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, [clearTimer]);

  return {
    elapsedSeconds,
    isRunning,
    isPaused,
    mode,
    targetDuration,
    start,
    pause,
    resume,
    reset,
    setMode,
    setTargetDuration,
    getFormattedElapsed,
    getFormattedRemaining,
    getRemainingSeconds,
    getProgressPercentage,
  };
};
