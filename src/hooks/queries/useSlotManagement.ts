import { useQuery } from '@tanstack/react-query';
import { services } from '@/api/repositories/serviceProvider';

export const useSlotManagement = (clinicId: string) => {
  const query = useQuery({
    queryKey: ['slot-management', clinicId],
    queryFn: () => services.slotService.getSlotManagement(clinicId),
    enabled: Boolean(clinicId)
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error
  };
};
