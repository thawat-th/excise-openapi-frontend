'use client';

import { PageHeader, DataTable, StatusBadge } from '@/components/dashboard';
import { Server, Plus, MoreVertical } from 'lucide-react';

const clients = [
  { id: 1, name: 'Acme Mobile App', org: 'Acme Corp', type: 'Mobile', status: 'active', apis: 5, created: '2024-01-15' },
  { id: 2, name: 'TechStart Web Portal', org: 'TechStart Ltd', type: 'Web', status: 'active', apis: 3, created: '2024-02-20' },
  { id: 3, name: 'Global Backend Service', org: 'Global Inc', type: 'Server', status: 'active', apis: 8, created: '2024-03-10' },
  { id: 4, name: 'NewCo Integration', org: 'NewCo', type: 'Server', status: 'pending', apis: 0, created: '2024-12-01' },
  { id: 5, name: 'DataFlow Connector', org: 'DataFlow', type: 'Server', status: 'suspended', apis: 2, created: '2024-06-15' },
];

export default function PlatformAdminClientsPage() {
  return (
    <>
      <PageHeader
        title="Client Applications"
        description="Manage registered client applications"
        breadcrumbs={[
          { label: 'Overview', href: '/platform-admin/dashboard' },
          { label: 'Consumers' },
          { label: 'Client Applications' },
        ]}
        actions={
          <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Register Client
          </button>
        }
      />

      <DataTable
        title="Registered Clients"
        subtitle="All client applications on the platform"
        columns={[
          {
            key: 'name',
            label: 'Client',
            render: (item) => (
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gray-100">
                  <Server className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{item.name}</p>
                  <p className="text-sm text-gray-500">{item.org}</p>
                </div>
              </div>
            ),
          },
          {
            key: 'type',
            label: 'Type',
            render: (item) => (
              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">{item.type}</span>
            ),
          },
          {
            key: 'status',
            label: 'Status',
            render: (item) => (
              <StatusBadge
                status={item.status === 'active' ? 'success' : item.status === 'pending' ? 'warning' : 'error'}
                label={item.status.charAt(0).toUpperCase() + item.status.slice(1)}
              />
            ),
          },
          { key: 'apis', label: 'APIs Subscribed' },
          { key: 'created', label: 'Registered' },
          {
            key: 'actions',
            label: '',
            render: () => (
              <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                <MoreVertical className="w-4 h-4" />
              </button>
            ),
          },
        ]}
        data={clients}
      />
    </>
  );
}
