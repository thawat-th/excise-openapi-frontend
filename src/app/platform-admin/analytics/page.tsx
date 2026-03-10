'use client';

import { PageHeader, StatCard, ChartCard, AreaChartPlaceholder, BarChartPlaceholder, DonutChartPlaceholder } from '@/components/dashboard';
import { TrendingUp, Users, Globe, Zap, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const topAPIs = [
  { name: 'Tax Calculation API', calls: '1.2M', growth: '+12%', positive: true },
  { name: 'License Verification API', calls: '890K', growth: '+8%', positive: true },
  { name: 'Payment Gateway API', calls: '650K', growth: '+15%', positive: true },
  { name: 'Document Submission API', calls: '420K', growth: '-3%', positive: false },
  { name: 'Permit Status API', calls: '380K', growth: '+5%', positive: true },
];

const topOrganizations = [
  { name: 'Acme Corporation', calls: '450K', percentage: 18 },
  { name: 'TechStart Ltd', calls: '320K', percentage: 13 },
  { name: 'Global Industries', calls: '280K', percentage: 11 },
  { name: 'DataFlow Inc', calls: '240K', percentage: 10 },
  { name: 'Others', calls: '1.2M', percentage: 48 },
];

export default function PlatformAdminAnalyticsPage() {
  return (
    <>
      <PageHeader
        title="Analytics"
        description="Platform usage insights and trends"
        breadcrumbs={[
          { label: 'Overview', href: '/platform-admin/dashboard' },
          { label: 'Observability' },
          { label: 'Analytics' },
        ]}
        actions={
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 90 days</option>
            <option>This year</option>
          </select>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard
          title="Total API Calls"
          value="2.5M"
          change="+12.5%"
          changeType="positive"
          icon={Zap}
          iconColor="blue"
        />
        <StatCard
          title="Unique Users"
          value="8,432"
          change="+8.2%"
          changeType="positive"
          icon={Users}
          iconColor="green"
        />
        <StatCard
          title="Active Organizations"
          value="156"
          change="+5"
          changeType="positive"
          icon={Globe}
          iconColor="purple"
        />
        <StatCard
          title="Avg Response Time"
          value="142ms"
          change="-18ms"
          changeType="positive"
          icon={TrendingUp}
          iconColor="primary"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartCard title="API Traffic Trends" subtitle="Daily API calls over time">
          <AreaChartPlaceholder />
        </ChartCard>
        <ChartCard title="Response Time Distribution" subtitle="Average latency by API">
          <BarChartPlaceholder />
        </ChartCard>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top APIs */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Top APIs by Usage</h3>
          <p className="text-sm text-gray-500 mb-4">Most frequently called endpoints</p>

          <div className="space-y-4">
            {topAPIs.map((api, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded text-sm font-medium text-gray-600">
                    {index + 1}
                  </span>
                  <span className="font-medium text-gray-900">{api.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">{api.calls}</span>
                  <span className={`flex items-center gap-1 text-sm ${
                    api.positive ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    {api.positive ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4" />
                    )}
                    {api.growth}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Organizations */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Top Organizations</h3>
          <p className="text-sm text-gray-500 mb-4">By API consumption</p>

          <div className="flex items-center justify-center mb-6">
            <DonutChartPlaceholder />
          </div>

          <div className="space-y-3">
            {topOrganizations.map((org, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    index === 0 ? 'bg-primary-500' :
                    index === 1 ? 'bg-emerald-500' :
                    index === 2 ? 'bg-amber-500' :
                    index === 3 ? 'bg-purple-500' :
                    'bg-gray-300'
                  }`} />
                  <span className="text-sm text-gray-900">{org.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">{org.calls}</span>
                  <span className="text-sm font-medium text-gray-900">{org.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
