import type { Category, ClothingAttributes, ItemStatus } from '../../../interface/dto/types';
import { unwrap, wardrobeApi } from '../../shared/api/client';
import type { WardrobeFilters } from './filters';
import { normalizeUpload } from './normalizeUpload';

export const wardrobeRequests = {
  costSummary: (signal?: AbortSignal) => unwrap(wardrobeApi.GET('/api/app/wardrobe/cost-per-wear', { signal })),
  itemCost: (id: string, signal?: AbortSignal) => unwrap(wardrobeApi.GET('/api/app/wardrobe/items/{itemId}/cost-per-wear', { params: { path: { itemId: id } }, signal })),
  stats: (signal?: AbortSignal) => unwrap(wardrobeApi.GET('/api/app/wardrobe/stats', { signal })),
  search: (filters: WardrobeFilters, signal?: AbortSignal) =>
    unwrap(wardrobeApi.GET('/api/app/wardrobe/items/search', { params: { query: filters }, signal })),
  items: (status?: ItemStatus, category?: Category) =>
    unwrap(wardrobeApi.GET('/api/app/wardrobe/items', { params: { query: { status, category } } })),
  item: (id: string) =>
    unwrap(wardrobeApi.GET('/api/app/wardrobe/items/{itemId}', { params: { path: { itemId: id } } })),
  startScan: async (files: File[]) => {
    const images = await Promise.all(files.map(normalizeUpload));
    return unwrap(wardrobeApi.POST('/api/app/wardrobe/scans', {
      body: { images: [] },
      bodySerializer: () => {
        const form = new FormData();
        images.forEach((file) => form.append('images', file));
        return form;
      },
    }));
  },
  scan: (scanId: string) =>
    unwrap(wardrobeApi.GET('/api/app/wardrobe/scans/{scanId}', { params: { path: { scanId } } })),
  confirm: (id: string, attrs: ClothingAttributes) =>
    unwrap(wardrobeApi.POST('/api/app/wardrobe/items/{itemId}/confirm', { params: { path: { itemId: id } }, body: attrs })),
  confirmAll: (items: { itemId: string; attributes: ClothingAttributes }[]) =>
    unwrap(wardrobeApi.POST('/api/app/wardrobe/items/confirm', { body: { items } })),
  update: (id: string, attrs: ClothingAttributes) =>
    unwrap(wardrobeApi.PUT('/api/app/wardrobe/items/{itemId}', { params: { path: { itemId: id } }, body: attrs })),
  changeStatus: ({ itemIds, status }: { itemIds: string[]; status: ItemStatus }) =>
    unwrap(wardrobeApi.PATCH('/api/app/wardrobe/items/batch', { body: { itemIds, status } })),
  removeAll: (itemIds: string[]) =>
    unwrap(wardrobeApi.POST('/api/app/wardrobe/items/batch-delete', { body: { itemIds } })),
  remove: (id: string) =>
    unwrap(wardrobeApi.DELETE('/api/app/wardrobe/items/{itemId}', { params: { path: { itemId: id } } })),
};
