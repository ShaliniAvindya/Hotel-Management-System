import { QueryClient } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';

const PERSISTED_QUERY_CACHE_KEY = 'hotel-management-query-cache-v3';
const LEGACY_PERSISTED_QUERY_CACHE_KEYS = ['hotel-management-query-cache-v2'];
const SAFE_PERSISTED_QUERY_KEYS = new Set(['dashboard-summary', 'rooms', 'room-rates']);

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      gcTime: 30 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

if (typeof window !== 'undefined') {
  LEGACY_PERSISTED_QUERY_CACHE_KEYS.forEach((key) => window.sessionStorage.removeItem(key));

  const persister = createSyncStoragePersister({
    storage: window.sessionStorage,
    key: PERSISTED_QUERY_CACHE_KEY,
  });

  persistQueryClient({
    queryClient,
    persister,
    maxAge: 12 * 60 * 60 * 1000,
    buster: 'hotel-management-cache-v3',
    dehydrateOptions: {
      shouldDehydrateQuery: (query) => {
        const rootKey = Array.isArray(query.queryKey) ? query.queryKey[0] : query.queryKey;
        return query.state.status === 'success' && SAFE_PERSISTED_QUERY_KEYS.has(rootKey);
      },
    },
  });
}

export const clearPersistedQueryCache = () => {
  if (typeof window === 'undefined') return;

  queryClient.clear();
  window.sessionStorage.removeItem(PERSISTED_QUERY_CACHE_KEY);
  LEGACY_PERSISTED_QUERY_CACHE_KEYS.forEach((key) => window.sessionStorage.removeItem(key));
};
