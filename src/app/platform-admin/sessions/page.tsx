'use client';

import { PageHeader, DataTable, StatusBadge } from '@/components/dashboard';
import { Monitor, Globe, Clock, X } from 'lucide-react';

const sessions = [
  { id: 1, user: 'john@acme.com', device: 'Chrome / Windows', ip: '203.150.xxx.xxx', location: 'Bangkok, TH', started: '2 hours ago', status: 'active' },
  { id: 2, user: 'jane@techstart.com', device: 'Safari / macOS', ip: '110.164.xxx.xxx', location: 'Chiang Mai, TH', started: '5 hours ago', status: 'active' },
  { id: 3, user: 'mike@global.com', device: 'Firefox / Linux', ip: '58.97.xxx.xxx', location: 'Phuket, TH', started: '1 day ago', status: 'idle' },
  { id: 4, user: 'sarah@newco.com', device: 'Edge / Windows', ip: '49.228.xxx.xxx', location: 'Pattaya, TH', started: '3 days ago', status: 'expired' },
];

export default function PlatformAdminSessionsPage() {
  return (
    <>
      <PageHeader
        title="Active Sessions"
        description="Monitor and manage user sessions across the platform"
        breadcrumbs={[
          { label: 'Overview', href: '/platform-admin/dashboard' },
          { label: 'User & Access' },
          { label: 'Active Sessions' },
        ]}
        actions={
          <button className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2">
            <X className="w-4 h-4" />
            Revoke All Sessions
          </button>
        }
      />

      <DataTable
        title="Current Sessions"
        subtitle="Active user sessions on the platform"
        columns={[
          {
            key: 'user',
            label: 'User',
            render: (item) => (
              <div className="flex items-center gap-3">
                <Monitor className="w-5 h-5 text-gray-400" />
                <span className="font-medium text-gray-900">{item.user}</span>
              </div>
            ),
          },
          { key: 'device', label: 'Device / Browser' },
          {
            key: 'location',
            label: 'Location',
            render: (item) => (
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-gray-400" />
                <span>{item.location}</span>
              </div>
            ),
          },
          { key: 'ip', label: 'IP Address' },
          {
            key: 'started',
            label: 'Session Started',
            render: (item) => (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span>{item.started}</span>
              </div>
            ),
          },
          {
            key: 'status',
            label: 'Status',
            render: (item) => (
              <StatusBadge
                status={item.status === 'active' ? 'success' : item.status === 'idle' ? 'warning' : 'error'}
                label={item.status.charAt(0).toUpperCase() + item.status.slice(1)}
              />
            ),
          },
          {
            key: 'actions',
            label: '',
            render: () => (
              <button className="px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg">
                Revoke
              </button>
            ),
          },
        ]}
        data={sessions}
      />
    </>
  );
}
