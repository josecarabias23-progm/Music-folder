import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  api,
  GroupCommunityPost,
  GroupItem,
  GroupLibraryItem,
  GroupMember,
  GroupRehearsalItem,
} from '../api';
import { queryKeys } from './queryKeys';

export function useUserGroups(userId?: string | null) {
  return useQuery<GroupItem[]>({
    queryKey: queryKeys.userGroups(userId),
    queryFn: ({ signal }) => api.getUserGroups(userId!, { signal }),
    enabled: Boolean(userId),
  });
}

export function useGroupMembers(groupId?: string | null, userId?: string | null) {
  return useQuery<GroupMember[]>({
    queryKey: queryKeys.groupMembers(groupId),
    queryFn: ({ signal }) => api.getGroupMembers(groupId!, { signal }),
    enabled: Boolean(groupId && userId),
  });
}

export function useGroupLibrary(groupId?: string | null, tab?: string, userId?: string | null) {
  return useQuery<GroupLibraryItem[]>({
    queryKey: queryKeys.groupLibrary(groupId),
    queryFn: ({ signal }) => api.getGroupLibrary(groupId!, undefined, { signal }),
    enabled: Boolean(groupId && userId && tab === 'biblioteca'),
  });
}

export function useGroupRehearsals(groupId?: string | null, tab?: string, userId?: string | null) {
  return useQuery<GroupRehearsalItem[]>({
    queryKey: queryKeys.groupRehearsals(groupId),
    queryFn: ({ signal }) => api.getGroupRehearsals(groupId!, undefined, { signal }),
    enabled: Boolean(groupId && userId && tab === 'ensayos'),
  });
}

export function useGroupCommunity(groupId?: string | null, tab?: string, userId?: string | null) {
  return useQuery<GroupCommunityPost[]>({
    queryKey: queryKeys.groupCommunity(groupId),
    queryFn: ({ signal }) => api.getGroupCommunity(groupId!, undefined, { signal }),
    enabled: Boolean(groupId && userId && tab === 'comunidad'),
  });
}

export function useCreateGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { name: string; description?: string; type?: string; visibility?: string; ownerId: string }) =>
      api.createGroup(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.userGroups(variables.ownerId) });
      queryClient.invalidateQueries({ queryKey: ['userGroups'] });
    },
  });
}

export function useJoinGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, code }: { userId: string; code: string }) => api.joinGroup({ userId, code }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.userGroups(variables.userId) });
      queryClient.invalidateQueries({ queryKey: ['userGroups'] });
      if (data?.group?.id) {
        queryClient.invalidateQueries({ queryKey: queryKeys.groupMembers(data.group.id) });
      }
      queryClient.invalidateQueries({ queryKey: ['groupMembers'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications(variables.userId) });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useRegenerateGroupCode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, userId }: { groupId: string; userId: string }) =>
      api.regenerateGroupCode(groupId, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.userGroups(variables.userId) });
    },
  });
}

export function useCreateGroupLibraryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, item }: { groupId: string; item: any }) =>
      api.createGroupLibraryItem(groupId, item),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groupLibrary(variables.groupId) });
    },
  });
}

export function useCreateGroupRehearsal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, rehearsal }: { groupId: string; rehearsal: any }) =>
      api.createGroupRehearsal(groupId, rehearsal),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groupRehearsals(variables.groupId) });
    },
  });
}

export function useCreateGroupPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, post }: { groupId: string; post: any }) =>
      api.createGroupPost(groupId, post),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groupCommunity(variables.groupId) });
    },
  });
}
