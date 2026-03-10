'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  Star,
  Users,
  Zap,
  Shield,
  Download,
  Copy,
  Check,
  ExternalLink,
  BookOpen,
  Code2,
  Terminal,
  FileJson,
  Clock,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  getAPIService,
  getAPIVersions,
  listEndpoints,
  listCodeSamples,
  getCategory,
  type APIService,
  type APIVersion,
  type APIEndpoint,
  type APICodeSample,
  type APICategory,
} from '@/lib/api/catalog';

interface EnrichedAPIDetails {
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
  baseUrl: string;
  endpoints: Array<{ method: string; path: string; description: string }>;
  features: string[];
  rateLimit: string;
  authentication: string;
  documentation: string;
  changelog: Array<{ version: string; date: string; changes: string }>;
  sampleCode: string;
  sampleResponse: string;
}

const methodColors = {
  GET: 'bg-emerald-100 text-emerald-700',
  POST: 'bg-blue-100 text-blue-700',
  PUT: 'bg-amber-100 text-amber-700',
  DELETE: 'bg-red-100 text-red-700',
  PATCH: 'bg-purple-100 text-purple-700',
};

export default function OrgApiDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [activeTab, setActiveTab] = useState<'overview' | 'endpoints' | 'code' | 'changelog'>('overview');
  const [copied, setCopied] = useState(false);
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const [api, setApi] = useState<EnrichedAPIDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch API details on mount
  useEffect(() => {
    async function fetchAPIDetails() {
      try {
        setLoading(true);
        setError(null);

        const [serviceResponse, versionsResponse] = await Promise.all([
          getAPIService(id),
          getAPIVersions(id),
        ]);

        if (!serviceResponse.success || !serviceResponse.data) {
          throw new Error('ไม่พบ API ที่ต้องการ');
        }

        const service: APIService = serviceResponse.data;
        let version = '1.0.0';
        let endpoints: APIEndpoint[] = [];
        let codeSamples: APICodeSample[] = [];

        if (versionsResponse.success && versionsResponse.data && versionsResponse.data.length > 0) {
          const defaultVersion = versionsResponse.data.find((v: APIVersion) => v.is_default) || versionsResponse.data[0];
          version = defaultVersion.version;

          const [endpointsResponse, samplesResponse] = await Promise.all([
            listEndpoints(defaultVersion.id),
            listCodeSamples(service.id),
          ]);

          if (endpointsResponse.success && endpointsResponse.data) {
            endpoints = endpointsResponse.data;
          }
          if (samplesResponse.success && samplesResponse.data) {
            codeSamples = samplesResponse.data;
          }
        }

        let category: APICategory | null = null;
        const categoryResponse = await getCategory(service.category_id);
        if (categoryResponse.success && categoryResponse.data) {
          category = categoryResponse.data;
        }

        const enrichedApi: EnrichedAPIDetails = {
          id: service.id,
          name: service.name,
          nameTh: service.name,
          description: service.long_description || service.description,
          descriptionTh: service.long_description || service.description,
          category: category?.code || 'other',
          categoryTh: category?.name_th || 'อื่นๆ',
          version,
          subscribers: 0,
          rating: 0,
          responseTime: service.sla_response_time_ms ? `~${service.sla_response_time_ms}ms` : '~100ms',
          status: service.status === 'published' ? 'stable' : service.status === 'deprecated' ? 'deprecated' : 'beta',
          isSubscribed: false,
          baseUrl: 'https://api.excise.go.th',
          endpoints: endpoints.map(ep => ({
            method: ep.method,
            path: ep.path,
            description: ep.summary || ep.description || '',
          })),
          features: service.tags || [],
          rateLimit: '1,000 requests/minute',
          authentication: 'API Key (Bearer Token)',
          documentation: service.documentation_url || '#',
          changelog: [],
          sampleCode: codeSamples.length > 0 ? codeSamples[0].code : 'ยังไม่มีตัวอย่างโค้ด',
          sampleResponse: codeSamples.length > 0 && codeSamples[0].response_example
            ? JSON.stringify(codeSamples[0].response_example, null, 2)
            : '{\n  "success": true,\n  "data": {}\n}',
        };

        setApi(enrichedApi);
      } catch (err) {
        console.error('Failed to fetch API details:', err);
        setError(err instanceof Error ? err.message : 'ไม่สามารถโหลดข้อมูล API ได้');
      } finally {
        setLoading(false);
      }
    }

    fetchAPIDetails();
  }, [id]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadOpenAPI = () => {
    if (!api) return;
    const openApiSpec = {
      openapi: '3.0.0',
      info: {
        title: api.name,
        version: api.version,
        description: api.description,
      },
      servers: [{ url: api.baseUrl }],
      paths: {},
    };
    const blob = new Blob([JSON.stringify(openApiSpec, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${api.id}-openapi-${api.version}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <Link
          href="/organization/catalog"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="w-4 h-4" />
          กลับไปแคตตาล็อก
        </Link>
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
        <Link
          href="/organization/catalog"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="w-4 h-4" />
          กลับไปแคตตาล็อก
        </Link>
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

  if (!api) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        href="/organization/catalog"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="w-4 h-4" />
        กลับไปแคตตาล็อก
      </Link>

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <span className="px-3 py-1 text-xs font-medium bg-primary-50 text-primary-700 rounded-full">
                {api.categoryTh}
              </span>
              <span className={cn(
                'px-3 py-1 text-xs font-medium rounded-full',
                api.status === 'stable' ? 'bg-emerald-100 text-emerald-700' :
                api.status === 'beta' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
              )}>
                {api.status === 'stable' ? 'เสถียร' : api.status === 'beta' ? 'เบต้า' : 'เลิกใช้'}
              </span>
            </div>

            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">{api.nameTh}</h1>
            <p className="text-gray-500 mb-1">v{api.version}</p>
            <p className="text-gray-600 mt-4">{api.descriptionTh}</p>

            {/* Stats */}
            <div className="flex items-center gap-6 mt-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>{api.subscribers.toLocaleString()} ผู้ใช้</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span>{api.rating.toFixed(1)} คะแนน</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                <span>{api.responseTime}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 lg:min-w-[240px]">
            {api.isSubscribed ? (
              <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 text-emerald-700 rounded-lg font-medium">
                <Shield className="w-5 h-5" />
                องค์กรสมัครใช้งานแล้ว
              </div>
            ) : (
              <button
                onClick={() => setShowSubscribeModal(true)}
                className="w-full px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
              >
                สมัครใช้งานสำหรับองค์กร
              </button>
            )}

            <button
              onClick={handleDownloadOpenAPI}
              className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              ดาวน์โหลด OpenAPI Spec
            </button>

            <a
              href={api.documentation}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              เอกสาร API
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px overflow-x-auto">
            {[
              { id: 'overview', label: 'ภาพรวม', icon: FileJson },
              { id: 'endpoints', label: 'Endpoints', icon: Terminal },
              { id: 'code', label: 'ตัวอย่างโค้ด', icon: Code2 },
              { id: 'changelog', label: 'ประวัติการเปลี่ยนแปลง', icon: Clock },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={cn(
                    'flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors',
                    activeTab === tab.id
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Features */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">คุณสมบัติ</h3>
                <ul className="space-y-3">
                  {api.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Technical Info */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">ข้อมูลทางเทคนิค</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Base URL</span>
                      <code className="text-sm text-gray-900 font-mono">{api.baseUrl}</code>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Rate Limit</span>
                      <span className="text-gray-900">{api.rateLimit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Authentication</span>
                      <span className="text-gray-900">{api.authentication}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Response Time</span>
                      <span className="text-gray-900">{api.responseTime}</span>
                    </div>
                  </div>
                </div>

                {/* Quick Notice */}
                <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">หมายเหตุ</p>
                    <p className="text-sm text-amber-700 mt-1">
                      กรุณาอ่านเอกสาร API และข้อกำหนดการใช้งานก่อนสมัครใช้บริการ
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Endpoints Tab */}
          {activeTab === 'endpoints' && (
            <div className="space-y-4">
              {api.endpoints.map((endpoint, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <span className={cn(
                    'px-3 py-1 text-xs font-bold rounded uppercase',
                    methodColors[endpoint.method as keyof typeof methodColors]
                  )}>
                    {endpoint.method}
                  </span>
                  <code className="text-sm font-mono text-gray-900 flex-1">{endpoint.path}</code>
                  <span className="text-sm text-gray-500">{endpoint.description}</span>
                </div>
              ))}
            </div>
          )}

          {/* Code Tab */}
          {activeTab === 'code' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Request */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-900">Request</h3>
                  <button
                    onClick={() => handleCopy(api.sampleCode)}
                    className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'คัดลอกแล้ว' : 'คัดลอก'}
                  </button>
                </div>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{api.sampleCode}</code>
                </pre>
              </div>

              {/* Response */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-900">Response</h3>
                  <button
                    onClick={() => handleCopy(api.sampleResponse)}
                    className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'คัดลอกแล้ว' : 'คัดลอก'}
                  </button>
                </div>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{api.sampleResponse}</code>
                </pre>
              </div>
            </div>
          )}

          {/* Changelog Tab */}
          {activeTab === 'changelog' && (
            <div className="space-y-4">
              {api.changelog.map((log, index) => (
                <div key={index} className="flex gap-4 p-4 border-l-2 border-primary-200 bg-gray-50 rounded-r-lg">
                  <div className="flex-shrink-0">
                    <span className="inline-block px-2.5 py-1 text-xs font-medium bg-primary-100 text-primary-700 rounded-full">
                      v{log.version}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-900">{log.changes}</p>
                    <p className="text-xs text-gray-400 mt-1">{log.date}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Subscribe Modal */}
      {showSubscribeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">สมัครใช้งาน {api.nameTh}</h2>
            <p className="text-gray-500 mb-6">
              คุณต้องการสมัครใช้งาน API นี้สำหรับองค์กรใช่หรือไม่? สมาชิกในทีมทุกคนจะสามารถเข้าถึง API นี้ได้
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSubscribeModal(false)}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => {
                  setShowSubscribeModal(false);
                  alert('สมัครใช้งานสำเร็จ!');
                }}
                className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                ยืนยันสมัคร
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
