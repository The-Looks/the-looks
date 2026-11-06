import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminDashboardRequests, type OrderStatus } from '../../../services/admin/dashboard/requests';

export function useOrders(query: { status?: OrderStatus; ownerId?: string; orderCode?: number; page: number; size: number }) {
  return useQuery({ queryKey: ['admin', 'orders', query], queryFn: () => adminDashboardRequests.orders(query) });
}

/** Hoàn tiền xong thì tải lại danh sách đơn và số liệu doanh thu. */
export function useRefund() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ orderCode, reason }: { orderCode: number; reason: string }) => adminDashboardRequests.refund(orderCode, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'orders'] });
      qc.invalidateQueries({ queryKey: ['admin', 'stats', 'billing'] });
    },
  });
}

export function useAffiliateBlocks() {
  return useQuery({ queryKey: ['admin', 'affiliate-blocks'], queryFn: adminDashboardRequests.affiliateBlocks });
}

export function useToggleBlock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { source: string; productId: string; title: string; blocked: boolean }) =>
      p.blocked ? adminDashboardRequests.unblock(p.source, p.productId) : adminDashboardRequests.block(p),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'affiliate-blocks'] }),
  });
}

export function useSystemStatus() {
  const billing = useQuery({ queryKey: ['admin', 'status', 'billing'], queryFn: adminDashboardRequests.billingStatus, retry: false });
  const outfit = useQuery({ queryKey: ['admin', 'status', 'outfit'], queryFn: adminDashboardRequests.outfitStatus, retry: false });
  const wardrobe = useQuery({ queryKey: ['admin', 'status', 'wardrobe'], queryFn: adminDashboardRequests.wardrobeStatus, retry: false });
  return { billing, outfit, wardrobe };
}
