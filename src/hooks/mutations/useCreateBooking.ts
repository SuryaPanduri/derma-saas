import { useMutation, useQueryClient } from '@tanstack/react-query';
import { services } from '@/api/repositories/serviceProvider';
import type { CreateAppointmentInputDTO } from '@/types';
import { logAppError } from '@/utils/errorLogger';

export const useCreateBooking = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (input: CreateAppointmentInputDTO) => services.bookingService.createAppointment(input),
    onSuccess: (appointment) => {
      queryClient.invalidateQueries({ queryKey: ['appointments', appointment.patientUid] });
      queryClient.invalidateQueries({ queryKey: ['clinic-appointments', appointment.clinicId] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
    onError: async (error, variables) => {
      await logAppError(services.analyticsService, error, {
        patientUid: variables.patientUid,
        clinicId: variables.clinicId,
        step: 'create_booking'
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
