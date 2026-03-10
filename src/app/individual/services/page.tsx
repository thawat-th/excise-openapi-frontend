'use client';

import { PageHeader, DataTable, StatusBadge } from '@/components/dashboard';
import { Package, ExternalLink } from 'lucide-react';
import { routes } from '@/lib/routes';

const services = [
  { id: 1, name: 'Tax Filing Service', category: 'Tax', status: 'active', lastUsed: '2024-12-01' },
  { id: 2, name: 'License Renewal', category: 'License', status: 'active', lastUsed: '2024-11-28' },
  { id: 3, name: 'Document Verification', category: 'Document', status: 'pending', lastUsed: '-' },
  { id: 4, name: 'Payment Gateway', category: 'Payment', status: 'active', lastUsed: '2024-11-25' },
  { id: 5, name: 'Report Generation', category: 'Report', status: 'inactive', lastUsed: '2024-10-15' },
];

export default function IndividualServicesPage() {
  return (
    <>
      <PageHeader
        title="My Services"
        description="Services you have subscribed to"
        breadcrumbs={[
          { label: 'Dashboard', href: routes.dashboard('individual') },
          { label: 'My Services' },
        ]}
        actions={
          <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2">
            <Package className="w-4 h-4" />
            Browse Services
          </button>
        }
      />

      <DataTable
        title="Subscribed Services"
        subtitle="Manage your active service subscriptions"
        columns={[
          { key: 'name', label: 'Service Name' },
          { key: 'category', label: 'Category' },
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
          { key: 'lastUsed', label: 'Last Used' },
          {
            key: 'actions',
            label: 'Actions',
            render: () => (
              <button className="text-primary-600 hover:text-primary-700 flex items-center gap-1 text-sm">
                <ExternalLink className="w-4 h-4" />
                Open
              </button>
            ),
          },
        ]}
        data={services}
      />
    </>
  );
}
