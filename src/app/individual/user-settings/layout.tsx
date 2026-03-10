import { UserSettingsLayout } from '@/components/settings/UserSettingsLayout';
import { routes } from '@/lib/routes';

export default function IndividualUserSettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserSettingsLayout
      basePath={routes.userSettings.root('individual')}
      i18nPrefix="dashboard.pages.individual.settings"
      dashboardPath={routes.dashboard('individual')}
      dashboardI18nKey="dashboard.pages.individual.dashboard.title"
    >
      {children}
    </UserSettingsLayout>
  );
}
