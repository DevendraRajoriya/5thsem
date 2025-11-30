# 5thsem

A modern React application scaffolded with Vite, TypeScript, Tailwind CSS, and essential development tools.

## Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with PostCSS and Autoprefixer
- **Linting**: ESLint with TypeScript support
- **Formatting**: Prettier
- **State Management**: Zustand
- **Icons**: Lucide React
- **Charts**: Recharts
- **Date Utilities**: date-fns
- **Drag & Drop**: @dnd-kit
- **Utilities**: classnames, clsx, tailwind-merge

## Project Structure

```
src/
├── components/          # Reusable React components
├── hooks/              # Custom React hooks
├── store/              # Zustand state management
├── utils/              # Utility functions
├── styles/             # Global CSS and Tailwind configuration
├── App.tsx             # Main App component (business-logic-free)
└── main.tsx            # Application entry point
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production (includes TypeScript compilation)
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint to check for code issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting without modifying files

## Development Guidelines

### Components

- Keep components in `src/components/`
- Use TypeScript for type safety
- Follow the existing naming conventions
- Components should be self-contained and reusable

### State Management

- Use Zustand for global state management (see `src/store/appStore.ts`)
- Keep local state in components when appropriate
- Use custom hooks for complex state logic

#### Planner Store

The application includes a comprehensive planner store (`src/store/plannerStore.ts`) for managing tasks and time tracking:

**Basic Usage:**

```typescript
import { usePlannerStore } from './store/plannerStore';

function MyComponent() {
  const { items, createItem, toggleStatus } = usePlannerStore();

  // Create a new task
  const handleCreateTask = () => {
    createItem({
      title: 'Complete project documentation',
      description: 'Write comprehensive docs',
      status: 'pending',
      priority: 'high',
      category: 'today',
      tags: ['documentation'],
    });
  };

  // Toggle task status
  const handleToggleStatus = (id: string) => {
    toggleStatus(id, 'completed');
  };

  return <div>/* Your UI */</div>;
}
```

**Features:**

- **CRUD Operations**: `createItem`, `updateItem`, `deleteItem`, `getItem`
- **Category Management**: Group items by `today`, `upcoming`, or `habits`
- **Status Toggles**: Track progress through `pending`, `in-progress`, `completed`, `archived`
- **Scheduling**: Set `scheduledDate` and `dueDate` with `updateSchedule`
- **Reordering**: Drag-and-drop support via `reorderItems`
- **Inline Editing**: Track edit state with `startEdit`, `commitEdit`, `cancelEdit`

**Time Logging:**

```typescript
const { startTimeLog, endTimeLog, getActiveTimeLog, getTimeStats } = usePlannerStore();

// Start tracking time
const log = startTimeLog(itemId, 'Working on task');

// End time log (calculates duration automatically)
endTimeLog(log.id);

// Check if item has active timer
const activeLog = getActiveTimeLog(itemId);

// Get analytics
const stats = getTimeStats();
console.log('Time today:', stats.today / 3600, 'hours');
console.log('Last 7 days:', stats.last7Days / 3600, 'hours');
console.log('Average per day:', stats.averagePerDay7 / 3600, 'hours');
```

**Analytics & Aggregates:**

```typescript
// Get day-by-day breakdown
const aggregates = getDayAggregates(30); // Last 30 days
aggregates.forEach(day => {
  console.log(`${day.date}: ${day.totalDuration}s across ${day.itemCount} items`);
});

// Get stats for specific item
const itemStats = getTimeStats(itemId);
console.log('Time on this item:', itemStats.byItem[itemId]);
```

**Persistence:**

All data is automatically persisted to localStorage using Zustand's persist middleware. Data syncs across browser tabs and survives page refreshes.

**Type Safety:**

All types are defined in `src/store/types.ts`:
- `PlannerItem`: Task/habit/event with status, priority, dates, tags, recurrence
- `TimeLog`: Time tracking entry with start/end times and duration
- `TimeStats`: Computed analytics for various time windows
- `DayAggregate`: Day-by-day time tracking summary

#### Timer Hook & Widget

The application includes a powerful timer system for tracking time on tasks:

**Basic Usage:**

```typescript
import { TimerWidget } from './components/TimerWidget';

// Standalone timer
<TimerWidget />

// Integrated with planner item
<TimerWidget plannerId={task.id} />

// Compact mode for inline use
<TimerWidget compact plannerId={task.id} />
```

**Features:**

- **Stopwatch Mode**: Count up from zero with precise tracking
- **Countdown Mode**: Set target duration (e.g., 25-minute Pomodoro)
- **Store Integration**: Automatically creates time logs when connected to planner items
- **Notes Support**: Add notes to time log entries
- **Progress Tracking**: Visual progress bar for countdown timers
- **Accessibility**: Full ARIA labels and keyboard navigation

**Using the Hook Directly:**

```typescript
import { useTimer } from './hooks/useTimer';

