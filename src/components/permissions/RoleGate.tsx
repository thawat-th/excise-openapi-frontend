'use client';

import { ReactNode } from 'react';
import { useRole, useSuperAdmin, usePlatformAdminAccess } from '@/hooks/useRole';
import { Loader2, ShieldAlert } from 'lucide-react';

interface RoleGateProps {
  userId?: string;
  roles: string[];
  requireAll?: boolean;
  children: ReactNode;
  fallback?: ReactNode;
  loadingFallback?: ReactNode;
  showLoading?: boolean;
}

/**
 * Component that conditionally renders children based on role membership
 */
export function RoleGate({
  userId,
  roles,
  requireAll = false,
  children,
  fallback = null,
  loadingFallback,
  showLoading = true,
}: RoleGateProps) {
  const { hasAnyRole, hasAllRoles, loading } = useRole({
    userId,
    roles,
    skip: !userId,
  });

  if (loading) {
    if (loadingFallback) return <>{loadingFallback}</>;
    if (showLoading) {
      return (
        <div className="flex items-center justify-center p-4">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      );
    }
    return null;
  }

  const hasAccess = requireAll ? hasAllRoles(roles) : hasAnyRole(roles);

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface SuperAdminGateProps {
  userId?: string;
  children: ReactNode;
  fallback?: ReactNode;
  loadingFallback?: ReactNode;
}

/**
 * Component that only renders for super admins
 */
export function SuperAdminGate({
  userId,
  children,
  fallback = null,
  loadingFallback,
}: SuperAdminGateProps) {
  const { isSuperAdmin, loading } = useSuperAdmin(userId);

  if (loading) {
    if (loadingFallback) return <>{loadingFallback}</>;
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isSuperAdmin) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface PlatformAdminGateProps {
  userId?: string;
  children: ReactNode;
  fallback?: ReactNode;
  loadingFallback?: ReactNode;
}

/**
 * Component that renders for any platform admin role
 */
export function PlatformAdminGate({
  userId,
  children,
  fallback,
  loadingFallback,
}: PlatformAdminGateProps) {
  const { canAccess, loading } = usePlatformAdminAccess(userId);

  if (loading) {
    if (loadingFallback) return <>{loadingFallback}</>;
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!canAccess) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <AccessDenied message="คุณไม่มีสิทธิ์เข้าถึงหน้านี้" />
    );
  }

  return <>{children}</>;
}

interface AccessDeniedProps {
  message?: string;
  showIcon?: boolean;
}

/**
 * Default access denied component
 */
export function AccessDenied({
  message = 'คุณไม่มีสิทธิ์เข้าถึงส่วนนี้',
  showIcon = true,
}: AccessDeniedProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      {showIcon && (
        <ShieldAlert className="h-12 w-12 text-muted-foreground mb-4" />
      )}
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}
