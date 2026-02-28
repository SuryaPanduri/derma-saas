import { useQuery } from '@tanstack/react-query';
import { services } from '@/api/repositories/serviceProvider';

export const useClinicOrders = (clinicId: string) => {
  const query = useQuery({
    queryKey: ['clinic-orders', clinicId],
    queryFn: () => services.orderService.listOrdersByClinic(clinicId),
    enabled: Boolean(clinicId)
  });

  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error
  };
};
