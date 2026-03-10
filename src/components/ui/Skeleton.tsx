'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

/**
 * Animated skeleton loading placeholder
 * Uses CSS shimmer animation for smooth loading effect
 */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded bg-gray-200 dark:bg-slate-700',
        'before:absolute before:inset-0',
        'before:translate-x-[-100%]',
        'before:animate-shimmer',
        'before:bg-gradient-to-r',
        'before:from-transparent before:via-white/60 dark:before:via-white/10 before:to-transparent',
        className
      )}
    />
  );
}

/**
 * Skeleton for text lines
 */
export function SkeletonText({ lines = 1, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            'h-4',
            i === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full'
          )}
        />
      ))}
    </div>
  );
}

/**
 * Skeleton for avatar/profile image
 */
export function SkeletonAvatar({ size = 'md', className }: { size?: 'sm' | 'md' | 'lg' | 'xl'; className?: string }) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  return (
    <Skeleton className={cn(sizeClasses[size], 'rounded-full', className)} />
  );
}

/**
 * Skeleton for cards
 */
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('p-4 rounded-xl bg-gray-50 dark:bg-slate-700/50', className)}>
      <div className="flex items-center gap-3 mb-4">
        <SkeletonAvatar size="sm" />
        <div className="flex-1">
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <SkeletonText lines={3} />
    </div>
  );
}

/**
 * Skeleton for stat/metric cards
 */
export function SkeletonStatCard({ className }: { className?: string }) {
  return (
    <div className={cn(
      'p-6 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700',
      className
    )}>
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
      <Skeleton className="h-8 w-24 mb-2" />
      <Skeleton className="h-3 w-16" />
    </div>
  );
}

/**
 * Skeleton for sidebar user info
 */
export function SkeletonSidebarUser({ isCollapsed = false }: { isCollapsed?: boolean }) {
  if (isCollapsed) {
    return <SkeletonAvatar size="md" />;
  }

  return (
    <div className="flex items-center gap-3">
      <SkeletonAvatar size="md" />
      <div className="flex-1 min-w-0">
        <Skeleton className="h-4 w-24 mb-1.5" />
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
  );
}

/**
 * Skeleton for settings row
 */
export function SkeletonSettingRow() {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-gray-200 dark:border-slate-600 last:border-0">
      <Skeleton className="w-10 h-10 rounded-lg" />
      <div className="flex-1">
        <Skeleton className="h-3 w-16 mb-2" />
        <Skeleton className="h-5 w-40" />
      </div>
      <Skeleton className="h-8 w-16 rounded" />
    </div>
  );
}

/**
 * Skeleton for account settings page
 */
export function SkeletonAccountSettings() {
  return (
    <div className="space-y-6 max-w-2xl">
      {/* Avatar Section */}
      <div className="p-5 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
        <Skeleton className="h-5 w-24 mb-1" />
        <Skeleton className="h-4 w-48 mb-4" />
        <div className="flex items-center gap-6">
          <SkeletonAvatar size="xl" />
          <div className="flex-1">
            <div className="flex gap-2 mb-2">
              <Skeleton className="h-10 w-36 rounded-lg" />
              <Skeleton className="h-10 w-24 rounded-lg" />
            </div>
            <Skeleton className="h-3 w-40" />
          </div>
        </div>
      </div>

      {/* Contact Info Section */}
      <div className="p-5 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
        <Skeleton className="h-5 w-32 mb-1" />
        <Skeleton className="h-4 w-56 mb-4" />
        <SkeletonSettingRow />
        <SkeletonSettingRow />
      </div>

      {/* Profile Info Section */}
      <div className="p-5 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
        <Skeleton className="h-5 w-28 mb-1" />
        <Skeleton className="h-4 w-48 mb-4" />
        <SkeletonSettingRow />
      </div>
    </div>
  );
}

/**
 * Skeleton for password settings page
 */
