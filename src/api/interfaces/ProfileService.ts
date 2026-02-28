import type { ProfileDTO } from '@/types';

export interface ProfileService {
  getProfile(uid: string): Promise<ProfileDTO | null>;
  upsertProfile(profile: ProfileDTO): Promise<ProfileDTO>;
}
