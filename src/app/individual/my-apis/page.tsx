'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  MoreVertical,
  ExternalLink,
  Key,
  BarChart3,
  Settings,
  Trash2,
  Shield,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getApplicationSubscriptions, getAPIService, cancelSubscription, type APISubscription, type APIService } from '@/lib/api/catalog';

interface EnrichedSubscription {
  id: string;
  apiId: string;
  name: string;
  version: string;
  status: 'active' | 'suspended' | 'deprecated';
  subscribedAt: string;
  lastUsed: string;
  requestsThisMonth: number;
  quota: number;
  apiKey: string;
  deprecationNotice?: string;
}

// Mock data as fallback (will be replaced by real API)
const subscribedApis_unused = [
  {
    id: 'tax-calculation',
    name: 'API คำนวณภาษี',
    version: '2.1.0',
    status: 'active' as const,
    subscribedAt: '2024-10-15',
    lastUsed: '2 ชั่วโมงที่แล้ว',
    requestsThisMonth: 15420,
    quota: 50000,
    apiKey: 'exk_live_****7890',
  },
  {
    id: 'payment-gateway',
    name: 'API ชำระเงิน',
    version: '3.0.1',
    status: 'active' as const,
    subscribedAt: '2024-09-01',
    lastUsed: '5 ชั่วโมงที่แล้ว',
    requestsThisMonth: 8750,
    quota: 30000,
    apiKey: 'exk_live_****4567',
  },
  {
    id: 'product-lookup',
    name: 'API ค้นหาสินค้า',
    version: '2.3.1',
    status: 'active' as const,
    subscribedAt: '2024-11-01',
    lastUsed: '1 วันที่แล้ว',
    requestsThisMonth: 2340,
    quota: 20000,
    apiKey: 'exk_live_****1234',
  },
  {
    id: 'legacy-tax',
    name: 'API ภาษี (เวอร์ชันเก่า)',
    version: '1.0.0',
    status: 'deprecated' as const,
    subscribedAt: '2024-01-15',
    lastUsed: '30 วันที่แล้ว',
    requestsThisMonth: 0,
    quota: 10000,
    apiKey: 'exk_live_****9999',
    deprecationNotice: 'API นี้จะหยุดให้บริการในวันที่ 31 ธ.ค. 2567 กรุณาเปลี่ยนไปใช้ API คำนวณภาษี v2.1.0',
  },
];

