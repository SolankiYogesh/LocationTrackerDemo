import React, { useCallback, useEffect, useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { useLocationTracking } from '../hooks';
import {
  useGeofenceStore,
  MIN_RADIUS_METERS,
  MAX_RADIUS_METERS,
} from '../store';
import { GeofenceMap } from '../components';
import { colors } from '../constants';

const RADIUS_STEP_METERS = 10;

const SettingsScreen = React.memo(() => {
  const { coords } = useLocationTracking();

  const office = useGeofenceStore(state => state.office);
  const hydrated = useGeofenceStore(state => state.hydrated);
  const hydrate = useGeofenceStore(state => state.hydrate);
  const setLocation = useGeofenceStore(state => state.setLocation);
  const setRadius = useGeofenceStore(state => state.setRadius);
  const resetToDefault = useGeofenceStore(state => state.resetToDefault);

  useEffect(() => {
    if (!hydrated) {
      hydrate();
    }
  }, [hydrated, hydrate]);

  const handleSelectLocation = useCallback(
    (selected: { latitude: number; longitude: number }) => {
      setLocation(selected.latitude, selected.longitude);
    },
    [setLocation],
  );

  const handleUseCurrentLocation = useCallback(() => {
    if (!coords) return;
    setLocation(coords.latitude, coords.longitude);
  }, [coords, setLocation]);

  const handleDecreaseRadius = useCallback(() => {
    setRadius(office.radiusMeters - RADIUS_STEP_METERS);
  }, [office.radiusMeters, setRadius]);

  const handleIncreaseRadius = useCallback(() => {
    setRadius(office.radiusMeters + RADIUS_STEP_METERS);
  }, [office.radiusMeters, setRadius]);

  const userCoords = useMemo(
    () => (coords ? { latitude: coords.latitude, longitude: coords.longitude } : null),
    [coords],
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.hint}>Tap the map to set the office location.</Text>

        <GeofenceMap
          office={office}
          userCoords={userCoords}
          isInsideGeofence={false}
          onSelectLocation={handleSelectLocation}
        />

        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Latitude</Text>
            <Text style={styles.value}>{office.latitude.toFixed(5)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Longitude</Text>
            <Text style={styles.value}>{office.longitude.toFixed(5)}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Geofence radius</Text>
          <View style={styles.stepperRow}>
            <Pressable
              onPress={handleDecreaseRadius}
              disabled={office.radiusMeters <= MIN_RADIUS_METERS}
              style={[
                styles.stepperButton,
                office.radiusMeters <= MIN_RADIUS_METERS && styles.stepperButtonDisabled,
              ]}>
              <Text style={styles.stepperButtonText}>−</Text>
            </Pressable>
            <Text style={styles.radiusValue}>{office.radiusMeters} m</Text>
            <Pressable
              onPress={handleIncreaseRadius}
              disabled={office.radiusMeters >= MAX_RADIUS_METERS}
              style={[
                styles.stepperButton,
                office.radiusMeters >= MAX_RADIUS_METERS && styles.stepperButtonDisabled,
              ]}>
              <Text style={styles.stepperButtonText}>+</Text>
            </Pressable>
          </View>
        </View>

        <Pressable
          onPress={handleUseCurrentLocation}
          disabled={!coords}
          style={[styles.actionButton, !coords && styles.actionButtonDisabled]}>
          <Text style={styles.actionButtonText}>Use my current location</Text>
        </Pressable>

        <Pressable onPress={resetToDefault} style={styles.resetButton}>
          <Text style={styles.resetButtonText}>Reset to default</Text>
        </Pressable>

        <Text style={styles.footnote}>Changes are saved automatically.</Text>
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
  hint: {
    fontSize: moderateScale(13),
    color: colors.textMuted,
    marginHorizontal: scale(16),
    marginBottom: verticalScale(10),
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: moderateScale(13),
    color: colors.textMuted,
  },
  value: {
    fontSize: moderateScale(13),
    fontWeight: '600',
    color: colors.textPrimary,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(20),
    marginTop: verticalScale(6),
  },
  stepperButton: {
    width: scale(40),
    height: verticalScale(40),
    borderRadius: moderateScale(20),
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperButtonDisabled: {
    opacity: 0.4,
  },
  stepperButtonText: {
    fontSize: moderateScale(20),
    fontWeight: '700',
    color: colors.textPrimary,
  },
  radiusValue: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    color: colors.textPrimary,
    minWidth: scale(70),
    textAlign: 'center',
  },
  actionButton: {
    marginHorizontal: scale(16),
    marginBottom: verticalScale(12),
    backgroundColor: colors.primary,
    borderRadius: moderateScale(14),
    paddingVertical: verticalScale(14),
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonDisabled: {
    backgroundColor: colors.disabled,
  },
  actionButtonText: {
    color: colors.white,
    fontSize: moderateScale(15),
    fontWeight: '700',
  },
  resetButton: {
    marginHorizontal: scale(16),
    paddingVertical: verticalScale(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetButtonText: {
    color: colors.dangerDark,
    fontSize: moderateScale(14),
    fontWeight: '600',
  },
  footnote: {
    fontSize: moderateScale(12),
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: verticalScale(8),
  },
});

export default SettingsScreen;
