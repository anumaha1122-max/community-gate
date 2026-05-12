/**
 * ThemeToggle.js — Reusable theme switcher
 *
 * Drop this into any Profile screen or Header.
 * Instantly updates the entire app.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import useAppStore from '../../store/appStore';
import { useTheme } from '../../hooks/useTheme';

const THEMES = [
  { key: 'light',  label: '☀️ Light',  desc: 'Teal & White' },
  { key: 'dark',   label: '🌙 Dark',   desc: 'Black & Orange' },
  { key: 'custom', label: '✨ Custom', desc: 'Purple & Indigo' },
];

export default function ThemeToggle({ style }) {
  const theme = useTheme();
  const setTheme = useAppStore((s) => s.setTheme);
  const current  = useAppStore((s) => s.theme) ?? 'light';

  return (
    <View style={[styles.container, { backgroundColor: theme.surface, borderColor: theme.cardBorder }, style]}>
      <Text style={[styles.heading, { color: theme.text }]}>🎨 App Theme</Text>
      <View style={styles.row}>
        {THEMES.map(({ key, label, desc }) => {
          const active = current === key;
          return (
            <TouchableOpacity
              key={key}
              style={[
                styles.option,
                {
                  backgroundColor: active ? theme.primary : theme.card,
                  borderColor:     active ? theme.primary : theme.cardBorder,
                },
              ]}
              onPress={() => setTheme(key)}
              activeOpacity={0.8}
            >
              <Text style={[styles.optLabel, { color: active ? '#FFF' : theme.text }]}>{label}</Text>
              <Text style={[styles.optDesc,  { color: active ? 'rgba(255,255,255,0.75)' : theme.textMuted }]}>{desc}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  heading: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  option: {
    flex: 1,
    borderRadius: 12,
    padding: 10,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  optLabel: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  optDesc: {
    fontSize: 10,
    marginTop: 2,
    textAlign: 'center',
  },
});
