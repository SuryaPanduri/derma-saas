import { useEffect, useMemo, useState } from 'react';
import { useCreateBooking, useSlots } from '@/hooks';
import { useAuthStore } from '@/store';
import type { ServiceDTO } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatDateLabel, toISODate } from '@/utils/dateUtils';

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

  if (!service) {
    return null;
  }

  const handleSubmit = async () => {
    if (!user || !canSubmit) {
      return;
    }

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 p-3 sm:p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl border border-white/40 bg-white/45 p-4 shadow-glass backdrop-blur-xl sm:p-6">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-slate-800">Book {service.name}</h3>
          <p className="text-sm text-slate-700">Choose a date and session for your dermatology visit.</p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Date</label>
            <Input type="date" value={dateISO} min={toISODate(new Date())} onChange={(e) => setDateISO(e.target.value)} />
            <p className="mt-1 text-xs text-slate-600">{formatDateLabel(dateISO)}</p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Time Slot</label>
            {slotsQuery.isLoading ? (
              <p className="text-sm text-slate-600">Loading available slots...</p>
            ) : !slotsQuery.data.length ? (
              <p className="text-sm text-rose-700">No slots configured for this date.</p>
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {slotsQuery.data.map((slot) => (
                  <button
                    key={slot.timeSlot}
                    onClick={() => !slot.isBooked && setTimeSlot(slot.timeSlot)}
                    disabled={slot.isBooked}
                    className={`rounded-lg border px-2 py-1.5 text-sm font-medium transition ${
                      timeSlot === slot.timeSlot
                        ? 'border-teal-600 bg-teal-600 text-white'
                        : slot.isBooked
                          ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400'
                          : 'border-slate-300 bg-white/80 text-slate-700'
                    }`}
                  >
                    {slot.timeSlot}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-24 w-full rounded-xl border border-slate-200 bg-white/80 p-3 text-sm outline-none ring-teal-400 focus:ring-2"
              placeholder="Any symptoms or concerns"
            />
          </div>
        </div>

        {errorMessage ? <p className="mt-3 text-sm text-rose-700">{errorMessage}</p> : null}

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit || isLoading}>
            {isLoading ? 'Booking...' : 'Confirm Booking'}
          </Button>
        </div>
      </div>
    </div>
  );
};
