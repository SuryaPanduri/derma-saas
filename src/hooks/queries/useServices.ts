import { useQuery } from '@tanstack/react-query';
import { services } from '@/api/repositories/serviceProvider';

export const useServices = (clinicId: string) => {
  const query = useQuery({
    queryKey: ['services', clinicId],
    queryFn: () => services.serviceCatalogService.listServices(clinicId),
    enabled: Boolean(clinicId)
  });

  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error
  };
};
