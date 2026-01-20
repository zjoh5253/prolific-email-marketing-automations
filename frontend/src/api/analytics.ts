import { apiClient, ApiResponse } from './client';
import { DashboardOverview, IndustryBenchmark } from '@/types';

export interface AnalyticsDateParams {
  startDate?: string;
  endDate?: string;
}

export interface ClientAnalytics {
  client: { id: string; name: string };
  period: { start: string; end: string };
  campaigns: {
    count: number;
    list: Array<{
      id: string;
      name: string;
      sentAt: string;
      metrics: Record<string, number>;
    }>;
  };
  metrics: {
    totalSent: number;
    totalOpens: number;
    totalClicks: number;
    totalBounces: number;
    totalUnsubscribes: number;
    openRate: string;
    clickRate: string;
    bounceRate: string;
    unsubscribeRate: string;
  };
}

export interface SendTimeAnalysis {
  period: { start: string; end: string };
  campaignsAnalyzed: number;
  byHour: Record<number, { opens: number; clicks: number; count: number }>;
  byDay: Record<number, { opens: number; clicks: number; count: number }>;
}

export const analyticsApi = {
  getOverview: async (params?: AnalyticsDateParams): Promise<DashboardOverview> => {
    const response = await apiClient.get<ApiResponse<DashboardOverview>>('/analytics/overview', {
      params,
    });
    return response.data.data;
  },

  getClientAnalytics: async (
    clientId: string,
    params?: AnalyticsDateParams
  ): Promise<ClientAnalytics> => {
    const response = await apiClient.get<ApiResponse<ClientAnalytics>>(
      `/analytics/clients/${clientId}`,
      { params }
    );
    return response.data.data;
  },

  getBenchmarks: async (industry?: string): Promise<Record<string, IndustryBenchmark>> => {
    const response = await apiClient.get<ApiResponse<Record<string, IndustryBenchmark>>>(
      '/analytics/benchmarks',
      { params: { industry } }
    );
    return response.data.data;
  },

  getSendTimeAnalysis: async (params?: AnalyticsDateParams): Promise<SendTimeAnalysis> => {
    const response = await apiClient.get<ApiResponse<SendTimeAnalysis>>(
      '/analytics/send-time',
      { params }
    );
    return response.data.data;
  },
};
