import { apiClient, ApiResponse, PaginatedResponse } from './client';
import { Alert, AlertType, AlertSeverity } from '@/types';

export interface AlertsListParams {
  clientId?: string;
  type?: AlertType;
  severity?: AlertSeverity;
  isRead?: boolean;
  isDismissed?: boolean;
  page?: number;
  limit?: number;
}

export interface UnreadAlertsResponse {
  alerts: Alert[];
  count: number;
}

export const alertsApi = {
  list: async (params?: AlertsListParams): Promise<PaginatedResponse<Alert>> => {
    const response = await apiClient.get<PaginatedResponse<Alert>>('/alerts', { params });
    return response.data;
  },

  getUnread: async (): Promise<UnreadAlertsResponse> => {
    const response = await apiClient.get<ApiResponse<UnreadAlertsResponse>>('/alerts/unread');
    return response.data.data;
  },

  get: async (id: string): Promise<Alert> => {
    const response = await apiClient.get<ApiResponse<Alert>>(`/alerts/${id}`);
    return response.data.data;
  },

  markRead: async (id: string): Promise<Alert> => {
    const response = await apiClient.patch<ApiResponse<Alert>>(`/alerts/${id}/read`);
    return response.data.data;
  },

  dismiss: async (id: string): Promise<Alert> => {
    const response = await apiClient.patch<ApiResponse<Alert>>(`/alerts/${id}/dismiss`);
    return response.data.data;
  },

  markAllRead: async (): Promise<{ message: string }> => {
    const response = await apiClient.patch<ApiResponse<{ message: string }>>('/alerts/read-all');
    return response.data.data;
  },
};
