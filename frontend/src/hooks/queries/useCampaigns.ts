import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  campaignsApi,
  CampaignsListParams,
  CreateCampaignRequest,
  UpdateCampaignRequest,
  ScheduleCampaignRequest,
} from '@/api/campaigns';
import { toast } from 'sonner';

export const campaignKeys = {
  all: ['campaigns'] as const,
  lists: () => [...campaignKeys.all, 'list'] as const,
  list: (params?: CampaignsListParams) => [...campaignKeys.lists(), params] as const,
  details: () => [...campaignKeys.all, 'detail'] as const,
  detail: (id: string) => [...campaignKeys.details(), id] as const,
  versions: (id: string) => [...campaignKeys.detail(id), 'versions'] as const,
};

export function useCampaigns(params?: CampaignsListParams) {
  return useQuery({
    queryKey: campaignKeys.list(params),
    queryFn: () => campaignsApi.list(params),
  });
}

export function useCampaign(id: string) {
  return useQuery({
    queryKey: campaignKeys.detail(id),
    queryFn: () => campaignsApi.get(id),
    enabled: !!id,
  });
}

export function useCampaignVersions(id: string) {
  return useQuery({
    queryKey: campaignKeys.versions(id),
    queryFn: () => campaignsApi.getVersions(id),
    enabled: !!id,
  });
}

export function useCreateCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCampaignRequest) => campaignsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() });
      toast.success('Campaign created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create campaign: ${error.message}`);
    },
  });
}

export function useUpdateCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCampaignRequest }) =>
      campaignsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() });
      toast.success('Campaign updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update campaign: ${error.message}`);
    },
  });
}

export function useDeleteCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => campaignsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() });
      toast.success('Campaign deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete campaign: ${error.message}`);
    },
  });
}

export function useScheduleCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ScheduleCampaignRequest }) =>
      campaignsApi.schedule(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() });
      toast.success('Campaign scheduled successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to schedule campaign: ${error.message}`);
    },
  });
}

export function useApproveCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, comments }: { id: string; comments?: string }) =>
      campaignsApi.approve(id, comments),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() });
      toast.success('Campaign approved');
    },
    onError: (error: Error) => {
      toast.error(`Failed to approve campaign: ${error.message}`);
    },
  });
}

export function useRequestChanges() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, comments }: { id: string; comments: string }) =>
      campaignsApi.requestChanges(id, comments),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() });
      toast.success('Change request submitted');
    },
    onError: (error: Error) => {
      toast.error(`Failed to request changes: ${error.message}`);
    },
  });
}
