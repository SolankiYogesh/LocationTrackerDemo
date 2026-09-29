import { createMMKV } from 'react-native-mmkv';
import type { AttendanceRecord } from '../types';
import type { GeofenceConfig } from '../config';

const storage = createMMKV();

const ATTENDANCE_RECORDS_KEY = '@geo_attendance/records';
const GEOFENCE_SETTINGS_KEY = '@geo_attendance/geofence_settings';

export const loadAttendanceRecords = (): AttendanceRecord[] => {
  try {
    const raw = storage.getString(ATTENDANCE_RECORDS_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as AttendanceRecord[]) : [];
  } catch (error) {
    console.warn('[storage] Failed to load attendance records', error);
    return [];
  }
};

export const saveAttendanceRecords = (records: AttendanceRecord[]): void => {
  try {
    storage.set(ATTENDANCE_RECORDS_KEY, JSON.stringify(records));
  } catch (error) {
    console.warn('[storage] Failed to save attendance records', error);
  }
};

export const loadGeofenceSettings = (): GeofenceConfig | null => {
  try {
    const raw = storage.getString(GEOFENCE_SETTINGS_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as GeofenceConfig;
  } catch (error) {
    console.warn('[storage] Failed to load geofence settings', error);
    return null;
  }
};

export const saveGeofenceSettings = (settings: GeofenceConfig): void => {
  try {
    storage.set(GEOFENCE_SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.warn('[storage] Failed to save geofence settings', error);
  }
};
