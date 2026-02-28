import { apiClient, ApiResponse, PaginatedResponse } from './client';
import { AccountManager, Client, ClientWithStats, ContextSnippet, EmailPlatform } from '@/types';

export interface CreateClientRequest {
  name: string;
  slug: string;
  platform: EmailPlatform;
  industry?: string;
  timezone?: string;
  accountManagerId?: string | null;
  tier?: string | null;
  defaultFromName?: string;
  defaultFromEmail?: string;
  // Onboarding: Contact
  contactFirstName?: string;
  contactLastName?: string;
  contactEmail?: string;
  // Onboarding: Content
  fromFieldName?: string;
  companyDescription?: string;
  idealCustomer?: string;
  coreProducts?: string;
  peakSeasonPriorities?: string;
  yearRoundOffers?: string;
  businessStory?: string;
  uniqueValue?: string;
  productTransformation?: string;
  // Onboarding: Technical Setup
  domainHost?: string;
  domainHostOther?: string;
  hasDomainAccess?: boolean;
  domainAccessContact?: string;
  hasEmailPlatform?: boolean;
  emailPlatform?: string;
  emailPlatformOther?: string;
  marketingEmail?: string;
  hasEmailAdminAccess?: boolean;
  emailAdminContact?: string;
  // Onboarding: Content Approval
  approverFirstName?: string;
  approverLastName?: string;
  approverEmail?: string;
  approvalMethod?: string;
  canSendWithoutApproval?: boolean;
}

export interface UpdateClientRequest {
  name?: string;
  industry?: string;
  timezone?: string;
  accountManagerId?: string | null;
  tier?: string | null;
  contactEmail?: string | null;
  defaultFromName?: string;
  defaultFromEmail?: string;
  status?: string;
}

export interface ClientCredentials {
  apiKey?: string;
  apiSecret?: string;
  accessToken?: string;
  refreshToken?: string;
  serverId?: string;
  dataCenter?: string;
  accountId?: string;
}

export interface ConnectionTestResult {
  success: boolean;
  message: string;
  accountInfo?: {
    id: string;
    name: string;
    email?: string;
    plan?: string;
  };
  error?: string;
}

export interface ClientsListParams {
  status?: string;
  platform?: string;
  accountManagerId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const clientsApi = {
  list: async (params?: ClientsListParams): Promise<PaginatedResponse<ClientWithStats>> => {
    const response = await apiClient.get<PaginatedResponse<ClientWithStats>>('/clients', {
      params,
    });
    return response.data;
  },

  get: async (id: string): Promise<Client> => {
    const response = await apiClient.get<ApiResponse<Client>>(`/clients/${id}`);
    return response.data.data;
  },

  create: async (data: CreateClientRequest): Promise<Client> => {
    const response = await apiClient.post<ApiResponse<Client>>('/clients', data);
    return response.data.data;
  },

  update: async (id: string, data: UpdateClientRequest): Promise<Client> => {
    const response = await apiClient.patch<ApiResponse<Client>>(`/clients/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/clients/${id}`);
  },

  updateCredentials: async (id: string, credentials: ClientCredentials): Promise<Client> => {
    const response = await apiClient.put<ApiResponse<Client>>(
      `/clients/${id}/credentials`,
      credentials
    );
    return response.data.data;
  },

  testConnection: async (id: string): Promise<ConnectionTestResult> => {
    const response = await apiClient.post<ApiResponse<ConnectionTestResult>>(
      `/clients/${id}/test-connection`
    );
    return response.data.data;
  },

  triggerSync: async (id: string): Promise<{ message: string; jobId: string }> => {
    const response = await apiClient.post<ApiResponse<{ message: string; jobId: string }>>(
      `/clients/${id}/sync`
    );
    return response.data.data;
  },

  listAccountManagers: async (): Promise<AccountManager[]> => {
    const response = await apiClient.get<ApiResponse<AccountManager[]>>('/clients/account-managers');
    return response.data.data;
  },

  // Context management
  getContext: async (id: string): Promise<ContextSnippet[]> => {
    const response = await apiClient.get<ApiResponse<ContextSnippet[]>>(`/clients/${id}/context`);
    return response.data.data;
  },

  updateContext: async (
    id: string,
    snippets: Partial<ContextSnippet>[]
  ): Promise<ContextSnippet[]> => {
    const response = await apiClient.put<ApiResponse<ContextSnippet[]>>(
      `/clients/${id}/context`,
      { snippets }
    );
    return response.data.data;
  },
};
