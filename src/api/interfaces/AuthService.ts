import type { UserDTO } from '@/types';

export interface AuthService {
  signIn(email: string, password: string): Promise<UserDTO>;
  signUp(email: string, password: string, role: 'admin' | 'customer'): Promise<UserDTO>;
  signOut(): Promise<void>;
  getCurrentUser(): Promise<UserDTO | null>;
}
