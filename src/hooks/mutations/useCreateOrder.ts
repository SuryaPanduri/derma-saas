import { useMutation, useQueryClient } from '@tanstack/react-query';
import { services } from '@/api/repositories/serviceProvider';
import type { CreateOrderInputDTO } from '@/types';
import { logAppError } from '@/utils/errorLogger';

export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (input: CreateOrderInputDTO) => services.orderService.createOrder(input),
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: ['orders', order.patientUid] });
      queryClient.invalidateQueries({ queryKey: ['clinic-orders', order.clinicId] });
      queryClient.invalidateQueries({ queryKey: ['products', order.clinicId] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
    onError: async (error, variables) => {
      await logAppError(services.analyticsService, error, {
        patientUid: variables.patientUid,
        clinicId: variables.clinicId,
        step: 'create_order'
      });
    }
  });

  return {
    data: mutation.data,
    isLoading: mutation.isPending,
    error: mutation.error,
    mutateAsync: mutation.mutateAsync
  };
};
