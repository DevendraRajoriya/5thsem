# Analytics System Documentation

## Overview

The analytics system provides comprehensive focus time tracking and visualization capabilities. It includes:

- **AnalyticsChart Component**: Interactive chart showing focus time trends with 7-day and 30-day views
- **AnalyticsModal**: Modal wrapper with smooth transitions for displaying analytics
- **Store Integration**: Consumes aggregated log data from the planner store
- **Time Summaries**: Display of total focus time and daily averages
- **Recharts Integration**: Professional bar/line combo charts with custom tooltips

## Components

### AnalyticsChart

The main chart component that displays focus time analytics.

**Location**: `src/components/AnalyticsChart.tsx`

**Features**:
- 7-day and 30-day range selection
- Bar chart showing focus duration per day
- Line chart overlay showing task completion count
- Summary cards with total focus time and daily averages
- Custom tooltip with human-readable time format
- Footer statistics showing today's focus time and best day

**Props**:
```typescript
interface AnalyticsChartProps {
  className?: string;  // Optional CSS classes
}
```

**Usage**:
```typescript
import AnalyticsChart from './components/AnalyticsChart';

function MyComponent() {
  return <AnalyticsChart className="my-custom-class" />;
}
```

### AnalyticsModal

Modal component that wraps the AnalyticsChart with a polished header and smooth transitions.

**Location**: `src/components/AnalyticsModal.tsx`

**Features**:
- Smooth entrance/exit animations with scale transform
- Semi-transparent backdrop with click-to-close
- Keyboard support (ESC to close)
- Prevents body scroll when modal is open
- Accessible close button with ARIA labels

**Props**:
```typescript
interface AnalyticsModalProps {
  isOpen: boolean;      // Controls modal visibility
  onClose: () => void;  // Callback when modal closes
}
```

**Usage**:
```typescript
import AnalyticsModal from './components/AnalyticsModal';
import { useState } from 'react';

function MyComponent() {
  const [showAnalytics, setShowAnalytics] = useState(false);

  return (
    <>
      <button onClick={() => setShowAnalytics(true)}>
        View Analytics
      </button>
      <AnalyticsModal 
        isOpen={showAnalytics} 
        onClose={() => setShowAnalytics(false)} 
      />
    </>
  );
}
```

## Integration with Dashboard

The Dashboard component includes an integrated Analytics button that opens the modal:

```typescript
import { useState } from 'react';
import { BarChart3 } from 'lucide-react';
import AnalyticsModal from './AnalyticsModal';

function Dashboard() {
  const [showAnalytics, setShowAnalytics] = useState(false);

  return (
    <>
      <button onClick={() => setShowAnalytics(true)}>
        <BarChart3 className="w-5 h-5" />
        Analytics
      </button>
      <AnalyticsModal 
        isOpen={showAnalytics} 
        onClose={() => setShowAnalytics(false)} 
      />
    </>
  );
}
```

## Data Flow

### 1. Time Logging

Time logs are created when users start a timer on a task:

```typescript
const { startTimeLog, endTimeLog } = usePlannerStore();

// Start tracking time
const log = startTimeLog(itemId);

// End tracking (automatically calculates duration)
endTimeLog(log.id);
```

### 2. Data Aggregation

The store provides aggregated data:

```typescript
const { getTimeStats, getDayAggregates } = usePlannerStore();

// Overall statistics
const stats = getTimeStats();
// {
//   today: 3600,                 // seconds
//   last7Days: 25200,            // seconds
//   last30Days: 86400,           // seconds
//   averagePerDay7: 3600,        // seconds
//   averagePerDay30: 2880,       // seconds
//   byDate: [...],               // DayAggregate[]
//   byItem: { itemId: 3600, ... } // Record<string, number>
// }

// Day-by-day breakdown
const dailyData = getDayAggregates(30); // Last 30 days
// [
//   {
//     date: "2024-01-15",
//     totalDuration: 7200,         // seconds
//     itemCount: 3,                // unique items
//     logs: [...]                  // TimeLog[]
//   },
//   ...
// ]
```

### 3. Chart Display

The AnalyticsChart transforms aggregated data for Recharts:

```typescript
// Internal data transformation
const chartData = dayAggregates
  .slice(-daysToShow)
  .map((aggregate) => ({
    date: aggregate.date,
    displayDate: format(date, 'MMM d'),
    totalDuration: aggregate.totalDuration,  // seconds
    itemCount: aggregate.itemCount,
    totalHours: formatDurationHours(aggregate.totalDuration),
  }));
```

## Time Formatting

The system provides utilities for human-readable time display:

### formatDurationHours
Converts seconds to hours with decimal precision:
- `3600` → `1h`
- `5400` → `1.5h`
- `86400` → `24h`

### formatTooltipTime
Converts seconds to human-readable format:
- `3600` → `1h 0m`
- `5400` → `1h 30m`
- `1800` → `30m`
- `300` → `5m`

**Implementation**:
```typescript
const formatDurationHours = (seconds: number): number => {
  return Math.round((seconds / 3600) * 10) / 10;
};

const formatTooltipTime = (value: number): string => {
  if (value >= 3600) {
    const hours = Math.floor(value / 3600);
    const minutes = Math.floor((value % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }
  const minutes = Math.floor(value / 60);
  return `${minutes}m`;
};
```

## Persistence

All analytics data is automatically persisted through Zustand's persist middleware:

```typescript
export const usePlannerStore = create<PlannerState>()(
  persist(
    (set, get) => ({
      // ... store implementation
    }),
    {
      name: PLANNER_CONSTANTS.STORAGE_KEY, // 'planner-storage'
      version: 1,
    }
  )
);
```

**Behavior**:
- Time logs are stored in localStorage automatically
- Data persists across browser sessions
- Data syncs across multiple tabs
- No additional configuration needed

