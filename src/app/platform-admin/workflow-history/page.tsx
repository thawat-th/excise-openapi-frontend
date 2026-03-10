'use client';

import { PageHeader, DataTable, StatusBadge } from '@/components/dashboard';
import { History, Download } from 'lucide-react';

const history = [
  { id: 'WF-001', request: 'REQ-099', org: 'Acme Corp', type: 'API Access', action: 'approved', by: 'admin@excise.go.th', date: '2024-12-02 14:30' },
  { id: 'WF-002', request: 'REQ-098', org: 'TechStart Ltd', type: 'Quota Increase', action: 'approved', by: 'admin@excise.go.th', date: '2024-12-02 11:15' },
  { id: 'WF-003', request: 'REQ-097', org: 'Global Inc', type: 'API Access', action: 'rejected', by: 'security@excise.go.th', date: '2024-12-01 16:45' },
  { id: 'WF-004', request: 'REQ-096', org: 'DataFlow', type: 'Rate Limit Override', action: 'approved', by: 'admin@excise.go.th', date: '2024-12-01 09:20' },
  { id: 'WF-005', request: 'REQ-095', org: 'NewCo', type: 'Organization Registration', action: 'approved', by: 'admin@excise.go.th', date: '2024-11-30 15:00' },
];

export default function PlatformAdminWorkflowHistoryPage() {
  return (
    <>
      <PageHeader
        title="Workflow History"
        description="Audit trail of approval actions"
        breadcrumbs={[
          { label: 'Overview', href: '/platform-admin/dashboard' },
          { label: 'Workflow' },
          { label: 'Workflow History' },
        ]}
        actions={
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
        }
      />

      <DataTable
        title="Approval History"
        subtitle="Record of all workflow decisions"
        columns={[
          {
            key: 'id',
            label: 'Workflow ID',
            render: (item) => (
              <div className="flex items-center gap-3">
                <History className="w-5 h-5 text-gray-400" />
                <span className="font-mono text-sm">{item.id}</span>
              </div>
            ),
          },
          { key: 'request', label: 'Request' },
          { key: 'org', label: 'Organization' },
          { key: 'type', label: 'Type' },
          {
            key: 'action',
            label: 'Action',
            render: (item) => (
              <StatusBadge
                status={item.action === 'approved' ? 'success' : 'error'}
                label={item.action.charAt(0).toUpperCase() + item.action.slice(1)}
              />
            ),
          },
          { key: 'by', label: 'Processed By' },
          { key: 'date', label: 'Date & Time' },
        ]}
        data={history}
      />
    </>
  );
}
