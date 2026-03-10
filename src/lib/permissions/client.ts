/**
 * Permission API Client
 * Communicates with api-governance-service for Keto permission checks
 */

const API_GOVERNANCE_URL = process.env.NEXT_PUBLIC_API_GOVERNANCE_URL || 'http://localhost:5001';

// ============================================================================
// Types
// ============================================================================

export interface PermissionCheck {
  namespace: string;
  object: string;
  relation: string;
  subjectId?: string;
}

export interface PermissionCheckResult {
  allowed: boolean;
}

export interface BatchCheckResult {
  results: boolean[];
}

export interface RelationTuple {
  namespace: string;
  object: string;
  relation: string;
  subject_id?: string;
  subject_set?: {
    namespace: string;
    object: string;
    relation: string;
  };
}

export interface ListRelationshipsResult {
  relationships: RelationTuple[];
  next_page_token?: string;
}

// ============================================================================
// Permission Check APIs
// ============================================================================

/**
 * Check a single permission
 */
export async function checkPermission(check: PermissionCheck): Promise<boolean> {
  try {
    const response = await fetch(`${API_GOVERNANCE_URL}/v1/permissions/check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        namespace: check.namespace,
        object: check.object,
        relation: check.relation,
        subject_id: check.subjectId,
      }),
    });

    if (!response.ok) {
      console.error('Permission check failed:', response.status);
      return false;
    }

    const data = await response.json();
    return data.data?.allowed ?? false;
  } catch (error) {
    console.error('Permission check error:', error);
    return false;
  }
}

/**
 * Check multiple permissions at once
 */
export async function batchCheckPermissions(checks: PermissionCheck[]): Promise<boolean[]> {
  try {
    const response = await fetch(`${API_GOVERNANCE_URL}/v1/permissions/batch-check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        checks: checks.map(check => ({
          namespace: check.namespace,
          object: check.object,
          relation: check.relation,
          subject_id: check.subjectId,
        })),
      }),
    });

    if (!response.ok) {
      console.error('Batch permission check failed:', response.status);
      return checks.map(() => false);
    }

    const data = await response.json();
    return data.data?.results ?? checks.map(() => false);
  } catch (error) {
    console.error('Batch permission check error:', error);
    return checks.map(() => false);
  }
}

// ============================================================================
// Role APIs
// ============================================================================

/**
 * Check if user has a specific role
 */
export async function checkRole(userId: string, role: string): Promise<boolean> {
  return checkPermission({
    namespace: 'Role',
    object: role,
    relation: 'member',
    subjectId: `user:${userId}`,
  });
}

/**
 * Check multiple roles at once
 */
export async function checkRoles(userId: string, roles: string[]): Promise<Record<string, boolean>> {
  const checks = roles.map(role => ({
    namespace: 'Role',
    object: role,
    relation: 'member',
    subjectId: `user:${userId}`,
  }));

  const results = await batchCheckPermissions(checks);

  return roles.reduce((acc, role, index) => {
    acc[role] = results[index];
    return acc;
  }, {} as Record<string, boolean>);
}

/**
 * Get all roles for a user
 */
export async function getUserRoles(userId: string): Promise<string[]> {
  try {
    const response = await fetch(
      `${API_GOVERNANCE_URL}/v1/relationships?namespace=Role&relation=member&subject_id=user:${encodeURIComponent(userId)}`
    );

    if (!response.ok) {
      console.error('Get user roles failed:', response.status);
      return [];
    }

    const data = await response.json();
    const relationships = data.data?.relationships ?? [];

    return relationships.map((rel: RelationTuple) => rel.object);
  } catch (error) {
    console.error('Get user roles error:', error);
    return [];
  }
}

// ============================================================================
// Organization Permission APIs
// ============================================================================

/**
 * Check organization permission
 */
export async function checkOrgPermission(
  userId: string,
  orgId: string,
  relation: 'owner' | 'admin' | 'member'
): Promise<boolean> {
  return checkPermission({
    namespace: 'Organization',
    object: orgId,
    relation,
    subjectId: `user:${userId}`,
  });
}

/**
 * Get user's organizations with their roles
 */
export async function getUserOrganizations(userId: string): Promise<Array<{ orgId: string; relation: string }>> {
  try {
    const response = await fetch(
      `${API_GOVERNANCE_URL}/v1/relationships?namespace=Organization&subject_id=user:${encodeURIComponent(userId)}`
    );

    if (!response.ok) {
      console.error('Get user organizations failed:', response.status);
      return [];
    }

    const data = await response.json();
    const relationships = data.data?.relationships ?? [];

    return relationships.map((rel: RelationTuple) => ({
      orgId: rel.object,
      relation: rel.relation,
    }));
  } catch (error) {
    console.error('Get user organizations error:', error);
    return [];
  }
}

// ============================================================================
// Platform Permission APIs
// ============================================================================

/**
 * Check platform admin permission
 */
export async function checkPlatformPermission(
  userId: string,
  feature: string,
  relation: string = 'admin'
): Promise<boolean> {
  return checkPermission({
    namespace: 'Platform',
    object: feature,
    relation,
    subjectId: `user:${userId}`,
  });
}

/**
 * Check if user is a super admin
 */
export async function isSuperAdmin(userId: string): Promise<boolean> {
  return checkRole(userId, 'super_admin');
}

/**
 * Check if user can access platform admin portal
 */
export async function canAccessPlatformAdmin(userId: string): Promise<boolean> {
  // Super admin can always access
  const isSuper = await isSuperAdmin(userId);
  if (isSuper) return true;

  // Check other platform admin roles
  const roles = await checkRoles(userId, ['platform_admin', 'audit_viewer', 'api_provider']);
  return Object.values(roles).some(hasRole => hasRole);
}
