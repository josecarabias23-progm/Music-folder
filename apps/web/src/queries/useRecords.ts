import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, RehearsalRecord } from '../api';
import { queryKeys } from './queryKeys';

export function useRecords(enabled: boolean = true) {
  return useQuery<RehearsalRecord[]>({
    queryKey: queryKeys.records,
    queryFn: ({ signal }) => api.getRecords({ signal }),
    enabled,
  });
}

export function useCreateRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newRecord: Omit<RehearsalRecord, 'id'>) => api.createRecord(newRecord),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.records });
    },
  });
}
