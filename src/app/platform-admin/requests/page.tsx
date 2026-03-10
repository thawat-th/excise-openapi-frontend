'use client';

import { PageHeader, DataTable, StatusBadge } from '@/components/dashboard';
import { FileInput, Eye } from 'lucide-react';

const requests = [
  { id: 'REQ-001', org: 'Acme Corp', type: 'API Access', service: 'Payment Gateway API', status: 'pending', date: '2024-12-02' },
  { id: 'REQ-002', org: 'TechStart Ltd', type: 'Quota Increase', service: 'Tax Calculation API', status: 'approved', date: '2024-12-01' },
  { id: 'REQ-003', org: 'Global Inc', type: 'Rate Limit Override', service: 'Document Processing API', status: 'in_review', date: '2024-11-30' },
  { id: 'REQ-004', org: 'NewCo', type: 'Organization Registration', service: '-', status: 'pending', date: '2024-11-30' },
  { id: 'REQ-005', org: 'DataFlow', type: 'API Access', service: 'Notification Service', status: 'rejected', date: '2024-11-28' },
];

export default function PlatformAdminRequestsPage() {
  return (
    <>
      <PageHeader
        title="Access Requests"
        description="View all access requests across the platform"
        breadcrumbs={[
          { label: 'Overview', href: '/platform-admin/dashboard' },
          { label: 'Workflow' },
          { label: 'Access Requests' },
        ]}
      />

      <DataTable
        title="All Requests"
        subtitle="Access and service requests"
        columns={[
          {
            key: 'id',
            label: 'Request ID',
            render: (item) => (
              <div className="flex items-center gap-3">
                <FileInput className="w-5 h-5 text-gray-400" />
                <span className="font-mono text-sm">{item.id}</span>
              </div>
            ),
          },
          { key: 'org', label: 'Organization' },
          { key: 'type', label: 'Type' },
          { key: 'service', label: 'Service' },
          {
            key: 'status',
            label: 'Status',
            render: (item) => (
              <StatusBadge
                status={
                  item.status === 'approved' ? 'success' :
                  item.status === 'pending' ? 'pending' :
                  item.status === 'in_review' ? 'info' : 'error'
                }
                label={item.status === 'in_review' ? 'In Review' : item.status.charAt(0).toUpperCase() + item.status.slice(1)}
              />
            ),
          },
          { key: 'date', label: 'Date' },
          {
            key: 'actions',
            label: '',
            render: () => (
              <button className="p-2 text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg">
                <Eye className="w-4 h-4" />
              </button>
            ),
          },
        ]}
        data={requests}
      />
    </>
  );
}
