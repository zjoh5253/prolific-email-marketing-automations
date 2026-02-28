import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { onboardingApi, OnboardingSubmissionsListParams } from '@/api/onboarding';
import { OnboardingStatus } from '@/types';
import { toast } from 'sonner';

export const onboardingKeys = {
  all: ['onboarding'] as const,
  lists: () => [...onboardingKeys.all, 'list'] as const,
  list: (params?: OnboardingSubmissionsListParams) =>
    [...onboardingKeys.lists(), params] as const,
  details: () => [...onboardingKeys.all, 'detail'] as const,
  detail: (id: string) => [...onboardingKeys.details(), id] as const,
};

export function useOnboardingSubmissions(params?: OnboardingSubmissionsListParams) {
  return useQuery({
    queryKey: onboardingKeys.list(params),
    queryFn: () => onboardingApi.list(params),
  });
}

export function useOnboardingSubmission(id: string) {
  return useQuery({
    queryKey: onboardingKeys.detail(id),
    queryFn: () => onboardingApi.get(id),
    enabled: !!id,
  });
}

export function useUpdateOnboardingStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status, convertedClientId }: { id: string; status: OnboardingStatus; convertedClientId?: string }) =>
      onboardingApi.updateStatus(id, status, convertedClientId),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: onboardingKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: onboardingKeys.lists() });
      toast.success('Status updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update status: ${error.message}`);
    },
  });
}
