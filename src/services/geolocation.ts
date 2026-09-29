import { Platform } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import type {
  GeolocationError,
  GeolocationResponse,
} from '@react-native-community/geolocation';
import {
  check,
  openSettings,
  PERMISSIONS,
  request,
  RESULTS,
} from 'react-native-permissions';
import { promptForEnableLocationIfNeeded } from 'react-native-android-location-enabler';

Geolocation.setRNConfiguration({
  skipPermissionRequests: true,
  authorizationLevel: 'whenInUse',
  enableBackgroundLocationUpdates: false,
});

export type PermissionState =
  | 'unknown'
  | 'granted'
  | 'denied'
  | 'blocked'
  | 'unavailable';

export const isPositionUnavailableError = (error: GeolocationError): boolean =>
  error.code === error.POSITION_UNAVAILABLE;

const locationPermission = () =>
  Platform.OS === 'ios'
    ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
    : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;

const mapResult = (result: string): PermissionState => {
  switch (result) {
    case RESULTS.GRANTED:
    case RESULTS.LIMITED:
      return 'granted';
    case RESULTS.DENIED:
      return 'denied';
    case RESULTS.BLOCKED:
      return 'blocked';
    case RESULTS.UNAVAILABLE:
      return 'unavailable';
    default:
      return 'unknown';
  }
};

export const checkLocationPermission = async (): Promise<PermissionState> => {
  const result = await check(locationPermission());
  return mapResult(result);
};

export const requestLocationPermission = async (): Promise<PermissionState> => {
  const result = await request(locationPermission());
  return mapResult(result);
};

export const openAppSettings = (): Promise<void> => openSettings();

export const promptEnableGps = async (): Promise<void> => {
  if (Platform.OS !== 'android') return;
  try {
    await promptForEnableLocationIfNeeded();
  } catch (error) {
    console.warn('[geolocation] Failed to enable GPS', error);
  }
};

export const getCurrentPosition = (): Promise<GeolocationResponse> =>
  new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 10000,
    });
  });

export const watchPosition = (
  onSuccess: (position: GeolocationResponse) => void,
  onError: (error: GeolocationError) => void,
): number =>
  Geolocation.watchPosition(onSuccess, onError, {
    enableHighAccuracy: true,
    distanceFilter: 5,
    interval: 4000,
    fastestInterval: 2000,
  });

export const clearWatch = (watchId: number): void => {
  Geolocation.clearWatch(watchId);
};
