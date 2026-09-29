import React, { useCallback, useEffect } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { useAttendanceStore } from '../store';
import { AttendanceListItem } from '../components';
import { colors } from '../constants';
import type { AttendanceRecord } from '../types';

const keyExtractor = (record: AttendanceRecord) => record.id;

const EmptyHistory = React.memo(() => (
  <View style={styles.empty}>
    <Text style={styles.emptyTitle}>No attendance yet</Text>
    <Text style={styles.emptySubtitle}>
      Check in from the Home screen while inside the office geofence.
    </Text>
  </View>
));

const HistoryScreen = React.memo(() => {
  const records = useAttendanceStore(state => state.records);
  const hydrated = useAttendanceStore(state => state.hydrated);
  const hydrate = useAttendanceStore(state => state.hydrate);

  useEffect(() => {
    if (!hydrated) {
      hydrate();
    }
  }, [hydrated, hydrate]);

  const renderItem = useCallback(
    ({ item }: { item: AttendanceRecord }) => (
      <AttendanceListItem record={item} />
    ),
    [],
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={records}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={
          records.length === 0 ? styles.emptyContainer : undefined
        }
        ListEmptyComponent={EmptyHistory}
      />
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  emptyContainer: {
    flexGrow: 1,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: scale(32),
    gap: verticalScale(6),
  },
  emptyTitle: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: colors.textPrimary,
  },
  emptySubtitle: {
    fontSize: moderateScale(13),
    color: colors.textMuted,
    textAlign: 'center',
  },
});

export default HistoryScreen;
