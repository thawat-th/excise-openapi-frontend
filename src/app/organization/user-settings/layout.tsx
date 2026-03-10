import { UserSettingsLayout } from '@/components/settings/UserSettingsLayout';
import { routes } from '@/lib/routes';

export default function OrganizationUserSettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserSettingsLayout
      basePath={routes.userSettings.root('organization')}
      i18nPrefix="dashboard.pages.individual.settings"
      dashboardPath={routes.dashboard('organization')}
      dashboardI18nKey="dashboard.pages.organization.dashboard.title"
    >
      {children}
    </UserSettingsLayout>
  );
}
