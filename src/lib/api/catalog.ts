/**
 * API Catalog Client
 * Functions for calling API Catalog backend endpoints
 */

import { apiFetch, apiPost, apiPut, apiDelete } from '../api-client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_GOVERNANCE_URL || 'http://localhost:5001';
const CATALOG_BASE = `${API_BASE_URL}/v1/api-catalog`;

// ============================================================================
// Types
// ============================================================================

export interface APIService {
  id: string;
  name: string;
  slug: string;
  description: string;
  long_description?: string;
  category_id: string;
  provider_id: string;
  tags?: string[];
  api_type: 'rest' | 'graphql' | 'soap' | 'grpc';
  visibility: 'public' | 'private' | 'internal';
  requires_approval: boolean;
  allowed_subscriber_types?: string[];
  status: 'draft' | 'published' | 'deprecated' | 'archived';
  documentation_url?: string;
  support_url?: string;
  changelog_url?: string;
  contact_email?: string;
  contact_name?: string;
  sla_uptime_percentage?: number;
  sla_response_time_ms?: number;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface APIVersion {
  id: string;
  service_id: string;
  version: string;
  is_default: boolean;
  openapi_spec?: any;
  openapi_url?: string;
  changelog?: string;
  migration_guide?: string;
  breaking_changes?: string;
  is_deprecated: boolean;
  deprecation_date?: string;
  sunset_date?: string;
  deprecation_notice?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface APIProvider {
  id: string;
  code: string;
  name_th: string;
  name_en: string;
  abbreviation?: string;
  website?: string;
  support_email?: string;
  support_phone?: string;
  logo_url?: string;
  primary_color?: string;
  organization_id?: string;
  is_internal: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface APICategory {
  id: string;
  code: string;
  name_th: string;
  name_en: string;
  description_th?: string;
  description_en?: string;
  parent_id?: string;
  level: number;
  path?: string;
  icon?: string;
  color?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface APIDocumentationPage {
  id: string;
  service_id: string;
  version_id?: string;
  page_type: 'overview' | 'quickstart' | 'tutorial' | 'reference' | 'changelog' | 'faq' | 'troubleshooting' | 'best_practices';
  slug: string;
  title: string;
  content: string;
  meta_description?: string;
  meta_keywords?: string[];
  language: 'th' | 'en';
  tags?: string[];
  parent_page_id?: string;
  display_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface APICodeSample {
  id: string;
  service_id: string;
  endpoint_id?: string;
  language: string;
  title: string;
  description?: string;
  code: string;
  request_example?: any;
  response_example?: any;
  difficulty_level?: 'beginner' | 'intermediate' | 'advanced';
  tags?: string[];
  is_featured: boolean;
  view_count: number;
  copy_count: number;
  display_order: number;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface APIEndpoint {
  id: string;
  version_id: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';
  path: string;
  summary?: string;
  description?: string;
  is_deprecated: boolean;
  rate_limit_rpm?: number;
  rate_limit_rph?: number;
  rate_limit_rpd?: number;
  requires_authentication: boolean;
  auth_types?: string[];
  created_at: string;
  updated_at: string;
}

export interface APISubscription {
  id: string;
  application_id: string;
  service_id: string;
  version_id?: string;
  tier_id: string;
  environment: 'production' | 'uat' | 'staging' | 'development' | 'sandbox';
  status: 'pending' | 'active' | 'suspended' | 'cancelled';
  approval_status?: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  subscribed_at?: string;
  cancelled_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ListParams {
  page?: number;
  page_size?: number;
  search?: string;
  category_id?: string;
  provider_id?: string;
  api_type?: string;
  visibility?: string;
  status?: string;
}

// ============================================================================
// API Services
// ============================================================================

export async function listAPIServices(params?: ListParams) {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.page_size) queryParams.append('page_size', params.page_size.toString());
  if (params?.search) queryParams.append('search', params.search);
  if (params?.category_id) queryParams.append('category_id', params.category_id);
  if (params?.provider_id) queryParams.append('provider_id', params.provider_id);
  if (params?.api_type) queryParams.append('api_type', params.api_type);
  if (params?.visibility) queryParams.append('visibility', params.visibility);
  if (params?.status) queryParams.append('status', params.status);

  const url = `${CATALOG_BASE}/services?${queryParams.toString()}`;
  const response = await apiFetch(url);
  return response.json();
}

export async function searchAPIServices(keyword: string, params?: ListParams) {
  const queryParams = new URLSearchParams({ keyword });
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.page_size) queryParams.append('page_size', params.page_size.toString());

  const url = `${CATALOG_BASE}/services/search?${queryParams.toString()}`;
  const response = await apiFetch(url);
  return response.json();
}

export async function getAPIService(id: string) {
  const response = await apiFetch(`${CATALOG_BASE}/services/${id}`);
  return response.json();
}

export async function getAPIServiceBySlug(slug: string) {
  const response = await apiFetch(`${CATALOG_BASE}/services/slug/${slug}`);
  return response.json();
}

export async function createAPIService(service: Partial<APIService>) {
  const response = await apiPost(`${CATALOG_BASE}/services`, service);
  return response.json();
}

export async function updateAPIService(id: string, service: Partial<APIService>) {
  const response = await apiPut(`${CATALOG_BASE}/services/${id}`, service);
  return response.json();
}

export async function deleteAPIService(id: string) {
  const response = await apiDelete(`${CATALOG_BASE}/services/${id}`);
  return response.json();
}

export async function publishAPIService(id: string) {
  const response = await apiPost(`${CATALOG_BASE}/services/${id}/publish`);
  return response.json();
}

export async function deprecateAPIService(id: string, deprecationNotice?: string, sunsetDate?: string) {
  const response = await apiPost(`${CATALOG_BASE}/services/${id}/deprecate`, {
    deprecation_notice: deprecationNotice,
    sunset_date: sunsetDate,
  });
  return response.json();
}

// ============================================================================
// API Versions
// ============================================================================

export async function getAPIVersions(serviceId: string) {
  const response = await apiFetch(`${CATALOG_BASE}/services/${serviceId}/versions`);
  return response.json();
}

export async function createAPIVersion(version: Partial<APIVersion>) {
  const response = await apiPost(`${CATALOG_BASE}/versions`, version);
  return response.json();
}

export async function setDefaultVersion(serviceId: string, versionId: string) {
  const response = await apiPost(`${CATALOG_BASE}/services/${serviceId}/versions/${versionId}/set-default`);
  return response.json();
}

// ============================================================================
// API Subscriptions
// ============================================================================

export async function subscribeToAPI(subscription: Partial<APISubscription>) {
  const response = await apiPost(`${CATALOG_BASE}/subscriptions`, subscription);
  return response.json();
}

export async function getApplicationSubscriptions(applicationId: string) {
  const response = await apiFetch(`${CATALOG_BASE}/applications/${applicationId}/subscriptions`);
  return response.json();
}

export async function approveAPIAccess(subscriptionId: string) {
  const response = await apiPost(`${CATALOG_BASE}/subscriptions/${subscriptionId}/approve`);
  return response.json();
}

export async function cancelSubscription(subscriptionId: string) {
  const response = await apiPost(`${CATALOG_BASE}/subscriptions/${subscriptionId}/cancel`);
  return response.json();
}

// ============================================================================
// API Providers
// ============================================================================

export async function listProviders(isActive?: boolean, isInternal?: boolean) {
  const queryParams = new URLSearchParams();
  if (isActive !== undefined) queryParams.append('is_active', isActive.toString());
  if (isInternal !== undefined) queryParams.append('is_internal', isInternal.toString());

  const url = `${CATALOG_BASE}/providers?${queryParams.toString()}`;
  const response = await apiFetch(url);
  return response.json();
}

export async function getProvider(id: string) {
  const response = await apiFetch(`${CATALOG_BASE}/providers/${id}`);
  return response.json();
}

export async function getProviderByCode(code: string) {
  const response = await apiFetch(`${CATALOG_BASE}/providers/code/${code}`);
  return response.json();
}

export async function createProvider(provider: Partial<APIProvider>) {
  const response = await apiPost(`${CATALOG_BASE}/providers`, provider);
  return response.json();
}

export async function updateProvider(id: string, provider: Partial<APIProvider>) {
  const response = await apiPut(`${CATALOG_BASE}/providers/${id}`, provider);
  return response.json();
}

export async function deleteProvider(id: string) {
  const response = await apiDelete(`${CATALOG_BASE}/providers/${id}`);
  return response.json();
}

// ============================================================================
// API Categories
// ============================================================================

export async function listCategories(parentId?: string, isActive?: boolean) {
  const queryParams = new URLSearchParams();
  if (parentId !== undefined) queryParams.append('parent_id', parentId);
  if (isActive !== undefined) queryParams.append('is_active', isActive.toString());

  const url = `${CATALOG_BASE}/categories?${queryParams.toString()}`;
  const response = await apiFetch(url);
  return response.json();
}

export async function getCategoryTree() {
  const response = await apiFetch(`${CATALOG_BASE}/categories/tree`);
  return response.json();
}

export async function getCategory(id: string) {
  const response = await apiFetch(`${CATALOG_BASE}/categories/${id}`);
  return response.json();
}

export async function getCategoryByCode(code: string) {
  const response = await apiFetch(`${CATALOG_BASE}/categories/code/${code}`);
  return response.json();
}

export async function getCategoryChildren(id: string) {
  const response = await apiFetch(`${CATALOG_BASE}/categories/${id}/children`);
  return response.json();
}

export async function createCategory(category: Partial<APICategory>) {
  const response = await apiPost(`${CATALOG_BASE}/categories`, category);
  return response.json();
}

export async function updateCategory(id: string, category: Partial<APICategory>) {
  const response = await apiPut(`${CATALOG_BASE}/categories/${id}`, category);
  return response.json();
}

export async function deleteCategory(id: string) {
  const response = await apiDelete(`${CATALOG_BASE}/categories/${id}`);
  return response.json();
}

// ============================================================================
// API Documentation
// ============================================================================

export async function listDocumentationPages(serviceId: string, versionId?: string) {
  const queryParams = new URLSearchParams({ service_id: serviceId });
  if (versionId) queryParams.append('version_id', versionId);

  const url = `${CATALOG_BASE}/documentation?${queryParams.toString()}`;
  const response = await apiFetch(url);
  return response.json();
}

export async function getDocumentationPage(id: string) {
  const response = await apiFetch(`${CATALOG_BASE}/documentation/${id}`);
  return response.json();
}

export async function createDocumentationPage(page: Partial<APIDocumentationPage>) {
  const response = await apiPost(`${CATALOG_BASE}/documentation`, page);
  return response.json();
}

export async function updateDocumentationPage(id: string, page: Partial<APIDocumentationPage>) {
  const response = await apiPut(`${CATALOG_BASE}/documentation/${id}`, page);
  return response.json();
}

export async function publishDocumentationPage(id: string) {
  const response = await apiPost(`${CATALOG_BASE}/documentation/${id}/publish`);
  return response.json();
}

export async function unpublishDocumentationPage(id: string) {
  const response = await apiPost(`${CATALOG_BASE}/documentation/${id}/unpublish`);
  return response.json();
}

export async function deleteDocumentationPage(id: string) {
  const response = await apiDelete(`${CATALOG_BASE}/documentation/${id}`);
  return response.json();
}

// ============================================================================
// API Code Samples
// ============================================================================

export async function listCodeSamples(serviceId: string) {
  const queryParams = new URLSearchParams({ service_id: serviceId });
  const url = `${CATALOG_BASE}/code-samples?${queryParams.toString()}`;
  const response = await apiFetch(url);
  return response.json();
}

export async function getCodeSample(id: string) {
  const response = await apiFetch(`${CATALOG_BASE}/code-samples/${id}`);
  return response.json();
}

export async function createCodeSample(sample: Partial<APICodeSample>) {
  const response = await apiPost(`${CATALOG_BASE}/code-samples`, sample);
  return response.json();
}

export async function updateCodeSample(id: string, sample: Partial<APICodeSample>) {
  const response = await apiPut(`${CATALOG_BASE}/code-samples/${id}`, sample);
  return response.json();
}

export async function deleteCodeSample(id: string) {
  const response = await apiDelete(`${CATALOG_BASE}/code-samples/${id}`);
  return response.json();
}

// ============================================================================
// API Endpoints
// ============================================================================

export async function listEndpoints(versionId: string) {
  const queryParams = new URLSearchParams({ version_id: versionId });
  const url = `${CATALOG_BASE}/endpoints?${queryParams.toString()}`;
  const response = await apiFetch(url);
  return response.json();
}

export async function getEndpoint(id: string) {
  const response = await apiFetch(`${CATALOG_BASE}/endpoints/${id}`);
  return response.json();
}

export async function createEndpoint(endpoint: Partial<APIEndpoint>) {
  const response = await apiPost(`${CATALOG_BASE}/endpoints`, endpoint);
  return response.json();
}

export async function updateEndpoint(id: string, endpoint: Partial<APIEndpoint>) {
  const response = await apiPut(`${CATALOG_BASE}/endpoints/${id}`, endpoint);
  return response.json();
}

export async function deleteEndpoint(id: string) {
  const response = await apiDelete(`${CATALOG_BASE}/endpoints/${id}`);
  return response.json();
}
