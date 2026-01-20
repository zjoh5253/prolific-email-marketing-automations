import { apiClient, ApiResponse, PaginatedResponse } from './client';
import { Campaign, CampaignStatus } from '@/types';

export interface CampaignsListParams {
  clientId?: string;
  status?: CampaignStatus | CampaignStatus[];
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateCampaignRequest {
  clientId: string;
  name: string;
  subjectLine?: string;
  previewText?: string;
  fromName?: string;
  fromEmail?: string;
  contentHtml?: string;
  contentText?: string;
}

export interface UpdateCampaignRequest {
  name?: string;
  subjectLine?: string;
  previewText?: string;
  fromName?: string;
  fromEmail?: string;
  contentHtml?: string;
  contentText?: string;
  status?: CampaignStatus;
}

export interface ScheduleCampaignRequest {
  scheduledAt: string;
}

export interface CampaignVersion {
  id: string;
  campaignId: string;
  version: number;
  changes: Record<string, unknown>;
  createdBy?: string;
  createdAt: string;
}

export const campaignsApi = {
  list: async (params?: CampaignsListParams): Promise<PaginatedResponse<Campaign>> => {
    const response = await apiClient.get<PaginatedResponse<Campaign>>('/campaigns', { params });
    return response.data;
  },

  get: async (id: string): Promise<Campaign> => {
    const response = await apiClient.get<ApiResponse<Campaign>>(`/campaigns/${id}`);
    return response.data.data;
  },

  create: async (data: CreateCampaignRequest): Promise<Campaign> => {
    const response = await apiClient.post<ApiResponse<Campaign>>('/campaigns', data);
    return response.data.data;
  },

  update: async (id: string, data: UpdateCampaignRequest): Promise<Campaign> => {
    const response = await apiClient.patch<ApiResponse<Campaign>>(`/campaigns/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/campaigns/${id}`);
  },

  schedule: async (id: string, data: ScheduleCampaignRequest): Promise<Campaign> => {
    const response = await apiClient.post<ApiResponse<Campaign>>(`/campaigns/${id}/schedule`, data);
    return response.data.data;
  },

  approve: async (id: string, comments?: string): Promise<Campaign> => {
    const response = await apiClient.post<ApiResponse<Campaign>>(`/campaigns/${id}/approve`, {
      comments,
    });
    return response.data.data;
  },

  requestChanges: async (id: string, comments: string): Promise<Campaign> => {
    const response = await apiClient.post<ApiResponse<Campaign>>(
      `/campaigns/${id}/request-changes`,
      { comments }
    );
    return response.data.data;
  },

  getVersions: async (id: string): Promise<CampaignVersion[]> => {
    const response = await apiClient.get<ApiResponse<CampaignVersion[]>>(
      `/campaigns/${id}/versions`
    );
    return response.data.data;
  },
};
