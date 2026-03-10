'use client';

import { useEffect, useState } from 'react';
import {
  PageHeader,
  StatCard,
  ChartCard,
  LineChartPlaceholder,
  BarChartPlaceholder,
  DonutChartPlaceholder,
  ActivityItem,
} from '@/components/dashboard';
import {
  Users,
  Server,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Shield,
  Building2,
  UserCheck,
} from 'lucide-react';
import { useLanguage } from '@/components/LanguageProvider';
import { t } from '@/i18n/i18n';

interface PlatformStatistics {
  profiles: {
    individual: number;
    organization: number;
    total: number;
  };
  members: {
    by_status: Record<string, number>;
    by_role: Record<string, number>;
  };
}

const pendingApprovals = [
  { id: 'APR-001', org: 'Acme Corp', type: 'API Access', service: 'Payment API', submitted: '2 hours ago' },
  { id: 'APR-002', org: 'TechStart Ltd', type: 'New Registration', service: '-', submitted: '5 hours ago' },
  { id: 'APR-003', org: 'Global Inc', type: 'Quota Increase', service: 'Tax API', submitted: '1 day ago' },
];

const systemHealth = [
  { name: 'API Gateway', status: 'operational', uptime: '99.99%' },
  { name: 'Auth Service', status: 'operational', uptime: '99.98%' },
  { name: 'Database Cluster', status: 'operational', uptime: '99.95%' },
  { name: 'Message Queue', status: 'degraded', uptime: '98.50%' },
];

