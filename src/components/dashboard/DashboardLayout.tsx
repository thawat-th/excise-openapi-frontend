'use client';

import { ReactNode, useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { PortalType } from '@/config/navigation';
import { Bell, Search, Settings, User, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ViewAsPortalSwitcher } from '@/components/admin';
import { useLanguage } from '@/components/LanguageProvider';
import { t } from '@/i18n/i18n';
import Link from 'next/link';
import NotificationBell from '@/components/NotificationBell';

interface DashboardLayoutProps {
  children: ReactNode;
  portalType: PortalType;
}

export function DashboardLayout({ children, portalType }: DashboardLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const { language } = useLanguage();

  // Load collapsed state from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(`sidebar-collapsed-${portalType}`);
    if (stored) {
      setIsCollapsed(JSON.parse(stored));
    }
  }, [portalType]);

  // Save collapsed state to localStorage
  const handleToggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem(`sidebar-collapsed-${portalType}`, JSON.stringify(newState));
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.settings-dropdown-container')) {
        setShowSettingsDropdown(false);
      }
    };
    if (showSettingsDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showSettingsDropdown]);

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/auth/login';
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <Sidebar
        portalType={portalType}
        isCollapsed={isCollapsed}
        onToggleCollapse={handleToggleCollapse}
      />

      {/* Main Content */}
      <div className={cn(
        'transition-all duration-200',
        isCollapsed ? 'lg:pl-[60px]' : 'lg:pl-56'
      )}>
        {/* Top Header */}
        <header className="sticky top-0 z-30 h-14 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 px-4 lg:px-8">
          <div className="flex items-center justify-between h-full">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full pl-9 pr-3 py-1.5 text-sm bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-300 dark:focus:ring-slate-600 transition-colors text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500"
                />
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-1 ml-4">
              {/* View As Portal Switcher - Only for Platform Admin */}
              {portalType === 'platform-admin' && (
                <ViewAsPortalSwitcher />
              )}
              <NotificationBell />

              {/* Settings Dropdown */}
              <div className="relative settings-dropdown-container">
                <button
                  onClick={() => setShowSettingsDropdown(!showSettingsDropdown)}
                  className="p-2 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 rounded-md transition-colors"
                >
                  <Settings className="w-4 h-4" />
                </button>

                {showSettingsDropdown && (
                  <div className="absolute right-0 mt-1.5 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 py-1 z-50">
                    <Link
                      href={`/${portalType}/user-settings/account`}
                      className="flex items-center gap-2.5 px-3 py-2 text-[13px] text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                      onClick={() => setShowSettingsDropdown(false)}
                    >
                      <User className="w-4 h-4" />
                      {t(language, 'dashboard.header.settings')}
                    </Link>
                    <div className="border-t border-gray-100 dark:border-slate-700 my-1" />
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-gray-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      {t(language, 'dashboard.nav.signOut')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
