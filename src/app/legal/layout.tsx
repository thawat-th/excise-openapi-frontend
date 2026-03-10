'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/components/LanguageProvider';
import { t } from '@/i18n/i18n';
import { FileText, Shield, Scale } from 'lucide-react';

const navigation = [
  { name: 'Cookies', href: '/legal/cookies', icon: Shield, key: 'legal.cookies.title' },
  { name: 'Privacy', href: '/legal/privacy', icon: FileText, key: 'legal.privacy.title' },
  { name: 'Terms', href: '/legal/terms', icon: Scale, key: 'legal.terms.title' },
];

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { language } = useLanguage();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <aside className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 sticky top-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                {t(language, 'footer.legal')}
              </h2>
              <nav className="space-y-1">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link key={item.href} href={item.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? 'bg-excise-100 dark:bg-excise-900/30 text-excise-700 dark:text-excise-300' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span>{t(language, item.key)}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </aside>
          <main className="lg:col-span-3">{children}</main>
        </div>
      </div>
    </div>
  );
}
