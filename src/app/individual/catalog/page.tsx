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

// Placeholder for mock data (will be replaced by real API call)
const mockApis_unused = [
  {
    id: 'tax-calculation',
    name: 'Tax Calculation API',
    nameTh: 'API คำนวณภาษี',
    description: 'Calculate excise tax for various product categories including alcoholic beverages, tobacco, and petroleum products.',
    descriptionTh: 'คำนวณภาษีสรรพสามิตสำหรับสินค้าประเภทต่างๆ รวมถึงเครื่องดื่มแอลกอฮอล์ ยาสูบ และผลิตภัณฑ์ปิโตรเลียม',
    category: 'Tax',
    categoryTh: 'ภาษี',
    version: '2.1.0',
    subscribers: 1250,
    rating: 4.8,
    responseTime: '~120ms',
    status: 'stable' as const,
    isSubscribed: true,
    isFeatured: true,
  },
  {
    id: 'license-verification',
    name: 'License Verification API',
    nameTh: 'API ตรวจสอบใบอนุญาต',
    description: 'Verify the validity and status of excise licenses for manufacturers, importers, and sellers.',
    descriptionTh: 'ตรวจสอบความถูกต้องและสถานะของใบอนุญาตสรรพสามิตสำหรับผู้ผลิต ผู้นำเข้า และผู้ขาย',
    category: 'License',
    categoryTh: 'ใบอนุญาต',
    version: '1.5.2',
    subscribers: 890,
    rating: 4.6,
    responseTime: '~80ms',
    status: 'stable' as const,
    isSubscribed: false,
    isFeatured: true,
  },
  {
    id: 'payment-gateway',
    name: 'Payment Gateway API',
    nameTh: 'API ชำระเงิน',
    description: 'Process tax payments securely with multiple payment methods including bank transfer and e-wallet.',
    descriptionTh: 'ประมวลผลการชำระภาษีอย่างปลอดภัยด้วยวิธีการชำระเงินหลายรูปแบบ รวมถึงโอนเงินผ่านธนาคารและ e-wallet',
    category: 'Payment',
    categoryTh: 'การชำระเงิน',
    version: '3.0.1',
    subscribers: 2100,
    rating: 4.9,
    responseTime: '~200ms',
    status: 'stable' as const,
    isSubscribed: true,
  },
  {
    id: 'identity-kyc',
    name: 'Identity KYC API',
    nameTh: 'API ยืนยันตัวตน KYC',
    description: 'Verify customer identity using national ID, passport, or corporate registration documents.',
    descriptionTh: 'ยืนยันตัวตนลูกค้าโดยใช้บัตรประชาชน หนังสือเดินทาง หรือเอกสารจดทะเบียนนิติบุคคล',
    category: 'Identity',
    categoryTh: 'พิสูจน์ตัวตน',
    version: '2.0.0',
    subscribers: 650,
    rating: 4.5,
    responseTime: '~300ms',
    status: 'stable' as const,
    isSubscribed: false,
  },
  {
    id: 'tax-report',
    name: 'Tax Report API',
    nameTh: 'API รายงานภาษี',
    description: 'Generate comprehensive tax reports for monthly, quarterly, and annual submissions.',
    descriptionTh: 'สร้างรายงานภาษีแบบครบถ้วนสำหรับการยื่นรายเดือน รายไตรมาส และรายปี',
    category: 'Report',
    categoryTh: 'รายงาน',
    version: '1.8.0',
    subscribers: 420,
    rating: 4.3,
    responseTime: '~500ms',
    status: 'stable' as const,
    isSubscribed: false,
  },
  {
    id: 'stamp-verification',
    name: 'Stamp Verification API',
    nameTh: 'API ตรวจสอบแสตมป์',
    description: 'Verify authenticity of excise stamps using QR code or serial number.',
    descriptionTh: 'ตรวจสอบความถูกต้องของแสตมป์สรรพสามิตโดยใช้ QR code หรือหมายเลขซีเรียล',
    category: 'License',
    categoryTh: 'ใบอนุญาต',
    version: '1.2.0',
    subscribers: 380,
    rating: 4.7,
    responseTime: '~150ms',
    status: 'beta' as const,
    isSubscribed: false,
  },
  {
    id: 'product-lookup',
    name: 'Product Lookup API',
    nameTh: 'API ค้นหาสินค้า',
    description: 'Search and retrieve product information from the excise product database.',
    descriptionTh: 'ค้นหาและดึงข้อมูลสินค้าจากฐานข้อมูลสินค้าสรรพสามิต',
    category: 'Tax',
    categoryTh: 'ภาษี',
    version: '2.3.1',
    subscribers: 720,
    rating: 4.4,
    responseTime: '~100ms',
    status: 'stable' as const,
    isSubscribed: true,
  },
  {
    id: 'declaration-submit',
    name: 'Declaration Submit API',
    nameTh: 'API ยื่นแบบแสดงรายการ',
    description: 'Submit excise tax declarations electronically with automatic validation.',
    descriptionTh: 'ยื่นแบบแสดงรายการภาษีสรรพสามิตทางอิเล็กทรอนิกส์พร้อมการตรวจสอบอัตโนมัติ',
    category: 'Tax',
    categoryTh: 'ภาษี',
    version: '3.1.0',
    subscribers: 1580,
    rating: 4.6,
    responseTime: '~400ms',
    status: 'stable' as const,
    isSubscribed: false,
  },
];

export default function ApiCatalogPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [apis, setApis] = useState<EnrichedAPIService[]>([]);
  const [categories, setCategories] = useState<APICategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const basePath = routes.root('individual');

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
          <p className="text-gray-500 mt-1">เลือก API ที่ต้องการใช้งานสำหรับธุรกิจของคุณ</p>
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
          <p className="text-gray-500 mt-1">เลือก API ที่ต้องการใช้งานสำหรับธุรกิจของคุณ</p>
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
          <p className="text-gray-500 mt-1">เลือก API ที่ต้องการใช้งานสำหรับธุรกิจของคุณ</p>
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
              <h3 className="text-sm font-semibold text-gray-900 mb-3">สถิติ</h3>
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
