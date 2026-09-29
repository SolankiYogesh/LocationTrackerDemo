import { create } from 'zustand';
import type { AttendanceRecord } from '../types';
import { loadAttendanceRecords, saveAttendanceRecords } from '../services';
import { isSameDay } from '../utils';

interface AttendanceState {
  records: AttendanceRecord[];
  hydrated: boolean;
  hydrate: () => Promise<void>;
  checkIn: (
    input: Omit<AttendanceRecord, 'id' | 'timestamp'>,
  ) => Promise<AttendanceRecord>;
  hasCheckedInToday: () => boolean;
}

export const useAttendanceStore = create<AttendanceState>((set, get) => ({
  records: [],
  hydrated: false,

  hydrate: async () => {
    const records = await loadAttendanceRecords();
    set({
      records: [...records].sort((a, b) => b.timestamp - a.timestamp),
      hydrated: true,
    });
  },

  checkIn: async input => {
    const record: AttendanceRecord = {
      ...input,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      timestamp: Date.now(),
    };
    const next = [record, ...get().records];
    set({ records: next });
    await saveAttendanceRecords(next);
    return record;
  },

  hasCheckedInToday: () => {
    const now = Date.now();
    return get().records.some(record => isSameDay(record.timestamp, now));
  },
}));
