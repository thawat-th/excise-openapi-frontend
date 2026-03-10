import {
  LogOut,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  labelKey: string;
  href: string;
  icon?: LucideIcon;
  badge?: number;
}

export interface NavSection {
  labelKey: string;
  icon?: LucideIcon;
  items: NavItem[];
}

export type NavEntry = NavItem | NavSection;
export type NavConfig = NavEntry[];

// Keep backward compat aliases
export type NavGroup = NavSection;
export function isNavGroup(item: NavEntry): item is NavSection {
  return 'items' in item;
}

// ===========================================
// A. Individual Portal
// ===========================================
export const individualNav: NavConfig = [
  { labelKey: 'navigation.individual.dashboard', href: '/individual/dashboard' },
  { labelKey: 'navigation.individual.myServices', href: '/individual/services' },
  { labelKey: 'navigation.individual.myRequests', href: '/individual/requests' },
  { labelKey: 'navigation.individual.notifications', href: '/individual/notifications', badge: 3 },
  { labelKey: 'navigation.individual.profile', href: '/individual/profile' },
  { labelKey: 'navigation.individual.help', href: '/individual/help' },
  { labelKey: 'navigation.individual.settings', href: '/individual/user-settings' },
  { labelKey: 'navigation.individual.signOut', href: '/logout', icon: LogOut },
];

// ===========================================
// B. Organization Portal
// ===========================================
export const organizationNav: NavConfig = [
  { labelKey: 'navigation.organization.dashboard', href: '/organization/dashboard' },
  { labelKey: 'navigation.organization.servicesApis', href: '/organization/services' },
  { labelKey: 'navigation.organization.credentials', href: '/organization/credentials' },
  { labelKey: 'navigation.organization.applications', href: '/organization/applications' },
  { labelKey: 'navigation.organization.usage', href: '/organization/usage' },
  { labelKey: 'navigation.organization.team', href: '/organization/team' },
  { labelKey: 'navigation.organization.requests', href: '/organization/requests' },
  {
    labelKey: 'navigation.organization.settings',
    items: [
      { labelKey: 'navigation.organization.organizationSettings', href: '/organization/settings' },
      { labelKey: 'navigation.organization.userSettings', href: '/organization/user-settings' },
    ],
  },
  { labelKey: 'navigation.organization.signOut', href: '/logout', icon: LogOut },
];

// ===========================================
// C. Platform Admin Portal
// ===========================================
export const platformAdminNav: NavConfig = [
  { labelKey: 'navigation.platformAdmin.dashboard', href: '/platform-admin/dashboard' },
  { labelKey: 'navigation.platformAdmin.pendingApprovals', href: '/platform-admin/approvals', badge: 5 },
  { labelKey: 'navigation.platformAdmin.alerts', href: '/platform-admin/alerts' },
  { labelKey: 'navigation.platformAdmin.auditLogs', href: '/platform-admin/audit-logs' },

  {
    labelKey: 'navigation.platformAdmin.usersRequests',
    items: [
      { labelKey: 'navigation.platformAdmin.users', href: '/platform-admin/users' },
      { labelKey: 'navigation.platformAdmin.accessRequests', href: '/platform-admin/requests' },
      { labelKey: 'navigation.platformAdmin.subscriptions', href: '/platform-admin/subscriptions' },
      { labelKey: 'navigation.platformAdmin.activeSessions', href: '/platform-admin/sessions' },
    ],
  },
  {
    labelKey: 'navigation.platformAdmin.analytics',
    items: [
      { labelKey: 'navigation.platformAdmin.apiAnalytics', href: '/platform-admin/analytics' },
      { labelKey: 'navigation.platformAdmin.systemMetrics', href: '/platform-admin/metrics' },
      { labelKey: 'navigation.platformAdmin.workflowHistory', href: '/platform-admin/workflow-history' },
    ],
  },
  {
    labelKey: 'navigation.platformAdmin.apiManagement',
    items: [
      { labelKey: 'navigation.platformAdmin.serviceRegistry', href: '/platform-admin/services' },
      { labelKey: 'navigation.platformAdmin.apiDocumentation', href: '/platform-admin/api-docs' },
      { labelKey: 'navigation.platformAdmin.apiRoutes', href: '/platform-admin/routes' },
      { labelKey: 'navigation.platformAdmin.rateLimiting', href: '/platform-admin/rate-limits' },
      { labelKey: 'navigation.platformAdmin.apiCredentials', href: '/platform-admin/credentials' },
      { labelKey: 'navigation.platformAdmin.clientApplications', href: '/platform-admin/clients' },
    ],
  },
  {
    labelKey: 'navigation.platformAdmin.securityPolicies',
    items: [
      { labelKey: 'navigation.platformAdmin.rolesPermissions', href: '/platform-admin/roles' },
      { labelKey: 'navigation.platformAdmin.policyManagement', href: '/platform-admin/policies' },
      { labelKey: 'navigation.platformAdmin.policySimulator', href: '/platform-admin/policy-test' },
      { labelKey: 'navigation.platformAdmin.securityRules', href: '/platform-admin/security-rules' },
    ],
  },
  {
    labelKey: 'navigation.platformAdmin.system',
    items: [
      { labelKey: 'navigation.platformAdmin.platformSettings', href: '/platform-admin/settings' },
      { labelKey: 'navigation.platformAdmin.userSettings', href: '/platform-admin/user-settings' },
      { labelKey: 'navigation.platformAdmin.externalIntegrations', href: '/platform-admin/integrations' },
      { labelKey: 'navigation.platformAdmin.maintenanceMode', href: '/platform-admin/maintenance' },
    ],
  },

  { labelKey: 'navigation.platformAdmin.signOut', href: '/logout', icon: LogOut },
];

// ===========================================
// Helper Functions
// ===========================================
export type PortalType = 'individual' | 'organization' | 'platform-admin';

export function getNavConfig(portalType: PortalType): NavConfig {
  switch (portalType) {
    case 'individual':
      return individualNav;
    case 'organization':
      return organizationNav;
    case 'platform-admin':
      return platformAdminNav;
  }
}

export function getPortalTitleKey(portalType: PortalType): string {
  return `navigation.portalTitle.${portalType}`;
}

export function getPortalBasePath(portalType: PortalType): string {
  switch (portalType) {
    case 'individual':
      return '/individual';
    case 'organization':
      return '/organization';
    case 'platform-admin':
      return '/platform-admin';
  }
}
