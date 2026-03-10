'use client';

import { ReactNode } from 'react';
import { usePermission, useOrgPermission, usePlatformPermission } from '@/hooks/usePermission';
import { Loader2 } from 'lucide-react';

interface PermissionGateProps {
  namespace: string;
  object: string;
  relation: string;
  subjectId?: string;
  children: ReactNode;
  fallback?: ReactNode;
  loadingFallback?: ReactNode;
  showLoading?: boolean;
}

/**
 * Component that conditionally renders children based on permission
 */
export function PermissionGate({
  namespace,
  object,
  relation,
  subjectId,
  children,
  fallback = null,
  loadingFallback,
  showLoading = true,
}: PermissionGateProps) {
  const { allowed, loading } = usePermission({
    namespace,
    object,
    relation,
    subjectId,
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

  if (!allowed) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface OrgPermissionGateProps {
  orgId: string;
  relation: 'owner' | 'admin' | 'member';
  userId?: string;
  children: ReactNode;
  fallback?: ReactNode;
  loadingFallback?: ReactNode;
}

/**
 * Component that conditionally renders children based on organization permission
 */
export function OrgPermissionGate({
  orgId,
  relation,
  userId,
  children,
  fallback = null,
  loadingFallback,
}: OrgPermissionGateProps) {
  const { allowed, loading } = useOrgPermission(orgId, relation, userId);

  if (loading) {
    if (loadingFallback) return <>{loadingFallback}</>;
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!allowed) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface PlatformPermissionGateProps {
  feature: string;
  relation?: string;
  userId?: string;
  children: ReactNode;
  fallback?: ReactNode;
  loadingFallback?: ReactNode;
}

/**
 * Component that conditionally renders children based on platform permission
 */
export function PlatformPermissionGate({
  feature,
  relation = 'admin',
  userId,
  children,
  fallback = null,
  loadingFallback,
}: PlatformPermissionGateProps) {
  const { allowed, loading } = usePlatformPermission(feature, relation, userId);

  if (loading) {
    if (loadingFallback) return <>{loadingFallback}</>;
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!allowed) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
