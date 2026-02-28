import { useQuery } from '@tanstack/react-query';
import { services } from '@/api/repositories/serviceProvider';

export const useSlots = (dateISO: string, clinicId: string) => {
  const query = useQuery({
    queryKey: ['slots', clinicId, dateISO],
    queryFn: () => services.slotService.listSlotsByDate(dateISO, clinicId),
    enabled: Boolean(dateISO && clinicId)
  });

  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error
  };
};
