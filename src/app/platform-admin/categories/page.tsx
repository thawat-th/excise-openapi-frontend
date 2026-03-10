'use client';

import { useState, useEffect } from 'react';
import { PageHeader, DataTable, StatusBadge } from '@/components/dashboard';
import { FolderTree, Plus, Search, Edit, Trash2, Eye } from 'lucide-react';
import { listCategories, getCategoryTree, deleteCategory, type APICategory } from '@/lib/api/catalog';

// Demo data for wireframe review
const DEMO_CATEGORIES: APICategory[] = [
  { id: 'cat-001', name_th: 'การคำนวณภาษี', name_en: 'Tax Calculation', code: 'TAX', level: 1, display_order: 1, is_active: true, parent_id: '' },
  { id: 'cat-002', name_th: 'ภาษีสรรพสามิต', name_en: 'Excise Tax', code: 'TAX-EXC', level: 2, display_order: 1, is_active: true, parent_id: 'cat-001' },
  { id: 'cat-003', name_th: 'อากรแสตมป์', name_en: 'Stamp Duty', code: 'TAX-STM', level: 2, display_order: 2, is_active: true, parent_id: 'cat-001' },
  { id: 'cat-004', name_th: 'ใบอนุญาต', name_en: 'Licensing', code: 'LIC', level: 1, display_order: 2, is_active: true, parent_id: '' },
  { id: 'cat-005', name_th: 'การชำระเงิน', name_en: 'Payment', code: 'PAY', level: 1, display_order: 3, is_active: true, parent_id: '' },
  { id: 'cat-006', name_th: 'การแจ้งเตือน', name_en: 'Notification', code: 'NTF', level: 1, display_order: 4, is_active: false, parent_id: '' },
  { id: 'cat-007', name_th: 'รายงาน', name_en: 'Reporting', code: 'RPT', level: 1, display_order: 5, is_active: true, parent_id: '' },
] as APICategory[];

export default function PlatformAdminCategoriesPage() {
  const [categories, setCategories] = useState<APICategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewMode, setViewMode] = useState<'flat' | 'tree'>('flat');

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        if (viewMode === 'tree') {
          const response = await getCategoryTree();
          if (response.success && response.data && response.data.length > 0) {
            setCategories(response.data);
          } else {
            setCategories(DEMO_CATEGORIES);
          }
        } else {
          const response = await listCategories();
          if (response.success && response.data && response.data.length > 0) {
            setCategories(response.data);
          } else {
            setCategories(DEMO_CATEGORIES);
          }
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        setCategories(DEMO_CATEGORIES);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [viewMode]);

  const filteredCategories = categories.filter(
    (category) =>
      category.name_th.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบ Category นี้?')) return;

    try {
      const response = await deleteCategory(id);
      if (response.success) {
        setCategories(categories.filter((c) => c.id !== id));
        alert('ลบ Category สำเร็จ');
      }
    } catch (error) {
      console.error('Failed to delete category:', error);
      alert('ไม่สามารถลบ Category ได้');
    }
  };

  return (
    <>
      <PageHeader
        title="API Categories"
        description="จัดการหมวดหมู่ API"
        breadcrumbs={[
          { label: 'Overview', href: '/platform-admin/dashboard' },
          { label: 'API Catalog' },
          { label: 'Categories' },
        ]}
        actions={
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1">
              <button
                onClick={() => setViewMode('flat')}
                className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                  viewMode === 'flat'
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                รายการ
              </button>
              <button
                onClick={() => setViewMode('tree')}
                className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                  viewMode === 'tree'
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                ต้นไม้
              </button>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              เพิ่ม Category
            </button>
          </div>
        }
      />

      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="ค้นหา Categories..."
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
              label: 'Category',
              render: (item: APICategory) => (
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary-100">
                    <FolderTree className="w-5 h-5 text-primary-600" />
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
              render: (item: APICategory) => (
                <span className="font-mono text-sm text-gray-600">{item.code}</span>
              ),
            },
            {
              key: 'level',
              label: 'Level',
              render: (item: APICategory) => (
                <span className="text-sm text-gray-600">
                  Level {item.level}
                  {item.parent_id && ' (Sub-category)'}
                </span>
              ),
            },
            {
              key: 'display_order',
              label: 'Order',
              render: (item: APICategory) => item.display_order,
            },
            {
              key: 'status',
              label: 'Status',
              render: (item: APICategory) => (
                <StatusBadge
                  status={item.is_active ? 'success' : 'danger'}
                  label={item.is_active ? 'ใช้งาน' : 'ปิดใช้งาน'}
                />
              ),
            },
            {
              key: 'actions',
              label: 'Actions',
              render: (item: APICategory) => (
                <div className="flex items-center gap-2">
                  <button
                    className="p-2 text-gray-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg"
                    title="ดูรายละเอียด"
                    onClick={() => (window.location.href = `/platform-admin/categories/${item.id}`)}
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    className="p-2 text-gray-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg"
                    title="แก้ไข"
                    onClick={() => (window.location.href = `/platform-admin/categories/${item.id}/edit`)}
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
          data={filteredCategories}
        />
      )}

      {/* Create Category Modal - Placeholder */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">เพิ่ม Category ใหม่</h2>
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
