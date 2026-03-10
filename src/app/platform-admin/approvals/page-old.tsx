'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/dashboard';
import { Eye, Check, X, Info, Search, FileText, Building2, Clock, CheckCircle, XCircle, AlertTriangle, TrendingUp, Filter } from 'lucide-react';
import { ApproveModal, RejectModal, RequestInfoModal } from '@/components/modals';
import { useLanguage } from '@/components/LanguageProvider';
import { t } from '@/i18n/i18n';
import { SkeletonApprovals } from '@/components/ui/Skeleton';

interface Registration {
  id: string;
  tracking_code: string;
  org_name_th: string;
  org_name_en?: string;
  contact_email: string;
  contact_first_name: string;
  contact_last_name: string;
  status: 'pending' | 'approved' | 'rejected' | 'need_more_info';
  created_at: string;
  updated_at: string;
  reviewed_by?: string;
  reviewed_at?: string;
  reject_reason?: string;
}

interface StatsData {
  pending: number;
  high_priority: number;
  approved_today: number;
  rejected_today: number;
}

export default function PlatformAdminApprovalsPage() {
  const { language } = useLanguage();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StatsData>({
    pending: 0,
    high_priority: 0,
    approved_today: 0,
    rejected_today: 0,
  });
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);

  // Modal states
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showRequestInfoModal, setShowRequestInfoModal] = useState(false);

  // Fetch registrations
  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
      });

      if (statusFilter && statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      const response = await fetch(`/api/registrations/organization?${params.toString()}`, {
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success && data.data) {
        setRegistrations(data.data.data || []);
        setTotal(data.data.total || 0);
        calculateStats(data.data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch registrations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const calculateStats = (regs: Registration[]) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const pending = regs.filter(r => r.status === 'pending').length;
    const approvedToday = regs.filter(r => {
      if (r.status !== 'approved' || !r.reviewed_at) return false;
      const reviewDate = new Date(r.reviewed_at);
      return reviewDate >= today;
    }).length;
    const rejectedToday = regs.filter(r => {
      if (r.status !== 'rejected' || !r.reviewed_at) return false;
      const reviewDate = new Date(r.reviewed_at);
      return reviewDate >= today;
    }).length;

    setStats({
      pending,
      high_priority: 0,
      approved_today: approvedToday,
      rejected_today: rejectedToday,
    });
  };

  useEffect(() => {
    fetchRegistrations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter]);

  // Filter registrations by search query
  const filteredRegistrations = registrations.filter(reg => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      reg.tracking_code.toLowerCase().includes(query) ||
      reg.org_name_th.toLowerCase().includes(query) ||
      reg.org_name_en?.toLowerCase().includes(query) ||
      reg.contact_email.toLowerCase().includes(query) ||
      `${reg.contact_first_name} ${reg.contact_last_name}`.toLowerCase().includes(query)
    );
  });

  // Handle actions
  const handleView = (registration: Registration) => {
    window.location.href = `/platform-admin/approvals/${registration.id}`;
  };

  const handleApprove = (registration: Registration) => {
    setSelectedRegistration(registration);
    setShowApproveModal(true);
  };

  const handleReject = (registration: Registration) => {
    setSelectedRegistration(registration);
    setShowRejectModal(true);
  };

  const handleRequestInfo = (registration: Registration) => {
    setSelectedRegistration(registration);
    setShowRequestInfoModal(true);
  };

  // Confirm actions
  const confirmApprove = async () => {
    if (!selectedRegistration) return;

    try {
      const response = await fetch(`/api/registrations/organization/${selectedRegistration.id}/review`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'approved' }),
      });

      if (response.ok) {
        await fetchRegistrations();
      } else {
        throw new Error('Failed to approve');
      }
    } catch (error) {
      console.error('Approve error:', error);
      throw error;
    }
  };

  const confirmReject = async (reason: string) => {
    if (!selectedRegistration) return;

    try {
      const response = await fetch(`/api/registrations/organization/${selectedRegistration.id}/review`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'rejected', reason }),
      });

      if (response.ok) {
        await fetchRegistrations();
      } else {
        throw new Error('Failed to reject');
      }
    } catch (error) {
      console.error('Reject error:', error);
      throw error;
    }
  };

  const confirmRequestInfo = async (message: string) => {
    if (!selectedRegistration) return;

    try {
      const response = await fetch(`/api/registrations/organization/${selectedRegistration.id}/review`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'need_info', reason: message }),
      });

      if (response.ok) {
        await fetchRegistrations();
      } else {
        throw new Error('Failed to request info');
      }
    } catch (error) {
      console.error('Request info error:', error);
      throw error;
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get time ago
  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'เมื่อสักครู่';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} นาทีที่แล้ว`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} ชั่วโมงที่แล้ว`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} วันที่แล้ว`;
    return formatDate(dateString);
  };

  // Get status config
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          label: t(language, 'dashboard.pages.platformAdmin.approvals.status.pending'),
          color: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
          icon: Clock,
        };
      case 'approved':
        return {
          label: t(language, 'dashboard.pages.platformAdmin.approvals.status.approved'),
          color: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
          icon: CheckCircle,
        };
      case 'rejected':
        return {
          label: t(language, 'dashboard.pages.platformAdmin.approvals.status.rejected'),
          color: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
          icon: X,
        };
      case 'need_more_info':
        return {
          label: t(language, 'dashboard.pages.platformAdmin.approvals.status.needInfo'),
          color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',
          icon: AlertTriangle,
        };
      default:
        return {
          label: status,
          color: 'bg-gray-50 dark:bg-gray-900/20 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-800',
          icon: Info,
        };
    }
  };

  // Stats cards config
  const statsCards = [
    {
      label: t(language, 'dashboard.pages.platformAdmin.approvals.stats.pending'),
      value: stats.pending,
      icon: Clock,
      gradient: 'from-amber-500 to-orange-500',
      bgColor: 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20',
      iconColor: 'text-amber-600 dark:text-amber-400',
      trend: null,
    },
    {
      label: t(language, 'dashboard.pages.platformAdmin.approvals.stats.approvedToday'),
      value: stats.approved_today,
      icon: CheckCircle,
      gradient: 'from-emerald-500 to-teal-500',
      bgColor: 'bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      trend: '+12%',
    },
    {
      label: t(language, 'dashboard.pages.platformAdmin.approvals.stats.rejectedToday'),
      value: stats.rejected_today,
      icon: X,
      gradient: 'from-red-500 to-pink-500',
      bgColor: 'bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20',
      iconColor: 'text-red-600 dark:text-red-400',
      trend: '-5%',
    },
    {
      label: t(language, 'dashboard.pages.platformAdmin.approvals.stats.highPriority'),
      value: stats.high_priority,
      icon: AlertTriangle,
      gradient: 'from-purple-500 to-indigo-500',
      bgColor: 'bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20',
      iconColor: 'text-purple-600 dark:text-purple-400',
      trend: null,
    },
  ];

  return (
    <>
      <PageHeader
        title={t(language, 'dashboard.pages.platformAdmin.approvals.title')}
        description={t(language, 'dashboard.pages.platformAdmin.approvals.description')}
        breadcrumbs={[
          { label: t(language, 'dashboard.nav.dashboard'), href: '/platform-admin/dashboard' },
          { label: t(language, 'dashboard.nav.workflow') },
          { label: t(language, 'dashboard.nav.pendingApprovals') },
        ]}
      />

      {/* Modern Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsCards.map((stat, index) => (
          <div
            key={stat.label}
            className={`${stat.bgColor} rounded-2xl p-6 border border-gray-200 dark:border-gray-700/50 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.iconColor} bg-white/60 dark:bg-gray-800/60`}>
                <stat.icon className="w-6 h-6" />
              </div>
              {stat.trend && (
                <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="w-3 h-3" />
                  {stat.trend}
                </div>
              )}
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm mb-6">
        <div className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={language === 'th' ? 'ค้นหารหัส, องค์กร, อีเมล...' : 'Search by code, organization, email...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all font-medium"
            >
              <option value="all">{t(language, 'dashboard.pages.platformAdmin.approvals.filters.allStatus')}</option>
              <option value="pending">{t(language, 'dashboard.pages.platformAdmin.approvals.filters.pending')}</option>
              <option value="need_info">{t(language, 'dashboard.pages.platformAdmin.approvals.filters.needInfo')}</option>
              <option value="approved">{t(language, 'dashboard.pages.platformAdmin.approvals.filters.approved')}</option>
              <option value="rejected">{t(language, 'dashboard.pages.platformAdmin.approvals.filters.rejected')}</option>
            </select>

            {/* More Filters Button */}
            <button className="px-6 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all flex items-center justify-center gap-2 font-medium text-gray-700 dark:text-gray-300">
              <Filter className="w-5 h-5" />
              <span className="hidden sm:inline">{t(language, 'dashboard.pages.platformAdmin.approvals.filters.moreFilters')}</span>
            </button>
          </div>

          {/* Results Count */}
          <div className="mt-4 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <span>{filteredRegistrations.length} {language === 'th' ? 'รายการ' : 'results'}</span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                {language === 'th' ? 'ล้างการค้นหา' : 'Clear search'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <SkeletonApprovals />
      ) : (
        <>
          {/* Modern Card List */}
          <div className="space-y-4 mb-6">
            {filteredRegistrations.map((reg) => {
              const statusConfig = getStatusConfig(reg.status);
              const StatusIcon = statusConfig.icon;

              return (
                <div
                  key={reg.id}
                  className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group"
                >
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      {/* Left: Main Info */}
                      <div className="flex-1 space-y-3">
                        {/* Tracking Code & Status */}
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="font-mono text-sm font-bold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-900 px-3 py-1.5 rounded-lg">
                            {reg.tracking_code}
                          </span>
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border ${statusConfig.color}`}>
                            <StatusIcon className="w-3.5 h-3.5" />
                            {statusConfig.label}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {getTimeAgo(reg.created_at)}
                          </span>
                        </div>

                        {/* Organization Name */}
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                            {reg.org_name_th}
                          </h3>
                          {reg.org_name_en && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{reg.org_name_en}</p>
                          )}
                        </div>

                        {/* Contact Info */}
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-semibold text-xs">
                              {reg.contact_first_name.charAt(0)}{reg.contact_last_name.charAt(0)}
                            </div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                              {reg.contact_first_name} {reg.contact_last_name}
                            </span>
                          </div>
                          <span className="text-gray-500 dark:text-gray-400">{reg.contact_email}</span>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex lg:flex-col items-center gap-2">
                        <button
                          onClick={() => handleView(reg)}
                          className="flex-1 lg:flex-none px-6 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-all flex items-center justify-center gap-2 min-w-[120px]"
                        >
                          <Eye className="w-4 h-4" />
                          <span>{language === 'th' ? 'ดูรายละเอียด' : 'View'}</span>
                        </button>

                        {(reg.status === 'pending' || reg.status === 'need_more_info') && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApprove(reg)}
                              className="p-2.5 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-xl transition-all"
                              title={t(language, 'dashboard.pages.platformAdmin.approvals.actions.approve')}
                            >
                              <Check className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleReject(reg)}
                              className="p-2.5 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded-xl transition-all"
                              title={t(language, 'dashboard.pages.platformAdmin.approvals.actions.reject')}
                            >
                              <X className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleRequestInfo(reg)}
                              className="p-2.5 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-xl transition-all"
                              title={t(language, 'dashboard.pages.platformAdmin.approvals.actions.requestInfo')}
                            >
                              <Info className="w-5 h-5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty State */}
          {filteredRegistrations.length === 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {language === 'th' ? 'ไม่พบรายการ' : 'No results found'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {language === 'th' ? 'ลองเปลี่ยนตัวกรองหรือคำค้นหา' : 'Try changing your filters or search query'}
              </p>
            </div>
          )}

          {/* Pagination */}
          {total > pageSize && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t(language, 'dashboard.pages.platformAdmin.approvals.pagination.showing')}{' '}
                  <span className="font-semibold text-gray-900 dark:text-white">{(page - 1) * pageSize + 1}</span>
                  {' '}{t(language, 'dashboard.pages.platformAdmin.approvals.pagination.to')}{' '}
                  <span className="font-semibold text-gray-900 dark:text-white">{Math.min(page * pageSize, total)}</span>
                  {' '}{t(language, 'dashboard.pages.platformAdmin.approvals.pagination.of')}{' '}
                  <span className="font-semibold text-gray-900 dark:text-white">{total}</span>
                  {' '}{t(language, 'dashboard.pages.platformAdmin.approvals.pagination.registrations')}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-6 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-100 dark:disabled:hover:bg-gray-700"
                  >
                    {t(language, 'dashboard.pages.platformAdmin.approvals.pagination.previous')}
                  </button>
                  <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={page * pageSize >= total}
                    className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary-600"
                  >
                    {t(language, 'dashboard.pages.platformAdmin.approvals.pagination.next')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      {selectedRegistration && (
        <>
          <ApproveModal
            isOpen={showApproveModal}
            onClose={() => setShowApproveModal(false)}
            onConfirm={confirmApprove}
            organizationName={selectedRegistration.org_name_th}
            trackingCode={selectedRegistration.tracking_code}
          />
          <RejectModal
            isOpen={showRejectModal}
            onClose={() => setShowRejectModal(false)}
            onConfirm={confirmReject}
            organizationName={selectedRegistration.org_name_th}
            trackingCode={selectedRegistration.tracking_code}
          />
          <RequestInfoModal
            isOpen={showRequestInfoModal}
            onClose={() => setShowRequestInfoModal(false)}
            onConfirm={confirmRequestInfo}
            organizationName={selectedRegistration.org_name_th}
            trackingCode={selectedRegistration.tracking_code}
          />
        </>
      )}
    </>
  );
}
