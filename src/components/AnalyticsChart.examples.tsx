/**
 * Analytics Chart Examples
 * 
 * This file demonstrates various ways to use the AnalyticsChart component
 * and work with focus time analytics in the application.
 */

import { useState } from 'react';
import AnalyticsChart from './AnalyticsChart';
import AnalyticsModal from './AnalyticsModal';
import { usePlannerStore } from '../store/plannerStore';
import { cn } from '../utils/cn';
import { CARD_STYLES, SHADOW_TOKENS, BADGE_STYLES } from '../utils/tailwindUtils';

/**
 * Example 1: Basic Chart in Modal
 * 
 * Shows how to integrate the analytics modal with a button in the dashboard
 */
export function AnalyticsModalExample() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
      >
        View Analytics
      </button>

      <AnalyticsModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
}

/**
 * Example 2: Standalone Chart
 * 
 * Render the chart directly without modal wrapper
 */
export function StandaloneChartExample() {
  return (
    <div className={cn(CARD_STYLES.base, SHADOW_TOKENS.soft, 'p-6')}>
      <h2 className="text-2xl font-bold mb-4 text-gray-900">Focus Analytics</h2>
      <AnalyticsChart />
    </div>
  );
}

/**
 * Example 3: Statistics Dashboard
 * 
 * Display detailed statistics with custom formatting
 */
export function StatisticsDashboardExample() {
  const { getTimeStats } = usePlannerStore();
  const stats = getTimeStats();

  const formatHours = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {/* Today's Focus Time */}
        <div className={cn(CARD_STYLES.base, 'p-4')}>
          <p className="text-sm text-gray-600 mb-2">Today</p>
          <p className="text-2xl font-bold text-blue-600">
            {formatHours(stats.today)}
          </p>
        </div>

        {/* 7-Day Average */}
        <div className={cn(CARD_STYLES.base, 'p-4')}>
          <p className="text-sm text-gray-600 mb-2">7-Day Avg</p>
          <p className="text-2xl font-bold text-purple-600">
            {formatHours(stats.averagePerDay7)}
          </p>
        </div>

        {/* Last 7 Days Total */}
        <div className={cn(CARD_STYLES.base, 'p-4')}>
          <p className="text-sm text-gray-600 mb-2">Last 7 Days</p>
          <p className="text-2xl font-bold text-green-600">
            {formatHours(stats.last7Days)}
          </p>
        </div>

        {/* Last 30 Days Total */}
        <div className={cn(CARD_STYLES.base, 'p-4')}>
          <p className="text-sm text-gray-600 mb-2">Last 30 Days</p>
          <p className="text-2xl font-bold text-orange-600">
            {formatHours(stats.last30Days)}
          </p>
        </div>
      </div>

      {/* Daily breakdown */}
      <div className={cn(CARD_STYLES.base, 'p-6')}>
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Daily Breakdown (Last 7 Days)</h3>
        <DailyBreakdownList daysToShow={7} />
      </div>
    </div>
  );
}

/**
 * Example 4: Daily Breakdown List
 * 
 * Component showing day-by-day statistics
 */
