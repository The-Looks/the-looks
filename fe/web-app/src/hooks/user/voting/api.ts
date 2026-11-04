import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { votingRequests } from '../../../services/user/voting/requests';

export function useMyPolls() {
  return useQuery({ queryKey: ['polls'], queryFn: votingRequests.myPolls });
}

export function useOutfitChoices() {
  return useQuery({ queryKey: ['outfits'], queryFn: votingRequests.outfitChoices });
}

export function useCreatePoll() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: votingRequests.createPoll,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['polls'] }),
  });
}
