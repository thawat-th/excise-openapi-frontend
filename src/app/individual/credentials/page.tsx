'use client';

import { useState } from 'react';
import {
  Key,
  Copy,
  Check,
  Eye,
  EyeOff,
  RefreshCw,
  Trash2,
  Plus,
  Shield,
  AlertTriangle,
  Clock,
  MoreVertical,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock API Keys
const mockApiKeys = [
  {
    id: 'key-1',
    name: 'Production Key',
    apiName: 'API คำนวณภาษี',
    key: 'exk_live_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6',
    prefix: 'exk_live_****o5p6',
    type: 'live' as const,
    createdAt: '2024-10-15',
    lastUsed: '2 ชั่วโมงที่แล้ว',
    expiresAt: '2025-10-15',
    status: 'active' as const,
  },
  {
    id: 'key-2',
    name: 'Test Key',
    apiName: 'API คำนวณภาษี',
    key: 'exk_test_z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4',
    prefix: 'exk_test_****l5k4',
    type: 'test' as const,
    createdAt: '2024-10-15',
    lastUsed: '1 วันที่แล้ว',
    expiresAt: null,
    status: 'active' as const,
  },
  {
    id: 'key-3',
    name: 'Payment Gateway Key',
    apiName: 'API ชำระเงิน',
    key: 'exk_live_q1w2e3r4t5y6u7i8o9p0a1s2d3f4g5h6',
    prefix: 'exk_live_****g5h6',
    type: 'live' as const,
    createdAt: '2024-09-01',
    lastUsed: '5 ชั่วโมงที่แล้ว',
    expiresAt: '2025-09-01',
    status: 'active' as const,
  },
  {
    id: 'key-4',
    name: 'Old Production Key',
    apiName: 'API ค้นหาสินค้า',
    key: 'exk_live_old1234567890abcdefghijklmno',
    prefix: 'exk_live_****lmno',
    type: 'live' as const,
    createdAt: '2024-01-01',
    lastUsed: '90 วันที่แล้ว',
    expiresAt: '2024-12-31',
    status: 'expiring' as const,
  },
];

const keyTypeConfig = {
  live: { label: 'Production', color: 'bg-emerald-100 text-emerald-700' },
  test: { label: 'Test', color: 'bg-blue-100 text-blue-700' },
};

const statusConfig = {
  active: { label: 'ใช้งานได้', color: 'text-emerald-600' },
  expiring: { label: 'ใกล้หมดอายุ', color: 'text-amber-600' },
  expired: { label: 'หมดอายุ', color: 'text-red-600' },
  revoked: { label: 'ถูกยกเลิก', color: 'text-gray-500' },
};

export default function CredentialsPage() {
  const [keys, setKeys] = useState(mockApiKeys);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const toggleKeyVisibility = (keyId: string) => {
    setVisibleKeys((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(keyId)) {
        newSet.delete(keyId);
      } else {
        newSet.add(keyId);
      }
      return newSet;
    });
  };

  const copyKey = (keyId: string, keyValue: string) => {
    navigator.clipboard.writeText(keyValue);
    setCopiedKey(keyId);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const expiringKeys = keys.filter((k) => k.status === 'expiring');

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ข้อมูลรับรอง</h1>
          <p className="text-gray-500 mt-1">จัดการ API Keys สำหรับเข้าถึง API</p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          สร้าง API Key ใหม่
        </button>
      </div>

      {/* Security Notice */}
      <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <Shield className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-amber-800">ความปลอดภัย API Key</p>
          <p className="text-sm text-amber-700 mt-1">
            อย่าเปิดเผย API Key ของคุณต่อสาธารณะ หรือเก็บไว้ใน source code ที่เปิดเผย ใช้ environment variables แทน
          </p>
        </div>
      </div>

      {/* Expiring Keys Warning */}
      {expiringKeys.length > 0 && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800">
              คุณมี {expiringKeys.length} API Key ที่ใกล้หมดอายุ
            </p>
            <p className="text-sm text-red-700 mt-1">
              กรุณาต่ออายุหรือสร้าง Key ใหม่เพื่อไม่ให้บริการหยุดชะงัก
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary-50 rounded-lg">
              <Key className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{keys.length}</p>
              <p className="text-sm text-gray-500">API Keys ทั้งหมด</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 rounded-lg">
              <Shield className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {keys.filter((k) => k.type === 'live').length}
              </p>
              <p className="text-sm text-gray-500">Production Keys</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 rounded-lg">
              <Key className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {keys.filter((k) => k.type === 'test').length}
              </p>
              <p className="text-sm text-gray-500">Test Keys</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 rounded-lg">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{expiringKeys.length}</p>
              <p className="text-sm text-gray-500">ใกล้หมดอายุ</p>
            </div>
          </div>
        </div>
      </div>

      {/* API Keys List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">ชื่อ Key</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">API</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">ประเภท</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">API Key</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">ใช้ล่าสุด</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">หมดอายุ</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-gray-500"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {keys.map((apiKey) => {
                const typeConfig = keyTypeConfig[apiKey.type];
                const status = statusConfig[apiKey.status];
                const isVisible = visibleKeys.has(apiKey.id);

                return (
                  <tr key={apiKey.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{apiKey.name}</div>
                      <div className="text-xs text-gray-400 mt-0.5">สร้างเมื่อ {apiKey.createdAt}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{apiKey.apiName}</td>
                    <td className="px-6 py-4">
                      <span className={cn('px-2.5 py-1 text-xs font-medium rounded-full', typeConfig.color)}>
                        {typeConfig.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <code className="text-xs font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">
                          {isVisible ? apiKey.key : apiKey.prefix}
                        </code>
                        <button
                          onClick={() => toggleKeyVisibility(apiKey.id)}
                          className="p-1.5 text-gray-400 hover:text-gray-600 rounded"
                        >
                          {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => copyKey(apiKey.id, apiKey.key)}
                          className="p-1.5 text-gray-400 hover:text-gray-600 rounded"
                        >
                          {copiedKey === apiKey.id ? (
                            <Check className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{apiKey.lastUsed}</td>
                    <td className="px-6 py-4">
                      {apiKey.expiresAt ? (
                        <span className={cn('text-sm', status.color)}>
                          {apiKey.expiresAt}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">ไม่หมดอายุ</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="relative">
                        <button
                          onClick={() => setOpenMenuId(openMenuId === apiKey.id ? null : apiKey.id)}
                          className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {openMenuId === apiKey.id && (
                          <>
                            <div
                              className="fixed inset-0 z-40"
                              onClick={() => setOpenMenuId(null)}
                            />
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                              <button
                                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                onClick={() => {
                                  setOpenMenuId(null);
                                  // Handle regenerate
                                }}
                              >
                                <RefreshCw className="w-4 h-4" />
                                สร้างใหม่
                              </button>
                              <hr className="my-1 border-gray-100" />
                              <button
                                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                onClick={() => {
                                  setOpenMenuId(null);
                                  // Handle revoke
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                                ยกเลิก Key
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
      </div>

      {/* Create Key Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">สร้าง API Key ใหม่</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ Key</label>
                <input
                  type="text"
                  placeholder="เช่น Production Key"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">เลือก API</label>
                <select className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option>API คำนวณภาษี</option>
                  <option>API ชำระเงิน</option>
                  <option>API ค้นหาสินค้า</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ประเภท</label>
                <div className="flex gap-3">
                  <label className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input type="radio" name="type" value="live" className="text-primary-600" />
                    <span className="text-sm">Production</span>
                  </label>
                  <label className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input type="radio" name="type" value="test" defaultChecked className="text-primary-600" />
                    <span className="text-sm">Test</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  // In real app, this would create the key
                }}
                className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                สร้าง Key
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
