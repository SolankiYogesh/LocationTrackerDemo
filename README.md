# GeoAttendance

Geolocation tracking & geofence-based attendance app, built with React Native
(bare CLI, New Architecture).

## Features

- Live GPS tracking on a map
- 100m geofence around a fixed office location (`src/config/geofence.ts`)
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
  config/       office coordinates + geofence radius
  types/        AttendanceRecord
  constants/    colors
  services/     geolocation + storage
  hooks/        useLocationTracking, useIsOffline
  store/        useAttendanceStore (zustand)
  screens/      HomeScreen, HistoryScreen
  components/   StatusBanner, GeofenceMap, AttendanceListItem
  navigation/   RootNavigator
  utils/        haversine, date formatting
```

Each folder has an `index.ts` that re-exports everything in it.

In `__DEV__` builds, Home has a button to set the office to your current
location, for testing check-in without traveling to the real office.
