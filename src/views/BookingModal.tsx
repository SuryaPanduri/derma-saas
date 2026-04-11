import { useEffect, useMemo, useState } from 'react';
import { useCreateBooking, useSlots } from '@/hooks';
import { useAuthStore } from '@/store';
import type { ServiceDTO } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatDateLabel, toISODate } from '@/utils/dateUtils';
import { formatMoney } from '@/utils/moneyUtils';
import { Clock, Calendar, X, Info } from 'lucide-react';

interface BookingModalProps {
  service: ServiceDTO | null;
  clinicId: string;
  onClose: () => void;
  onBookingSuccess?: (message: string) => void;
  onBookingError?: (message: string) => void;
}

export const BookingModal = ({ service, clinicId, onClose, onBookingSuccess, onBookingError }: BookingModalProps) => {
  const user = useAuthStore((state) => state.user);
  const { mutateAsync, isLoading } = useCreateBooking();
  const [dateISO, setDateISO] = useState(toISODate(new Date()));
  const [timeSlot, setTimeSlot] = useState('');
  const [notes, setNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const slotsQuery = useSlots(dateISO, clinicId);
  const availableSlots = slotsQuery.data.filter((slot) => !slot.isBooked);

  useEffect(() => {
    if (!slotsQuery.data.length) {
      setTimeSlot('');
      return;
    }
    const firstAvailable = availableSlots[0]?.timeSlot ?? '';
    if (!firstAvailable) {
      setTimeSlot('');
      return;
    }
    if (!slotsQuery.data.some((slot) => slot.timeSlot === timeSlot && !slot.isBooked)) {
      setTimeSlot(firstAvailable);
    }
  }, [availableSlots, slotsQuery.data, timeSlot]);

  const canSubmit = useMemo(() => Boolean(service && user && dateISO && timeSlot), [service, user, dateISO, timeSlot]);

  if (!service) return null;

  const handleSubmit = async () => {
    if (!user || !canSubmit) return;
    try {
      setErrorMessage('');
      await mutateAsync({
        patientUid: user.id,
        clinicId,
        serviceId: service.id,
        serviceName: service.name,
        dateISO,
        timeSlot,
        notes
      });
      onBookingSuccess?.('Booking confirmed successfully.');
      onClose();
    } catch (error) {
      const message =
        typeof error === 'object' && error !== null && 'message' in error
          ? String((error as { message: unknown }).message)
          : 'Unable to complete booking.';
      setErrorMessage(message);
      onBookingError?.(message);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-xl border border-[#E8E2DC] bg-white shadow-xl animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E8E2DC] px-6 py-4">
          <div>
            <h3 className="font-['Playfair_Display'] text-lg font-bold text-[#2C2420]">{service.name}</h3>
            <div className="mt-1 flex items-center gap-4 text-[12px] text-[#B5A99A]">
              <span className="flex items-center gap-1"><Clock size={12} /> {service.durationMinutes} min</span>
              <span>{formatMoney(service.priceCents)}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-[#B5A99A] hover:text-[#1A1A1A] transition-colors rounded-lg hover:bg-[#F5F0EB]">
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-[12px] font-medium text-[#8A6F5F] mb-1.5">Date</label>
            <div className="relative">
              <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#B5A99A]" />
              <Input
                type="date"
                value={dateISO}
                min={toISODate(new Date())}
                onChange={(e) => setDateISO(e.target.value)}
                className="h-10 pl-10 rounded-lg border-[#E8E2DC] bg-[#FAFAF8] text-sm focus:bg-white focus:border-[#8A6F5F]"
              />
            </div>
            <p className="mt-1 text-[11px] text-[#B5A99A]">{formatDateLabel(dateISO)}</p>
          </div>

          <div>
            <label className="block text-[12px] font-medium text-[#8A6F5F] mb-2">Time</label>
            {slotsQuery.isLoading ? (
              <div className="flex gap-2">
                {[1,2,3].map(i => <div key={i} className="h-9 w-20 animate-pulse rounded-lg bg-[#F5F0EB]" />)}
              </div>
            ) : !slotsQuery.data.length ? (
              <p className="flex items-center gap-2 text-[13px] text-red-600"><Info size={14} /> No slots for this date.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {slotsQuery.data.map((slot) => (
                  <button
                    key={slot.timeSlot}
                    onClick={() => !slot.isBooked && setTimeSlot(slot.timeSlot)}
                    disabled={slot.isBooked}
                    className={`h-9 rounded-lg px-4 text-[13px] font-medium transition-colors ${
                      timeSlot === slot.timeSlot
                        ? 'bg-[#8A6F5F] text-white'
                        : slot.isBooked
                          ? 'bg-[#F5F0EB] text-[#D4C8BC] cursor-not-allowed'
                          : 'border border-[#E8E2DC] bg-white text-[#1A1A1A] hover:border-[#8A6F5F]'
                    }`}
                  >
                    {slot.timeSlot}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-[12px] font-medium text-[#8A6F5F] mb-1.5">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[80px] w-full rounded-lg border border-[#E8E2DC] bg-[#FAFAF8] p-3 text-sm outline-none focus:bg-white focus:border-[#8A6F5F] transition-colors placeholder:text-[#D4C8BC]"
              placeholder="Any concerns or symptoms..."
            />
          </div>

          {errorMessage && (
            <p className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-100 p-3 text-[13px] text-red-600">
              <Info size={14} /> {errorMessage}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-[#E8E2DC] px-6 py-4">
          <Button variant="ghost" onClick={onClose} className="text-[13px] text-[#B5A99A] hover:text-[#1A1A1A]">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit || isLoading}
            className="h-10 rounded-lg bg-[#1A1A1A] px-6 text-[13px] font-medium text-white hover:bg-[#8A6F5F] transition-colors disabled:opacity-40"
          >
            {isLoading ? 'Booking...' : 'Confirm Booking'}
          </Button>
        </div>
      </div>
    </div>
  );
};
