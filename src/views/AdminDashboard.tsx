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
  UserCircle2,
  LayoutGrid,
  Settings,
  CreditCard,
  LogOut,
  ChevronRight,
  Menu,
  X
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
  return 'bg-[#F5F0EA] text-[#8A6F5F] border-[#D4C8BC]';
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
    { label: 'Dashboard' as const, icon: LayoutDashboard, hint: 'Activity' },
    { label: 'Appointments' as const, icon: CalendarClock, hint: 'Bookings' },
    { label: 'Orders' as const, icon: ClipboardList, hint: 'Purchases' },
    { label: 'Catalog' as const, icon: Wrench, hint: 'Manage' },
    { label: 'Revenue' as const, icon: TrendingUp, hint: 'Earnings' },
    { label: 'Enquiries' as const, icon: Mail, hint: 'Leads' },
    { label: 'Alerts' as const, icon: Bell, hint: 'Inventory' }
  ];

  const secondaryActions = [
    { label: 'Payments' as const, icon: CreditCard, onClick: () => setAdminTab('Revenue') },
    { label: 'Settings' as const, icon: Settings, onClick: () => {} }
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
      <div className="mt-6 flex items-center justify-end gap-3">
        <button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className="flex h-9 items-center gap-2 rounded-xl border border-[#D4C8BC]/40 bg-white px-4 text-xs font-bold text-[#8A6F5F] transition-all hover:bg-[#FAF8F4] disabled:opacity-30"
        >
          Previous
        </button>
        <div className="flex h-9 items-center rounded-xl bg-[#FAF8F4] px-4 text-[10px] font-bold uppercase tracking-widest text-[#8A6F5F]">
          {page} <span className="mx-2 opacity-30">/</span> {totalPages}
        </div>
        <button
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="flex h-9 items-center gap-2 rounded-xl border border-[#D4C8BC]/40 bg-white px-4 text-xs font-bold text-[#8A6F5F] transition-all hover:bg-[#FAF8F4] disabled:opacity-30"
        >
          Next
          <ChevronRight size={14} />
        </button>
      </div>
    ) : null;

  return (
    <div className="min-h-screen w-full bg-[#FDFCFB] text-[#191919]">
      {/* ... keeping previous aside and mobile nav ... */}
      {/* (Skipping to Dashboard section for brevity in this tool call) */}
      {/* --- DESKTOP SIDEBAR --- */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-72 border-r border-[#D4C8BC]/30 bg-white/80 backdrop-blur-2xl lg:block">
        <div className="flex h-full flex-col p-6">
          <div className="mb-10 flex items-center gap-3 px-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#8A6F5F] text-white shadow-lg shadow-[#8A6F5F]/20">
              <Activity size={22} />
            </div>
            <div>
              <h2 className="font-['Playfair_Display'] text-lg font-bold leading-tight">THE SKIN THEORY</h2>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8A6F5F]/60">Clinical Suite</p>
            </div>
          </div>

          <nav className="flex-1 space-y-2">
            <p className="mb-4 px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#8A6F5F]/40">Main Navigation</p>
            {adminTabs.map((tab) => (
              <SidebarItem key={tab.label} tab={tab} isActive={adminTab === tab.label} onClick={() => setAdminTab(tab.label)} />
            ))}
          </nav>

          <div className="mt-auto space-y-6 pt-6">
            <div className="space-y-1">
              {secondaryActions.map((action) => (
                <button
                  key={action.label}
                  onClick={action.onClick}
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-[#8A6F5F]/60 transition-colors hover:bg-[#FAF8F4] hover:text-[#8A6F5F]"
                >
                  <action.icon size={18} />
                  {action.label}
                </button>
              ))}
            </div>

            <div className="rounded-2xl border border-[#D4C8BC]/40 bg-[#FAF8F4]/50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#D4C8BC]/30">
                  <UserCircle2 size={24} className="text-[#8A6F5F]" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="truncate text-xs font-bold text-[#191919]">{displayName}</p>
                  <p className="truncate text-[10px] text-[#8A6F5F]/60">{user?.email}</p>
                </div>
                <button
                  onClick={onSignOut}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-[#8A6F5F]/40 transition-colors hover:bg-rose-50 hover:text-rose-600"
                  title="Sign Out"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* --- MOBILE BOTTOM NAV --- */}
      <nav className="fixed bottom-0 left-0 z-50 flex w-full items-center justify-around border-t border-[#D4C8BC]/30 bg-white/90 px-2 py-3 backdrop-blur-xl lg:hidden">
        {adminTabs.slice(0, 5).map((tab) => (
          <button
            key={`mobile-${tab.label}`}
            onClick={() => setAdminTab(tab.label)}
            className={`flex flex-col items-center gap-1 transition-all duration-300 ${
              adminTab === tab.label ? 'text-[#8A6F5F]' : 'text-[#8A6F5F]/40'
            }`}
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 ${
              adminTab === tab.label ? 'bg-[#8A6F5F]/10 scale-110 shadow-sm shadow-[#8A6F5F]/5' : ''
            }`}>
              <tab.icon size={22} strokeWidth={adminTab === tab.label ? 2.5 : 2} />
            </div>
            <span className={`text-[10px] font-bold tracking-tight ${adminTab === tab.label ? 'opacity-100' : 'opacity-0'}`}>
              {tab.label}
            </span>
          </button>
        ))}
        <button
          onClick={() => setShowProfileMenu(!showProfileMenu)}
          className={`flex flex-col items-center gap-1 transition-all duration-300 ${
            showProfileMenu ? 'text-[#8A6F5F]' : 'text-[#8A6F5F]/40'
          }`}
        >
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 ${
            showProfileMenu ? 'bg-[#8A6F5F]/10 scale-110 shadow-sm shadow-[#8A6F5F]/5' : ''
          }`}>
            <LayoutGrid size={22} strokeWidth={showProfileMenu ? 2.5 : 2} />
          </div>
          <span className={`text-[10px] font-bold tracking-tight ${showProfileMenu ? 'opacity-100' : 'opacity-0'}`}>
            Menu
          </span>
        </button>
      </nav>

      {/* --- MAIN CONTENT --- */}
      <main className="lg:pl-72">
        {/* Mobile Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[#D4C8BC]/20 bg-white/80 p-4 backdrop-blur-md lg:hidden">
          <div className="flex items-center gap-2">
            <Activity size={20} className="text-[#8A6F5F]" />
            <h1 className="font-['Playfair_Display'] text-lg font-bold">The Skin Theory</h1>
          </div>
          <div className="flex items-center gap-3">
             <div className="rounded-full bg-[#FAF8F4] px-3 py-1 text-[10px] font-bold text-[#8A6F5F]">
              {formatDateLabel(nowISO())}
            </div>
             <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ECE3D8] text-[#8A6F5F]"
            >
              <UserCircle2 size={20} />
            </button>
          </div>
        </header>

        <div className="p-4 pb-32 sm:p-6 md:p-8 lg:p-10">
          <header className="mb-10 hidden items-end justify-between lg:flex">
            <div>
              <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.3em] text-[#8A6F5F]">Clinic Management System</p>
              <h2 className="text-4xl font-extrabold tracking-tight text-[#191919]">
                {adminTab} <span className="text-[#8A6F5F]/30 italic font-['Playfair_Display']">Overview</span>
              </h2>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex flex-col items-end">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8A6F5F]/60">Current Session</p>
                <p className="text-sm font-bold text-[#191919]">{formatDateLabel(nowISO())}</p>
              </div>
              <div className="h-10 w-px bg-[#D4C8BC]/30" />
              <button className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-[#D4C8BC]/40 text-[#8A6F5F] hover:bg-[#FAF8F4] transition-colors">
                <Bell size={20} />
                <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
              </button>
            </div>
          </header>

          {/* Mobile Profile/More Menu Sidebar/Overlay */}
          {showProfileMenu && (
            <div className="fixed inset-0 z-[60] lg:hidden">
              <div className="absolute inset-0 bg-[#191919]/40 backdrop-blur-sm" onClick={() => setShowProfileMenu(false)} />
              <div className="absolute bottom-0 left-0 right-0 rounded-t-[2.5rem] bg-white p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-full duration-500">
                <div className="mb-8 flex flex-col items-center text-center">
                  <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-[#ECE3D8] text-[#8A6F5F]">
                    <UserCircle2 size={48} />
                  </div>
                  <h3 className="text-xl font-bold">{displayName}</h3>
                  <p className="text-sm text-[#8A6F5F]/60">{user?.email}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {adminTabs.slice(5).map((tab) => (
                    <button
                      key={`more-${tab.label}`}
                      onClick={() => { setAdminTab(tab.label); setShowProfileMenu(false); }}
                      className="flex flex-col items-start gap-2 rounded-2xl border border-[#D4C8BC]/20 bg-[#FAF8F4] p-4 text-[#8A6F5F]"
                    >
                      <tab.icon size={20} />
                      <span className="text-xs font-bold">{tab.label}</span>
                    </button>
                  ))}
                  <button
                    onClick={() => {}}
                    className="flex flex-col items-start gap-2 rounded-2xl border border-[#D4C8BC]/20 bg-[#FAF8F4] p-4 text-[#8A6F5F]"
                  >
                    <Settings size={20} />
                    <span className="text-xs font-bold">Settings</span>
                  </button>
                  <button
                    onClick={onSignOut}
                    className="col-span-2 flex items-center justify-center gap-3 rounded-2xl bg-rose-50 p-4 font-bold text-rose-600"
                  >
                    <LogOut size={20} />
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          )}

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
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <section className="grid gap-6 lg:grid-cols-3">
                <div className="group relative overflow-hidden rounded-[2.5rem] bg-[#8A6F5F] p-8 text-white shadow-2xl transition-all hover:scale-[1.02]">
                  <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl transition-transform group-hover:scale-150" />
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#ECE3D8]/60">Total Revenue</p>
                  <h3 className="mt-4 text-5xl font-extrabold tracking-tight">{formatMoney(totalRevenueCents)}</h3>
                  <div className="mt-8 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md">
                      <TrendingUp size={20} />
                    </div>
                    <p className="text-xs font-medium text-[#ECE3D8]/80">Projected for {formatDateLabel(nowISO()).split(',')[1]}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 lg:col-span-2">
                  <div className="rounded-[2.5rem] border border-[#D4C8BC]/30 bg-white p-8 transition-all hover:shadow-xl hover:shadow-[#8A6F5F]/5">
                    <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FAF8F4] text-[#8A6F5F]">
                      <Package size={24} />
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8A6F5F]/60">Orders</p>
                    <h4 className="mt-2 text-4xl font-extrabold text-[#191919]">{totalOrders}</h4>
                    <div className="mt-4 h-1 w-12 rounded-full bg-[#8A6F5F]/10" />
                  </div>
                  <div className="rounded-[2.5rem] border border-[#D4C8BC]/30 bg-white p-8 transition-all hover:shadow-xl hover:shadow-[#8A6F5F]/5">
                    <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FAF8F4] text-[#8A6F5F]">
                      <CalendarClock size={24} />
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8A6F5F]/60">Appointments</p>
                    <h4 className="mt-2 text-4xl font-extrabold text-[#191919]">{totalAppointments}</h4>
                    <div className="mt-4 h-1 w-12 rounded-full bg-[#8A6F5F]/10" />
                  </div>
                </div>
              </section>

              <section className="grid gap-8 lg:grid-cols-12">
                <div className="rounded-[2.5rem] border border-[#D4C8BC]/30 bg-white p-8 lg:col-span-8">
                  <div className="mb-10 flex items-center justify-between">
                    <div>
                      <h4 className="text-xl font-bold">Booking Trends</h4>
                      <p className="text-sm text-[#8A6F5F]/60">Last 14 days activity analysis</p>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex items-center gap-2 rounded-full bg-[#FAF8F4] px-4 py-2">
                        <div className="h-2 w-2 rounded-full bg-[#8A6F5F]" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A6F5F]">Volume</span>
                      </div>
                    </div>
                  </div>

                  <div className="relative flex h-64 items-end justify-between gap-2 px-2">
                    {!bookingTrend.length ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-[#FAF8F4]/50 rounded-3xl">
                        <p className="text-sm font-medium text-[#8A6F5F]/40 italic">Waiting for more data points...</p>
                      </div>
                    ) : (
                      bookingTrend.map((point) => {
                        const barHeight = Math.max(12, Math.min(220, point.total * 30));
                        const isHovered = hoveredTrendDate === point.dateISO;
                        return (
                          <div
                            key={point.dateISO}
                            className="group relative flex flex-1 flex-col items-center gap-4"
                            onMouseEnter={() => setHoveredTrendDate(point.dateISO)}
                            onMouseLeave={() => setHoveredTrendDate(null)}
                          >
                            <div className="relative flex w-full flex-col items-center justify-end h-48">
                               {isHovered && (
                                <div className="absolute -top-16 z-20 w-32 rounded-2xl border border-[#D4C8BC]/40 bg-white/95 p-3 text-center shadow-2xl backdrop-blur-md animate-in zoom-in-95 duration-200">
                                  <p className="text-[10px] font-bold text-[#8A6F5F]">{formatDateLabel(point.dateISO)}</p>
                                  <p className="mt-1 text-lg font-extrabold text-[#191919]">{point.total} Booked</p>
                                </div>
                              )}
                              <div
                                className={`w-full max-w-[1.5rem] rounded-t-xl transition-all duration-500 ease-out-expo ${
                                  isHovered ? 'bg-[#8A6F5F] scale-x-110 shadow-lg shadow-[#8A6F5F]/20' : 'bg-[#D4C8BC]/40'
                                }`}
                                style={{ height: `${barHeight}px` }}
                              />
                            </div>
                            <span className={`text-[9px] font-bold uppercase tracking-wider transition-colors ${
                              isHovered ? 'text-[#8A6F5F]' : 'text-[#8A6F5F]/30'
                            }`}>
                              {formatDateLabel(point.dateISO).split(',')[0].slice(0, 3)}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="rounded-[2.5rem] border border-[#D4C8BC]/30 bg-white p-8 lg:col-span-4">
                  <div className="mb-8 flex items-center justify-between">
                    <h4 className="text-xl font-bold">Operational Alerts</h4>
                    <Bell size={20} className="text-rose-500 animate-pulse" />
                  </div>

                  <div className="space-y-4">
                    {outOfStockProducts.length === 0 && lowStockProducts.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 text-center">
                        <Activity className="mb-4 text-emerald-500 opacity-20" size={48} />
                        <p className="text-sm font-bold text-[#8A6F5F]/60 uppercase tracking-widest">Inventory Healthy</p>
                      </div>
                    ) : (
                      <>
                        {outOfStockProducts.slice(0, 2).map((product) => (
                          <div key={product.id} className="group flex items-center gap-4 rounded-3xl border border-rose-100 bg-rose-50/50 p-4 transition-colors hover:bg-rose-50">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-500 text-white shadow-lg shadow-rose-500/20">
                              <Package size={20} />
                            </div>
                            <div className="flex-1 overflow-hidden">
                              <p className="truncate text-sm font-bold text-rose-900">{product.name}</p>
                              <p className="text-[10px] font-bold uppercase tracking-widest text-rose-600">OUT OF STOCK</p>
                            </div>
                            <ChevronRight size={16} className="text-rose-300 transition-transform group-hover:translate-x-1" />
                          </div>
                        ))}
                        {lowStockProducts.slice(0, 2).map((product) => (
                          <div key={product.id} className="group flex items-center gap-4 rounded-3xl border border-amber-100 bg-amber-50/50 p-4 transition-colors hover:bg-amber-50">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-lg shadow-amber-500/20">
                              <Bell size={20} />
                            </div>
                            <div className="flex-1 overflow-hidden">
                              <p className="truncate text-sm font-bold text-amber-900">{product.name}</p>
                              <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600">Low Stock: {product.stock}</p>
                            </div>
                            <ChevronRight size={16} className="text-amber-300 transition-transform group-hover:translate-x-1" />
                          </div>
                        ))}
                      </>
                    )}
                  </div>

                  <button
                    onClick={() => setAdminTab('Alerts')}
                    className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl border border-[#D4C8BC]/40 py-4 text-xs font-bold uppercase tracking-widest text-[#8A6F5F] transition-all hover:bg-[#FAF8F4]"
                  >
                    Manage Inventory
                  </button>
                </div>
              </section>

              <section className="grid gap-8 lg:grid-cols-2">
                <div className="rounded-[2.5rem] border border-[#D4C8BC]/30 bg-white p-8">
                  <div className="mb-8 flex items-center justify-between">
                    <h4 className="text-xl font-bold">Upcoming Appointments</h4>
                    <button onClick={() => setAdminTab('Appointments')} className="text-[10px] font-bold uppercase tracking-widest text-[#8A6F5F] hover:underline underline-offset-4">View Schedule</button>
                  </div>
                  <div className="space-y-4">
                    {pagedUpcomingAppointments.map((appointment) => (
                      <div key={appointment.id} className="flex items-center justify-between rounded-3xl border border-[#D4C8BC]/10 bg-[#FAF8F4]/50 p-5 transition-all hover:bg-white hover:shadow-lg hover:shadow-[#8A6F5F]/5">
                        <div className="flex items-center gap-5">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">
                            <CalendarClock size={20} className="text-[#8A6F5F]" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-[#191919]">{appointment.serviceName}</p>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-[#8A6F5F]/60">
                              {formatDateLabel(appointment.dateISO)} <span className="mx-2">•</span> {appointment.timeSlot}
                            </p>
                          </div>
                        </div>
                        <div className={`rounded-xl border px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${statusBadgeClass(appointment.status)}`}>
                          {appointment.status}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[2.5rem] border border-[#D4C8BC]/30 bg-white p-8">
                  <div className="mb-8 flex items-center justify-between">
                    <h4 className="text-xl font-bold">Order Feed</h4>
                    <button onClick={() => setAdminTab('Orders')} className="text-[10px] font-bold uppercase tracking-widest text-[#8A6F5F] hover:underline underline-offset-4">Browse All</button>
                  </div>
                  <div className="space-y-4">
                    {pagedPaymentOverview.map((order) => (
                      <div key={order.id} className="flex items-center justify-between rounded-3xl border border-[#D4C8BC]/10 bg-[#FAF8F4]/50 p-5 transition-all hover:bg-white hover:shadow-lg hover:shadow-[#8A6F5F]/5">
                        <div className="flex items-center gap-5">
                           <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">
                            <ClipboardList size={20} className="text-[#8A6F5F]" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-[#191919]">Order #{order.id.slice(-6).toUpperCase()}</p>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-[#8A6F5F]/60">
                              {formatMoney(order.totalCents)} <span className="mx-2">•</span> {formatDateLabel(order.createdAt)}
                            </p>
                          </div>
                        </div>
                         <div className={`rounded-xl border px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${statusBadgeClass(order.status)}`}>
                          {order.status}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </div>
              )}
            </>
          ) : null}

          {adminTab === 'Alerts' ? (
            <Card className="border-[#D4C8BC] bg-white p-5 md:p-6">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-amber-100 p-2 text-amber-700">
                  <Bell size={20} />
                </div>
                <div className="w-full">
                  <h3 className="text-2xl font-bold text-[#191919]">Complete Inventory Notifications</h3>
                  <p className="text-base text-[#8A6F5F]/60">Out-of-stock and low-stock alerts based on current inventory.</p>
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
                <Card className="border-[#D4C8BC] bg-white p-5">
                  <p className="text-sm uppercase tracking-wider text-[#8A6F5F]/60">Orders Revenue Received</p>
                  <p className="mt-2 text-3xl font-bold text-[#8A6F5F]">{formatMoney(ordersRevenueCents)}</p>
                </Card>
                <Card className="border-[#D4C8BC] bg-white p-5">
                  <p className="text-sm uppercase tracking-wider text-[#8A6F5F]/60">Services Revenue Received</p>
                  <p className="mt-2 text-3xl font-bold text-[#8A6F5F]">{formatMoney(servicesRevenueCents)}</p>
                </Card>
                <Card className="border-[#D4C8BC] bg-white p-5">
                  <p className="text-sm uppercase tracking-wider text-[#8A6F5F]/60">Total Revenue Received</p>
                  <p className="mt-2 text-3xl font-bold text-[#191919]">{formatMoney(totalRevenueCents)}</p>
                </Card>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
              <Card className="border-[#D4C8BC] bg-white p-5 md:p-6">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-[#191919]">Completed Orders</h3>
                  <span className="rounded-full bg-[#FAF8F4] px-3 py-1 text-xs font-semibold text-[#8A6F5F]">
                    {completedOrders.length} orders
                  </span>
                </div>
                {!completedOrders.length ? (
                  <EmptyState title="No Completed Orders" subtitle="Paid orders will appear here." />
                ) : (
                  <div className="space-y-2">
                    {pagedRevenueOrders.map((order) => (
                      <div key={order.id} className="rounded-xl border border-[#D4C8BC] bg-[#FAF8F4] px-4 py-3">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-[#191919]">Order {order.id.slice(0, 8)}...</p>
                          <p className="text-sm font-semibold text-[#8A6F5F]">{formatMoney(order.totalCents)}</p>
                        </div>
                        <p className="mt-1 text-xs text-[#8A6F5F]/60">{formatDateLabel(order.createdAt)}</p>
                        <p className="mt-1 text-xs text-[#8A6F5F]/60">{order.items.map((i) => `${i.name} x${i.quantity}`).join(', ')}</p>
                      </div>
                    ))}
                  </div>
                )}
                <Pagination page={revenueOrdersPage} totalPages={revenueOrdersTotalPages} onPageChange={setRevenueOrdersPage} />
              </Card>

              <Card className="border-[#D4C8BC] bg-white p-5 md:p-6">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-[#191919]">Completed Services</h3>
                  <span className="rounded-full bg-[#FAF8F4] px-3 py-1 text-xs font-semibold text-[#8A6F5F]">
                    {completedServices.length} services
                  </span>
                </div>
                {!servicesRevenueBreakdown.length ? (
                  <EmptyState title="No Completed Services" subtitle="Completed appointments will appear here." />
                ) : (
                  <div className="space-y-2">
                    {servicesRevenueBreakdown.map((service) => (
                      <div key={`${service.serviceId}-${service.serviceName}`} className="rounded-xl border border-[#D4C8BC] bg-[#FAF8F4] px-4 py-3">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-[#191919]">{service.serviceName}</p>
                          <p className="text-sm font-semibold text-[#8A6F5F]">{formatMoney(service.revenueCents)}</p>
                        </div>
                        <p className="mt-1 text-xs text-[#8A6F5F]/60">Completed: {service.count}</p>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
              </div>
            </div>
          ) : null}

          {adminTab === 'Appointments' ? (
        <Card className="border-[#D4C8BC] bg-white p-5">
          <h3 className="text-xl font-bold text-[#191919]">Recent Appointments</h3>
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
                <div key={appointment.id} className="rounded-xl border border-[#D4C8BC] bg-[#FAF8F4] px-4 py-3 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold text-[#191919]">{appointment.serviceName}</p>
                    <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold capitalize ${statusBadgeClass(appointment.status)}`}>
                      {appointment.status}
                    </span>
                  </div>
                  <p className="mt-1 text-[#8A6F5F]/70">
                    {appointment.dateISO} at {appointment.timeSlot} | patient: {appointment.patientUid.slice(0, 8)}...
                  </p>
                  {appointment.status === 'scheduled' ? (
                    <div className="mt-3 flex gap-2">
                        <Button
                          className="bg-[#8A6F5F] text-white hover:bg-[#5D4A3E]"
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
        <Card className="border-[#D4C8BC] bg-white p-5">
          <h3 className="text-xl font-bold text-[#191919]">Recent Orders</h3>
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
                <div key={order.id} className="rounded-xl border border-[#D4C8BC] bg-[#FAF8F4] px-4 py-3 text-sm">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-[#191919]">Order {order.id.slice(0, 8)}...</p>
                    <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold capitalize ${statusBadgeClass(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="mt-1 text-[#8A6F5F]/70">Items: {order.items.map((i) => `${i.name} x${i.quantity}`).join(', ')}</p>
                  <p className="mt-1 font-semibold text-[#8A6F5F]">{formatMoney(order.totalCents)}</p>
                </div>
              ))}
            </div>
          )}
          <Pagination page={ordersPage} totalPages={ordersTotalPages} onPageChange={setOrdersPage} />
        </Card>
          ) : null}

          {adminTab === 'Enquiries' ? (
        <Card className="border-[#D4C8BC] bg-white p-5">
          <h3 className="text-xl font-bold text-[#191919]">Customer Enquiries</h3>
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
                <div key={enquiry.id} className="rounded-xl border border-[#D4C8BC] bg-[#FAF8F4] px-4 py-3 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold text-[#191919]">{enquiry.fullName}</p>
                    <span className="rounded-full border border-[#D4C8BC] bg-white px-2 py-0.5 text-xs font-semibold text-[#8A6F5F]">
                      {formatDateLabel(enquiry.createdAt)}
                    </span>
                  </div>
                  <p className="mt-1 text-[#8A6F5F]/70">Mobile: {enquiry.mobile}</p>
                  <p className="text-[#8A6F5F]/70">Email: {enquiry.email}</p>
                  <p className="mt-1 text-xs text-[#8A6F5F]/40">User: {enquiry.patientUid.slice(0, 8)}...</p>
                </div>
              ))}
            </div>
          )}
        </Card>
          ) : null}

          {adminTab === 'Catalog' ? (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="border-[#D4C8BC] bg-white p-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-xl font-bold text-[#191919]">Service Catalog</h3>
                <span className="rounded-full bg-[#FAF8F4] px-2 py-1 text-xs font-semibold text-[#8A6F5F]">{servicesQuery.data.length} active</span>
              </div>
              <div className="max-h-[220px] overflow-y-auto pr-1 space-y-2 scrollbar-thin scrollbar-thumb-[#D4C8BC]">
                {servicesQuery.data.map((service) => (
                  <div key={service.id} className="flex items-center justify-between rounded-lg border border-[#D4C8BC] bg-[#FAF8F4] px-3 py-2 transition-colors hover:bg-white">
                    <span className="text-sm font-medium text-[#191919]">{service.name}</span>
                    <span className="font-semibold text-[#8A6F5F]">{formatMoney(service.priceCents)}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 space-y-2 border-t border-[#D4C8BC]/30 pt-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#8A6F5F]/60">Create / Update Service</p>
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
                <Button className="bg-[#8A6F5F] text-white hover:bg-[#5D4A3E]" onClick={submitService} disabled={upsertService.isLoading}>
                  {upsertService.isLoading ? 'Saving...' : 'Save Service'}
                </Button>
              </div>
            </Card>

            <Card className="border-[#D4C8BC] bg-white p-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-xl font-bold text-[#191919]">Product Inventory</h3>
                <span className="rounded-full bg-[#FAF8F4] px-2 py-1 text-xs font-semibold text-[#8A6F5F]">{productsQuery.data.length} active</span>
              </div>
              <div className="max-h-[220px] overflow-y-auto pr-1 space-y-2 scrollbar-thin scrollbar-thumb-[#D4C8BC]">
                {productsQuery.data.sort((a,b) => a.stock - b.stock).map((product) => (
                  <div key={product.id} className="flex items-center justify-between rounded-lg border border-[#D4C8BC] bg-[#FAF8F4] px-3 py-2 transition-colors hover:bg-white">
                    <div>
                      <p className="text-sm font-medium text-[#191919]">{product.name}</p>
                      <p className="text-[10px] font-black uppercase tracking-wider text-[#B5A99A]">{product.sku}</p>
                    </div>
                    <span className={`font-semibold text-sm ${product.stock <= 0 ? 'text-rose-600' : product.stock <= LOW_STOCK_THRESHOLD ? 'text-amber-600' : 'text-emerald-700'}`}>
                      Stock {product.stock}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 space-y-2 border-t border-[#D4C8BC]/30 pt-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#8A6F5F]/60">Create / Update Product</p>
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
                <Button className="bg-[#8A6F5F] text-white hover:bg-[#5D4A3E]" onClick={submitProduct} disabled={upsertProduct.isLoading}>
                  {upsertProduct.isLoading ? 'Saving...' : 'Save Product'}
                </Button>
              </div>
            </Card>
          </div>

          <Card className="border-[#D4C8BC] bg-white p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-xl font-bold text-[#191919]">Doctor Slot Management</h3>
              <span className="rounded-full bg-[#FAF8F4] px-2 py-1 text-xs font-semibold text-[#8A6F5F]">
                {slotManagementQuery.data ? 'Configured' : 'Default'}
              </span>
            </div>
            <p className="text-sm text-[#8A6F5F]/60">
              Manage weekly availability, blocked dates, and date-specific slot overrides. Booking flow will use this configuration.
            </p>

            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#8A6F5F]/60">Weekly Slots (comma-separated HH:MM)</p>
                {weekdayLabels.map((day) => (
                  <div key={day.key} className="grid grid-cols-[110px_1fr] items-center gap-2">
                    <span className="text-sm font-semibold text-[#8A6F5F]">{day.label}</span>
                    <Input
                      value={weeklySlotInputs[day.key]}
                      onChange={(e) => setWeeklySlotInputs((current) => ({ ...current, [day.key]: e.target.value }))}
                      placeholder="09:00, 10:00, 11:00"
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <div className="space-y-2 rounded-xl border border-[#D4C8BC] bg-[#FAF8F4] p-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#8A6F5F]/60">Blocked Dates</p>
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
                        className="rounded-full border border-[#D4C8BC] bg-white px-2 py-1 text-xs font-semibold text-[#8A6F5F] hover:bg-[#ECE3D8]"
                        title="Remove blocked date"
                      >
                        {dateISO} x
                      </button>
                    ))}
                    {!blockedDates.length ? <p className="text-xs text-[#8A6F5F]/30">No blocked dates.</p> : null}
                  </div>
                </div>

                <div className="space-y-2 rounded-xl border border-[#D4C8BC] bg-[#FAF8F4] p-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#8A6F5F]/60">Date Override</p>
                  <Input type="date" value={overrideDateInput} onChange={(e) => setOverrideDateInput(e.target.value)} />
                  <Input
                    value={overrideSlotsInput}
                    onChange={(e) => setOverrideSlotsInput(e.target.value)}
                    placeholder="08:00, 09:30, 10:00"
                    disabled={overrideClosed}
                  />
                  <label className="inline-flex items-center gap-2 text-sm text-[#8A6F5F]">
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
                        className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#D4C8BC] bg-white px-2 py-1.5 text-xs"
                      >
                        <p className="font-semibold text-[#191919]">
                          {override.dateISO} - {override.isClosed ? 'Closed' : override.slots.join(', ')}
                        </p>
                        <button className="font-semibold text-rose-700" onClick={() => removeOverride(override.dateISO)}>
                          Remove
                        </button>
                      </div>
                    ))}
                    {!overrides.length ? <p className="text-xs text-[#8A6F5F]/30">No overrides configured.</p> : null}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <Button
                className="bg-[#8A6F5F] text-white hover:bg-[#5D4A3E]"
                onClick={submitSlotManagement}
                disabled={upsertSlotManagement.isLoading}
              >
                {upsertSlotManagement.isLoading ? 'Saving...' : 'Save Slot Management'}
              </Button>
            </div>
          </Card>

          {statusMessage ? (
            <Card className="border-[#D4C8BC] bg-[#F5F0EA] p-3">
              <p className="text-sm font-medium text-[#8A6F5F]">{statusMessage}</p>
            </Card>
          ) : null}
        </>
          ) : null}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;

const SidebarItem = ({ tab, isActive, onClick }: { tab: any, isActive: boolean, onClick: () => void }) => {
  return (
    <button
      onClick={onClick}
      className={`group relative flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 transition-all duration-300 ${
        isActive ? 'bg-[#8A6F5F] text-white shadow-lg shadow-[#8A6F5F]/20' : 'text-[#8A6F5F]/70 hover:bg-[#FAF8F4] hover:text-[#8A6F5F]'
      }`}
    >
      <tab.icon size={20} className={`shrink-0 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
      <div className="flex flex-col items-start overflow-hidden">
        <span className="text-sm font-bold tracking-tight">{tab.label}</span>
        <span className={`text-[10px] uppercase tracking-widest opacity-60 ${isActive ? 'text-white' : 'text-[#8A6F5F]'}`}>{tab.hint}</span>
      </div>
      {isActive && (
        <div className="absolute right-2 h-1.5 w-1.5 rounded-full bg-white/40 ring-4 ring-white/10" />
      )}
    </button>
  );
};
