import { useEffect, useMemo, useState } from 'react';
import { Bell, BellRing, CalendarClock, Clock3, Package, Sparkles, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
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
      title: `Order ${order.id.slice(0, 8)} update`,
      subtitle: `Status: ${order.status} • Total ${formatMoney(order.totalCents)}`,
      createdAt: order.createdAt
    })),
    ...bookingsQuery.data.map((booking) => ({
      id: `booking-${booking.id}`,
      type: 'booking' as const,
      title: `${booking.serviceName} appointment`,
      subtitle: `${booking.dateISO} at ${booking.timeSlot} • ${booking.status}`,
      createdAt: booking.createdAt
    }))
  ].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const storageKey = useMemo(() => `notifications_cleared_before_${user?.id ?? 'guest'}`, [user?.id]);
  const clearedBeforeMs = clearedBeforeISO ? new Date(clearedBeforeISO).getTime() : 0;
  const visibleNotifications = useMemo(() => {
    if (!clearedBeforeMs) {
      return notifications;
    }
    return notifications.filter((item) => {
      const createdAtMs = new Date(item.createdAt).getTime();
      if (!Number.isFinite(createdAtMs)) {
        return false;
      }
      return createdAtMs > clearedBeforeMs;
    });
  }, [notifications, clearedBeforeMs]);
  const orderUpdates = visibleNotifications.filter((item) => item.type === 'order').length;
  const bookingUpdates = visibleNotifications.filter((item) => item.type === 'booking').length;
  const totalPages = Math.max(1, Math.ceil(visibleNotifications.length / pageSize));
  const startIndex = (page - 1) * pageSize;
  const paginatedNotifications = visibleNotifications.slice(startIndex, startIndex + pageSize);

  useEffect(() => {
    setPage(1);
  }, [visibleNotifications.length]);

  useEffect(() => {
    const persisted = window.localStorage.getItem(storageKey);
    setClearedBeforeISO(persisted);
  }, [storageKey]);

  const handleClearNotifications = () => {
    if (!visibleNotifications.length || isClearing) {
      return;
    }
    setIsClearing(true);
    window.setTimeout(() => {
      const latestVisibleISO =
        [...visibleNotifications]
          .map((item) => new Date(item.createdAt).getTime())
          .filter((value) => Number.isFinite(value))
          .sort((a, b) => b - a)[0] ?? Date.now();
      const clearedISO = new Date(latestVisibleISO).toISOString();
      setClearedBeforeISO(clearedISO);
      window.localStorage.setItem(storageKey, clearedISO);
      window.dispatchEvent(new CustomEvent('notifications-cleared-updated', { detail: { storageKey, clearedBeforeISO: clearedISO } }));
      setIsClearing(false);
      setPage(1);
    }, 360);
  };

  return (
    <div className="space-y-4">
      <Card className="border-[#D4C8BC]/30 bg-white p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#8A6F5F]/60">Updates</p>
            <h2 className="font-['Playfair_Display'] mt-1 text-2xl font-bold text-[#191919]">Notifications</h2>
            <p className="mt-1 text-sm text-[#8A6F5F]/70">Order and booking alerts in one place.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full border border-[#D4C8BC]/40 bg-[#FAF8F4] px-3 py-1.5 text-xs font-semibold text-[#191919]">
              <BellRing size={14} />
              {visibleNotifications.length} total
            </span>
            <button
              onClick={handleClearNotifications}
              disabled={!visibleNotifications.length || isClearing}
              className="inline-flex items-center gap-1 rounded-full border border-[#D4C8BC]/40 bg-white px-3 py-1.5 text-xs font-semibold text-[#191919] transition hover:bg-[#FAF8F4] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 size={13} className={isClearing ? 'animate-pulse' : ''} />
              {isClearing ? 'Clearing...' : 'Clear'}
            </button>
          </div>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <div className="rounded-xl border border-[#D4C8BC]/20 bg-[#FAF8F4] p-3">
            <p className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-[#8A6F5F]/60">
              <Package size={13} /> Orders
            </p>
            <p className="mt-1 text-xl font-bold text-[#191919]">{orderUpdates}</p>
          </div>
          <div className="rounded-xl border border-[#D4C8BC]/20 bg-[#FAF8F4] p-3">
            <p className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-[#8A6F5F]/60">
              <CalendarClock size={13} /> Bookings
            </p>
            <p className="mt-1 text-xl font-bold text-[#191919]">{bookingUpdates}</p>
          </div>
          <div className="rounded-xl border border-[#D4C8BC]/20 bg-[#FAF8F4] p-3">
            <p className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-[#8A6F5F]/60">
              <Sparkles size={13} /> Latest
            </p>
            <p className="mt-1 text-sm font-semibold text-[#191919]">{notifications.length ? 'Live updates active' : 'No pending updates'}</p>
          </div>
        </div>
      </Card>

      {!visibleNotifications.length ? (
        <EmptyState title="No Notifications" subtitle="New order and booking updates will appear here." />
      ) : (
        <div className={`space-y-3 transition-all duration-300 ${isClearing ? 'translate-y-1 opacity-0' : 'opacity-100'}`}>
          {paginatedNotifications.map((item) => (
            <Card key={item.id} className="border-[#D4C8BC]/30 bg-white p-4">
              <div className="flex items-start gap-3">
                <div
                  className={`mt-0.5 rounded-full p-2 ${
                    item.type === 'order' ? 'bg-[#FAF8F4] text-[#8A6F5F]' : 'bg-[#F2EDEA] text-[#5D4A3E]'
                  }`}
                >
                  {item.type === 'order' ? <Package size={16} /> : <CalendarClock size={16} />}
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-[#191919]">{item.title}</p>
                    <span className="rounded-full border border-[#D4C8BC]/30 bg-[#FAF8F4] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[#8A6F5F]">
                      {item.type}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-[#8A6F5F]/70">{item.subtitle}</p>
                  <p className="mt-1 inline-flex items-center gap-1 text-xs text-[#8A6F5F]/60">
                    <Clock3 size={12} />
                    {formatDateLabel(item.createdAt)}
                  </p>
                </div>
                <Bell size={14} className="text-[#8A6F5F]/40" />
              </div>
            </Card>
          ))}
          {totalPages > 1 ? (
            <Card className="border-[#D4C8BC]/30 bg-white p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs text-[#8A6F5F]/60">
                  Showing {startIndex + 1}-{Math.min(startIndex + pageSize, visibleNotifications.length)} of {visibleNotifications.length}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                    disabled={page === 1}
                    className="rounded-lg border border-[#D4C8BC]/40 bg-white px-3 py-1.5 text-xs font-semibold text-[#191919] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Prev
                  </button>
                  <span className="text-xs font-semibold text-[#8A6F5F]">
                    Page {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                    disabled={page === totalPages}
                    className="rounded-lg border border-[#D4C8BC]/40 bg-white px-3 py-1.5 text-xs font-semibold text-[#191919] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </Card>
          ) : null}
        </div>
      )}
    </div>
  );
};
