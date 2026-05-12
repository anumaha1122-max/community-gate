/**
 * GuestParkingScreen.js
 * Resident requests a guest parking slot; admin assigns the slot number after approval.
 * Theme: matches Visitor screens — #1A7A7A teal header, white cards, teal accents, light teal bg
 *
 * Workflow:
 *  1. Resident fills form (guest name, phone, vehicle number, vehicle type, expected date, duration)
 *  2. Request saved with status PENDING
 *  3. Admin reviews → assigns slot number → status → APPROVED
 *  4. Resident notified → sees slot number → can share with guest
 *  5. Guard marks entry → ACTIVE; on exit → EXPIRED
 *  6. If guest stays beyond allowed time → OVERSTAY
 */

import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar,
  ScrollView, TextInput, Alert, Modal,
} from 'react-native';
import { useAuthStore }     from '../../../store/AuthStore';
import { useSecurityStore } from '../../../store/securityStore';
import { COLORS, globalStyles } from '../../../components/common/theme';
import { useTheme } from '../../../hooks/useTheme';

// ─── Constants ────────────────────────────────────────────────────────────────
const VEHICLE_TYPES = [
  { key: 'Car',   icon: '🚗' },
  { key: 'Bike',  icon: '🏍️' },
  { key: 'Auto',  icon: '🛺' },
  { key: 'Truck', icon: '🚛' },
];

const DURATION_OPTIONS = ['1', '2', '3', '7'];

const STATUS_META = {
  PENDING:  { label: 'Pending Approval', color: '#E65100', bg: '#FEF3C7', icon: '🕒' },
  APPROVED: { label: 'Approved',         color: '#1A7A7A', bg: '#CCFBF1', icon: '✅' },
  ACTIVE:   { label: 'Active',           color: '#1A7A7A', bg: '#DBEAFE', icon: '🚗' },
  EXPIRED:  { label: 'Expired',          color: '#64748B', bg: '#F1F5F9', icon: '🚪' },
  OVERSTAY: { label: 'Overstay!',        color: '#C62828', bg: '#FEE2E2', icon: '⚠️' },
};

const FILTERS = [
  { k: 'all',      label: 'All' },
  { k: 'PENDING',  label: '🕒 Pending' },
  { k: 'APPROVED', label: '✅ Approved' },
  { k: 'ACTIVE',   label: '🚗 Active' },
  { k: 'EXPIRED',  label: '🚪 Expired' },
];

function fmt(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  });
}

