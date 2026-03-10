'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { PageHeader, StatusBadge } from '@/components/dashboard';
import {
  ArrowLeft,
  Edit,
  Trash2,
  ExternalLink,
  Eye,
  Shield,
  Zap,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import {
  getAPIService,
  getAPIVersions,
  listEndpoints,
  getCategory,
  getProvider,
  deleteAPIService,
  publishAPIService,
  deprecateAPIService,
  type APIService,
  type APIVersion,
  type APIEndpoint,
  type APICategory,
  type APIProvider,
} from '@/lib/api/catalog';

export default function PlatformAdminServiceDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [service, setService] = useState<APIService | null>(null);
  const [versions, setVersions] = useState<APIVersion[]>([]);
  const [endpoints, setEndpoints] = useState<APIEndpoint[]>([]);
  const [category, setCategory] = useState<APICategory | null>(null);
  const [provider, setProvider] = useState<APIProvider | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const serviceResponse = await getAPIService(id);
        if (!serviceResponse.success || !serviceResponse.data) {
          throw new Error('ไม่พบ API Service');
        }

        const svc: APIService = serviceResponse.data;
        setService(svc);

        const [versionsResponse, categoryResponse, providerResponse] = await Promise.all([
          getAPIVersions(id),
          getCategory(svc.category_id),
          getProvider(svc.provider_id),
        ]);

        if (versionsResponse.success && versionsResponse.data) {
          const vers = versionsResponse.data;
          setVersions(vers);

          const defaultVersion = vers.find((v: APIVersion) => v.is_default) || vers[0];
          if (defaultVersion) {
            const endpointsResponse = await listEndpoints(defaultVersion.id);
            if (endpointsResponse.success && endpointsResponse.data) {
              setEndpoints(endpointsResponse.data);
            }
          }
        }

        if (categoryResponse.success && categoryResponse.data) {
          setCategory(categoryResponse.data);
        }

        if (providerResponse.success && providerResponse.data) {
          setProvider(providerResponse.data);
        }
      } catch (err) {
        console.error('Failed to fetch service details:', err);
        setError(err instanceof Error ? err.message : 'ไม่สามารถโหลดข้อมูลได้');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  const handleDelete = async () => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบ API Service นี้?')) return;

    try {
      const response = await deleteAPIService(id);
      if (response.success) {
        alert('ลบ API Service สำเร็จ');
        window.location.href = '/platform-admin/services';
      }
    } catch (error) {
      console.error('Failed to delete service:', error);
      alert('ไม่สามารถลบ API Service ได้');
    }
  };

  const handlePublish = async () => {
    try {
      const response = await publishAPIService(id);
      if (response.success) {
        setService((prev) => prev ? { ...prev, status: 'published' } : null);
        alert('เผยแพร่ API Service สำเร็จ');
      }
    } catch (error) {
      console.error('Failed to publish service:', error);
      alert('ไม่สามารถเผยแพร่ API Service ได้');
    }
  };

  const handleDeprecate = async () => {
    const notice = prompt('กรุณาระบุข้อความแจ้งเตือนเลิกใช้งาน:');
    if (!notice) return;

    try {
      const response = await deprecateAPIService(id, notice);
      if (response.success) {
        setService((prev) => prev ? { ...prev, status: 'deprecated' } : null);
        alert('ทำเครื่องหมายเลิกใช้งาน API Service สำเร็จ');
      }
    } catch (error) {
      console.error('Failed to deprecate service:', error);
      alert('ไม่สามารถทำเครื่องหมายเลิกใช้งานได้');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 rounded-xl border border-red-200 p-12 text-center">
          <p className="text-red-600">{error || 'ไม่พบข้อมูล'}</p>
          <Link
            href="/platform-admin/services"
            className="mt-4 inline-block px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            กลับไปหน้ารายการ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title={service.name}
        description={service.description}
        breadcrumbs={[
          { label: 'Overview', href: '/platform-admin/dashboard' },
          { label: 'Services', href: '/platform-admin/services' },
          { label: service.name },
        ]}
        actions={
          <div className="flex items-center gap-3">
            <Link
              href={`/platform-admin/services/${id}/edit`}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              แก้ไข
            </Link>
            {service.status === 'draft' && (
              <button
                onClick={handlePublish}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                เผยแพร่
              </button>
            )}
            {service.status === 'published' && (
              <button
                onClick={handleDeprecate}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4" />
                เลิกใช้งาน
              </button>
            )}
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              ลบ
            </button>
          </div>
        }
      />

      {/* Service Info Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">ข้อมูลพื้นฐาน</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Slug:</span>
                <p className="font-medium text-gray-900">{service.slug}</p>
              </div>
              <div>
                <span className="text-gray-500">API Type:</span>
                <p className="font-medium text-gray-900 uppercase">{service.api_type}</p>
              </div>
              <div>
                <span className="text-gray-500">Visibility:</span>
                <p className="font-medium text-gray-900">
                  {service.visibility === 'public' ? 'สาธารณะ' : service.visibility === 'private' ? 'ส่วนตัว' : 'ภายใน'}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Requires Approval:</span>
                <p className="font-medium text-gray-900">{service.requires_approval ? 'ใช่' : 'ไม่'}</p>
              </div>
              <div>
                <span className="text-gray-500">Category:</span>
                <p className="font-medium text-gray-900">{category?.name_th || '-'}</p>
              </div>
              <div>
                <span className="text-gray-500">Provider:</span>
                <p className="font-medium text-gray-900">{provider?.name_th || '-'}</p>
              </div>
            </div>
          </div>

          {/* Versions */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">API Versions</h3>
            {versions.length === 0 ? (
              <p className="text-gray-500">ยังไม่มี Versions</p>
            ) : (
              <div className="space-y-3">
                {versions.map((version) => (
                  <div key={version.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">v{version.version}</span>
                        {version.is_default && (
                          <span className="px-2 py-0.5 text-xs bg-primary-100 text-primary-700 rounded">
                            Default
                          </span>
                        )}
                        {version.is_deprecated && (
                          <span className="px-2 py-0.5 text-xs bg-amber-100 text-amber-700 rounded">
                            Deprecated
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Created: {new Date(version.created_at).toLocaleDateString('th-TH')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Endpoints */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Endpoints</h3>
            {endpoints.length === 0 ? (
              <p className="text-gray-500">ยังไม่มี Endpoints</p>
            ) : (
              <div className="space-y-2">
                {endpoints.map((endpoint) => (
                  <div key={endpoint.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <span
                      className={`px-3 py-1 text-xs font-bold rounded uppercase ${
                        endpoint.method === 'GET'
                          ? 'bg-emerald-100 text-emerald-700'
                          : endpoint.method === 'POST'
                          ? 'bg-blue-100 text-blue-700'
                          : endpoint.method === 'PUT'
                          ? 'bg-amber-100 text-amber-700'
                          : endpoint.method === 'DELETE'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-purple-100 text-purple-700'
                      }`}
                    >
                      {endpoint.method}
                    </span>
                    <code className="text-sm font-mono text-gray-900 flex-1">{endpoint.path}</code>
                    {endpoint.summary && (
                      <span className="text-sm text-gray-500">{endpoint.summary}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Status</h3>
            <StatusBadge
              status={
                service.status === 'published'
                  ? 'success'
                  : service.status === 'draft'
                  ? 'warning'
                  : service.status === 'deprecated'
                  ? 'danger'
                  : 'info'
              }
              label={
                service.status === 'published'
                  ? 'เผยแพร่แล้ว'
                  : service.status === 'draft'
                  ? 'ฉบับร่าง'
                  : service.status === 'deprecated'
                  ? 'เลิกใช้แล้ว'
                  : 'เก็บถาวร'
              }
            />
          </div>

          {/* Metadata */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Metadata</h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-500">Created:</span>
                <p className="font-medium text-gray-900">
                  {new Date(service.created_at).toLocaleDateString('th-TH')}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Updated:</span>
                <p className="font-medium text-gray-900">
                  {new Date(service.updated_at).toLocaleDateString('th-TH')}
                </p>
              </div>
              {service.created_by && (
                <div>
                  <span className="text-gray-500">Created By:</span>
                  <p className="font-medium text-gray-900">{service.created_by}</p>
                </div>
              )}
            </div>
          </div>

          {/* SLA */}
          {(service.sla_uptime_percentage || service.sla_response_time_ms) && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">SLA</h3>
              <div className="space-y-3 text-sm">
                {service.sla_uptime_percentage && (
                  <div>
                    <span className="text-gray-500">Uptime:</span>
                    <p className="font-medium text-gray-900">{service.sla_uptime_percentage}%</p>
                  </div>
                )}
                {service.sla_response_time_ms && (
                  <div>
                    <span className="text-gray-500">Response Time:</span>
                    <p className="font-medium text-gray-900">~{service.sla_response_time_ms}ms</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Contact */}
          {(service.contact_email || service.contact_name) && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Contact</h3>
              <div className="space-y-3 text-sm">
                {service.contact_name && (
                  <div>
                    <span className="text-gray-500">Name:</span>
                    <p className="font-medium text-gray-900">{service.contact_name}</p>
                  </div>
                )}
                {service.contact_email && (
                  <div>
                    <span className="text-gray-500">Email:</span>
                    <p className="font-medium text-gray-900">{service.contact_email}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Links */}
          {(service.documentation_url || service.support_url || service.changelog_url) && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Links</h3>
              <div className="space-y-2">
                {service.documentation_url && (
                  <a
                    href={service.documentation_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700"
                  >
                    Documentation
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                {service.support_url && (
                  <a
                    href={service.support_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700"
                  >
                    Support
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                {service.changelog_url && (
                  <a
                    href={service.changelog_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700"
                  >
                    Changelog
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
