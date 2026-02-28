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
      <Card className="border-[#d5e4e7] bg-white p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#6b7f83]">Updates</p>
            <h2 className="mt-1 text-2xl font-bold text-[#12353a]">Notifications</h2>
            <p className="mt-1 text-sm text-[#4f666b]">Order and booking alerts in one place.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full border border-[#d5e4e7] bg-[#f7f9fa] px-3 py-1.5 text-xs font-semibold text-[#12353a]">
              <BellRing size={14} />
              {visibleNotifications.length} total
            </span>
            <button
              onClick={handleClearNotifications}
              disabled={!visibleNotifications.length || isClearing}
              className="inline-flex items-center gap-1 rounded-full border border-[#d5e4e7] bg-white px-3 py-1.5 text-xs font-semibold text-[#12353a] transition hover:bg-[#f7f9fa] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 size={13} className={isClearing ? 'animate-pulse' : ''} />
              {isClearing ? 'Clearing...' : 'Clear'}
            </button>
          </div>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <div className="rounded-xl border border-[#d5e4e7] bg-[#f7f9fa] p-3">
            <p className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-[#6b7f83]">
              <Package size={13} /> Orders
            </p>
            <p className="mt-1 text-xl font-bold text-[#12353a]">{orderUpdates}</p>
          </div>
          <div className="rounded-xl border border-[#d5e4e7] bg-[#f7f9fa] p-3">
            <p className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-[#6b7f83]">
              <CalendarClock size={13} /> Bookings
            </p>
            <p className="mt-1 text-xl font-bold text-[#12353a]">{bookingUpdates}</p>
          </div>
          <div className="rounded-xl border border-[#d5e4e7] bg-[#f7f9fa] p-3">
            <p className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-[#6b7f83]">
              <Sparkles size={13} /> Latest
            </p>
            <p className="mt-1 text-sm font-semibold text-[#12353a]">{notifications.length ? 'Live updates active' : 'No pending updates'}</p>
          </div>
        </div>
      </Card>

      {!visibleNotifications.length ? (
        <EmptyState title="No Notifications" subtitle="New order and booking updates will appear here." />
      ) : (
        <div className={`space-y-3 transition-all duration-300 ${isClearing ? 'translate-y-1 opacity-0' : 'opacity-100'}`}>
          {paginatedNotifications.map((item) => (
            <Card key={item.id} className="border-[#d5e4e7] bg-white p-4">
              <div className="flex items-start gap-3">
                <div
                  className={`mt-0.5 rounded-full p-2 ${
                    item.type === 'order' ? 'bg-[#e7eef0] text-[#0f4a52]' : 'bg-[#eef2ff] text-[#3b4fb8]'
                  }`}
                >
                  {item.type === 'order' ? <Package size={16} /> : <CalendarClock size={16} />}
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-[#12353a]">{item.title}</p>
                    <span className="rounded-full border border-[#d5e4e7] bg-[#f7f9fa] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[#4f666b]">
                      {item.type}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-[#4f666b]">{item.subtitle}</p>
                  <p className="mt-1 inline-flex items-center gap-1 text-xs text-[#6b7f83]">
                    <Clock3 size={12} />
                    {formatDateLabel(item.createdAt)}
                  </p>
                </div>
                <Bell size={14} className="text-[#6b7f83]" />
              </div>
            </Card>
          ))}
          {totalPages > 1 ? (
            <Card className="border-[#d5e4e7] bg-white p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs text-[#6b7f83]">
                  Showing {startIndex + 1}-{Math.min(startIndex + pageSize, visibleNotifications.length)} of {visibleNotifications.length}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                    disabled={page === 1}
                    className="rounded-lg border border-[#d5e4e7] bg-white px-3 py-1.5 text-xs font-semibold text-[#12353a] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Prev
                  </button>
                  <span className="text-xs font-semibold text-[#4f666b]">
                    Page {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                    disabled={page === totalPages}
                    className="rounded-lg border border-[#d5e4e7] bg-white px-3 py-1.5 text-xs font-semibold text-[#12353a] disabled:cursor-not-allowed disabled:opacity-50"
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