export default function PlatformAdminDashboardPage() {
  const { language } = useLanguage();
  const [stats, setStats] = useState<PlatformStatistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStatistics() {
      try {
        const res = await fetch('/api/admin/statistics');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        } else {
          // Fallback demo data when backend is unavailable
          setStats({
            profiles: { individual: 1247, organization: 86, total: 1333 },
            members: {
              by_status: { active: 892, pending: 45, suspended: 12, revoked: 3 },
              by_role: { owner: 86, admin: 124, member: 742 },
            },
          });
        }
      } catch {
        // Fallback demo data when backend is unavailable
        setStats({
          profiles: { individual: 1247, organization: 86, total: 1333 },
          members: {
            by_status: { active: 892, pending: 45, suspended: 12, revoked: 3 },
            by_role: { owner: 86, admin: 124, member: 742 },
          },
        });
      } finally {
        setLoading(false);
      }
    }
    fetchStatistics();
  }, []);

  const totalMembers = stats?.members?.by_status
    ? Object.values(stats.members.by_status).reduce((sum, v) => sum + v, 0)
    : 0;

  const activeMembers = stats?.members?.by_status?.active || 0;

  return (
    <>
      <PageHeader
        title={t(language, 'admin.dashboard.title')}
        description={t(language, 'admin.dashboard.description')}
      />

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title={t(language, 'admin.dashboard.stat.individuals')}
          value={loading ? '-' : (stats?.profiles?.individual?.toLocaleString() || '0')}
          change={stats ? `${t(language, 'admin.dashboard.stat.totalProfiles')}: ${stats.profiles.total.toLocaleString()}` : undefined}
          changeType="neutral"
          icon={Users}
          iconColor="primary"
        />
        <StatCard
          title={t(language, 'admin.dashboard.stat.organizations')}
          value={loading ? '-' : (stats?.profiles?.organization?.toLocaleString() || '0')}
          change={stats ? `${activeMembers.toLocaleString()} ${t(language, 'admin.dashboard.stat.activeMembers')}` : undefined}
          changeType="positive"
          icon={Building2}
          iconColor="blue"
        />
        <StatCard
          title={t(language, 'admin.dashboard.stat.totalMembers')}
          value={loading ? '-' : totalMembers.toLocaleString()}
          change={stats?.members?.by_status?.pending ? `${stats.members.by_status.pending} ${t(language, 'admin.dashboard.stat.pending')}` : undefined}
          changeType="neutral"
          icon={UserCheck}
          iconColor="green"
        />
        <StatCard
          title={t(language, 'admin.dashboard.stat.pendingApprovals')}
          value={15}
          change={`5 ${t(language, 'admin.dashboard.stat.urgent')}`}
          changeType="neutral"
          icon={Clock}
          iconColor="orange"
        />
      </div>

      {/* Member Distribution */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Members by Status */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t(language, 'admin.dashboard.membersByStatus')}
            </h3>
            <div className="space-y-3">
              {Object.entries(stats.members.by_status || {}).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${
                      status === 'active' ? 'bg-emerald-500' :
                      status === 'pending' ? 'bg-amber-500' :
                      status === 'suspended' ? 'bg-red-500' :
                      'bg-gray-400'
                    }`} />
                    <span className="text-sm text-gray-700 dark:text-slate-300 capitalize">{status}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{count.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Members by Role */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t(language, 'admin.dashboard.membersByRole')}
            </h3>
            <div className="space-y-3">
              {Object.entries(stats.members.by_role || {}).map(([role, count]) => (
                <div key={role} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${
                      role === 'owner' ? 'bg-purple-500' :
                      role === 'admin' ? 'bg-blue-500' :
                      role === 'member' ? 'bg-emerald-500' :
                      'bg-gray-400'
                    }`} />
                    <span className="text-sm text-gray-700 dark:text-slate-300 capitalize">{role}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{count.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* System Health */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t(language, 'admin.dashboard.systemHealth')}</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400">{t(language, 'admin.dashboard.systemHealthDesc')}</p>
          </div>
          <span className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm font-medium">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            {t(language, 'admin.dashboard.allSystemsOperational')}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {systemHealth.map((service) => (
            <div
              key={service.name}
              className={`p-4 rounded-lg border ${
                service.status === 'operational'
                  ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20'
                  : 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900 dark:text-white">{service.name}</span>
                {service.status === 'operational' ? (
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                )}
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className={service.status === 'operational' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}>
                  {service.status === 'operational'
                    ? t(language, 'admin.dashboard.operational')
                    : t(language, 'admin.dashboard.degraded')}
                </span>
                <span className="text-gray-500 dark:text-slate-400">{service.uptime} uptime</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <ChartCard
          title={t(language, 'admin.dashboard.platformTraffic')}
          subtitle={t(language, 'admin.dashboard.platformTrafficDesc')}
          className="lg:col-span-2"
        >
          <LineChartPlaceholder />
        </ChartCard>

        <ChartCard
          title={t(language, 'admin.dashboard.requestDistribution')}
          subtitle={t(language, 'admin.dashboard.requestDistributionDesc')}
        >
          <DonutChartPlaceholder />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Pending Approvals */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
          <div className="p-6 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t(language, 'admin.dashboard.pendingApprovals')}</h3>
              <p className="text-sm text-gray-500 dark:text-slate-400">{t(language, 'admin.dashboard.pendingApprovalsDesc')}</p>
            </div>
            <a href="/platform-admin/approvals" className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400">
              {t(language, 'admin.dashboard.viewAll')} →
            </a>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-slate-700">
            {pendingApprovals.map((approval) => (
              <div key={approval.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-700/50">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 dark:text-white">{approval.org}</span>
                    <span className="px-2 py-0.5 text-xs bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300 rounded">
                      {approval.type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-slate-400">{approval.service} • {approval.submitted}</p>
                </div>
                <button className="px-3 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                  {t(language, 'admin.dashboard.review')}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
          <div className="p-6 border-b border-gray-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t(language, 'admin.dashboard.recentActivity')}</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400">{t(language, 'admin.dashboard.recentActivityDesc')}</p>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-slate-700">
            <ActivityItem
              icon={<CheckCircle className="w-5 h-5 text-emerald-500" />}
              title={t(language, 'admin.dashboard.activity.orgApproved')}
              description="TechStart Ltd has been approved"
              time="10 min ago"
            />
            <ActivityItem
              icon={<Server className="w-5 h-5 text-blue-500" />}
              title={t(language, 'admin.dashboard.activity.apiDeployed')}
              description="Document Processing API v3.0 is live"
              time="1 hour ago"
            />
            <ActivityItem
              icon={<Shield className="w-5 h-5 text-purple-500" />}
              title={t(language, 'admin.dashboard.activity.policyUpdated')}
              description="Rate limiting policy modified"
              time="2 hours ago"
            />
            <ActivityItem
              icon={<AlertTriangle className="w-5 h-5 text-amber-500" />}
              title={t(language, 'admin.dashboard.activity.alertTriggered')}
              description="High error rate on Payment API"
              time="3 hours ago"
            />
          </div>
        </div>
      </div>

      {/* Top APIs */}
      <ChartCard
        title={t(language, 'admin.dashboard.topApis')}
        subtitle={t(language, 'admin.dashboard.topApisDesc')}
        action={
          <select className="text-sm border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg px-3 py-1.5">
            <option>{t(language, 'admin.dashboard.last24h')}</option>
            <option>{t(language, 'admin.dashboard.last7d')}</option>
            <option>{t(language, 'admin.dashboard.last30d')}</option>
          </select>
        }
      >
        <BarChartPlaceholder />
      </ChartCard>
    </>
  );
}
