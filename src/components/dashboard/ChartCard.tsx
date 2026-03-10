'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function ChartCard({ title, subtitle, children, action, className }: ChartCardProps) {
  return (
    <div className={cn('bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6', className)}>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          {subtitle && <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className="min-h-[240px]">{children}</div>
    </div>
  );
}

// Placeholder Chart Components
export function AreaChartPlaceholder() {
  return (
    <div className="w-full h-60 flex items-end justify-between gap-2 px-4">
      {[40, 65, 45, 80, 55, 70, 45, 60, 75, 50, 85, 65].map((height, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full bg-gradient-to-t from-primary-500 to-primary-300 rounded-t-sm opacity-80 hover:opacity-100 transition-opacity"
            style={{ height: `${height}%` }}
          />
          <span className="text-xs text-gray-400 dark:text-slate-500">
            {['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][i]}
          </span>
        </div>
      ))}
    </div>
  );
}

export function BarChartPlaceholder() {
  const data = [
    { label: 'API A', value: 85, color: 'bg-primary-500' },
    { label: 'API B', value: 65, color: 'bg-blue-500' },
    { label: 'API C', value: 45, color: 'bg-emerald-500' },
    { label: 'API D', value: 75, color: 'bg-orange-500' },
    { label: 'API E', value: 55, color: 'bg-purple-500' },
  ];

  return (
    <div className="space-y-4">
      {data.map((item) => (
        <div key={item.label} className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-slate-400">{item.label}</span>
            <span className="font-medium text-gray-900 dark:text-white">{item.value}%</span>
          </div>
          <div className="h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all duration-500', item.color)}
              style={{ width: `${item.value}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function DonutChartPlaceholder() {
  return (
    <div className="flex items-center justify-center gap-8">
      <div className="relative w-40 h-40">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="none" stroke="#f3f4f6" strokeWidth="12" className="dark:stroke-slate-700" />
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="#0ea5e9"
            strokeWidth="12"
            strokeDasharray="251.2"
            strokeDashoffset="62.8"
            className="transition-all duration-500"
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="#10b981"
            strokeWidth="12"
            strokeDasharray="251.2"
            strokeDashoffset="188.4"
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">75%</p>
            <p className="text-xs text-gray-500 dark:text-slate-400">Success</p>
          </div>
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-sky-500" />
          <span className="text-sm text-gray-600 dark:text-slate-400">Success (75%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
          <span className="text-sm text-gray-600 dark:text-slate-400">Pending (15%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gray-200 dark:bg-slate-600" />
          <span className="text-sm text-gray-600 dark:text-slate-400">Failed (10%)</span>
        </div>
      </div>
    </div>
  );
}

export function LineChartPlaceholder() {
  return (
    <div className="relative w-full h-60">
      <svg className="w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
        {/* Grid lines */}
        {[0, 1, 2, 3, 4].map((i) => (
          <line
            key={i}
            x1="0"
            y1={i * 50}
            x2="400"
            y2={i * 50}
            stroke="#f3f4f6"
            strokeWidth="1"
            className="dark:stroke-slate-700"
          />
        ))}
        {/* Line 1 */}
        <path
          d="M0,150 Q50,120 100,130 T200,100 T300,80 T400,60"
          fill="none"
          stroke="#0ea5e9"
          strokeWidth="3"
          className="drop-shadow-sm"
        />
        {/* Line 2 */}
        <path
          d="M0,180 Q50,160 100,170 T200,140 T300,120 T400,100"
          fill="none"
          stroke="#10b981"
          strokeWidth="3"
          className="drop-shadow-sm"
        />
        {/* Dots */}
        <circle cx="100" cy="130" r="4" fill="#0ea5e9" />
        <circle cx="200" cy="100" r="4" fill="#0ea5e9" />
        <circle cx="300" cy="80" r="4" fill="#0ea5e9" />
        <circle cx="400" cy="60" r="4" fill="#0ea5e9" />
      </svg>
    </div>
  );
}
