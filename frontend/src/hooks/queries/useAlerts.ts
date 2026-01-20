import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { alertsApi, AlertsListParams } from '@/api/alerts';
import { toast } from 'sonner';

export const alertKeys = {
  all: ['alerts'] as const,
  lists: () => [...alertKeys.all, 'list'] as const,
  list: (params?: AlertsListParams) => [...alertKeys.lists(), params] as const,
  unread: () => [...alertKeys.all, 'unread'] as const,
  details: () => [...alertKeys.all, 'detail'] as const,
  detail: (id: string) => [...alertKeys.details(), id] as const,
};

export function useAlerts(params?: AlertsListParams) {
  return useQuery({
    queryKey: alertKeys.list(params),
    queryFn: () => alertsApi.list(params),
  });
}

export function useUnreadAlerts() {
  return useQuery({
    queryKey: alertKeys.unread(),
    queryFn: () => alertsApi.getUnread(),
    refetchInterval: 60000, // Refetch every minute
  });
}

export function useAlert(id: string) {
  return useQuery({
    queryKey: alertKeys.detail(id),
    queryFn: () => alertsApi.get(id),
    enabled: !!id,
  });
}

export function useMarkAlertRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => alertsApi.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: alertKeys.all });
    },
  });
}

export function useDismissAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => alertsApi.dismiss(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: alertKeys.all });
      toast.success('Alert dismissed');
    },
    onError: (error: Error) => {
      toast.error(`Failed to dismiss alert: ${error.message}`);
    },
  });
}

export function useMarkAllAlertsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => alertsApi.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: alertKeys.all });
      toast.success('All alerts marked as read');
    },
    onError: (error: Error) => {
      toast.error(`Failed to mark alerts as read: ${error.message}`);
    },
  });
}
