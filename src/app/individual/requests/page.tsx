'use client';

import { PageHeader, DataTable, StatusBadge } from '@/components/dashboard';
import { Plus, Eye } from 'lucide-react';
import { routes } from '@/lib/routes';

const requests = [
  { id: 'REQ-2024-001', type: 'Service Access', service: 'Tax Filing', status: 'approved', date: '2024-12-01' },
  { id: 'REQ-2024-002', type: 'Service Access', service: 'License Renewal', status: 'pending', date: '2024-12-02' },
  { id: 'REQ-2024-003', type: 'Support', service: 'Payment Gateway', status: 'in_review', date: '2024-11-30' },
  { id: 'REQ-2024-004', type: 'Service Access', service: 'Report Generation', status: 'rejected', date: '2024-11-28' },
  { id: 'REQ-2024-005', type: 'Support', service: 'Document Verification', status: 'approved', date: '2024-11-25' },
];

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'approved':
      return { status: 'success' as const, label: 'Approved' };
    case 'pending':
      return { status: 'pending' as const, label: 'Pending' };
    case 'in_review':
      return { status: 'info' as const, label: 'In Review' };
    case 'rejected':
      return { status: 'error' as const, label: 'Rejected' };
    default:
      return { status: 'pending' as const, label: status };
  }
};

export default function IndividualRequestsPage() {
  return (
    <>
      <PageHeader
        title="My Requests"
        description="Track and manage your service requests"
        breadcrumbs={[
          { label: 'Dashboard', href: routes.dashboard('individual') },
          { label: 'My Requests' },
        ]}
        actions={
          <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Request
          </button>
        }
      />

      <DataTable
        title="Request History"
        subtitle="All your submitted requests"
        columns={[
          { key: 'id', label: 'Request ID' },
          { key: 'type', label: 'Type' },
          { key: 'service', label: 'Service' },
          {
            key: 'status',
            label: 'Status',
            render: (item) => {
              const config = getStatusConfig(item.status);
              return <StatusBadge status={config.status} label={config.label} />;
            },
          },
          { key: 'date', label: 'Date' },
          {
            key: 'actions',
            label: 'Actions',
            render: () => (
              <button className="text-primary-600 hover:text-primary-700 flex items-center gap-1 text-sm">
                <Eye className="w-4 h-4" />
                View
              </button>
            ),
          },
        ]}
        data={requests}
      />
    </>
  );
}
