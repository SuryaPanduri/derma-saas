import type { AppointmentDTO, CreateAppointmentInputDTO } from '@/types';

export interface BookingService {
  createAppointment(input: CreateAppointmentInputDTO): Promise<AppointmentDTO>;
  listAppointmentsByUser(patientUid: string): Promise<AppointmentDTO[]>;
  listAppointmentsByClinic(clinicId: string): Promise<AppointmentDTO[]>;
  cancelAppointment(appointmentId: string, patientUid: string): Promise<AppointmentDTO>;
  updateAppointmentStatus(
    appointmentId: string,
    status: 'completed' | 'cancelled'
  ): Promise<AppointmentDTO>;
}
