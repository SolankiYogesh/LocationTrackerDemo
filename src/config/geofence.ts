export interface GeofenceConfig {
  latitude: number;
  longitude: number;
  radiusMeters: number;
  label: string;
}

export const OFFICE_GEOFENCE: GeofenceConfig = {
  latitude: 37.42199,
  longitude: -122.08405,
  radiusMeters: 100,
  label: 'Head Office',
};
