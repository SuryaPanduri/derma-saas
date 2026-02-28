import { CalendarDays, Clock3, ClipboardList } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/shared/EmptyState';
import { useAuthStore } from '@/store';
import { useBookings } from '@/hooks';
import { formatDateLabel } from '@/utils/dateUtils';

export const MyBookingsView = () => {
  const user = useAuthStore((state) => state.user);
  const bookingsQuery = useBookings(user?.id ?? '');

  const bookings = [...bookingsQuery.data].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const upcoming = bookings
    .filter((item) => item.status === 'scheduled' && new Date(item.dateISO).getTime() >= Date.now())
    .sort((a, b) => a.dateISO.localeCompare(b.dateISO));

  return (
    <div className="space-y-4">
      <Card className="border-[#d5e4e7] bg-white p-4 sm:p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#6b7f83]">Appointments</p>
        <h2 className="mt-1 text-2xl font-bold text-[#12353a]">My Bookings</h2>
        <p className="mt-1 text-sm text-[#4f666b]">Track all booked services and upcoming visits.</p>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="border-[#d5e4e7] bg-white p-4 lg:col-span-1">
          <h3 className="text-base font-bold text-[#12353a]">Upcoming Appointments</h3>
          {!upcoming.length ? (
            <p className="mt-3 text-sm text-[#6b7f83]">No upcoming appointments.</p>
          ) : (
            <div className="mt-3 space-y-2">
              {upcoming.slice(0, 5).map((item) => (
                <div key={item.id} className="rounded-xl border border-[#d5e4e7] bg-[#f7f9fa] p-3">
                  <p className="text-sm font-semibold text-[#12353a]">{item.serviceName}</p>
                  <p className="mt-1 text-xs text-[#4f666b]">{item.dateISO} at {item.timeSlot}</p>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="border-[#d5e4e7] bg-white p-4 lg:col-span-2">
          <h3 className="text-base font-bold text-[#12353a]">All Booking Details</h3>
          {!bookings.length ? (
            <div className="mt-4">
              <EmptyState title="No Bookings Yet" subtitle="Your service bookings will appear here." />
            </div>
          ) : (
            <div className="mt-3 space-y-3">
              {bookings.map((item) => (
                <div key={item.id} className="rounded-xl border border-[#d5e4e7] bg-[#f7f9fa] p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-[#12353a]">{item.serviceName}</p>
                    <span className="rounded-full border border-[#d5e4e7] bg-white px-2 py-0.5 text-xs font-semibold capitalize text-[#4f666b]">
                      {item.status}
                    </span>
                  </div>
                  <div className="mt-2 grid gap-1 text-xs text-[#4f666b] sm:grid-cols-2">
                    <p className="inline-flex items-center gap-1"><CalendarDays size={12} /> {formatDateLabel(item.dateISO)}</p>
                    <p className="inline-flex items-center gap-1"><Clock3 size={12} /> {item.timeSlot}</p>
                    <p className="inline-flex items-center gap-1 sm:col-span-2"><ClipboardList size={12} /> Notes: {item.notes || 'No notes'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
