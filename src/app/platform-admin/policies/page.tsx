'use client';

import { PageHeader } from '@/components/dashboard';
import { ScrollText, Plus, Edit, Trash2, Shield, Clock, Users } from 'lucide-react';

const policies = [
  {
    id: 1,
    name: 'Default Rate Limit',
    type: 'Rate Limiting',
    scope: 'Global',
    status: 'active',
    lastModified: '2024-11-15',
    description: 'Default rate limiting policy for all API consumers',
  },
  {
    id: 2,
    name: 'Production Authentication',
    type: 'Authentication',
    scope: 'Production',
    status: 'active',
    lastModified: '2024-10-20',
    description: 'Require API key or OAuth2 for production environment',
  },
  {
    id: 3,
    name: 'IP Whitelist - Government',
    type: 'Access Control',
    scope: 'Government APIs',
    status: 'active',
    lastModified: '2024-09-10',
    description: 'Allow only whitelisted government IPs',
  },
  {
    id: 4,
    name: 'Payment API Security',
    type: 'Security',
    scope: 'Payment Gateway API',
    status: 'active',
    lastModified: '2024-08-05',
    description: 'Enhanced security rules for payment processing',
  },
];

const typeIcons: Record<string, React.ReactNode> = {
  'Rate Limiting': <Clock className="w-5 h-5" />,
  'Authentication': <Shield className="w-5 h-5" />,
  'Access Control': <Users className="w-5 h-5" />,
  'Security': <Shield className="w-5 h-5" />,
};

export default function PlatformAdminPoliciesPage() {
  return (
    <>
      <PageHeader
        title="Policy Management"
        description="Configure platform security and access policies"
        breadcrumbs={[
          { label: 'Overview', href: '/platform-admin/dashboard' },
          { label: 'Policies & Security' },
          { label: 'Policy Management' },
        ]}
        actions={
          <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create Policy
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {policies.map((policy) => (
          <div
            key={policy.id}
            className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-primary-100 text-primary-600">
                  {typeIcons[policy.type] || <ScrollText className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{policy.name}</h3>
                  <span className="text-sm text-gray-500">{policy.type}</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                  <Edit className="w-4 h-4" />
                </button>
                <button className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-4">{policy.description}</p>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex items-center gap-4">
                <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                  {policy.scope}
                </span>
                <span className="px-2 py-1 text-xs bg-emerald-100 text-emerald-700 rounded">
                  Active
                </span>
              </div>
              <span className="text-xs text-gray-500">Modified {policy.lastModified}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