**Storage Key**: `planner-storage`

## UI Polish & Tailwind Utilities

### Utility Classes

The system uses reusable Tailwind utility classes defined in `src/utils/tailwindUtils.ts`:

```typescript
export const CARD_STYLES = {
  base: 'bg-white rounded-lg border border-gray-200 shadow-sm',
  hover: 'hover:shadow-md transition-shadow duration-200',
  interactive: 'bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200',
};

export const BUTTON_STYLES = {
  primary: 'bg-blue-500 text-white hover:bg-blue-600 transition-colors duration-200 shadow-sm hover:shadow-md',
  secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors duration-200',
  tertiary: 'text-gray-600 hover:text-gray-900 transition-colors duration-200',
  ghost: 'text-gray-600 hover:bg-gray-50 transition-colors duration-200',
};

export const MODAL_STYLES = {
  backdrop: 'fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300',
  container: 'fixed inset-0 z-50 flex items-center justify-center p-4',
  content: 'bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-transform duration-300',
  header: 'sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between',
  body: 'p-6',
};

export const SHADOW_TOKENS = {
  soft: 'shadow-sm',
  subtle: 'shadow-base',
  medium: 'shadow-md',
  elevated: 'shadow-lg',
  modal: 'shadow-2xl',
};

export const SPACING_TOKENS = {
  xs: 'space-y-1',
  sm: 'space-y-2',
  base: 'space-y-4',
  md: 'space-y-6',
  lg: 'space-y-8',
};
```

### Shadow Tokens

Tailwind configuration includes refined shadow values:

```javascript
boxShadow: {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',      // Subtle
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), ...',  // Default
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), ...', // Medium
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), ...',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), ...',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
}
```

### Animations

Modal uses smooth entrance animations:

```javascript
animation: {
  'modal-in': 'modalIn 0.3s ease-out',
}

keyframes: {
  modalIn: {
    '0%': { transform: 'scale(0.95)', opacity: '0' },
    '100%': { transform: 'scale(1)', opacity: '1' },
  }
}
```

## Styling Pattern

All components follow consistent styling patterns:

1. **Soft Shadows**: Use `shadow-sm` for cards and containers
2. **Subtle Borders**: Use `border-gray-200` for subtle visual separation
3. **Consistent Spacing**: Use spacing tokens (xs, sm, base, md, lg)
4. **Smooth Transitions**: 200-300ms durations for interactive elements
5. **Color Consistency**: Blue-based primary actions, gray for neutrals

## Examples

### Example 1: Displaying Analytics for Specific Time Range

```typescript
function AnalyticsReport() {
  const { getTimeStats, getDayAggregates } = usePlannerStore();
  
  const stats = getTimeStats();
  const dailyData = getDayAggregates(7); // Last 7 days
  
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <h3>Last 7 Days Summary</h3>
        <p>Total: {(stats.last7Days / 3600).toFixed(1)}h</p>
        <p>Average: {(stats.averagePerDay7 / 3600).toFixed(1)}h/day</p>
      </div>
      
      {dailyData.map(day => (
        <div key={day.date} className="flex justify-between">
          <span>{day.date}</span>
          <span>{(day.totalDuration / 3600).toFixed(1)}h</span>
        </div>
      ))}
    </div>
  );
}
```

### Example 2: Custom Analytics Component

```typescript
import { usePlannerStore } from './store/plannerStore';

function CustomAnalytics() {
  const { getTimeStats } = usePlannerStore();
  const stats = getTimeStats();
  
  return (
    <div className="grid grid-cols-4 gap-4">
      <StatCard 
        label="Today" 
        value={`${(stats.today / 3600).toFixed(1)}h`}
      />
      <StatCard 
        label="7 Days" 
        value={`${(stats.last7Days / 3600).toFixed(1)}h`}
      />
      <StatCard 
        label="30 Days" 
        value={`${(stats.last30Days / 3600).toFixed(1)}h`}
      />
      <StatCard 
        label="Avg/Day (7d)" 
        value={`${(stats.averagePerDay7 / 3600).toFixed(1)}h`}
      />
    </div>
  );
}
```

## Performance Considerations

1. **Data Aggregation**: `getDayAggregates()` and `getTimeStats()` are computed on-demand
2. **Memoization**: Consider memoizing expensive calculations in custom components
3. **Chart Rendering**: Recharts efficiently handles large datasets (tested up to 30 days)
4. **Modal Animation**: CSS transitions are GPU-accelerated for smooth 60fps performance

## Accessibility

- Modal includes ARIA labels for screen readers
- Keyboard navigation (ESC to close)
- Color contrast meets WCAG AA standards
- Buttons have proper `aria-label` attributes
- Form controls are properly labeled

## Browser Support

- Chrome/Edge: 90+
- Firefox: 88+
- Safari: 14+
- Mobile browsers: Modern iOS Safari and Chrome Mobile

## Troubleshooting

### No Data Appears in Charts

1. Check that time logs exist:
```typescript
const allLogs = usePlannerStore.getState().getAllTimeLogs();
console.log('Time logs:', allLogs);
```

2. Verify localStorage is enabled:
```typescript
const stored = localStorage.getItem('planner-storage');
console.log('Stored data:', stored);
```

### Modal Not Appearing

1. Ensure `isOpen` prop is `true`
2. Check z-index conflicts (modal uses z-50)
3. Verify backdrop click handler is working

### Chart Not Responsive

1. Check parent container width
2. Ensure ResponsiveContainer is rendered correctly
3. Verify Recharts is properly installed

## Future Enhancements

- Export analytics data (CSV, PDF)
- Custom date range picker
- Weekly/monthly views
- Item-specific analytics drill-down
- Goal tracking and progress indicators
- Comparison with previous periods
