'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { PageHeader } from '@/components/dashboard';
import { User, Key, Smartphone, Monitor, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/components/LanguageProvider';
import { t } from '@/i18n/i18n';
import { routes } from '@/lib/routes';

const basePath = routes.platformAdmin.platformSettings();
const tabs = [
  { key: 'account', href: `${basePath}/account`, icon: User },
  { key: 'password', href: `${basePath}/password`, icon: Key },
  { key: 'mfa', href: `${basePath}/mfa`, icon: Smartphone },
  { key: 'sessions', href: `${basePath}/sessions`, icon: Monitor },
  { key: 'preferences', href: `${basePath}/preferences`, icon: Settings },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { language } = useLanguage();
  const prefix = 'dashboard.pages.platformAdmin.settings';

  return (
    <>
      <PageHeader
        title={t(language, `${prefix}.title`)}
        description={t(language, `${prefix}.description`)}
        breadcrumbs={[
          { label: t(language, 'dashboard.pages.platformAdmin.dashboard.title'), href: routes.dashboard('platform-admin') },
          { label: t(language, `${prefix}.title`) },
        ]}
      />

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-slate-700">
          <nav className="flex gap-1 p-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = pathname === tab.href;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                      : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {t(language, `${prefix}.tabs.${tab.key}`)}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </>
  );
}
