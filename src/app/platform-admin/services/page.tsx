'use client';

import { useState, useEffect } from 'react';
import { PageHeader, DataTable, StatusBadge } from '@/components/dashboard';
import { Plus, Search, Edit, Trash2, MoreHorizontal } from 'lucide-react';
import { listAPIServices, listCategories, deleteAPIService, publishAPIService, type APIService, type APICategory } from '@/lib/api/catalog';

// Demo data for wireframe review (used when backend is unavailable)
const DEMO_SERVICES: APIService[] = [
  { id: 'svc-001', name: 'Tax Calculation API', slug: 'tax-calculation', description: 'API สำหรับคำนวณภาษีสรรพสามิต', status: 'published', visibility: 'public', api_type: 'rest', category_id: 'cat-001', provider_id: 'prv-001', created_at: '2025-11-01T00:00:00Z', updated_at: '2025-12-15T00:00:00Z' },
  { id: 'svc-002', name: 'License Verification API', slug: 'license-verification', description: 'ตรวจสอบใบอนุญาตสรรพสามิต', status: 'published', visibility: 'public', api_type: 'rest', category_id: 'cat-002', provider_id: 'prv-001', created_at: '2025-11-05T00:00:00Z', updated_at: '2025-12-20T00:00:00Z' },
  { id: 'svc-003', name: 'Document Processing API', slug: 'document-processing', description: 'จัดการเอกสารอิเล็กทรอนิกส์', status: 'draft', visibility: 'internal', api_type: 'rest', category_id: 'cat-001', provider_id: 'prv-002', created_at: '2025-12-01T00:00:00Z', updated_at: '2025-12-28T00:00:00Z' },
  { id: 'svc-004', name: 'Payment Gateway API', slug: 'payment-gateway', description: 'ชำระเงินค่าภาษีผ่าน e-Payment', status: 'published', visibility: 'private', api_type: 'rest', category_id: 'cat-003', provider_id: 'prv-001', created_at: '2025-10-15T00:00:00Z', updated_at: '2025-12-10T00:00:00Z' },
  { id: 'svc-005', name: 'Notification Service', slug: 'notification-service', description: 'แจ้งเตือนผ่าน SMS/Email/LINE', status: 'draft', visibility: 'internal', api_type: 'rest', category_id: 'cat-004', provider_id: 'prv-003', created_at: '2025-12-10T00:00:00Z', updated_at: '2025-12-25T00:00:00Z' },
  { id: 'svc-006', name: 'Stamp Duty Calculation', slug: 'stamp-duty', description: 'คำนวณอากรแสตมป์', status: 'deprecated', visibility: 'public', api_type: 'rest', category_id: 'cat-001', provider_id: 'prv-001', created_at: '2025-06-01T00:00:00Z', updated_at: '2025-11-30T00:00:00Z' },
] as APIService[];

const DEMO_CATEGORIES = new Map<string, APICategory>([
  ['cat-001', { id: 'cat-001', name_th: 'การคำนวณภาษี', name_en: 'Tax Calculation', code: 'TAX', level: 1, display_order: 1, is_active: true } as APICategory],
  ['cat-002', { id: 'cat-002', name_th: 'ใบอนุญาต', name_en: 'Licensing', code: 'LIC', level: 1, display_order: 2, is_active: true } as APICategory],
  ['cat-003', { id: 'cat-003', name_th: 'การชำระเงิน', name_en: 'Payment', code: 'PAY', level: 1, display_order: 3, is_active: true } as APICategory],
  ['cat-004', { id: 'cat-004', name_th: 'การแจ้งเตือน', name_en: 'Notification', code: 'NTF', level: 1, display_order: 4, is_active: true } as APICategory],
]);

