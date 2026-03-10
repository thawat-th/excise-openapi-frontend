'use client';

import { PageHeader, DataTable } from '@/components/dashboard';
import { Gauge, Plus, Edit } from 'lucide-react';

const rateLimits = [
  { id: 1, name: 'Default', requests: '1,000', window: '1 minute', scope: 'Per API Key', services: 'All' },
  { id: 2, name: 'Premium', requests: '10,000', window: '1 minute', scope: 'Per API Key', services: 'All' },
  { id: 3, name: 'Enterprise', requests: '100,000', window: '1 minute', scope: 'Per Organization', services: 'All' },
  { id: 4, name: 'Tax API Burst', requests: '500', window: '10 seconds', scope: 'Per API Key', services: 'Tax Calculation API' },
  { id: 5, name: 'Payment Strict', requests: '100', window: '1 minute', scope: 'Per IP', services: 'Payment Gateway API' },
];

export default function PlatformAdminRateLimitsPage() {
  return (
    <>
      <PageHeader
        title="Rate Limiting"
        description="Configure API rate limits and quotas"
        breadcrumbs={[
          { label: 'Overview', href: '/platform-admin/dashboard' },
          { label: 'API Gateway' },
          { label: 'Rate Limiting' },
        ]}
        actions={
          <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create Policy
          </button>
        }
      />

      <DataTable
        title="Rate Limit Policies"
        subtitle="Define request limits for API consumers"
        columns={[
          {
            key: 'name',
            label: 'Policy Name',
            render: (item) => (
              <div className="flex items-center gap-3">
                <Gauge className="w-5 h-5 text-gray-400" />
                <span className="font-medium text-gray-900">{item.name}</span>
              </div>
            ),
          },
          {
            key: 'requests',
            label: 'Requests',
            render: (item) => (
              <span className="font-mono text-sm">{item.requests}</span>
            ),
          },
          { key: 'window', label: 'Time Window' },
          { key: 'scope', label: 'Scope' },
          { key: 'services', label: 'Applied To' },
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
        data={rateLimits}
      />
    </>
  );
}
