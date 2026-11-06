import { authApi, billingApi, outfitApi, unwrap, wardrobeApi } from '../../shared/api/client';

export type OrderStatus = 'PENDING' | 'PAID' | 'CANCELLED' | 'REFUNDED';

export const adminDashboardRequests = {
  aiUsage: () => unwrap(outfitApi.GET('/api/admin/outfits/ai-usage')),
  userStats: (days: number) => unwrap(authApi.GET('/api/admin/auth/stats', { params: { query: { days } } })),
  billingStats: (days: number) => unwrap(billingApi.GET('/api/admin/billing/stats', { params: { query: { days } } })),
  affiliateStats: (days: number) =>
    unwrap(outfitApi.GET('/api/admin/outfits/affiliate-stats', { params: { query: { days } } })),
  orders: (query: { status?: OrderStatus; ownerId?: string; orderCode?: number; page: number; size: number }) =>
    unwrap(billingApi.GET('/api/admin/billing/orders', { params: { query } })),
  refund: (orderCode: number, reason: string) =>
    unwrap(billingApi.POST('/api/admin/billing/orders/{orderCode}/refund', { params: { path: { orderCode } }, body: { reason } })),
  affiliateBlocks: () => unwrap(outfitApi.GET('/api/admin/outfits/affiliate-blocks')),
  block: (body: { source: string; productId: string; title: string }) =>
    unwrap(outfitApi.POST('/api/admin/outfits/affiliate-blocks', { body })),
  unblock: (source: string, productId: string) =>
    unwrap(outfitApi.DELETE('/api/admin/outfits/affiliate-blocks', { params: { query: { source, productId } } })),
  billingStatus: () => unwrap(billingApi.GET('/api/admin/billing/status')),
  outfitStatus: () => unwrap(outfitApi.GET('/api/admin/outfits/status')),
  wardrobeStatus: () => unwrap(wardrobeApi.GET('/api/admin/wardrobe/status')),
};
