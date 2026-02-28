export interface RevenueSummaryDTO {
  periodStartISO: string;
  periodEndISO: string;
  totalRevenueCents: number;
  totalOrders: number;
  totalAppointments: number;
  averageOrderValueCents: number;
}
