import { useMutation, useQueryClient } from '@tanstack/react-query';
import { services } from '@/api/repositories/serviceProvider';
import type { CreateEnquiryInputDTO } from '@/types';

export const useCreateEnquiry = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (input: CreateEnquiryInputDTO) => services.enquiryService.createEnquiry(input),
    onSuccess: (enquiry) => {
      queryClient.invalidateQueries({ queryKey: ['enquiries', enquiry.clinicId] });
    }
  });

  return {
    data: mutation.data,
    isLoading: mutation.isPending,
    error: mutation.error,
    mutateAsync: mutation.mutateAsync
  };
};
