'use client';

import { PageHeader, DataTable, StatusBadge } from '@/components/dashboard';
import { KeyRound, Eye, RotateCcw, Trash2 } from 'lucide-react';

const credentials = [
  { id: 1, client: 'Acme Mobile App', keyId: 'key_prod_abc...', type: 'API Key', env: 'production', status: 'active', expires: '2025-01-15' },
  { id: 2, client: 'TechStart Web Portal', keyId: 'key_prod_def...', type: 'OAuth2', env: 'production', status: 'active', expires: '2025-02-20' },
  { id: 3, client: 'Global Backend Service', keyId: 'key_prod_ghi...', type: 'mTLS', env: 'production', status: 'active', expires: '2024-12-31' },
  { id: 4, client: 'Acme Mobile App', keyId: 'key_stg_jkl...', type: 'API Key', env: 'staging', status: 'active', expires: '2025-06-15' },
  { id: 5, client: 'DataFlow Connector', keyId: 'key_prod_mno...', type: 'API Key', env: 'production', status: 'revoked', expires: '-' },
];

export default function PlatformAdminCredentialsPage() {
  return (
    <>
      <PageHeader
        title="API Credentials"
        description="Manage API keys and authentication credentials"
        breadcrumbs={[
          { label: 'Overview', href: '/platform-admin/dashboard' },
          { label: 'Consumers' },
          { label: 'API Credentials' },
        ]}
      />

      <DataTable
        title="All Credentials"
        subtitle="API keys and tokens across all clients"
        columns={[
          {
            key: 'client',
            label: 'Client',
            render: (item) => (
              <div className="flex items-center gap-3">
                <KeyRound className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">{item.client}</p>
                  <p className="text-sm text-gray-500 font-mono">{item.keyId}</p>
                </div>
              </div>
            ),
          },
          {
            key: 'type',
            label: 'Type',
            render: (item) => (
              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">{item.type}</span>
            ),
          },
          {
            key: 'env',
            label: 'Environment',
            render: (item) => (
              <span className={`px-2 py-1 text-xs rounded ${
                item.env === 'production' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
              }`}>
                {item.env}
              </span>
            ),
          },
          {
            key: 'status',
            label: 'Status',
            render: (item) => (
              <StatusBadge
                status={item.status === 'active' ? 'success' : 'error'}
                label={item.status.charAt(0).toUpperCase() + item.status.slice(1)}
              />
            ),
          },
          { key: 'expires', label: 'Expires' },
          {
            key: 'actions',
            label: '',
            render: () => (
              <div className="flex items-center gap-1">
                <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg" title="View">
                  <Eye className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg" title="Rotate">
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg" title="Revoke">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ),
          },
        ]}
        data={credentials}
      />
    </>
  );
}