const statusConfig = {
  active: { label: 'ใช้งานอยู่', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
  suspended: { label: 'ระงับชั่วคราว', color: 'bg-amber-100 text-amber-700', icon: AlertCircle },
  deprecated: { label: 'เลิกใช้', color: 'bg-red-100 text-red-700', icon: AlertCircle },
  pending: { label: 'รอการอนุมัติ', color: 'bg-blue-100 text-blue-700', icon: AlertCircle },
  cancelled: { label: 'ยกเลิกแล้ว', color: 'bg-gray-100 text-gray-700', icon: AlertCircle },
};

export default function MyApisPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [subscriptions, setSubscriptions] = useState<EnrichedSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // TODO: Get application_id from session/context
  // For now, use a hardcoded ID or create a new application
  const applicationId = 'temp-app-id-123';

  useEffect(() => {
    async function fetchSubscriptions() {
      try {
        setLoading(true);
        setError(null);

        // Fetch subscriptions - Note: This will likely return empty for now
        // In production, this should get applicationId from authenticated session
        const response = await getApplicationSubscriptions(applicationId);

        if (response.success && response.data) {
          const subs: APISubscription[] = response.data;

          // Fetch service details for each subscription
          const enrichedSubs = await Promise.all(
            subs.map(async (sub) => {
              try {
                const serviceResponse = await getAPIService(sub.service_id);
                const service: APIService = serviceResponse.success ? serviceResponse.data : null;

                return {
                  id: sub.id,
                  apiId: sub.service_id,
                  name: service?.name || 'Unknown API',
                  version: '1.0.0', // TODO: Get from version_id
                  status: sub.status as 'active' | 'suspended' | 'deprecated',
                  subscribedAt: new Date(sub.created_at).toLocaleDateString('th-TH'),
                  lastUsed: 'ไม่มีข้อมูล',
                  requestsThisMonth: 0,
                  quota: 10000,
                  apiKey: `exk_${sub.environment}_****${sub.id.slice(-4)}`,
                  deprecationNotice: service?.status === 'deprecated' ? 'API นี้กำลังจะหยุดให้บริการ' : undefined,
                };
              } catch (err) {
                console.error(`Failed to fetch service ${sub.service_id}:`, err);
                return {
                  id: sub.id,
                  apiId: sub.service_id,
                  name: 'Unknown API',
                  version: '1.0.0',
                  status: 'active' as const,
                  subscribedAt: new Date(sub.created_at).toLocaleDateString('th-TH'),
                  lastUsed: 'ไม่มีข้อมูล',
                  requestsThisMonth: 0,
                  quota: 10000,
                  apiKey: `exk_${sub.environment}_****${sub.id.slice(-4)}`,
                };
              }
            })
          );

          setSubscriptions(enrichedSubs);
        } else {
          // No subscriptions yet - show empty state
          setSubscriptions([]);
        }
      } catch (err) {
        console.error('Failed to fetch subscriptions:', err);
        setError('ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง');
      } finally {
        setLoading(false);
      }
    }

    fetchSubscriptions();
  }, [applicationId]);

  const filteredApis = subscriptions.filter((api) =>
    api.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeApis = filteredApis.filter((api) => api.status === 'active');
  const deprecatedApis = filteredApis.filter((api) => api.status === 'deprecated');

  const handleUnsubscribe = async (subscriptionId: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะยกเลิกการสมัคร API นี้?')) return;

    try {
      const response = await cancelSubscription(subscriptionId);
      if (response.success) {
        setSubscriptions(subscriptions.filter(s => s.id !== subscriptionId));
        alert('ยกเลิกการสมัครสำเร็จ');
      }
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      alert('ไม่สามารถยกเลิกการสมัครได้');
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">API ของฉัน</h1>
          <p className="text-gray-500 mt-1">จัดการ API ที่คุณสมัครใช้งาน</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">API ของฉัน</h1>
          <p className="text-gray-500 mt-1">จัดการ API ที่คุณสมัครใช้งาน</p>
        </div>
        <div className="bg-red-50 rounded-xl border border-red-200 p-12 text-center">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            ลองใหม่อีกครั้ง
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">API ของฉัน</h1>
          <p className="text-gray-500 mt-1">จัดการ API ที่คุณสมัครใช้งาน</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหา API..."
              className="w-64 pl-10 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <Link
            href="/individual/catalog"
            className="px-4 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
          >
            + เพิ่ม API
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary-50 rounded-lg">
              <Shield className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{activeApis.length}</p>
              <p className="text-sm text-gray-500">API ที่ใช้งาน</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 rounded-lg">
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {subscriptions.reduce((sum, api) => sum + api.requestsThisMonth, 0).toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">Requests เดือนนี้</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 rounded-lg">
              <Key className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{subscriptions.length}</p>
              <p className="text-sm text-gray-500">API Keys</p>
            </div>
          </div>
        </div>
      </div>

      {/* Deprecated Notice */}
      {deprecatedApis.length > 0 && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800">
              คุณมี {deprecatedApis.length} API ที่กำลังจะหยุดให้บริการ
            </p>
            <p className="text-sm text-amber-700 mt-1">
              กรุณาตรวจสอบและเปลี่ยนไปใช้เวอร์ชันใหม่ก่อนที่จะถูกปิดใช้งาน
            </p>
          </div>
        </div>
      )}

      {/* API List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">API</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">สถานะ</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">การใช้งาน</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">API Key</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">ใช้ล่าสุด</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-gray-500"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredApis.map((api) => {
                const status = statusConfig[api.status];
                const usagePercent = (api.requestsThisMonth / api.quota) * 100;
                const StatusIcon = status.icon;

                return (
                  <tr key={api.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <Link
                          href={`/individual/catalog/${api.id}`}
                          className="font-medium text-gray-900 hover:text-primary-600"
                        >
                          {api.name}
                        </Link>
                        <p className="text-xs text-gray-400 mt-0.5">v{api.version}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full', status.color)}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-32">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-500">{api.requestsThisMonth.toLocaleString()}</span>
                          <span className="text-gray-400">/ {(api.quota / 1000)}K</span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              'h-full rounded-full transition-all',
                              usagePercent > 90 ? 'bg-red-500' :
                              usagePercent > 70 ? 'bg-amber-500' : 'bg-primary-500'
                            )}
                            style={{ width: `${Math.min(usagePercent, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-xs font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">
                        {api.apiKey}
                      </code>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {api.lastUsed}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="relative">
                        <button
                          onClick={() => setOpenMenuId(openMenuId === api.id ? null : api.id)}
                          className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {openMenuId === api.id && (
                          <>
                            <div
                              className="fixed inset-0 z-40"
                              onClick={() => setOpenMenuId(null)}
                            />
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                              <Link
                                href={`/individual/catalog/${api.id}`}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                onClick={() => setOpenMenuId(null)}
                              >
                                <ExternalLink className="w-4 h-4" />
                                ดูรายละเอียด
                              </Link>
                              <Link
                                href={`/individual/credentials?api=${api.id}`}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                onClick={() => setOpenMenuId(null)}
                              >
                                <Key className="w-4 h-4" />
                                จัดการ API Key
                              </Link>
                              <Link
                                href={`/individual/usage?api=${api.id}`}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                onClick={() => setOpenMenuId(null)}
                              >
                                <BarChart3 className="w-4 h-4" />
                                ดูสถิติการใช้งาน
                              </Link>
                              <hr className="my-1 border-gray-100" />
                              <button
                                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                onClick={() => {
                                  setOpenMenuId(null);
                                  handleUnsubscribe(api.id);
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                                ยกเลิกการสมัคร
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredApis.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-gray-500">ไม่พบ API ที่ตรงกับการค้นหา</p>
          </div>
        )}
      </div>
    </div>
  );
}