export default function PlatformAdminServicesPage() {
  const [services, setServices] = useState<APIService[]>([]);
  const [categories, setCategories] = useState<Map<string, APICategory>>(new Map());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        const [servicesResponse, categoriesResponse] = await Promise.all([
          listAPIServices({}),
          listCategories(undefined, true),
        ]);

        if (categoriesResponse.success && categoriesResponse.data) {
          const catMap = new Map<string, APICategory>();
          categoriesResponse.data.forEach((cat: APICategory) => {
            catMap.set(cat.id, cat);
          });
          setCategories(catMap);
        }

        if (servicesResponse.success && servicesResponse.data && servicesResponse.data.length > 0) {
          setServices(servicesResponse.data);
        } else {
          // Fallback to demo data when backend is unavailable
          setServices(DEMO_SERVICES);
          setCategories(DEMO_CATEGORIES);
        }
      } catch (error) {
        console.error('Failed to fetch services:', error);
        // Fallback to demo data when backend is unavailable
        setServices(DEMO_SERVICES);
        setCategories(DEMO_CATEGORIES);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบ API Service นี้?')) return;

    try {
      const response = await deleteAPIService(id);
      if (response.success) {
        setServices(services.filter(s => s.id !== id));
        alert('ลบ API Service สำเร็จ');
      }
    } catch (error) {
      console.error('Failed to delete service:', error);
      alert('ไม่สามารถลบ API Service ได้');
    }
  };

  const handlePublish = async (id: string) => {
    try {
      const response = await publishAPIService(id);
      if (response.success) {
        setServices(services.map(s =>
          s.id === id ? { ...s, status: 'published' } : s
        ));
        alert('เผยแพร่ API Service สำเร็จ');
      }
    } catch (error) {
      console.error('Failed to publish service:', error);
      alert('ไม่สามารถเผยแพร่ API Service ได้');
    }
  };

  const statusCounts = {
    all: services.length,
    published: services.filter(s => s.status === 'published').length,
    draft: services.filter(s => s.status === 'draft').length,
    deprecated: services.filter(s => s.status === 'deprecated').length,
  };

  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredByStatus = statusFilter === 'all'
    ? filteredServices
    : filteredServices.filter(s => s.status === statusFilter);

  return (
    <>
      <PageHeader
        title="API Services"
        description="จัดการ API Services บนแพลตฟอร์ม"
        breadcrumbs={[
          { label: 'Overview', href: '/platform-admin/dashboard' },
          { label: 'API Services' },
        ]}
        actions={
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-3.5 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            เพิ่ม Service
          </button>
        }
      />

      {/* Toolbar: search + status filter */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="ค้นหา..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-300 dark:focus:ring-slate-600 placeholder-gray-400"
          />
        </div>
        <div className="flex items-center gap-1 text-xs">
          {(['all', 'published', 'draft', 'deprecated'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                statusFilter === s
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
              }`}
            >
              {s === 'all' ? 'ทั้งหมด' : s === 'published' ? 'เผยแพร่' : s === 'draft' ? 'ร่าง' : 'เลิกใช้'}
              <span className="ml-1.5 text-[10px] opacity-60">{statusCounts[s]}</span>
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-16 text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-200 border-t-gray-600 mx-auto"></div>
        </div>
      ) : (
        <DataTable
          onRowClick={(item: APIService) => {
            window.location.href = `/platform-admin/services/${item.id}`;
          }}
          columns={[
            {
              key: 'name',
              label: 'Service',
              sortable: true,
              render: (item: APIService) => (
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                  <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5 line-clamp-1">{item.description}</p>
                </div>
              ),
            },
            {
              key: 'category',
              label: 'Category',
              sortable: true,
              sortKey: 'category_id',
              render: (item: APIService) => (
                <span className="text-gray-500 dark:text-slate-400">
                  {categories.get(item.category_id)?.name_th || '-'}
                </span>
              ),
            },
            {
              key: 'status',
              label: 'Status',
              sortable: true,
              render: (item: APIService) => (
                <StatusBadge
                  status={
                    item.status === 'published' ? 'success' :
                    item.status === 'draft' ? 'warning' :
                    item.status === 'deprecated' ? 'danger' : 'info'
                  }
                  label={
                    item.status === 'published' ? 'Published' :
                    item.status === 'draft' ? 'Draft' :
                    item.status === 'deprecated' ? 'Deprecated' : 'Archived'
                  }
                />
              ),
            },
            {
              key: 'visibility',
              label: 'Visibility',
              sortable: true,
              render: (item: APIService) => (
                <span className="text-gray-500 dark:text-slate-400">
                  {item.visibility === 'public' ? 'Public' : item.visibility === 'private' ? 'Private' : 'Internal'}
                </span>
              )
            },
            {
              key: 'api_type',
              label: 'Type',
              sortable: true,
              render: (item: APIService) => (
                <span className="font-mono text-gray-400 dark:text-slate-500 uppercase tracking-wide">{item.api_type}</span>
              )
            },
            {
              key: 'updated_at',
              label: 'Updated',
              sortable: true,
              render: (item: APIService) => (
                <span className="text-gray-400 dark:text-slate-500 tabular-nums">
                  {new Date(item.updated_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
              )
            },
            {
              key: 'actions',
              label: '',
              sortable: false,
              render: (item: APIService) => (
                <div className="flex items-center justify-end gap-0.5" onClick={(e) => e.stopPropagation()}>
                  <button
                    className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 rounded transition-colors"
                    title="แก้ไข"
                    onClick={() => window.location.href = `/platform-admin/services/${item.id}/edit`}
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    className="p-1.5 text-gray-400 hover:text-red-500 rounded transition-colors"
                    title="ลบ"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ),
            },
          ]}
          data={filteredByStatus}
        />
      )}

      {/* Create Service Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-lg w-full p-6 border border-gray-200 dark:border-slate-700">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-2">เพิ่ม API Service</h2>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">ฟังก์ชันนี้อยู่ระหว่างพัฒนา</p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-3.5 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-700 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
