import { UserSettingsLayout } from '@/components/settings/UserSettingsLayout';
import { routes } from '@/lib/routes';

export default function PlatformAdminUserSettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserSettingsLayout
      basePath={routes.userSettings.root('platform-admin')}
      i18nPrefix="dashboard.pages.individual.settings"
      dashboardPath={routes.dashboard('platform-admin')}
      dashboardI18nKey="dashboard.pages.platformAdmin.dashboard.title"
    >
      {children}
    </UserSettingsLayout>
  );
}
