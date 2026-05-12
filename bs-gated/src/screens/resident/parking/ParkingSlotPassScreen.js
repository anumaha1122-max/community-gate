/**
 * ParkingSlotPassScreen.js
 * Shows the assigned parking slot pass — mirrors VisitorQRCodeScreen layout.
 * Resident navigates here after slot is APPROVED; can share slot details with guest.
 *
 * Usage in navigator:
 *   navigation.navigate('ParkingSlotPass', { parkingId: p.id })
 */

import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar,
  ScrollView, Alert, Modal,
} from 'react-native';
import { useAuthStore }     from '../../../store/AuthStore';
import { useSecurityStore } from '../../../store/securityStore';
import { COLORS, globalStyles } from '../../../components/common/theme';
import { useTheme } from '../../../hooks/useTheme';

// ─── Status meta ──────────────────────────────────────────────────────────────
const STATUS_META = {
  PENDING:  { label: '🕒 Pending Approval',  color: '#E65100', bg: '#FEF3C7' },
  APPROVED: { label: '✅ Approved — Slot Assigned', color: '#1A7A7A', bg: '#CCFBF1' },
  ACTIVE:   { label: '🚗 Guest is Parked',   color: '#1565C0', bg: '#DBEAFE' },
  EXPIRED:  { label: '🚪 Slot Expired',       color: '#64748B', bg: '#F1F5F9' },
  OVERSTAY: { label: '⚠️ Overstay!',          color: '#C62828', bg: '#FEE2E2' },
};

function fmt(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  });
}

