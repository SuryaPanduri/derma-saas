export interface ServiceDTO {
  id: string;
  clinicId: string;
  name: string;
  description: string;
  category: string;
  durationMinutes: number;
  priceCents: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
