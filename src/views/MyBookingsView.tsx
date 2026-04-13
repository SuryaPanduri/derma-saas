import { useMemo } from 'react';
import { CalendarDays, Clock3, ClipboardList, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/shared/EmptyState';
import { useAuthStore } from '@/store';
import { useBookings } from '@/hooks';
import { formatDateLabel } from '@/utils/dateUtils';

export const MyBookingsView = () => {
  const user = useAuthStore((state) => state.user);
  const bookingsQuery = useBookings(user?.id ?? '');

  const bookings = useMemo(
    () => [...bookingsQuery.data].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [bookingsQuery.data]
  );
  
  const upcoming = useMemo(
    () => bookings
      .filter((item) => item.status === 'scheduled' && new Date(item.dateISO).getTime() >= Date.now())
      .sort((a, b) => a.dateISO.localeCompare(b.dateISO)),
    [bookings]
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-6">
      {/* Premium Glass Header */}
      <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/70 p-6 backdrop-blur-xl shadow-lg ring-1 ring-black/5">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#8A6F5F]/5 blur-3xl" />
        <div className="absolute -left-8 -bottom-8 h-32 w-32 rounded-full bg-[#D4C8BC]/10 blur-3xl" />
        
        <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-[#8A6F5F] animate-pulse" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8A6F5F]">Schedule Hub</p>
            </div>
            <h2 className="font-['Playfair_Display'] text-3xl font-bold text-[#191919]">Appointments</h2>
            <p className="max-w-md text-sm text-[#8A6F5F]/60 leading-relaxed font-medium">Coordinate your clinical visits and skin transformation sessions.</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-8 flex gap-4">
          <div className="rounded-xl border border-black/[0.03] bg-black/[0.02] px-4 py-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#8A6F5F]/40">Upcoming</p>
            <p className="text-lg font-black text-[#191919]">{upcoming.length}</p>
          </div>
          <div className="rounded-xl border border-black/[0.03] bg-black/[0.02] px-4 py-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#8A6F5F]/40">Completed</p>
            <p className="text-lg font-black text-[#191919]">{bookings.filter(b => b.status === 'completed').length}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Sidebar: Next Visit */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-[#E8E2DC]/50 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-black uppercase tracking-wider text-[#191919] mb-4">Priority Access</h3>
            {!upcoming.length ? (
              <div className="p-8 text-center rounded-xl bg-[#FAF8F5] border border-dashed border-[#D4C8BC]/40">
                <CalendarDays className="mx-auto text-[#D4C8BC] mb-2" size={24} />
                <p className="text-xs font-semibold text-[#B5A99A]">No upcoming visits.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcoming.slice(0, 1).map((item) => (
                  <div key={item.id} className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#2C2420] to-[#191919] p-4 text-white shadow-md">
                    <div className="absolute -right-4 -top-4 opacity-10"><CalendarDays size={64} /></div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#8A6F5F]">Next Visit</p>
                    <p className="mt-2 text-[15px] font-bold leading-tight">{item.serviceName}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-white/70">
                        <Clock3 size={12} /> {item.timeSlot}
                      </div>
                      <span className="text-xs font-bold">{item.dateISO}</span>
                    </div>
                  </div>
                ))}
                {upcoming.length > 1 && (
                   <p className="text-[11px] text-center font-bold text-[#8A6F5F] uppercase tracking-wider mt-2">+{upcoming.length - 1} more scheduled</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Main List: History */}
        <div className="lg:col-span-2">
          <div className="relative overflow-hidden rounded-2xl border border-black/[0.03] bg-white shadow-sm ring-1 ring-black/5">
            <div className="flex items-center justify-between border-b border-black/[0.04] p-5">
              <h3 className="text-sm font-black uppercase tracking-wider text-[#191919]">Booking Archive</h3>
              <ClipboardList size={16} className="text-[#8A6F5F]" />
            </div>
            
            {!bookings.length ? (
              <div className="py-20 flex flex-col items-center">
                <EmptyState title="No Records" subtitle="Your journey data will appear here once you book." />
              </div>
            ) : (
              <div className="divide-y divide-black/[0.04]">
                {bookings.map((item) => (
                  <div key={item.id} className="group flex items-center justify-between p-5 transition-colors hover:bg-[#FAF8F5]">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h4 className="text-[14px] font-bold text-[#191919] tracking-tight">{item.serviceName}</h4>
                        <span className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                          item.status === 'scheduled' ? 'bg-[#8A6F5F] text-white' : 
                          item.status === 'completed' ? 'bg-emerald-600 text-white' : 'bg-[#C4B8AA] text-white'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-[11px] font-bold text-[#B5A99A]">
                        <span className="flex items-center gap-1"><CalendarDays size={12} strokeWidth={2.5} /> {formatDateLabel(item.dateISO)}</span>
                        <span className="flex items-center gap-1"><Clock3 size={12} strokeWidth={2.5} /> {item.timeSlot}</span>
                      </div>
                      {item.notes && (
                        <p className="mt-1 text-[11px] text-[#8A6F5F]/60 line-clamp-1 italic">"{item.notes}"</p>
                      )}
                    </div>
                    
                    <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FAF8F5] text-[#D4C8BC] transition-all group-hover:bg-[#8A6F5F] group-hover:text-white">
                      <ArrowRight size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
