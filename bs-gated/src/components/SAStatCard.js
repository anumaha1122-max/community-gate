
import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import COLORS from '../theme/SAcolors';
import SPACING from '../theme/spacing';

export default function StatCard({ title, value, change, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <Text style={styles.label}>{title}</Text>
      <Text style={styles.value}>{value}</Text>
      {!!change && <Text style={styles.change}>{change}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: SPACING.radiusMd,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
    minHeight: 120,
    justifyContent: 'center',
  },
  label: {
    fontSize: 12,
    color: COLORS.subText,
    fontWeight: '600',
  },
  value: {
    fontSize: 24,
    color: COLORS.text,
    fontWeight: '800',
    marginTop: 8,
  },
  change: {
    fontSize: 12,
    color: COLORS.primaryNavy,
    fontWeight: '700',
    marginTop: 6,
  },
});