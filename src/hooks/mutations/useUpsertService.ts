import { useMutation, useQueryClient } from '@tanstack/react-query';
import { services } from '@/api/repositories/serviceProvider';
import type { ServiceDTO } from '@/types';

export const useUpsertService = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (service: ServiceDTO) => services.serviceCatalogService.upsertService(service),
    onSuccess: (service) => {
      queryClient.invalidateQueries({ queryKey: ['services', service.clinicId] });
    }
  });

  return {
    data: mutation.data,
    isLoading: mutation.isPending,
    error: mutation.error,
    mutateAsync: mutation.mutateAsync
  };
};
