export const queryKeys = {
  scores: ['scores'] as const,
  publicScores: (query: string) => ['publicScores', query] as const,
  instruments: ['instruments'] as const,
  records: ['records'] as const,
  threads: ['threads'] as const,
  userGroups: (userId?: string | null) => ['userGroups', userId] as const,
  groupMembers: (groupId?: string | null) => ['groupMembers', groupId] as const,
  groupLibrary: (groupId?: string | null) => ['groupLibrary', groupId] as const,
  groupRehearsals: (groupId?: string | null) => ['groupRehearsals', groupId] as const,
  groupCommunity: (groupId?: string | null) => ['groupCommunity', groupId] as const,
  notifications: (userId?: string | null) => ['notifications', userId] as const,
};