export function SkeletonPasswordSettings() {
  return (
    <div className="space-y-6 max-w-md">
      {/* Header */}
      <div>
        <Skeleton className="h-6 w-40 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        {/* Current Password */}
        <div>
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-11 w-full rounded-lg" />
        </div>

        {/* New Password */}
        <div>
          <Skeleton className="h-4 w-28 mb-2" />
          <Skeleton className="h-11 w-full rounded-lg" />
        </div>

        {/* Confirm Password */}
        <div>
          <Skeleton className="h-4 w-36 mb-2" />
          <Skeleton className="h-11 w-full rounded-lg" />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <Skeleton className="h-10 w-32 rounded-lg" />
        <Skeleton className="h-10 w-20 rounded-lg" />
      </div>
    </div>
  );
}

/**
 * Skeleton for MFA settings page
 */
export function SkeletonMFASettings() {
  return (
    <div className="space-y-6">
      {/* MFA Card */}
      <div className="p-6 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
        <div className="flex items-start gap-4">
          <Skeleton className="w-12 h-12 rounded-xl" />
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-4 w-72 mb-4" />
            <div className="flex gap-3">
              <Skeleton className="h-10 w-36 rounded-lg" />
              <Skeleton className="h-10 w-28 rounded-lg" />
            </div>
          </div>
        </div>
      </div>

      {/* Recovery Codes Card */}
      <div className="p-6 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
        <div className="flex items-start gap-4">
          <Skeleton className="w-12 h-12 rounded-xl" />
          <div className="flex-1">
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-64 mb-4" />
            <Skeleton className="h-10 w-40 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton for sessions settings page
 */
export function SkeletonSessionsSettings() {
  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-slate-700 pb-3">
        <Skeleton className="h-8 w-32 rounded-lg" />
        <Skeleton className="h-8 w-28 rounded-lg" />
      </div>

      {/* Sessions List */}
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <Skeleton className="w-10 h-10 rounded-lg" />
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Skeleton className="h-5 w-40" />
                    {i === 0 && <Skeleton className="h-5 w-16 rounded-full" />}
                  </div>
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              </div>
              {i !== 0 && <Skeleton className="h-8 w-20 rounded-lg" />}
            </div>
          </div>
        ))}
      </div>

      {/* Revoke All */}
      <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
        <Skeleton className="h-5 w-48" />
      </div>
    </div>
  );
}

/**
 * Skeleton for preferences settings page
 */
export function SkeletonPreferencesSettings() {
  return (
    <div className="space-y-8 max-w-2xl">
      {/* Theme Section */}
      <div className="space-y-4">
        <div>
          <Skeleton className="h-5 w-16 mb-1" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      </div>

      {/* Language Section */}
      <div className="space-y-4">
        <div>
          <Skeleton className="h-5 w-20 mb-1" />
          <Skeleton className="h-4 w-52" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      </div>

      {/* Timezone Section */}
      <div className="space-y-4">
        <div>
          <Skeleton className="h-5 w-24 mb-1" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-16 w-full rounded-lg" />
      </div>
    </div>
  );
}

/**
 * Skeleton for dashboard overview
 */
export function SkeletonDashboard() {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SkeletonStatCard />
        <SkeletonStatCard />
        <SkeletonStatCard />
        <SkeletonStatCard />
      </div>

      {/* Charts/Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
          <Skeleton className="h-5 w-32 mb-4" />
          <Skeleton className="h-48 w-full rounded-lg" />
        </div>
        <div className="p-6 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
          <Skeleton className="h-5 w-28 mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton for approvals page (stats + table)
 */
export function SkeletonApprovals() {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
            <Skeleton className="h-9 w-16 mx-auto mb-2" />
            <Skeleton className="h-4 w-24 mx-auto" />
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-wrap gap-4">
          <Skeleton className="h-11 w-48 rounded-lg" />
          <Skeleton className="h-11 w-36 rounded-lg" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Table Header */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-6 gap-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="px-6 py-4">
              <div className="grid grid-cols-6 gap-4 items-center">
                <Skeleton className="h-4 w-20" />
                <div>
                  <Skeleton className="h-4 w-32 mb-1" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <div>
                  <Skeleton className="h-4 w-28 mb-1" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-4 w-24" />
                <div className="flex gap-1">
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <Skeleton className="h-8 w-8 rounded-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
