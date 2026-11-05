import type { BillingPeriod, Plan } from '../../../interface/dto/types';
import { billingApi, unwrap } from '../../shared/api/client';

export const billingRequests = {
  plans: () => unwrap(billingApi.GET('/api/public/billing/plans')),
  myPlan: () => unwrap(billingApi.GET('/api/app/billing/me')),
  setAutoRenew: (enabled: boolean) => unwrap(billingApi.PUT('/api/app/billing/me/auto-renew', { body: { enabled } })),
  checkout: (body: { plan: Exclude<Plan, 'FREE'>; period: BillingPeriod }) =>
    unwrap(billingApi.POST('/api/app/billing/checkout', { body })),
  confirmOrder: (orderCode: number) =>
    unwrap(billingApi.POST('/api/app/billing/orders/{orderCode}/confirm', { params: { path: { orderCode } } })),
};
