import { useMutation, useQueryClient } from '@tanstack/react-query';
import { services } from '@/api/repositories/serviceProvider';
import type { ProfileDTO } from '@/types';

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (profile: ProfileDTO) => services.profileService.upsertProfile(profile),
    onSuccess: (profile) => {
      queryClient.invalidateQueries({ queryKey: ['profile', profile.uid] });
    }
  });

  return {
    data: mutation.data,
    isLoading: mutation.isPending,
    error: mutation.error,
    mutateAsync: mutation.mutateAsync
  };
};
