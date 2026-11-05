import { authApi, billingApi, outfitApi, unwrap } from '../../shared/api/client';

export const adminDashboardRequests = {
  aiUsage: () => unwrap(outfitApi.GET('/api/admin/outfits/ai-usage')),
  userStats: (days: number) => unwrap(authApi.GET('/api/admin/auth/stats', { params: { query: { days } } })),
  billingStats: (days: number) => unwrap(billingApi.GET('/api/admin/billing/stats', { params: { query: { days } } })),
  affiliateStats: (days: number) =>
    unwrap(outfitApi.GET('/api/admin/outfits/affiliate-stats', { params: { query: { days } } })),
};
