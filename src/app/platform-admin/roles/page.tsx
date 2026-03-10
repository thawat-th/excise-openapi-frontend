'use client';

import { PageHeader } from '@/components/dashboard';
import { Shield, Plus, Users, Edit, Trash2, ChevronRight } from 'lucide-react';

const roles = [
  {
    id: 1,
    name: 'Platform Admin',
    description: 'Full access to all platform features and settings',
    users: 5,
    permissions: ['users:*', 'services:*', 'policies:*', 'audit:*'],
    isSystem: true,
  },
  {
    id: 2,
    name: 'Service Manager',
    description: 'Manage API services, versions, and configurations',
    users: 12,
    permissions: ['services:read', 'services:write', 'versions:*'],
    isSystem: true,
  },
  {
    id: 3,
    name: 'Security Officer',
    description: 'Manage security policies and audit logs',
    users: 3,
    permissions: ['policies:*', 'audit:read', 'security:*'],
    isSystem: true,
  },
  {
    id: 4,
    name: 'Support Agent',
    description: 'Handle user support and view basic reports',
    users: 8,
    permissions: ['users:read', 'tickets:*', 'reports:read'],
    isSystem: false,
  },
  {
    id: 5,
    name: 'Auditor',
    description: 'Read-only access to audit logs and reports',
    users: 4,
    permissions: ['audit:read', 'reports:read'],
    isSystem: false,
  },
];

export default function PlatformAdminRolesPage() {
  return (
    <>
      <PageHeader
        title="Roles & Permissions"
        description="Manage platform roles and access permissions"
        breadcrumbs={[
          { label: 'Overview', href: '/platform-admin/dashboard' },
          { label: 'User & Access' },
          { label: 'Roles & Permissions' },
        ]}
        actions={
          <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create Role
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles.map((role) => (
          <div
            key={role.id}
            className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-xl bg-primary-100 text-primary-600">
                <Shield className="w-6 h-6" />
              </div>
              {!role.isSystem && (
                <div className="flex items-center gap-1">
                  <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
              {role.isSystem && (
                <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded">
                  System
                </span>
              )}
            </div>

            <h3 className="text-lg font-semibold text-gray-900">{role.name}</h3>
            <p className="text-sm text-gray-500 mt-1">{role.description}</p>

            <div className="flex items-center gap-2 mt-4 text-sm text-gray-600">
              <Users className="w-4 h-4" />
              <span>{role.users} users</span>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs font-medium text-gray-500 uppercase mb-2">Permissions</p>
              <div className="flex flex-wrap gap-1">
                {role.permissions.slice(0, 3).map((perm) => (
                  <span
                    key={perm}
                    className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded"
                  >
                    {perm}
                  </span>
                ))}
                {role.permissions.length > 3 && (
                  <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                    +{role.permissions.length - 3} more
                  </span>
                )}
              </div>
            </div>

            <button className="mt-4 w-full py-2 text-sm text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg flex items-center justify-center gap-1 transition-colors">
              View Details
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
