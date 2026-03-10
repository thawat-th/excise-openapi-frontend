import { redirect } from 'next/navigation';
import { routes } from '@/lib/routes';

export default function SecurityPage() {
  redirect(routes.userSettings.mfa('individual'));
}
