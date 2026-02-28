import type { ProfileService } from '@/api/interfaces';
import type { ProfileDTO } from '@/types';
import { axiosInstance } from './axiosInstance';

export class ExpressProfileService implements ProfileService {
  async getProfile(uid: string): Promise<ProfileDTO | null> {
    const response = await axiosInstance.get<ProfileDTO | null>(`/profiles/${uid}`);
    return response.data;
  }

  async upsertProfile(profile: ProfileDTO): Promise<ProfileDTO> {
    const response = await axiosInstance.put<ProfileDTO>(`/profiles/${profile.uid}`, profile);
    return response.data;
  }
}
