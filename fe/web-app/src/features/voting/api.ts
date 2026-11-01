import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { outfitApi, unwrap, votingApi } from '../../shared/api/client';

// voting-service — Phát. Contract: voting-api.yaml

export function useMyPolls() {
  return useQuery({ queryKey: ['polls'], queryFn: () => unwrap(votingApi.GET('/api/app/polls')) });
}

export function usePoll(code: string) {
  return useQuery({
    queryKey: ['polls', code],
    queryFn: () => unwrap(votingApi.GET('/api/public/polls/{code}', { params: { path: { code } } })),
  });
}

/** Danh sách outfit đã lưu để chọn A/B (gọi thẳng outfit-service, không import feature outfit). */
export function useOutfitChoices() {
  return useQuery({ queryKey: ['outfits'], queryFn: () => unwrap(outfitApi.GET('/api/app/outfits')) });
}

export function useCreatePoll() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { outfitAId: string; outfitBId: string; question?: string; ttlHours?: number }) =>
      unwrap(votingApi.POST('/api/app/polls', { body })),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['polls'] }),
  });
}
