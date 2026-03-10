'use client';

import { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Search,
  Bell,
  User,
  ChevronDown,
  Layers,
  Key,
  BarChart3,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  Users,
  Building2,
  Smartphone,
} from 'lucide-react';
import { cn, getInitials } from '@/lib/utils';
import { UserContextProvider } from '@/contexts/UserContextProvider';
import { ContextSwitcher } from '@/components/context/ContextSwitcher';

interface DeveloperPortalLayoutProps {
  children: ReactNode;
  portalType: 'individual' | 'organization';
}

// Base nav items for both Individual and Organization
const baseNavItems = [
  { label: 'API Catalog', labelTh: 'แคตตาล็อก API', href: '/catalog', icon: Layers },
  { label: 'My APIs', labelTh: 'API ของฉัน', href: '/my-apis', icon: Layers },
  { label: 'Credentials', labelTh: 'ข้อมูลรับรอง', href: '/credentials', icon: Key },
  { label: 'Usage', labelTh: 'การใช้งาน', href: '/usage', icon: BarChart3 },
  { label: 'Requests', labelTh: 'คำขอ', href: '/requests', icon: FileText },
];

// Additional nav items for Organization only
const orgNavItems = [
  { label: 'Team', labelTh: 'จัดการทีม', href: '/team', icon: Users },
];

const getNavItems = (portalType: 'individual' | 'organization') => {
  if (portalType === 'organization') {
    return [...baseNavItems, ...orgNavItems];
  }
  return baseNavItems;
};

const getPortalBadge = (portalType: 'individual' | 'organization') => {
  if (portalType === 'organization') {
    return { label: 'องค์กร', icon: Building2, color: 'bg-purple-100 text-purple-700' };
  }
  return { label: 'บุคคล', icon: User, color: 'bg-blue-100 text-blue-700' };
};

interface UserProfile {
  firstName?: string;
  lastName?: string;
  email?: string;
  avatar?: string;
}

export function DeveloperPortalLayout({ children, portalType }: DeveloperPortalLayoutProps) {
  const pathname = usePathname();
  const basePath = `/${portalType}`;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);

  const navItems = getNavItems(portalType);
  const portalBadge = getPortalBadge(portalType);
  const BadgeIcon = portalBadge.icon;

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

  return (
    <UserContextProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
        {/* Top Navigation */}
        <header className="sticky top-0 z-50 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <Link href={basePath} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                  <span className="text-white font-bold text-xl">E</span>
                </div>
                <div className="hidden sm:block">
                  <span className="font-semibold text-gray-900 dark:text-white">ExciseAPI</span>
                  <span className="text-primary-600 dark:text-primary-400 font-semibold"> Hub</span>
                  <span className={cn('ml-2 px-2 py-0.5 text-xs font-medium rounded-full inline-flex items-center gap-1', portalBadge.color)}>
                    <BadgeIcon className="w-3 h-3" />
                    {portalBadge.label}
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = pathname.startsWith(`${basePath}${item.href}`);
                return (
                  <Link
                    key={item.href}
                    href={`${basePath}${item.href}`}
                    className={cn(
                      'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                        : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-white'
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right Section */}
            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="hidden md:block relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
                <input
                  type="text"
                  placeholder="ค้นหา API..."
                  className="w-64 pl-10 pr-4 py-2 text-sm bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-400"
                />
              </div>

              {/* Notifications */}
              <button className="relative p-2 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>

              {/* Context Switcher */}
              <ContextSwitcher />

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 p-2 text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
                >
                  {user?.avatar ? (
                    <img src={user.avatar} alt={userName} className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-sm font-medium">
                      {userInitials}
                    </div>
                  )}
                  <ChevronDown className="w-4 h-4 hidden sm:block" />
                </button>

                {isProfileOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsProfileOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-700">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{userName}</p>
                        <p className="text-xs text-gray-500 dark:text-slate-400 truncate">{userEmail}</p>
                      </div>
                      <Link
                        href={`${basePath}/devices`}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <Smartphone className="w-4 h-4" />
                        อุปกรณ์และความปลอดภัย
                      </Link>
                      <Link
                        href={`${basePath}/user-settings`}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <Settings className="w-4 h-4" />
                        ตั้งค่า
                      </Link>
                      <div className="border-t border-gray-100 dark:border-slate-700 my-1" />
                      <a
                        href="/api/auth/init-logout"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <LogOut className="w-4 h-4" />
                        ออกจากระบบ
                      </a>
                    </div>
                  </>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            <div className="px-4 py-3 space-y-1">
              {navItems.map((item) => {
                const isActive = pathname.startsWith(`${basePath}${item.href}`);
                return (
                  <Link
                    key={item.href}
                    href={`${basePath}${item.href}`}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium',
                      isActive
                        ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                        : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700'
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.labelTh}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500 dark:text-slate-400">
              © 2567 กรมสรรพสามิต - Excise OpenAPI
            </p>
            <div className="flex items-center gap-6">
              <Link href="/docs" className="text-sm text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200">
                เอกสาร API
              </Link>
              <Link href="/support" className="text-sm text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200">
                ติดต่อสนับสนุน
              </Link>
              <Link href="/terms" className="text-sm text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200">
                ข้อกำหนดการใช้งาน
              </Link>
            </div>
          </div>
        </div>
      </footer>
      </div>
    </UserContextProvider>
  );
}
