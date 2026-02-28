import { toISO } from '@/api/dto/normalizers';
import type {
  AppointmentDTO,
  BookingTrendDTO,
  OrderDTO,
  ProductDTO,
  ProfileDTO,
  RevenueSummaryDTO,
  ServiceDTO,
  SlotDTO,
  UserDTO
} from '@/types';

export const mapUserDoc = (id: string, data: Record<string, unknown>): UserDTO => ({
  id,
  email: String(data.email ?? ''),
  role: data.role === 'admin' ? 'admin' : 'customer',
  createdAt: toISO(data.createdAt),
  lastLoginAt: toISO(data.lastLoginAt)
});

export const mapProfileDoc = (uid: string, data: Record<string, unknown>): ProfileDTO => ({
  uid,
  clinicId: String(data.clinicId ?? ''),
  fullName: String(data.fullName ?? ''),
  phone: String(data.phone ?? ''),
  dateOfBirth: toISO(data.dateOfBirth),
  gender: String(data.gender ?? ''),
  skinType: String(data.skinType ?? ''),
  allergies: Array.isArray(data.allergies) ? data.allergies.map(String) : [],
  createdAt: toISO(data.createdAt),
  updatedAt: toISO(data.updatedAt)
});

export const mapServiceDoc = (id: string, data: Record<string, unknown>): ServiceDTO => ({
  id,
  clinicId: String(data.clinicId ?? ''),
  name: String(data.name ?? ''),
  description: String(data.description ?? ''),
  category: String(data.category ?? ''),
  durationMinutes: Number(data.durationMinutes ?? 0),
  priceCents: Number(data.priceCents ?? 0),
  isActive: Boolean(data.isActive),
  createdAt: toISO(data.createdAt),
  updatedAt: toISO(data.updatedAt)
});

export const mapProductDoc = (id: string, data: Record<string, unknown>): ProductDTO => ({
  id,
  clinicId: String(data.clinicId ?? ''),
  name: String(data.name ?? ''),
  description: String(data.description ?? ''),
  sku: String(data.sku ?? ''),
  stock: Number(data.stock ?? 0),
  priceCents: Number(data.priceCents ?? 0),
  isActive: Boolean(data.isActive),
  imageUrl: String(data.imageUrl ?? ''),
  createdAt: toISO(data.createdAt),
  updatedAt: toISO(data.updatedAt)
});

export const mapAppointmentDoc = (id: string, data: Record<string, unknown>): AppointmentDTO => ({
  id,
  patientUid: String(data.patientUid ?? ''),
  clinicId: String(data.clinicId ?? ''),
  serviceId: String(data.serviceId ?? ''),
  serviceName: String(data.serviceName ?? ''),
  dateISO: String(data.dateISO ?? ''),
  timeSlot: String(data.timeSlot ?? ''),
  status: data.status === 'completed' || data.status === 'cancelled' ? data.status : 'scheduled',
  notes: String(data.notes ?? ''),
  createdAt: toISO(data.createdAt),
  updatedAt: toISO(data.updatedAt)
});

export const mapSlotDoc = (dateISO: string, timeSlot: string, data: Record<string, unknown>): SlotDTO => ({
  dateISO,
  timeSlot,
  isBooked: Boolean(data.isBooked),
  appointmentId: data.appointmentId ? String(data.appointmentId) : null
});

export const mapOrderDoc = (id: string, data: Record<string, unknown>): OrderDTO => ({
  id,
  patientUid: String(data.patientUid ?? ''),
  clinicId: String(data.clinicId ?? ''),
  items: Array.isArray(data.items)
    ? data.items.map((item) => ({
        productId: String((item as Record<string, unknown>).productId ?? ''),
        name: String((item as Record<string, unknown>).name ?? ''),
        quantity: Number((item as Record<string, unknown>).quantity ?? 0),
        unitPriceCents: Number((item as Record<string, unknown>).unitPriceCents ?? 0)
      }))
    : [],
  subtotalCents: Number(data.subtotalCents ?? 0),
  discountCents: Number(data.discountCents ?? 0),
  couponCode: data.couponCode ? String(data.couponCode) : null,
  totalCents: Number(data.totalCents ?? 0),
  status: data.status === 'paid' || data.status === 'failed' || data.status === 'cancelled' ? data.status : 'pending',
  createdAt: toISO(data.createdAt),
  updatedAt: toISO(data.updatedAt)
});

export const buildRevenueSummary = (
  periodStartISO: string,
  periodEndISO: string,
  orders: OrderDTO[],
  appointments: AppointmentDTO[]
): RevenueSummaryDTO => {
  const totalRevenueCents = orders.filter((order) => order.status === 'paid').reduce((sum, order) => sum + order.totalCents, 0);
  const totalOrders = orders.length;
  return {
    periodStartISO,
    periodEndISO,
    totalRevenueCents,
    totalOrders,
    totalAppointments: appointments.length,
    averageOrderValueCents: totalOrders ? Math.floor(totalRevenueCents / totalOrders) : 0
  };
};

export const buildBookingTrend = (appointments: AppointmentDTO[]): BookingTrendDTO[] => {
  const groups = new Map<string, BookingTrendDTO>();

  appointments.forEach((appointment) => {
    const current = groups.get(appointment.dateISO) ?? {
      dateISO: appointment.dateISO,
      totalBookings: 0,
      completedBookings: 0,
      cancelledBookings: 0
    };

    current.totalBookings += 1;
    if (appointment.status === 'completed') {
      current.completedBookings += 1;
    }
    if (appointment.status === 'cancelled') {
      current.cancelledBookings += 1;
    }

    groups.set(appointment.dateISO, current);
  });

  return [...groups.values()].sort((a, b) => a.dateISO.localeCompare(b.dateISO));
};
