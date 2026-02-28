import type { BookingService } from '@/api/interfaces';
import type { AppointmentDTO, CreateAppointmentInputDTO } from '@/types';
import { axiosInstance } from './axiosInstance';

export class ExpressBookingService implements BookingService {
  async createAppointment(input: CreateAppointmentInputDTO): Promise<AppointmentDTO> {
    const response = await axiosInstance.post<AppointmentDTO>('/appointments', input);
    return response.data;
  }

  async listAppointmentsByUser(patientUid: string): Promise<AppointmentDTO[]> {
    const response = await axiosInstance.get<AppointmentDTO[]>(`/appointments/user/${patientUid}`);
    return response.data;
  }

  async listAppointmentsByClinic(clinicId: string): Promise<AppointmentDTO[]> {
    const response = await axiosInstance.get<AppointmentDTO[]>(`/appointments/clinic/${clinicId}`);
    return response.data;
  }

  async cancelAppointment(appointmentId: string, patientUid: string): Promise<AppointmentDTO> {
    const response = await axiosInstance.patch<AppointmentDTO>(`/appointments/${appointmentId}/cancel`, { patientUid });
    return response.data;
  }

  async updateAppointmentStatus(
    appointmentId: string,
    status: 'completed' | 'cancelled'
  ): Promise<AppointmentDTO> {
    const response = await axiosInstance.patch<AppointmentDTO>(`/appointments/${appointmentId}/status`, { status });
    return response.data;
  }
}
