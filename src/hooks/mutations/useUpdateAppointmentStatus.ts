import { useMutation, useQueryClient } from '@tanstack/react-query';
import { services } from '@/api/repositories/serviceProvider';

export const useUpdateAppointmentStatus = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ appointmentId, status }: { appointmentId: string; status: 'completed' | 'cancelled' }) =>
      services.bookingService.updateAppointmentStatus(appointmentId, status),
    onSuccess: (appointment) => {
      queryClient.invalidateQueries({ queryKey: ['appointments', appointment.patientUid] });
      queryClient.invalidateQueries({ queryKey: ['clinic-appointments', appointment.clinicId] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    }
  });

  return {
    data: mutation.data,
    isLoading: mutation.isPending,
    error: mutation.error,
    mutateAsync: mutation.mutateAsync
  };
};