function CustomTimer() {
  const timer = useTimer({
    mode: 'countdown',
    targetDuration: 25 * 60, // 25 minutes in seconds
    onComplete: () => alert('Time is up!'),
  });

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

#### Analytics & Focus Tracking

The application includes a comprehensive analytics system for tracking focus time:

**Basic Usage:**

```typescript
import { usePlannerStore } from './store/plannerStore';

function MyComponent() {
  const { getTimeStats, getDayAggregates } = usePlannerStore();

  // Get overall statistics
  const stats = getTimeStats();
  console.log('Total today:', stats.today / 3600, 'hours');
  console.log('Last 7 days:', stats.last7Days / 3600, 'hours');
  console.log('Last 30 days:', stats.last30Days / 3600, 'hours');
  console.log('Daily average (7d):', stats.averagePerDay7 / 3600, 'hours');

  // Get day-by-day breakdown
  const dailyData = getDayAggregates(30); // Last 30 days
  dailyData.forEach(day => {
    console.log(`${day.date}: ${day.totalDuration / 3600}h across ${day.itemCount} items`);
  });

  return <div>/* Your UI */</div>;
}
```

**Components:**

- **AnalyticsChart**: Interactive chart with 7/30-day range selector and focus time trends
- **AnalyticsModal**: Modal wrapper with smooth animations for analytics display

**Features:**

- 7-day and 30-day range selection
- Combined bar/line chart visualization
- Total focus time and daily averages
- Custom tooltips with human-readable times
- Smooth modal animations and transitions
- Accessibility features (keyboard navigation, ARIA labels)

**Documentation:**

For comprehensive documentation, see:
- `docs/TIMER.md` - Timer widget API reference and usage guide
- `docs/ANALYTICS.md` - Complete analytics system documentation
- `src/components/TimerWidget.examples.tsx` - Live timer examples and demos

### Styling

- Use Tailwind CSS classes for styling
- Custom components are defined in `src/styles/globals.css`
- Follow the Notion-inspired theme (Inter font, light gray palette)
- Utilize smooth transitions and animations

#### Reusable Tailwind Utilities

The application includes reusable Tailwind utility classes in `src/utils/tailwindUtils.ts`:

```typescript
import { CARD_STYLES, BUTTON_STYLES, MODAL_STYLES, SHADOW_TOKENS, SPACING_TOKENS } from './utils/tailwindUtils';

// Card with soft shadow and subtle border
<div className={cn(CARD_STYLES.base, SHADOW_TOKENS.soft)} />

// Primary button with smooth transitions
<button className={BUTTON_STYLES.primary} />

// Modal with professional styling
<div className={MODAL_STYLES.backdrop} />
<div className={MODAL_STYLES.content} />
<div className={MODAL_STYLES.header} />
<div className={MODAL_STYLES.body} />

// Consistent spacing
<div className={SPACING_TOKENS.md}>
  {/* Items with consistent 1.5rem gaps */}
</div>

// Soft shadows for depth
<div className={SHADOW_TOKENS.subtle} />   {/* Subtle shadow */}
<div className={SHADOW_TOKENS.elevated} />  {/* Elevated shadow */}
<div className={SHADOW_TOKENS.modal} />     {/* Modal shadow */}
```

**Available Utilities:**

- `CARD_STYLES`: Base, hover, and interactive card styles
- `BUTTON_STYLES`: Primary, secondary, tertiary, and ghost button styles
- `INPUT_STYLES`: Form input styling (base, error, disabled)
- `MODAL_STYLES`: Modal container, header, body, and backdrop
- `BADGE_STYLES`: Status badges (primary, success, warning, error, neutral)
- `SPACING_TOKENS`: Consistent spacing presets (xs, sm, base, md, lg)
- `SHADOW_TOKENS`: Soft, subtle, medium, elevated, modal shadows
- `BORDER_TOKENS`: Subtle, soft, medium, strong border styles
- `TEXT_STYLES`: Typography presets (headings, body, labels)

### Code Quality

- All code must pass ESLint checks
- Use Prettier for consistent formatting
- Run `npm run lint` before committing changes
- Keep `App.tsx` business-logic-free - it should only render the shell layout

## Features

- ✅ TypeScript support with strict mode
- ✅ Tailwind CSS with custom Notion-inspired theme
- ✅ ESLint and Prettier pre-configured
- ✅ Hot module replacement in development
- ✅ Optimized production builds
- ✅ Component-based architecture
- ✅ Modern React patterns (hooks, functional components)
- ✅ Responsive design utilities
- ✅ Accessibility considerations

## Learn More

- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Zustand Documentation](https://docs.pmnd.rs/zustand/)