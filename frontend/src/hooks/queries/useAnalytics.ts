import { useQuery } from '@tanstack/react-query';
import { analyticsApi, AnalyticsDateParams } from '@/api/analytics';

export const analyticsKeys = {
  all: ['analytics'] as const,
  overview: (params?: AnalyticsDateParams) => [...analyticsKeys.all, 'overview', params] as const,
  client: (clientId: string, params?: AnalyticsDateParams) =>
    [...analyticsKeys.all, 'client', clientId, params] as const,
  benchmarks: (industry?: string) => [...analyticsKeys.all, 'benchmarks', industry] as const,
  sendTime: (params?: AnalyticsDateParams) => [...analyticsKeys.all, 'sendTime', params] as const,
};

export function useOverview(params?: AnalyticsDateParams) {
  return useQuery({
    queryKey: analyticsKeys.overview(params),
    queryFn: () => analyticsApi.getOverview(params),
  });
}

export function useClientAnalytics(clientId: string, params?: AnalyticsDateParams) {
  return useQuery({
    queryKey: analyticsKeys.client(clientId, params),
    queryFn: () => analyticsApi.getClientAnalytics(clientId, params),
    enabled: !!clientId,
  });
}

export function useBenchmarks(industry?: string) {
  return useQuery({
    queryKey: analyticsKeys.benchmarks(industry),
    queryFn: () => analyticsApi.getBenchmarks(industry),
  });
}

export function useSendTimeAnalysis(params?: AnalyticsDateParams) {
  return useQuery({
    queryKey: analyticsKeys.sendTime(params),
    queryFn: () => analyticsApi.getSendTimeAnalysis(params),
  });
}
