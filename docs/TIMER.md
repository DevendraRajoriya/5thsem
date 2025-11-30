# Timer Hook & Widget Documentation

## Overview

The timer system provides a flexible stopwatch and countdown timer implementation with deep integration into the planner system. It consists of two main parts:

1. **`useTimer` hook** - Core timer logic with stopwatch/countdown functionality
2. **`TimerWidget` component** - Complete UI implementation with planner integration

## Features

### Core Timer Features
- ⏱️ **Stopwatch Mode** - Count up from zero with precise time tracking
- ⏰ **Countdown Mode** - Count down from a target duration with completion callbacks
- ▶️ **Full Control** - Start, pause, resume, and reset operations
- 📊 **Progress Tracking** - Get completion percentage and remaining time
- 🎯 **Accurate Timing** - Uses RAF-based interval for smooth updates
- 💾 **Store Integration** - Automatically creates time logs in the planner store

### UI Features
- 🎨 **Notion-Inspired Design** - Clean, minimal interface matching the app aesthetic
- 📱 **Responsive Layout** - Compact and full-size modes
- ♿ **Accessibility** - ARIA labels, keyboard navigation, live regions
- 🎛️ **Configurable** - Toggle modes, adjust durations, add notes
- 📝 **Time Logging** - Integrated note-taking for time entries

## Installation

The timer components are part of the core application. Import them as needed:

```typescript
// Import the hook
import { useTimer } from '@/hooks/useTimer';

// Import the widget
import { TimerWidget } from '@/components/TimerWidget';
```

## useTimer Hook

### Basic Usage

```typescript
import { useTimer } from '@/hooks/useTimer';

function MyComponent() {
  const timer = useTimer();
  
  return (
    <div>
      <div>{timer.getFormattedElapsed().formatted}</div>
      <button onClick={timer.start}>Start</button>
      <button onClick={timer.pause}>Pause</button>
      <button onClick={timer.reset}>Reset</button>
    </div>
  );
}
```

### Configuration Options

```typescript
interface TimerConfig {
  mode?: 'stopwatch' | 'countdown';
  targetDuration?: number; // in seconds
  onComplete?: () => void;
}
```

**Example: Pomodoro Timer**

```typescript
const timer = useTimer({
  mode: 'countdown',
  targetDuration: 25 * 60, // 25 minutes
  onComplete: () => {
    alert('Pomodoro session complete!');
    playNotificationSound();
  },
});
```

### Return Value

The hook returns an object with state, actions, and helper functions:

#### State
- `elapsedSeconds: number` - Current elapsed time in seconds
- `isRunning: boolean` - Whether the timer is actively running
- `isPaused: boolean` - Whether the timer is paused
- `mode: TimerMode` - Current mode ('stopwatch' or 'countdown')
- `targetDuration: number | null` - Target duration for countdown mode

#### Actions
- `start()` - Start the timer from current position
- `pause()` - Pause the running timer
- `resume()` - Resume from paused state
- `reset()` - Reset timer to zero and stop
- `setMode(mode)` - Change between stopwatch and countdown
- `setTargetDuration(seconds)` - Set the countdown target

#### Formatters
- `getFormattedElapsed()` - Returns `FormattedTime` with elapsed time
- `getFormattedRemaining()` - Returns `FormattedTime` with remaining time
- `getRemainingSeconds()` - Returns remaining seconds as number
- `getProgressPercentage()` - Returns completion percentage (0-100)

#### FormattedTime Interface

```typescript
interface FormattedTime {
  hours: string;        // "00" to "99+"
  minutes: string;      // "00" to "59"
  seconds: string;      // "00" to "59"
  formatted: string;    // "HH:MM:SS" or "MM:SS"
  totalSeconds: number; // Total seconds as number
}
```

### Advanced Examples

**Custom Timer with Progress Bar**

```typescript
function ProgressTimer() {
  const timer = useTimer({
    mode: 'countdown',
    targetDuration: 300, // 5 minutes
  });
  
  const progress = timer.getProgressPercentage();
  
  return (
    <div>
      <div style={{ width: `${progress}%` }} className="progress-bar" />
      <div>{timer.getFormattedRemaining().formatted}</div>
      <button onClick={timer.start}>Start</button>
    </div>
  );
}
```

**Interval Training Timer**

```typescript
function IntervalTimer() {
  const [round, setRound] = useState(1);
  
  const timer = useTimer({
    mode: 'countdown',
    targetDuration: 30,
    onComplete: () => {
      if (round < 8) {
        setRound(round + 1);
        timer.reset();
        timer.start();
      } else {
        alert('Workout complete!');
      }
    },
  });
  
  return (
    <div>
      <h3>Round {round} of 8</h3>
      <div>{timer.getFormattedRemaining().formatted}</div>
      <button onClick={timer.start}>Start</button>
    </div>
  );
}
```

## TimerWidget Component

### Basic Usage

```typescript
import { TimerWidget } from '@/components/TimerWidget';

function MyPage() {
  return <TimerWidget />;
}
```

### Props

```typescript
interface TimerWidgetProps {
  plannerId?: string;
  initialMode?: 'stopwatch' | 'countdown';
  initialTarget?: number; // seconds
  showModeToggle?: boolean;
  showSettings?: boolean;
  compact?: boolean;
  className?: string;
  onTimeLogComplete?: (duration: number) => void;
}
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `plannerId` | `string?` | - | Planner item ID to log time against |
| `initialMode` | `TimerMode` | `'stopwatch'` | Starting timer mode |
| `initialTarget` | `number?` | - | Initial countdown duration in seconds |
| `showModeToggle` | `boolean` | `true` | Show mode switching button |
| `showSettings` | `boolean` | `true` | Show settings panel |
| `compact` | `boolean` | `false` | Use compact inline layout |
| `className` | `string?` | - | Additional CSS classes |
| `onTimeLogComplete` | `function?` | - | Callback with duration when log completes |

### Usage Examples

**Standalone Stopwatch**

```typescript
<TimerWidget 
  initialMode="stopwatch" 
  showModeToggle={false}
