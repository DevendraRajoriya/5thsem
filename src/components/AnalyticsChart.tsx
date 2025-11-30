import { useState } from 'react';
import {
  Bar,
  Line,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { usePlannerStore } from '../store/plannerStore';
import { DayAggregate } from '../store/types';
import { cn } from '../utils/cn';
import { BUTTON_STYLES, CARD_STYLES, SHADOW_TOKENS, SPACING_TOKENS } from '../utils/tailwindUtils';

interface AnalyticsChartProps {
  className?: string;
}

type DateRange = '7d' | '30d';

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

const AnalyticsChart: React.FC<AnalyticsChartProps> = ({ className }) => {
  const [dateRange, setDateRange] = useState<DateRange>('7d');
  const { getTimeStats, getDayAggregates } = usePlannerStore();

  const stats = getTimeStats();
  const daysToShow = dateRange === '7d' ? 7 : 30;
  const dayAggregates = getDayAggregates(daysToShow);

  // Transform data for Recharts
  const chartData = dayAggregates
    .slice(-daysToShow)
    .map((aggregate: DayAggregate) => {
      const date = parseISO(aggregate.date);
      return {
        date: aggregate.date,
        displayDate: format(date, 'MMM d'),
        totalDuration: aggregate.totalDuration,
        itemCount: aggregate.itemCount,
        totalHours: formatDurationHours(aggregate.totalDuration),
      };
    });

  // Calculate average for the selected range
  const totalDuration = dateRange === '7d' ? stats.last7Days : stats.last30Days;
  const averageDaily = dateRange === '7d' ? stats.averagePerDay7 : stats.averagePerDay30;
  const totalHours = formatDurationHours(totalDuration);
  const averageHours = formatDurationHours(averageDaily);

  // Custom tooltip for chart
  const renderTooltip = (props: unknown) => {
    const typedProps = props as { payload?: Array<{ payload: unknown }> };
    if (!typedProps.payload || typedProps.payload.length === 0) return null;
    const data = typedProps.payload[0].payload as {
      displayDate: string;
      totalDuration: number;
      itemCount: number;
    };
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
        <p className="font-medium text-gray-900">{data.displayDate}</p>
        <p className="text-sm text-gray-600">
          Focus: {formatTooltipTime(data.totalDuration)}
        </p>
        <p className="text-sm text-gray-600">Tasks: {data.itemCount}</p>
      </div>
    );
  };

  return (
    <div className={cn(SPACING_TOKENS.md, className)}>
      {/* Range Selector with smooth button transitions */}
      <div className="flex space-x-2">
        <button
          onClick={() => setDateRange('7d')}
          className={cn(
            'px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200',
            dateRange === '7d'
              ? cn(BUTTON_STYLES.primary, SHADOW_TOKENS.soft)
              : BUTTON_STYLES.secondary
          )}
        >
          Last 7 Days
        </button>
        <button
          onClick={() => setDateRange('30d')}
          className={cn(
            'px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200',
            dateRange === '30d'
              ? cn(BUTTON_STYLES.primary, SHADOW_TOKENS.soft)
              : BUTTON_STYLES.secondary
          )}
        >
          Last 30 Days
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200 shadow-sm">
          <p className="text-sm font-medium text-blue-700 mb-1">Total Focus Time</p>
          <p className="text-2xl font-bold text-blue-900">{totalHours}h</p>
          <p className="text-xs text-blue-600 mt-1">
            {formatTooltipTime(totalDuration)}
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200 shadow-sm">
          <p className="text-sm font-medium text-purple-700 mb-1">Daily Average</p>
          <p className="text-2xl font-bold text-purple-900">{averageHours}h</p>
          <p className="text-xs text-purple-600 mt-1">
            {formatTooltipTime(averageDaily)}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className={cn(CARD_STYLES.base, SHADOW_TOKENS.soft, 'p-6')}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Focus Time Trend</h3>
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-80 text-gray-400">
            <p>No data available for this period</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={chartData}>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.2} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="displayDate"
                tick={{ fill: '#6b7280', fontSize: 12 }}
                stroke="#d1d5db"
              />
              <YAxis
                yAxisId="left"
                tick={{ fill: '#6b7280', fontSize: 12 }}
                stroke="#d1d5db"
                label={{ value: 'Duration (seconds)', angle: -90, position: 'insideLeft' }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fill: '#6b7280', fontSize: 12 }}
                stroke="#d1d5db"
                label={{ value: 'Item Count', angle: 90, position: 'insideRight' }}
              />
              <Tooltip content={renderTooltip} />
              <Legend />
              <Bar
                yAxisId="left"
                dataKey="totalDuration"
                fill="url(#barGradient)"
                name="Focus Time (seconds)"
                radius={[4, 4, 0, 0]}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="itemCount"
                stroke="#a855f7"
                strokeWidth={2}
                name="Tasks Completed"
                dot={{ fill: '#a855f7', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Footer stats */}
      <div className={cn(CARD_STYLES.base, 'bg-gray-50 p-4')}>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Total Focus Today</p>
            <p className="font-semibold text-gray-900">{formatTooltipTime(stats.today)}</p>
          </div>
          <div>
            <p className="text-gray-600">Best Day</p>
            <p className="font-semibold text-gray-900">
              {chartData.length > 0
                ? formatTooltipTime(
                    Math.max(...chartData.map((d) => d.totalDuration), 0)
                  )
                : '—'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsChart;
