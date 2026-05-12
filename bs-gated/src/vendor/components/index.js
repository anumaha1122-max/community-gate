import React from 'react';
import {
  View, Text, TouchableOpacity, TextInput,
  StyleSheet, ActivityIndicator,
} from 'react-native';
import { Colors, Fonts, Radius, Shadows } from '../theme';

// ─── AppHeader ────────────────────────────────────────────────────────────────
export const AppHeader = ({ title, subtitle, onBack, rightComponent }) => (
  <View style={headerStyles.container}>
    <View style={headerStyles.row}>
      {onBack ? (
        <TouchableOpacity style={headerStyles.backBtn} onPress={onBack} activeOpacity={0.7}>
          <Text style={headerStyles.backArrow}>‹</Text>
        </TouchableOpacity>
      ) : (
        <View style={{ width: 44 }} />
      )}
      <View style={{ flex: 1 }}>
        <Text style={headerStyles.title}>{title}</Text>
        {subtitle ? <Text style={headerStyles.subtitle}>{subtitle}</Text> : null}
      </View>
      <View style={{ minWidth: 44, alignItems: 'flex-end' }}>
        {rightComponent || null}
      </View>
    </View>
  </View>
);

const headerStyles = StyleSheet.create({
  container: {
    backgroundColor: '#1A7A7A',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 20,
  },
  row:      { flexDirection: 'row', alignItems: 'center', gap: 10 },
  backBtn:  { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  backArrow:{ fontSize: 26, color: '#FFFFFF', fontWeight: '300', lineHeight: 30, marginTop: -2 },
  title:    { fontSize: 18, fontWeight: Fonts.extraBold, color: '#FFFFFF' },
  subtitle: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
});

// ─── PrimaryButton ────────────────────────────────────────────────────────────
export const PrimaryButton = ({ title, onPress, color, textColor = '#fff', outline = false, style, loading = false }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.82}
    style={[
      btnStyles.btn,
      { backgroundColor: outline ? 'transparent' : (color || Colors.teal) },
      outline && { borderWidth: 2, borderColor: color || Colors.teal },
      style,
    ]}
  >
    {loading
      ? <ActivityIndicator color={outline ? (color || Colors.teal) : '#fff'} />
      : <Text style={[btnStyles.text, { color: outline ? (color || Colors.teal) : textColor }]}>{title}</Text>}
  </TouchableOpacity>
);

const btnStyles = StyleSheet.create({
  btn: { borderRadius: Radius.md, paddingVertical: 15, alignItems: 'center', justifyContent: 'center' },
  text: { fontSize: 15, fontWeight: Fonts.bold },
});

// ─── Card ─────────────────────────────────────────────────────────────────────
export const Card = ({ children, style }) => (
  <View style={[cardStyles.card, style]}>{children}</View>
);

const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.card,
  },
});

// ─── Badge ────────────────────────────────────────────────────────────────────
export const Badge = ({ label, color, bg, style }) => (
  <View style={[badgeStyles.badge, { backgroundColor: bg }, style]}>
    <Text style={[badgeStyles.text, { color }]}>{label}</Text>
  </View>
);

const badgeStyles = StyleSheet.create({
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full },
  text:  { fontSize: 11, fontWeight: Fonts.bold },
});

// ─── Avatar ───────────────────────────────────────────────────────────────────
export const Avatar = ({ name = 'U', size = 42, color = Colors.purple }) => (
  <View style={[avatarStyles.base, { width: size, height: size, borderRadius: size / 2, backgroundColor: color + '22', borderWidth: 1.5, borderColor: color + '44' }]}>
    <Text style={[avatarStyles.text, { fontSize: size * 0.38, color }]}>{name[0].toUpperCase()}</Text>
  </View>
);

const avatarStyles = StyleSheet.create({
  base:  { alignItems: 'center', justifyContent: 'center' },
  text:  { fontWeight: Fonts.extraBold },
});

// ─── InputField ───────────────────────────────────────────────────────────────
export const InputField = ({ label, value, onChangeText, placeholder, keyboardType = 'default', multiline = false, style }) => (
  <View style={inputStyles.wrapper}>
    {label ? <Text style={inputStyles.label}>{label}</Text> : null}
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={Colors.text3}
      keyboardType={keyboardType}
      multiline={multiline}
      style={[inputStyles.input, multiline && { minHeight: 88, textAlignVertical: 'top' }, style]}
    />
  </View>
);

const inputStyles = StyleSheet.create({
  wrapper: { marginBottom: 12 },
  label:   { fontSize: 12, fontWeight: Fonts.semiBold, color: Colors.text2, marginBottom: 5 },
  input: {
    borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.md,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, color: Colors.text, backgroundColor: Colors.white,
  },
});

