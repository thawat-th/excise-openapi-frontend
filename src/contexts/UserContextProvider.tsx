'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Types
export type UserContextType = 'individual' | 'organization';

export interface Organization {
  id: string;
  organization_profile_id: string;
  organization_name: string;
  organization_email: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  status: 'pending' | 'active' | 'suspended' | 'revoked';
  is_primary: boolean;
}

export interface UserContextData {
  // Current context
  contextType: UserContextType;
  contextId: string | null; // individual_profile_id or organization_profile_id

  // Organizations (if user is member of any)
  organizations: Organization[];
  currentOrganization: Organization | null;

  // Loading state
  isLoading: boolean;

  // Actions
  switchToIndividual: () => void;
  switchToOrganization: (orgId: string) => void;
  refreshContext: () => Promise<void>;
}

const UserContextContext = createContext<UserContextData | undefined>(undefined);

export function UserContextProvider({ children }: { children: React.ReactNode }) {
  const [contextType, setContextType] = useState<UserContextType>('individual');
  const [contextId, setContextId] = useState<string | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user's organizations
  const fetchOrganizations = useCallback(async () => {
    try {
      const response = await fetch('/api/account/organizations');
      if (!response.ok) {
        throw new Error('Failed to fetch organizations');
      }

      const data = await response.json();
      const orgs = data.organizations || [];
      setOrganizations(orgs);

      // Restore context from localStorage
      const savedContext = localStorage.getItem('user_context');
      if (savedContext) {
        try {
          const { type, id } = JSON.parse(savedContext);
          if (type === 'organization' && orgs.length > 0) {
            const org = orgs.find((o: Organization) => o.organization_profile_id === id);
            if (org) {
              setContextType('organization');
              setContextId(id);
              setCurrentOrganization(org);
              return;
            }
          }
        } catch (e) {
          // Invalid saved context, ignore
          console.error('Failed to restore context:', e);
        }
      }

      // Default to individual context
      setContextType('individual');
      setContextId(null);
      setCurrentOrganization(null);
    } catch (error) {
      console.error('Error fetching organizations:', error);
      setOrganizations([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initialize context on mount
  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  // Sync portal type to cookie (readable by middleware for redirect)
  const syncPortalCookie = useCallback((type: UserContextType) => {
    document.cookie = `excise_portal=${type};path=/;max-age=${60 * 60 * 24 * 30};samesite=lax`;
  }, []);

  // Switch to individual context
  const switchToIndividual = useCallback(() => {
    setContextType('individual');
    setContextId(null);
    setCurrentOrganization(null);
    localStorage.setItem('user_context', JSON.stringify({ type: 'individual', id: null }));
    syncPortalCookie('individual');
  }, [syncPortalCookie]);

  // Switch to organization context
  const switchToOrganization = useCallback((orgId: string) => {
    const org = organizations.find(o => o.organization_profile_id === orgId);
    if (org) {
      setContextType('organization');
      setContextId(orgId);
      setCurrentOrganization(org);
      localStorage.setItem('user_context', JSON.stringify({ type: 'organization', id: orgId }));
      syncPortalCookie('organization');
    }
  }, [organizations, syncPortalCookie]);

  // Refresh context (refetch organizations)
  const refreshContext = useCallback(async () => {
    setIsLoading(true);
    await fetchOrganizations();
  }, [fetchOrganizations]);

  const value: UserContextData = {
    contextType,
    contextId,
    organizations,
    currentOrganization,
    isLoading,
    switchToIndividual,
    switchToOrganization,
    refreshContext,
  };

  return (
    <UserContextContext.Provider value={value}>
      {children}
    </UserContextContext.Provider>
  );
}

// Hook to use user context
export function useUserContext() {
  const context = useContext(UserContextContext);
  if (context === undefined) {
    throw new Error('useUserContext must be used within a UserContextProvider');
  }
  return context;
}
