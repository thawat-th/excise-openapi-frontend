'use client';

import { PageHeader, DataTable, StatusBadge } from '@/components/dashboard';
import { Key, Plus, Copy, Eye, EyeOff, Trash2, RotateCcw } from 'lucide-react';
import { routes } from '@/lib/routes';

const credentials = [
  {
    id: 1,
    name: 'Production API Key',
    clientId: 'client_prod_abc123...',
    environment: 'production',
    status: 'active',
    created: '2024-01-15',
    lastUsed: '2 minutes ago',
  },
  {
    id: 2,
    name: 'Staging API Key',
    clientId: 'client_stg_def456...',
    environment: 'staging',
    status: 'active',
    created: '2024-02-20',
    lastUsed: '1 hour ago',
  },
  {
    id: 3,
    name: 'Development Key',
    clientId: 'client_dev_ghi789...',
    environment: 'development',
    status: 'active',
    created: '2024-03-10',
    lastUsed: '3 days ago',
  },
  {
    id: 4,
    name: 'Legacy Integration',
    clientId: 'client_leg_jkl012...',
    environment: 'production',
    status: 'expiring',
    created: '2023-06-01',
    lastUsed: '1 week ago',
  },
];

export default function OrganizationCredentialsPage() {
  return (
    <>
      <PageHeader
        title="Credentials"
        description="Manage your API keys and client credentials"
        breadcrumbs={[
          { label: 'Dashboard', href: routes.dashboard('organization') },
          { label: 'Credentials' },
        ]}
        actions={
          <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create New Key
          </button>
        }
      />

      {/* Warning Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
        <div className="p-1 rounded-full bg-amber-100">
          <Key className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <p className="font-medium text-amber-800">API Key Security</p>
          <p className="text-sm text-amber-700 mt-1">
            Keep your API keys secure. Never share them in public repositories or client-side code.
            Rotate keys regularly and revoke any compromised credentials immediately.
          </p>
        </div>
      </div>

      <DataTable
        title="API Credentials"
        subtitle="Your active API keys and client credentials"
        columns={[
          {
            key: 'name',
            label: 'Name',
            render: (item) => (
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gray-100">
                  <Key className="w-4 h-4 text-gray-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{item.name}</p>
                  <p className="text-sm text-gray-500 font-mono">{item.clientId}</p>
                </div>
              </div>
            ),
          },
          {
            key: 'environment',
            label: 'Environment',
            render: (item) => (
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                item.environment === 'production'
                  ? 'bg-red-100 text-red-700'
                  : item.environment === 'staging'
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-blue-100 text-blue-700'
              }`}>
                {item.environment}
              </span>
            ),
          },
          {
            key: 'status',
            label: 'Status',
            render: (item) => (
              <StatusBadge
                status={item.status === 'active' ? 'success' : 'warning'}
                label={item.status === 'active' ? 'Active' : 'Expiring Soon'}
              />
            ),
          },
          { key: 'lastUsed', label: 'Last Used' },
          {
            key: 'actions',
            label: 'Actions',
            render: () => (
              <div className="flex items-center gap-2">
                <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg" title="Copy">
                  <Copy className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg" title="Rotate">
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg" title="Delete">
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
