import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { outfitRequests, type SuggestionVote } from '../../../services/user/outfit/requests';
import type { Occasion, OutfitSuggestion } from '../../../interface/dto/types';

// outfit-service (be/services/outfit-service), contract: outfit-api.yaml

export const outfitKeys = {
  saved: ['outfits'] as const,
  detail: (id: string) => ['outfits', id] as const,
  suggestions: (occasion: Occasion, limit: number) => ['outfits', 'suggestions', occasion, limit] as const,
};

export function useSuggestions(occasion: Occasion | null, limit = 3) {
  return useQuery({
    queryKey: outfitKeys.suggestions(occasion ?? 'SCHOOL', limit),
    queryFn: () => outfitRequests.suggestions(occasion!, limit),
    enabled: occasion !== null,
  });
}

/** Quick Pick chạy khi bấm nút. null = tủ đồ chưa đủ món để phối (204). */
export function useQuickPick() {
  return useMutation({
    mutationFn: outfitRequests.quickPick,
  });
}

export function usePreferences() {
  return useQuery({
    queryKey: ['outfits', 'preferences'],
    queryFn: outfitRequests.preferences,
  });
}

/** Lưu xong thì gợi ý outfit và gợi ý mua thêm tính lại theo hồ sơ mới. */
export function useSavePreferences() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: outfitRequests.savePreferences,
    onSuccess: (saved) => {
      qc.invalidateQueries({ queryKey: ['outfits'] });
      qc.setQueryData(['outfits', 'preferences'], saved);
    },
  });
}

/** Gợi ý mua thêm món tủ đồ còn thiếu cho dịp này. null = tủ đồ đủ món hoặc không có sản phẩm (204). */
export function useShopping(occasion: Occasion | null) {
  return useQuery({
    queryKey: ['outfits', 'shopping', occasion],
    queryFn: () => outfitRequests.shopping(occasion!),
    enabled: occasion !== null,
    staleTime: 10 * 60 * 1000,
    retry: false,
  });
}

/** Ghi lượt bấm, lấy link affiliate rồi mở sàn. */
export function useOpenProduct() {
  return useMutation({
    mutationFn: outfitRequests.openProduct,
    onSuccess: ({ url }) => window.location.assign(url),
  });
}

/** Lịch mặc (Pro). enabled = gói có WEAR_CALENDAR, tránh gọi API khi chắc chắn bị 403. */
export function useWearCalendar(from: string, to: string, enabled: boolean) {
  return useQuery({
    queryKey: ['outfits', 'calendar', from, to],
    queryFn: () => outfitRequests.calendar(from, to),
    enabled,
    retry: false,
  });
}

export function usePlanDay() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: outfitRequests.planDay,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['outfits', 'calendar'] }),
  });
}

export function useUnplanDay() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: outfitRequests.unplanDay,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['outfits', 'calendar'] }),
  });
}

export function useSavedOutfits() {
  return useQuery({
    queryKey: outfitKeys.saved,
    queryFn: outfitRequests.saved,
  });
}

export function useOutfit(id: string) {
  return useQuery({
    queryKey: outfitKeys.detail(id),
    queryFn: () => outfitRequests.outfit(id),
  });
}

export function useSaveOutfit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: outfitRequests.saveOutfit,
    onSuccess: () => qc.invalidateQueries({ queryKey: outfitKeys.saved }),
  });
}

export type Vote = SuggestionVote;

/** Thích / không thích một gợi ý. Không thích → backend loại tổ hợp đó, nên tải lại danh sách gợi ý. */
export function useRateSuggestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ suggestion, vote }: { suggestion: OutfitSuggestion; vote: Vote }) =>
      outfitRequests.rateSuggestion(suggestion, vote),
    onSuccess: (_, { vote }) => {
      if (vote === 'DISLIKE') qc.invalidateQueries({ queryKey: ['outfits', 'suggestions'] });
    },
  });
}

/** Nút "Mặc bộ này": ghi lần mặc để Quick Pick biết món nào lâu chưa mặc. */
export function useWearOutfit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: outfitRequests.wearOutfit,
    onSuccess: () => Promise.all([
      qc.invalidateQueries({ queryKey: ['outfits', 'suggestions'] }),
      qc.invalidateQueries({ queryKey: ['outfits', 'calendar'] }),
      qc.invalidateQueries({ queryKey: ['wardrobe', 'cost-per-wear'] }),
      qc.invalidateQueries({ queryKey: ['wardrobe', 'stats'] }),
      qc.invalidateQueries({ queryKey: ['wardrobe', 'list'] }),
    ]),
  });
}
