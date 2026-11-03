import type { Category, ClothingAttributes, ItemStatus } from '../../../interface/dto/types';
import { unwrap, wardrobeApi } from '../../shared/api/client';

export const wardrobeRequests = {
  items: (status?: ItemStatus, category?: Category) =>
    unwrap(wardrobeApi.GET('/api/app/wardrobe/items', { params: { query: { status, category } } })),
  item: (id: string) =>
    unwrap(wardrobeApi.GET('/api/app/wardrobe/items/{itemId}', { params: { path: { itemId: id } } })),
  startScan: (files: File[]) =>
    unwrap(wardrobeApi.POST('/api/app/wardrobe/scans', {
      body: { images: [] },
      bodySerializer: () => {
        const form = new FormData();
        files.forEach((file) => form.append('images', file));
        return form;
      },
    })),
  scan: (scanId: string) =>
    unwrap(wardrobeApi.GET('/api/app/wardrobe/scans/{scanId}', { params: { path: { scanId } } })),
  confirm: (id: string, attrs: ClothingAttributes) =>
    unwrap(wardrobeApi.POST('/api/app/wardrobe/items/{itemId}/confirm', { params: { path: { itemId: id } }, body: attrs })),
  update: (id: string, attrs: ClothingAttributes) =>
    unwrap(wardrobeApi.PUT('/api/app/wardrobe/items/{itemId}', { params: { path: { itemId: id } }, body: attrs })),
  remove: (id: string) =>
    unwrap(wardrobeApi.DELETE('/api/app/wardrobe/items/{itemId}', { params: { path: { itemId: id } } })),
};
