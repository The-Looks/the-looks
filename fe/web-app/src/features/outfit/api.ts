import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { outfitApi, unwrap } from '../../shared/api/client';
import type { Occasion, OutfitSuggestion } from '../../shared/api/types';

// outfit-service (be/services/outfit-service), contract: outfit-api.yaml

export const outfitKeys = {
  saved: ['outfits'] as const,
  detail: (id: string) => ['outfits', id] as const,
  suggestions: (occasion: Occasion, limit: number) => ['outfits', 'suggestions', occasion, limit] as const,
};

export function useSuggestions(occasion: Occasion | null, limit = 3) {
  return useQuery({
    queryKey: outfitKeys.suggestions(occasion ?? 'SCHOOL', limit),
    queryFn: () =>
      unwrap(outfitApi.GET('/api/app/outfits/suggestions', { params: { query: { occasion: occasion!, limit } } })),
    enabled: occasion !== null,
  });
}

/** Quick Pick chạy khi bấm nút. null = tủ đồ chưa đủ món để phối (204). */
export function useQuickPick() {
  return useMutation({
    mutationFn: async (): Promise<OutfitSuggestion | null> =>
      (await unwrap(outfitApi.GET('/api/app/outfits/quick-pick'))) ?? null,
  });
}

/** Gợi ý mua thêm món tủ đồ còn thiếu cho dịp này. null = tủ đồ đủ món hoặc không có sản phẩm (204). */
export function useShopping(occasion: Occasion | null) {
  return useQuery({
    queryKey: ['outfits', 'shopping', occasion],
    queryFn: async () =>
      (await unwrap(outfitApi.GET('/api/app/outfits/shopping', { params: { query: { occasion: occasion! } } }))) ??
      null,
    enabled: occasion !== null,
    staleTime: 10 * 60 * 1000,
    retry: false,
  });
}

/** Ghi lượt bấm, lấy link affiliate rồi mở sàn. */
export function useOpenProduct() {
  return useMutation({
    mutationFn: (productId: string) =>
      unwrap(outfitApi.POST('/api/app/outfits/shopping/{productId}/open', { params: { path: { productId } } })),
    onSuccess: ({ url }) => window.location.assign(url),
  });
}

export function useSavedOutfits() {
  return useQuery({
    queryKey: outfitKeys.saved,
    queryFn: () => unwrap(outfitApi.GET('/api/app/outfits')),
  });
}

export function useOutfit(id: string) {
  return useQuery({
    queryKey: outfitKeys.detail(id),
    queryFn: () => unwrap(outfitApi.GET('/api/app/outfits/{outfitId}', { params: { path: { outfitId: id } } })),
  });
}

export function useSaveOutfit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (s: OutfitSuggestion) =>
      unwrap(outfitApi.POST('/api/app/outfits', { body: { itemIds: s.items.map((i) => i.id), occasion: s.occasion } })),
    onSuccess: () => qc.invalidateQueries({ queryKey: outfitKeys.saved }),
  });
}

export type Vote = 'LIKE' | 'DISLIKE';

/** Thích / không thích một gợi ý. Không thích → backend loại tổ hợp đó, nên tải lại danh sách gợi ý. */
export function useRateSuggestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ suggestion, vote }: { suggestion: OutfitSuggestion; vote: Vote }) =>
      unwrap(
        outfitApi.POST('/api/app/outfits/feedback', { body: { itemIds: suggestion.items.map((i) => i.id), vote } }),
      ),
    onSuccess: (_, { vote }) => {
      if (vote === 'DISLIKE') qc.invalidateQueries({ queryKey: ['outfits', 'suggestions'] });
    },
  });
}

/** Nút "Mặc bộ này": ghi lần mặc để Quick Pick biết món nào lâu chưa mặc. */
export function useWearOutfit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (outfitId: string) =>
      unwrap(outfitApi.POST('/api/app/outfits/{outfitId}/wear', { params: { path: { outfitId } } })),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['outfits', 'suggestions'] }),
  });
}
