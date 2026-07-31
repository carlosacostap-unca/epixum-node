export function cohortCacheScope(token: string | undefined, cohortId: string) {
  return [token, cohortId] as const;
}
