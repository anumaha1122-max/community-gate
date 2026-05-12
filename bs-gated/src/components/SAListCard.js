import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import COLORS from '../theme/SAcolors';
import SPACING from '../theme/spacing';

function getStatusStyle(status) {
  switch (status) {
    case 'Approved':
    case 'Healthy':
    case 'Verified':
      return { bg: '#E9F8EE', color: COLORS.success };
    case 'Pending':
    case 'Review':
    case 'Warning':
      return { bg: '#FFF4E6', color: COLORS.warning };
    case 'Critical':
    case 'Rejected':
      return { bg: '#FFE9E9', color: COLORS.danger };
    default:
      return { bg: COLORS.chipBg, color: COLORS.chipText };
  }
}

export default function ListCard({
  title,
  subtitle,
  metaLeft,
  metaRight,
  status,
  onPress,
}) {
  const statusStyle = getStatusStyle(status);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.topRow}>
        <Text style={styles.title}>{title}</Text>
        {status ? (
          <View style={[styles.badge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.badgeText, { color: statusStyle.color }]}>{status}</Text>
          </View>
        ) : null}
      </View>

      {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}

      <View style={styles.bottomRow}>
        {!!metaLeft && <Text style={styles.meta}>{metaLeft}</Text>}
        {!!metaRight && <Text style={styles.meta}>{metaRight}</Text>}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: SPACING.radiusMd,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'center',
  },
  title: {
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 13,
    color: COLORS.subText,
    lineHeight: 18,
  },
  bottomRow: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  meta: {
    fontSize: 12,
    color: COLORS.primaryNavy,
    fontWeight: '700',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
}); 