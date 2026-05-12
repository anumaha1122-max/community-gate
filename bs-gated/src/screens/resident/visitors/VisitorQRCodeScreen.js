import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar,
  ScrollView, TextInput, Alert, Modal,
} from 'react-native';
import { useAuthStore }     from '../../../store/AuthStore';
import { useSecurityStore } from '../../../store/securityStore';
import { COLORS, globalStyles } from '../../../components/common/theme';
import { useTheme } from '../../../hooks/useTheme';

const PURPOSES = ['Personal Visit', 'Delivery', 'Service', 'Guest Stay', 'Official Work', 'Other'];

// ─── Simulated Share Sheet ────────────────────────────────────────────────────
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
                  <TouchableOpacity key={c.label} style={shareStyles.channelBtn} onPress={() => handleShare(c.label)}>
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
  channelBtn:   { flex: 1, alignItems: 'center', backgroundColor: '#E8F5F5', borderRadius: 14, paddingVertical: 12, marginHorizontal: 4 },
  channelIcon:  { fontSize: 24 },
  channelText:  { fontSize: 11, fontWeight: '700', color: '#7A9E9E', marginTop: 4 },
  sentRow:      { alignItems: 'center', paddingVertical: 20 },
  sentText:     { fontSize: 16, fontWeight: '800', color: '#1A7A7A' },
  cancelBtn:    { paddingVertical: 14, alignItems: 'center' },
  cancelText:   { fontSize: 14, fontWeight: '700', color: '#64748B' },
});

const STATUS_META = {
  CREATED:     { color: '#E65100', bg: '#FEF3C7', label: '⏳ Created' },
  APPROVED:    { color: '#1A7A7A', bg: '#CCFBF1', label: '✅ Approved — Ready to Enter' },
  CHECKED_IN:  { color: '#1A7A7A', bg: '#DBEAFE', label: '🚶 Inside — Checked In' },
  CHECKED_OUT: { color: '#64748B', bg: '#F1F5F9', label: '🚪 Checked Out' },
  DENIED:      { color: '#C62828', bg: '#FEE2E2', label: '🚫 Entry Denied' },
};

