'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { PageHeader } from '@/components/dashboard';
import { User, Key, Smartphone, Monitor, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/components/LanguageProvider';
import { t } from '@/i18n/i18n';

interface UserSettingsLayoutProps {
  children: React.ReactNode;
  /** Base path for the portal (e.g., '/individual' or '/platform-admin') */
  basePath: string;
  /** i18n prefix for translations (e.g., 'dashboard.pages.individual.settings') */
  i18nPrefix: string;
  /** Dashboard path for breadcrumbs */
  dashboardPath: string;
  /** Dashboard i18n key for breadcrumbs */
  dashboardI18nKey: string;
}

export function UserSettingsLayout({
  children,
  basePath,
  i18nPrefix,
  dashboardPath,
  dashboardI18nKey,
}: UserSettingsLayoutProps) {
  const pathname = usePathname();
  const { language } = useLanguage();

  const tabs = [
    { key: 'account', href: `${basePath}/account`, icon: User },
    { key: 'password', href: `${basePath}/password`, icon: Key },
    { key: 'mfa', href: `${basePath}/mfa`, icon: Smartphone },
    { key: 'sessions', href: `${basePath}/sessions`, icon: Monitor },
    { key: 'preferences', href: `${basePath}/preferences`, icon: Settings },
  ];

  return (
    <>
      <PageHeader
        title={t(language, `${i18nPrefix}.title`)}
        description={t(language, `${i18nPrefix}.description`)}
        breadcrumbs={[
          { label: t(language, dashboardI18nKey), href: dashboardPath },
          { label: t(language, `${i18nPrefix}.title`) },
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
                  {t(language, `${i18nPrefix}.tabs.${tab.key}`)}
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
