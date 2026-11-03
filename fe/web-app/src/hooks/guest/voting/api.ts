import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { guestVotingRequests } from '../../../services/guest/voting/requests';

export function usePoll(code: string) {
  return useQuery({ queryKey: ['polls', code], queryFn: () => guestVotingRequests.poll(code) });
}

export function useCastVote(code: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (choice: 'A' | 'B') => guestVotingRequests.castVote(code, choice),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['polls', code] }),
  });
}
