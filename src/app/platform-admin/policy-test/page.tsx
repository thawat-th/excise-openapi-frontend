'use client';

import { PageHeader } from '@/components/dashboard';
import { PlayCircle, CheckCircle, XCircle, Info } from 'lucide-react';

export default function PlatformAdminPolicyTestPage() {
  return (
    <>
      <PageHeader
        title="Policy Simulator"
        description="Test and validate policies before deployment"
        breadcrumbs={[
          { label: 'Overview', href: '/platform-admin/dashboard' },
          { label: 'Policies & Security' },
          { label: 'Policy Simulator' },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Request</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Policy
              </label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
                <option>Default Rate Limit</option>
                <option>Production Authentication</option>
                <option>IP Whitelist - Government</option>
                <option>Payment API Security</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Request Context (JSON)
              </label>
              <textarea
                rows={10}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-primary-500"
                defaultValue={`{
  "client_id": "client_prod_abc123",
  "organization": "acme-corp",
  "api": "/api/v1/tax/calculate",
  "method": "POST",
  "ip_address": "203.150.xxx.xxx",
  "headers": {
    "Authorization": "Bearer xxx",
    "Content-Type": "application/json"
  }
}`}
              />
            </div>

            <button className="w-full px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2">
              <PlayCircle className="w-5 h-5" />
              Run Simulation
            </button>
          </div>
        </div>

        {/* Result Panel */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Simulation Result</h3>

          {/* Success Example */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-6 h-6 text-emerald-500" />
              <span className="font-semibold text-emerald-700">Request Allowed</span>
            </div>
            <p className="text-sm text-emerald-600">
              The request passed all policy checks and would be allowed.
            </p>
          </div>

          {/* Policy Evaluation Steps */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">Evaluation Steps:</h4>

            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Authentication Check</p>
                <p className="text-sm text-gray-500">Valid API key detected</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Rate Limit Check</p>
                <p className="text-sm text-gray-500">450 / 1000 requests used (45%)</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">API Access Check</p>
                <p className="text-sm text-gray-500">Client has subscription to Tax Calculation API</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
              <Info className="w-5 h-5 text-blue-500 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">IP Check</p>
                <p className="text-sm text-gray-500">IP not in whitelist, but whitelist not enforced for this API</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