function DailyBreakdownList({ daysToShow = 7 }: { daysToShow?: number }) {
  const { getDayAggregates } = usePlannerStore();
  const dailyData = getDayAggregates(daysToShow);

  const formatHours = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      weekday: 'short',
    });
  };

  return (
    <div className="space-y-3">
      {dailyData.slice(-daysToShow).map((day) => (
        <div
          key={day.date}
          className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <div className="flex-1">
            <p className="font-medium text-gray-900">{formatDate(day.date)}</p>
            <p className="text-sm text-gray-500">{day.itemCount} tasks</p>
          </div>
          <div className="text-right">
            <p className="font-semibold text-blue-600">{formatHours(day.totalDuration)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Example 5: Performance Goal Tracker
 * 
 * Track if user is meeting daily focus time goals
 */
export function PerformanceGoalTrackerExample() {
  const { getTimeStats } = usePlannerStore();
  const stats = getTimeStats();
  const dailyGoal = 4 * 3600; // 4 hours in seconds

  const formatHours = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const todayProgress = (stats.today / dailyGoal) * 100;
  const weeklyAverageProgress = (stats.averagePerDay7 / dailyGoal) * 100;

  const getStatusBadge = (progress: number) => {
    if (progress >= 100) return BADGE_STYLES.success;
    if (progress >= 75) return BADGE_STYLES.primary;
    if (progress >= 50) return BADGE_STYLES.warning;
    return BADGE_STYLES.error;
  };

  return (
    <div className="space-y-6">
      {/* Daily Goal */}
      <div className={cn(CARD_STYLES.base, 'p-6')}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Daily Focus Goal</h3>
            <p className="text-sm text-gray-600">Target: {formatHours(dailyGoal)}</p>
          </div>
          <span className={cn(BADGE_STYLES.primary, 'px-3 py-1')}>
            {Math.round(todayProgress)}%
          </span>
        </div>
        <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="bg-blue-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(todayProgress, 100)}%` }}
          />
        </div>
        <p className="text-sm text-gray-600 mt-3">
          {formatHours(stats.today)} of {formatHours(dailyGoal)}
        </p>
      </div>

      {/* Weekly Average */}
      <div className={cn(CARD_STYLES.base, 'p-6')}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Weekly Average</h3>
            <p className="text-sm text-gray-600">Target: {formatHours(dailyGoal)} per day</p>
          </div>
          <span className={cn(getStatusBadge(weeklyAverageProgress), 'px-3 py-1')}>
            {Math.round(weeklyAverageProgress)}%
          </span>
        </div>
        <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="bg-purple-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(weeklyAverageProgress, 100)}%` }}
          />
        </div>
        <p className="text-sm text-gray-600 mt-3">
          {formatHours(stats.averagePerDay7)} average per day
        </p>
      </div>
    </div>
  );
}

/**
 * Example 6: Time Stats Summary Card
 * 
 * Compact summary for use in dashboards or sidebars
 */
export function TimeStatsSummaryExample() {
  const { getTimeStats } = usePlannerStore();
  const stats = getTimeStats();

  const formatHours = (seconds: number): number => {
    return Math.round((seconds / 3600) * 10) / 10;
  };

  return (
    <div className={cn(CARD_STYLES.base, SHADOW_TOKENS.soft, 'p-4 space-y-3')}>
      <h3 className="font-semibold text-gray-900">Focus Time</h3>

      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">Today</span>
        <span className="font-semibold text-blue-600">{formatHours(stats.today)}h</span>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">This Week</span>
        <span className="font-semibold text-purple-600">{formatHours(stats.last7Days)}h</span>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">This Month</span>
        <span className="font-semibold text-green-600">{formatHours(stats.last30Days)}h</span>
      </div>

      <div className="border-t border-gray-200 pt-3 flex items-center justify-between text-sm">
        <span className="text-gray-600">Daily Avg (7d)</span>
        <span className="font-semibold text-gray-900">{formatHours(stats.averagePerDay7)}h</span>
      </div>
    </div>
  );
}

/**
 * Example 7: Comprehensive Analytics Dashboard
 * 
 * Full-featured analytics page combining multiple components
 */
export function ComprehensiveAnalyticsDashboardExample() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="space-y-8 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-1">Track your focus time and productivity</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          View Detailed Chart
        </button>
      </div>

      {/* Statistics Cards */}
      <StatisticsDashboardExample />

      {/* Performance Goals */}
      <PerformanceGoalTrackerExample />

      {/* Daily Breakdown */}
      <div className={cn(CARD_STYLES.base, 'p-6')}>
        <h2 className="text-lg font-semibold mb-4 text-gray-900">Recent Activity</h2>
        <DailyBreakdownList daysToShow={14} />
      </div>

      {/* Modal */}
      <AnalyticsModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
}

/**
 * Example 8: Real-time Focus Timer Summary
 * 
 * Display current session and session summary
 */
export function RealTimeFocusSummaryExample() {
  const { getTimeStats } = usePlannerStore();
  const stats = getTimeStats();

  const formatHours = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Today's Session */}
      <div className={cn(CARD_STYLES.interactive)}>
        <div className="p-4">
          <p className="text-xs font-semibold text-blue-600 uppercase mb-1">Today</p>
          <p className="text-3xl font-bold text-gray-900">{formatHours(stats.today)}</p>
          <div className="mt-3 w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full"
              style={{ width: '65%' }}
            />
          </div>
        </div>
      </div>

      {/* This Week */}
      <div className={cn(CARD_STYLES.interactive)}>
        <div className="p-4">
          <p className="text-xs font-semibold text-purple-600 uppercase mb-1">This Week</p>
          <p className="text-3xl font-bold text-gray-900">{formatHours(stats.last7Days)}</p>
          <div className="mt-3 w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-500 rounded-full"
              style={{ width: '55%' }}
            />
          </div>
        </div>
      </div>

      {/* Daily Average */}
      <div className={cn(CARD_STYLES.interactive)}>
        <div className="p-4">
          <p className="text-xs font-semibold text-green-600 uppercase mb-1">Daily Avg</p>
          <p className="text-3xl font-bold text-gray-900">{formatHours(stats.averagePerDay7)}</p>
          <div className="mt-3 w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full"
              style={{ width: '70%' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
