import type { Occasion, OutfitSuggestion, StylePreferences } from '../../../interface/dto/types';
import { outfitApi, unwrap } from '../../shared/api/client';

export type SuggestionVote = 'LIKE' | 'DISLIKE';

export const outfitRequests = {
  suggestions: (occasion: Occasion, limit: number) =>
    unwrap(outfitApi.GET('/api/app/outfits/suggestions', { params: { query: { occasion, limit } } })),
  quickPick: async (): Promise<OutfitSuggestion | null> =>
    (await unwrap(outfitApi.GET('/api/app/outfits/quick-pick'))) ?? null,
  weather: async (): Promise<{ temperatureC: number; rainy: boolean } | null> =>
    (await unwrap(outfitApi.GET('/api/app/outfits/weather'))) ?? null,
  preferences: () => unwrap(outfitApi.GET('/api/app/outfits/preferences')),
  savePreferences: (body: StylePreferences) =>
    unwrap(outfitApi.PUT('/api/app/outfits/preferences', { body })),
  shopping: async (occasion: Occasion) =>
    (await unwrap(outfitApi.GET('/api/app/outfits/shopping', { params: { query: { occasion } } }))) ?? null,
  openProduct: (productId: string) =>
    unwrap(outfitApi.POST('/api/app/outfits/shopping/{productId}/open', { params: { path: { productId } } })),
  saved: () => unwrap(outfitApi.GET('/api/app/outfits')),
  outfit: (id: string) =>
    unwrap(outfitApi.GET('/api/app/outfits/{outfitId}', { params: { path: { outfitId: id } } })),
  saveOutfit: (suggestion: OutfitSuggestion) =>
    unwrap(outfitApi.POST('/api/app/outfits', {
      body: { itemIds: suggestion.items.map((item) => item.id), occasion: suggestion.occasion },
    })),
  rateSuggestion: (suggestion: OutfitSuggestion, vote: SuggestionVote) =>
    unwrap(outfitApi.POST('/api/app/outfits/feedback', {
      body: { itemIds: suggestion.items.map((item) => item.id), vote },
    })),
  calendar: (from: string, to: string) =>
    unwrap(outfitApi.GET('/api/app/outfits/calendar', { params: { query: { from, to } } })),
  planDay: ({ date, outfitId }: { date: string; outfitId: string }) =>
    unwrap(outfitApi.PUT('/api/app/outfits/calendar/{date}', { params: { path: { date } }, body: { outfitId } })),
  unplanDay: (date: string) =>
    unwrap(outfitApi.DELETE('/api/app/outfits/calendar/{date}', { params: { path: { date } } })),
  wearOutfit: (outfitId: string) =>
    unwrap(outfitApi.POST('/api/app/outfits/{outfitId}/wear', { params: { path: { outfitId } } })),
};
