import { routes, getDashboardBreadcrumb, protectedRoutes, authRoutes } from '../routes';

describe('routes utility', () => {
  describe('root paths', () => {
    it('should generate correct root paths for all portals', () => {
      expect(routes.root('individual')).toBe('/individual');
      expect(routes.root('organization')).toBe('/organization');
      expect(routes.root('platform-admin')).toBe('/platform-admin');
    });
  });

  describe('dashboard paths', () => {
    it('should generate correct dashboard paths for all portals', () => {
      expect(routes.dashboard('individual')).toBe('/individual/dashboard');
      expect(routes.dashboard('organization')).toBe('/organization/dashboard');
      expect(routes.dashboard('platform-admin')).toBe('/platform-admin/dashboard');
    });
  });

  describe('user settings paths', () => {
    it('should generate correct user settings root paths', () => {
      expect(routes.userSettings.root('individual')).toBe('/individual/user-settings');
      expect(routes.userSettings.root('organization')).toBe('/organization/user-settings');
      expect(routes.userSettings.root('platform-admin')).toBe('/platform-admin/user-settings');
    });

    it('should generate correct user settings sub-paths', () => {
      expect(routes.userSettings.account('individual')).toBe('/individual/user-settings/account');
      expect(routes.userSettings.password('organization')).toBe('/organization/user-settings/password');
      expect(routes.userSettings.mfa('platform-admin')).toBe('/platform-admin/user-settings/mfa');
      expect(routes.userSettings.sessions('individual')).toBe('/individual/user-settings/sessions');
      expect(routes.userSettings.preferences('organization')).toBe('/organization/user-settings/preferences');
    });
  });

  describe('shared routes (individual & organization)', () => {
    it('should generate correct shared paths', () => {
      expect(routes.services('individual')).toBe('/individual/services');
      expect(routes.services('organization')).toBe('/organization/services');

      expect(routes.requests('individual')).toBe('/individual/requests');
      expect(routes.requests('organization')).toBe('/organization/requests');

      expect(routes.catalog('individual')).toBe('/individual/catalog');
      expect(routes.catalog('organization')).toBe('/organization/catalog');

      expect(routes.credentials('individual')).toBe('/individual/credentials');
      expect(routes.credentials('organization')).toBe('/organization/credentials');

      expect(routes.usage('individual')).toBe('/individual/usage');
      expect(routes.usage('organization')).toBe('/organization/usage');
    });
  });

  describe('individual-only routes', () => {
    it('should generate correct individual-specific paths', () => {
      expect(routes.individual.profile()).toBe('/individual/profile');
      expect(routes.individual.notifications()).toBe('/individual/notifications');
      expect(routes.individual.help()).toBe('/individual/help');
      expect(routes.individual.security()).toBe('/individual/security');
    });
  });

  describe('organization-only routes', () => {
    it('should generate correct organization-specific paths', () => {
      expect(routes.organization.team()).toBe('/organization/team');
      expect(routes.organization.settings()).toBe('/organization/settings');
    });
  });

  describe('platform-admin routes', () => {
    it('should generate correct platform-admin paths', () => {
      expect(routes.platformAdmin.approvals()).toBe('/platform-admin/approvals');
      expect(routes.platformAdmin.approvalDetail('123')).toBe('/platform-admin/approvals/123');
      expect(routes.platformAdmin.users()).toBe('/platform-admin/users');
      expect(routes.platformAdmin.roles()).toBe('/platform-admin/roles');
      expect(routes.platformAdmin.auditLogs()).toBe('/platform-admin/audit-logs');
      expect(routes.platformAdmin.platformSettings()).toBe('/platform-admin/settings');
    });
  });

  describe('auth routes', () => {
    it('should generate correct auth paths', () => {
      expect(routes.auth.login()).toBe('/auth/login');
      expect(routes.auth.register()).toBe('/auth/register');
      expect(routes.auth.callback()).toBe('/auth/callback');
      expect(routes.auth.logout()).toBe('/logout');
    });
  });

  describe('public routes', () => {
    it('should generate correct public paths', () => {
      expect(routes.home()).toBe('/');
      expect(routes.gettingStarted()).toBe('/getting-started');
    });
  });

  describe('getDashboardBreadcrumb', () => {
    const mockT = (key: string) => {
      const translations: Record<string, string> = {
        'dashboard.pages.individual.dashboard.title': 'Dashboard',
        'dashboard.pages.organization.dashboard.title': 'แดชบอร์ด',
        'dashboard.pages.platformAdmin.dashboard.title': 'Platform Dashboard',
      };
      return translations[key] || key;
    };

    it('should generate correct breadcrumb for individual', () => {
      const breadcrumb = getDashboardBreadcrumb('individual', mockT);
      expect(breadcrumb).toEqual({
        label: 'Dashboard',
        href: '/individual/dashboard',
      });
    });

    it('should generate correct breadcrumb for organization', () => {
      const breadcrumb = getDashboardBreadcrumb('organization', mockT);
      expect(breadcrumb).toEqual({
        label: 'แดชบอร์ด',
        href: '/organization/dashboard',
      });
    });

    it('should generate correct breadcrumb for platform-admin', () => {
      const breadcrumb = getDashboardBreadcrumb('platform-admin', mockT);
      expect(breadcrumb).toEqual({
        label: 'Platform Dashboard',
        href: '/platform-admin/dashboard',
      });
    });
  });

  describe('route constants', () => {
    it('should export protected routes array', () => {
      expect(protectedRoutes).toEqual(['/individual', '/organization', '/platform-admin']);
    });

    it('should export auth routes array', () => {
      expect(authRoutes).toEqual(['/auth/login', '/auth/register']);
    });
  });
});
