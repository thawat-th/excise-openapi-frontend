'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/dashboard';
import { Wrench, PlayCircle, Calendar, Clock, AlertTriangle, CheckCircle, Database, Server, RefreshCw, Trash2 } from 'lucide-react';

const scheduledTasks = [
  { id: 1, name: 'Database Backup', schedule: 'Daily at 02:00', lastRun: '2024-12-02 02:00', nextRun: '2024-12-03 02:00', status: 'success' },
  { id: 2, name: 'Log Rotation', schedule: 'Weekly on Sunday', lastRun: '2024-12-01 00:00', nextRun: '2024-12-08 00:00', status: 'success' },
  { id: 3, name: 'Cache Cleanup', schedule: 'Every 6 hours', lastRun: '2024-12-02 12:00', nextRun: '2024-12-02 18:00', status: 'success' },
  { id: 4, name: 'Session Pruning', schedule: 'Daily at 03:00', lastRun: '2024-12-02 03:00', nextRun: '2024-12-03 03:00', status: 'success' },
  { id: 5, name: 'Analytics Aggregation', schedule: 'Hourly', lastRun: '2024-12-02 14:00', nextRun: '2024-12-02 15:00', status: 'running' },
];

const maintenanceActions = [
  { id: 'clear-cache', name: 'Clear All Cache', description: 'Purge Redis and application cache', icon: RefreshCw, danger: false },
  { id: 'rebuild-index', name: 'Rebuild Search Index', description: 'Reindex Elasticsearch data', icon: Database, danger: false },
  { id: 'restart-services', name: 'Restart Services', description: 'Restart all microservices', icon: Server, danger: true },
  { id: 'purge-logs', name: 'Purge Old Logs', description: 'Delete logs older than 90 days', icon: Trash2, danger: true },
];

export default function PlatformAdminMaintenancePage() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  return (
    <>
      <PageHeader
        title="Maintenance"
        description="System maintenance and scheduled tasks"
        breadcrumbs={[
          { label: 'Overview', href: '/platform-admin/dashboard' },
          { label: 'System' },
          { label: 'Maintenance' },
        ]}
      />

      {/* Maintenance Mode Banner */}
      <div className={`rounded-xl p-6 mb-6 ${
        maintenanceMode
          ? 'bg-amber-50 border-2 border-amber-300'
          : 'bg-white border border-gray-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${maintenanceMode ? 'bg-amber-100' : 'bg-gray-100'}`}>
              <Wrench className={`w-6 h-6 ${maintenanceMode ? 'text-amber-600' : 'text-gray-600'}`} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Maintenance Mode</h3>
              <p className="text-sm text-gray-500">
                {maintenanceMode
                  ? 'Platform is currently in maintenance mode. Users see a maintenance page.'
                  : 'Enable to show maintenance page to all users.'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setMaintenanceMode(!maintenanceMode)}
            className={`px-6 py-2.5 rounded-lg font-medium transition-colors ${
              maintenanceMode
                ? 'bg-amber-600 text-white hover:bg-amber-700'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {maintenanceMode ? 'Disable' : 'Enable'}
          </button>
        </div>

        {maintenanceMode && (
          <div className="mt-4 pt-4 border-t border-amber-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maintenance Message
            </label>
            <textarea
              rows={2}
              className="w-full px-4 py-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 bg-white"
              defaultValue="ระบบกำลังปรับปรุง กรุณากลับมาใหม่ภายหลัง / System is under maintenance. Please check back later."
            />
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {maintenanceActions.map((action) => (
            <button
              key={action.id}
              className={`p-4 rounded-xl border-2 border-dashed transition-all text-left hover:shadow-md ${
                action.danger
                  ? 'border-red-200 hover:border-red-400 hover:bg-red-50'
                  : 'border-gray-200 hover:border-primary-400 hover:bg-primary-50'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <action.icon className={`w-5 h-5 ${action.danger ? 'text-red-500' : 'text-primary-600'}`} />
                <span className="font-medium text-gray-900">{action.name}</span>
              </div>
              <p className="text-sm text-gray-500">{action.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Scheduled Tasks */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-gray-400" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Scheduled Tasks</h3>
              <p className="text-sm text-gray-500">Automated maintenance jobs</p>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Task</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Schedule</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Run</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Next Run</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {scheduledTasks.map((task) => (
                <tr key={task.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-gray-400" />
                      <span className="font-medium text-gray-900">{task.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{task.schedule}</td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm text-gray-600">{task.lastRun}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm text-gray-600">{task.nextRun}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`flex items-center gap-2 px-2 py-1 text-xs font-medium rounded w-fit ${
                      task.status === 'success'
                        ? 'bg-emerald-100 text-emerald-700'
                        : task.status === 'running'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {task.status === 'success' && <CheckCircle className="w-3 h-3" />}
                      {task.status === 'running' && <RefreshCw className="w-3 h-3 animate-spin" />}
                      {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-primary-600 hover:bg-primary-50 rounded-lg">
                      <PlayCircle className="w-4 h-4" />
                      Run Now
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* System Health Check */}
      <div className="bg-white rounded-xl border border-gray-200 mt-6">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Server className="w-6 h-6 text-gray-400" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">System Health Check</h3>
                <p className="text-sm text-gray-500">Last checked: 2024-12-02 14:32:15</p>
              </div>
            </div>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Run Health Check
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: 'API Gateway', status: 'healthy' },
              { name: 'Database Primary', status: 'healthy' },
              { name: 'Database Replica', status: 'healthy' },
              { name: 'Redis Cache', status: 'healthy' },
              { name: 'Elasticsearch', status: 'healthy' },
              { name: 'Message Queue', status: 'warning' },
              { name: 'File Storage', status: 'healthy' },
              { name: 'Auth Service', status: 'healthy' },
            ].map((service, index) => (
              <div key={index} className={`p-4 rounded-lg border ${
                service.status === 'healthy'
                  ? 'bg-emerald-50 border-emerald-200'
                  : 'bg-amber-50 border-amber-200'
              }`}>
                <div className="flex items-center gap-2">
                  {service.status === 'healthy' ? (
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                  )}
                  <span className="font-medium text-gray-900">{service.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
