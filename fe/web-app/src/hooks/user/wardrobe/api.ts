import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { wardrobeRequests } from '../../../services/user/wardrobe/requests';
import type { Category, ClothingAttributes, ItemStatus } from '../../../interface/dto/types';

// wardrobe-service — Member 1. Contract: wardrobe-api.yaml

export const wardrobeKeys = {
  all: ['wardrobe'] as const,
  list: (status?: ItemStatus, category?: Category) => ['wardrobe', 'list', status, category] as const,
  item: (id: string) => ['wardrobe', 'item', id] as const,
};

export function useWardrobe(status?: ItemStatus, category?: Category) {
  return useQuery({
    queryKey: wardrobeKeys.list(status, category),
    queryFn: () => wardrobeRequests.items(status, category),
  });
}

export function useItem(id: string) {
  return useQuery({
    queryKey: wardrobeKeys.item(id),
    queryFn: () => wardrobeRequests.item(id),
    // AI nhận diện chạy nền: hỏi lại mỗi 2 giây khi món đồ còn đang xử lý
    refetchInterval: (q) => (q.state.data?.status === 'PROCESSING' ? 2000 : false),
  });
}

/** Gửi 1..10 ảnh trong một lần quét; mỗi ảnh có thể ra nhiều món. */
export function useStartScan() {
  return useMutation({
    mutationFn: wardrobeRequests.startScan,
  });
}

/** Theo dõi lần quét: hỏi lại mỗi 2 giây khi còn PROCESSING, xong thì làm mới tủ đồ. */
export function useScan(scanId: string | null) {
  const qc = useQueryClient();
  return useQuery({
    queryKey: ['wardrobe', 'scan', scanId],
    enabled: scanId !== null,
    queryFn: async () => {
      const scan = await wardrobeRequests.scan(scanId!);
      // Chỉ làm mới danh sách: invalidate cả scan đang chạy sẽ tự huỷ/refetch liên tục.
      if (scan.status !== 'PROCESSING') void qc.invalidateQueries({ queryKey: ['wardrobe', 'list'] });
      return scan;
    },
    refetchInterval: (q) => (q.state.data?.status === 'PROCESSING' ? 2000 : false),
  });
}

export function useConfirm(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (attrs: ClothingAttributes) => wardrobeRequests.confirm(id, attrs),
    onSuccess: () => qc.invalidateQueries({ queryKey: wardrobeKeys.all }),
  });
}

export function useUpdateItem(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (attrs: ClothingAttributes) => wardrobeRequests.update(id, attrs),
    onSuccess: () => qc.invalidateQueries({ queryKey: wardrobeKeys.all }),
  });
}

export function useDelete() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: wardrobeRequests.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: wardrobeKeys.all }),
  });
}

export function useConfirmAll() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: wardrobeRequests.confirmAll,
    onSuccess: () => qc.invalidateQueries({ queryKey: wardrobeKeys.all }),
  });
}