// ─── SectionTitle ─────────────────────────────────────────────────────────────
export const SectionTitle = ({ title, onAction, actionLabel }) => (
  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, marginTop: 4 }}>
    <Text style={{ fontSize: 15, fontWeight: Fonts.bold, color: Colors.text }}>{title}</Text>
    {onAction && <TouchableOpacity onPress={onAction}><Text style={{ fontSize: 12, color: Colors.purple, fontWeight: Fonts.semiBold }}>{actionLabel || 'View All'}</Text></TouchableOpacity>}
  </View>
);

// ─── Divider ──────────────────────────────────────────────────────────────────
export const Divider = ({ style }) => (
  <View style={[{ height: 1, backgroundColor: Colors.border, marginVertical: 12 }, style]} />
);

// ─── StatCard ─────────────────────────────────────────────────────────────────
export const StatCard = ({ value, label, color, bg }) => (
  <View style={[statStyles.card, { backgroundColor: bg }]}>
    <Text style={[statStyles.value, { color }]}>{value}</Text>
    <Text style={[statStyles.label, { color }]}>{label}</Text>
  </View>
);

const statStyles = StyleSheet.create({
  card:  { flex: 1, borderRadius: Radius.md, padding: 12, alignItems: 'center' },
  value: { fontSize: 18, fontWeight: Fonts.extraBold, marginBottom: 3 },
  label: { fontSize: 11, fontWeight: Fonts.medium, opacity: 0.75, textAlign: 'center' },
});

// ─── ProgressStep ────────────────────────────────────────────────────────────
export const ProgressStep = ({ number, label, status, timestamp, isLast }) => {
  const done   = status === 'done';
  const active = status === 'active';
  return (
    <View style={{ flexDirection: 'row', gap: 12 }}>
      <View style={{ alignItems: 'center' }}>
        <View style={[
          stepStyles.circle,
          done   && { backgroundColor: Colors.green,  borderColor: Colors.green },
          active && { backgroundColor: Colors.teal,   borderColor: Colors.teal   },
          !done && !active && { backgroundColor: Colors.bg, borderColor: Colors.border },
        ]}>
          {done
            ? <Text style={{ color: '#fff', fontSize: 12, fontWeight: Fonts.bold }}>✓</Text>
            : <Text style={{ fontSize: 11, fontWeight: Fonts.bold, color: done || active ? '#fff' : Colors.text3 }}>{number}</Text>}
        </View>
        {!isLast && <View style={[stepStyles.line, { backgroundColor: done ? Colors.green : Colors.border }]} />}
      </View>
      <View style={{ paddingTop: 3, paddingBottom: 16, flex: 1 }}>
        <Text style={[stepStyles.label, done && { color: Colors.green }, active && { color: Colors.teal   }]}>{label}</Text>
        {timestamp
          ? <Text style={stepStyles.time}>{timestamp}</Text>
          : <Text style={stepStyles.time}>{active ? 'In Progress' : done ? '' : 'Pending'}</Text>}
      </View>
    </View>
  );
};

const stepStyles = StyleSheet.create({
  circle: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  line:   { width: 2, flex: 1, marginTop: 2 },
  label:  { fontSize: 13, fontWeight: Fonts.semiBold, color: Colors.text2 },
  time:   { fontSize: 11, color: Colors.text3, marginTop: 2 },
});

// ─── TabChip ──────────────────────────────────────────────────────────────────
export const TabChip = ({ label, active, onPress, activeColor = Colors.purple }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.7}
    style={[chipStyles.chip, active && { backgroundColor: activeColor }]}
  >
    <Text style={[chipStyles.text, active ? { color: '#fff' } : { color: Colors.text2 }]}>{label}</Text>
  </TouchableOpacity>
);

const chipStyles = StyleSheet.create({
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: Radius.md, backgroundColor: Colors.bg },
  text: { fontSize: 12, fontWeight: Fonts.bold },
});

// ─── QuickActionCard ──────────────────────────────────────────────────────────
export const QuickActionCard = ({ emoji, label, onPress, color, bg }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.75}
    style={[qaStyles.card, { backgroundColor: bg }]}
  >
    <View style={[qaStyles.iconBox, { backgroundColor: Colors.white }]}>
      <Text style={{ fontSize: 18 }}>{emoji}</Text>
    </View>
    <Text style={[qaStyles.label, { color }]}>{label}</Text>
  </TouchableOpacity>
);

const qaStyles = StyleSheet.create({
  card: { flex: 1, borderRadius: Radius.lg, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBox: { width: 38, height: 38, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  label: { fontSize: 13, fontWeight: Fonts.bold, flex: 1 },
});