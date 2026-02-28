import { useMutation, useQueryClient } from '@tanstack/react-query';
import { services } from '@/api/repositories/serviceProvider';
import type { SlotManagementDTO } from '@/types';

export const useUpsertSlotManagement = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (config: SlotManagementDTO) => services.slotService.upsertSlotManagement(config),
    onSuccess: (config) => {
      queryClient.invalidateQueries({ queryKey: ['slot-management', config.clinicId] });
      queryClient.invalidateQueries({ queryKey: ['slots', config.clinicId] });
    }
  });

  return {
    data: mutation.data,
    isLoading: mutation.isPending,
    error: mutation.error,
    mutateAsync: mutation.mutateAsync
  };
};
