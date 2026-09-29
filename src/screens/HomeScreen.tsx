import React, { useCallback, useEffect, useMemo } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { History, Settings } from 'lucide-react-native';
import { useLocationTracking, useIsOffline } from '../hooks';
import { useAttendanceStore, useGeofenceStore } from '../store';
import { StatusBanner, GeofenceMap } from '../components';
import { colors } from '../constants';
import { haversineDistanceMeters, formatDateTime } from '../utils';
import type { RootStackParamList } from '../navigation';

type HomeNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const HistoryHeaderIcon = React.memo(
  ({ onPress }: { onPress: () => void }) => (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel="Attendance history">
      <History size={moderateScale(22)} color={colors.textPrimary} />
    </Pressable>
  ),
);

const SettingsHeaderIcon = React.memo(
  ({ onPress }: { onPress: () => void }) => (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel="Settings">
      <Settings size={moderateScale(22)} color={colors.textPrimary} />
    </Pressable>
  ),
);

const HomeScreen = React.memo(() => {
  const navigation = useNavigation<HomeNavigationProp>();
  const {
    permission,
    coords,
    isGpsUnavailable,
    errorMessage,
    requestPermission,
    openAppSettings,
    enableGps,
  } = useLocationTracking();
  const isOffline = useIsOffline();

  const records = useAttendanceStore(state => state.records);
  const hydrated = useAttendanceStore(state => state.hydrated);
  const hydrate = useAttendanceStore(state => state.hydrate);
  const checkIn = useAttendanceStore(state => state.checkIn);
  const hasCheckedInToday = useAttendanceStore(state => state.hasCheckedInToday);

  const office = useGeofenceStore(state => state.office);
  const geofenceHydrated = useGeofenceStore(state => state.hydrated);
  const hydrateGeofence = useGeofenceStore(state => state.hydrate);

  const goToHistory = useCallback(() => {
    navigation.navigate('History');
  }, [navigation]);

  const goToSettings = useCallback(() => {
    navigation.navigate('Settings');
  }, [navigation]);

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => <HistoryHeaderIcon onPress={goToHistory} />,
      headerRight: () => <SettingsHeaderIcon onPress={goToSettings} />,
    });
  }, [navigation, goToHistory, goToSettings]);

  useEffect(() => {
    if (!hydrated) {
      hydrate();
    }
  }, [hydrated, hydrate]);

  useEffect(() => {
    if (!geofenceHydrated) {
      hydrateGeofence();
    }
  }, [geofenceHydrated, hydrateGeofence]);

  const userCoords = useMemo(
    () => (coords ? { latitude: coords.latitude, longitude: coords.longitude } : null),
    [coords],
  );

  const distanceMeters = useMemo(() => {
    if (!coords) return null;
    return haversineDistanceMeters(
      coords.latitude,
      coords.longitude,
      office.latitude,
      office.longitude,
    );
  }, [coords, office.latitude, office.longitude]);

  const isInsideGeofence = useMemo(
    () => distanceMeters !== null && distanceMeters <= office.radiusMeters,
    [distanceMeters, office.radiusMeters],
  );

  const alreadyCheckedInToday = hasCheckedInToday();

  const canCheckIn = useMemo(
    () =>
      permission === 'granted' &&
      !!coords &&
      isInsideGeofence &&
      !alreadyCheckedInToday,
    [permission, coords, isInsideGeofence, alreadyCheckedInToday],
  );

  const handleCheckIn = useCallback(() => {
    if (!coords || distanceMeters === null) return;
    checkIn({
      latitude: coords.latitude,
      longitude: coords.longitude,
      distanceFromOfficeMeters: distanceMeters,
    });
  }, [coords, distanceMeters, checkIn]);

  const latestRecord = useMemo(() => records[0] ?? null, [records]);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {permission === 'denied' && (
          <StatusBanner
            tone="warning"
            message="Location permission is required to check in."
            actionLabel="Enable"
            onAction={requestPermission}
          />
        )}
        {permission === 'blocked' && (
          <StatusBanner
            tone="error"
            message="Location permission was denied. Enable it in Settings to continue."
            actionLabel="Open Settings"
            onAction={openAppSettings}
          />
        )}
        {permission === 'unavailable' && (
          <StatusBanner
            tone="error"
            message="Location services aren't available on this device."
          />
        )}
        {isGpsUnavailable && (
          <StatusBanner
            tone="error"
            message="Can't get a GPS fix. Make sure Location Services are turned on."
            actionLabel={Platform.OS === 'android' ? 'Enable' : undefined}
            onAction={Platform.OS === 'android' ? enableGps : undefined}
          />
        )}
        {isOffline && (
          <StatusBanner
            tone="info"
            message="You're offline. Check-ins are saved locally on this device."
          />
        )}

        <GeofenceMap
          office={office}
          userCoords={userCoords}
          isInsideGeofence={isInsideGeofence}
        />

        <View style={styles.card}>
          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>Office</Text>
            <Text style={styles.cardValue}>{office.label}</Text>
          </View>
          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>Geofence radius</Text>
            <Text style={styles.cardValue}>{office.radiusMeters} m</Text>
          </View>
          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>Distance to office</Text>
            <Text style={styles.cardValue}>
              {distanceMeters !== null
                ? `${distanceMeters.toFixed(0)} m`
                : '—'}
            </Text>
          </View>
          <View
            style={[
              styles.badge,
              isInsideGeofence ? styles.badgeInside : styles.badgeOutside,
            ]}>
            <Text
              style={[
                styles.badgeText,
                isInsideGeofence
                  ? styles.badgeTextInside
                  : styles.badgeTextOutside,
              ]}>
              {isInsideGeofence ? 'Inside geofence' : 'Outside geofence'}
            </Text>
          </View>
        </View>

        {latestRecord && (
          <Text style={styles.lastCheckIn}>
            Last check-in: {formatDateTime(latestRecord.timestamp)}
          </Text>
        )}

        <Pressable
          onPress={handleCheckIn}
          disabled={!canCheckIn}
          style={[styles.checkInButton, !canCheckIn && styles.buttonDisabled]}>
          <Text style={styles.checkInButtonText}>
            {alreadyCheckedInToday ? 'Already checked in today' : 'Check In'}
          </Text>
        </Pressable>

        {!canCheckIn && !alreadyCheckedInToday && permission === 'granted' && (
          <Text style={styles.hint}>
            {coords
              ? 'Move inside the office geofence to enable check-in.'
              : 'Waiting for a GPS fix…'}
          </Text>
        )}

        {errorMessage && (
          <Text style={styles.errorText}>{errorMessage}</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingTop: verticalScale(12),
    paddingBottom: verticalScale(32),
  },
  card: {
    marginHorizontal: scale(16),
    marginBottom: verticalScale(12),
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(16),
    borderRadius: moderateScale(16),
    backgroundColor: colors.white,
    gap: verticalScale(8),
    shadowColor: colors.black,
    shadowOpacity: 0.04,
    shadowRadius: moderateScale(8),
    shadowOffset: { width: 0, height: verticalScale(2) },
    elevation: 1,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardLabel: {
    fontSize: moderateScale(13),
    color: colors.textMuted,
  },
  cardValue: {
    fontSize: moderateScale(13),
    fontWeight: '600',
    color: colors.textPrimary,
  },
  badge: {
    marginTop: verticalScale(4),
    alignSelf: 'flex-start',
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(999),
  },
  badgeInside: {
    backgroundColor: colors.successLight,
  },
  badgeOutside: {
    backgroundColor: colors.badgeOutsideBg,
  },
  badgeText: {
    fontSize: moderateScale(12),
    fontWeight: '700',
  },
  badgeTextInside: {
    color: colors.successDark,
  },
  badgeTextOutside: {
    color: colors.textMuted,
  },
  lastCheckIn: {
    marginHorizontal: scale(16),
    marginBottom: verticalScale(12),
    fontSize: moderateScale(12),
    color: colors.textMuted,
  },
  checkInButton: {
    marginHorizontal: scale(16),
    backgroundColor: colors.success,
    borderRadius: moderateScale(14),
    paddingVertical: verticalScale(16),
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: colors.disabled,
  },
  checkInButtonText: {
    color: colors.white,
    fontSize: moderateScale(16),
    fontWeight: '700',
  },
  hint: {
    marginTop: verticalScale(10),
    marginHorizontal: scale(16),
    fontSize: moderateScale(12),
    color: colors.textMuted,
    textAlign: 'center',
  },
  errorText: {
    marginTop: verticalScale(10),
    marginHorizontal: scale(16),
    fontSize: moderateScale(12),
    color: colors.dangerDark,
    textAlign: 'center',
  },
});

export default HomeScreen;
