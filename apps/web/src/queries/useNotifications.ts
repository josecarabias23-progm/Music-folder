import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, NotificationItem } from '../api';
import { queryKeys } from './queryKeys';

export function useNotifications(userId?: string | null) {
  return useQuery<NotificationItem[]>({
    queryKey: queryKeys.notifications(userId),
    queryFn: ({ signal }) => api.getNotifications(userId!, { signal }),
    enabled: Boolean(userId),
  });
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.markNotificationAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId?: string) => api.markAllNotificationsAsRead(userId),
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications(userId) });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
