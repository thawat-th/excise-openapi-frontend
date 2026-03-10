import { DashboardLayout } from '@/components/dashboard';

export default function PlatformAdminLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout portalType="platform-admin">{children}</DashboardLayout>;
}
