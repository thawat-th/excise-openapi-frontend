import { DeveloperPortalLayout } from '@/components/developer-portal';

export default function IndividualLayout({ children }: { children: React.ReactNode }) {
  return <DeveloperPortalLayout portalType="individual">{children}</DeveloperPortalLayout>;
}
