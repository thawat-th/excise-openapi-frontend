import { redirect } from 'next/navigation';
import { routes } from '@/lib/routes';

export default function UserSettingsPage() {
  redirect(routes.userSettings.account('individual'));
}
