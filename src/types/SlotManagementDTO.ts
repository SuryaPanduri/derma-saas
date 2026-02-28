export type WeekdayKey = 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat';

export interface SlotDateOverrideDTO {
  dateISO: string;
  slots: string[];
  isClosed: boolean;
}

export interface SlotManagementDTO {
  clinicId: string;
  weeklySlots: Record<WeekdayKey, string[]>;
  blockedDates: string[];
  overrides: SlotDateOverrideDTO[];
  createdAt: string;
  updatedAt: string;
}
