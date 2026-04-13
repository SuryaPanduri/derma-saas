import { useMemo, useState } from 'react';
import { CalendarDays, Clock3, ClipboardList, ArrowRight, ArrowLeft, Star, MessageSquare, ShieldCheck, UserCheck, Timer } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/shared/EmptyState';
import { useAuthStore } from '@/store';
import { useBookings } from '@/hooks';
import { formatDateLabel } from '@/utils/dateUtils';
import { Button } from '@/components/ui/Button';

export const MyBookingsView = () => {
  const user = useAuthStore((state) => state.user);
  const bookingsQuery = useBookings(user?.id ?? '');
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);

  const bookings = useMemo(
    () => [...bookingsQuery.data].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [bookingsQuery.data]
  );

  const selectedBooking = useMemo(
    () => bookings.find(b => b.id === selectedBookingId),
    [bookings, selectedBookingId]
  );
  
  const upcoming = useMemo(
    () => bookings
      .filter((item) => item.status === 'scheduled' && new Date(item.dateISO).getTime() >= Date.now())
      .sort((a, b) => a.dateISO.localeCompare(b.dateISO)),
    [bookings]
  );
  
  if (selectedBooking) {
    const isCompleted = selectedBooking.status === 'completed';
    const milestones = [
      { id: 0, label: 'Scheduled', desc: 'Visit confirmed', icon: CalendarDays, active: true },
      { id: 1, label: 'At Clinic', desc: 'Checked-in', icon: UserCheck, active: selectedBooking.status !== 'scheduled' },
      { id: 2, label: 'In Session', desc: 'Expert treatment', icon: Timer, active: isCompleted },
      { id: 3, label: 'Completed', desc: 'Treatment finished', icon: ClipboardList, active: isCompleted },
    ];

    return (
      <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-6 max-w-4xl mx-auto">
        <button 
          onClick={() => setSelectedBookingId(null)}
          className="flex items-center gap-2 text-[13px] font-black uppercase tracking-widest text-[#8A6F5F] hover:text-[#191919] transition-colors"
        >
          <ArrowLeft size={16} /> Back to Schedule
        </button>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Header & Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/70 p-8 backdrop-blur-2xl shadow-xl ring-1 ring-black/5">
              <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[#8A6F5F]/10 blur-3xl" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <span className={`rounded-xl px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
                    selectedBooking.status === 'scheduled' ? 'bg-[#8A6F5F] text-white' : 'bg-emerald-600 text-white'
                  }`}>
                    {selectedBooking.status}
                  </span>
                  <span className="text-[11px] font-bold text-[#B5A99A]">ID: BST_{selectedBooking.id.slice(-6).toUpperCase()}</span>
                </div>
                <h2 className="font-['Playfair_Display'] text-4xl font-bold text-[#191919] leading-tight">
                  {selectedBooking.serviceName}
                </h2>
                <div className="mt-8 grid grid-cols-2 gap-8 border-t border-black/[0.04] pt-8">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#B5A99A]">Appointment Date</p>
                    <p className="text-[15px] font-bold text-[#191919]">{formatDateLabel(selectedBooking.dateISO)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#B5A99A]">Arrival Time</p>
                    <p className="text-[15px] font-bold text-[#191919]">{selectedBooking.timeSlot}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Specialist & Notes - Hidden for Completed */}
            {!isCompleted && (
              <div className="rounded-2xl border border-black/[0.03] bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-14 w-14 rounded-full bg-[#FAF8F5] flex items-center justify-center text-[#8A6F5F]">
                      <UserCheck size={28} strokeWidth={1.5} />
                    </div>
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-widest text-[#191919]">Assigned Specialist</h3>
                      <p className="text-[13px] font-bold text-[#8A6F5F]">Skin Theory Clinical Team</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-[11px] font-black uppercase tracking-widest text-[#B5A99A]">Clinical Notes</h4>
                    <p className="text-[14px] leading-relaxed text-[#5D4A3E] italic">
                      {selectedBooking.notes || "No specific preparation required. Please arrive 10 minutes prior for check-in."}
                    </p>
                  </div>
              </div>
            )}

            {/* Reviews Section for Completed */}
            {isCompleted && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
                <div className="rounded-2xl border border-[#CA8A04]/20 bg-gradient-to-br from-white to-[#FAF8F5] p-8 shadow-md">
                  <div className="flex items-center gap-3 mb-6">
                    <Star className="text-[#CA8A04] fill-[#CA8A04]" size={20} />
                    <h3 className="text-lg font-['Playfair_Display'] font-bold text-[#191919]">Tell us how you feel</h3>
                  </div>
                  <p className="text-[13px] text-[#8A6F5F] mb-6 leading-relaxed font-medium">Your feedback helps us refine your skincare journey. How was your treatment experience today?</p>
                  
                  <div className="flex gap-2 mb-8">
                    {[1,2,3,4,5].map(s => (
                      <button key={s} className="h-12 w-12 rounded-xl border border-[#E8E2DC] flex items-center justify-center text-[#B5A99A] hover:border-[#CA8A04] hover:text-[#CA8A04] transition-all">
                        <Star size={20} />
                      </button>
                    ))}
                  </div>

                  <textarea 
                    placeholder="Share your thoughts with us..."
                    className="w-full h-32 rounded-xl border border-[#E8E2DC] p-4 text-sm outline-none focus:border-[#CA8A04] transition-all bg-white"
                  />
                  
                  <Button className="mt-6 bg-[#CA8A04] hover:bg-[#B87D03] text-white font-black uppercase tracking-widest text-[11px] px-8 h-12 rounded-lg">
                    Submit Experience
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Clinical Milestones Sidebar */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-black/[0.03] bg-white p-6 shadow-sm sticky top-6">
              <div className="flex items-center gap-2 mb-8">
                <ShieldCheck size={18} className="text-[#8A6F5F]" />
                <h3 className="text-[11px] font-black uppercase tracking-widest text-[#191919]">Safety Protocol</h3>
              </div>
              <div className="space-y-8 relative before:absolute before:left-5 before:top-2 before:bottom-2 before:w-[2px] before:bg-[#E8E2DC]">
                {milestones.map((m) => (
                  <div key={m.label} className="relative flex gap-4 pl-10">
                    <div className={`absolute left-0 z-10 flex h-10 w-10 items-center justify-center rounded-full border-4 border-white transition-all ${
                      m.active ? 'bg-[#8A6F5F] text-white shadow-lg' : 'bg-[#F2EDEA] text-[#D4C8BC]'
                    }`}>
                      <m.icon size={16} strokeWidth={2.5} />
                    </div>
                    <div>
                      <p className={`text-[13px] font-black tracking-tight ${m.active ? 'text-[#191919]' : 'text-[#B5A99A]'}`}>{m.label}</p>
                      <p className="text-[11px] font-bold text-[#B5A99A]">{m.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-10 pt-8 border-t border-black/[0.04]">
                <div className="bg-[#FAF8F5] rounded-xl p-4 flex items-center gap-3">
                   <Clock3 className="text-[#8A6F5F]" size={18} />
                   <div>
                     <p className="text-[10px] font-black uppercase tracking-widest text-[#8A6F5F]">Estimated Duration</p>
                     <p className="text-xs font-bold text-[#191919]">45 - 60 Minutes</p>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                  <div 
                    key={item.id} 
                    onClick={() => setSelectedBookingId(item.id)}
                    className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#2C2420] to-[#191919] p-4 text-white shadow-md cursor-pointer active:scale-[0.98] transition-all"
                  >
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
                  <div 
                    key={item.id} 
                    onClick={() => setSelectedBookingId(item.id)}
                    className="group flex items-center justify-between p-5 transition-colors hover:bg-[#FAF8F5] cursor-pointer"
                  >
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
