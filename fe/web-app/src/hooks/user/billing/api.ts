import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { billingRequests } from '../../../services/user/billing/requests';

// billing-service (be/services/billing-service), contract: billing-api.yaml

export const billingKeys = {
  plans: ['billing', 'plans'] as const,
  me: ['billing', 'me'] as const,
};

export function usePlans() {
  return useQuery({
    queryKey: billingKeys.plans,
    queryFn: billingRequests.plans,
    staleTime: 60 * 60 * 1000,
  });
}

export function useMyPlan() {
  return useQuery({
    queryKey: billingKeys.me,
    queryFn: billingRequests.myPlan,
  });
}

export function useSetAutoRenew() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: billingRequests.setAutoRenew,
    onSuccess: (me) => qc.setQueryData(billingKeys.me, me),
  });
}

/** Tạo đơn rồi chuyển sang trang thanh toán của PayOS. */
export function useCheckout() {
  return useMutation({
    mutationFn: billingRequests.checkout,
    onSuccess: (order) => {
      if (order.checkoutUrl) window.location.assign(order.checkoutUrl);
    },
  });
}

/** Trang kết quả: hỏi backend đơn đã thanh toán chưa (backend tự hỏi lại PayOS). */
export function useConfirmOrder(orderCode: number | null) {
  const qc = useQueryClient();
  return useQuery({
    queryKey: ['billing', 'order', orderCode],
    enabled: orderCode !== null,
    queryFn: async () => {
      const order = await billingRequests.confirmOrder(orderCode!);
      if (order.status === 'PAID') qc.invalidateQueries({ queryKey: billingKeys.me });
      return order;
    },
    // Webhook có thể tới chậm vài giây: hỏi lại tối đa ~30 giây khi còn PENDING
    refetchInterval: (q) => (q.state.data?.status === 'PENDING' && q.state.dataUpdateCount < 10 ? 3000 : false),
  });
}
