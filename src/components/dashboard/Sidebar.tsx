'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ChevronRight, ChevronLeft, Menu, X } from 'lucide-react';
import { cn, getInitials } from '@/lib/utils';
import {
  NavItem,
  NavSection,
  isNavGroup,
  PortalType,
  getNavConfig,
  getPortalTitleKey,
} from '@/config/navigation';
import { useLanguage } from '@/components/LanguageProvider';
import { t } from '@/i18n/i18n';

interface UserProfile {
  firstName?: string;
  lastName?: string;
  email?: string;
  avatar?: string;
}

interface SidebarProps {
  portalType: PortalType;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function Sidebar({ portalType, isCollapsed, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();
  const { language } = useLanguage();
  const navConfig = getNavConfig(portalType);
  const portalTitle = t(language, getPortalTitleKey(portalType));
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);

  // Fetch user profile
  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch('/api/account/profile');
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        }
      } catch (err) {
        console.error('Failed to fetch user profile:', err);
      }
    }
    fetchUser();
  }, []);

  const userInitials = getInitials(user?.firstName, user?.lastName);
  const userName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'User';
  const userEmail = user?.email || '';

  // Auto-expand section containing active path
  useEffect(() => {
    navConfig.forEach((entry) => {
      if (isNavGroup(entry)) {
        const hasActive = entry.items.some((item) => pathname.startsWith(item.href));
        if (hasActive && !expandedSections.includes(entry.labelKey)) {
          setExpandedSections((prev) => [...prev, entry.labelKey]);
        }
      }
    });
  }, [pathname, navConfig]);

  // Load expanded state from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(`sidebar-sections-${portalType}`);
    if (stored) {
      setExpandedSections(JSON.parse(stored));
    }
  }, [portalType]);

  // Save expanded state
  useEffect(() => {
    localStorage.setItem(`sidebar-sections-${portalType}`, JSON.stringify(expandedSections));
  }, [expandedSections, portalType]);

  const toggleSection = (key: string) => {
    setExpandedSections((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white dark:bg-slate-800 shadow-sm border border-gray-200 dark:border-slate-700"
      >
        {isMobileOpen ? <X className="w-5 h-5 dark:text-white" /> : <Menu className="w-5 h-5 dark:text-white" />}
      </button>

      {/* Backdrop */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/30 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-40 h-screen bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 transition-all duration-200',
          'flex flex-col',
          isCollapsed ? 'w-[60px]' : 'w-56',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo & Portal Title */}
        <div className={cn(
          'h-14 flex items-center border-b border-gray-100 dark:border-slate-800 flex-shrink-0',
          isCollapsed ? 'px-3 justify-center' : 'px-4 gap-3'
        )}>
          <Image
            src="/logo-excise.svg"
            alt="Excise"
            width={28}
            height={28}
            className="flex-shrink-0 dark:hidden"
          />
          <Image
            src="/logo-excise-white.svg"
            alt="Excise"
            width={28}
            height={28}
            className="flex-shrink-0 hidden dark:block"
          />
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-[13px] font-semibold text-gray-900 dark:text-white truncate">Excise OpenAPI</span>
              <span className="text-[11px] text-gray-400 dark:text-slate-500 truncate">{portalTitle}</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className={cn('flex-1 overflow-y-auto', isCollapsed ? 'px-1.5 py-2' : 'px-2 py-2')}>
          {isCollapsed ? (
            <CollapsedNav navConfig={navConfig} pathname={pathname} language={language} />
          ) : (
            <ul className="space-y-0.5">
              {navConfig.map((entry) => {
                if (isNavGroup(entry)) {
                  return (
                    <SectionItem
                      key={entry.labelKey}
                      section={entry}
                      isExpanded={expandedSections.includes(entry.labelKey)}
                      onToggle={() => toggleSection(entry.labelKey)}
                      pathname={pathname}
                      language={language}
                    />
                  );
                }

                const item = entry as NavItem;
                return (
                  <NavLink
                    key={item.href}
                    item={item}
                    isActive={isActive(item.href)}
                    isSignOut={item.labelKey.includes('signOut')}
                    language={language}
                  />
                );
              })}
            </ul>
          )}
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-100 dark:border-slate-800">
          <button
            onClick={onToggleCollapse}
            className={cn(
              'hidden lg:flex items-center w-full text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-colors',
              isCollapsed ? 'justify-center py-2.5' : 'justify-end gap-1.5 px-4 py-2'
            )}
            title={isCollapsed ? t(language, 'dashboard.sidebar.expand') : t(language, 'dashboard.sidebar.collapse')}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <span className="text-xs">{t(language, 'dashboard.sidebar.collapse')}</span>
                <ChevronLeft className="w-4 h-4" />
              </>
            )}
          </button>

          <div className={cn(
            'flex items-center border-t border-gray-100 dark:border-slate-800',
            isCollapsed ? 'justify-center p-2' : 'gap-3 px-4 py-3'
          )}>
            {user?.avatar ? (
              <img src={user.avatar} alt={userName} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-slate-300 flex-shrink-0">
                {userInitials}
              </div>
            )}
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{userName}</p>
                <p className="text-[11px] text-gray-400 dark:text-slate-500 truncate">{userEmail}</p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

// ===========================================
// NavLink — single text link
// ===========================================

function NavLink({ item, isActive, isSignOut, isNested, language }: {
  item: NavItem;
  isActive: boolean;
  isSignOut?: boolean;
  isNested?: boolean;
  language: 'en' | 'th';
}) {
  const Icon = item.icon;
  const label = t(language, item.labelKey);

  return (
    <li className={isSignOut ? 'mt-2 pt-2 border-t border-gray-100 dark:border-slate-800' : ''}>
      <Link
        href={item.href}
        className={cn(
          'flex items-center gap-2 rounded-md text-[13px] transition-colors',
          isNested ? 'pl-6 pr-2 py-1.5' : 'px-2 py-1.5',
          isActive
            ? 'bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white font-medium'
            : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800/50 hover:text-gray-900 dark:hover:text-white',
          isSignOut && !isActive && 'text-gray-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400'
        )}
      >
        {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
        <span className="truncate">{label}</span>
        {item.badge && (
          <span className="ml-auto min-w-[18px] h-[18px] flex items-center justify-center px-1 text-[10px] font-medium rounded-full bg-gray-200 dark:bg-slate-700 text-gray-500 dark:text-slate-400">
            {item.badge}
          </span>
        )}
      </Link>
    </li>
  );
}

// ===========================================
// SectionItem — collapsible text section
// ===========================================

function SectionItem({ section, isExpanded, onToggle, pathname, language }: {
  section: NavSection;
  isExpanded: boolean;
  onToggle: () => void;
  pathname: string;
  language: 'en' | 'th';
}) {
  const sectionLabel = t(language, section.labelKey);
  const hasActive = section.items.some((item) => pathname.startsWith(item.href));

  return (
    <li className="mt-3 first:mt-0">
      <button
        onClick={onToggle}
        className={cn(
          'w-full flex items-center gap-1.5 px-2 py-1.5 rounded-md text-[12px] font-medium uppercase tracking-wide transition-colors',
          hasActive
            ? 'text-gray-900 dark:text-white'
            : 'text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300'
        )}
      >
        <ChevronRight className={cn(
          'w-3 h-3 flex-shrink-0 transition-transform duration-150',
          isExpanded && 'rotate-90'
        )} />
        <span className="truncate">{sectionLabel}</span>
      </button>

      <ul
        className={cn(
          'overflow-hidden transition-all duration-150',
          isExpanded ? 'max-h-[500px] opacity-100 mt-0.5' : 'max-h-0 opacity-0'
        )}
      >
        {section.items.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            isActive={pathname === item.href}
            isNested
            language={language}
          />
        ))}
      </ul>
    </li>
  );
}

