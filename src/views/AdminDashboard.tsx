import { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  useEnquiries,
  useClinicBookings,
  useClinicOrders,
  useProducts,
  useServices,
  useSlotManagement,
  useUpdateAppointmentStatus,
  useUpsertProduct,
  useUpsertService,
  useUpsertSlotManagement
} from '@/hooks';
import { useAuthStore } from '@/store';
import { ErrorState } from '@/components/shared/ErrorState';
import { EmptyState } from '@/components/shared/EmptyState';
import { formatDateLabel, nowISO } from '@/utils/dateUtils';
import { formatMoney } from '@/utils/moneyUtils';
import { LOW_STOCK_THRESHOLD } from '@/utils/constants';
import type { ProductDTO, ServiceDTO, SlotDateOverrideDTO, WeekdayKey } from '@/types';
import {
  Activity,
  Bell,
  CalendarClock,
  ClipboardList,
  LayoutDashboard,
  Mail,
  Package,
  TrendingUp,
  Wrench,
  UserCircle2
} from 'lucide-react';

const emptyServiceForm = {
  id: '',
  name: '',
  category: '',
  description: '',
  durationMinutes: '30',
  priceCents: '10000'
};

const emptyProductForm = {
  id: '',
  name: '',
  sku: '',
  description: '',
  stock: '20',
  priceCents: '3000'
};

const weekdayLabels: { key: WeekdayKey; label: string }[] = [
  { key: 'sun', label: 'Sunday' },
  { key: 'mon', label: 'Monday' },
  { key: 'tue', label: 'Tuesday' },
  { key: 'wed', label: 'Wednesday' },
  { key: 'thu', label: 'Thursday' },
  { key: 'fri', label: 'Friday' },
  { key: 'sat', label: 'Saturday' }
];

const emptyWeeklySlotInputs: Record<WeekdayKey, string> = {
  sun: '',
  mon: '',
  tue: '',
  wed: '',
  thu: '',
  fri: '',
  sat: ''
};

type AdminTab = 'Dashboard' | 'Appointments' | 'Orders' | 'Enquiries' | 'Catalog' | 'Alerts' | 'Revenue';

const statusBadgeClass = (status: string) => {
  if (status === 'completed' || status === 'paid') {
    return 'bg-emerald-50 text-emerald-700 border-emerald-100';
  }
  if (status === 'cancelled') {
    return 'bg-rose-50 text-rose-700 border-rose-100';
  }
  return 'bg-teal-50 text-teal-700 border-teal-100';
};

