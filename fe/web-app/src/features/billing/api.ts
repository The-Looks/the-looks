import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { billingApi, unwrap } from '../../shared/api/client';
import type { BillingPeriod, Plan } from '../../shared/api/types';

// billing-service (be/services/billing-service), contract: billing-api.yaml

export const billingKeys = {
  plans: ['billing', 'plans'] as const,
  me: ['billing', 'me'] as const,
};

export function usePlans() {
  return useQuery({
    queryKey: billingKeys.plans,
    queryFn: () => unwrap(billingApi.GET('/api/public/billing/plans')),
    staleTime: 60 * 60 * 1000,
  });
}

export function useMyPlan() {
  return useQuery({
    queryKey: billingKeys.me,
    queryFn: () => unwrap(billingApi.GET('/api/app/billing/me')),
  });
}

/** Tạo đơn rồi sang trang hiện mã VietQR. */
export function useCheckout() {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (body: { plan: Exclude<Plan, 'FREE'>; period: BillingPeriod }) =>
      unwrap(billingApi.POST('/api/app/billing/checkout', { body })),
    onSuccess: (order) => navigate(`/billing/result?orderCode=${order.orderCode}`),
  });
}

export function useSetAutoRenew() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (enabled: boolean) => unwrap(billingApi.PUT('/api/app/billing/me/auto-renew', { body: { enabled } })),
    onSuccess: (me) => qc.setQueryData(billingKeys.me, me),
  });
}

/** Trang thanh toán: hỏi backend đơn đã nhận tiền chưa (SePay báo qua webhook). */
export function useConfirmOrder(orderCode: number | null) {
  const qc = useQueryClient();
  return useQuery({
    queryKey: ['billing', 'order', orderCode],
    enabled: orderCode !== null,
    queryFn: async () => {
      const order = await unwrap(
        billingApi.POST('/api/app/billing/orders/{orderCode}/confirm', { params: { path: { orderCode: orderCode! } } }),
      );
      if (order.status === 'PAID') qc.invalidateQueries({ queryKey: billingKeys.me });
      return order;
    },
    // Người dùng cần thời gian mở app ngân hàng: hỏi lại mỗi 3 giây, tối đa 15 phút
    refetchInterval: (q) => (q.state.data?.status === 'PENDING' && q.state.dataUpdateCount < 300 ? 3000 : false),
  });
}
