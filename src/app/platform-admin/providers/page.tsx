'use client';

import { useState, useEffect } from 'react';
import { PageHeader, DataTable, StatusBadge } from '@/components/dashboard';
import { Building2, Plus, Search, Edit, Trash2, Eye } from 'lucide-react';
import { listProviders, deleteProvider, type APIProvider } from '@/lib/api/catalog';

// Demo data for wireframe review
const DEMO_PROVIDERS: APIProvider[] = [
  { id: 'prv-001', name_th: 'กรมสรรพสามิต', name_en: 'Excise Department', code: 'EXCISE', abbreviation: 'กสพ.', is_internal: true, is_active: true, support_email: 'api@excise.go.th', support_phone: '02-241-5600' },
  { id: 'prv-002', name_th: 'กรมสรรพากร', name_en: 'Revenue Department', code: 'RD', abbreviation: 'กสก.', is_internal: false, is_active: true, support_email: 'api@rd.go.th', support_phone: '1161' },
  { id: 'prv-003', name_th: 'ธนาคารกรุงไทย', name_en: 'Krungthai Bank', code: 'KTB', abbreviation: 'กรุงไทย', is_internal: false, is_active: true, support_email: 'api@ktb.co.th', support_phone: '02-111-1111' },
  { id: 'prv-004', name_th: 'สำนักงานพัฒนารัฐบาลดิจิทัล', name_en: 'Digital Government Development Agency', code: 'DGA', abbreviation: 'สพร.', is_internal: false, is_active: true, support_email: 'contact@dga.or.th', support_phone: '02-612-6060' },
  { id: 'prv-005', name_th: 'กรมศุลกากร', name_en: 'Customs Department', code: 'CUSTOMS', abbreviation: 'กศก.', is_internal: false, is_active: false, support_email: '', support_phone: '' },
] as APIProvider[];

export default function PlatformAdminProvidersPage() {
  const [providers, setProviders] = useState<APIProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const response = await listProviders();

        if (response.success && response.data && response.data.length > 0) {
          setProviders(response.data);
        } else {
          setProviders(DEMO_PROVIDERS);
        }
      } catch (error) {
        console.error('Failed to fetch providers:', error);
        setProviders(DEMO_PROVIDERS);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const filteredProviders = providers.filter(
    (provider) =>
      provider.name_th.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบ Provider นี้?')) return;

    try {
      const response = await deleteProvider(id);
      if (response.success) {
        setProviders(providers.filter((p) => p.id !== id));
        alert('ลบ Provider สำเร็จ');
      }
    } catch (error) {
      console.error('Failed to delete provider:', error);
      alert('ไม่สามารถลบ Provider ได้');
    }
  };

  return (
    <>
      <PageHeader
        title="API Providers"
        description="จัดการองค์กรผู้ให้บริการ API"
        breadcrumbs={[
          { label: 'Overview', href: '/platform-admin/dashboard' },
          { label: 'API Catalog' },
          { label: 'Providers' },
        ]}
        actions={
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            เพิ่ม Provider
          </button>
        }
      />

      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="ค้นหา Providers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">กำลังโหลดข้อมูล...</p>
        </div>
      ) : (
        <DataTable
          columns={[
            {
              key: 'name',
              label: 'Provider',
              render: (item: APIProvider) => (
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary-100">
                    <Building2 className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{item.name_th}</p>
                    <p className="text-sm text-gray-500">{item.name_en}</p>
                  </div>
                </div>
              ),
            },
            {
              key: 'code',
              label: 'Code',
              render: (item: APIProvider) => (
                <span className="font-mono text-sm text-gray-600">{item.code}</span>
              ),
            },
            {
              key: 'abbreviation',
              label: 'Abbreviation',
              render: (item: APIProvider) => item.abbreviation || '-',
            },
            {
              key: 'type',
              label: 'Type',
              render: (item: APIProvider) => (
                <span className="text-sm text-gray-600">
                  {item.is_internal ? 'ภายใน' : 'ภายนอก'}
                </span>
              ),
            },
            {
              key: 'status',
              label: 'Status',
              render: (item: APIProvider) => (
                <StatusBadge
                  status={item.is_active ? 'success' : 'danger'}
                  label={item.is_active ? 'ใช้งาน' : 'ปิดใช้งาน'}
                />
              ),
            },
            {
              key: 'contact',
              label: 'Contact',
              render: (item: APIProvider) => (
                <div className="text-sm">
                  {item.support_email && <div>{item.support_email}</div>}
                  {item.support_phone && <div className="text-gray-500">{item.support_phone}</div>}
                  {!item.support_email && !item.support_phone && '-'}
                </div>
              ),
            },
            {
              key: 'actions',
              label: 'Actions',
              render: (item: APIProvider) => (
                <div className="flex items-center gap-2">
                  <button
                    className="p-2 text-gray-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg"
                    title="ดูรายละเอียด"
                    onClick={() => (window.location.href = `/platform-admin/providers/${item.id}`)}
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    className="p-2 text-gray-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg"
                    title="แก้ไข"
                    onClick={() => (window.location.href = `/platform-admin/providers/${item.id}/edit`)}
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    className="p-2 text-gray-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                    title="ลบ"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ),
            },
          ]}
          data={filteredProviders}
        />
      )}

      {/* Create Provider Modal - Placeholder */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">เพิ่ม Provider ใหม่</h2>
            <p className="text-gray-500 mb-6">ฟีเจอร์นี้กำลังพัฒนา กรุณาใช้งานผ่าน REST API โดยตรง</p>
            <button
              onClick={() => setShowCreateModal(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              ปิด
            </button>
          </div>
        </div>
      )}
    </>
  );
}
