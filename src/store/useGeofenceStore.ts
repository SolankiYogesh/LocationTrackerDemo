import { create } from 'zustand';
import type { GeofenceConfig } from '../config';
import { OFFICE_GEOFENCE } from '../config';
import { loadGeofenceSettings, saveGeofenceSettings } from '../services';

const MIN_RADIUS_METERS = 20;
const MAX_RADIUS_METERS = 500;

interface GeofenceState {
  office: GeofenceConfig;
  hydrated: boolean;
  hydrate: () => void;
  setLocation: (latitude: number, longitude: number) => void;
  setRadius: (radiusMeters: number) => void;
  resetToDefault: () => void;
}

export const useGeofenceStore = create<GeofenceState>((set, get) => ({
  office: OFFICE_GEOFENCE,
  hydrated: false,

  hydrate: () => {
    const saved = loadGeofenceSettings();
    set({ office: saved ?? OFFICE_GEOFENCE, hydrated: true });
  },

  setLocation: (latitude, longitude) => {
    const next = { ...get().office, latitude, longitude };
    set({ office: next });
    saveGeofenceSettings(next);
  },

  setRadius: radiusMeters => {
    const clamped = Math.min(
      MAX_RADIUS_METERS,
      Math.max(MIN_RADIUS_METERS, radiusMeters),
    );
    const next = { ...get().office, radiusMeters: clamped };
    set({ office: next });
    saveGeofenceSettings(next);
  },

  resetToDefault: () => {
    set({ office: OFFICE_GEOFENCE });
    saveGeofenceSettings(OFFICE_GEOFENCE);
  },
}));

export { MIN_RADIUS_METERS, MAX_RADIUS_METERS };
