'use client';

import Link from 'next/link';
import {
  PageHeader,
  StatCard,
  ChartCard,
  AreaChartPlaceholder,
  DonutChartPlaceholder,
  ActivityItem,
  QuickAction,
} from '@/components/dashboard';
import { Package, FileText, CheckCircle, Clock, Plus, Send, FileQuestion, Bell, Sparkles, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/components/LanguageProvider';
import { t } from '@/i18n/i18n';

export default function IndividualDashboardPage() {
  const { language } = useLanguage();
  const prefix = 'dashboard.pages.individual.dashboard';

  return (
    <>
      <PageHeader
        title={t(language, `${prefix}.title`)}
        description={t(language, `${prefix}.description`)}
      />

      {/* Getting Started Banner */}
      <Link
        href="/individual/getting-started"
        className="block mb-8 p-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl text-white hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg shadow-blue-200 dark:shadow-blue-900/30"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{t(language, `${prefix}.gettingStartedTitle`)}</h3>
              <p className="text-blue-100 text-sm">{t(language, `${prefix}.gettingStartedDesc`)}</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5" />
        </div>
      </Link>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title={t(language, `${prefix}.activeServices`)}
          value={12}
          change={t(language, `${prefix}.thisMonth`)}
          changeType="positive"
          icon={Package}
          iconColor="primary"
        />
        <StatCard
          title={t(language, `${prefix}.totalRequests`)}
          value={48}
          change={t(language, `${prefix}.thisWeek`)}
          changeType="positive"
          icon={FileText}
          iconColor="blue"
        />
        <StatCard
          title={t(language, `${prefix}.approved`)}
          value={42}
          change={t(language, `${prefix}.approvalRate`)}
          changeType="neutral"
          icon={CheckCircle}
          iconColor="green"
        />
        <StatCard
          title={t(language, `${prefix}.pending`)}
          value={6}
          change={t(language, `${prefix}.awaitingReview`)}
          changeType="neutral"
          icon={Clock}
          iconColor="orange"
        />
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t(language, `${prefix}.quickActions`)}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickAction
            icon={<Plus className="w-5 h-5" />}
            title={t(language, `${prefix}.newRequest`)}
            description={t(language, `${prefix}.newRequestDesc`)}
          />
          <QuickAction
            icon={<Send className="w-5 h-5" />}
            title={t(language, `${prefix}.trackRequest`)}
            description={t(language, `${prefix}.trackRequestDesc`)}
          />
          <QuickAction
            icon={<FileQuestion className="w-5 h-5" />}
            title={t(language, `${prefix}.getHelp`)}
            description={t(language, `${prefix}.getHelpDesc`)}
          />
          <QuickAction
            icon={<Bell className="w-5 h-5" />}
            title={t(language, `${prefix}.notifications`)}
            description={t(language, `${prefix}.notificationsDesc`)}
          />
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ChartCard
          title={t(language, `${prefix}.requestActivity`)}
          subtitle={t(language, `${prefix}.requestActivityDesc`)}
        >
          <AreaChartPlaceholder />
        </ChartCard>

        <ChartCard
          title={t(language, `${prefix}.requestStatus`)}
          subtitle={t(language, `${prefix}.requestStatusDesc`)}
        >
          <DonutChartPlaceholder />
        </ChartCard>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
        <div className="p-6 border-b border-gray-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t(language, `${prefix}.recentActivity`)}</h3>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{t(language, `${prefix}.recentActivityDesc`)}</p>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-slate-700">
          <ActivityItem
            icon={<CheckCircle className="w-5 h-5 text-emerald-500" />}
            title={t(language, `${prefix}.requestApproved`)}
            description={t(language, `${prefix}.requestApprovedDesc`)}
            time={`2 ${t(language, `${prefix}.hoursAgo`)}`}
          />
          <ActivityItem
            icon={<FileText className="w-5 h-5 text-blue-500" />}
            title={t(language, `${prefix}.newRequestSubmitted`)}
            description={t(language, `${prefix}.newRequestSubmittedDesc`)}
            time={`5 ${t(language, `${prefix}.hoursAgo`)}`}
          />
          <ActivityItem
            icon={<Package className="w-5 h-5 text-purple-500" />}
            title={t(language, `${prefix}.serviceActivated`)}
            description={t(language, `${prefix}.serviceActivatedDesc`)}
            time={`1 ${t(language, `${prefix}.dayAgo`)}`}
          />
          <ActivityItem
            icon={<Bell className="w-5 h-5 text-orange-500" />}
            title={t(language, `${prefix}.systemNotification`)}
            description={t(language, `${prefix}.systemNotificationDesc`)}
            time={`2 ${t(language, `${prefix}.daysAgo`)}`}
          />
        </div>
      </div>
    </>
  );
}