// ===========================================
// CollapsedNav — narrow sidebar with flyouts
// ===========================================

function CollapsedNav({ navConfig, pathname, language }: {
  navConfig: ReturnType<typeof getNavConfig>;
  pathname: string;
  language: 'en' | 'th';
}) {
  return (
    <div className="space-y-1">
      {navConfig.map((entry) => {
        if (isNavGroup(entry)) {
          const sectionLabel = t(language, entry.labelKey);
          const hasActive = entry.items.some((item) => pathname.startsWith(item.href));

          return (
            <div key={entry.labelKey} className="relative group">
              <div
                title={sectionLabel}
                className={cn(
                  'flex items-center justify-center w-full p-2 rounded-md text-[11px] font-semibold cursor-default transition-colors',
                  hasActive
                    ? 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300'
                    : 'text-gray-300 dark:text-slate-600 group-hover:text-gray-500 dark:group-hover:text-slate-400'
                )}
              >
                {sectionLabel.charAt(0).toUpperCase()}
              </div>

              {/* Flyout */}
              <div className="absolute left-full top-0 ml-1 hidden group-hover:block z-50">
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 py-1 min-w-[180px]">
                  <div className="px-3 py-1.5 text-[11px] font-medium text-gray-400 dark:text-slate-500 uppercase tracking-wider">
                    {sectionLabel}
                  </div>
                  {entry.items.map((item) => {
                    const itemLabel = t(language, item.labelKey);
                    const itemActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          'flex items-center px-3 py-1.5 text-[13px] transition-colors',
                          itemActive
                            ? 'bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white font-medium'
                            : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700/50 hover:text-gray-900 dark:hover:text-white'
                        )}
                      >
                        {itemLabel}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        }

        const item = entry as NavItem;
        const Icon = item.icon;
        const label = t(language, item.labelKey);
        const active = pathname === item.href;
        const isSignOut = item.labelKey.includes('signOut');

        return (
          <div key={item.href} className={isSignOut ? 'mt-2 pt-2 border-t border-gray-100 dark:border-slate-800' : ''}>
            <Link
              href={item.href}
              title={label}
              className={cn(
                'relative flex items-center justify-center w-full p-2 rounded-md transition-colors',
                active
                  ? 'bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white'
                  : 'text-gray-400 dark:text-slate-500 hover:bg-gray-50 dark:hover:bg-slate-800/50 hover:text-gray-700 dark:hover:text-slate-300',
                isSignOut && !active && 'hover:text-red-600 dark:hover:text-red-400'
              )}
            >
              {Icon ? (
                <Icon className="w-4 h-4" />
              ) : (
                <span className="text-[11px] font-semibold leading-none">
                  {label.charAt(0).toUpperCase()}
                </span>
              )}
              {item.badge && (
                <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-gray-400 dark:bg-slate-500 rounded-full" />
              )}
            </Link>
          </div>
        );
      })}
    </div>
  );
}
