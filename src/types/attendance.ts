export interface AttendanceRecord {
  id: string;
  timestamp: number;
  latitude: number;
  longitude: number;
  distanceFromOfficeMeters: number;
}
