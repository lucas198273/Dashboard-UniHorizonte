import { useQuery } from '@tanstack/react-query';
import { usersApi } from '../api/users';
import { useAuth } from './useAuth';

export function useMe() {
  const { session } = useAuth();
  return useQuery({
    queryKey: ['users', 'me'],
    queryFn: () => usersApi.me(),
    enabled: !!session,
    staleTime: 5 * 60_000,
  });
}
