import type { AuthService } from '@/api/interfaces';
import type { UserDTO } from '@/types';
import { axiosInstance } from './axiosInstance';

export class ExpressAuthService implements AuthService {
  async signIn(email: string, password: string): Promise<UserDTO> {
    const response = await axiosInstance.post<UserDTO>('/auth/sign-in', { email, password });
    return response.data;
  }

  async signUp(email: string, password: string, role: 'admin' | 'customer'): Promise<UserDTO> {
    const response = await axiosInstance.post<UserDTO>('/auth/sign-up', { email, password, role });
    return response.data;
  }

  async signOut(): Promise<void> {
    await axiosInstance.post('/auth/sign-out');
  }

  async getCurrentUser(): Promise<UserDTO | null> {
    const response = await axiosInstance.get<UserDTO | null>('/auth/me');
    return response.data;
  }
}
