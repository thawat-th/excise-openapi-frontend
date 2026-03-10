'use client';

import { PageHeader, DataTable } from '@/components/dashboard';
import { FileSearch, Download, Filter, Calendar } from 'lucide-react';

const logs = [
  { id: 1, timestamp: '2024-12-02 14:32:15', actor: 'admin@excise.go.th', action: 'user.approve', resource: 'org:newco', ip: '203.150.xxx.xxx', status: 'success' },
  { id: 2, timestamp: '2024-12-02 14:30:42', actor: 'john@acme.com', action: 'api.call', resource: 'api:tax-calc', ip: '110.164.xxx.xxx', status: 'success' },
  { id: 3, timestamp: '2024-12-02 14:28:10', actor: 'system', action: 'policy.enforce', resource: 'api:payment', ip: '-', status: 'blocked' },
  { id: 4, timestamp: '2024-12-02 14:25:33', actor: 'jane@techstart.com', action: 'credential.create', resource: 'client:web-portal', ip: '58.97.xxx.xxx', status: 'success' },
  { id: 5, timestamp: '2024-12-02 14:20:05', actor: 'admin@excise.go.th', action: 'policy.update', resource: 'policy:rate-limit', ip: '203.150.xxx.xxx', status: 'success' },
  { id: 6, timestamp: '2024-12-02 14:15:22', actor: 'unknown', action: 'auth.failed', resource: 'api:document', ip: '185.220.xxx.xxx', status: 'failed' },
];

export default function PlatformAdminAuditLogsPage() {
  return (
    <>
      <PageHeader
        title="Audit Logs"
        description="Track all platform activities and changes"
        breadcrumbs={[
          { label: 'Overview', href: '/platform-admin/dashboard' },
          { label: 'Observability' },
          { label: 'Audit Logs' },
        ]}
        actions={
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Logs
          </button>
        }
      />

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <FileSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search logs..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="date"
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
            <option>All Actions</option>
            <option>user.*</option>
            <option>api.*</option>
            <option>policy.*</option>
            <option>auth.*</option>
          </select>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
            <option>All Status</option>
            <option>Success</option>
            <option>Failed</option>
            <option>Blocked</option>
          </select>
        </div>
      </div>

      <DataTable
        columns={[
          {
            key: 'timestamp',
            label: 'Timestamp',
            render: (item) => (
              <span className="font-mono text-sm text-gray-600">{item.timestamp}</span>
            ),
          },
          { key: 'actor', label: 'Actor' },
          {
            key: 'action',
            label: 'Action',
            render: (item) => (
              <code className="text-sm bg-gray-100 px-2 py-1 rounded">{item.action}</code>
            ),
          },
          {
            key: 'resource',
            label: 'Resource',
            render: (item) => (
              <span className="text-sm font-mono">{item.resource}</span>
            ),
          },
          { key: 'ip', label: 'IP Address' },
          {
            key: 'status',
            label: 'Status',
            render: (item) => (
              <span className={`px-2 py-1 text-xs font-medium rounded ${
                item.status === 'success' ? 'bg-emerald-100 text-emerald-700' :
                item.status === 'failed' ? 'bg-red-100 text-red-700' :
                'bg-amber-100 text-amber-700'
              }`}>
                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
              </span>
            ),
          },
        ]}
        data={logs}
      />
    </>
  );
}
