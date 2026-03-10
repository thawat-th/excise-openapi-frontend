'use client';

import { PageHeader, DataTable, StatusBadge } from '@/components/dashboard';
import { ClipboardCheck, Plus, Eye, Clock, CheckCircle, XCircle } from 'lucide-react';
import { routes } from '@/lib/routes';

const requests = [
  {
    id: 'REQ-2024-0045',
    type: 'API Access',
    service: 'Payment Gateway API v2',
    status: 'pending',
    requestedBy: 'John Doe',
    date: '2024-12-02',
  },
  {
    id: 'REQ-2024-0044',
    type: 'Quota Increase',
    service: 'Tax Calculation API',
    status: 'approved',
    requestedBy: 'Jane Smith',
    date: '2024-12-01',
  },
  {
    id: 'REQ-2024-0043',
    type: 'API Access',
    service: 'Document Processing API',
    status: 'in_review',
    requestedBy: 'Mike Johnson',
    date: '2024-11-30',
  },
  {
    id: 'REQ-2024-0042',
    type: 'API Access',
    service: 'Notification Service',
    status: 'rejected',
    requestedBy: 'John Doe',
    date: '2024-11-28',
  },
];

const stats = [
  { label: 'Pending', value: 3, icon: Clock, color: 'text-amber-600 bg-amber-100' },
  { label: 'In Review', value: 2, icon: Eye, color: 'text-blue-600 bg-blue-100' },
  { label: 'Approved', value: 15, icon: CheckCircle, color: 'text-emerald-600 bg-emerald-100' },
  { label: 'Rejected', value: 1, icon: XCircle, color: 'text-red-600 bg-red-100' },
];

export default function OrganizationRequestsPage() {
  return (
    <>
      <PageHeader
        title="Requests & Approvals"
        description="Track and manage your API access requests"
        breadcrumbs={[
          { label: 'Dashboard', href: routes.dashboard('organization') },
          { label: 'Requests' },
        ]}
        actions={
          <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Request
          </button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <DataTable
        title="Request History"
        subtitle="All requests from your organization"
        columns={[
          { key: 'id', label: 'Request ID' },
          { key: 'type', label: 'Type' },
          { key: 'service', label: 'Service' },
          {
            key: 'status',
            label: 'Status',
            render: (item) => (
              <StatusBadge
                status={
                  item.status === 'approved' ? 'success' :
                  item.status === 'pending' ? 'pending' :
                  item.status === 'in_review' ? 'info' : 'error'
                }
                label={
                  item.status === 'in_review' ? 'In Review' :
                  item.status.charAt(0).toUpperCase() + item.status.slice(1)
                }
              />
            ),
          },
          { key: 'requestedBy', label: 'Requested By' },
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
