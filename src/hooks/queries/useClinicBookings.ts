import { useQuery } from '@tanstack/react-query';
import { services } from '@/api/repositories/serviceProvider';

export const useClinicBookings = (clinicId: string) => {
  const query = useQuery({
    queryKey: ['clinic-appointments', clinicId],
    queryFn: () => services.bookingService.listAppointmentsByClinic(clinicId),
    enabled: Boolean(clinicId)
  });

  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error
  };
};
