'use client';

import { PageHeader, DataTable, StatusBadge } from '@/components/dashboard';
import { GitBranch, Plus, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

const versions = [
  { id: 1, service: 'Tax Calculation API', version: 'v2.1.0', status: 'current', released: '2024-11-15', changelog: '3 changes' },
  { id: 2, service: 'Tax Calculation API', version: 'v2.0.0', status: 'deprecated', released: '2024-08-01', changelog: '12 changes' },
  { id: 3, service: 'License Verification API', version: 'v1.5.2', status: 'current', released: '2024-10-20', changelog: '5 changes' },
  { id: 4, service: 'Document Processing API', version: 'v3.0.0', status: 'current', released: '2024-12-01', changelog: '8 changes' },
  { id: 5, service: 'Payment Gateway API', version: 'v2.1.0', status: 'draft', released: '-', changelog: '4 changes' },
];

export default function PlatformAdminVersionsPage() {
  return (
    <>
      <PageHeader
        title="Version Control"
        description="Manage API versions and releases"
        breadcrumbs={[
          { label: 'Overview', href: '/platform-admin/dashboard' },
          { label: 'API Gateway' },
          { label: 'Version Control' },
        ]}
        actions={
          <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Version
          </button>
        }
      />

      <DataTable
        title="API Versions"
        subtitle="All versions across services"
        columns={[
          {
            key: 'service',
            label: 'Service',
            render: (item) => (
              <div className="flex items-center gap-3">
                <GitBranch className="w-5 h-5 text-gray-400" />
                <span className="font-medium text-gray-900">{item.service}</span>
              </div>
            ),
          },
          {
            key: 'version',
            label: 'Version',
            render: (item) => (
              <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{item.version}</span>
            ),
          },
          {
            key: 'status',
            label: 'Status',
            render: (item) => (
              <StatusBadge
                status={item.status === 'current' ? 'success' : item.status === 'draft' ? 'info' : 'warning'}
                label={item.status.charAt(0).toUpperCase() + item.status.slice(1)}
              />
            ),
          },
          { key: 'released', label: 'Released' },
          { key: 'changelog', label: 'Changelog' },
        ]}
        data={versions}
      />
    </>
  );
}
