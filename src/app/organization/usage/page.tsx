'use client';

import {
  PageHeader,
  StatCard,
  ChartCard,
  LineChartPlaceholder,
  BarChartPlaceholder,
  DonutChartPlaceholder,
} from '@/components/dashboard';
import { Activity, Zap, Clock, AlertTriangle, Download, Calendar } from 'lucide-react';
import { routes } from '@/lib/routes';

export default function OrganizationUsagePage() {
  return (
    <>
      <PageHeader
        title="Usage & Monitoring"
        description="Monitor your API usage, performance, and quotas"
        breadcrumbs={[
          { label: 'Dashboard', href: routes.dashboard('organization') },
          { label: 'Usage' },
        ]}
        actions={
          <div className="flex items-center gap-3">
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
              <option>Custom range</option>
            </select>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        }
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total API Calls"
          value="1.2M"
          change="+24% from last period"
          changeType="positive"
          icon={Activity}
          iconColor="primary"
        />
        <StatCard
          title="Avg Response Time"
          value="142ms"
          change="-12ms improvement"
          changeType="positive"
          icon={Zap}
          iconColor="green"
        />
        <StatCard
          title="Uptime"
          value="99.98%"
          change="Last 30 days"
          changeType="neutral"
          icon={Clock}
          iconColor="blue"
        />
        <StatCard
          title="Error Rate"
          value="0.08%"
          change="Below 1% threshold"
          changeType="positive"
          icon={AlertTriangle}
          iconColor="orange"
        />
      </div>

      {/* Quota Usage */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Quota Usage</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">API Calls</span>
              <span className="text-sm text-gray-500">1.2M / 2M</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-primary-500 rounded-full" style={{ width: '60%' }} />
            </div>
            <p className="text-xs text-gray-500 mt-2">60% used • Resets in 15 days</p>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Storage</span>
              <span className="text-sm text-gray-500">4.2GB / 10GB</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: '42%' }} />
            </div>
            <p className="text-xs text-gray-500 mt-2">42% used</p>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Bandwidth</span>
              <span className="text-sm text-gray-500">85GB / 100GB</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full" style={{ width: '85%' }} />
            </div>
            <p className="text-xs text-gray-500 mt-2">85% used • Consider upgrading</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ChartCard
          title="API Traffic Over Time"
          subtitle="Requests per hour"
        >
          <LineChartPlaceholder />
        </ChartCard>

        <ChartCard
          title="Response Time Distribution"
          subtitle="Latency percentiles"
        >
          <BarChartPlaceholder />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Requests by Status Code"
          subtitle="Success vs Error responses"
        >
          <DonutChartPlaceholder />
        </ChartCard>

        <ChartCard
          title="Top Endpoints"
          subtitle="Most frequently called APIs"
        >
          <BarChartPlaceholder />
        </ChartCard>
      </div>
    </>
  );
}
