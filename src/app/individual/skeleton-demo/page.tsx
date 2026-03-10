'use client';

import { useState } from 'react';
import { Package, FileText, CheckCircle, Clock } from 'lucide-react';
import { PageHeader, StatCard } from '@/components/dashboard';
import {
  Skeleton,
  SkeletonText,
  SkeletonAvatar,
  SkeletonCard,
  SkeletonStatCard,
  SkeletonSidebarUser,
  SkeletonSettingRow,
  SkeletonAccountSettings,
  SkeletonDashboard,
} from '@/components/ui/Skeleton';

export default function SkeletonDemoPage() {
  const [showSkeleton, setShowSkeleton] = useState(true);

  return (
    <>
      <PageHeader
        title="Skeleton Loading Demo"
        description="ตัวอย่าง CSS animated loading skeleton ทุกแบบ"
      />

      {/* Toggle Button */}
      <div className="mb-8">
        <button
          onClick={() => setShowSkeleton(!showSkeleton)}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          {showSkeleton ? 'Show Real Content' : 'Show Skeleton'}
        </button>
      </div>

      {/* Basic Skeletons */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Basic Skeletons</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
            <h3 className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-3">Text Line</h3>
            <Skeleton className="h-4 w-full" />
          </div>
          <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
            <h3 className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-3">Multiple Lines</h3>
            <SkeletonText lines={3} />
          </div>
          <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
            <h3 className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-3">Avatar Sizes</h3>
            <div className="flex items-end gap-3">
              <SkeletonAvatar size="sm" />
              <SkeletonAvatar size="md" />
              <SkeletonAvatar size="lg" />
              <SkeletonAvatar size="xl" />
            </div>
          </div>
          <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
            <h3 className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-3">Custom Shapes</h3>
            <div className="space-y-2">
              <Skeleton className="h-8 w-32 rounded-full" />
              <Skeleton className="h-6 w-24 rounded" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </section>

      {/* Sidebar User */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Sidebar User Info</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-gray-50 dark:bg-slate-900 rounded-xl">
            <h3 className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-3">Expanded</h3>
            <SkeletonSidebarUser isCollapsed={false} />
          </div>
          <div className="p-4 bg-gray-50 dark:bg-slate-900 rounded-xl">
            <h3 className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-3">Collapsed</h3>
            <SkeletonSidebarUser isCollapsed={true} />
          </div>
        </div>
      </section>

      {/* StatCard Loading */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">StatCard Loading</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {showSkeleton ? (
            <>
              <SkeletonStatCard />
              <SkeletonStatCard />
              <SkeletonStatCard />
              <SkeletonStatCard />
            </>
          ) : (
            <>
              <StatCard
                title="Active Services"
                value={12}
                change="This month"
                changeType="positive"
                icon={Package}
                iconColor="primary"
              />
              <StatCard
                title="Total Requests"
                value={48}
                change="This week"
                changeType="positive"
                icon={FileText}
                iconColor="blue"
              />
              <StatCard
                title="Approved"
                value={42}
                change="87.5% rate"
                changeType="neutral"
                icon={CheckCircle}
                iconColor="green"
              />
              <StatCard
                title="Pending"
                value={6}
                change="Awaiting review"
                changeType="neutral"
                icon={Clock}
                iconColor="orange"
              />
            </>
          )}
        </div>
      </section>

      {/* Cards */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Card Skeletons</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SkeletonCard />
          <SkeletonStatCard />
          <div className="p-5 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
            <h3 className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-3">Setting Rows</h3>
            <SkeletonSettingRow />
            <SkeletonSettingRow />
          </div>
        </div>
      </section>

      {/* Full Page Skeletons */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Account Settings Page</h2>
        <div className="p-6 bg-gray-100 dark:bg-slate-900 rounded-xl">
          <SkeletonAccountSettings />
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Dashboard Page</h2>
        <div className="p-6 bg-gray-100 dark:bg-slate-900 rounded-xl">
          <SkeletonDashboard />
        </div>
      </section>
    </>
  );
}
