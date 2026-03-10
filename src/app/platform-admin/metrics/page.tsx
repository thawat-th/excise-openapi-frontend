'use client';

import { PageHeader, ChartCard, LineChartPlaceholder, BarChartPlaceholder } from '@/components/dashboard';
import { Activity, Server, Database, Cpu, HardDrive, MemoryStick, Network, Clock } from 'lucide-react';

const systemMetrics = [
  { name: 'CPU Usage', value: '42%', status: 'healthy', icon: Cpu },
  { name: 'Memory Usage', value: '68%', status: 'warning', icon: MemoryStick },
  { name: 'Disk I/O', value: '23%', status: 'healthy', icon: HardDrive },
  { name: 'Network I/O', value: '156 Mbps', status: 'healthy', icon: Network },
];

const serviceMetrics = [
  { name: 'API Gateway', latency: '45ms', throughput: '2.5K/s', errors: '0.02%', status: 'healthy' },
  { name: 'Auth Service', latency: '32ms', throughput: '890/s', errors: '0.01%', status: 'healthy' },
  { name: 'Database Primary', latency: '12ms', throughput: '4.2K/s', errors: '0%', status: 'healthy' },
  { name: 'Cache Layer', latency: '3ms', throughput: '12K/s', errors: '0%', status: 'healthy' },
  { name: 'Message Queue', latency: '8ms', throughput: '1.8K/s', errors: '0.05%', status: 'warning' },
];

export default function PlatformAdminMetricsPage() {
  return (
    <>
      <PageHeader
        title="System Metrics"
        description="Real-time platform performance monitoring"
        breadcrumbs={[
          { label: 'Overview', href: '/platform-admin/dashboard' },
          { label: 'Observability' },
          { label: 'Metrics' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              Auto-refresh: 30s
            </span>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              Refresh Now
            </button>
          </div>
        }
      />

      {/* System Resources */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {systemMetrics.map((metric) => (
          <div key={metric.name} className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gray-100">
                <metric.icon className="w-6 h-6 text-gray-600" />
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${
                metric.status === 'healthy'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-amber-100 text-amber-700'
              }`}>
                {metric.status}
              </span>
            </div>
            <p className="text-sm text-gray-500 mb-1">{metric.name}</p>
            <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
            <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  metric.status === 'healthy' ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
                style={{ width: metric.value }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartCard title="Request Latency" subtitle="P50, P95, P99 percentiles">
          <LineChartPlaceholder />
        </ChartCard>
        <ChartCard title="Throughput" subtitle="Requests per second">
          <BarChartPlaceholder />
        </ChartCard>
      </div>

      {/* Service Health */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Server className="w-6 h-6 text-gray-400" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Service Metrics</h3>
              <p className="text-sm text-gray-500">Real-time performance by service</p>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Latency (P99)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Throughput
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Error Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {serviceMetrics.map((service) => (
                <tr key={service.name} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <Activity className="w-5 h-5 text-gray-400" />
                      <span className="font-medium text-gray-900">{service.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-mono text-sm text-gray-600">{service.latency}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-mono text-sm text-gray-600">{service.throughput}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`font-mono text-sm ${
                      parseFloat(service.errors) > 0.02 ? 'text-amber-600' : 'text-gray-600'
                    }`}>{service.errors}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      service.status === 'healthy'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
