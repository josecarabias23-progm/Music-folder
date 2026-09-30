import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, ScoreItem } from '../api';
import { queryKeys } from './queryKeys';

export function useScores(enabled: boolean = true) {
  return useQuery<ScoreItem[]>({
    queryKey: queryKeys.scores,
    queryFn: ({ signal }) => api.getScores({ signal }),
    enabled,
  });
}

export function useCreateScore() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ score, file }: { score: Omit<ScoreItem, 'id'>; file?: File | null }) => {
      const added = await api.createScore(score as any);
      if (file && added?.id) {
        await api.uploadScoreFile(added.id, file);
      }
      return added;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.scores });
    },
  });
}

export function useDeleteScore() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteScore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.scores });
    },
  });
}

export function useImportPublicScore() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { title: string; composer?: string; pdfUrl?: string; sourceUrl?: string; instrumentation?: string }) =>
      api.importPublicScore(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.scores });
    },
  });
}
