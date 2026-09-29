# GeoAttendance

Geolocation tracking & geofence-based attendance app, built with React Native
(bare CLI, New Architecture).

## Features

- Live GPS tracking on a map
- Geofence around an office location, configurable from Settings
- Check-in only works inside the geofence
- Attendance history stored on-device (AsyncStorage)
- Handles permission requests, GPS off, and offline usage

## Setup

```sh
npm install
```

### iOS

```sh
cd ios && bundle install && bundle exec pod install && cd ..
npm run ios
```

### Android

Copy `.env.example` to `.env` and add a Google Maps API key
([get one here](https://console.cloud.google.com/google/maps-apis/credentials)),
then:

```sh
npm run android
```

## Project structure

```
src/
  config/       default office coordinates + geofence radius
  types/        AttendanceRecord
  constants/    colors
  services/     geolocation + storage
  hooks/        useLocationTracking, useIsOffline
  store/        useAttendanceStore, useGeofenceStore (zustand)
  screens/      HomeScreen, HistoryScreen, SettingsScreen
  components/   StatusBanner, GeofenceMap, AttendanceListItem
  navigation/   RootNavigator
  utils/        haversine, date formatting (dayjs)
```

Each folder has an `index.ts` that re-exports everything in it.

## Settings

Settings lets you change the office location (tap the map) and the geofence
radius (+/- stepper, 20-500m). Changes save automatically to AsyncStorage and
apply immediately on Home. "Use my current location" sets the office to
wherever you are, and "Reset to default" restores the coordinates in
`src/config/geofence.ts`.
