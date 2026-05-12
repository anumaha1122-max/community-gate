import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../theme/SAcolors';
import SPACING from '../theme/spacing';

export default function InfoBanner({ text }) {
  return (
    <View style={styles.wrap}>
      <Ionicons name="information-circle-outline" size={20} color={COLORS.info} />
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: SPACING.lg,
    backgroundColor: '#EAF3FF',
    borderRadius: SPACING.radiusMd,
    borderWidth: 1,
    borderColor: '#B8D5FF',
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  text: {
    flex: 1,
    color: COLORS.text,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '600',
  },
});