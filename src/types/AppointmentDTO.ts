export interface AppointmentDTO {
  id: string;
  patientUid: string;
  clinicId: string;
  serviceId: string;
  serviceName: string;
  dateISO: string;
  timeSlot: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface SlotDTO {
  dateISO: string;
  timeSlot: string;
  isBooked: boolean;
  appointmentId: string | null;
}

export interface CreateAppointmentInputDTO {
  patientUid: string;
  clinicId: string;
  serviceId: string;
  serviceName: string;
  dateISO: string;
  timeSlot: string;
  notes: string;
}