function fmt(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

// ─── Visitor List ─────────────────────────────────────────────────────────────

export default function QRCodeScreen({ navigation, route }) {
  const theme = useTheme();
  const { visitorId } = route.params || {};
  const visitors = useSecurityStore(s => s.visitors);
  const visitor  = visitors.find(v => v.id === visitorId);
  const [shareVisible, setShareVisible] = useState(false);

  if (!visitor) {
    return (
      <SafeAreaView style={globalStyles.screen}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: COLORS.textMuted }}>Visitor pass not found</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 16 }}>
            <Text style={{ color: COLORS.primary }}>← Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const meta = STATUS_META[visitor.status] || STATUS_META.CREATED;

  return (
    <SafeAreaView style={globalStyles.screen}>
      <StatusBar barStyle="light-content" backgroundColor='#1A7A7A' />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Visitor Pass</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, alignItems: 'center' }}>
        <View style={styles.qrCard}>
          <Text style={styles.qrCardTitle}>BS Gated Community</Text>
          <Text style={styles.qrCardSub}>Visitor Access Pass</Text>

          {/* Status Banner */}
          <View style={[styles.statusBanner, { backgroundColor: meta.bg, borderColor: meta.color, alignSelf: 'center', marginBottom: 16 }]}>
            <Text style={[styles.statusBannerText, { color: meta.color }]}>{meta.label}</Text>
          </View>

          {/* QR Box */}
          <View style={styles.qrBox}>
            <Text style={{ fontSize: 70 }}>📱</Text>
            <Text style={styles.qrCodeText}>{visitor.qrCode}</Text>
            <Text style={{ fontSize: 10, color: COLORS.textMuted, marginTop: 4 }}>Show QR at Gate</Text>
          </View>

          {/* OTP */}
          <View style={styles.otpDisplay}>
            <Text style={styles.otpLabel}>One-Time Password (OTP)</Text>
            <Text style={styles.otpValue}>{visitor.otp}</Text>
            <Text style={styles.otpHint}>Guard enters this OTP to allow entry</Text>
          </View>

          {/* Info */}
          <View style={styles.infoBox}>
            {[
              { label: 'Name',      value: visitor.name },
              { label: 'Purpose',   value: visitor.purpose },
              { label: 'Phone',     value: visitor.phone || '—' },
              { label: 'Vehicle',   value: visitor.guardVehicleNote || visitor.vehicleNumber || '—' },
              { label: 'Host Unit', value: visitor.hostUnit },
              { label: 'Created',   value: fmt(visitor.createdAt) },
            ].map(row => (
              <View key={row.label} style={styles.infoRow}>
                <Text style={styles.infoLabel}>{row.label}</Text>
                <Text style={styles.infoValue}>{row.value}</Text>
              </View>
            ))}
          </View>

          {/* Check-in details if inside */}
          {visitor.status === 'CHECKED_IN' && (
            <View style={[styles.statusBanner, { backgroundColor: theme.surface, borderColor: theme.primary, width: '100%', marginTop: 12 }]}>
              <Text style={{ color: theme.primary, fontWeight: '700', fontSize: 13 }}>
                🚶 Entered at {visitor.entryGate}{'\n'}
                Guard: {visitor.verifiedByName || visitor.verifiedBy}{'\n'}
                Time: {fmt(visitor.checkedInAt)}
              </Text>
            </View>
          )}

          {visitor.status === 'CHECKED_OUT' && (
            <View style={[styles.statusBanner, { backgroundColor: theme.inputBg, borderColor: '#64748B', width: '100%', marginTop: 12 }]}>
              <Text style={{ color: '#64748B', fontWeight: '700', fontSize: 13 }}>
                🚪 Exited at {fmt(visitor.checkedOutAt)}
              </Text>
            </View>
          )}
        </View>

        {visitor.status === 'APPROVED' && (
          <View style={[styles.infoBanner, { marginTop: 16 }]}>
            <Text style={styles.infoText}>
              ✅ This pass is active. Your visitor can present this OTP ({visitor.otp}) or QR code at the gate for entry.
            </Text>
          </View>
        )}

        {/* Share with Visitor button — always shown */}
        <TouchableOpacity
          style={[styles.shareBtn]}
          onPress={() => setShareVisible(true)}
        >
          <Text style={styles.shareBtnText}>📤 Share with Visitor</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      <ShareModal
        visible={shareVisible}
        onClose={() => setShareVisible(false)}
        title="Share Visitor Pass"
        message={`🏠 BS Gated Community — Visitor Pass\n\nGuest: ${visitor.name}\nHost Unit: ${visitor.hostUnit}\nPurpose: ${visitor.purpose}\nOTP: ${visitor.otp}\n${visitor.phone ? 'Phone: ' + visitor.phone + '\n' : ''}${visitor.vehicleNumber ? 'Vehicle: ' + visitor.vehicleNumber + '\n' : ''}\nShow this OTP at the gate for entry.`}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // ── Header ──────────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#1A7A7A',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  backBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 50,
  },
  backText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  addBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  addBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // ── Filter chips ─────────────────────────────────────────────────────────────
  filterRow: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#E8F5F5',
    borderWidth: 1,
    borderColor: '#D0EEEE',
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: '#1A7A7A',
    borderColor: '#1A7A7A',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3D6E6E',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },

  // ── Visitor card elements ─────────────────────────────────────────────────────
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#D0EEEE',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  statusBanner: {
    marginTop: 10,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  statusBannerText: {
    fontSize: 13,
    fontWeight: '700',
  },

  // ── Add Visitor form ─────────────────────────────────────────────────────────
  infoBanner: {
    backgroundColor: '#E8F5F5',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#D0EEEE',
  },
  infoText: {
    fontSize: 13,
    color: '#3D6E6E',
    lineHeight: 20,
  },
  purposeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },

  // ── QR Code screen ───────────────────────────────────────────────────────────
  qrCard: {
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
  },
  qrCardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A2E2E',
    marginBottom: 4,
  },
  qrCardSub: {
    fontSize: 13,
    color: '#7A9E9E',
    marginBottom: 16,
  },
  qrBox: {
    width: 180,
    height: 180,
    backgroundColor: '#E8F5F5',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#1A7A7A',
    marginBottom: 16,
  },
  qrCodeText: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#1A7A7A',
    textAlign: 'center',
    fontWeight: '700',
    letterSpacing: 1,
    padding: 8,
  },
  otpDisplay: {
    alignItems: 'center',
    backgroundColor: '#E8F5F5',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#D0EEEE',
    width: '100%',
    marginBottom: 8,
  },
  otpLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7A9E9E',
    letterSpacing: 1,
    marginBottom: 6,
  },
  otpValue: {
    fontSize: 36,
    fontWeight: '900',
    color: '#1A7A7A',
    letterSpacing: 8,
    fontFamily: 'monospace',
  },
  otpHint: {
    fontSize: 11,
    color: '#7A9E9E',
    marginTop: 4,
    textAlign: 'center',
  },
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
  infoLabel: {
    fontSize: 13,
    color: '#7A9E9E',
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 13,
    color: '#1A2E2E',
    fontWeight: '700',
    maxWidth: '60%',
    textAlign: 'right',
  },
  shareBtn: {
    backgroundColor: '#1A7A7A',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginTop: 8,
    width: '100%',
  },
  shareBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
