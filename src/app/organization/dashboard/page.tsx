'use client';

import Link from 'next/link';
import {
  PageHeader,
  StatCard,
  ChartCard,
  LineChartPlaceholder,
  BarChartPlaceholder,
  DataTable,
  StatusBadge,
  QuickAction,
} from '@/components/dashboard';
import {
  Activity,
  Key,
  Users,
  AlertTriangle,
  Plus,
  FileText,
  Settings,
  BarChart3,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

const recentApiCalls = [
  { endpoint: '/api/v1/tax/calculate', method: 'POST', status: 'success', latency: '124ms', time: '2 min ago' },
  { endpoint: '/api/v1/license/verify', method: 'GET', status: 'success', latency: '89ms', time: '5 min ago' },
  { endpoint: '/api/v1/document/upload', method: 'POST', status: 'error', latency: '2.1s', time: '12 min ago' },
  { endpoint: '/api/v1/payment/process', method: 'POST', status: 'success', latency: '456ms', time: '15 min ago' },
  { endpoint: '/api/v1/report/generate', method: 'GET', status: 'success', latency: '1.2s', time: '20 min ago' },
];

export default function OrganizationDashboardPage() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Monitor your API usage and organization activity"
      />

      {/* Getting Started Banner */}
      <Link
        href="/organization/getting-started"
        className="block mb-8 p-6 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl text-white hover:from-purple-600 hover:to-purple-700 transition-all shadow-lg shadow-purple-200 dark:shadow-purple-900/30"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">แนะนำบริการ</h3>
              <p className="text-purple-100 text-sm">เรียนรู้ขั้นตอนการใช้งาน Excise OpenAPI สำหรับหน่วยงาน/องค์กร</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5" />
        </div>
      </Link>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="API Calls Today"
          value="12,847"
          change="+18% from yesterday"
          changeType="positive"
          icon={Activity}
          iconColor="primary"
        />
        <StatCard
          title="Active API Keys"
          value={8}
          change="2 expiring soon"
          changeType="neutral"
          icon={Key}
          iconColor="blue"
        />
        <StatCard
          title="Team Members"
          value={24}
          change="+3 this month"
          changeType="positive"
          icon={Users}
          iconColor="green"
        />
        <StatCard
          title="Error Rate"
          value="0.12%"
          change="Below threshold"
          changeType="positive"
          icon={AlertTriangle}
          iconColor="orange"
        />
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickAction
            icon={<Plus className="w-5 h-5" />}
            title="New API Key"
            description="Generate a new API credential"
          />
          <QuickAction
            icon={<FileText className="w-5 h-5" />}
            title="View Documentation"
            description="Browse API docs and guides"
          />
          <QuickAction
            icon={<BarChart3 className="w-5 h-5" />}
            title="Usage Reports"
            description="Download detailed reports"
          />
          <QuickAction
            icon={<Settings className="w-5 h-5" />}
            title="API Settings"
            description="Configure your API access"
          />
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ChartCard
          title="API Traffic"
          subtitle="Requests over the last 7 days"
          action={
            <select className="text-sm border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-primary-500">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
            </select>
          }
        >
          <LineChartPlaceholder />
        </ChartCard>

        <ChartCard
          title="Top APIs by Usage"
          subtitle="Most frequently called endpoints"
        >
          <BarChartPlaceholder />
        </ChartCard>
      </div>

      {/* Recent API Calls */}
      <DataTable
        title="Recent API Calls"
        subtitle="Latest requests from your applications"
        columns={[
          { key: 'endpoint', label: 'Endpoint' },
          {
            key: 'method',
            label: 'Method',
            render: (item) => (
              <span className={`px-2 py-0.5 text-xs font-mono rounded ${
                item.method === 'GET' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400' :
                item.method === 'POST' ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400' :
                item.method === 'PUT' ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400' :
                'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400'
              }`}>
                {item.method}
              </span>
            ),
          },
          {
            key: 'status',
            label: 'Status',
            render: (item) => (
              <StatusBadge
                status={item.status === 'success' ? 'success' : 'error'}
                label={item.status === 'success' ? '200 OK' : '500 Error'}
              />
            ),
          },
          { key: 'latency', label: 'Latency' },
          { key: 'time', label: 'Time' },
        ]}
        data={recentApiCalls}
        action={
          <button className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
            View all logs →
          </button>
        }
      />
    </>
  );
}
