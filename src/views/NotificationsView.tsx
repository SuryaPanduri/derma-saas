import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Bell, BellRing, CalendarClock, Clock3, Package, Sparkles, Trash2, Minus, Plus } from 'lucide-react';
import { EmptyState } from '@/components/shared/EmptyState';
import { useAuthStore } from '@/store';
import { useBookings, useOrders } from '@/hooks';
import { formatDateLabel } from '@/utils/dateUtils';
import { formatMoney } from '@/utils/moneyUtils';

type NotificationItem = {
  id: string;
  type: 'order' | 'booking';
  title: string;
  subtitle: string;
  createdAt: string;
};

export const NotificationsView = () => {
  const user = useAuthStore((state) => state.user);
  const ordersQuery = useOrders(user?.id ?? '');
  const bookingsQuery = useBookings(user?.id ?? '');
  const [page, setPage] = useState(1);
  const [isClearing, setIsClearing] = useState(false);
  const [clearedBeforeISO, setClearedBeforeISO] = useState<string | null>(null);
  const pageSize = 6;

  const notifications: NotificationItem[] = [
    ...ordersQuery.data.map((order) => ({
      id: `order-${order.id}`,
      type: 'order' as const,
      title: `Order #${order.id.slice(-6).toUpperCase()}`,
      subtitle: `Status: ${order.status.charAt(0).toUpperCase() + order.status.slice(1)} • Total ${formatMoney(order.totalCents)}`,
      createdAt: order.createdAt
    })),
    ...bookingsQuery.data.map((booking) => ({
      id: `booking-${booking.id}`,
      type: 'booking' as const,
      title: `${booking.serviceName} Appointment`,
      subtitle: `${booking.dateISO} at ${booking.timeSlot} • ${booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}`,
      createdAt: booking.createdAt
    }))
  ].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const storageKey = useMemo(() => `notifications_cleared_before_${user?.id ?? 'guest'}`, [user?.id]);
  const clearedBeforeMs = clearedBeforeISO ? new Date(clearedBeforeISO).getTime() : 0;
  
  const visibleNotifications = useMemo(() => {
    if (!clearedBeforeMs) return notifications;
    return notifications.filter((item) => {
      const createdAtMs = new Date(item.createdAt).getTime();
      return Number.isFinite(createdAtMs) && createdAtMs > clearedBeforeMs;
    });
  }, [notifications, clearedBeforeMs]);

  const orderCount = visibleNotifications.filter(n => n.type === 'order').length;
  const bookingCount = visibleNotifications.filter(n => n.type === 'booking').length;
  const totalPages = Math.max(1, Math.ceil(visibleNotifications.length / pageSize));
  const startIndex = (page - 1) * pageSize;
  const paginatedNotifications = visibleNotifications.slice(startIndex, startIndex + pageSize);

  useEffect(() => { setPage(1); }, [visibleNotifications.length]);
  useEffect(() => { setClearedBeforeISO(window.localStorage.getItem(storageKey)); }, [storageKey]);

  const handleClearNotifications = () => {
    if (!visibleNotifications.length || isClearing) return;
    setIsClearing(true);
    setTimeout(() => {
      const latestMs = [...visibleNotifications]
        .map(i => new Date(i.createdAt).getTime())
        .filter(ms => Number.isFinite(ms))
        .sort((a, b) => b - a)[0] ?? Date.now();
      const iso = new Date(latestMs).toISOString();
      setClearedBeforeISO(iso);
      window.localStorage.setItem(storageKey, iso);
      window.dispatchEvent(new CustomEvent('notifications-cleared-updated', { detail: { storageKey, clearedBeforeISO: iso } }));
      setIsClearing(false);
      setPage(1);
    }, 400);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Premium Glass Header Card */}
      <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/70 p-6 backdrop-blur-xl shadow-lg ring-1 ring-black/5">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#8A6F5F]/5 blur-3xl" />
        <div className="absolute -left-8 -bottom-8 h-32 w-32 rounded-full bg-[#D4C8BC]/10 blur-3xl" />
        
        <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-[#8A6F5F] animate-pulse" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8A6F5F]">Live Intelligence</p>
            </div>
            <h2 className="font-['Playfair_Display'] text-3xl font-bold text-[#191919]">Activity Lounge</h2>
            <p className="max-w-md text-sm text-[#8A6F5F]/60 leading-relaxed font-medium">Your personalized hub for order journeys and clinical appointments.</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleClearNotifications}
              disabled={!visibleNotifications.length || isClearing}
              className="flex h-11 items-center gap-2 rounded-xl border border-[#D4C8BC]/20 bg-white/80 px-5 text-[13px] font-bold text-[#191919] shadow-sm transition-all hover:bg-white hover:shadow-md disabled:opacity-40"
            >
              <Trash2 size={15} className={isClearing ? 'animate-bounce' : ''} />
              {isClearing ? 'Finalizing...' : 'Clear All'}
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="relative mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Orders', val: orderCount, icon: Package, color: 'text-[#8A6F5F]' },
            { label: 'Visits', val: bookingCount, icon: CalendarClock, color: 'text-[#5D4A3E]' },
            { label: 'Total', val: visibleNotifications.length, icon: BellRing, color: 'text-[#191919]' }
          ].map((stat, i) => (
            <div key={StatLabel(stat.label)} className="rounded-xl border border-black/[0.03] bg-black/[0.02] p-4 group transition-all hover:bg-white/50">
              <div className="flex items-center justify-between">
                <stat.icon size={18} className={`${stat.color} opacity-60 group-hover:opacity-100 transition-opacity`} />
                <span className={`text-xl font-black ${stat.color}`}>{stat.val}</span>
              </div>
              <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-[#8A6F5F]/40">{stat.label}</p>
            </div>
          ))}
          <div className="hidden lg:flex flex-col justify-center pl-4 border-l border-black/[0.05]">
            <p className="text-[11px] font-bold text-[#191919] uppercase tracking-tighter">Real-time Sync</p>
            <p className="text-[10px] text-[#B5A99A]">Updated just now</p>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="mt-6">
        {!visibleNotifications.length ? (
          <div className="py-20 rounded-2xl border border-dashed border-[#D4C8BC]/40 flex flex-col items-center justify-center text-center">
             <div className="h-16 w-16 rounded-full bg-[#FAF8F5] flex items-center justify-center mb-4 text-[#D4C8BC]">
                <BellRing size={32} strokeWidth={1.5} />
             </div>
             <h3 className="text-lg font-bold text-[#191919]">Peace and quiet</h3>
             <p className="text-sm text-[#B5A99A] mt-1 max-w-[240px]">We'll alert you here when there's an update on your orders or appointments.</p>
          </div>
        ) : (
          <div className={`space-y-4 transition-all duration-500 ${isClearing ? 'scale-[0.98] opacity-0 blur-lg' : 'opacity-100'}`}>
            <div className="overflow-hidden rounded-2xl border border-black/[0.03] bg-white shadow-sm ring-1 ring-black/5 divide-y divide-black/[0.04]">
              {paginatedNotifications.map((item) => (
                <div key={item.id} className="group flex items-start gap-4 p-5 transition-colors hover:bg-[#FAF8F5]">
                  <div className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-110 ${
                    item.type === 'order' ? 'bg-[#8A6F5F]/10 text-[#8A6F5F]' : 'bg-[#D4C8BC]/20 text-[#5D4A3E]'
                  }`}>
                    {item.type === 'order' ? <Package size={20} strokeWidth={2.5} /> : <CalendarClock size={20} strokeWidth={2.5} />}
                  </div>
                  
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-[15px] font-bold text-[#191919] tracking-tight">{item.title}</h4>
                      <span className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                         item.type === 'order' ? 'bg-[#8A6F5F] text-white' : 'bg-[#191919] text-white'
                      }`}>
                        {item.type}
                      </span>
                    </div>
                    <p className="mt-1 text-[13px] font-medium text-[#8A6F5F]/70 leading-snug">{item.subtitle}</p>
                    <div className="mt-2 flex items-center gap-3">
                      <p className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#B5A99A]">
                        <Clock3 size={12} strokeWidth={3} />
                        {formatDateLabel(item.createdAt)}
                      </p>
                    </div>
                  </div>
                  
                  <button className="opacity-0 group-hover:opacity-100 transition-all p-2 hover:bg-black/5 rounded-lg text-[#B5A99A]">
                    <ArrowRight size={14} />
                  </button>
                </div>
              ))}
            </div>

            {/* Premium Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-2 pt-2">
                <p className="text-[11px] font-bold uppercase tracking-widest text-[#B5A99A]">
                  Archive {startIndex + 1}–{Math.min(startIndex + pageSize, visibleNotifications.length)} <span className="mx-1 opacity-40">/</span> {visibleNotifications.length}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-black/[0.05] shadow-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-40"
                  >
                    <Minus size={14} />
                  </button>
                  <div className="flex h-9 min-w-[36px] items-center justify-center rounded-xl bg-[#191919] px-3 font-black text-white text-[11px]">
                    {page}
                  </div>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-black/[0.05] shadow-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-40"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

function StatLabel(label: string) {
  return label;
}
