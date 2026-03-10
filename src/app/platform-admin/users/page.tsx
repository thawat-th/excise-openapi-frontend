'use client';

import { PageHeader, DataTable, StatusBadge } from '@/components/dashboard';
import { Users, Plus, Search, Filter, MoreVertical } from 'lucide-react';

const users = [
  { id: 1, name: 'John Doe', email: 'john@acme.com', org: 'Acme Corp', role: 'Admin', status: 'active', lastLogin: '2 min ago' },
  { id: 2, name: 'Jane Smith', email: 'jane@techstart.com', org: 'TechStart Ltd', role: 'Developer', status: 'active', lastLogin: '1 hour ago' },
  { id: 3, name: 'Mike Johnson', email: 'mike@global.com', org: 'Global Inc', role: 'Viewer', status: 'inactive', lastLogin: '30 days ago' },
  { id: 4, name: 'Sarah Wilson', email: 'sarah@newco.com', org: 'NewCo', role: 'Admin', status: 'pending', lastLogin: '-' },
  { id: 5, name: 'Tom Brown', email: 'tom@acme.com', org: 'Acme Corp', role: 'Developer', status: 'active', lastLogin: '5 hours ago' },
];

export default function PlatformAdminUsersPage() {
  return (
    <>
      <PageHeader
        title="Users"
        description="Manage platform users across all organizations"
        breadcrumbs={[
          { label: 'Overview', href: '/platform-admin/dashboard' },
          { label: 'User & Access' },
          { label: 'Users' },
        ]}
        actions={
          <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add User
          </button>
        }
      />

      {/* Search & Filter */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
            <option>All Organizations</option>
            <option>Acme Corp</option>
            <option>TechStart Ltd</option>
            <option>Global Inc</option>
          </select>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
            <option>All Roles</option>
            <option>Admin</option>
            <option>Developer</option>
            <option>Viewer</option>
          </select>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Filter className="w-4 h-4" />
            More Filters
          </button>
        </div>
      </div>

      <DataTable
        columns={[
          {
            key: 'name',
            label: 'User',
            render: (item) => (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-medium text-sm">
                  {item.name.split(' ').map((n: string) => n[0]).join('')}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{item.name}</p>
                  <p className="text-sm text-gray-500">{item.email}</p>
                </div>
              </div>
            ),
          },
          { key: 'org', label: 'Organization' },
          {
            key: 'role',
            label: 'Role',
            render: (item) => (
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                item.role === 'Admin' ? 'bg-purple-100 text-purple-700' :
                item.role === 'Developer' ? 'bg-blue-100 text-blue-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {item.role}
              </span>
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
          { key: 'lastLogin', label: 'Last Login' },
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
        data={users}
      />
    </>
  );
}
