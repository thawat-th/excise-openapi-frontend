'use client';

import { PageHeader, DataTable, StatusBadge } from '@/components/dashboard';
import { Bell, Plus, AlertTriangle, AlertCircle, Info, CheckCircle, Settings } from 'lucide-react';

const alerts = [
  {
    id: 1,
    title: 'High Error Rate Detected',
    service: 'Payment Gateway API',
    severity: 'critical',
    status: 'active',
    triggered: '2024-12-02 14:32:15',
    description: 'Error rate exceeded 5% threshold for 5 minutes'
  },
  {
    id: 2,
    title: 'Memory Usage Warning',
    service: 'API Gateway',
    severity: 'warning',
    status: 'active',
    triggered: '2024-12-02 14:15:00',
    description: 'Memory usage at 85%, approaching critical threshold'
  },
  {
    id: 3,
    title: 'Rate Limit Breached',
    service: 'Tax Calculation API',
    severity: 'warning',
    status: 'acknowledged',
    triggered: '2024-12-02 13:45:22',
    description: 'Client acme-corp exceeded rate limit by 150%'
  },
  {
    id: 4,
    title: 'SSL Certificate Expiring',
    service: 'Load Balancer',
    severity: 'info',
    status: 'active',
    triggered: '2024-12-02 10:00:00',
    description: 'Certificate expires in 14 days'
  },
  {
    id: 5,
    title: 'Database Connection Pool',
    service: 'Database Primary',
    severity: 'warning',
    status: 'resolved',
    triggered: '2024-12-02 09:30:00',
    description: 'Connection pool utilization exceeded 80%'
  },
];

const alertRules = [
  { id: 1, name: 'High Error Rate', condition: 'error_rate > 5%', window: '5 min', severity: 'critical', enabled: true },
  { id: 2, name: 'High Latency', condition: 'p99_latency > 500ms', window: '10 min', severity: 'warning', enabled: true },
  { id: 3, name: 'Memory Threshold', condition: 'memory_usage > 80%', window: '5 min', severity: 'warning', enabled: true },
  { id: 4, name: 'Rate Limit Breach', condition: 'rate_limit_exceeded', window: 'instant', severity: 'warning', enabled: true },
  { id: 5, name: 'Service Down', condition: 'health_check_failed', window: '1 min', severity: 'critical', enabled: true },
];

const severityIcons: Record<string, React.ReactNode> = {
  critical: <AlertCircle className="w-5 h-5 text-red-500" />,
  warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
  info: <Info className="w-5 h-5 text-blue-500" />,
};

export default function PlatformAdminAlertsPage() {
  return (
    <>
      <PageHeader
        title="Alerts & Notifications"
        description="Monitor and manage system alerts"
        breadcrumbs={[
          { label: 'Overview', href: '/platform-admin/dashboard' },
          { label: 'Observability' },
          { label: 'Alerts' },
        ]}
        actions={
          <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create Alert Rule
          </button>
        }
      />

      {/* Alert Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-8 h-8 text-red-500" />
            <div>
              <p className="text-2xl font-bold text-red-700">1</p>
              <p className="text-sm text-red-600">Critical</p>
            </div>
          </div>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-amber-500" />
            <div>
              <p className="text-2xl font-bold text-amber-700">2</p>
              <p className="text-sm text-amber-600">Warning</p>
            </div>
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <Info className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-2xl font-bold text-blue-700">1</p>
              <p className="text-sm text-blue-600">Info</p>
            </div>
          </div>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-emerald-500" />
            <div>
              <p className="text-2xl font-bold text-emerald-700">1</p>
              <p className="text-sm text-emerald-600">Resolved</p>
            </div>
          </div>
        </div>
      </div>

      {/* Active Alerts */}
      <div className="bg-white rounded-xl border border-gray-200 mb-6">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Bell className="w-6 h-6 text-gray-400" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Active Alerts</h3>
              <p className="text-sm text-gray-500">Current system alerts requiring attention</p>
            </div>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {alerts.map((alert) => (
            <div key={alert.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  {severityIcons[alert.severity]}
                  <div>
                    <h4 className="font-medium text-gray-900">{alert.title}</h4>
                    <p className="text-sm text-gray-500 mt-1">{alert.description}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-xs text-gray-500">{alert.service}</span>
                      <span className="text-xs text-gray-500">{alert.triggered}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge
                    status={
                      alert.status === 'active' ? 'warning' :
                      alert.status === 'acknowledged' ? 'info' :
                      'success'
                    }
                    label={alert.status.charAt(0).toUpperCase() + alert.status.slice(1)}
                  />
                  {alert.status !== 'resolved' && (
                    <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded">
                      Acknowledge
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Alert Rules */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings className="w-6 h-6 text-gray-400" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Alert Rules</h3>
                <p className="text-sm text-gray-500">Configured alerting conditions</p>
              </div>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rule Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Condition</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Window</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Severity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {alertRules.map((rule) => (
                <tr key={rule.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{rule.name}</td>
                  <td className="px-6 py-4">
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">{rule.condition}</code>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{rule.window}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      rule.severity === 'critical' ? 'bg-red-100 text-red-700' :
                      rule.severity === 'warning' ? 'bg-amber-100 text-amber-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {rule.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      rule.enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {rule.enabled ? 'Enabled' : 'Disabled'}
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
