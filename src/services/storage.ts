import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AttendanceRecord } from '../types';
import type { GeofenceConfig } from '../config';

const ATTENDANCE_RECORDS_KEY = '@geo_attendance/records';
const GEOFENCE_SETTINGS_KEY = '@geo_attendance/geofence_settings';

export const loadAttendanceRecords = async (): Promise<AttendanceRecord[]> => {
  try {
    const raw = await AsyncStorage.getItem(ATTENDANCE_RECORDS_KEY);
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

export const saveAttendanceRecords = async (
  records: AttendanceRecord[],
): Promise<void> => {
  try {
    await AsyncStorage.setItem(
      ATTENDANCE_RECORDS_KEY,
      JSON.stringify(records),
    );
  } catch (error) {
    console.warn('[storage] Failed to save attendance records', error);
  }
};

export const loadGeofenceSettings = async (): Promise<GeofenceConfig | null> => {
  try {
    const raw = await AsyncStorage.getItem(GEOFENCE_SETTINGS_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as GeofenceConfig;
  } catch (error) {
    console.warn('[storage] Failed to load geofence settings', error);
    return null;
  }
};

export const saveGeofenceSettings = async (
  settings: GeofenceConfig,
): Promise<void> => {
  try {
    await AsyncStorage.setItem(GEOFENCE_SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.warn('[storage] Failed to save geofence settings', error);
  }
};
