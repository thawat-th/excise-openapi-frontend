'use client';

import { PageHeader, DataTable, StatusBadge } from '@/components/dashboard';
import { Router, Plus, Settings } from 'lucide-react';

const routes = [
  { id: 1, path: '/api/v1/tax/*', service: 'Tax Calculation API', method: 'ALL', auth: 'API Key', status: 'active' },
  { id: 2, path: '/api/v1/license/*', service: 'License Verification API', method: 'GET, POST', auth: 'OAuth2', status: 'active' },
  { id: 3, path: '/api/v1/document/*', service: 'Document Processing API', method: 'ALL', auth: 'API Key', status: 'active' },
  { id: 4, path: '/api/v1/payment/*', service: 'Payment Gateway API', method: 'POST', auth: 'mTLS', status: 'maintenance' },
  { id: 5, path: '/api/v1/notify/*', service: 'Notification Service', method: 'POST', auth: 'API Key', status: 'active' },
];

export default function PlatformAdminRoutesPage() {
  return (
    <>
      <PageHeader
        title="API Routes"
        description="Configure API routing and path mappings"
        breadcrumbs={[
          { label: 'Overview', href: '/platform-admin/dashboard' },
          { label: 'API Gateway' },
          { label: 'API Routes' },
        ]}
        actions={
          <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Route
          </button>
        }
      />

      <DataTable
        title="Route Configuration"
        subtitle="API path to service mappings"
        columns={[
          {
            key: 'path',
            label: 'Path',
            render: (item) => (
              <div className="flex items-center gap-3">
                <Router className="w-5 h-5 text-gray-400" />
                <code className="text-sm bg-gray-100 px-2 py-1 rounded">{item.path}</code>
              </div>
            ),
          },
          { key: 'service', label: 'Target Service' },
          {
            key: 'method',
            label: 'Methods',
            render: (item) => (
              <span className="text-sm font-mono">{item.method}</span>
            ),
          },
          {
            key: 'auth',
            label: 'Authentication',
            render: (item) => (
              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">{item.auth}</span>
            ),
          },
          {
            key: 'status',
            label: 'Status',
            render: (item) => (
              <StatusBadge
                status={item.status === 'active' ? 'success' : 'warning'}
                label={item.status.charAt(0).toUpperCase() + item.status.slice(1)}
              />
            ),
          },
          {
            key: 'actions',
            label: '',
            render: () => (
              <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                <Settings className="w-4 h-4" />
              </button>
            ),
          },
        ]}
        data={routes}
      />
    </>
  );
}
