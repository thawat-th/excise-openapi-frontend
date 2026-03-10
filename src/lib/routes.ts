/**
 * Centralized route management
 * Use these functions instead of hardcoded paths throughout the app
 */

import { PortalType } from '@/config/navigation';

/**
 * Generate portal-specific paths
 */
export const routes = {
  // Root paths
  root: (portal: PortalType) => `/${portal}`,

  // Dashboard
  dashboard: (portal: PortalType) => `/${portal}/dashboard`,

  // User Settings (all portals)
  userSettings: {
    root: (portal: PortalType) => `/${portal}/user-settings`,
    account: (portal: PortalType) => `/${portal}/user-settings/account`,
    password: (portal: PortalType) => `/${portal}/user-settings/password`,
    mfa: (portal: PortalType) => `/${portal}/user-settings/mfa`,
    sessions: (portal: PortalType) => `/${portal}/user-settings/sessions`,
    preferences: (portal: PortalType) => `/${portal}/user-settings/preferences`,
  },

  // Individual & Organization shared routes
  services: (portal: Extract<PortalType, 'individual' | 'organization'>) => `/${portal}/services`,
  requests: (portal: Extract<PortalType, 'individual' | 'organization'>) => `/${portal}/requests`,
  catalog: (portal: Extract<PortalType, 'individual' | 'organization'>) => `/${portal}/catalog`,
  credentials: (portal: Extract<PortalType, 'individual' | 'organization'>) => `/${portal}/credentials`,
  usage: (portal: Extract<PortalType, 'individual' | 'organization'>) => `/${portal}/usage`,

  // Individual only
  individual: {
    profile: () => '/individual/profile',
    notifications: () => '/individual/notifications',
    help: () => '/individual/help',
    security: () => '/individual/security',
  },

  // Organization only
  organization: {
    applications: () => '/organization/applications',
    team: () => '/organization/team',
    settings: () => '/organization/settings',
  },

  // Platform Admin only
  platformAdmin: {
    approvals: () => '/platform-admin/approvals',
    approvalDetail: (id: string) => `/platform-admin/approvals/${id}`,
    users: () => '/platform-admin/users',
    roles: () => '/platform-admin/roles',
    sessions: () => '/platform-admin/sessions',
    auditLogs: () => '/platform-admin/audit-logs',
    analytics: () => '/platform-admin/analytics',
    metrics: () => '/platform-admin/metrics',
    workflowHistory: () => '/platform-admin/workflow-history',
    clients: () => '/platform-admin/clients',
    rateLimits: () => '/platform-admin/rate-limits',
    policies: () => '/platform-admin/policies',
    policyTest: () => '/platform-admin/policy-test',
    subscriptions: () => '/platform-admin/subscriptions',
    alerts: () => '/platform-admin/alerts',
    integrations: () => '/platform-admin/integrations',
    maintenance: () => '/platform-admin/maintenance',
    versions: () => '/platform-admin/versions',
    platformSettings: () => '/platform-admin/settings',
  },

  // Auth routes
  auth: {
    login: () => '/auth/login',
    register: () => '/auth/register',
    callback: () => '/auth/callback',
    logout: () => '/logout',
  },

  // Public routes
  home: () => '/',
  gettingStarted: () => '/getting-started',
};

/**
 * Get breadcrumb for dashboard by portal type
 */
export function getDashboardBreadcrumb(portal: PortalType, t: (key: string) => string) {
  const labels = {
    individual: t('dashboard.pages.individual.dashboard.title'),
    organization: t('dashboard.pages.organization.dashboard.title'),
    'platform-admin': t('dashboard.pages.platformAdmin.dashboard.title'),
  };

  return {
    label: labels[portal],
    href: routes.dashboard(portal),
  };
}

/**
 * Protected route prefixes for middleware
 */
export const protectedRoutes = ['/individual', '/organization', '/platform-admin'];

/**
 * Auth routes that redirect to dashboard if authenticated
 */
export const authRoutes = ['/auth/login', '/auth/register'];

/**
 * Create a simple breadcrumb item
 */
export function createBreadcrumb(label: string, href?: string) {
  return href ? { label, href } : { label };
}

/**
 * Create common breadcrumbs with dashboard link
 */
export function createDashboardBreadcrumbs(
  portal: PortalType,
  t: (key: string) => string,
  currentPage?: { label: string; href?: string }
): Array<{ label: string; href?: string }> {
  const breadcrumbs: Array<{ label: string; href?: string }> = [getDashboardBreadcrumb(portal, t)];
  if (currentPage) {
    breadcrumbs.push(currentPage);
  }
  return breadcrumbs;
}
