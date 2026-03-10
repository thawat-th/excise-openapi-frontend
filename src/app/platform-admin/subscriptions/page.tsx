'use client';

import { PageHeader, DataTable, StatusBadge } from '@/components/dashboard';
import { CreditCard, Plus } from 'lucide-react';

const subscriptions = [
  { id: 1, org: 'Acme Corp', plan: 'Enterprise', apis: 12, quota: '100K/day', status: 'active', billing: 'Annual' },
  { id: 2, org: 'TechStart Ltd', plan: 'Professional', apis: 5, quota: '50K/day', status: 'active', billing: 'Monthly' },
  { id: 3, org: 'Global Inc', plan: 'Enterprise', apis: 8, quota: '100K/day', status: 'active', billing: 'Annual' },
  { id: 4, org: 'NewCo', plan: 'Starter', apis: 2, quota: '10K/day', status: 'trial', billing: '-' },
  { id: 5, org: 'DataFlow', plan: 'Professional', apis: 3, quota: '50K/day', status: 'suspended', billing: 'Monthly' },
];

export default function PlatformAdminSubscriptionsPage() {
  return (
    <>
      <PageHeader
        title="Subscriptions"
        description="Manage organization subscriptions and plans"
        breadcrumbs={[
          { label: 'Overview', href: '/platform-admin/dashboard' },
          { label: 'Consumers' },
          { label: 'Subscriptions' },
        ]}
        actions={
          <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Subscription
          </button>
        }
      />

      <DataTable
        title="All Subscriptions"
        subtitle="Organization subscription details"
        columns={[
          {
            key: 'org',
            label: 'Organization',
            render: (item) => (
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-gray-400" />
                <span className="font-medium text-gray-900">{item.org}</span>
              </div>
            ),
          },
          {
            key: 'plan',
            label: 'Plan',
            render: (item) => (
              <span className={`px-2 py-1 text-xs font-medium rounded ${
                item.plan === 'Enterprise' ? 'bg-purple-100 text-purple-700' :
                item.plan === 'Professional' ? 'bg-blue-100 text-blue-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {item.plan}
              </span>
            ),
          },
          { key: 'apis', label: 'APIs' },
          { key: 'quota', label: 'Quota' },
          {
            key: 'status',
            label: 'Status',
            render: (item) => (
              <StatusBadge
                status={item.status === 'active' ? 'success' : item.status === 'trial' ? 'info' : 'error'}
                label={item.status.charAt(0).toUpperCase() + item.status.slice(1)}
              />
            ),
          },
          { key: 'billing', label: 'Billing' },
        ]}
        data={subscriptions}
      />
    </>
  );
}
