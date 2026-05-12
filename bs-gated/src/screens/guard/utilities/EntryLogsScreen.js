/**
 * VendorVerificationScreen.js — NEW
 * BlacklistAlertScreen.js     — REBUILT (was local state only)
 * EntryLogsScreen.js          — NEW
 *
 * All three exported from this file and registered in GuardNavigator.
 */

import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar,
  TextInput, ScrollView, Alert, FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore }     from '../../../store/AuthStore';
import { useSecurityStore } from '../../../store/securityStore';
import { useTheme } from '../../../hooks/useTheme';

// ═══════════════════════════════════════════════════════════════════════════════
//  VENDOR VERIFICATION SCREEN
// ═══════════════════════════════════════════════════════════════════════════════


// ─── Guard Tab Bar ─────────────────────────────────────────────────────────────
function GuardTabBar({ active, navigation }) {
  const TABS = [
    { key: 'GuardDashboard',      icon: 'home',          label: 'Home'    },
    { key: 'EntryLogs',           icon: 'list',          label: 'Logs'    },
    { key: 'GuardNotifications',  icon: 'notifications', label: 'Alerts'  },
    { key: 'GuardProfile',        icon: 'person',        label: 'Profile' },
  ];
  return (
    <View style={gtb.bar}>
      {TABS.map(t => {
        const isActive = active === t.key;
        return (
          <TouchableOpacity key={t.key} style={gtb.tab}
            onPress={() => t.key !== active && navigation.navigate(t.key)}
            activeOpacity={0.7}>
            <Ionicons name={isActive ? t.icon : `${t.icon}-outline`} size={24}
              color={isActive ? '#1A7A7A' : '#94A3B8'} />
            <Text style={[gtb.label, isActive && gtb.labelActive]}>{t.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
const gtb = StyleSheet.create({
  bar:         { flexDirection: 'row', backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#D0EEEE', paddingBottom: 8, paddingTop: 8 },
  tab:         { flex: 1, alignItems: 'center', gap: 3 },
  label:       { fontSize: 10, fontWeight: '600', color: '#94A3B8' },
  labelActive: { color: '#1A7A7A', fontWeight: '800' },
});

export default function EntryLogsScreen({ navigation }) {
  const theme = useTheme();
  const entryLogs = useSecurityStore(s => s.entryLogs);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');

  const FILTERS = ['ALL', 'VISITOR', 'DELIVERY', 'VENDOR'];
  const TYPE_META = {
    VISITOR:  { emoji: '👤', color: theme.primary },
    DELIVERY: { emoji: '📦', color: theme.warning },
    VENDOR:   { emoji: '🔧', color: theme.primary },
  };
  const ACTION_META = {
    CHECK_IN:     { label: 'Check In',    color: theme.primary },
    CHECK_OUT:    { label: 'Check Out',   color: theme.textMuted },
    OTP_VERIFIED: { label: 'OTP Verified',color: theme.warning },
    QR_VERIFIED:  { label: 'QR Verified', color: theme.primary },
  };

  const filtered = entryLogs
    .filter(l => filter === 'ALL' || l.type === filter)
    .filter(l => !search ||
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.unit.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <SafeAreaView style={s.screen}>
      <StatusBar barStyle="light-content" backgroundColor="#0D6E6E" />
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backText}>‹</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle}>Entry Logs</Text>
          <Text style={s.headerSub}>Today's gate activity</Text>
        </View>
        <View style={{ width: 44 }} />
      </View>

      <View style={s.body}>
        <View style={s.filterRow}>
          {FILTERS.map(f => (
            <TouchableOpacity key={f} style={[s.filterChip, filter === f && s.filterChipActive]} onPress={() => setFilter(f)}>
              <Text style={[s.filterChipText, filter === f && s.filterChipTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TextInput style={[s.input, s.search]} placeholder="Search by name or unit..." placeholderTextColor="#94A3B8" value={search} onChangeText={setSearch} />

        <FlatList
          data={filtered}
          keyExtractor={i => i.id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const tm = TYPE_META[item.type] || { emoji: '📋', color: theme.textMuted };
            const am = ACTION_META[item.action] || { label: item.action, color: theme.textMuted };
            return (
              <View style={s.logRow}>
                <View style={[s.logIcon, { backgroundColor: tm.color + '15' }]}>
                  <Text style={{ fontSize: 16 }}>{tm.emoji}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.logName}>{item.name || item.type}</Text>
                  <Text style={s.logSub}>Unit {item.unit} · {item.gate}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <View style={[s.logBadge, { backgroundColor: am.color + '15' }]}>
                    <Text style={[s.logBadgeText, { color: am.color }]}>{am.label}</Text>
                  </View>
                  <Text style={s.logTime}>{new Date(item.at).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}</Text>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={s.empty}><Text style={{ fontSize: 48 }}>📋</Text><Text style={s.emptyText}>No logs found</Text></View>
          }
        />
      </View>
      <GuardTabBar active="EntryLogs" navigation={navigation} />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen:       { flex: 1, backgroundColor: '#F5F7FA' },
  header:       { backgroundColor: '#0D6E6E', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20, gap: 14 },
  backBtn:      { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  backText:     { color: '#FFF', fontSize: 28, fontWeight: '300' },
  headerTitle:  { color: '#FFF', fontSize: 18, fontWeight: '900' },
  headerSub:    { color: 'rgba(255,255,255,0.65)', fontSize: 12, marginTop: 2 },
  body:         { flex: 1, paddingHorizontal: 16, paddingTop: 12 },
  bodyPad:      { padding: 16 },
  sectionLabel: { fontSize: 11, fontWeight: '800', color: '#94A3B8', letterSpacing: 1, marginTop: 18, marginBottom: 10 },
  infoBanner:   { backgroundColor: '#FEF3C7', borderRadius: 12, padding: 12, marginBottom: 12, borderLeftWidth: 4, borderLeftColor: '#F59E0B' },
  infoText:     { fontSize: 12, fontWeight: '700', color: '#92400E' },
  search:       { marginBottom: 12 },
  input:        { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: '#1E293B', marginBottom: 10 },
  filterRow:    { flexDirection: 'row', gap: 8, marginBottom: 10 },
  filterChip:   { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#E2E8F0' },
  filterChipActive: { backgroundColor: '#1A7A7A', borderColor: '#1A7A7A' },
  filterChipText:    { fontSize: 12, fontWeight: '600', color: '#475569' },
  filterChipTextActive: { color: '#FFF' },
  card:         { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  cardHeader:   { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  vendorIcon:   { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  cardName:     { fontSize: 15, fontWeight: '800', color: '#1E293B' },
  cardSub:      { fontSize: 12, color: '#64748B', marginTop: 2 },
  badge:        { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  badgeText:    { fontSize: 11, fontWeight: '800' },
  details:      { backgroundColor: '#F8FAFC', borderRadius: 10, padding: 12, gap: 8, marginBottom: 12 },
  detailRow:    { flexDirection: 'row', justifyContent: 'space-between' },
  dLabel:       { fontSize: 12, color: '#64748B', fontWeight: '600' },
  dValue:       { fontSize: 12, color: '#1E293B', fontWeight: '700' },
  btn:          { borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
  btnText:      { color: '#FFF', fontSize: 14, fontWeight: '800' },
  empty:        { alignItems: 'center', padding: 40, gap: 12 },
  emptyText:    { fontSize: 15, color: '#64748B', fontWeight: '600' },
  // Check card
  checkCard:    { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  checkTitle:   { fontSize: 15, fontWeight: '800', color: '#1E293B', marginBottom: 4 },
  checkSub:     { fontSize: 12, color: '#64748B', marginBottom: 14 },
  blackResult:  { backgroundColor: '#FEF2F2', borderRadius: 12, padding: 14, marginTop: 12, borderWidth: 1, borderColor: '#FECACA' },
  blackResultTitle: { fontSize: 14, fontWeight: '800', color: '#991B1B', marginBottom: 8 },
  blackResultDetail: { fontSize: 13, color: '#1E293B', marginBottom: 4 },
  // Log row
  logRow:       { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  logIcon:      { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  logName:      { fontSize: 13, fontWeight: '700', color: '#1E293B' },
  logSub:       { fontSize: 11, color: '#64748B', marginTop: 2 },
  logBadge:     { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  logBadgeText: { fontSize: 10, fontWeight: '700' },
  logTime:      { fontSize: 10, color: '#94A3B8', marginTop: 3 },
});