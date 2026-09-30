import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, ForumThread } from '../api';
import { queryKeys } from './queryKeys';

export function useThreads(enabled: boolean = true) {
  return useQuery<ForumThread[]>({
    queryKey: queryKeys.threads,
    queryFn: ({ signal }) => api.getThreads({ signal }),
    enabled,
  });
}

export function useCreateThread() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newThread: { title: string; author: string; category: any; content: string }) => {
      const added = await api.createThread(newThread as any);
      if (added?.id && newThread.content) {
        await api.addComment(added.id, newThread.author, newThread.content);
      }
      return added;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.threads });
    },
  });
}

export function useAddComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ threadId, author, content }: { threadId: string; author: string; content: string }) =>
      api.addComment(threadId, author, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.threads });
    },
  });
}

export function useLikeThread() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.likeThread(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.threads });
    },
  });
}
