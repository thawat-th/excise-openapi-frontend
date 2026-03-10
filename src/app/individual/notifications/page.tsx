'use client';

import { PageHeader, ActivityItem } from '@/components/dashboard';
import { Bell, CheckCircle, AlertTriangle, Info, Settings } from 'lucide-react';
import { routes } from '@/lib/routes';

const notifications = [
  {
    id: 1,
    type: 'success',
    title: 'Request Approved',
    description: 'Your request #REQ-2024-001 has been approved. You can now access the Tax Filing Service.',
    time: '2 hours ago',
    read: false,
  },
  {
    id: 2,
    type: 'info',
    title: 'New Feature Available',
    description: 'Check out the new Document Verification service now available in the catalog.',
    time: '5 hours ago',
    read: false,
  },
  {
    id: 3,
    type: 'warning',
    title: 'Action Required',
    description: 'Please complete your profile to access all services.',
    time: '1 day ago',
    read: true,
  },
  {
    id: 4,
    type: 'info',
    title: 'System Maintenance',
    description: 'Scheduled maintenance on December 15, 2024 from 02:00 - 04:00 AM.',
    time: '2 days ago',
    read: true,
  },
];

const getIcon = (type: string) => {
  switch (type) {
    case 'success':
      return <CheckCircle className="w-5 h-5 text-emerald-500" />;
    case 'warning':
      return <AlertTriangle className="w-5 h-5 text-amber-500" />;
    case 'info':
    default:
      return <Info className="w-5 h-5 text-blue-500" />;
  }
};

export default function IndividualNotificationsPage() {
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <>
      <PageHeader
        title="Notifications"
        description={`You have ${unreadCount} unread notifications`}
        breadcrumbs={[
          { label: 'Dashboard', href: routes.dashboard('individual') },
          { label: 'Notifications' },
        ]}
        actions={
          <button className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </button>
        }
      />

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-gray-500" />
            <span className="font-medium text-gray-900">All Notifications</span>
          </div>
          <button className="text-sm text-primary-600 hover:text-primary-700">
            Mark all as read
          </button>
        </div>
        <div className="divide-y divide-gray-100">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={notification.read ? 'opacity-60' : ''}
            >
              <ActivityItem
                icon={getIcon(notification.type)}
                title={notification.title}
                description={notification.description}
                time={notification.time}
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
