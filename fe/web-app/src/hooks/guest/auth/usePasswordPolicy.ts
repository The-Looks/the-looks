import { useQuery } from '@tanstack/react-query';
import { authRequests } from '../../../services/guest/auth/requests';

export function usePasswordPolicy() {
  return useQuery({
    queryKey: ['password-policy'],
    queryFn: authRequests.passwordPolicy,
    staleTime: 60 * 60_000,
  });
}
