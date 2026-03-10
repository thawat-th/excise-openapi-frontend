'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Plus,
  MoreVertical,
  Copy,
  Trash2,
  Eye,
  EyeOff,
  Key,
  Globe,
  Smartphone,
  Monitor,
  Server,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  ChevronLeft,
  Shield,
  Clock,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUserContext } from '@/contexts/UserContextProvider';
import { useLanguage } from '@/components/LanguageProvider';
import { t } from '@/i18n/i18n';

// ========================================
// Types
// ========================================

interface Application {
  id: string;
  name: string;
  description: string;
  type: 'web' | 'spa' | 'native' | 'machine_to_machine';
  status: 'active' | 'suspended' | 'revoked';
  oauth2_client_id: string;
  redirect_uris: string[];
  created_at: string;
  updated_at: string;
}

interface Credential {
  id: string;
  application_id: string;
  type: 'oauth2_secret' | 'api_key' | 'certificate';
  name: string;
  api_key_prefix?: string;
  status: 'active' | 'revoked' | 'expired';
  created_at: string;
  expires_at?: string;
  last_used_at?: string;
}

// ========================================
// Config
// ========================================

const appTypeConfig: Record<string, { label: string; labelTh: string; icon: typeof Globe; color: string }> = {
  web: { label: 'Web Application', labelTh: 'เว็บแอปพลิเคชัน', icon: Globe, color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  spa: { label: 'Single Page App', labelTh: 'SPA', icon: Monitor, color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  native: { label: 'Native / Mobile', labelTh: 'แอปมือถือ', icon: Smartphone, color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  machine_to_machine: { label: 'Machine to Machine', labelTh: 'M2M', icon: Server, color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
};

const appStatusConfig: Record<string, { label: string; labelTh: string; color: string; icon: typeof CheckCircle }> = {
  active: { label: 'Active', labelTh: 'ใช้งานอยู่', color: 'text-emerald-600', icon: CheckCircle },
  suspended: { label: 'Suspended', labelTh: 'ระงับชั่วคราว', color: 'text-amber-600', icon: Clock },
  revoked: { label: 'Revoked', labelTh: 'ถูกเพิกถอน', color: 'text-red-600', icon: XCircle },
};

const credStatusConfig: Record<string, { label: string; labelTh: string; color: string }> = {
  active: { label: 'Active', labelTh: 'ใช้งานอยู่', color: 'text-emerald-600' },
  revoked: { label: 'Revoked', labelTh: 'ถูกเพิกถอน', color: 'text-red-600' },
  expired: { label: 'Expired', labelTh: 'หมดอายุ', color: 'text-gray-400' },
};

// ========================================
// Main Component
// ========================================

export default function ApplicationsPage() {
  const { contextId } = useUserContext();
  const { language } = useLanguage();

  // List view state
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');

  // Detail view state
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [credLoading, setCredLoading] = useState(false);

  // Create modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createDescription, setCreateDescription] = useState('');
  const [createType, setCreateType] = useState<string>('web');
  const [createRedirectUris, setCreateRedirectUris] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Create credential modal state
  const [showCredModal, setShowCredModal] = useState(false);
  const [credName, setCredName] = useState('');
  const [credType, setCredType] = useState<string>('api_key');
  const [credCreateLoading, setCredCreateLoading] = useState(false);
  const [credCreateError, setCredCreateError] = useState<string | null>(null);
  const [newCredSecret, setNewCredSecret] = useState<string | null>(null);

  // Delete confirmation
  const [deleteAppId, setDeleteAppId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Action menu
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Show/hide client ID
  const [visibleClientIds, setVisibleClientIds] = useState<Set<string>>(new Set());

  const isTh = language === 'th';

  // ========================================
  // Fetch Applications
  // ========================================

  const fetchApplications = useCallback(async () => {
    if (!contextId) return;

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);
      if (typeFilter) params.set('type', typeFilter);

      const url = `/api/organizations/${contextId}/applications${params.toString() ? '?' + params.toString() : ''}`;
      const response = await fetch(url);
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || t(language, 'organization.applications.fetchError'));
      }
      const data = await response.json();
      setApplications(data.applications || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : t(language, 'organization.applications.fetchError'));
    } finally {
      setIsLoading(false);
    }
  }, [contextId, searchQuery, typeFilter, language]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // ========================================
  // Fetch Credentials
  // ========================================

  const fetchCredentials = useCallback(async (appId: string) => {
    setCredLoading(true);
    try {
      const response = await fetch(`/api/applications/${appId}/credentials`);
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch credentials');
      }
      const data = await response.json();
      setCredentials(data.credentials || []);
    } catch {
      setCredentials([]);
    } finally {
      setCredLoading(false);
    }
  }, []);

  // ========================================
  // Create Application
  // ========================================

  const handleCreate = async () => {
    if (!contextId || !createName.trim()) return;

    setCreateLoading(true);
    setCreateError(null);

    try {
      const redirectUris = createType === 'machine_to_machine'
        ? []
        : createRedirectUris.split('\n').map(u => u.trim()).filter(Boolean);

      const response = await fetch(`/api/organizations/${contextId}/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: createName.trim(),
          description: createDescription.trim(),
          type: createType,
          redirect_uris: redirectUris,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t(language, 'organization.applications.createError'));
      }

      setShowCreateModal(false);
      resetCreateForm();
      fetchApplications();
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : t(language, 'organization.applications.createError'));
    } finally {
      setCreateLoading(false);
    }
  };

  const resetCreateForm = () => {
    setCreateName('');
    setCreateDescription('');
    setCreateType('web');
    setCreateRedirectUris('');
    setCreateError(null);
  };

  // ========================================
  // Delete Application
  // ========================================

  const handleDelete = async (appId: string) => {
    setDeleteLoading(true);
    try {
      const response = await fetch(`/api/applications/${appId}`, { method: 'DELETE' });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete');
      }
      setDeleteAppId(null);
      if (selectedApp?.id === appId) {
        setSelectedApp(null);
      }
      fetchApplications();
    } catch {
      // Error handled silently; user sees the app still in the list
    } finally {
      setDeleteLoading(false);
    }
  };

  // ========================================
  // Create Credential
  // ========================================

  const handleCreateCredential = async () => {
    if (!selectedApp || !credName.trim()) return;

    setCredCreateLoading(true);
    setCredCreateError(null);

    try {
      const response = await fetch(`/api/applications/${selectedApp.id}/credentials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: credType,
          name: credName.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create credential');
      }

      // Show the new secret/key to the user (only shown once)
      if (data.api_key_full || data.client_secret) {
        setNewCredSecret(data.api_key_full || data.client_secret);
      }

      setShowCredModal(false);
      setCredName('');
      setCredCreateError(null);
      fetchCredentials(selectedApp.id);
    } catch (err) {
      setCredCreateError(err instanceof Error ? err.message : 'Failed to create credential');
    } finally {
      setCredCreateLoading(false);
    }
  };

  // ========================================
  // Revoke Credential
  // ========================================

  const handleRevokeCredential = async (credId: string) => {
    if (!selectedApp) return;
    try {
      const response = await fetch(`/api/applications/${selectedApp.id}/credentials/${credId}/revoke`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Revoked by user' }),
      });
      if (response.ok) {
        fetchCredentials(selectedApp.id);
      }
    } catch {
      // Silent error
    }
  };

  // ========================================
  // Helpers
  // ========================================

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const toggleClientIdVisibility = (appId: string) => {
    setVisibleClientIds(prev => {
      const next = new Set(prev);
      if (next.has(appId)) {
        next.delete(appId);
      } else {
        next.add(appId);
      }
      return next;
    });
  };

  const filteredApps = applications.filter((app) =>
    app.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.oauth2_client_id?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeApps = applications.filter(a => a.status === 'active').length;
  const suspendedApps = applications.filter(a => a.status === 'suspended').length;

  // ========================================
  // Detail View
  // ========================================

  if (selectedApp) {
    return (
      <div className="space-y-6">
        {/* Back button */}
        <button
          onClick={() => { setSelectedApp(null); setCredentials([]); setNewCredSecret(null); }}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <ChevronLeft className="w-4 h-4" />
          {isTh ? 'กลับไปรายการ' : 'Back to list'}
        </button>

        {/* App Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className={cn('p-3 rounded-xl', appTypeConfig[selectedApp.type]?.color || 'bg-gray-100')}>
                {(() => { const Icon = appTypeConfig[selectedApp.type]?.icon || Globe; return <Icon className="w-6 h-6" />; })()}
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">{selectedApp.name}</h1>
                {selectedApp.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{selectedApp.description}</p>
                )}
                <div className="flex items-center gap-3 mt-2">
                  <span className={cn('inline-flex items-center gap-1.5 text-sm', appStatusConfig[selectedApp.status]?.color)}>
                    {(() => { const Icon = appStatusConfig[selectedApp.status]?.icon || CheckCircle; return <Icon className="w-4 h-4" />; })()}
                    {isTh ? appStatusConfig[selectedApp.status]?.labelTh : appStatusConfig[selectedApp.status]?.label}
                  </span>
                  <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium rounded-full', appTypeConfig[selectedApp.type]?.color)}>
                    {isTh ? appTypeConfig[selectedApp.type]?.labelTh : appTypeConfig[selectedApp.type]?.label}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* OAuth2 Details */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Client ID</label>
              <div className="flex items-center gap-2 mt-1.5">
                <code className="text-sm font-mono text-gray-900 dark:text-white flex-1 truncate">
                  {selectedApp.oauth2_client_id}
                </code>
                <button
                  onClick={() => copyToClipboard(selectedApp.oauth2_client_id)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded"
                  title="Copy"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
            {selectedApp.redirect_uris && selectedApp.redirect_uris.length > 0 && (
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Redirect URIs</label>
                <div className="mt-1.5 space-y-1">
                  {selectedApp.redirect_uris.map((uri, i) => (
                    <code key={i} className="block text-sm font-mono text-gray-900 dark:text-white truncate">{uri}</code>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 text-xs text-gray-400">
            {isTh ? 'สร้างเมื่อ' : 'Created'}: {new Date(selectedApp.created_at).toLocaleDateString(isTh ? 'th-TH' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
          </div>
        </div>

        {/* New Secret Alert */}
        {newCredSecret && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-medium text-amber-800 dark:text-amber-300">
                  {isTh ? 'บันทึก Secret นี้ไว้ จะแสดงครั้งเดียวเท่านั้น' : 'Save this secret - it will only be shown once'}
                </h3>
                <div className="flex items-center gap-2 mt-2">
                  <code className="text-sm font-mono bg-amber-100 dark:bg-amber-900/40 px-3 py-1.5 rounded text-amber-900 dark:text-amber-200 flex-1 break-all">
                    {newCredSecret}
                  </code>
                  <button
                    onClick={() => copyToClipboard(newCredSecret)}
                    className="p-2 text-amber-600 hover:text-amber-800 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/30"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={() => setNewCredSecret(null)}
                  className="mt-2 text-xs text-amber-600 hover:text-amber-800 underline"
                >
                  {isTh ? 'ฉันบันทึกแล้ว ปิดข้อความนี้' : 'I saved it, dismiss this'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Credentials Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {isTh ? 'ข้อมูลรับรอง' : 'Credentials'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {isTh ? 'API Keys และ Client Secrets' : 'API Keys and Client Secrets'}
              </p>
            </div>
            <button
              onClick={() => setShowCredModal(true)}
              className="inline-flex items-center gap-2 px-3 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700"
            >
              <Plus className="w-4 h-4" />
              {isTh ? 'สร้างใหม่' : 'Create'}
            </button>
          </div>

          {credLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
            </div>
          ) : credentials.length === 0 ? (
            <div className="p-12 text-center">
              <Key className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
              <p className="text-gray-500 dark:text-gray-400">{isTh ? 'ยังไม่มีข้อมูลรับรอง' : 'No credentials yet'}</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {credentials.map((cred) => {
                const credStatus = credStatusConfig[cred.status] || credStatusConfig.active;
                return (
                  <div key={cred.id} className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        <Key className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{cred.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {cred.type === 'api_key' ? 'API Key' : cred.type === 'oauth2_secret' ? 'OAuth2 Secret' : 'Certificate'}
                          </span>
                          {cred.api_key_prefix && (
                            <code className="text-xs font-mono text-gray-400">{cred.api_key_prefix}...</code>
                          )}
                          <span className={cn('text-xs font-medium', credStatus.color)}>
                            {isTh ? credStatus.labelTh : credStatus.label}
                          </span>
                        </div>
                      </div>
                    </div>
                    {cred.status === 'active' && (
                      <button
                        onClick={() => handleRevokeCredential(cred.id)}
                        className="text-xs text-red-600 hover:text-red-800 px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        {isTh ? 'เพิกถอน' : 'Revoke'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Create Credential Modal */}
        {showCredModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                {isTh ? 'สร้างข้อมูลรับรองใหม่' : 'Create New Credential'}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {isTh ? 'ชื่อ' : 'Name'}
                  </label>
                  <input
                    type="text"
                    value={credName}
                    onChange={(e) => setCredName(e.target.value)}
                    placeholder={isTh ? 'เช่น Production API Key' : 'e.g. Production API Key'}
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {isTh ? 'ประเภท' : 'Type'}
                  </label>
                  <select
                    value={credType}
                    onChange={(e) => setCredType(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                  >
                    <option value="api_key">API Key</option>
                    <option value="oauth2_secret">OAuth2 Client Secret</option>
                  </select>
                </div>

                {credCreateError && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {credCreateError}
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => { setShowCredModal(false); setCredName(''); setCredCreateError(null); }}
                  className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  {isTh ? 'ยกเลิก' : 'Cancel'}
                </button>
                <button
                  onClick={handleCreateCredential}
                  disabled={!credName.trim() || credCreateLoading}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {credCreateLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isTh ? 'สร้าง' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ========================================
  // Loading State
  // ========================================

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
        <span className="ml-2 text-gray-500">{isTh ? 'กำลังโหลด...' : 'Loading...'}</span>
      </div>
    );
  }

  // ========================================
  // Error State
  // ========================================

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <AlertCircle className="w-10 h-10 text-red-500" />
        <p className="text-gray-600 dark:text-gray-400">{error}</p>
        <button
          onClick={fetchApplications}
          className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          {isTh ? 'ลองใหม่' : 'Retry'}
        </button>
      </div>
    );
  }

  // ========================================
  // List View
  // ========================================

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t(language, 'organization.applications.title')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {t(language, 'organization.applications.description')}
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t(language, 'organization.applications.newApplication')}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
              <Globe className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{applications.length}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {isTh ? 'แอปพลิเคชันทั้งหมด' : 'Total Applications'}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeApps}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {isTh ? 'ใช้งานอยู่' : 'Active'}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 dark:bg-amber-900/30 rounded-lg">
              <Shield className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{suspendedApps}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {isTh ? 'ระงับชั่วคราว' : 'Suspended'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isTh ? 'ค้นหาแอปพลิเคชัน...' : 'Search applications...'}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2.5 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
        >
          <option value="">{isTh ? 'ทุกประเภท' : 'All Types'}</option>
          <option value="web">{isTh ? 'เว็บแอปพลิเคชัน' : 'Web Application'}</option>
          <option value="spa">SPA</option>
          <option value="native">{isTh ? 'แอปมือถือ' : 'Native / Mobile'}</option>
          <option value="machine_to_machine">Machine to Machine</option>
        </select>
      </div>

      {/* Applications List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                  {isTh ? 'แอปพลิเคชัน' : 'Application'}
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                  {isTh ? 'ประเภท' : 'Type'}
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">Client ID</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                  {isTh ? 'สถานะ' : 'Status'}
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                  {isTh ? 'วันที่สร้าง' : 'Created'}
                </th>
                <th className="text-right px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredApps.map((app) => {
                const typeConf = appTypeConfig[app.type] || appTypeConfig.web;
                const statusConf = appStatusConfig[app.status] || appStatusConfig.active;
                const TypeIcon = typeConf.icon;
                const StatusIcon = statusConf.icon;
                const isClientVisible = visibleClientIds.has(app.id);
                const createdDate = new Date(app.created_at).toLocaleDateString(
                  isTh ? 'th-TH' : 'en-US',
                  { year: 'numeric', month: 'short', day: 'numeric' }
                );

                return (
                  <tr
                    key={app.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/30 cursor-pointer"
                    onClick={() => { setSelectedApp(app); fetchCredentials(app.id); }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={cn('p-2 rounded-lg', typeConf.color)}>
                          <TypeIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{app.name}</p>
                          {app.description && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[200px]">{app.description}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full', typeConf.color)}>
                        {isTh ? typeConf.labelTh : typeConf.label}
                      </span>
                    </td>
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1.5">
                        <code className="text-xs font-mono text-gray-600 dark:text-gray-400">
                          {isClientVisible ? app.oauth2_client_id : app.oauth2_client_id.substring(0, 8) + '...'}
                        </code>
                        <button
                          onClick={() => toggleClientIdVisibility(app.id)}
                          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded"
                        >
                          {isClientVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => copyToClipboard(app.oauth2_client_id)}
                          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn('inline-flex items-center gap-1.5 text-sm', statusConf.color)}>
                        <StatusIcon className="w-4 h-4" />
                        {isTh ? statusConf.labelTh : statusConf.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {createdDate}
                    </td>
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="relative">
                        <button
                          onClick={() => setOpenMenuId(openMenuId === app.id ? null : app.id)}
                          className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {openMenuId === app.id && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setOpenMenuId(null)} />
                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                              <button
                                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                onClick={() => { setOpenMenuId(null); setSelectedApp(app); fetchCredentials(app.id); }}
                              >
                                <Key className="w-4 h-4" />
                                {isTh ? 'ดูรายละเอียด' : 'View Details'}
                              </button>
                              <hr className="my-1 border-gray-100 dark:border-gray-700" />
                              <button
                                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                onClick={() => { setOpenMenuId(null); setDeleteAppId(app.id); }}
                              >
                                <Trash2 className="w-4 h-4" />
                                {isTh ? 'ลบแอปพลิเคชัน' : 'Delete Application'}
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

        {filteredApps.length === 0 && (
          <div className="p-12 text-center">
            <Globe className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
            <p className="text-gray-500 dark:text-gray-400">
              {applications.length === 0
                ? (isTh ? 'ยังไม่มีแอปพลิเคชัน' : 'No applications yet')
                : (isTh ? 'ไม่พบแอปพลิเคชันที่ตรงกับการค้นหา' : 'No applications match your search')}
            </p>
          </div>
        )}
      </div>

      {/* Create Application Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {t(language, 'organization.applications.createTitle')}
              </h2>
              <button
                onClick={() => { setShowCreateModal(false); resetCreateForm(); }}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {isTh ? 'ชื่อแอปพลิเคชัน' : 'Application Name'} *
                </label>
                <input
                  type="text"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder={isTh ? 'เช่น My Web App' : 'e.g. My Web App'}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {isTh ? 'คำอธิบาย' : 'Description'}
                </label>
                <textarea
                  value={createDescription}
                  onChange={(e) => setCreateDescription(e.target.value)}
                  placeholder={isTh ? 'อธิบายเกี่ยวกับแอปพลิเคชัน...' : 'Describe your application...'}
                  rows={2}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isTh ? 'ประเภทแอปพลิเคชัน' : 'Application Type'} *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(appTypeConfig).map(([key, config]) => {
                    const Icon = config.icon;
                    return (
                      <label
                        key={key}
                        className={cn(
                          'flex items-center gap-3 px-4 py-3 border rounded-lg cursor-pointer transition-colors',
                          createType === key
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                            : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                        )}
                      >
                        <input
                          type="radio"
                          name="appType"
                          value={key}
                          checked={createType === key}
                          onChange={() => setCreateType(key)}
                          className="text-primary-600"
                        />
                        <Icon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        <span className="text-sm font-medium dark:text-white">
                          {isTh ? config.labelTh : config.label}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {createType !== 'machine_to_machine' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Redirect URIs *
                  </label>
                  <textarea
                    value={createRedirectUris}
                    onChange={(e) => setCreateRedirectUris(e.target.value)}
                    placeholder="https://example.com/callback&#10;https://example.com/auth"
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white font-mono text-sm resize-none"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    {isTh ? 'ใส่ URI หนึ่งรายการต่อบรรทัด' : 'Enter one URI per line'}
                  </p>
                </div>
              )}

              {createError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {createError}
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setShowCreateModal(false); resetCreateForm(); }}
                className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                {isTh ? 'ยกเลิก' : 'Cancel'}
              </button>
              <button
                onClick={handleCreate}
                disabled={!createName.trim() || createLoading || (createType !== 'machine_to_machine' && !createRedirectUris.trim())}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {t(language, 'organization.applications.create')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteAppId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-sm w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {isTh ? 'ยืนยันการลบ' : 'Confirm Delete'}
              </h2>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              {isTh
                ? 'แอปพลิเคชันนี้และข้อมูลรับรองทั้งหมดจะถูกเพิกถอน ดำเนินการต่อหรือไม่?'
                : 'This application and all its credentials will be revoked. Continue?'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteAppId(null)}
                className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                {isTh ? 'ยกเลิก' : 'Cancel'}
              </button>
              <button
                onClick={() => handleDelete(deleteAppId)}
                disabled={deleteLoading}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {deleteLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {isTh ? 'ลบ' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
