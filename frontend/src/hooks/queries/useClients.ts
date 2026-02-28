import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientsApi, ClientsListParams, CreateClientRequest, UpdateClientRequest } from '@/api/clients';
import { toast } from 'sonner';

export const clientKeys = {
  all: ['clients'] as const,
  lists: () => [...clientKeys.all, 'list'] as const,
  list: (params?: ClientsListParams) => [...clientKeys.lists(), params] as const,
  details: () => [...clientKeys.all, 'detail'] as const,
  detail: (id: string) => [...clientKeys.details(), id] as const,
  context: (id: string) => [...clientKeys.detail(id), 'context'] as const,
  accountManagers: () => [...clientKeys.all, 'account-managers'] as const,
};

export function useClients(params?: ClientsListParams) {
  return useQuery({
    queryKey: clientKeys.list(params),
    queryFn: () => clientsApi.list(params),
  });
}

export function useClient(id: string) {
  return useQuery({
    queryKey: clientKeys.detail(id),
    queryFn: () => clientsApi.get(id),
    enabled: !!id,
  });
}

export function useClientContext(id: string) {
  return useQuery({
    queryKey: clientKeys.context(id),
    queryFn: () => clientsApi.getContext(id),
    enabled: !!id,
  });
}

export function useAccountManagers() {
  return useQuery({
    queryKey: clientKeys.accountManagers(),
    queryFn: () => clientsApi.listAccountManagers(),
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateClientRequest) => clientsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
      toast.success('Client created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create client: ${error.message}`);
    },
  });
}

export function useUpdateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateClientRequest }) =>
      clientsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: clientKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
      toast.success('Client updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update client: ${error.message}`);
    },
  });
}

export function useDeleteClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => clientsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
      toast.success('Client deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete client: ${error.message}`);
    },
  });
}

export function useTestConnection() {
  return useMutation({
    mutationFn: (id: string) => clientsApi.testConnection(id),
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Connection successful!');
      } else {
        toast.error(`Connection failed: ${result.message}`);
      }
    },
    onError: (error: Error) => {
      toast.error(`Connection test failed: ${error.message}`);
    },
  });
}

export function useTriggerSync() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => clientsApi.triggerSync(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: clientKeys.detail(id) });
      toast.success('Sync started');
    },
    onError: (error: Error) => {
      toast.error(`Failed to start sync: ${error.message}`);
    },
  });
}

export function useUpdateCredentials() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, credentials }: { id: string; credentials: Record<string, string> }) =>
      clientsApi.updateCredentials(id, credentials),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: clientKeys.detail(id) });
      toast.success('Credentials updated');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update credentials: ${error.message}`);
    },
  });
}
