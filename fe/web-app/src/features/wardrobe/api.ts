import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { unwrap, wardrobeApi } from '../../shared/api/client';
import type { Category, ClothingAttributes, ItemStatus } from '../../shared/api/types';

// wardrobe-service — Member 1. Contract: wardrobe-api.yaml

export const wardrobeKeys = {
  all: ['wardrobe'] as const,
  list: (status?: ItemStatus, category?: Category) => ['wardrobe', 'list', status, category] as const,
  item: (id: string) => ['wardrobe', 'item', id] as const,
};

export function useWardrobe(status?: ItemStatus, category?: Category) {
  return useQuery({
    queryKey: wardrobeKeys.list(status, category),
    queryFn: () => unwrap(wardrobeApi.GET('/api/app/wardrobe/items', { params: { query: { status, category } } })),
  });
}

export function useItem(id: string) {
  return useQuery({
    queryKey: wardrobeKeys.item(id),
    queryFn: () => unwrap(wardrobeApi.GET('/api/app/wardrobe/items/{itemId}', { params: { path: { itemId: id } } })),
    // AI nhận diện chạy nền: hỏi lại mỗi 2 giây khi món đồ còn đang xử lý
    refetchInterval: (q) => (q.state.data?.status === 'PROCESSING' ? 2000 : false),
  });
}

export function useUpload() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) =>
      unwrap(
        wardrobeApi.POST('/api/app/wardrobe/items', {
          body: { image: '' },
          bodySerializer: () => {
            const form = new FormData();
            form.append('image', file);
            return form;
          },
        }),
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: wardrobeKeys.all }),
  });
}

export function useConfirm(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (attrs: ClothingAttributes) =>
      unwrap(wardrobeApi.POST('/api/app/wardrobe/items/{itemId}/confirm', { params: { path: { itemId: id } }, body: attrs })),
    onSuccess: () => qc.invalidateQueries({ queryKey: wardrobeKeys.all }),
  });
}

export function useDelete() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      unwrap(wardrobeApi.DELETE('/api/app/wardrobe/items/{itemId}', { params: { path: { itemId: id } } })),
    onSuccess: () => qc.invalidateQueries({ queryKey: wardrobeKeys.all }),
  });
}
