import React from 'react';
import { View, Text } from 'react-native';
import { COLORS, STATUS_LABELS, globalStyles } from './theme';

export default function StatusBadge({ status }) {
  const color = COLORS[status] || COLORS.textMuted;
  const label = STATUS_LABELS[status] || status;
  return (
    <View style={[globalStyles.badge, { backgroundColor: color }]}>
      <Text style={globalStyles.badgeText}>{label}</Text>
    </View>
  );
}