/>
```

**Pomodoro Timer**

```typescript
<TimerWidget 
  initialMode="countdown"
  initialTarget={25 * 60}
  onTimeLogComplete={(duration) => {
    console.log(`Session complete: ${duration}s`);
    showNotification('Take a break!');
  }}
/>
```

**Integrated with Planner Item**

```typescript
function TaskItem({ task }) {
  return (
    <div className="task-card">
      <h3>{task.title}</h3>
      <TimerWidget 
        plannerId={task.id}
        compact
        onTimeLogComplete={(duration) => {
          updateTaskStats(task.id, duration);
        }}
      />
    </div>
  );
}
```

**Compact Inline Timer**

```typescript
<div className="flex items-center justify-between">
  <span>Work Session</span>
  <TimerWidget compact />
</div>
```

## Store Integration

When a `plannerId` is provided, the TimerWidget automatically integrates with the planner store:

### Time Log Creation

```typescript
// When timer starts
const log = startTimeLog(plannerId, notes);

// Log structure
interface TimeLog {
  id: string;
  plannerId: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Time Log Completion

```typescript
// When timer stops/completes
endTimeLog(logId);

// Updates log with:
// - endTime: current timestamp
// - duration: calculated seconds
// - updatedAt: current timestamp
```

### Status Updates

When a timer starts with a `plannerId`, the associated planner item's status is automatically set to `'in-progress'`.

## Styling & Theming

The timer components use Tailwind CSS with the Notion-inspired theme. Key classes:

### Component Classes
- `.card` - Base card styling with border and shadow
- `.btn` - Base button styling with transitions
- `.btn-primary` - Primary action button (blue)
- `.btn-secondary` - Secondary action button (gray)
- `.input` - Text input styling

### Custom Colors
- Blue: Primary actions and progress indicators
- Yellow: Pause state
- Green: Running state indicator
- Gray: Secondary elements and borders

### Animations
- `animate-pulse` - Running indicator dot
- Smooth transitions on all interactive elements
- Progress bar transitions with `duration-300`

## Accessibility

All timer components follow WCAG 2.1 AA guidelines:

### Keyboard Navigation
- All controls are keyboard accessible
- Logical tab order
- Enter/Space to activate buttons

### Screen Readers
- ARIA labels on all interactive elements
- `aria-live="polite"` on time display for updates
- Progress bars with proper `role="progressbar"` and values
- Descriptive button labels

### Visual
- High contrast text and backgrounds
- Clear focus indicators
- Large touch targets (44px minimum)

## Performance Considerations

### Timer Precision
- Uses `setInterval` with 100ms updates for UI
- Calculates elapsed time from `Date.now()` for accuracy
- Avoids drift common with pure interval-based timers

### Memory Management
- Properly cleans up intervals on unmount
- Uses `useCallback` to prevent unnecessary re-renders
- Refs for values that shouldn't trigger renders

### Best Practices
- Only one active timer per planner item
- Existing active logs are ended when starting new ones
- Store updates are batched where possible

## Testing

### Unit Testing the Hook

```typescript
import { renderHook, act } from '@testing-library/react';
import { useTimer } from '@/hooks/useTimer';

test('timer counts up in stopwatch mode', () => {
  const { result } = renderHook(() => useTimer());
  
  act(() => {
    result.current.start();
  });
  
  // Wait and check elapsed time
  setTimeout(() => {
    expect(result.current.elapsedSeconds).toBeGreaterThan(0);
  }, 1000);
});
```

### Component Testing

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { TimerWidget } from '@/components/TimerWidget';

test('timer starts and pauses', () => {
  render(<TimerWidget />);
  
  const startButton = screen.getByLabelText(/start timer/i);
  fireEvent.click(startButton);
  
  expect(screen.getByText(/timer running/i)).toBeInTheDocument();
  
  const pauseButton = screen.getByLabelText(/pause timer/i);
  fireEvent.click(pauseButton);
  
  expect(screen.queryByText(/timer running/i)).not.toBeInTheDocument();
});
```

## Troubleshooting

### Timer Not Starting
- Check if another timer is already running for the same planner item
- Verify store connection and planner item exists
- Check browser console for errors

### Inaccurate Time Tracking
- Timer uses `Date.now()` for accuracy, not interval counting
- Brief pauses (<100ms) may not be visible in UI but are tracked
- Time logs are calculated server-side from start/end timestamps

### Performance Issues
- Limit to one active timer per view
- Use compact mode in lists
- Check for excessive re-renders with React DevTools

## Future Enhancements

Potential improvements for future versions:

- [ ] Sound notifications on countdown completion
- [ ] Desktop notifications
- [ ] Multiple concurrent timers
- [ ] Timer presets and templates
- [ ] Time log editing and manual entry
- [ ] Analytics and time tracking reports
- [ ] Export time logs to CSV/PDF
- [ ] Integration with calendar apps

## Related Documentation

- [Planner Store API](./PLANNER_STORE.md)
- [Component Patterns](./COMPONENTS.md)
- [State Management](./STATE_MANAGEMENT.md)

## Support

For issues or questions:
- Check existing issues in the repository
- Review the examples file: `src/components/TimerWidget.examples.tsx`
- Consult the inline TypeScript documentation
