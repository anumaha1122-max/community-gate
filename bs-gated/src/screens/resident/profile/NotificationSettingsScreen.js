/**
 * NotificationSettingsScreen.js
 *
 * Real-world notification preferences screen.
 * Theme: Identical to VisitorListScreen (#1A7A7A header, #E8F5F5 bg).
 *
 * Features:
 *  - Per-category toggle (Visitors, Bills, Maintenance, SOS, Amenities, etc.)
 *  - Per-channel toggle (Push, SMS, Email) per category
 *  - Do Not Disturb hours (from / to time)
 *  - Master mute toggle
 *  - All persisted in residentStore.notificationPrefs
 */

import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar,
  ScrollView, Switch, Alert,
} from 'react-native';
import { useAuthStore }  from '../../../store/AuthStore';
import useResidentStore  from '../../../store/residentStore';

const V = {
  header: '#1A7A7A', headerDark: '#0D6E6E',
  bg: '#E8F5F5', surface: '#FFFFFF',
  border: '#D0EEEE', divider: '#E8F5F5',
  text: '#1A2E2E', textSub: '#3D6E6E', textMuted: '#7A9E9E',
  primary: '#1A7A7A', chip: '#E8F5F5',
  danger: '#C62828', dangerBg: '#FEE2E2',
  successBg: '#CCFBF1',
};

const CATEGORIES = [
  { key: 'visitors',     emoji: '👥', label: 'Visitor Arrivals',     desc: 'Gate check-in/out alerts' },
  { key: 'bills',        emoji: '💳', label: 'Bills & Payments',     desc: 'Invoices, dues, receipts' },
  { key: 'maintenance',  emoji: '🔧', label: 'Maintenance',          desc: 'Status updates & quotes' },
  { key: 'sos',          emoji: '🚨', label: 'SOS & Emergency',      desc: 'Cannot be disabled', locked: true },
  { key: 'amenities',    emoji: '🏊', label: 'Amenity Bookings',     desc: 'Confirmations & reminders' },
  { key: 'marketplace',  emoji: '🛒', label: 'Marketplace Orders',   desc: 'Order status updates' },
  { key: 'announcements',emoji: '📢', label: 'Announcements',        desc: 'Society notices & events' },
  { key: 'parking',      emoji: '🚗', label: 'Parking',              desc: 'Slot approval & overstay' },
  { key: 'walkin',       emoji: '🚶', label: 'Walk-in Requests',     desc: 'Gate approval requests' },
];

const DEFAULT_PREFS = {
  masterMute: false,
  dndEnabled: false,
  dndFrom: '22:00',
  dndTo: '07:00',
  categories: Object.fromEntries(
    CATEGORIES.map(c => [c.key, { enabled: true, push: true, sms: c.key === 'sos' || c.key === 'bills', email: false }])
  ),
};

function SectionLabel({ children }) {
  return <Text style={s.sectionLabel}>{children}</Text>;
}

