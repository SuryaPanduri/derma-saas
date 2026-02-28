import { useQuery } from '@tanstack/react-query';
import { services } from '@/api/repositories/serviceProvider';

export const useProducts = (clinicId: string) => {
  const query = useQuery({
    queryKey: ['products', clinicId],
    queryFn: () => services.productService.listProducts(clinicId),
    enabled: Boolean(clinicId)
  });

  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error
  };
};
