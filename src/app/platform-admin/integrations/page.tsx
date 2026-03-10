'use client';

import { PageHeader, StatusBadge } from '@/components/dashboard';
import { Plug, Plus, Settings, ExternalLink, RefreshCw, CheckCircle, XCircle } from 'lucide-react';

const integrations = [
  {
    id: 1,
    name: 'Ory Hydra',
    description: 'OAuth 2.0 and OpenID Connect provider',
    category: 'Authentication',
    status: 'connected',
    lastSync: '2024-12-02 14:30',
    icon: '🔐',
  },
  {
    id: 2,
    name: 'Kong Gateway',
    description: 'API Gateway and Management',
    category: 'API Management',
    status: 'connected',
    lastSync: '2024-12-02 14:32',
    icon: '🦍',
  },
  {
    id: 3,
    name: 'PostgreSQL',
    description: 'Primary database',
    category: 'Database',
    status: 'connected',
    lastSync: '2024-12-02 14:32',
    icon: '🐘',
  },
  {
    id: 4,
    name: 'Redis',
    description: 'Caching and session store',
    category: 'Cache',
    status: 'connected',
    lastSync: '2024-12-02 14:32',
    icon: '⚡',
  },
  {
    id: 5,
    name: 'Elasticsearch',
    description: 'Search and analytics engine',
    category: 'Search',
    status: 'connected',
    lastSync: '2024-12-02 14:30',
    icon: '🔍',
  },
  {
    id: 6,
    name: 'Grafana',
    description: 'Monitoring and observability',
    category: 'Monitoring',
    status: 'connected',
    lastSync: '2024-12-02 14:25',
    icon: '📊',
  },
  {
    id: 7,
    name: 'NDID',
    description: 'National Digital ID verification',
    category: 'Identity',
    status: 'disconnected',
    lastSync: 'Never',
    icon: '🆔',
  },
  {
    id: 8,
    name: 'SMTP Server',
    description: 'Email delivery service',
    category: 'Communication',
    status: 'connected',
    lastSync: '2024-12-02 14:00',
    icon: '📧',
  },
];

const webhooks = [
  { id: 1, name: 'New Registration', url: 'https://hooks.excise.go.th/registration', events: ['user.created', 'org.created'], status: 'active' },
  { id: 2, name: 'API Activity', url: 'https://hooks.excise.go.th/activity', events: ['api.call', 'api.error'], status: 'active' },
  { id: 3, name: 'Alerts', url: 'https://hooks.excise.go.th/alerts', events: ['alert.triggered'], status: 'active' },
];

export default function PlatformAdminIntegrationsPage() {
  return (
    <>
      <PageHeader
        title="Integrations"
        description="Manage external service connections"
        breadcrumbs={[
          { label: 'Overview', href: '/platform-admin/dashboard' },
          { label: 'System' },
          { label: 'Integrations' },
        ]}
        actions={
          <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Integration
          </button>
        }
      />

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {integrations.map((integration) => (
          <div
            key={integration.id}
            className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{integration.icon}</span>
                <div>
                  <h3 className="font-semibold text-gray-900">{integration.name}</h3>
                  <span className="text-xs text-gray-500">{integration.category}</span>
                </div>
              </div>
              {integration.status === 'connected' ? (
                <CheckCircle className="w-5 h-5 text-emerald-500" />
              ) : (
                <XCircle className="w-5 h-5 text-gray-400" />
              )}
            </div>

            <p className="text-sm text-gray-600 mb-4">{integration.description}</p>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div>
                <span className={`px-2 py-1 text-xs font-medium rounded ${
                  integration.status === 'connected'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {integration.status === 'connected' ? 'Connected' : 'Disconnected'}
                </span>
                <p className="text-xs text-gray-500 mt-1">Last sync: {integration.lastSync}</p>
              </div>
              <div className="flex items-center gap-1">
                <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Webhooks */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Plug className="w-6 h-6 text-gray-400" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Webhooks</h3>
                <p className="text-sm text-gray-500">Outbound event notifications</p>
              </div>
            </div>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Webhook
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">URL</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Events</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {webhooks.map((webhook) => (
                <tr key={webhook.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{webhook.name}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <code className="text-sm text-gray-600">{webhook.url}</code>
                      <ExternalLink className="w-4 h-4 text-gray-400" />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {webhook.events.map((event, idx) => (
                        <span key={idx} className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                          {event}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status="success" label="Active" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                        <RefreshCw className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                        <Settings className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
