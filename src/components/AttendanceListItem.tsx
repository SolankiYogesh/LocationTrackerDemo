import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { colors } from '../constants';
import type { AttendanceRecord } from '../types';
import { formatDateTime } from '../utils';

interface AttendanceListItemProps {
  record: AttendanceRecord;
}

const AttendanceListItem = React.memo(
  ({ record }: AttendanceListItemProps) => {
    return (
      <View style={styles.row}>
        <View style={styles.dot} />
        <View style={styles.content}>
          <Text style={styles.title}>Checked in</Text>
          <Text style={styles.subtitle}>{formatDateTime(record.timestamp)}</Text>
          <Text style={styles.meta}>
            {record.distanceFromOfficeMeters.toFixed(0)} m from office ·{' '}
            {record.latitude.toFixed(5)}, {record.longitude.toFixed(5)}
          </Text>
        </View>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingVertical: verticalScale(14),
    paddingHorizontal: scale(16),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    gap: scale(12),
  },
  dot: {
    width: scale(10),
    height: verticalScale(10),
    borderRadius: moderateScale(5),
    backgroundColor: colors.success,
    marginTop: verticalScale(6),
  },
  content: {
    flex: 1,
    gap: verticalScale(2),
  },
  title: {
    fontSize: moderateScale(15),
    fontWeight: '600',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: moderateScale(13),
    color: colors.textSecondary,
  },
  meta: {
    fontSize: moderateScale(12),
    color: colors.textMuted,
  },
});

export default AttendanceListItem;