// ─── Share Modal (identical to visitor screens) ───────────────────────────────
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
export default function ParkingSlotPassScreen({ navigation, route }) {
  const theme = useTheme();
  const { parkingId } = route.params || {};
  const guestParking  = useSecurityStore(s => s.guestParking);
  const parking       = (guestParking || []).find(p => p.id === parkingId);
  const [shareVisible, setShareVisible] = useState(false);

  if (!parking) {
    return (
      <SafeAreaView style={globalStyles.screen}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: COLORS.textMuted }}>Parking request not found</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 16 }}>
            <Text style={{ color: COLORS.primary }}>← Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const meta = STATUS_META[parking.status] || STATUS_META.PENDING;

  const shareMessage =
    `🏠 BS Gated Community — Guest Parking Pass\n\n` +
    `Guest: ${parking.guestName}\n` +
    `Vehicle: ${parking.vehicleNumber} (${parking.vehicleType})\n` +
    `Parking Slot: P-${parking.slotNumber}\n` +
    `Host Unit: ${parking.unit}\n` +
    (parking.guestPhone ? `Phone: ${parking.guestPhone}\n` : '') +
    (parking.startTime  ? `Valid from: ${fmt(parking.startTime)}\n` : '') +
    (parking.endTime    ? `Expires: ${fmt(parking.endTime)}\n` : '') +
    `\nPlease show this slot number at the main gate entrance.`;

  return (
    <SafeAreaView style={globalStyles.screen}>
      <StatusBar barStyle="light-content" backgroundColor="#1A7A7A" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Parking Pass</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, alignItems: 'center' }}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Pass Card */}
        <View style={styles.passCard}>
          <Text style={styles.passCardTitle}>BS Gated Community</Text>
          <Text style={styles.passCardSub}>Guest Parking Pass</Text>

          {/* Status banner */}
          <View style={[styles.statusBanner, { backgroundColor: meta.bg, borderColor: meta.color }]}>
            <Text style={[styles.statusBannerText, { color: meta.color }]}>{meta.label}</Text>
          </View>

          {/* Slot display */}
          {parking.slotNumber ? (
            <View style={styles.slotBox}>
              <Text style={styles.slotBoxLabel}>ASSIGNED SLOT</Text>
              <Text style={styles.slotBoxNumber}>P-{parking.slotNumber}</Text>
              <Text style={styles.slotBoxHint}>Show this slot number at the gate</Text>
            </View>
          ) : (
            <View style={[styles.slotBox, { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }]}>
              <Text style={[styles.slotBoxLabel, { color: '#92400E' }]}>SLOT</Text>
              <Text style={[styles.slotBoxNumber, { color: '#B45309', fontSize: 18 }]}>
                Pending Admin Assignment
              </Text>
              <Text style={[styles.slotBoxHint, { color: '#B45309' }]}>
                You will be notified once a slot is assigned
              </Text>
            </View>
          )}

          {/* Info table */}
          <View style={styles.infoBox}>
            {[
              { label: 'Guest Name',    value: parking.guestName },
              { label: 'Vehicle No.',   value: parking.vehicleNumber },
              { label: 'Vehicle Type',  value: parking.vehicleType },
              { label: 'Phone',         value: parking.guestPhone || '—' },
              { label: 'Host Unit',     value: parking.unit },
              { label: 'Duration',      value: parking.duration ? `${parking.duration} day(s)` : '—' },
              { label: 'Requested',     value: fmt(parking.requestedAt) },
              ...(parking.startTime ? [{ label: 'Active from', value: fmt(parking.startTime) }] : []),
              ...(parking.endTime   ? [{ label: 'Expires',     value: fmt(parking.endTime)   }] : []),
            ].map(row => (
              <View key={row.label} style={styles.infoRow}>
                <Text style={styles.infoLabel}>{row.label}</Text>
                <Text style={styles.infoValue}>{row.value}</Text>
              </View>
            ))}
          </View>

          {/* Active status detail */}
          {parking.status === 'ACTIVE' && parking.entryTime && (
            <View style={[styles.statusBanner, { backgroundColor: '#EFF6FF', borderColor: '#1565C0', width: '100%', marginTop: 4 }]}>
              <Text style={{ color: '#1565C0', fontWeight: '700', fontSize: 13 }}>
                🚗 Guest entered at {fmt(parking.entryTime)}
                {parking.entryGate ? `\nGate: ${parking.entryGate}` : ''}
              </Text>
            </View>
          )}

          {/* Expired detail */}
          {parking.status === 'EXPIRED' && parking.exitTime && (
            <View style={[styles.statusBanner, { backgroundColor: '#F1F5F9', borderColor: '#CBD5E1', width: '100%', marginTop: 4 }]}>
              <Text style={{ color: '#64748B', fontWeight: '700', fontSize: 13 }}>
                🚪 Guest exited at {fmt(parking.exitTime)}
              </Text>
            </View>
          )}

          {/* Overstay warning */}
          {parking.status === 'OVERSTAY' && (
            <View style={[styles.statusBanner, { backgroundColor: '#FEE2E2', borderColor: '#C62828', width: '100%', marginTop: 4 }]}>
              <Text style={{ color: '#C62828', fontWeight: '700', fontSize: 13 }}>
                ⚠️ Guest has exceeded the allowed parking duration. Please contact the gate or admin.
              </Text>
            </View>
          )}
        </View>

        {/* Approved helper note */}
        {parking.status === 'APPROVED' && (
          <View style={styles.infoBanner}>
            <Text style={styles.infoText}>
              ✅ Slot P-{parking.slotNumber} is assigned. Share this pass with your guest — they should present slot number P-{parking.slotNumber} at the gate.
            </Text>
          </View>
        )}

        {/* Share button — shown when slot is assigned */}
        {parking.slotNumber && (
          <TouchableOpacity
            style={styles.shareBtn}
            onPress={() => setShareVisible(true)}
            activeOpacity={0.85}
          >
            <Text style={styles.shareBtnText}>📤 Share Parking Pass with Guest</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      <ShareModal
        visible={shareVisible}
        onClose={() => setShareVisible(false)}
        title="📤 Share Parking Pass"
        message={shareMessage}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Header (identical to visitor screens)
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 14,
    backgroundColor: '#1A7A7A',
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#FFFFFF', flex: 1, textAlign: 'center' },
  backBtn:     { paddingHorizontal: 8, paddingVertical: 4, minWidth: 50 },
  backText:    { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },

  // Pass card
  passCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D0EEEE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 16,
    width: '100%',
  },
  passCardTitle: { fontSize: 20, fontWeight: '800', color: '#1A2E2E', marginBottom: 4 },
  passCardSub:   { fontSize: 13, color: '#7A9E9E', marginBottom: 16 },

  // Status banner
  statusBanner: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    alignSelf: 'center',
    marginBottom: 16,
  },
  statusBannerText: { fontSize: 13, fontWeight: '700' },

  // Slot box
  slotBox: {
    width: '100%',
    backgroundColor: '#E8F5F5',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#1A7A7A',
    paddingVertical: 20,
    marginBottom: 16,
  },
  slotBoxLabel:  { fontSize: 11, fontWeight: '800', letterSpacing: 2, color: '#7A9E9E', marginBottom: 6 },
  slotBoxNumber: { fontSize: 40, fontWeight: '900', color: '#1A7A7A', letterSpacing: 4, fontFamily: 'monospace' },
  slotBoxHint:   { fontSize: 11, color: '#7A9E9E', marginTop: 6 },

  // Info table
  infoBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#D0EEEE',
    marginBottom: 16,
    width: '100%',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: '#E8F5F5',
  },
  infoLabel: { fontSize: 13, color: '#7A9E9E', fontWeight: '600' },
  infoValue: { fontSize: 13, color: '#1A2E2E', fontWeight: '700', maxWidth: '60%', textAlign: 'right' },

  // Info banner
  infoBanner: {
    backgroundColor: '#E8F5F5',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#D0EEEE',
    width: '100%',
  },
  infoText: { fontSize: 13, color: '#3D6E6E', lineHeight: 20 },

  // Share button
  shareBtn: {
    backgroundColor: '#1A7A7A',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    width: '100%',
  },
  shareBtnText: { fontSize: 15, fontWeight: '800', color: '#FFFFFF' },
});