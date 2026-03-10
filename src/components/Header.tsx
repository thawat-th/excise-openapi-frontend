'use client';

import { useLanguage } from '@/components/LanguageProvider';
import { t, Language } from '@/i18n/i18n';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Globe, Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const languages: { code: Language; label: string }[] = [
  { code: 'th', label: 'ไทย' },
  { code: 'en', label: 'English' },
];

export function Header() {
  const { language, setLanguage } = useLanguage();

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-excise-200 dark:border-slate-700 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          <a href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <img
              src="/logo-excise.svg"
              alt="Excise Department Logo"
              className="h-14 w-auto dark:brightness-110"
              title="Excise OpenAPI"
            />
          </a>

          <div className="flex items-center gap-3 ml-auto">
            {/* Home Link */}
            <a
              href="/"
              className="text-excise-600 dark:text-excise-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium"
            >
              {t(language, 'common.home')}
            </a>

            {/* Language Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 transition-colors focus:outline-none">
                <Globe className="w-4 h-4" />
                <span>{language.toUpperCase()}</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[120px]">
                {languages.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className="flex items-center justify-between cursor-pointer"
                  >
                    <span>{lang.label}</span>
                    {language === lang.code && <Check className="w-4 h-4 text-primary-600" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme Toggle */}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
