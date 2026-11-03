import { outfitApi, unwrap } from '../../shared/api/client';

export const adminDashboardRequests = {
  aiUsage: () => unwrap(outfitApi.GET('/api/admin/outfits/ai-usage')),
};
