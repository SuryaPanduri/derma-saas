import { useQuery } from '@tanstack/react-query';
import { services } from '@/api/repositories/serviceProvider';

export const useBookings = (patientUid: string) => {
  const query = useQuery({
    queryKey: ['appointments', patientUid],
    queryFn: () => services.bookingService.listAppointmentsByUser(patientUid),
    enabled: Boolean(patientUid)
  });

  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error
  };
};
