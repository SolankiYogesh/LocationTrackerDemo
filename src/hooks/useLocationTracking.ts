import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import type { GeolocationResponse } from '@react-native-community/geolocation';
import {
  checkLocationPermission,
  clearWatch,
  isPositionUnavailableError,
  openAppSettings,
  requestLocationPermission,
  watchPosition,
  type PermissionState,
} from '../services';

interface LocationTrackingState {
  permission: PermissionState;
  coords: GeolocationResponse['coords'] | null;
  isGpsUnavailable: boolean;
  lastUpdatedAt: number | null;
  errorMessage: string | null;
}

const INITIAL_STATE: LocationTrackingState = {
  permission: 'unknown',
  coords: null,
  isGpsUnavailable: false,
  lastUpdatedAt: null,
  errorMessage: null,
};

export const useLocationTracking = () => {
  const [state, setState] = useState<LocationTrackingState>(INITIAL_STATE);
  const watchIdRef = useRef<number | null>(null);

  const stopWatching = useCallback(() => {
    if (watchIdRef.current !== null) {
      clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  const startWatching = useCallback(() => {
    stopWatching();
    watchIdRef.current = watchPosition(
      position => {
        setState(prev => ({
          ...prev,
          coords: position.coords,
          isGpsUnavailable: false,
          lastUpdatedAt: Date.now(),
          errorMessage: null,
        }));
      },
      error => {
        setState(prev => ({
          ...prev,
          isGpsUnavailable: isPositionUnavailableError(error),
          errorMessage: error.message,
        }));
      },
    );
  }, [stopWatching]);

  const evaluatePermission = useCallback(async () => {
    const current = await checkLocationPermission();
    setState(prev => ({ ...prev, permission: current }));
    if (current === 'granted') {
      startWatching();
    } else {
      stopWatching();
    }
    return current;
  }, [startWatching, stopWatching]);

  const requestPermission = useCallback(async () => {
    const result = await requestLocationPermission();
    setState(prev => ({ ...prev, permission: result }));
    if (result === 'granted') {
      startWatching();
    }
    return result;
  }, [startWatching]);

  useEffect(() => {
    evaluatePermission();
    return stopWatching;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextState => {
      if (nextState === 'active') {
        evaluatePermission();
      }
    });
    return () => subscription.remove();
  }, [evaluatePermission]);

  return useMemo(
    () => ({
      ...state,
      requestPermission,
      openAppSettings,
    }),
    [state, requestPermission],
  );
};