function Row({ label, value, onToggle, disabled, sub }) {
  return (
    <View style={s.row}>
      <View style={{ flex: 1 }}>
        <Text style={[s.rowLabel, disabled && { color: V.textMuted }]}>{label}</Text>
        {sub ? <Text style={s.rowSub}>{sub}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        disabled={disabled}
        trackColor={{ false: '#D0EEEE', true: V.primary }}
        thumbColor={value ? '#FFFFFF' : '#FFFFFF'}
      />
    </View>
  );
}

export default function NotificationSettingsScreen({ navigation }) {
  const updateNotifPrefs = useResidentStore(s => s.updateNotifPrefs);
  const saved = useResidentStore(s => s.notifPrefs) || DEFAULT_PREFS;

  const [prefs, setPrefs] = useState({ ...DEFAULT_PREFS, ...saved });

  const update = (path, val) => {
    setPrefs(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      const parts = path.split('.');
      let cur = next;
      for (let i = 0; i < parts.length - 1; i++) cur = cur[parts[i]];
      cur[parts[parts.length - 1]] = val;
      return next;
    });
  };

  const save = () => {
    updateNotifPrefs(prefs);
    Alert.alert('✅ Saved', 'Notification preferences updated.');
    navigation?.goBack();
  };

  return (
    <SafeAreaView style={s.screen}>
      <StatusBar barStyle="light-content" backgroundColor={V.headerDark} />
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()} style={s.backBtn}>
          <Text style={s.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={s.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={s.headerTitle}>Notifications</Text>
            <Text style={s.headerSub}>Manage your alert preferences</Text>
          </View>
          <TouchableOpacity style={s.saveBtn} onPress={save}>
            <Text style={s.saveBtnText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.body} showsVerticalScrollIndicator={false}>

        {/* Master mute */}
        <SectionLabel>MASTER CONTROL</SectionLabel>
        <View style={s.card}>
          <Row
            label="Mute All Notifications"
            sub="Silences everything except SOS alerts"
            value={prefs.masterMute}
            onToggle={v => update('masterMute', v)}
          />
        </View>

        {/* Do Not Disturb */}
        <SectionLabel>DO NOT DISTURB</SectionLabel>
        <View style={s.card}>
          <Row
            label="Enable Do Not Disturb"
            sub="No alerts during these hours"
            value={prefs.dndEnabled}
            onToggle={v => update('dndEnabled', v)}
          />
          {prefs.dndEnabled && (
            <View style={s.dndRow}>
              <View style={s.dndTime}>
                <Text style={s.dndLabel}>FROM</Text>
                <Text style={s.dndValue}>{prefs.dndFrom}</Text>
                {['20:00','21:00','22:00','23:00'].map(t => (
                  <TouchableOpacity key={t} style={[s.timeChip, prefs.dndFrom === t && s.timeChipActive]} onPress={() => update('dndFrom', t)}>
                    <Text style={[s.timeChipText, prefs.dndFrom === t && { color: '#FFF' }]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={s.dndTime}>
                <Text style={s.dndLabel}>TO</Text>
                <Text style={s.dndValue}>{prefs.dndTo}</Text>
                {['06:00','07:00','08:00','09:00'].map(t => (
                  <TouchableOpacity key={t} style={[s.timeChip, prefs.dndTo === t && s.timeChipActive]} onPress={() => update('dndTo', t)}>
                    <Text style={[s.timeChipText, prefs.dndTo === t && { color: '#FFF' }]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Per-category */}
        <SectionLabel>ALERT CATEGORIES</SectionLabel>
        {CATEGORIES.map((cat, i) => {
          const catPrefs = prefs.categories[cat.key] || { enabled: true, push: true, sms: false, email: false };
          const isLast = i === CATEGORIES.length - 1;
          return (
            <View key={cat.key} style={[s.catCard, !isLast && { marginBottom: 0, borderBottomLeftRadius: 0, borderBottomRightRadius: 0, borderBottomWidth: 0 }]}>
              <View style={s.catHeader}>
                <View style={s.catIcon}><Text style={{ fontSize: 18 }}>{cat.emoji}</Text></View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={s.catLabel}>{cat.label}</Text>
                  <Text style={s.catDesc}>{cat.desc}</Text>
                </View>
                <Switch
                  value={cat.locked || catPrefs.enabled}
                  onValueChange={v => !cat.locked && update(`categories.${cat.key}.enabled`, v)}
                  disabled={!!cat.locked || prefs.masterMute}
                  trackColor={{ false: '#D0EEEE', true: V.primary }}
                  thumbColor="#FFFFFF"
                />
              </View>
              {catPrefs.enabled && !cat.locked && (
                <View style={s.channelRow}>
                  {[
                    { key: 'push',  label: '📲 Push' },
                    { key: 'sms',   label: '💬 SMS' },
                    { key: 'email', label: '📧 Email' },
                  ].map(ch => (
                    <TouchableOpacity
                      key={ch.key}
                      style={[s.channelChip, catPrefs[ch.key] && s.channelChipActive]}
                      onPress={() => update(`categories.${cat.key}.${ch.key}`, !catPrefs[ch.key])}
                    >
                      <Text style={[s.channelText, catPrefs[ch.key] && { color: '#FFF' }]}>{ch.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              {cat.locked && (
                <View style={s.lockedBanner}>
                  <Text style={s.lockedText}>🔒 SOS alerts cannot be disabled for your safety</Text>
                </View>
              )}
            </View>
          );
        })}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: V.bg },
  header: { backgroundColor: V.header, paddingTop: 40, paddingHorizontal: 20, paddingBottom: 16 },
  backBtn: { marginBottom: 10 },
  backText: { color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: '600', marginBottom: 8 },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#FFF' },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  saveBtn: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  saveBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  body: { padding: 16, paddingTop: 20 },
  sectionLabel: { fontSize: 11, fontWeight: '800', color: V.textMuted, letterSpacing: 1, marginBottom: 8, marginTop: 18 },
  card: { backgroundColor: V.surface, borderRadius: 14, borderWidth: 1, borderColor: V.border, overflow: 'hidden', marginBottom: 4 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 10 },
  rowLabel: { fontSize: 14, fontWeight: '700', color: V.text },
  rowSub: { fontSize: 12, color: V.textMuted, marginTop: 2 },
  dndRow: { flexDirection: 'row', gap: 12, padding: 12, paddingTop: 0 },
  dndTime: { flex: 1 },
  dndLabel: { fontSize: 10, fontWeight: '800', color: V.textMuted, letterSpacing: 1, marginBottom: 4 },
  dndValue: { fontSize: 20, fontWeight: '900', color: V.primary, marginBottom: 8 },
  timeChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, backgroundColor: V.chip, borderWidth: 1, borderColor: V.border, marginBottom: 6 },
  timeChipActive: { backgroundColor: V.primary, borderColor: V.primary },
  timeChipText: { fontSize: 12, fontWeight: '700', color: V.textSub },
  catCard: { backgroundColor: V.surface, borderRadius: 14, borderWidth: 1, borderColor: V.border, marginBottom: 8, overflow: 'hidden' },
  catHeader: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  catIcon: { width: 38, height: 38, borderRadius: 10, backgroundColor: V.chip, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: V.border },
  catLabel: { fontSize: 14, fontWeight: '700', color: V.text },
  catDesc: { fontSize: 12, color: V.textMuted, marginTop: 2 },
  channelRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 14, paddingBottom: 12 },
  channelChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: V.chip, borderWidth: 1, borderColor: V.border },
  channelChipActive: { backgroundColor: V.primary, borderColor: V.primary },
  channelText: { fontSize: 12, fontWeight: '600', color: V.textSub },
  lockedBanner: { backgroundColor: '#FFF3F3', paddingHorizontal: 14, paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#FFCDD2' },
  lockedText: { fontSize: 11, color: V.danger, fontWeight: '600' },
});