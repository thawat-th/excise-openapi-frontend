'use client';

import { useState, useEffect, useCallback } from 'react';
import { checkPermission, batchCheckPermissions, type PermissionCheck } from '@/lib/permissions';

interface UsePermissionOptions {
  namespace: string;
  object: string;
  relation: string;
  subjectId?: string;
  skip?: boolean;
}

interface UsePermissionResult {
  allowed: boolean;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to check a single permission
 */
export function usePermission(options: UsePermissionOptions): UsePermissionResult {
  const { namespace, object, relation, subjectId, skip = false } = options;

  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(!skip);
  const [error, setError] = useState<Error | null>(null);

  const fetchPermission = useCallback(async () => {
    if (skip) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await checkPermission({
        namespace,
        object,
        relation,
        subjectId,
      });
      setAllowed(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Permission check failed'));
      setAllowed(false);
    } finally {
      setLoading(false);
    }
  }, [namespace, object, relation, subjectId, skip]);

  useEffect(() => {
    fetchPermission();
  }, [fetchPermission]);

  return {
    allowed,
    loading,
    error,
    refetch: fetchPermission,
  };
}

interface UseBatchPermissionOptions {
  checks: PermissionCheck[];
  skip?: boolean;
}

interface UseBatchPermissionResult {
  results: boolean[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to check multiple permissions at once
 */
export function useBatchPermission(options: UseBatchPermissionOptions): UseBatchPermissionResult {
  const { checks, skip = false } = options;

  const [results, setResults] = useState<boolean[]>([]);
  const [loading, setLoading] = useState(!skip);
  const [error, setError] = useState<Error | null>(null);

  const fetchPermissions = useCallback(async () => {
    if (skip || checks.length === 0) {
      setLoading(false);
      setResults(checks.map(() => false));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const checkResults = await batchCheckPermissions(checks);
      setResults(checkResults);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Batch permission check failed'));
      setResults(checks.map(() => false));
    } finally {
      setLoading(false);
    }
  }, [checks, skip]);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  return {
    results,
    loading,
    error,
    refetch: fetchPermissions,
  };
}

/**
 * Hook to check organization permission
 */
export function useOrgPermission(
  orgId: string,
  relation: 'owner' | 'admin' | 'member',
  userId?: string
): UsePermissionResult {
  return usePermission({
    namespace: 'Organization',
    object: orgId,
    relation,
    subjectId: userId ? `user:${userId}` : undefined,
    skip: !orgId,
  });
}

/**
 * Hook to check platform permission
 */
export function usePlatformPermission(
  feature: string,
  relation: string = 'admin',
  userId?: string
): UsePermissionResult {
  return usePermission({
    namespace: 'Platform',
    object: feature,
    relation,
    subjectId: userId ? `user:${userId}` : undefined,
    skip: !feature,
  });
}
