import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import COLORS from '../theme/SAcolors';
import SPACING from '../theme/spacing';

export default function SectionHeader({ title, actionText }) {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      {actionText ? <Text style={styles.action}>{actionText}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },
  action: {
    fontSize: 13,
    color: COLORS.primaryNavy,
    fontWeight: '700',
  },
});