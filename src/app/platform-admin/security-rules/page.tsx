'use client';

import { PageHeader, DataTable, StatusBadge } from '@/components/dashboard';
import { ShieldCheck, Plus, Edit, ToggleLeft, ToggleRight } from 'lucide-react';

const rules = [
  { id: 1, name: 'SQL Injection Protection', type: 'WAF', scope: 'All APIs', status: 'enabled', severity: 'critical' },
  { id: 2, name: 'XSS Prevention', type: 'WAF', scope: 'All APIs', status: 'enabled', severity: 'high' },
  { id: 3, name: 'Rate Limit Enforcement', type: 'Traffic', scope: 'All APIs', status: 'enabled', severity: 'medium' },
  { id: 4, name: 'IP Blacklist', type: 'Access', scope: 'All APIs', status: 'enabled', severity: 'high' },
  { id: 5, name: 'Payload Size Limit', type: 'Validation', scope: 'Upload APIs', status: 'enabled', severity: 'medium' },
  { id: 6, name: 'JWT Validation', type: 'Auth', scope: 'Protected APIs', status: 'enabled', severity: 'critical' },
  { id: 7, name: 'CORS Policy', type: 'Access', scope: 'Public APIs', status: 'disabled', severity: 'low' },
];

export default function PlatformAdminSecurityRulesPage() {
  return (
    <>
      <PageHeader
        title="Security Rules"
        description="Configure platform security rules and protections"
        breadcrumbs={[
          { label: 'Overview', href: '/platform-admin/dashboard' },
          { label: 'Policies & Security' },
          { label: 'Security Rules' },
        ]}
        actions={
          <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Rule
          </button>
        }
      />

      <DataTable
        title="Active Security Rules"
        subtitle="Platform-wide security protections"
        columns={[
          {
            key: 'name',
            label: 'Rule',
            render: (item) => (
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-gray-400" />
                <span className="font-medium text-gray-900">{item.name}</span>
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
          { key: 'scope', label: 'Scope' },
          {
            key: 'severity',
            label: 'Severity',
            render: (item) => (
              <span className={`px-2 py-1 text-xs font-medium rounded ${
                item.severity === 'critical' ? 'bg-red-100 text-red-700' :
                item.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                item.severity === 'medium' ? 'bg-amber-100 text-amber-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {item.severity.charAt(0).toUpperCase() + item.severity.slice(1)}
              </span>
            ),
          },
          {
            key: 'status',
            label: 'Status',
            render: (item) => (
              <button className={`flex items-center gap-2 px-3 py-1 rounded-lg transition-colors ${
                item.status === 'enabled'
                  ? 'text-emerald-600 hover:bg-emerald-50'
                  : 'text-gray-400 hover:bg-gray-50'
              }`}>
                {item.status === 'enabled' ? (
                  <ToggleRight className="w-5 h-5" />
                ) : (
                  <ToggleLeft className="w-5 h-5" />
                )}
                <span className="text-sm font-medium">
                  {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                </span>
              </button>
            ),
          },
          {
            key: 'actions',
            label: '',
            render: () => (
              <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                <Edit className="w-4 h-4" />
              </button>
            ),
          },
        ]}
        data={rules}
      />
    </>
  );
}
