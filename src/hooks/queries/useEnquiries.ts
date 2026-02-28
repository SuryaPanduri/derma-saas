import { useQuery } from '@tanstack/react-query';
import { services } from '@/api/repositories/serviceProvider';

export const useEnquiries = (clinicId: string) => {
  const query = useQuery({
    queryKey: ['enquiries', clinicId],
    queryFn: () => services.enquiryService.listEnquiriesByClinic(clinicId),
    enabled: Boolean(clinicId)
  });

  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error
  };
};
