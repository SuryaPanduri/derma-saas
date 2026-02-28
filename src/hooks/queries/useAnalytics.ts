import { useQuery } from '@tanstack/react-query';
import { services } from '@/api/repositories/serviceProvider';

export const useAnalytics = (clinicId: string, startISO: string, endISO: string) => {
  const revenueQuery = useQuery({
    queryKey: ['analytics', 'revenue', clinicId, startISO, endISO],
    queryFn: () => services.analyticsService.getRevenueSummary(clinicId, startISO, endISO),
    enabled: Boolean(clinicId)
  });

  const trendQuery = useQuery({
    queryKey: ['analytics', 'trend', clinicId, startISO, endISO],
    queryFn: () => services.analyticsService.getBookingTrend(clinicId, startISO, endISO),
    enabled: Boolean(clinicId)
  });

  return {
    data: {
      revenueSummary: revenueQuery.data,
      bookingTrend: trendQuery.data ?? []
    },
    isLoading: revenueQuery.isLoading || trendQuery.isLoading,
    error: revenueQuery.error ?? trendQuery.error
  };
};
