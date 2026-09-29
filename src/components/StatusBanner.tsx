import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { colors } from '../constants';

interface StatusBannerProps {
  tone: 'warning' | 'error' | 'info';
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

const TONE_COLORS: Record<StatusBannerProps['tone'], string> = {
  warning: colors.warning,
  error: colors.dangerDark,
  info: colors.info,
};

const TONE_BACKGROUNDS: Record<StatusBannerProps['tone'], string> = {
  warning: colors.warningLight,
  error: colors.dangerLight,
  info: colors.infoLight,
};

const StatusBanner = React.memo(
  ({ tone, message, actionLabel, onAction }: StatusBannerProps) => {
    return (
      <View
        style={[styles.container, { backgroundColor: TONE_BACKGROUNDS[tone] }]}>
        <Text style={[styles.message, { color: TONE_COLORS[tone] }]}>
          {message}
        </Text>
        {actionLabel && onAction ? (
          <Pressable onPress={onAction} hitSlop={8}>
            <Text style={[styles.action, { color: TONE_COLORS[tone] }]}>
              {actionLabel}
            </Text>
          </Pressable>
        ) : null}
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    borderRadius: moderateScale(10),
    paddingVertical: verticalScale(10),
    paddingHorizontal: scale(14),
    marginHorizontal: scale(16),
    marginBottom: verticalScale(12),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: scale(8),
  },
  message: {
    flex: 1,
    fontSize: moderateScale(13),
    fontWeight: '500',
  },
  action: {
    fontSize: moderateScale(13),
    fontWeight: '700',
  },
});

export default StatusBanner;
