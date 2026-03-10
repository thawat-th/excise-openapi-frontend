'use client';

import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, LayoutGrid, List, Sparkles } from 'lucide-react';
import { ApiCard, FeaturedApiCard, CategoryFilter, CategoryPills } from '@/components/developer-portal';
import { cn } from '@/lib/utils';
import { routes } from '@/lib/routes';
import { listAPIServices, listCategories, type APIService, type APICategory } from '@/lib/api/catalog';

interface EnrichedAPIService {
  id: string;
  name: string;
  nameTh: string;
  description: string;
  descriptionTh: string;
  category: string;
  categoryTh: string;
  version: string;
  subscribers: number;
  rating: number;
  responseTime: string;
  status: 'stable' | 'beta' | 'alpha' | 'deprecated';
  isSubscribed: boolean;
  isFeatured: boolean;
}

export default function OrgApiCatalogPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [apis, setApis] = useState<EnrichedAPIService[]>([]);
  const [categories, setCategories] = useState<APICategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const basePath = routes.root('organization');

  // Fetch data on mount
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const [servicesResponse, categoriesResponse] = await Promise.all([
          listAPIServices({ status: 'published', visibility: 'public' }),
          listCategories(undefined, true)
        ]);

        const categoryMap = new Map<string, APICategory>();
        if (categoriesResponse.success && categoriesResponse.data) {
          categoriesResponse.data.forEach((cat: APICategory) => {
            categoryMap.set(cat.id, cat);
          });
          setCategories(categoriesResponse.data);
        }

        if (servicesResponse.success && servicesResponse.data) {
          const enrichedApis: EnrichedAPIService[] = servicesResponse.data.map((service: APIService) => {
            const category = categoryMap.get(service.category_id);
            return {
              id: service.id,
              name: service.name,
              nameTh: service.name,
              description: service.description,
              descriptionTh: service.description,
              category: category?.code || 'other',
              categoryTh: category?.name_th || 'อื่นๆ',
              version: '1.0.0',
              subscribers: 0,
              rating: 0,
              responseTime: service.sla_response_time_ms ? `~${service.sla_response_time_ms}ms` : '~100ms',
              status: service.status === 'published' ? 'stable' : 'beta',
              isSubscribed: false,
              isFeatured: false,
            };
          });
          setApis(enrichedApis);
        }
      } catch (err) {
        console.error('Failed to fetch API catalog:', err);
        setError('ไม่สามารถโหลดข้อมูล API ได้ กรุณาลองใหม่อีกครั้ง');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Filter APIs
  const filteredApis = apis.filter((api) => {
    const matchesCategory = selectedCategory === 'all' || api.category.toLowerCase() === selectedCategory;
    const matchesSearch = api.nameTh.toLowerCase().includes(searchQuery.toLowerCase()) ||
      api.descriptionTh.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredApis = filteredApis.filter((api) => api.isFeatured);
  const regularApis = filteredApis.filter((api) => !api.isFeatured);

  // Show loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">แคตตาล็อก API</h1>
          <p className="text-gray-500 mt-1">เลือก API ที่ต้องการใช้งานสำหรับองค์กรของคุณ</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">กำลังโหลดข้อมูล API...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">แคตตาล็อก API</h1>
          <p className="text-gray-500 mt-1">เลือก API ที่ต้องการใช้งานสำหรับองค์กรของคุณ</p>
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
          <h1 className="text-2xl font-bold text-gray-900">แคตตาล็อก API</h1>
          <p className="text-gray-500 mt-1">เลือก API ที่ต้องการใช้งานสำหรับองค์กรของคุณ</p>
        </div>

        {/* Search & View Toggle */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 lg:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหา API..."
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-2 rounded-md transition-colors',
                viewMode === 'grid'
                  ? 'bg-primary-50 text-primary-600'
                  : 'text-gray-400 hover:text-gray-600'
              )}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'p-2 rounded-md transition-colors',
                viewMode === 'list'
                  ? 'bg-primary-50 text-primary-600'
                  : 'text-gray-400 hover:text-gray-600'
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Category Pills */}
      <div className="lg:hidden">
        <CategoryPills
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      </div>

      <div className="flex gap-6">
        {/* Desktop Sidebar Filter */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-24 space-y-4">
            <CategoryFilter
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />

            {/* Quick Stats */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">สถิติองค์กร</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">API ทั้งหมด</span>
                  <span className="font-medium text-gray-900">{apis.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">สมัครใช้งานแล้ว</span>
                  <span className="font-medium text-emerald-600">
                    {apis.filter((a) => a.isSubscribed).length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {/* Featured APIs */}
          {featuredApis.length > 0 && selectedCategory === 'all' && !searchQuery && (
            <section className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h2 className="text-lg font-semibold text-gray-900">API แนะนำ</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {featuredApis.map((api) => (
                  <FeaturedApiCard key={api.id} {...api} basePath={basePath} />
                ))}
              </div>
            </section>
          )}

          {/* API Grid */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {selectedCategory === 'all' ? 'API ทั้งหมด' : `API หมวด${apis.find(a => a.category.toLowerCase() === selectedCategory)?.categoryTh || ''}`}
              </h2>
              <span className="text-sm text-gray-500">
                {filteredApis.length} รายการ
              </span>
            </div>

            {filteredApis.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <p className="text-gray-500">ไม่พบ API ที่ตรงกับเงื่อนไข</p>
              </div>
            ) : (
              <div className={cn(
                'grid gap-6',
                viewMode === 'grid'
                  ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
                  : 'grid-cols-1'
              )}>
                {(selectedCategory === 'all' && !searchQuery ? regularApis : filteredApis).map((api) => (
                  <ApiCard key={api.id} {...api} basePath={basePath} />
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
