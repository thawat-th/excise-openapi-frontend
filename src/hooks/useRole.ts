'use client';

import { useState, useEffect, useCallback } from 'react';
import { checkRole, checkRoles, getUserRoles } from '@/lib/permissions';

interface UseRoleOptions {
  userId?: string;
  roles?: string[];
  skip?: boolean;
}

interface UseRoleResult {
  roles: string[];
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  hasAllRoles: (roles: string[]) => boolean;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to get user roles and check role membership
 */
export function useRole(options: UseRoleOptions = {}): UseRoleResult {
  const { userId, roles: checkTheseRoles, skip = false } = options;

  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [roleMap, setRoleMap] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(!skip);
  const [error, setError] = useState<Error | null>(null);

  const fetchRoles = useCallback(async () => {
    if (skip || !userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (checkTheseRoles && checkTheseRoles.length > 0) {
        // Check specific roles
        const results = await checkRoles(userId, checkTheseRoles);
        setRoleMap(results);
        setUserRoles(Object.entries(results)
          .filter(([, hasRole]) => hasRole)
          .map(([role]) => role));
      } else {
        // Get all user roles
        const roles = await getUserRoles(userId);
        setUserRoles(roles);
        setRoleMap(roles.reduce((acc, role) => {
          acc[role] = true;
          return acc;
        }, {} as Record<string, boolean>));
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Role check failed'));
      setUserRoles([]);
      setRoleMap({});
    } finally {
      setLoading(false);
    }
  }, [userId, checkTheseRoles, skip]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const hasRole = useCallback((role: string): boolean => {
    return roleMap[role] ?? false;
  }, [roleMap]);

  const hasAnyRole = useCallback((roles: string[]): boolean => {
    return roles.some(role => roleMap[role]);
  }, [roleMap]);

  const hasAllRoles = useCallback((roles: string[]): boolean => {
    return roles.every(role => roleMap[role]);
  }, [roleMap]);

  return {
    roles: userRoles,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    loading,
    error,
    refetch: fetchRoles,
  };
}

/**
 * Hook to check a single role
 */
export function useSingleRole(userId: string | undefined, role: string): {
  hasRole: boolean;
  loading: boolean;
  error: Error | null;
} {
  const [hasRole, setHasRole] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId || !role) {
      setLoading(false);
      return;
    }

    const check = async () => {
      setLoading(true);
      try {
        const result = await checkRole(userId, role);
        setHasRole(result);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Role check failed'));
        setHasRole(false);
      } finally {
        setLoading(false);
      }
    };

    check();
  }, [userId, role]);

  return { hasRole, loading, error };
}

/**
 * Hook to check if user is super admin
 */
export function useSuperAdmin(userId?: string): {
  isSuperAdmin: boolean;
  loading: boolean;
} {
  const { hasRole, loading } = useSingleRole(userId, 'super_admin');
  return { isSuperAdmin: hasRole, loading };
}

/**
 * Hook to check if user can access platform admin
 */
export function usePlatformAdminAccess(userId?: string): {
  canAccess: boolean;
  loading: boolean;
} {
  const { roles, loading } = useRole({
    userId,
    roles: ['super_admin', 'platform_admin', 'audit_viewer', 'api_provider'],
    skip: !userId,
  });

  return {
    canAccess: roles.length > 0,
    loading,
  };
}
