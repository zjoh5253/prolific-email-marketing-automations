import { apiClient, ApiResponse, PaginatedResponse } from './client';
import { OnboardingSubmission, OnboardingFormData, OnboardingStatus } from '@/types';

export interface OnboardingSubmissionsListParams {
  status?: OnboardingStatus;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'submittedAt' | 'firstName' | 'email' | 'companyName';
  sortOrder?: 'asc' | 'desc';
}

export const onboardingApi = {
  submit: async (data: OnboardingFormData): Promise<OnboardingSubmission> => {
    const response = await apiClient.post<ApiResponse<OnboardingSubmission>>(
      '/onboarding',
      data
    );
    return response.data.data;
  },

  list: async (
    params?: OnboardingSubmissionsListParams
  ): Promise<PaginatedResponse<OnboardingSubmission>> => {
    const response = await apiClient.get<PaginatedResponse<OnboardingSubmission>>(
      '/onboarding/submissions',
      { params }
    );
    return response.data;
  },

  get: async (id: string): Promise<OnboardingSubmission> => {
    const response = await apiClient.get<ApiResponse<OnboardingSubmission>>(
      `/onboarding/submissions/${id}`
    );
    return response.data.data;
  },

  updateStatus: async (
    id: string,
    status: OnboardingStatus,
    convertedClientId?: string
  ): Promise<OnboardingSubmission> => {
    const response = await apiClient.patch<ApiResponse<OnboardingSubmission>>(
      `/onboarding/submissions/${id}/status`,
      { status, ...(convertedClientId && { convertedClientId }) }
    );
    return response.data.data;
  },
};
