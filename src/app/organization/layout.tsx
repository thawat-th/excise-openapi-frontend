import { DeveloperPortalLayout } from '@/components/developer-portal';

export default function OrganizationLayout({ children }: { children: React.ReactNode }) {
  return <DeveloperPortalLayout portalType="organization">{children}</DeveloperPortalLayout>;
}
