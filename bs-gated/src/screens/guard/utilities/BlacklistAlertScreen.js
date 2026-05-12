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
import { useAuthStore }     from '../../../store/AuthStore';
import { useSecurityStore } from '../../../store/securityStore';
import { useTheme } from '../../../hooks/useTheme';

// ═══════════════════════════════════════════════════════════════════════════════
//  VENDOR VERIFICATION SCREEN
// ═══════════════════════════════════════════════════════════════════════════════

export default function BlacklistAlertScreen({ navigation }) {
  const theme = useTheme();
  const blacklist = useSecurityStore(s => s.blacklist);
  const [search, setSearch] = useState('');
  const [checkName, setCheckName]   = useState('');
  const [checkPhone, setCheckPhone] = useState('');
  const [checkResult, setCheckResult] = useState(null);
  const checkBlacklist = useSecurityStore(s => s.checkBlacklist);

  const active = blacklist.filter(b => b.active);
  const filtered = active.filter(b =>
    !search ||
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.phone.includes(search)
  );

  const handleCheck = () => {
    if (!checkName.trim() && !checkPhone.trim()) {
      Alert.alert('Enter details', 'Enter name or phone to check');
      return;
    }
    const match = checkBlacklist(checkName.trim(), checkPhone.trim());
    setCheckResult(match);
  };

  return (
    <SafeAreaView style={s.screen}>
      <StatusBar barStyle="light-content" backgroundColor="#0D6E6E" />
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backText}>‹</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle}>🚫 Blacklist</Text>
          <Text style={s.headerSub}>Blocked persons & vehicles</Text>
        </View>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={s.bodyPad} showsVerticalScrollIndicator={false}>
        {/* Quick Check */}
        <View style={s.checkCard}>
          <Text style={s.checkTitle}>Quick Person Check</Text>
          <Text style={s.checkSub}>Check before allowing any entry</Text>
          <TextInput style={s.input} placeholder="Full name" placeholderTextColor="#94A3B8" value={checkName} onChangeText={setCheckName} />
          <TextInput style={s.input} placeholder="Phone number" placeholderTextColor="#94A3B8" value={checkPhone} onChangeText={setCheckPhone} keyboardType="phone-pad" />
          <TouchableOpacity style={[s.btn, { backgroundColor: theme.danger }]} onPress={handleCheck}>
            <Text style={s.btnText}>🔍 Check Blacklist</Text>
          </TouchableOpacity>

          {checkResult && (
            <View style={s.blackResult}>
              <Text style={s.blackResultTitle}>🚫 BLACKLISTED — DO NOT ALLOW ENTRY</Text>
              <Text style={s.blackResultDetail}>Name: {checkResult.name}</Text>
              <Text style={s.blackResultDetail}>Phone: {checkResult.phone}</Text>
              <Text style={s.blackResultDetail}>Reason: {checkResult.reason}</Text>
              <Text style={s.blackResultDetail}>Added by: {checkResult.addedByName}</Text>
            </View>
          )}
          {checkResult === null && (checkName || checkPhone) && (
            <View style={[s.blackResult, { backgroundColor: theme.surface, borderColor: '#86EFAC' }]}>
              <Text style={[s.blackResultTitle, { color: '#064E3B' }]}>✅ Not on Blacklist — Entry Permitted</Text>
            </View>
          )}
        </View>

        <Text style={s.sectionLabel}>BLACKLISTED PERSONS ({active.length})</Text>
        <TextInput style={[s.input, s.search]} placeholder="Search blacklist..." placeholderTextColor="#94A3B8" value={search} onChangeText={setSearch} />

        {filtered.map(b => (
          <View key={b.id} style={[s.card, { borderLeftWidth: 4, borderLeftColor: theme.danger }]}>
            <View style={s.cardHeader}>
              <View style={[s.vendorIcon, { backgroundColor: theme.surface }]}><Text style={{ fontSize: 20 }}>🚫</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={s.cardName}>{b.name}</Text>
                <Text style={s.cardSub}>📱 {b.phone}</Text>
              </View>
              <View style={[s.badge, { backgroundColor: theme.surface }]}>
                <Text style={[s.badgeText, { color: theme.danger }]}>BLOCKED</Text>
              </View>
            </View>
            <View style={s.details}>
              <View style={s.detailRow}><Text style={s.dLabel}>Reason</Text><Text style={[s.dValue, { flex: 1, textAlign: 'right' }]}>{b.reason}</Text></View>
              {b.idProof && <View style={s.detailRow}><Text style={s.dLabel}>ID Proof</Text><Text style={s.dValue}>{b.idProof}</Text></View>}
              <View style={s.detailRow}>
                <Text style={s.dLabel}>Added</Text>
                <Text style={s.dValue}>{new Date(b.addedAt).toLocaleDateString('en-IN')}</Text>
              </View>
            </View>
          </View>
        ))}

        {filtered.length === 0 && (
          <View style={s.empty}><Text style={{ fontSize: 48 }}>🔍</Text><Text style={s.emptyText}>No matching entries</Text></View>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
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
