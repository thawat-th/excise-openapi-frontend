'use client';

import { useState } from 'react';
import { PageHeader, DataTable, StatusBadge } from '@/components/dashboard';
import { Layers, Search, Filter, ExternalLink, BookOpen } from 'lucide-react';
import { routes } from '@/lib/routes';

const services = [
  { id: 1, name: 'Tax Calculation API', version: 'v2.1', category: 'Tax', status: 'subscribed', calls: '45,230' },
  { id: 2, name: 'License Verification API', version: 'v1.5', category: 'License', status: 'subscribed', calls: '12,847' },
  { id: 3, name: 'Document Processing API', version: 'v3.0', category: 'Document', status: 'available', calls: '-' },
  { id: 4, name: 'Payment Gateway API', version: 'v2.0', category: 'Payment', status: 'subscribed', calls: '8,521' },
  { id: 5, name: 'Report Generation API', version: 'v1.2', category: 'Report', status: 'available', calls: '-' },
  { id: 6, name: 'Notification Service API', version: 'v1.0', category: 'Utility', status: 'pending', calls: '-' },
];

export default function OrganizationServicesPage() {
  const [activeTab, setActiveTab] = useState<'catalog' | 'subscribed'>('catalog');

  const filteredServices = activeTab === 'subscribed'
    ? services.filter(s => s.status === 'subscribed')
    : services;

  return (
    <>
      <PageHeader
        title="Services & APIs"
        description="Browse available APIs and manage your subscriptions"
        breadcrumbs={[
          { label: 'Dashboard', href: routes.dashboard('organization') },
          { label: 'Services & APIs' },
        ]}
      />

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 mb-6">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'catalog'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Layers className="w-4 h-4 inline-block mr-2" />
              Service Catalog
            </button>
            <button
              onClick={() => setActiveTab('subscribed')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'subscribed'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              My Subscriptions
              <span className="ml-2 px-2 py-0.5 text-xs bg-primary-100 text-primary-700 rounded-full">
                {services.filter(s => s.status === 'subscribed').length}
              </span>
            </button>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="p-4 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search services..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
      </div>

      <DataTable
        columns={[
          {
            key: 'name',
            label: 'Service',
            render: (item) => (
              <div>
                <p className="font-medium text-gray-900">{item.name}</p>
                <p className="text-sm text-gray-500">{item.version}</p>
              </div>
            ),
          },
          { key: 'category', label: 'Category' },
          {
            key: 'status',
            label: 'Status',
            render: (item) => (
              <StatusBadge
                status={
                  item.status === 'subscribed' ? 'success' :
                  item.status === 'pending' ? 'warning' : 'info'
                }
                label={item.status.charAt(0).toUpperCase() + item.status.slice(1)}
              />
            ),
          },
          {
            key: 'calls',
            label: 'API Calls',
            render: (item) => (
              <span className="text-gray-900">{item.calls}</span>
            ),
          },
          {
            key: 'actions',
            label: 'Actions',
            render: (item) => (
              <div className="flex items-center gap-3">
                <button className="text-primary-600 hover:text-primary-700 flex items-center gap-1 text-sm">
                  <BookOpen className="w-4 h-4" />
                  Docs
                </button>
                {item.status !== 'subscribed' && (
                  <button className="text-primary-600 hover:text-primary-700 flex items-center gap-1 text-sm">
                    <ExternalLink className="w-4 h-4" />
                    Subscribe
                  </button>
                )}
              </div>
            ),
          },
        ]}
        data={filteredServices}
      />
    </>
  );
}
