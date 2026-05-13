/**
 * VendorVerificationScreen.js — Guard
 *
 * Vendor enters community via OTP (same as delivery OTP flow).
 * The OTP is generated when admin approves work to start (approved_to_start).
 * Guard types OTP → matches → status moves to work_in_progress.
 * Also shows already-entered (work_in_progress) vendors for checkout.
 */

import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar,
  TextInput, Alert, FlatList, Modal, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore }     from '../../../store/AuthStore';
import useAppStore          from '../../../store/appStore';
import { useSecurityStore } from '../../../store/securityStore';
import { useTheme } from '../../../hooks/useTheme';

const P = {
  navy: '#1A7A7A', navyDark: '#0D6E6E', bg: '#E8F5F5', surface: '#FFF',
  text: '#1E293B', sub: '#64748B', muted: '#94A3B8', border: '#E2E8F0',
  teal: '#0D9488', tealBg: '#CCFBF1', green: '#16A34A', greenBg: '#DCFCE7',
  amber: '#D97706', amberBg: '#FEF3C7', danger: '#DC2626', dangerBg: '#FEE2E2',
};

const STATUS_META = {
  approved_to_start: { label: 'OTP Required', color: P.amber, bg: P.amberBg },
  work_in_progress:  { label: 'Inside',        color: P.teal,  bg: P.tealBg  },
};