export const AdminDashboard = ({ clinicId, onSignOut }: { clinicId: string; onSignOut: () => void }) => {
  const user = useAuthStore((state) => state.user);
  const [adminTab, setAdminTab] = useState<AdminTab>('Dashboard');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [hoveredTrendDate, setHoveredTrendDate] = useState<string | null>(null);
  const [appointmentsPage, setAppointmentsPage] = useState(1);
  const [ordersPage, setOrdersPage] = useState(1);
  const [upcomingPage, setUpcomingPage] = useState(1);
  const [paymentPage, setPaymentPage] = useState(1);
  const [revenueOrdersPage, setRevenueOrdersPage] = useState(1);

  const servicesQuery = useServices(clinicId);
  const productsQuery = useProducts(clinicId);
  const clinicBookingsQuery = useClinicBookings(clinicId);
  const clinicOrdersQuery = useClinicOrders(clinicId);
  const enquiriesQuery = useEnquiries(clinicId);
  const slotManagementQuery = useSlotManagement(clinicId);
  const upsertService = useUpsertService();
  const upsertProduct = useUpsertProduct();
  const upsertSlotManagement = useUpsertSlotManagement();
  const updateAppointmentStatus = useUpdateAppointmentStatus();

  const [serviceForm, setServiceForm] = useState(emptyServiceForm);
  const [productForm, setProductForm] = useState(emptyProductForm);
  const [weeklySlotInputs, setWeeklySlotInputs] = useState<Record<WeekdayKey, string>>(emptyWeeklySlotInputs);
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [blockedDateInput, setBlockedDateInput] = useState('');
  const [overrideDateInput, setOverrideDateInput] = useState('');
  const [overrideSlotsInput, setOverrideSlotsInput] = useState('');
  const [overrideClosed, setOverrideClosed] = useState(false);
  const [overrides, setOverrides] = useState<SlotDateOverrideDTO[]>([]);
  const [statusMessage, setStatusMessage] = useState('');

  const isAdmin = user?.role === 'admin';

  const isDashboardLoading = clinicBookingsQuery.isLoading || clinicOrdersQuery.isLoading;
  const hasDashboardError = clinicBookingsQuery.error || clinicOrdersQuery.error;

  const bookings = clinicBookingsQuery.data;
  const orders = clinicOrdersQuery.data;

  const totalOrders = orders.length;
  const totalAppointments = bookings.length;

  const upcomingAppointments = useMemo(() => {
    const now = new Date();
    const inThirtyDays = new Date();
    inThirtyDays.setDate(now.getDate() + 30);

    return bookings
      .filter((appointment) => {
        const appointmentDate = new Date(appointment.dateISO);
        return appointmentDate >= now && appointmentDate <= inThirtyDays;
      })
      .sort((a, b) => a.dateISO.localeCompare(b.dateISO))
      .slice(0, 10);
  }, [bookings]);

  const bookingTrend = useMemo(() => {
    const grouped = new Map<string, { total: number; completed: number; cancelled: number }>();

    bookings.forEach((appointment) => {
      const current = grouped.get(appointment.dateISO) ?? { total: 0, completed: 0, cancelled: 0 };
      current.total += 1;
      if (appointment.status === 'completed') {
        current.completed += 1;
      }
      if (appointment.status === 'cancelled') {
        current.cancelled += 1;
      }
      grouped.set(appointment.dateISO, current);
    });

    return [...grouped.entries()]
      .map(([dateISO, value]) => ({ dateISO, ...value }))
      .sort((a, b) => a.dateISO.localeCompare(b.dateISO))
      .slice(-14);
  }, [bookings]);
  const bookingTrendSummary = useMemo(() => {
    const last14 = bookingTrend;
    const total = last14.reduce((sum, point) => sum + point.total, 0);
    const completed = last14.reduce((sum, point) => sum + point.completed, 0);
    const cancelled = last14.reduce((sum, point) => sum + point.cancelled, 0);
    const completionRate = total ? Math.round((completed / total) * 100) : 0;
    const cancellationRate = total ? Math.round((cancelled / total) * 100) : 0;
    const busiestDay = last14.reduce<(typeof last14)[number] | null>(
      (current, point) => (current === null || point.total > current.total ? point : current),
      null
    );

    return {
      total,
      completed,
      cancelled,
      completionRate,
      cancellationRate,
      busiestDay
    };
  }, [bookingTrend]);

  const topLowStock = useMemo(
    () => [...productsQuery.data].sort((a, b) => a.stock - b.stock).slice(0, 3),
    [productsQuery.data]
  );
  const outOfStockProducts = useMemo(() => productsQuery.data.filter((product) => product.stock <= 0), [productsQuery.data]);
  const lowStockProducts = useMemo(
    () => productsQuery.data.filter((product) => product.stock > 0 && product.stock <= LOW_STOCK_THRESHOLD),
    [productsQuery.data]
  );

  const recentAppointments = useMemo(() => [...bookings].sort((a, b) => b.createdAt.localeCompare(a.createdAt)), [bookings]);

  const recentOrders = useMemo(() => [...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)), [orders]);
  const recentEnquiries = useMemo(
    () => [...enquiriesQuery.data].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [enquiriesQuery.data]
  );
  const completedOrders = useMemo(
    () => [...orders].filter((order) => order.status === 'paid').sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [orders]
  );
  const completedServices = useMemo(
    () =>
      [...bookings]
        .filter((appointment) => appointment.status === 'completed')
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [bookings]
  );
  const servicesRevenueBreakdown = useMemo(() => {
    const priceByServiceId = new Map(servicesQuery.data.map((service) => [service.id, service.priceCents]));
    const grouped = new Map<string, { serviceId: string; serviceName: string; count: number; revenueCents: number }>();

    completedServices.forEach((appointment) => {
      const key = `${appointment.serviceId}:${appointment.serviceName}`;
      const current = grouped.get(key) ?? {
        serviceId: appointment.serviceId,
        serviceName: appointment.serviceName,
        count: 0,
        revenueCents: 0
      };
      current.count += 1;
      current.revenueCents += priceByServiceId.get(appointment.serviceId) ?? 0;
      grouped.set(key, current);
    });

    return [...grouped.values()].sort((a, b) => b.revenueCents - a.revenueCents || b.count - a.count);
  }, [completedServices, servicesQuery.data]);
  const ordersRevenueCents = useMemo(() => completedOrders.reduce((sum, order) => sum + order.totalCents, 0), [completedOrders]);
  const servicesRevenueCents = useMemo(
    () => servicesRevenueBreakdown.reduce((sum, service) => sum + service.revenueCents, 0),
    [servicesRevenueBreakdown]
  );
  const totalRevenueCents = useMemo(() => ordersRevenueCents + servicesRevenueCents, [ordersRevenueCents, servicesRevenueCents]);

  const APPOINTMENTS_PAGE_SIZE = 8;
  const ORDERS_PAGE_SIZE = 8;
  const UPCOMING_PAGE_SIZE = 5;
  const PAYMENT_PAGE_SIZE = 4;
  const REVENUE_ORDERS_PAGE_SIZE = 6;

  const appointmentsTotalPages = Math.max(1, Math.ceil(recentAppointments.length / APPOINTMENTS_PAGE_SIZE));
  const ordersTotalPages = Math.max(1, Math.ceil(recentOrders.length / ORDERS_PAGE_SIZE));
  const upcomingTotalPages = Math.max(1, Math.ceil(upcomingAppointments.length / UPCOMING_PAGE_SIZE));
  const paymentTotalPages = Math.max(1, Math.ceil(recentOrders.length / PAYMENT_PAGE_SIZE));
  const revenueOrdersTotalPages = Math.max(1, Math.ceil(completedOrders.length / REVENUE_ORDERS_PAGE_SIZE));

  const pagedAppointments = useMemo(
    () => recentAppointments.slice((appointmentsPage - 1) * APPOINTMENTS_PAGE_SIZE, appointmentsPage * APPOINTMENTS_PAGE_SIZE),
    [recentAppointments, appointmentsPage]
  );
  const pagedOrders = useMemo(
    () => recentOrders.slice((ordersPage - 1) * ORDERS_PAGE_SIZE, ordersPage * ORDERS_PAGE_SIZE),
    [recentOrders, ordersPage]
  );
  const pagedUpcomingAppointments = useMemo(
    () => upcomingAppointments.slice((upcomingPage - 1) * UPCOMING_PAGE_SIZE, upcomingPage * UPCOMING_PAGE_SIZE),
    [upcomingAppointments, upcomingPage]
  );
  const pagedPaymentOverview = useMemo(
    () => recentOrders.slice((paymentPage - 1) * PAYMENT_PAGE_SIZE, paymentPage * PAYMENT_PAGE_SIZE),
    [recentOrders, paymentPage]
  );
  const pagedRevenueOrders = useMemo(
    () => completedOrders.slice((revenueOrdersPage - 1) * REVENUE_ORDERS_PAGE_SIZE, revenueOrdersPage * REVENUE_ORDERS_PAGE_SIZE),
    [completedOrders, revenueOrdersPage]
  );

  useEffect(() => {
    if (appointmentsPage > appointmentsTotalPages) setAppointmentsPage(appointmentsTotalPages);
  }, [appointmentsPage, appointmentsTotalPages]);
  useEffect(() => {
    if (ordersPage > ordersTotalPages) setOrdersPage(ordersTotalPages);
  }, [ordersPage, ordersTotalPages]);
  useEffect(() => {
    if (upcomingPage > upcomingTotalPages) setUpcomingPage(upcomingTotalPages);
  }, [upcomingPage, upcomingTotalPages]);
  useEffect(() => {
    if (paymentPage > paymentTotalPages) setPaymentPage(paymentTotalPages);
  }, [paymentPage, paymentTotalPages]);
  useEffect(() => {
    if (revenueOrdersPage > revenueOrdersTotalPages) setRevenueOrdersPage(revenueOrdersTotalPages);
  }, [revenueOrdersPage, revenueOrdersTotalPages]);

  useEffect(() => {
    if (!slotManagementQuery.data) {
      return;
    }
    setWeeklySlotInputs({
      sun: slotManagementQuery.data.weeklySlots.sun.join(', '),
      mon: slotManagementQuery.data.weeklySlots.mon.join(', '),
      tue: slotManagementQuery.data.weeklySlots.tue.join(', '),
      wed: slotManagementQuery.data.weeklySlots.wed.join(', '),
      thu: slotManagementQuery.data.weeklySlots.thu.join(', '),
      fri: slotManagementQuery.data.weeklySlots.fri.join(', '),
      sat: slotManagementQuery.data.weeklySlots.sat.join(', ')
    });
    setBlockedDates(slotManagementQuery.data.blockedDates);
    setOverrides(slotManagementQuery.data.overrides);
  }, [slotManagementQuery.data]);

  const parseSlotInput = (value: string): string[] => {
    return [...new Set(value.split(',').map((slot) => slot.trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  };

  const addBlockedDate = () => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(blockedDateInput)) {
      setStatusMessage('Enter blocked date in YYYY-MM-DD format.');
      return;
    }
    setBlockedDates((current) => [...new Set([...current, blockedDateInput])].sort((a, b) => a.localeCompare(b)));
    setBlockedDateInput('');
  };

  const removeBlockedDate = (dateISO: string) => {
    setBlockedDates((current) => current.filter((item) => item !== dateISO));
  };

  const upsertOverride = () => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(overrideDateInput)) {
      setStatusMessage('Enter override date in YYYY-MM-DD format.');
      return;
    }
    const slots = parseSlotInput(overrideSlotsInput);
    if (!overrideClosed && !slots.length) {
      setStatusMessage('Add at least one slot for an open override day.');
      return;
    }

    setOverrides((current) =>
      [...current.filter((item) => item.dateISO !== overrideDateInput), { dateISO: overrideDateInput, slots, isClosed: overrideClosed }].sort(
        (a, b) => a.dateISO.localeCompare(b.dateISO)
      )
    );
    setOverrideDateInput('');
    setOverrideSlotsInput('');
    setOverrideClosed(false);
  };

  const removeOverride = (dateISO: string) => {
    setOverrides((current) => current.filter((item) => item.dateISO !== dateISO));
  };

  if (!isAdmin) {
    return <ErrorState error={{ code: 'ADMIN_ONLY', message: 'Admin role is required to access this portal.' }} />;
  }

  const submitService = async () => {
    const id = serviceForm.id.trim();
    const now = nowISO();

    if (!id || !serviceForm.name.trim()) {
      setStatusMessage('Service id and name are required.');
      return;
    }

    const payload: ServiceDTO = {
      id,
      clinicId,
      name: serviceForm.name.trim(),
      category: serviceForm.category.trim() || 'General',
      description: serviceForm.description.trim(),
      durationMinutes: Number(serviceForm.durationMinutes),
      priceCents: Number(serviceForm.priceCents),
      isActive: true,
      createdAt: now,
      updatedAt: now
    };

    try {
      await upsertService.mutateAsync(payload);
      setServiceForm(emptyServiceForm);
      setStatusMessage(`Saved service: ${payload.name}`);
    } catch (error) {
      const message =
        typeof error === 'object' && error !== null && 'message' in error
          ? String((error as { message: unknown }).message)
          : 'Failed saving service.';
      setStatusMessage(message);
    }
  };

  const submitProduct = async () => {
    const id = productForm.id.trim();
    const now = nowISO();

    if (!id || !productForm.name.trim() || !productForm.sku.trim()) {
      setStatusMessage('Product id, name, and SKU are required.');
      return;
    }

    const payload: ProductDTO = {
      id,
      clinicId,
      name: productForm.name.trim(),
      sku: productForm.sku.trim(),
      description: productForm.description.trim(),
      stock: Number(productForm.stock),
      priceCents: Number(productForm.priceCents),
      isActive: true,
      imageUrl: '',
      createdAt: now,
      updatedAt: now
    };

    try {
      await upsertProduct.mutateAsync(payload);
      setProductForm(emptyProductForm);
      setStatusMessage(`Saved product: ${payload.name}`);
    } catch (error) {
      const message =
        typeof error === 'object' && error !== null && 'message' in error
          ? String((error as { message: unknown }).message)
          : 'Failed saving product.';
      setStatusMessage(message);
    }
  };

  const submitSlotManagement = async () => {
    const weeklySlots: Record<WeekdayKey, string[]> = {
      sun: parseSlotInput(weeklySlotInputs.sun),
      mon: parseSlotInput(weeklySlotInputs.mon),
      tue: parseSlotInput(weeklySlotInputs.tue),
      wed: parseSlotInput(weeklySlotInputs.wed),
      thu: parseSlotInput(weeklySlotInputs.thu),
      fri: parseSlotInput(weeklySlotInputs.fri),
      sat: parseSlotInput(weeklySlotInputs.sat)
    };

    const now = nowISO();
    try {
      await upsertSlotManagement.mutateAsync({
        clinicId,
        weeklySlots,
        blockedDates: [...new Set(blockedDates)].sort((a, b) => a.localeCompare(b)),
        overrides: [...overrides].sort((a, b) => a.dateISO.localeCompare(b.dateISO)),
        createdAt: slotManagementQuery.data?.createdAt ?? now,
        updatedAt: now
      });
      setStatusMessage('Saved doctor slot management.');
    } catch (error) {
      const message =
        typeof error === 'object' && error !== null && 'message' in error
          ? String((error as { message: unknown }).message)
          : 'Failed saving slot management.';
      setStatusMessage(message);
    }
  };

  const handleStatusUpdate = async (appointmentId: string, status: 'completed' | 'cancelled') => {
    try {
      await updateAppointmentStatus.mutateAsync({ appointmentId, status });
      setStatusMessage(`Appointment marked as ${status}.`);
    } catch (error) {
      const message =
        typeof error === 'object' && error !== null && 'message' in error
          ? String((error as { message: unknown }).message)
          : 'Failed updating appointment status.';
      setStatusMessage(message);
    }
  };

  const adminTabs = [
    { label: 'Dashboard' as const, icon: Activity, hint: 'Overview' },
    { label: 'Revenue' as const, icon: TrendingUp, hint: 'Earnings' },
    { label: 'Appointments' as const, icon: CalendarClock, hint: 'Bookings' },
    { label: 'Orders' as const, icon: ClipboardList, hint: 'Purchases' },
    { label: 'Enquiries' as const, icon: Mail, hint: 'Leads' },
    { label: 'Catalog' as const, icon: Wrench, hint: 'Manage' },
    { label: 'Alerts' as const, icon: Bell, hint: 'Inventory' }
  ];

  const displayName = user?.email ? user.email.split('@')[0] : 'Admin User';
  const Pagination = ({
    page,
    totalPages,
    onPageChange
  }: {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  }) =>
    totalPages > 1 ? (
      <div className="mt-3 flex items-center justify-end gap-2">
        <Button variant="outline" onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page === 1}>
          Prev
        </Button>
        <span className="text-sm text-[#4f666b]">
          {page} / {totalPages}
        </span>
        <Button variant="outline" onClick={() => onPageChange(Math.min(totalPages, page + 1))} disabled={page === totalPages}>
          Next
        </Button>
      </div>
    ) : null;

  return (
    <div className="h-full w-full bg-[#eaf0f2]">
      <div className="grid h-full items-start gap-4 lg:grid-cols-[68px_1fr]">
        <div className="relative hidden self-start lg:sticky lg:top-4 lg:block">
          <aside className="flex h-[calc(100vh-8rem)] flex-col justify-between rounded-3xl border border-[#d5e4e7] bg-white px-2 py-10">
            <div className="flex flex-col items-center gap-3">
              {adminTabs.map((tab) => (
                <button
                  key={`rail-${tab.label}`}
                  onClick={() => setAdminTab(tab.label)}
                  className={`flex h-11 w-11 items-center justify-center rounded-xl transition ${
                    adminTab === tab.label ? 'bg-[#0f4a52] text-white' : 'bg-[#f3f5f6] text-[#4f666b] hover:bg-[#e7eef0]'
                  }`}
                  aria-label={tab.label}
                  title={tab.label}
                >
                  <tab.icon size={18} />
                </button>
              ))}
            </div>
            <div className="flex justify-center">
              <button
                onClick={() => setShowProfileMenu((value) => !value)}
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f3f5f6] text-[#4f666b] transition hover:bg-[#e7eef0]"
                aria-label="Open profile menu"
                title="Profile"
              >
                <UserCircle2 size={18} />
              </button>
            </div>
          </aside>

          {showProfileMenu ? (
            <Card className="absolute bottom-0 left-16 z-20 w-56 border-[#d5e4e7] bg-white p-3 shadow-lg">
              <p className="text-xs uppercase tracking-wider text-[#6b7f83]">Signed in as</p>
              <p className="mt-1 text-sm font-semibold text-[#12353a]">{displayName}</p>
              <p className="text-xs text-[#6b7f83]">{user?.email}</p>
              <Button className="mt-3 w-full bg-[#0f4a52] text-white hover:bg-[#0a3a41]" onClick={onSignOut}>
                Sign out
              </Button>
            </Card>
          ) : null}
        </div>

        <div className="space-y-4">
          <Card className="relative border-[#d5e4e7] bg-white p-4 sm:p-5 md:p-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-[#12353a] sm:text-2xl">The Skin Theory</h2>
                  <p className="text-sm font-semibold uppercase tracking-wider text-[#0f4a52]">Admin Portal</p>
                  <h3 className="text-2xl font-bold text-[#12353a] sm:text-3xl md:text-4xl">Welcome Back, Clinic Admin</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowProfileMenu((value) => !value)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#f3f5f6] text-[#4f666b] transition hover:bg-[#e7eef0] lg:hidden"
                    aria-label="Open admin profile menu"
                  >
                    <UserCircle2 size={18} />
                  </button>
                  <div className="rounded-xl border border-[#d5e4e7] bg-[#f3f5f6] px-3 py-2 text-xs font-semibold text-[#4f666b]">
                    {formatDateLabel(nowISO())}
                  </div>
                </div>
              </div>

              {showProfileMenu ? (
                <Card className="z-20 w-full border-[#d5e4e7] bg-white p-3 shadow-md lg:hidden">
                  <p className="text-xs uppercase tracking-wider text-[#6b7f83]">Signed in as</p>
                  <p className="mt-1 text-sm font-semibold text-[#12353a]">{displayName}</p>
                  <p className="text-xs text-[#6b7f83]">{user?.email}</p>
                  <Button className="mt-3 w-full bg-[#0f4a52] text-white hover:bg-[#0a3a41]" onClick={onSignOut}>
                    Sign out
                  </Button>
                </Card>
              ) : null}

              <div className="flex gap-2 overflow-x-auto pb-1 md:hidden">
                {adminTabs.map((tab) => (
                  <button
                    key={`mobile-${tab.label}`}
                    onClick={() => setAdminTab(tab.label)}
                    className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                      adminTab === tab.label
                        ? 'border-[#0f4a52] bg-[#0f4a52] text-white'
                        : 'border-[#d5e4e7] bg-[#f7f9fa] text-[#4f666b] hover:bg-[#e7eef0]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="hidden grid-cols-2 gap-2 md:grid md:grid-cols-4">
                {adminTabs.map((tab) => (
                  <button
                    key={tab.label}
                    onClick={() => setAdminTab(tab.label)}
                    className={`rounded-xl border px-3 py-2 text-left transition ${
                      adminTab === tab.label
                        ? 'border-[#0f4a52] bg-[#0f4a52] text-white'
                        : 'border-[#d5e4e7] bg-[#f7f9fa] text-[#4f666b] hover:bg-[#e7eef0]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <tab.icon size={16} />
                      <span className="text-sm font-semibold sm:text-base">{tab.label}</span>
                    </div>
                    <p className={`mt-0.5 text-sm ${adminTab === tab.label ? 'text-[#dbe8ea]' : 'text-[#6b7f83]'}`}>{tab.hint}</p>
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {adminTab === 'Dashboard' ? (
            <>
              {isDashboardLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-72 w-full" />
                </div>
              ) : hasDashboardError ? (
                <ErrorState
                  error={{
                    code: 'ADMIN_DASHBOARD_FAILED',
                    message:
                      typeof hasDashboardError === 'object' && hasDashboardError !== null && 'message' in hasDashboardError
                        ? String((hasDashboardError as { message: unknown }).message)
                        : 'Unable to load dashboard data.'
                  }}
                />
              ) : (
                <>
                  <section className="grid gap-4 lg:grid-cols-12">
                    <Card className="border-[#d5e4e7] bg-white p-6 lg:col-span-3">
                      <div className="space-y-4">
                        <div className="rounded-2xl bg-[#0f4a52] p-4 text-white">
                          <p className="text-sm uppercase tracking-wider text-[#cce2e5]">Revenue</p>
                          <h3 className="mt-2 text-4xl font-extrabold">{formatMoney(totalRevenueCents)}</h3>
                          <p className="mt-2 text-sm text-[#cce2e5]">Paid orders total</p>
                        </div>
                        <div className="rounded-2xl border border-[#d5e4e7] bg-[#f7f9fa] p-4">
                          <p className="text-sm uppercase tracking-wider text-[#4f666b]">Orders</p>
                          <div className="mt-2 flex items-center justify-between">
                            <h4 className="text-4xl font-bold text-[#12353a]">{totalOrders}</h4>
                            <Package size={20} className="text-[#0f4a52]" />
                          </div>
                        </div>
                        <div className="rounded-2xl border border-[#d5e4e7] bg-[#f7f9fa] p-4">
                          <p className="text-sm uppercase tracking-wider text-[#4f666b]">Appointments</p>
                          <div className="mt-2 flex items-center justify-between">
                            <h4 className="text-4xl font-bold text-[#12353a]">{totalAppointments}</h4>
                            <CalendarClock size={20} className="text-[#0f4a52]" />
                          </div>
                        </div>
                      </div>
                    </Card>

                    <Card className="border-[#d5e4e7] bg-white p-6 lg:col-span-6">
                      <div className="flex items-center justify-between">
                        <h3 className="flex items-center gap-2 text-lg font-bold text-[#12353a]">
                          <TrendingUp size={18} className="text-[#0f4a52]" />
                          Booking Trend
                        </h3>
                        <span className="rounded-full bg-[#e7eef0] px-3 py-1 text-xs font-semibold text-[#4f666b]">Last 14 days</span>
                      </div>
                      {!bookingTrend.length ? (
                        <div className="mt-4">
                          <EmptyState title="No Trend Data" subtitle="Bookings are needed to render trend metrics." />
                        </div>
                      ) : (
                        <div className="mt-4 space-y-4">
                          <div className="overflow-x-auto">
                            <div className="grid min-w-[520px] grid-cols-7 gap-3">
                            {bookingTrend.slice(-7).map((point) => {
                              const barHeight = Math.max(16, Math.min(120, point.total * 22));
                              const isHovered = hoveredTrendDate === point.dateISO;
                              return (
                                <div key={point.dateISO} className="relative flex flex-col items-center gap-2">
                                  {isHovered ? (
                                    <div className="pointer-events-none absolute -top-20 z-10 w-40 rounded-lg border border-[#d5e4e7] bg-white/95 px-3 py-2 text-xs shadow-lg backdrop-blur">
                                      <p className="font-semibold text-[#12353a]">{formatDateLabel(point.dateISO)}</p>
                                      <p className="mt-1 text-emerald-700">{point.completed} completed</p>
                                      <p className="text-rose-700">{point.cancelled} cancelled</p>
                                    </div>
                                  ) : null}
                                  <div
                                    className="flex h-32 w-full cursor-default items-end justify-center rounded-xl bg-[#f3f5f6]"
                                    onMouseEnter={() => setHoveredTrendDate(point.dateISO)}
                                    onMouseLeave={() => setHoveredTrendDate((current) => (current === point.dateISO ? null : current))}
                                  >
                                    <div className="w-6 rounded-t-full bg-[#0f4a52]" style={{ height: `${barHeight}px` }} />
                                  </div>
                                  <span className="text-[11px] font-semibold text-[#6b7f83]">{formatDateLabel(point.dateISO)}</span>
                                </div>
                              );
                            })}
                            </div>
                          </div>

                          <div className="rounded-2xl border border-[#d5e4e7] bg-[#f7f9fa] p-3">
                            <p className="text-xs font-semibold uppercase tracking-wider text-[#4f666b]">Quick Analytics (Last 14 Days)</p>
                            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                              <div className="rounded-xl bg-white px-3 py-2">
                                <p className="text-xs text-[#6b7f83]">Total Bookings</p>
                                <p className="text-lg font-bold text-[#12353a]">{bookingTrendSummary.total}</p>
                              </div>
                              <div className="rounded-xl bg-white px-3 py-2">
                                <p className="text-xs text-[#6b7f83]">Completed / Cancelled</p>
                                <p className="text-lg font-bold text-[#12353a]">
                                  {bookingTrendSummary.completed} / {bookingTrendSummary.cancelled}
                                </p>
                              </div>
                              <div className="rounded-xl bg-white px-3 py-2">
                                <p className="text-xs text-[#6b7f83]">Completion Rate</p>
                                <p className="text-lg font-bold text-[#12353a]">{bookingTrendSummary.completionRate}%</p>
                              </div>
                              <div className="rounded-xl bg-white px-3 py-2">
                                <p className="text-xs text-[#6b7f83]">Cancellation Rate</p>
                                <p className="text-lg font-bold text-[#12353a]">{bookingTrendSummary.cancellationRate}%</p>
                              </div>
                              <div className="rounded-xl bg-white px-3 py-2 sm:col-span-2 lg:col-span-2">
                                <p className="text-xs text-[#6b7f83]">Busiest Day</p>
                                <p className="text-lg font-bold text-[#12353a]">
                                  {bookingTrendSummary.busiestDay
                                    ? `${formatDateLabel(bookingTrendSummary.busiestDay.dateISO)} (${bookingTrendSummary.busiestDay.total})`
                                    : 'N/A'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </Card>

                    <Card className="border-[#d5e4e7] bg-white p-6 lg:col-span-3">
                      <div className="rounded-2xl border border-[#d5e4e7] bg-[#f7f9fa] p-4">
                        <p className="text-sm uppercase tracking-wider text-[#4f666b]">Credit Amount</p>
                        <div className="mt-2 flex items-center justify-between">
                          <p className="text-5xl font-bold text-[#12353a]">{formatMoney(totalRevenueCents)}</p>
                        </div>
                      </div>
                      <div className="mt-3 rounded-2xl border border-[#d5e4e7] bg-[#f7f9fa] p-4">
                        <h3 className="flex items-center gap-2 text-sm font-bold text-[#12353a]">
                          <Bell size={16} className="text-[#0f4a52]" />
                          Inventory Alerts
                        </h3>
                        {productsQuery.isLoading ? (
                          <div className="mt-3 space-y-2">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                          </div>
                        ) : productsQuery.error ? (
                          <p className="mt-3 text-sm text-rose-700">Unable to load product notifications.</p>
                        ) : !outOfStockProducts.length && !lowStockProducts.length ? (
                          <p className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                            No inventory alerts.
                          </p>
                        ) : (
                          <div className="mt-3 space-y-2">
                            {outOfStockProducts.slice(0, 2).map((product) => (
                              <div key={product.id} className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs">
                                <p className="font-semibold text-rose-700">{product.name}</p>
                                <p className="text-rose-600">Stock {product.stock}</p>
                              </div>
                            ))}
                            {lowStockProducts.slice(0, 2).map((product) => (
                              <div key={product.id} className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs">
                                <p className="font-semibold text-amber-700">{product.name}</p>
                                <p className="text-amber-700">
                                  Remaining {product.stock} (threshold {LOW_STOCK_THRESHOLD})
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </Card>
                  </section>

                  <div className="grid gap-4 lg:grid-cols-2">
                    <Card className="border-[#d5e4e7] bg-white p-5">
                      <h3 className="flex items-center gap-2 text-lg font-bold text-[#12353a]">
                        <CalendarClock size={18} className="text-[#0f4a52]" />
                        Upcoming Appointments
                      </h3>
                      <p className="text-sm text-[#6b7f83]">Next 30 days</p>
                      {!upcomingAppointments.length ? (
                        <div className="mt-4">
                          <EmptyState title="No Upcoming Appointments" subtitle="New bookings will appear here." />
                        </div>
                      ) : (
                        <div className="mt-4 grid gap-2">
                          {pagedUpcomingAppointments.map((appointment) => (
                            <div key={appointment.id} className="rounded-xl border border-[#d5e4e7] bg-[#f7f9fa] px-3 py-2.5 text-sm">
                              <p className="font-semibold text-[#12353a]">{appointment.serviceName}</p>
                              <p className="text-[#4f666b]">
                                {appointment.dateISO} at {appointment.timeSlot}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                      <Pagination page={upcomingPage} totalPages={upcomingTotalPages} onPageChange={setUpcomingPage} />
                    </Card>

                    <Card className="border-[#d5e4e7] bg-white p-5">
                      <h3 className="flex items-center gap-2 text-lg font-bold text-[#12353a]">
                        <LayoutDashboard size={18} className="text-[#0f4a52]" />
                        Payment Overview
                      </h3>
                      <p className="text-sm text-[#6b7f83]">Recent orders and performance</p>
                      {!recentOrders.length ? (
                        <div className="mt-4">
                          <EmptyState title="No Orders Yet" subtitle="Payment metrics will appear here." />
                        </div>
                      ) : (
                        <div className="mt-4 space-y-2">
                          {pagedPaymentOverview.map((order) => (
                            <div key={order.id} className="flex items-center justify-between rounded-xl border border-[#d5e4e7] bg-[#f7f9fa] px-3 py-2">
                              <div>
                                <p className="text-sm font-semibold text-[#12353a]">Order {order.id.slice(0, 8)}...</p>
                                <p className="text-xs text-[#6b7f83]">{formatDateLabel(order.createdAt)}</p>
                              </div>
                              <p className="text-sm font-semibold text-[#0f4a52]">{formatMoney(order.totalCents)}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      <Pagination page={paymentPage} totalPages={paymentTotalPages} onPageChange={setPaymentPage} />
                    </Card>
                  </div>
                </>
              )}
            </>
          ) : null}

          {adminTab === 'Alerts' ? (
            <Card className="border-[#d5e4e7] bg-white p-5 md:p-6">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-amber-100 p-2 text-amber-700">
                  <Bell size={20} />
                </div>
                <div className="w-full">
                  <h3 className="text-2xl font-bold text-[#12353a]">Complete Inventory Notifications</h3>
                  <p className="text-base text-[#4f666b]">Out-of-stock and low-stock alerts based on current inventory.</p>
                  {productsQuery.isLoading ? (
                    <div className="mt-4 space-y-2">
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                    </div>
                  ) : productsQuery.error ? (
                    <p className="mt-4 text-sm text-rose-700">Unable to load product notifications.</p>
                  ) : !outOfStockProducts.length && !lowStockProducts.length ? (
                    <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                      No inventory alerts. All tracked products have healthy stock.
                    </p>
                  ) : (
                    <div className="mt-4 space-y-3">
                      {outOfStockProducts.map((product) => (
                        <div key={product.id} className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
                          <p className="text-base font-semibold text-rose-700">Out of stock: {product.name}</p>
                          <p className="text-sm text-rose-600">SKU {product.sku} | Stock {product.stock}</p>
                        </div>
                      ))}
                      {lowStockProducts.map((product) => (
                        <div key={product.id} className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                          <p className="text-base font-semibold text-amber-700">Low stock: {product.name}</p>
                          <p className="text-sm text-amber-700">
                            SKU {product.sku} | Remaining {product.stock} (threshold {LOW_STOCK_THRESHOLD})
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ) : null}

          {adminTab === 'Revenue' ? (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-[#d5e4e7] bg-white p-5">
                  <p className="text-sm uppercase tracking-wider text-[#4f666b]">Orders Revenue Received</p>
                  <p className="mt-2 text-3xl font-bold text-[#0f4a52]">{formatMoney(ordersRevenueCents)}</p>
                </Card>
                <Card className="border-[#d5e4e7] bg-white p-5">
                  <p className="text-sm uppercase tracking-wider text-[#4f666b]">Services Revenue Received</p>
                  <p className="mt-2 text-3xl font-bold text-[#0f4a52]">{formatMoney(servicesRevenueCents)}</p>
                </Card>
                <Card className="border-[#d5e4e7] bg-white p-5">
                  <p className="text-sm uppercase tracking-wider text-[#4f666b]">Total Revenue Received</p>
                  <p className="mt-2 text-3xl font-bold text-[#12353a]">{formatMoney(totalRevenueCents)}</p>
                </Card>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
              <Card className="border-[#d5e4e7] bg-white p-5 md:p-6">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-[#12353a]">Completed Orders</h3>
                  <span className="rounded-full bg-[#e7eef0] px-3 py-1 text-xs font-semibold text-[#4f666b]">
                    {completedOrders.length} orders
                  </span>
                </div>
                {!completedOrders.length ? (
                  <EmptyState title="No Completed Orders" subtitle="Paid orders will appear here." />
                ) : (
                  <div className="space-y-2">
                    {pagedRevenueOrders.map((order) => (
                      <div key={order.id} className="rounded-xl border border-[#d5e4e7] bg-[#f7f9fa] px-4 py-3">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-[#12353a]">Order {order.id.slice(0, 8)}...</p>
                          <p className="text-sm font-semibold text-[#0f4a52]">{formatMoney(order.totalCents)}</p>
                        </div>
                        <p className="mt-1 text-xs text-[#6b7f83]">{formatDateLabel(order.createdAt)}</p>
                        <p className="mt-1 text-xs text-[#4f666b]">{order.items.map((i) => `${i.name} x${i.quantity}`).join(', ')}</p>
                      </div>
                    ))}
                  </div>
                )}
                <Pagination page={revenueOrdersPage} totalPages={revenueOrdersTotalPages} onPageChange={setRevenueOrdersPage} />
              </Card>

              <Card className="border-[#d5e4e7] bg-white p-5 md:p-6">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-[#12353a]">Completed Services</h3>
                  <span className="rounded-full bg-[#e7eef0] px-3 py-1 text-xs font-semibold text-[#4f666b]">
                    {completedServices.length} services
                  </span>
                </div>
                {!servicesRevenueBreakdown.length ? (
                  <EmptyState title="No Completed Services" subtitle="Completed appointments will appear here." />
                ) : (
                  <div className="space-y-2">
                    {servicesRevenueBreakdown.map((service) => (
                      <div key={`${service.serviceId}-${service.serviceName}`} className="rounded-xl border border-[#d5e4e7] bg-[#f7f9fa] px-4 py-3">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-[#12353a]">{service.serviceName}</p>
                          <p className="text-sm font-semibold text-[#0f4a52]">{formatMoney(service.revenueCents)}</p>
                        </div>
                        <p className="mt-1 text-xs text-[#6b7f83]">Completed: {service.count}</p>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
              </div>
            </div>
          ) : null}

          {adminTab === 'Appointments' ? (
        <Card className="border-[#d5e4e7] bg-white p-5">
          <h3 className="text-xl font-bold text-slate-800">Recent Appointments</h3>
          {clinicBookingsQuery.isLoading ? (
            <div className="mt-4 space-y-2">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          ) : clinicBookingsQuery.error ? (
            <div className="mt-4">
              <ErrorState
                error={{
                  code: 'APPOINTMENTS_LOAD_FAILED',
                  message:
                    typeof clinicBookingsQuery.error === 'object' && clinicBookingsQuery.error !== null && 'message' in clinicBookingsQuery.error
                      ? String((clinicBookingsQuery.error as { message: unknown }).message)
                      : 'Unable to load appointments.'
                }}
              />
            </div>
          ) : !recentAppointments.length ? (
            <div className="mt-4">
              <EmptyState title="No Appointments" subtitle="Customer bookings will appear here." />
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {pagedAppointments.map((appointment) => (
                <div key={appointment.id} className="rounded-xl border border-[#d5e4e7] bg-[#f7f9fa] px-4 py-3 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold text-slate-800">{appointment.serviceName}</p>
                    <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold capitalize ${statusBadgeClass(appointment.status)}`}>
                      {appointment.status}
                    </span>
                  </div>
                  <p className="mt-1 text-slate-600">
                    {appointment.dateISO} at {appointment.timeSlot} | patient: {appointment.patientUid.slice(0, 8)}...
                  </p>
                  {appointment.status === 'scheduled' ? (
                    <div className="mt-3 flex gap-2">
                        <Button
                          className="bg-[#0f4a52] text-white hover:bg-[#0a3a41]"
                          onClick={() => handleStatusUpdate(appointment.id, 'completed')}
                          disabled={updateAppointmentStatus.isLoading}
                        >
                          Completed
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleStatusUpdate(appointment.id, 'cancelled')}
                          disabled={updateAppointmentStatus.isLoading}
                        >
                          Cancelled
                        </Button>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
          <Pagination page={appointmentsPage} totalPages={appointmentsTotalPages} onPageChange={setAppointmentsPage} />
        </Card>
          ) : null}

          {adminTab === 'Orders' ? (
        <Card className="border-[#d5e4e7] bg-white p-5">
          <h3 className="text-xl font-bold text-slate-800">Recent Orders</h3>
          {clinicOrdersQuery.isLoading ? (
            <div className="mt-4 space-y-2">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          ) : clinicOrdersQuery.error ? (
            <div className="mt-4">
              <ErrorState
                error={{
                  code: 'ORDERS_LOAD_FAILED',
                  message:
                    typeof clinicOrdersQuery.error === 'object' && clinicOrdersQuery.error !== null && 'message' in clinicOrdersQuery.error
                      ? String((clinicOrdersQuery.error as { message: unknown }).message)
                      : 'Unable to load orders.'
                }}
              />
            </div>
          ) : !recentOrders.length ? (
            <div className="mt-4">
              <EmptyState title="No Orders" subtitle="Customer product orders will appear here." />
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {pagedOrders.map((order) => (
                <div key={order.id} className="rounded-xl border border-[#d5e4e7] bg-[#f7f9fa] px-4 py-3 text-sm">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-slate-800">Order {order.id.slice(0, 8)}...</p>
                    <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold capitalize ${statusBadgeClass(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="mt-1 text-slate-600">Items: {order.items.map((i) => `${i.name} x${i.quantity}`).join(', ')}</p>
                  <p className="mt-1 font-semibold text-teal-700">{formatMoney(order.totalCents)}</p>
                </div>
              ))}
            </div>
          )}
          <Pagination page={ordersPage} totalPages={ordersTotalPages} onPageChange={setOrdersPage} />
        </Card>
          ) : null}

          {adminTab === 'Enquiries' ? (
        <Card className="border-[#d5e4e7] bg-white p-5">
          <h3 className="text-xl font-bold text-slate-800">Customer Enquiries</h3>
          {enquiriesQuery.isLoading ? (
            <div className="mt-4 space-y-2">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          ) : enquiriesQuery.error ? (
            <div className="mt-4">
              <ErrorState
                error={{
                  code: 'ENQUIRIES_LOAD_FAILED',
                  message:
                    typeof enquiriesQuery.error === 'object' && enquiriesQuery.error !== null && 'message' in enquiriesQuery.error
                      ? String((enquiriesQuery.error as { message: unknown }).message)
                      : 'Unable to load enquiries.'
                }}
              />
            </div>
          ) : !recentEnquiries.length ? (
            <div className="mt-4">
              <EmptyState title="No Enquiries" subtitle="New customer enquiries will appear here." />
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {recentEnquiries.map((enquiry) => (
                <div key={enquiry.id} className="rounded-xl border border-[#d5e4e7] bg-[#f7f9fa] px-4 py-3 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold text-slate-800">{enquiry.fullName}</p>
                    <span className="rounded-full border border-[#d5e4e7] bg-white px-2 py-0.5 text-xs font-semibold text-[#4f666b]">
                      {formatDateLabel(enquiry.createdAt)}
                    </span>
                  </div>
                  <p className="mt-1 text-slate-600">Mobile: {enquiry.mobile}</p>
                  <p className="text-slate-600">Email: {enquiry.email}</p>
                  <p className="mt-1 text-xs text-[#6b7f83]">User: {enquiry.patientUid.slice(0, 8)}...</p>
                </div>
              ))}
            </div>
          )}
        </Card>
          ) : null}

          {adminTab === 'Catalog' ? (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="border-[#d5e4e7] bg-white p-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-800">Service Catalog</h3>
                <span className="rounded-full bg-teal-50 px-2 py-1 text-xs font-semibold text-teal-700">{servicesQuery.data.length} active</span>
              </div>
              <div className="space-y-2 text-sm text-slate-600">
                {servicesQuery.data.slice(0, 5).map((service) => (
                  <div key={service.id} className="flex items-center justify-between rounded-lg border border-[#d5e4e7] bg-[#f7f9fa] px-3 py-2">
                    <span>{service.name}</span>
                    <span className="font-semibold text-teal-700">{formatMoney(service.priceCents)}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 space-y-2 border-t border-slate-200 pt-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Create / Update Service</p>
                <Input
                  placeholder="service id (e.g. svc-laser)"
                  value={serviceForm.id}
                  onChange={(e) => setServiceForm((s) => ({ ...s, id: e.target.value }))}
                />
                <Input
                  placeholder="service name"
                  value={serviceForm.name}
                  onChange={(e) => setServiceForm((s) => ({ ...s, name: e.target.value }))}
                />
                <Input
                  placeholder="category"
                  value={serviceForm.category}
                  onChange={(e) => setServiceForm((s) => ({ ...s, category: e.target.value }))}
                />
                <Input
                  placeholder="description"
                  value={serviceForm.description}
                  onChange={(e) => setServiceForm((s) => ({ ...s, description: e.target.value }))}
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="duration (min)"
                    value={serviceForm.durationMinutes}
                    onChange={(e) => setServiceForm((s) => ({ ...s, durationMinutes: e.target.value }))}
                  />
                  <Input
                    placeholder="price (paise)"
                    value={serviceForm.priceCents}
                    onChange={(e) => setServiceForm((s) => ({ ...s, priceCents: e.target.value }))}
                  />
                </div>
                <Button className="bg-[#0f4a52] text-white hover:bg-[#0a3a41]" onClick={submitService} disabled={upsertService.isLoading}>
                  {upsertService.isLoading ? 'Saving...' : 'Save Service'}
                </Button>
              </div>
            </Card>

            <Card className="border-[#d5e4e7] bg-white p-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-800">Product Inventory</h3>
                <span className="rounded-full bg-teal-50 px-2 py-1 text-xs font-semibold text-teal-700">{productsQuery.data.length} active</span>
              </div>
              <div className="space-y-2 text-sm text-slate-600">
                {topLowStock.map((product) => (
                  <div key={product.id} className="flex items-center justify-between rounded-lg border border-[#d5e4e7] bg-[#f7f9fa] px-3 py-2">
                    <span>{product.name}</span>
                    <span className="font-semibold text-rose-700">Stock {product.stock}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 space-y-2 border-t border-slate-200 pt-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Create / Update Product</p>
                <Input
                  placeholder="product id (e.g. prd-new)"
                  value={productForm.id}
                  onChange={(e) => setProductForm((s) => ({ ...s, id: e.target.value }))}
                />
                <Input
                  placeholder="product name"
                  value={productForm.name}
                  onChange={(e) => setProductForm((s) => ({ ...s, name: e.target.value }))}
                />
                <Input placeholder="sku" value={productForm.sku} onChange={(e) => setProductForm((s) => ({ ...s, sku: e.target.value }))} />
                <Input
                  placeholder="description"
                  value={productForm.description}
                  onChange={(e) => setProductForm((s) => ({ ...s, description: e.target.value }))}
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="stock" value={productForm.stock} onChange={(e) => setProductForm((s) => ({ ...s, stock: e.target.value }))} />
                  <Input
                    placeholder="price (paise)"
                    value={productForm.priceCents}
                    onChange={(e) => setProductForm((s) => ({ ...s, priceCents: e.target.value }))}
                  />
                </div>
                <Button className="bg-[#0f4a52] text-white hover:bg-[#0a3a41]" onClick={submitProduct} disabled={upsertProduct.isLoading}>
                  {upsertProduct.isLoading ? 'Saving...' : 'Save Product'}
                </Button>
              </div>
            </Card>
          </div>

          <Card className="border-[#d5e4e7] bg-white p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800">Doctor Slot Management</h3>
              <span className="rounded-full bg-teal-50 px-2 py-1 text-xs font-semibold text-teal-700">
                {slotManagementQuery.data ? 'Configured' : 'Default'}
              </span>
            </div>
            <p className="text-sm text-[#4f666b]">
              Manage weekly availability, blocked dates, and date-specific slot overrides. Booking flow will use this configuration.
            </p>

            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Weekly Slots (comma-separated HH:MM)</p>
                {weekdayLabels.map((day) => (
                  <div key={day.key} className="grid grid-cols-[110px_1fr] items-center gap-2">
                    <span className="text-sm font-semibold text-slate-700">{day.label}</span>
                    <Input
                      value={weeklySlotInputs[day.key]}
                      onChange={(e) => setWeeklySlotInputs((current) => ({ ...current, [day.key]: e.target.value }))}
                      placeholder="09:00, 10:00, 11:00"
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <div className="space-y-2 rounded-xl border border-[#d5e4e7] bg-[#f7f9fa] p-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Blocked Dates</p>
                  <div className="flex gap-2">
                    <Input type="date" value={blockedDateInput} onChange={(e) => setBlockedDateInput(e.target.value)} />
                    <Button variant="outline" onClick={addBlockedDate}>
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {blockedDates.map((dateISO) => (
                      <button
                        key={dateISO}
                        onClick={() => removeBlockedDate(dateISO)}
                        className="rounded-full border border-[#d5e4e7] bg-white px-2 py-1 text-xs font-semibold text-[#4f666b] hover:bg-[#eef3f4]"
                        title="Remove blocked date"
                      >
                        {dateISO} x
                      </button>
                    ))}
                    {!blockedDates.length ? <p className="text-xs text-slate-500">No blocked dates.</p> : null}
                  </div>
                </div>

                <div className="space-y-2 rounded-xl border border-[#d5e4e7] bg-[#f7f9fa] p-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Date Override</p>
                  <Input type="date" value={overrideDateInput} onChange={(e) => setOverrideDateInput(e.target.value)} />
                  <Input
                    value={overrideSlotsInput}
                    onChange={(e) => setOverrideSlotsInput(e.target.value)}
                    placeholder="08:00, 09:30, 10:00"
                    disabled={overrideClosed}
                  />
                  <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                    <input type="checkbox" checked={overrideClosed} onChange={(e) => setOverrideClosed(e.target.checked)} />
                    Mark this date as closed
                  </label>
                  <div className="flex justify-end">
                    <Button variant="outline" onClick={upsertOverride}>
                      Save Override
                    </Button>
                  </div>
                  <div className="space-y-1">
                    {overrides.map((override) => (
                      <div
                        key={override.dateISO}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#d5e4e7] bg-white px-2 py-1.5 text-xs"
                      >
                        <p className="font-semibold text-[#12353a]">
                          {override.dateISO} - {override.isClosed ? 'Closed' : override.slots.join(', ')}
                        </p>
                        <button className="font-semibold text-rose-700" onClick={() => removeOverride(override.dateISO)}>
                          Remove
                        </button>
                      </div>
                    ))}
                    {!overrides.length ? <p className="text-xs text-slate-500">No overrides configured.</p> : null}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <Button
                className="bg-[#0f4a52] text-white hover:bg-[#0a3a41]"
                onClick={submitSlotManagement}
                disabled={upsertSlotManagement.isLoading}
              >
                {upsertSlotManagement.isLoading ? 'Saving...' : 'Save Slot Management'}
              </Button>
            </div>
          </Card>

          {statusMessage ? (
            <Card className="border-teal-200 bg-teal-50 p-3">
              <p className="text-sm font-medium text-teal-700">{statusMessage}</p>
            </Card>
          ) : null}
        </>
          ) : null}
        </div>
      </div>
    </div>
  );
};
