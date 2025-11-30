import React from 'react';
import { TimerWidget } from './TimerWidget';

export const TimerWidgetExamples: React.FC = () => {
  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Timer Widget Examples</h1>
        <p className="text-gray-600">
          Demonstration of the TimerWidget component in various configurations
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">Basic Stopwatch</h2>
        <p className="text-gray-600 text-sm">
          Default configuration with stopwatch mode. Counts up from 00:00.
        </p>
        <TimerWidget initialMode="stopwatch" />
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">Countdown Timer</h2>
        <p className="text-gray-600 text-sm">
          Countdown mode with 25-minute default (Pomodoro technique). Shows progress bar and
          remaining time.
        </p>
        <TimerWidget initialMode="countdown" initialTarget={25 * 60} />
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">Compact Mode</h2>
        <p className="text-gray-600 text-sm mb-4">
          Minimal inline version suitable for task list items or toolbars.
        </p>
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-900">Example Task Item</span>
            <TimerWidget compact />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">With Planner Integration</h2>
        <p className="text-gray-600 text-sm">
          When connected to a planner item, the timer automatically creates time log entries in the
          store. This example shows the widget with a simulated planner item ID.
        </p>
        <TimerWidget
          plannerId="example-planner-item-123"
          onTimeLogComplete={(duration) => {
            console.log(`Time log completed: ${duration} seconds`);
          }}
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">Minimal Configuration</h2>
        <p className="text-gray-600 text-sm">
          Timer without mode toggle or settings panel - streamlined for single-purpose use.
        </p>
        <TimerWidget showModeToggle={false} showSettings={false} initialMode="stopwatch" />
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">Custom Countdown Duration</h2>
        <p className="text-gray-600 text-sm">
          15-minute countdown timer - perfect for short focused work sessions.
        </p>
        <TimerWidget initialMode="countdown" initialTarget={15 * 60} />
      </section>

      <section className="space-y-6 p-6 bg-white rounded-lg border border-gray-200">
        <h2 className="text-2xl font-semibold text-gray-900">Usage Guide</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Basic Import</h3>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto">
              <code>{`import { TimerWidget } from '@/components/TimerWidget';

function MyComponent() {
  return <TimerWidget />;
}`}</code>
            </pre>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">With Planner Integration</h3>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto">
              <code>{`import { TimerWidget } from '@/components/TimerWidget';

function TaskItem({ taskId }) {
  return (
    <TimerWidget 
      plannerId={taskId}
      onTimeLogComplete={(duration) => {
        console.log(\`Completed: \${duration}s\`);
      }}
    />
  );
}`}</code>
            </pre>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Compact Inline Timer</h3>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto">
              <code>{`import { TimerWidget } from '@/components/TimerWidget';

function InlineTimer() {
  return (
    <div className="flex items-center">
      <span>Work Session</span>
      <TimerWidget compact />
    </div>
  );
}`}</code>
            </pre>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Using the Hook Directly</h3>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto">
              <code>{`import { useTimer } from '@/hooks/useTimer';

function CustomTimer() {
  const timer = useTimer({
    mode: 'countdown',
    targetDuration: 25 * 60,
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
}`}</code>
            </pre>
          </div>
        </div>
      </section>

      <section className="space-y-4 p-6 bg-white rounded-lg border border-gray-200">
        <h2 className="text-2xl font-semibold text-gray-900">Props Reference</h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prop
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Default
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-4 py-3 text-sm font-mono text-gray-900">plannerId</td>
                <td className="px-4 py-3 text-sm text-gray-600">string?</td>
                <td className="px-4 py-3 text-sm text-gray-600">-</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  ID of the planner item to log time against
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-mono text-gray-900">initialMode</td>
                <td className="px-4 py-3 text-sm text-gray-600">TimerMode</td>
                <td className="px-4 py-3 text-sm text-gray-600">'stopwatch'</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  'stopwatch' or 'countdown'
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-mono text-gray-900">initialTarget</td>
                <td className="px-4 py-3 text-sm text-gray-600">number?</td>
                <td className="px-4 py-3 text-sm text-gray-600">-</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  Target duration in seconds for countdown mode
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-mono text-gray-900">showModeToggle</td>
                <td className="px-4 py-3 text-sm text-gray-600">boolean</td>
                <td className="px-4 py-3 text-sm text-gray-600">true</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  Show button to toggle between modes
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-mono text-gray-900">showSettings</td>
                <td className="px-4 py-3 text-sm text-gray-600">boolean</td>
                <td className="px-4 py-3 text-sm text-gray-600">true</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  Show settings button for countdown configuration
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-mono text-gray-900">compact</td>
                <td className="px-4 py-3 text-sm text-gray-600">boolean</td>
                <td className="px-4 py-3 text-sm text-gray-600">false</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  Use compact inline layout
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-mono text-gray-900">className</td>
                <td className="px-4 py-3 text-sm text-gray-600">string?</td>
                <td className="px-4 py-3 text-sm text-gray-600">-</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  Additional CSS classes
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-mono text-gray-900">onTimeLogComplete</td>
                <td className="px-4 py-3 text-sm text-gray-600">(duration: number) =&gt; void</td>
                <td className="px-4 py-3 text-sm text-gray-600">-</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  Callback when a time log is completed
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-4 p-6 bg-white rounded-lg border border-gray-200">
        <h2 className="text-2xl font-semibold text-gray-900">Hook API Reference</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">useTimer Configuration</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>
                <code className="text-sm bg-gray-100 px-2 py-1 rounded">mode</code> - 'stopwatch' or 'countdown'
              </li>
              <li>
                <code className="text-sm bg-gray-100 px-2 py-1 rounded">targetDuration</code> - Target duration in seconds
              </li>
              <li>
                <code className="text-sm bg-gray-100 px-2 py-1 rounded">onComplete</code> - Callback when countdown completes
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Returned State</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>
                <code className="text-sm bg-gray-100 px-2 py-1 rounded">elapsedSeconds</code> - Current elapsed time in seconds
              </li>
              <li>
                <code className="text-sm bg-gray-100 px-2 py-1 rounded">isRunning</code> - Whether timer is currently running
              </li>
              <li>
                <code className="text-sm bg-gray-100 px-2 py-1 rounded">isPaused</code> - Whether timer is paused
              </li>
              <li>
                <code className="text-sm bg-gray-100 px-2 py-1 rounded">mode</code> - Current timer mode
              </li>
              <li>
                <code className="text-sm bg-gray-100 px-2 py-1 rounded">targetDuration</code> - Target duration for countdown
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Actions</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>
                <code className="text-sm bg-gray-100 px-2 py-1 rounded">start()</code> - Start the timer
              </li>
              <li>
                <code className="text-sm bg-gray-100 px-2 py-1 rounded">pause()</code> - Pause the running timer
              </li>
              <li>
                <code className="text-sm bg-gray-100 px-2 py-1 rounded">resume()</code> - Resume a paused timer
              </li>
              <li>
                <code className="text-sm bg-gray-100 px-2 py-1 rounded">reset()</code> - Reset timer to zero
              </li>
              <li>
                <code className="text-sm bg-gray-100 px-2 py-1 rounded">setMode(mode)</code> - Change timer mode
              </li>
              <li>
                <code className="text-sm bg-gray-100 px-2 py-1 rounded">setTargetDuration(seconds)</code> - Set countdown target
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Formatters</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>
                <code className="text-sm bg-gray-100 px-2 py-1 rounded">getFormattedElapsed()</code> - Get formatted elapsed time
              </li>
              <li>
                <code className="text-sm bg-gray-100 px-2 py-1 rounded">getFormattedRemaining()</code> - Get formatted remaining time
              </li>
              <li>
                <code className="text-sm bg-gray-100 px-2 py-1 rounded">getRemainingSeconds()</code> - Get remaining seconds
              </li>
              <li>
                <code className="text-sm bg-gray-100 px-2 py-1 rounded">getProgressPercentage()</code> - Get completion percentage (0-100)
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TimerWidgetExamples;
