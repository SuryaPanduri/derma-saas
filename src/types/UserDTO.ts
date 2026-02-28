export interface UserDTO {
  id: string;
  email: string;
  role: 'admin' | 'customer';
  createdAt: string;
  lastLoginAt: string;
}
