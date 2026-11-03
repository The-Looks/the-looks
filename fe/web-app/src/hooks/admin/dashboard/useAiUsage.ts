import { useQuery } from '@tanstack/react-query';
import { adminDashboardRequests } from '../../../services/admin/dashboard/requests';

export function useAiUsage() {
  return useQuery({ queryKey: ['admin', 'outfits', 'ai-usage'], queryFn: adminDashboardRequests.aiUsage });
}
