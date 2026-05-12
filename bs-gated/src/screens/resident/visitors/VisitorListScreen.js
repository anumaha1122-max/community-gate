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
        <View style={[shareStyles.sheet, { backgroundColor: '#1A7A7A' }]}>
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
  overlay:      { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet:        { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 32 },
  handle:       { width: 40, height: 4, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  title:        { fontSize: 18, fontWeight: '800', color: '#FFFFFF', marginBottom: 12 },
  messageBubble:{ backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', marginBottom: 16 },
  messageText:  { fontSize: 13, color: 'rgba(255,255,255,0.9)', lineHeight: 20, fontFamily: 'monospace' },
  channelLabel: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.7)', marginBottom: 10 },
  channelRow:   { flexDirection: 'row', marginBottom: 16 },
  channelBtn:   { flex: 1, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 14, paddingVertical: 12, marginHorizontal: 4 },
  channelIcon:  { fontSize: 24 },
  channelText:  { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  sentRow:      { alignItems: 'center', paddingVertical: 20 },
  sentText:     { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
  cancelBtn:    { paddingVertical: 14, alignItems: 'center' },
  cancelText:   { fontSize: 14, fontWeight: '700', color: 'rgba(255,255,255,0.7)' },
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

export default function VisitorListScreen({ navigation }) {
  const theme = useTheme();
  const user      = useAuthStore(s => s.user);
  const visitors  = useSecurityStore(s => s.visitors);
  const [filter, setFilter] = useState('all');

  const myId = user?.id || 'res1';
  const myVisitors = visitors
    .filter(v => v.hostResidentId === myId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const filtered = filter === 'all' ? myVisitors : myVisitors.filter(v => v.status === filter);

  const FILTERS = [
    { k: 'all',        label: 'All' },
    { k: 'APPROVED',   label: '✅ Approved' },
    { k: 'CHECKED_IN', label: '🚶 Inside' },
    { k: 'CHECKED_OUT',label: '🚪 Exited' },
    { k: 'DENIED',     label: '🚫 Denied' },
  ];

  return (
    <SafeAreaView style={globalStyles.screen}>
      <StatusBar barStyle="light-content" backgroundColor='#1A7A7A' />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={styles.headerTitle}>My Visitors</Text>
            <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>{myVisitors.length} total visitors</Text>
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('AddVisitor')}>
            <Text style={styles.addBtnText}>+ Add</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f.k}
            style={[styles.chip, filter === f.k && styles.chipActive]}
            onPress={() => setFilter(f.k)}
          >
            <Text style={[styles.chipText, filter === f.k && styles.chipTextActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false}>
        {filtered.length === 0 ? (
          <View style={globalStyles.emptyState}>
            <Text style={{ fontSize: 48 }}>👥</Text>
            <Text style={globalStyles.emptyText}>No visitors found</Text>
            <TouchableOpacity style={[globalStyles.btn, globalStyles.btnPrimary, { marginTop: 16 }]} onPress={() => navigation.navigate('AddVisitor')}>
              <Text style={globalStyles.btnText}>Invite Visitor</Text>
            </TouchableOpacity>
          </View>
        ) : filtered.map(v => {
          const meta = STATUS_META[v.status] || STATUS_META.CREATED;
          return (
            <TouchableOpacity
              key={v.id}
              style={[globalStyles.card, { borderLeftWidth: 4, borderLeftColor: meta.color, padding: 12, marginBottom: 8 }]}
              onPress={() => navigation.navigate('VisitorQRCode', { visitorId: v.id })}
              activeOpacity={0.85}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flexDirection: 'row', flex: 1 }}>
                  <View style={styles.avatar}>
                    <Text style={{ fontSize: v.photo ? 28 : 22 }}>{v.photo || '👤'}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={globalStyles.cardTitle}>{v.name}</Text>
                    <Text style={globalStyles.cardSub}>{v.purpose}</Text>
                    {v.phone ? <Text style={globalStyles.cardSub}>📱 {v.phone}</Text> : null}
                    {(v.guardVehicleNote || v.vehicleNumber) ? <Text style={globalStyles.cardSub}>🚗 {v.guardVehicleNote || v.vehicleNumber}</Text> : null}
                  </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: meta.bg }]}>
                  <Text style={[styles.statusText, { color: meta.color }]}>{v.status}</Text>
                </View>
              </View>
              <View style={[styles.statusBanner, { backgroundColor: meta.bg, borderColor: meta.color }]}>
                <Text style={[styles.statusBannerText, { color: meta.color }]}>{meta.label}</Text>
              </View>
              {v.checkedInAt && (
                <Text style={[globalStyles.cardSub, { marginTop: 2, color: theme.primary }]}>
                  📍 {v.entryGate} • {v.verifiedByName || v.verifiedBy} • {fmt(v.checkedInAt)}
                </Text>
              )}
              <Text style={[globalStyles.cardSub, { marginTop: 2 }]}>OTP: <Text style={{ fontWeight: '800', letterSpacing: 2, fontFamily: 'monospace' }}>{v.otp}</Text></Text>
            </TouchableOpacity>
          );
        })}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // ── Header ──────────────────────────────────────────────────────────────────
  header: {
    padding: 20,
    paddingTop: 40,
    backgroundColor: '#1A7A7A',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  backBtn: {
    marginBottom: 8,
  },
  backText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  addBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
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
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    maxHeight: 48,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: '#E8F5F5',
    borderWidth: 1,
    borderColor: '#D0EEEE',
    marginRight: 6,
    height: 30,
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: '#1A7A7A',
    borderColor: '#1A7A7A',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3D6E6E',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },

  // ── Visitor card elements ─────────────────────────────────────────────────────
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#E8F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#D0EEEE',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  statusBanner: {
    marginTop: 8,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  statusBannerText: {
    fontSize: 12,
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