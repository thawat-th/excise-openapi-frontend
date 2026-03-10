'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, User, Building2, X, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ViewAsPortalSwitcherProps {
  className?: string;
}

const viewOptions = [
  {
    id: 'individual',
    label: 'บุคคลทั่วไป',
    labelEn: 'Individual',
    description: 'ดูในมุมมองผู้ใช้งานทั่วไป',
    icon: User,
    href: '/individual/dashboard',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    id: 'organization',
    label: 'หน่วยงาน/องค์กร',
    labelEn: 'Organization',
    description: 'ดูในมุมมองหน่วยงาน',
    icon: Building2,
    href: '/organization/dashboard',
    color: 'bg-purple-100 text-purple-600',
  },
];

export function ViewAsPortalSwitcher({ className }: ViewAsPortalSwitcherProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleViewAs = (href: string) => {
    // Open in new tab for admin to keep their context
    window.open(href, '_blank');
    setIsOpen(false);
  };

  return (
    <div className={cn('relative', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <Eye className="w-4 h-4" />
        <span className="hidden sm:inline">ดูในมุมมอง</span>
        <ChevronDown className={cn(
          'w-4 h-4 transition-transform',
          isOpen && 'rotate-180'
        )} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
            <div className="px-4 py-2 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900">เปลี่ยนมุมมอง</p>
              <p className="text-xs text-gray-500">เปิดในแท็บใหม่เพื่อดูหน้าจอในมุมมองอื่น</p>
            </div>

            <div className="p-2 space-y-1">
              {viewOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.id}
                    onClick={() => handleViewAs(option.href)}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className={cn('p-2 rounded-lg', option.color)}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {option.label}
                      </p>
                      <p className="text-xs text-gray-500">
                        {option.description}
                      </p>
                    </div>
                    <Eye className="w-4 h-4 text-gray-400" />
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Banner component to show when viewing as another portal type
export function ViewingAsBanner({
  portalType,
  onClose,
}: {
  portalType: 'individual' | 'organization';
  onClose?: () => void;
}) {
  const config = {
    individual: {
      label: 'บุคคลทั่วไป',
      color: 'bg-blue-600',
      icon: User,
    },
    organization: {
      label: 'หน่วยงาน/องค์กร',
      color: 'bg-purple-600',
      icon: Building2,
    },
  };

  const { label, color, icon: Icon } = config[portalType];

  return (
    <div className={cn('px-4 py-2 text-white text-sm flex items-center justify-between', color)}>
      <div className="flex items-center gap-2">
        <Eye className="w-4 h-4" />
        <span>กำลังดูในมุมมอง: <strong>{label}</strong></span>
        <span className="opacity-75">(Admin Preview Mode)</span>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="p-1 hover:bg-white/20 rounded transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