// ─── Share Modal (same style as visitor screens) ──────────────────────────────
function ShareModal({ visible, onClose, title, message }) {
  const [shared, setShared] = useState(false);
  const CHANNELS = [
    { icon: '💬', label: 'WhatsApp' },
    { icon: '📱', label: 'SMS' },
    { icon: '📧', label: 'Email' },
    { icon: '📋', label: 'Copy' },
  ];
  const handleShare = (channel) => {
    setShared(true);
    setTimeout(() => {
      setShared(false);
      onClose();
      Alert.alert('✅ Shared!', `Details sent via ${channel}.`);
    }, 800);
  };
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={shareStyles.overlay}>
        <View style={shareStyles.sheet}>
          <View style={shareStyles.handle} />
          <Text style={shareStyles.title}>{title}</Text>
          <View style={shareStyles.messageBubble}>
            <Text style={shareStyles.messageText}>{message}</Text>
          </View>
          {shared ? (
            <View style={shareStyles.sentRow}>
              <Text style={shareStyles.sentText}>✅ Sending...</Text>
            </View>
          ) : (
            <>
              <Text style={shareStyles.channelLabel}>Send via</Text>
              <View style={shareStyles.channelRow}>
                {CHANNELS.map(c => (
                  <TouchableOpacity
                    key={c.label}
                    style={shareStyles.channelBtn}
                    onPress={() => handleShare(c.label)}
                  >
                    <Text style={shareStyles.channelIcon}>{c.icon}</Text>
                    <Text style={shareStyles.channelText}>{c.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
          <TouchableOpacity style={shareStyles.cancelBtn} onPress={onClose}>
            <Text style={shareStyles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const shareStyles = StyleSheet.create({
  overlay:      { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet:        { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 32 },
  handle:       { width: 40, height: 4, backgroundColor: '#D0EEEE', borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  title:        { fontSize: 16, fontWeight: '800', color: '#1A2E2E', marginBottom: 12 },
  messageBubble:{ backgroundColor: '#E8F5F5', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#D0EEEE', marginBottom: 16 },
  messageText:  { fontSize: 13, color: '#3D6E6E', lineHeight: 20, fontFamily: 'monospace' },
  channelLabel: { fontSize: 11, fontWeight: '700', color: '#7A9E9E', marginBottom: 10 },
  channelRow:   { flexDirection: 'row', marginBottom: 16 },
  channelBtn:   { flex: 1, alignItems: 'center', backgroundColor: '#F0FAFA', borderRadius: 14, paddingVertical: 12, marginHorizontal: 4 },
  channelIcon:  { fontSize: 24 },
  channelText:  { fontSize: 11, fontWeight: '700', color: '#7A9E9E', marginTop: 4 },
  sentRow:      { alignItems: 'center', paddingVertical: 20 },
  sentText:     { fontSize: 16, fontWeight: '800', color: '#1A7A7A' },
  cancelBtn:    { paddingVertical: 14, alignItems: 'center' },
  cancelText:   { fontSize: 14, fontWeight: '700', color: '#64748B' },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function GuestParkingScreen({ navigation }) {
  const theme               = useTheme();
  const user                = useAuthStore(s => s.user);
  const guestParking        = useSecurityStore(s => s.guestParking);
  const requestGuestParking = useSecurityStore(s => s.requestGuestParking);

  const myId       = user?.id || 'res1';
  const myRequests = (guestParking || [])
    .filter(p => p.residentId === myId)
    .sort((a, b) => new Date(b.requestedAt) - new Date(a.requestedAt));

  const [showForm, setShowForm]         = useState(false);
  const [shareParking, setShareParking] = useState(null);
  const [filter, setFilter]             = useState('all');
  const [form, setForm] = useState({
    guestName: '', guestPhone: '', vehicleNumber: '',
    vehicleType: 'Car', expectedDate: '', duration: '1',
  });

  const filtered = filter === 'all'
    ? myRequests
    : myRequests.filter(p => p.status === filter);

  const activeCount  = myRequests.filter(p => p.status === 'ACTIVE').length;
  const pendingCount = myRequests.filter(p => p.status === 'PENDING').length;

  const shareText = (p) =>
    `🏠 BS Gated Community — Guest Parking\n\n` +
    `Guest: ${p.guestName}\n` +
    `Vehicle: ${p.vehicleNumber} (${p.vehicleType})\n` +
    `Parking Slot: P-${p.slotNumber}\n` +
    `Host Unit: ${p.unit}\n` +
    (p.guestPhone ? `Phone: ${p.guestPhone}\n` : '') +
    (p.startTime  ? `Valid from: ${fmt(p.startTime)}\n` : '') +
    (p.endTime    ? `Expires: ${fmt(p.endTime)}\n` : '') +
    `\nPlease show this slot number at the main gate.`;

  const handleRequest = () => {
    if (!form.guestName.trim())     { Alert.alert('Required', 'Please enter guest name'); return; }
    if (!form.vehicleNumber.trim()) { Alert.alert('Required', 'Please enter vehicle number'); return; }
    requestGuestParking({
      residentId:   myId,
      residentName: user?.name || 'Resident',
      unit:         user?.unit || 'A-101',
      ...form,
    });
    setForm({ guestName: '', guestPhone: '', vehicleNumber: '', vehicleType: 'Car', expectedDate: '', duration: '1' });
    setShowForm(false);
    Alert.alert(
      '✅ Request Submitted',
      'Admin will review and assign a parking slot. You will be notified once approved.'
    );
  };

  return (
    <SafeAreaView style={globalStyles.screen}>
      <StatusBar barStyle="light-content" backgroundColor="#1A7A7A" />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>🅿️ Guest Parking</Text>
            <Text style={styles.headerSub}>
              {activeCount > 0
                ? `${activeCount} active · ${pendingCount} pending`
                : `${myRequests.length} total request${myRequests.length !== 1 ? 's' : ''}`}
            </Text>
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={() => setShowForm(true)}>
            <Text style={styles.addBtnText}>+ Request</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Filter chips ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterRow}
        contentContainerStyle={{ paddingHorizontal: 12 }}
      >
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f.k}
            style={[styles.chip, filter === f.k && styles.chipActive]}
            onPress={() => setFilter(f.k)}
          >
            <Text style={[styles.chipText, filter === f.k && styles.chipTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── List ── */}
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Info banner when empty */}
        {myRequests.length === 0 && (
          <View style={styles.infoBanner}>
            <Text style={styles.infoText}>
              ℹ️  Request a parking slot for your guest. Admin reviews and assigns a slot number.
              Share the slot number with your guest — they present it at the gate.
            </Text>
          </View>
        )}

        {filtered.length === 0 ? (
          <View style={globalStyles.emptyState}>
            <Text style={{ fontSize: 52 }}>🅿️</Text>
            <Text style={globalStyles.emptyText}>
              {filter === 'all' ? 'No parking requests yet' : `No ${filter.toLowerCase()} requests`}
            </Text>
            {filter === 'all' && (
              <TouchableOpacity
                style={[globalStyles.btn, globalStyles.btnPrimary, { marginTop: 16 }]}
                onPress={() => setShowForm(true)}
              >
                <Text style={globalStyles.btnText}>Request Guest Parking</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          filtered.map(p => {
            const meta = STATUS_META[p.status] || STATUS_META.PENDING;
            const isShareable = ['APPROVED', 'ACTIVE'].includes(p.status) && p.slotNumber;
            return (
              <TouchableOpacity
                key={p.id}
                style={[
                  globalStyles.card,
                  { borderLeftWidth: 4, borderLeftColor: meta.color, padding: 0, overflow: 'hidden' },
                  p.status === 'OVERSTAY' && { borderColor: '#C62828', borderWidth: 2 },
                ]}
                onPress={() => navigation.navigate('ParkingSlotPass', { parkingId: p.id })}
                activeOpacity={0.92}
              >
                {/* Top row */}
                <View style={styles.cardTop}>
                  <View style={styles.cardAvatar}>
                    <Text style={{ fontSize: 24 }}>{meta.icon}</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.cardName}>{p.guestName}</Text>
                    <Text style={styles.cardVehicle}>
                      {VEHICLE_TYPES.find(v => v.key === p.vehicleType)?.icon || '🚗'}{' '}
                      {p.vehicleNumber} · {p.vehicleType}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: meta.bg }]}>
                    <Text style={[styles.statusBadgeText, { color: meta.color }]}>{meta.label}</Text>
                  </View>
                </View>

                {/* Slot assignment banner */}
                {p.slotNumber ? (
                  <View style={styles.slotBanner}>
                    <Text style={styles.slotLabel}>ASSIGNED SLOT</Text>
                    <Text style={styles.slotNumber}>P-{p.slotNumber}</Text>
                  </View>
                ) : p.status === 'PENDING' ? (
                  <View style={[styles.slotBanner, { backgroundColor: '#FFFBEB', borderTopColor: '#FDE68A' }]}>
                    <Text style={[styles.slotLabel, { color: '#92400E' }]}>SLOT</Text>
                    <Text style={[styles.slotNumber, { color: '#B45309', fontSize: 14 }]}>
                      Awaiting Admin Assignment
                    </Text>
                  </View>
                ) : null}

                {/* Details */}
                <View style={styles.cardMeta}>
                  {p.guestPhone ? <Text style={styles.cardMetaText}>📱 {p.guestPhone}</Text> : null}
                  <Text style={styles.cardMetaText}>📅 Requested: {fmt(p.requestedAt)}</Text>
                  {p.duration ? <Text style={styles.cardMetaText}>⏱ Duration: {p.duration} day(s)</Text> : null}
                  {p.startTime && <Text style={styles.cardMetaText}>🟢 Active from: {fmt(p.startTime)}</Text>}
                  {p.endTime   && <Text style={styles.cardMetaText}>🔴 Expires: {fmt(p.endTime)}</Text>}
                  <Text style={styles.cardMetaText}>🏠 Unit: {p.unit}</Text>
                </View>

                {/* Share button — only when slot is assigned */}
                {isShareable && (
                  <TouchableOpacity
                    style={styles.shareBtn}
                    onPress={(e) => { e.stopPropagation(); setShareParking(p); }}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.shareBtnText}>📤 Share Parking Details with Guest</Text>
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* ── Share Modal ── */}
      {shareParking && (
        <ShareModal
          visible={!!shareParking}
          onClose={() => setShareParking(null)}
          title="📤 Share Parking Details"
          message={shareText(shareParking)}
        />
      )}

      {/* ── Request Form Modal ── */}
      <Modal visible={showForm} transparent animationType="slide">
        <View style={formStyles.overlay}>
          <View style={formStyles.sheet}>
            <View style={formStyles.handle} />
            <View style={formStyles.sheetHeader}>
              <Text style={formStyles.sheetTitle}>Request Guest Parking</Text>
              <TouchableOpacity onPress={() => setShowForm(false)} style={formStyles.closeBtn}>
                <Text style={formStyles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.infoBanner}>
                <Text style={styles.infoText}>
                  Admin will assign a slot after approval. You'll be notified to share the slot number with your guest.
                </Text>
              </View>

              <Text style={formStyles.label}>Guest Name *</Text>
              <TextInput
                style={formStyles.input}
                placeholder="Full name of your guest"
                placeholderTextColor="#7A9E9E"
                value={form.guestName}
                onChangeText={v => setForm(f => ({ ...f, guestName: v }))}
              />

              <Text style={formStyles.label}>Guest Phone (optional)</Text>
              <TextInput
                style={formStyles.input}
                placeholder="Mobile number"
                placeholderTextColor="#7A9E9E"
                value={form.guestPhone}
                onChangeText={v => setForm(f => ({ ...f, guestPhone: v }))}
                keyboardType="phone-pad"
              />

              <Text style={formStyles.label}>Vehicle Number *</Text>
              <TextInput
                style={formStyles.input}
                placeholder="e.g. TS09AB1234"
                placeholderTextColor="#7A9E9E"
                value={form.vehicleNumber}
                onChangeText={v => setForm(f => ({ ...f, vehicleNumber: v.toUpperCase() }))}
                autoCapitalize="characters"
              />

              <Text style={formStyles.label}>Vehicle Type</Text>
              <View style={formStyles.typeGrid}>
                {VEHICLE_TYPES.map(t => (
                  <TouchableOpacity
                    key={t.key}
                    style={[formStyles.typeChip, form.vehicleType === t.key && formStyles.typeChipActive]}
                    onPress={() => setForm(f => ({ ...f, vehicleType: t.key }))}
                  >
                    <Text style={formStyles.typeChipIcon}>{t.icon}</Text>
                    <Text style={[
                      formStyles.typeChipText,
                      form.vehicleType === t.key && formStyles.typeChipTextActive,
                    ]}>
                      {t.key}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={formStyles.label}>Expected Date (optional)</Text>
              <TextInput
                style={formStyles.input}
                placeholder="e.g. 15 Jan 2025"
                placeholderTextColor="#7A9E9E"
                value={form.expectedDate}
                onChangeText={v => setForm(f => ({ ...f, expectedDate: v }))}
              />

              <Text style={formStyles.label}>Duration (days)</Text>
              <View style={formStyles.durationRow}>
                {DURATION_OPTIONS.map(d => (
                  <TouchableOpacity
                    key={d}
                    style={[formStyles.durationChip, form.duration === d && formStyles.durationChipActive]}
                    onPress={() => setForm(f => ({ ...f, duration: d }))}
                  >
                    <Text style={[
                      formStyles.durationText,
                      form.duration === d && formStyles.durationTextActive,
                    ]}>
                      {d}d
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={[globalStyles.btn, globalStyles.btnPrimary, { marginTop: 8 }]}
                onPress={handleRequest}
                activeOpacity={0.85}
              >
                <Text style={globalStyles.btnText}>🚗 Submit Parking Request</Text>
              </TouchableOpacity>
              <View style={{ height: 24 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Header
  header: {
    padding: 20,
    paddingTop: 40,
    backgroundColor: '#1A7A7A',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backBtn:      { marginBottom: 8 },
  backText:     { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  headerTitle:  { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
  headerSub:    { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  addBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addBtnText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },

  // Filter chips
  filterRow: {
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    maxHeight: 48,
    borderBottomWidth: 1,
    borderBottomColor: '#D0EEEE',
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: '#F0FAFA',
    borderWidth: 1,
    borderColor: '#D0EEEE',
    marginRight: 6,
    height: 30,
    justifyContent: 'center',
  },
  chipActive:     { backgroundColor: '#1A7A7A', borderColor: '#1A7A7A' },
  chipText:       { fontSize: 12, fontWeight: '600', color: '#3D6E6E' },
  chipTextActive: { color: '#FFFFFF' },

  // Info banner
  infoBanner: {
    backgroundColor: '#E8F5F5',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#D0EEEE',
  },
  infoText: { fontSize: 13, color: '#3D6E6E', lineHeight: 20 },

  // Card
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    paddingBottom: 10,
  },
  cardAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#E8F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D0EEEE',
  },
  cardName:    { fontSize: 15, fontWeight: '800', color: '#1A2E2E' },
  cardVehicle: { fontSize: 13, color: '#7A9E9E', marginTop: 2 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  statusBadgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.3 },

  // Slot banner
  slotBanner: {
    backgroundColor: '#E8F5F5',
    borderTopWidth: 1,
    borderTopColor: '#D0EEEE',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  slotLabel:  { fontSize: 10, fontWeight: '800', letterSpacing: 1.5, color: '#7A9E9E' },
  slotNumber: { fontSize: 22, fontWeight: '900', color: '#1A7A7A', letterSpacing: 2 },

  // Card meta
  cardMeta:     { paddingHorizontal: 14, paddingBottom: 12 },
  cardMetaText: { fontSize: 12, color: '#7A9E9E', marginTop: 3 },

  // Share button
  shareBtn: {
    backgroundColor: '#1A7A7A',
    marginHorizontal: 14,
    marginBottom: 14,
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
  },
  shareBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
});

const formStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 8,
    maxHeight: '92%',
  },
  handle:      { width: 40, height: 4, backgroundColor: '#D0EEEE', borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sheetTitle:  { fontSize: 18, fontWeight: '900', color: '#1A2E2E' },
  closeBtn:    { padding: 4 },
  closeBtnText:{ fontSize: 22, color: '#7A9E9E' },

  label: { fontSize: 13, fontWeight: '700', color: '#3D6E6E', marginBottom: 6, marginTop: 4 },
  input: {
    backgroundColor: '#F0FAFA',
    borderWidth: 1.5,
    borderColor: '#D0EEEE',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1A2E2E',
    marginBottom: 12,
  },

  typeGrid:           { flexDirection: 'row', gap: 8, marginBottom: 12 },
  typeChip:           { flex: 1, alignItems: 'center', backgroundColor: '#F0FAFA', borderRadius: 12, paddingVertical: 10, borderWidth: 1.5, borderColor: '#D0EEEE' },
  typeChipActive:     { backgroundColor: '#1A7A7A', borderColor: '#1A7A7A' },
  typeChipIcon:       { fontSize: 20, marginBottom: 3 },
  typeChipText:       { fontSize: 12, fontWeight: '700', color: '#3D6E6E' },
  typeChipTextActive: { color: '#FFFFFF' },

  durationRow:           { flexDirection: 'row', gap: 8, marginBottom: 16 },
  durationChip:          { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 10, backgroundColor: '#F0FAFA', borderWidth: 1.5, borderColor: '#D0EEEE' },
  durationChipActive:    { backgroundColor: '#1A7A7A', borderColor: '#1A7A7A' },
  durationText:          { fontSize: 14, fontWeight: '800', color: '#3D6E6E' },
  durationTextActive:    { color: '#FFFFFF' },
});