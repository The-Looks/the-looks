import { useQuery } from '@tanstack/react-query';
import { adminDashboardRequests } from '../../../services/admin/dashboard/requests';

export function useUserStats(days: number) {
  return useQuery({ queryKey: ['admin', 'stats', 'users', days], queryFn: () => adminDashboardRequests.userStats(days) });
}

export function useBillingStats(days: number) {
  return useQuery({ queryKey: ['admin', 'stats', 'billing', days], queryFn: () => adminDashboardRequests.billingStats(days) });
}

export function useAffiliateStats(days: number) {
  return useQuery({
    queryKey: ['admin', 'stats', 'affiliate', days],
    queryFn: () => adminDashboardRequests.affiliateStats(days),
  });
}
