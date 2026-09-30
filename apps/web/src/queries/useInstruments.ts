import { useQuery } from '@tanstack/react-query';
import { api, InstrumentItem } from '../api';
import { queryKeys } from './queryKeys';

export function useInstruments() {
  return useQuery<InstrumentItem[]>({
    queryKey: queryKeys.instruments,
    queryFn: ({ signal }) => api.getInstruments({ signal }),
  });
}
