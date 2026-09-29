import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import MapView, {
  Circle,
  Marker,
  PROVIDER_GOOGLE,
  type MapPressEvent,
  type Region,
} from 'react-native-maps';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { colors } from '../constants';
import type { GeofenceConfig } from '../config';

interface GeofenceMapProps {
  office: GeofenceConfig;
  userCoords: { latitude: number; longitude: number } | null;
  isInsideGeofence: boolean;
  onSelectLocation?: (coords: { latitude: number; longitude: number }) => void;
}

const GeofenceMap = React.memo(
  ({ office, userCoords, isInsideGeofence, onSelectLocation }: GeofenceMapProps) => {
    const mapRef = useRef<MapView>(null);
    const isMapReadyRef = useRef(false);
    const hasCenteredOnUserRef = useRef(false);

    const initialRegion: Region = useMemo(() => {
      const center = userCoords ?? office;
      return {
        latitude: center.latitude,
        longitude: center.longitude,
        latitudeDelta: 0.006,
        longitudeDelta: 0.006,
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const centerOnUser = useCallback(
      (coords: { latitude: number; longitude: number }) => {
        if (hasCenteredOnUserRef.current) return;
        if (!mapRef.current || !isMapReadyRef.current) return;
        hasCenteredOnUserRef.current = true;
        mapRef.current.animateToRegion(
          {
            latitude: coords.latitude,
            longitude: coords.longitude,
            latitudeDelta: 0.006,
            longitudeDelta: 0.006,
          },
          400,
        );
      },
      [],
    );

    useEffect(() => {
      if (userCoords) {
        centerOnUser(userCoords);
      }
    }, [userCoords, centerOnUser]);

    const handleMapReady = useCallback(() => {
      isMapReadyRef.current = true;
      if (userCoords) {
        centerOnUser(userCoords);
      }
    }, [userCoords, centerOnUser]);

    const handlePress = useCallback(
      (event: MapPressEvent) => {
        onSelectLocation?.(event.nativeEvent.coordinate);
      },
      [onSelectLocation],
    );

    return (
      <View style={styles.container}>
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFill}
          provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
          initialRegion={initialRegion}
          onMapReady={handleMapReady}
          onPress={onSelectLocation ? handlePress : undefined}
          showsUserLocation
          showsMyLocationButton
          loadingEnabled>
          <Circle
            center={{ latitude: office.latitude, longitude: office.longitude }}
            radius={office.radiusMeters}
            strokeWidth={2}
            strokeColor={isInsideGeofence ? colors.success : colors.primary}
            fillColor={
              isInsideGeofence ? colors.mapFillInside : colors.mapFillOutside
            }
          />
          <Marker
            coordinate={{
              latitude: office.latitude,
              longitude: office.longitude,
            }}
            title={office.label}
            description="Fixed office geofence"
            pinColor={colors.primary}
          />
          {userCoords ? (
            <Marker
              coordinate={userCoords}
              title="You"
              pinColor={isInsideGeofence ? colors.success : colors.danger}
            />
          ) : null}
        </MapView>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    height: verticalScale(280),
    borderRadius: moderateScale(16),
    overflow: 'hidden',
    marginHorizontal: scale(16),
    marginBottom: verticalScale(12),
    backgroundColor: colors.border,
  },
});

export default GeofenceMap;
