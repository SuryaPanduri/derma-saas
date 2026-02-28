import { toISO } from '@/api/dto/normalizers';
import type { SlotDateOverrideDTO, SlotManagementDTO, WeekdayKey } from '@/types';

const DEFAULT_TIME_SLOTS = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];

export const WEEKDAY_ORDER: WeekdayKey[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

const DAY_INDEX_TO_KEY: WeekdayKey[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

const normalizeTimeSlot = (value: string): string | null => {
  const cleaned = value.trim();
  const match = cleaned.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) {
    return null;
  }
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (!Number.isInteger(hour) || !Number.isInteger(minute) || hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    return null;
  }
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
};

const sortUniqueSlots = (slots: string[]): string[] =>
  [...new Set(slots.map((slot) => normalizeTimeSlot(slot)).filter((slot): slot is string => Boolean(slot)))].sort((a, b) =>
    a.localeCompare(b)
  );

const normalizeDateISO = (value: string): string | null => {
  const cleaned = value.trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(cleaned) ? cleaned : null;
};

const normalizeOverrides = (rawOverrides: unknown): SlotDateOverrideDTO[] => {
  if (Array.isArray(rawOverrides)) {
    return rawOverrides
      .map((item) => {
        const record = item as Record<string, unknown>;
        const dateISO = normalizeDateISO(String(record.dateISO ?? ''));
        if (!dateISO) {
          return null;
        }
        return {
          dateISO,
          slots: sortUniqueSlots(Array.isArray(record.slots) ? record.slots.map(String) : []),
          isClosed: Boolean(record.isClosed)
        };
      })
      .filter((value): value is SlotDateOverrideDTO => Boolean(value))
      .sort((a, b) => a.dateISO.localeCompare(b.dateISO));
  }

  if (rawOverrides && typeof rawOverrides === 'object') {
    return Object.entries(rawOverrides as Record<string, unknown>)
      .map(([dateISO, value]) => {
        const normalizedDate = normalizeDateISO(dateISO);
        if (!normalizedDate) {
          return null;
        }
        const record = (value ?? {}) as Record<string, unknown>;
        return {
          dateISO: normalizedDate,
          slots: sortUniqueSlots(Array.isArray(record.slots) ? record.slots.map(String) : []),
          isClosed: Boolean(record.isClosed)
        };
      })
      .filter((value): value is SlotDateOverrideDTO => Boolean(value))
      .sort((a, b) => a.dateISO.localeCompare(b.dateISO));
  }

  return [];
};

const defaultWeeklySlots = (): Record<WeekdayKey, string[]> => ({
  sun: [],
  mon: [...DEFAULT_TIME_SLOTS],
  tue: [...DEFAULT_TIME_SLOTS],
  wed: [...DEFAULT_TIME_SLOTS],
  thu: [...DEFAULT_TIME_SLOTS],
  fri: [...DEFAULT_TIME_SLOTS],
  sat: [...DEFAULT_TIME_SLOTS]
});

export const buildDefaultSlotManagement = (clinicId: string): SlotManagementDTO => {
  const now = new Date().toISOString();
  return {
    clinicId,
    weeklySlots: defaultWeeklySlots(),
    blockedDates: [],
    overrides: [],
    createdAt: now,
    updatedAt: now
  };
};

export const normalizeSlotManagement = (clinicId: string, data: Record<string, unknown> | null): SlotManagementDTO => {
  const fallback = buildDefaultSlotManagement(clinicId);
  if (!data) {
    return fallback;
  }

  const rawWeeklySlots = (data.weeklySlots ?? {}) as Record<string, unknown>;
  const weeklySlots = WEEKDAY_ORDER.reduce<Record<WeekdayKey, string[]>>((acc, day) => {
    const value = rawWeeklySlots[day];
    acc[day] = sortUniqueSlots(Array.isArray(value) ? value.map(String) : fallback.weeklySlots[day]);
    return acc;
  }, defaultWeeklySlots());

  const blockedDates = [...new Set((Array.isArray(data.blockedDates) ? data.blockedDates : []).map(String))]
    .map(normalizeDateISO)
    .filter((value): value is string => Boolean(value))
    .sort((a, b) => a.localeCompare(b));

  return {
    clinicId,
    weeklySlots,
    blockedDates,
    overrides: normalizeOverrides(data.overrides),
    createdAt: toISO(data.createdAt),
    updatedAt: toISO(data.updatedAt)
  };
};

export const resolveSlotsForDate = (config: SlotManagementDTO, dateISO: string): string[] => {
  const validDateISO = normalizeDateISO(dateISO);
  if (!validDateISO) {
    return [];
  }

  if (config.blockedDates.includes(validDateISO)) {
    return [];
  }

  const override = config.overrides.find((item) => item.dateISO === validDateISO);
  if (override) {
    if (override.isClosed) {
      return [];
    }
    return sortUniqueSlots(override.slots);
  }

  const dayIndex = new Date(`${validDateISO}T00:00:00`).getDay();
  const weekday = DAY_INDEX_TO_KEY[dayIndex] ?? 'mon';
  return sortUniqueSlots(config.weeklySlots[weekday] ?? []);
};