export default function VendorVerificationScreen({ navigation }) {
  const theme    = useTheme();
  const requests = useAppStore(s => s.maintenanceRequests);
  const guardValidateMaintenanceOTP = useAppStore(s => s.guardValidateMaintenanceOTP);
  const checkBlacklist = useSecurityStore(s => s.checkBlacklist);

  const [search,      setSearch]      = useState('');
  const [tab,         setTab]         = useState('pending');
  const [manualModal, setManualModal] = useState(false);
  const [otpInputs,   setOtpInputs]   = useState({});
  const [results,     setResults]     = useState({});

  const pending = requests.filter(r =>
    r.status === 'approved_to_start' && r.assignedVendorId &&
    (!search ||
      r.assignedVendorName?.toLowerCase().includes(search.toLowerCase()) ||
      String(r.id).toLowerCase().includes(search.toLowerCase()) ||
      r.unit?.toLowerCase().includes(search.toLowerCase()))
  );
  const inside = requests.filter(r =>
    r.status === 'work_in_progress' && r.assignedVendorId &&
    (!search ||
      r.assignedVendorName?.toLowerCase().includes(search.toLowerCase()) ||
      String(r.id).toLowerCase().includes(search.toLowerCase()) ||
      r.unit?.toLowerCase().includes(search.toLowerCase()))
  );

  const displayed = tab === 'pending' ? pending : inside;

  const handleVerify = async (requestId, otp) => {
    const req = requests.find(r => r.id === requestId);
    const bl  = checkBlacklist?.(req?.assignedVendorName || '', '');
    if (bl) {
      Alert.alert('BLACKLISTED', `${req?.assignedVendorName} is blacklisted.\nReason: ${bl.reason}`);
      return false;
    }
    const result = await guardValidateMaintenanceOTP(requestId, otp);
    if (result?.ok) {
      setResults(prev => ({ ...prev, [requestId]: 'ok' }));
      setOtpInputs(prev => ({ ...prev, [requestId]: '' }));
      Alert.alert('Entry Allowed', `${req?.assignedVendorName} verified. Work started at Unit ${req?.unit}.`);
      return true;
    }
    setResults(prev => ({ ...prev, [requestId]: 'fail' }));
    setOtpInputs(prev => ({ ...prev, [requestId]: '' }));
    return false;
  };

  const renderCard = ({ item: job }) => {
    const meta       = STATUS_META[job.status] || { label: job.status, color: P.muted, bg: P.border };
    const isApproved = job.status === 'approved_to_start';
    const isInside   = job.status === 'work_in_progress';
    const otp        = otpInputs[job.id] || '';
    const result     = results[job.id];

    return (
      <View style={s.card}>
        {/* Top */}
        <View style={s.cardTop}>
          <View style={s.cardIcon}><Text style={{ fontSize: 24 }}>🔧</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={s.vendorName}>{job.assignedVendorName}</Text>
            <Text style={s.jobTitle} numberOfLines={1}>{job.title}</Text>
          </View>
          <View style={[s.badge, { backgroundColor: meta.bg }]}>
            <Text style={[s.badgeText, { color: meta.color }]}>{meta.label}</Text>
          </View>
        </View>

        {/* Details */}
        <View style={s.details}>
          {[['Job ID', job.id], ['Unit', `${job.unit} · ${job.residentName}`], ['Category', job.category]].map(([k, v]) => (
            <View key={k} style={s.detRow}>
              <Text style={s.detKey}>{k}</Text>
              <Text style={s.detVal}>{v}</Text>
            </View>
          ))}
        </View>

        {/* OTP entry */}
        {isApproved && (
          <View>
            <View style={s.otpBanner}>
              <Text style={s.otpBannerText}>🔐 Ask vendor for their 6-digit gate OTP and enter it below</Text>
            </View>

            {result === 'ok' ? (
              <View style={[s.resultBox, { backgroundColor: P.greenBg, borderColor: P.green }]}>
                <Text style={{ fontSize: 26 }}>✅</Text>
                <View>
                  <Text style={[s.resultTitle, { color: P.green }]}>OTP Verified — Entry Allowed</Text>
                  <Text style={s.resultSub}>Status updated to In Progress</Text>
                </View>
              </View>
            ) : (
              <>
                {result === 'fail' && (
                  <View style={[s.resultBox, { backgroundColor: P.dangerBg, borderColor: P.danger, marginBottom: 8 }]}>
                    <Text style={{ fontSize: 20 }}>❌</Text>
                    <Text style={[s.resultTitle, { color: P.danger }]}>Wrong OTP — try again</Text>
                  </View>
                )}
                <View style={s.otpRow}>
                  <TextInput
                    style={s.otpInput}
                    value={otp}
                    onChangeText={t => setOtpInputs(prev => ({ ...prev, [job.id]: t.replace(/\D/g,'').slice(0,6) }))}
                    placeholder="● ● ● ● ● ●"
                    placeholderTextColor={P.muted}
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                  <TouchableOpacity
                    style={[s.verifyBtn, otp.length < 6 && { opacity: 0.4 }]}
                    onPress={() => handleVerify(job.id, otp)}
                    disabled={otp.length < 6}
                    activeOpacity={0.85}
                  >
                    <Text style={s.verifyBtnText}>Verify</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        )}

        {/* Checkout for inside vendors */}
        {isInside && (
          <View style={s.insideRow}>
            <Ionicons name="checkmark-circle" size={16} color={P.teal} />
            <Text style={s.insideText}>Currently working inside — Stage {job._workStep || 0}/12</Text>
          </View>
        )}
      </View>
    );
  };

  // ── Manual modal state ───────────────────────────────────────────────────────
  const [mJobId, setMJobId] = useState('');
  const [mOtp,   setMOtp]   = useState('');
  const [mResult, setMResult] = useState(null);
  const mFound = requests.find(r =>
    String(r.id).toUpperCase() === mJobId.trim().toUpperCase() && r.status === 'approved_to_start'
  );

  const handleManualVerify = async () => {
    if (!mFound) { Alert.alert('Not found', 'No approved job with this ID.'); return; }
    const ok = await handleVerify(mFound.id, mOtp);
    setMResult(ok ? 'ok' : 'fail');
    if (ok) { setMJobId(''); setMOtp(''); }
    else setMOtp('');
  };

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={P.navyDark} />

      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#FFF" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle}>Vendor Gate Entry</Text>
          <Text style={s.headerSub}>OTP verification required before entry</Text>
        </View>
        <TouchableOpacity style={s.manualBtn} onPress={() => { setManualModal(true); setMResult(null); }}>
          <Ionicons name="keypad-outline" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>

      <View style={s.infoBanner}>
        <Text style={s.infoText}>
          Vendors receive a 6-digit OTP when admin approves work to start. Verify OTP before granting entry.
        </Text>
      </View>

      {/* Tabs */}
      <View style={s.tabRow}>
        {[['pending', `Awaiting Entry (${pending.length})`], ['inside', `Inside (${inside.length})`]].map(([k, l]) => (
          <TouchableOpacity key={k} style={[s.tab, tab === k && s.tabActive]} onPress={() => setTab(k)}>
            <Text style={[s.tabText, tab === k && s.tabTextActive]}>{l}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={s.searchRow}>
        <Ionicons name="search-outline" size={16} color={P.muted} />
        <TextInput
          style={s.searchInput} placeholder="Search vendor, job ID, unit…"
          value={search} onChangeText={setSearch} placeholderTextColor={P.muted}
        />
      </View>

      <FlatList
        data={displayed}
        keyExtractor={r => r.id}
        contentContainerStyle={{ padding: 16, paddingTop: 4 }}
        renderItem={renderCard}
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={{ fontSize: 52 }}>🔧</Text>
            <Text style={s.emptyTitle}>
              {tab === 'pending' ? 'No vendors waiting at gate' : 'No vendors currently inside'}
            </Text>
            <Text style={s.emptySub}>
              {tab === 'pending'
                ? 'Vendors will appear here once admin approves work to start.'
                : 'Verified vendors working inside will appear here.'}
            </Text>
            <TouchableOpacity style={s.manualLookupBtn} onPress={() => setManualModal(true)}>
              <Ionicons name="keypad-outline" size={16} color={P.navy} />
              <Text style={s.manualLookupText}>Manual Job ID + OTP Entry</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Manual OTP Modal */}
      <Modal visible={manualModal} transparent animationType="slide" onRequestClose={() => setManualModal(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <View style={s.modalOverlay}>
            <View style={s.modalCard}>
              <View style={s.modalHeader}>
                <Text style={s.modalTitle}>Manual OTP Entry</Text>
                <TouchableOpacity onPress={() => setManualModal(false)}>
                  <Ionicons name="close" size={24} color={P.sub} />
                </TouchableOpacity>
              </View>

              <Text style={s.fieldLabel}>Job ID</Text>
              <TextInput
                style={s.fieldInput} value={mJobId}
                onChangeText={t => { setMJobId(t); setMResult(null); }}
                placeholder="e.g. MR-002" placeholderTextColor={P.muted} autoCapitalize="characters"
              />
              {mFound && (
                <View style={[s.foundBox]}>
                  <Text style={s.foundText}>✅ {mFound.assignedVendorName} · {mFound.category} · Unit {mFound.unit}</Text>
                </View>
              )}

              <Text style={[s.fieldLabel, { marginTop: 14 }]}>Gate OTP</Text>
              <TextInput
                style={[s.fieldInput, { fontSize: 24, fontWeight: '900', letterSpacing: 10, textAlign: 'center' }]}
                value={mOtp}
                onChangeText={t => { setMOtp(t.replace(/\D/g,'').slice(0,6)); setMResult(null); }}
                placeholder="● ● ● ● ● ●" placeholderTextColor={P.muted}
                keyboardType="number-pad" maxLength={6}
              />

              {mResult === 'ok'   && <Text style={s.mResultOk}>✅ Verified! Entry allowed.</Text>}
              {mResult === 'fail' && <Text style={s.mResultFail}>❌ Wrong OTP. Ask vendor to check again.</Text>}

              <TouchableOpacity
                style={[s.modalBtn, (!mFound || mOtp.length < 6) && { opacity: 0.4 }]}
                onPress={handleManualVerify} disabled={!mFound || mOtp.length < 6}
                activeOpacity={0.85}
              >
                <Text style={s.modalBtnText}>Verify & Allow Entry</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root:         { flex: 1, backgroundColor: P.bg },
  header:       { backgroundColor: P.navyDark, paddingTop: 16, paddingBottom: 20, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 14 },
  backBtn:      { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  headerTitle:  { color: '#FFF', fontSize: 18, fontWeight: '900' },
  headerSub:    { color: 'rgba(255,255,255,0.65)', fontSize: 12 },
  manualBtn:    { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginLeft: 'auto' },
  infoBanner:   { backgroundColor: P.amberBg, borderLeftWidth: 4, borderLeftColor: P.amber, paddingHorizontal: 16, paddingVertical: 10 },
  infoText:     { fontSize: 12, color: '#78350F', fontWeight: '600', lineHeight: 18 },
  tabRow:       { flexDirection: 'row', backgroundColor: P.surface, borderBottomWidth: 1, borderBottomColor: P.border },
  tab:          { flex: 1, paddingVertical: 13, alignItems: 'center' },
  tabActive:    { borderBottomWidth: 3, borderBottomColor: P.navy },
  tabText:      { fontSize: 13, fontWeight: '600', color: P.muted },
  tabTextActive:{ color: P.navy, fontWeight: '800' },
  searchRow:    { flexDirection: 'row', alignItems: 'center', backgroundColor: P.surface, marginHorizontal: 16, marginVertical: 10, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: P.border, gap: 8 },
  searchInput:  { flex: 1, fontSize: 14, color: P.text },

  card:         { backgroundColor: P.surface, borderRadius: 18, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: P.border, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 6 },
  cardTop:      { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  cardIcon:     { width: 48, height: 48, borderRadius: 24, backgroundColor: P.bg, alignItems: 'center', justifyContent: 'center' },
  vendorName:   { fontSize: 16, fontWeight: '800', color: P.text },
  jobTitle:     { fontSize: 12, color: P.sub, marginTop: 2 },
  badge:        { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  badgeText:    { fontSize: 11, fontWeight: '800' },
  details:      { backgroundColor: P.bg, borderRadius: 12, padding: 12, marginBottom: 14, gap: 8 },
  detRow:       { flexDirection: 'row', justifyContent: 'space-between' },
  detKey:       { fontSize: 12, color: P.sub, fontWeight: '600' },
  detVal:       { fontSize: 12, color: P.text, fontWeight: '700', maxWidth: '60%', textAlign: 'right' },

  otpBanner:    { backgroundColor: P.amberBg, borderRadius: 10, padding: 10, marginBottom: 10, borderLeftWidth: 3, borderLeftColor: P.amber },
  otpBannerText:{ fontSize: 12, color: '#78350F', fontWeight: '600' },
  otpRow:       { flexDirection: 'row', gap: 10 },
  otpInput:     { flex: 1, backgroundColor: P.bg, borderWidth: 1.5, borderColor: P.border, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 13, fontSize: 22, fontWeight: '800', color: P.text, letterSpacing: 8, textAlign: 'center' },
  verifyBtn:    { backgroundColor: P.navy, borderRadius: 12, paddingHorizontal: 18, justifyContent: 'center', alignItems: 'center' },
  verifyBtnText:{ color: '#FFF', fontSize: 14, fontWeight: '800' },
  resultBox:    { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 12, padding: 14, borderWidth: 1, marginBottom: 6 },
  resultTitle:  { fontSize: 14, fontWeight: '800' },
  resultSub:    { fontSize: 12, color: P.sub, marginTop: 2 },
  insideRow:    { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: P.tealBg, borderRadius: 10, padding: 10 },
  insideText:   { fontSize: 12, color: P.teal, fontWeight: '700' },

  empty:           { alignItems: 'center', paddingTop: 60, paddingHorizontal: 30, gap: 10 },
  emptyTitle:      { fontSize: 16, fontWeight: '800', color: P.text, textAlign: 'center' },
  emptySub:        { fontSize: 13, color: P.muted, textAlign: 'center', lineHeight: 20 },
  manualLookupBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 16, backgroundColor: P.surface, borderWidth: 1, borderColor: P.border, borderRadius: 12, paddingHorizontal: 20, paddingVertical: 12 },
  manualLookupText:{ color: P.navy, fontSize: 14, fontWeight: '700' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  modalCard:    { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle:   { fontSize: 18, fontWeight: '900', color: P.text },
  fieldLabel:   { fontSize: 12, fontWeight: '700', color: P.sub, marginBottom: 6 },
  fieldInput:   { backgroundColor: P.bg, borderWidth: 1.5, borderColor: P.border, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, color: P.text },
  foundBox:     { backgroundColor: P.greenBg, borderRadius: 10, padding: 10, marginTop: 6 },
  foundText:    { fontSize: 12, color: P.green, fontWeight: '700' },
  mResultOk:    { fontSize: 13, color: P.green,  fontWeight: '700', marginTop: 10 },
  mResultFail:  { fontSize: 13, color: P.danger, fontWeight: '700', marginTop: 10 },
  modalBtn:     { backgroundColor: P.navy, borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginTop: 18 },
  modalBtnText: { color: '#FFF', fontSize: 15, fontWeight: '800' },
});
