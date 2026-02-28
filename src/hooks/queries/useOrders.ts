import { useQuery } from '@tanstack/react-query';
import { services } from '@/api/repositories/serviceProvider';

export const useOrders = (patientUid: string) => {
  const query = useQuery({
    queryKey: ['orders', patientUid],
    queryFn: () => services.orderService.listOrdersByUser(patientUid),
    enabled: Boolean(patientUid)
  });

  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error
  };
};
