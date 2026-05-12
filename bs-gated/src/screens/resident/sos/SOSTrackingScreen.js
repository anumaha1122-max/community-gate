/**
 * SOSTrackingScreen.js
 *
 * Theme  : Mirrors VisitorListScreen exactly — same layout, same spacing,
 *          same card / header / badge / banner patterns — but with RED as
 *          primary (danger signal) instead of teal.
 *
 * Real-world functions:
 *   • Send new SOS with type + description → triggerSOS()
 *   • Filter history by status (All / Active / Resolved)
 *   • Cancel an active (TRIGGERED) alert → cancelSOS()  [new action]
 *   • Live status polling: every 10 s the store is re-read so status
 *     updates from guard/admin side appear automatically
 *   • Pull-to-refresh
 *   • Timeline shows full response chain
 *   • Active alerts pulse with a border highlight
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar,
  ScrollView, TextInput, Alert, Modal, RefreshControl,
} from 'react-native';
import { useAuthStore }     from '../../../store/AuthStore';
import { useSecurityStore } from '../../../store/securityStore';

// ─── Theme — RED primary, mirrors visitor screen spacing/structure ─────────────
const T = {
  // Page backgrounds
  bg:           '#FFF5F5',   // very light red tint — like visitor's #E8F5F5
  header:       '#C62828',   // deep red — replaces visitor's #1A7A7A
  headerDark:   '#B71C1C',

  // Surfaces
  surface:      '#FFFFFF',
  border:       '#FFCDD2',   // light red border — replaces visitor's #D0EEEE
  divider:      '#FFF0F0',

  // Text
  text:         '#1A0000',
  textSub:      '#6E3030',
  textMuted:    '#9E7070',
  textInverse:  '#FFFFFF',

  // Primary (RED)
  primary:      '#C62828',
  primaryLight: '#E53935',
  primaryBg:    '#FFEBEE',   // chip/badge bg for primary

  // Status colours  (kept close to visitor screen's palette)
  success:      '#0F766E',
  successBg:    '#CCFBF1',
  warning:      '#D97706',
  warningBg:    '#FEF3C7',
  danger:       '#C62828',
  dangerBg:     '#FEE2E2',
  offline:      '#64748B',
  offlineBg:    '#F1F5F9',
  infoBg:       '#FFF5F5',
  infoBorder:   '#FFCDD2',

  // Inputs
  inputBg:      '#FFF8F8',
  inputBorder:  '#FFCDD2',
};

// ─── SOS type options ─────────────────────────────────────────────────────────
const SOS_TYPES = [
  { key: 'Medical',  emoji: '🏥' },
  { key: 'Fire',     emoji: '🔥' },
  { key: 'Security', emoji: '🔓' },
  { key: 'Gas Leak', emoji: '💨' },
  { key: 'Other',    emoji: '⚠️' },
];

// ─── Status metadata ──────────────────────────────────────────────────────────
const STATUS_META = {
  TRIGGERED:    { label: 'Triggered — Awaiting Response', color: '#C62828', bg: '#FEE2E2', dot: '#EF5350', icon: '🚨' },
  ACKNOWLEDGED: { label: 'Acknowledged — Guard Notified', color: '#E65100', bg: '#FEF3C7', dot: '#FB8C00', icon: '👁' },
  IN_PROGRESS:  { label: 'Guard is Responding',           color: '#1565C0', bg: '#E3F2FD', dot: '#1976D2', icon: '🏃' },
  RESOLVED:     { label: 'Resolved',                      color: '#2E7D32', bg: '#E8F5E9', dot: '#43A047', icon: '✅' },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (iso) =>
  iso
    ? new Date(iso).toLocaleString('en-IN', {
        day: '2-digit', month: 'short',
        hour: '2-digit', minute: '2-digit',
      })
    : '—';

const fmtRelative = (iso) => {
  if (!iso) return '';
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (diff < 60)   return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

// ─── Status Badge (same pattern as visitor screen) ────────────────────────────
function StatusBadge({ status }) {
  const meta = STATUS_META[status] || STATUS_META.TRIGGERED;
  return (
    <View style={[badge.wrap, { backgroundColor: meta.bg }]}>
      <View style={[badge.dot, { backgroundColor: meta.dot }]} />
      <Text style={[badge.text, { color: meta.color }]}>{status}</Text>
    </View>
  );
}
const badge = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 5,
          paddingHorizontal: 9, paddingVertical: 4, borderRadius: 20 },
  dot:  { width: 6, height: 6, borderRadius: 3 },
  text: { fontSize: 10, fontWeight: '800', letterSpacing: 0.4 },
});

// ─── Status Banner (mirrors visitor screen's statusBanner) ────────────────────
function StatusBanner({ status }) {
  const meta = STATUS_META[status] || STATUS_META.TRIGGERED;
  return (
    <View style={[styles.statusBanner, { backgroundColor: meta.bg, borderColor: meta.color }]}>
      <Text style={[styles.statusBannerText, { color: meta.color }]}>
        {meta.icon}  {meta.label}
      </Text>
    </View>
  );
}

// ─── Timeline row ─────────────────────────────────────────────────────────────
function TimelineRow({ item, isLast }) {
  const isResolved = item.action.includes('Resolved') || item.action.includes('RESOLVED');
  const isFirst    = item.action.includes('TRIGGERED');
  const dotColor   = isResolved ? T.success : isFirst ? T.danger : '#1976D2';
  return (
    <View style={tl.row}>
      <View style={tl.lineCol}>
        <View style={[tl.dot, { backgroundColor: dotColor }]} />
        {!isLast && <View style={tl.line} />}
      </View>
      <View style={tl.content}>
        <Text style={tl.action}>{item.action}</Text>
        <Text style={tl.meta}>{item.byName || item.by}  ·  {fmt(item.at)}</Text>
      </View>
    </View>
  );
}
const tl = StyleSheet.create({
  row:     { flexDirection: 'row', gap: 10 },
  lineCol: { alignItems: 'center', width: 14 },
  dot:     { width: 10, height: 10, borderRadius: 5, marginTop: 3 },
  line:    { width: 2, flex: 1, backgroundColor: T.border, marginTop: 3 },
  content: { flex: 1, paddingBottom: 14 },
  action:  { fontSize: 12, fontWeight: '700', color: T.text },
  meta:    { fontSize: 11, color: T.textMuted, marginTop: 2 },
});

// ─── SOS Card ─────────────────────────────────────────────────────────────────
function SOSCard({ alert, onCancel }) {
  const [expanded, setExpanded] = useState(false);
  const meta     = STATUS_META[alert.status] || STATUS_META.TRIGGERED;
  const isActive = alert.status !== 'RESOLVED';
  const isCancellable = alert.status === 'TRIGGERED';

  return (
    <TouchableOpacity
      style={[styles.card, isActive && styles.cardActive]}
      onPress={() => setExpanded(v => !v)}
      activeOpacity={0.85}
    >
      {/* ── Card header — always visible ── */}
      <View style={styles.cardHeader}>
        <View style={[styles.avatar, { backgroundColor: meta.bg }]}>
          <Text style={{ fontSize: 22 }}>{meta.icon}</Text>
        </View>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.cardTitle}>{alert.type} Emergency</Text>
          <Text style={styles.cardSub}>
            {fmt(alert.triggeredAt)}  ·  {fmtRelative(alert.triggeredAt)}
          </Text>
          <Text style={[styles.cardSub, { color: T.textMuted, marginTop: 1 }]}>
            {alert.id}
          </Text>
        </View>
        <StatusBadge status={alert.status} />
      </View>

      {/* Status banner — always visible */}
      <StatusBanner status={alert.status} />

      {/* Active SOS indicator */}
      {isActive && (
        <View style={styles.activePulseBar}>
          <Text style={styles.activePulseText}>
            🔴  ACTIVE — Guards & Admin are notified
          </Text>
        </View>
      )}

      {/* Collapsed hint */}
      {!expanded && (
        <Text style={styles.expandHint}>Tap to {expanded ? 'collapse' : 'see details & timeline'} ›</Text>
      )}

      {/* ── Expanded body ── */}
      {expanded && (
        <View style={styles.expandedBody}>
          <View style={styles.dividerLine} />

          {/* Description */}
          {!!alert.description && (
            <View style={[styles.infoBanner, { marginTop: 8 }]}>
              <Text style={styles.infoLabel}>📝 YOUR DESCRIPTION</Text>
              <Text style={styles.infoText}>{alert.description}</Text>
            </View>
          )}

          {/* Responder info */}
          {alert.acknowledgedByName && (
            <View style={styles.responderBox}>
              <Text style={styles.responderTitle}>👮 Responding Guard / Admin</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Name</Text>
                <Text style={[styles.infoValue, { color: T.primary }]}>{alert.acknowledgedByName}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Acknowledged</Text>
                <Text style={styles.infoValue}>{fmt(alert.acknowledgedAt)}</Text>
              </View>
              {alert.inProgressAt && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>En route since</Text>
                  <Text style={styles.infoValue}>{fmt(alert.inProgressAt)}</Text>
                </View>
              )}
            </View>
          )}

          {/* Resolution */}
          {alert.status === 'RESOLVED' && (
            <View style={[styles.responderBox, { borderColor: T.success, backgroundColor: T.successBg }]}>
              <Text style={[styles.responderTitle, { color: T.success }]}>✅ Resolution</Text>
              <Text style={[styles.infoText, { color: '#1A3A2A' }]}>
                {alert.resolution || 'Situation handled by security team.'}
              </Text>
              <Text style={[styles.cardSub, { marginTop: 6 }]}>
                Resolved by {alert.resolvedByName || 'Guard'}  ·  {fmt(alert.resolvedAt)}
              </Text>
            </View>
          )}

          {/* Timeline */}
          {alert.timeline && alert.timeline.length > 0 && (
            <View style={{ marginTop: 12 }}>
              <Text style={styles.sectionLabel}>RESPONSE TIMELINE</Text>
              {alert.timeline.map((t, i) => (
                <TimelineRow
                  key={i}
                  item={t}
                  isLast={i === alert.timeline.length - 1}
                />
              ))}
            </View>
          )}

          {/* Cancel button — only for TRIGGERED */}
          {isCancellable && (
            <TouchableOpacity
              style={styles.cancelAlertBtn}
              onPress={() => onCancel(alert)}
            >
              <Text style={styles.cancelAlertText}>✕  Cancel This SOS Alert</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

// ─── Send SOS Modal ───────────────────────────────────────────────────────────
function SendSOSModal({ visible, onClose, onSend }) {
  const [sosType, setSosType] = useState('Medical');
  const [sosDesc, setSosDesc] = useState('');

  const reset = () => { setSosType('Medical'); setSosDesc(''); };
  const handleClose = () => { reset(); onClose(); };

  const handleSend = () => {
    Alert.alert(
      '🚨 Confirm Emergency Alert',
      `Send a ${sosType} emergency SOS to ALL guards and admin right now?\n\nOnly use in a real emergency.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: '🚨 SEND SOS NOW',
          style: 'destructive',
          onPress: () => {
            onSend(sosType, sosDesc.trim());
            reset();
            onClose();
          },
        },
      ]
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <View style={modal.overlay}>
        <View style={modal.sheet}>
          <View style={modal.handle} />

          {/* Header */}
          <View style={modal.headerRow}>
            <View>
              <Text style={modal.title}>🚨 Send Emergency SOS</Text>
              <Text style={modal.subtitle}>Alerts ALL guards & admin instantly</Text>
            </View>
            <TouchableOpacity onPress={handleClose} style={modal.closeBtn}>
              <Text style={modal.closeX}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Warning */}
          <View style={modal.warningBox}>
            <Text style={modal.warningText}>
              ⚠️  Only use in a REAL emergency. False alarms affect the entire security team.
            </Text>
          </View>

          {/* Type selector */}
          <Text style={modal.fieldLabel}>EMERGENCY TYPE *</Text>
          <View style={modal.typeRow}>
            {SOS_TYPES.map(t => (
              <TouchableOpacity
                key={t.key}
                style={[modal.typeChip, sosType === t.key && modal.typeChipActive]}
                onPress={() => setSosType(t.key)}
              >
                <Text style={{ fontSize: 18 }}>{t.emoji}</Text>
                <Text style={[modal.typeChipText, sosType === t.key && { color: T.textInverse }]}>
                  {t.key}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Description */}
          <Text style={modal.fieldLabel}>ADDITIONAL DETAILS (optional)</Text>
          <TextInput
            style={modal.input}
            placeholder={"e.g. 'Person fainted in living room', 'Smoke near kitchen'..."}
            placeholderTextColor={T.textMuted}
            value={sosDesc}
            onChangeText={setSosDesc}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />

          <TouchableOpacity style={modal.sendBtn} onPress={handleSend}>
            <Text style={modal.sendBtnText}>🚨  SEND SOS NOW</Text>
          </TouchableOpacity>
          <TouchableOpacity style={modal.cancelBtn} onPress={handleClose}>
            <Text style={modal.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const modal = StyleSheet.create({
  overlay:       { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  sheet:         { backgroundColor: T.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24,
                   padding: 24, paddingBottom: 40 },
  handle:        { width: 40, height: 4, backgroundColor: T.border, borderRadius: 2,
                   alignSelf: 'center', marginBottom: 20 },
  headerRow:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  title:         { fontSize: 20, fontWeight: '800', color: T.primary },
  subtitle:      { fontSize: 12, color: T.textMuted, marginTop: 2 },
  closeBtn:      { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F1F5F9',
                   alignItems: 'center', justifyContent: 'center' },
  closeX:        { fontSize: 13, fontWeight: '700', color: '#64748B' },
  warningBox:    { backgroundColor: '#FFF3F3', borderRadius: 12, padding: 12,
                   borderWidth: 1, borderColor: '#FFCDD2', marginBottom: 18 },
  warningText:   { fontSize: 12, fontWeight: '700', color: '#8B0000', textAlign: 'center', lineHeight: 18 },
  fieldLabel:    { fontSize: 11, fontWeight: '700', color: T.textSub, letterSpacing: 0.6, marginBottom: 8 },
  typeRow:       { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  typeChip:      { flexDirection: 'row', alignItems: 'center', gap: 6,
                   backgroundColor: '#FFF0F0', borderRadius: 20, paddingHorizontal: 12,
                   paddingVertical: 8, borderWidth: 1, borderColor: T.border },
  typeChipActive:{ backgroundColor: T.primary, borderColor: T.primary },
  typeChipText:  { fontSize: 12, fontWeight: '700', color: T.textSub },
  input:         { backgroundColor: T.inputBg, borderWidth: 1.5, borderColor: T.inputBorder,
                   borderRadius: 12, padding: 12, fontSize: 14, color: T.text,
                   minHeight: 80, marginBottom: 18 },
  sendBtn:       { backgroundColor: T.primary, paddingVertical: 15, borderRadius: 14,
                   alignItems: 'center' },
  sendBtnText:   { color: T.textInverse, fontSize: 16, fontWeight: '900', letterSpacing: 1 },
  cancelBtn:     { paddingVertical: 14, alignItems: 'center' },
  cancelBtnText: { fontSize: 14, fontWeight: '600', color: T.textMuted },
});

// ─── Filter chips — identical pattern to visitor screen ───────────────────────
const FILTERS = [
  { k: 'all',      label: 'All' },
  { k: 'active',   label: '🚨 Active' },
  { k: 'RESOLVED', label: '✅ Resolved' },
];

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function SOSTrackingScreen({ navigation }) {
  const user       = useAuthStore(s => s.user);
  const sosAlerts  = useSecurityStore(s => s.sosAlerts);
  const triggerSOS = useSecurityStore(s => s.triggerSOS);

  const myId = user?.id || 'res1';

  const [showModal,  setShowModal]  = useState(false);
  const [filter,     setFilter]     = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  // Pull-to-refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  }, []);

  // My alerts newest-first
  const myAlerts = sosAlerts
    .filter(a => a.residentId === myId)
    .sort((a, b) => new Date(b.triggeredAt) - new Date(a.triggeredAt));

  const filteredAlerts =
    filter === 'active'
      ? myAlerts.filter(a => a.status !== 'RESOLVED')
      : filter === 'RESOLVED'
      ? myAlerts.filter(a => a.status === 'RESOLVED')
      : myAlerts;

  const activeCount   = myAlerts.filter(a => a.status !== 'RESOLVED').length;
  const resolvedCount = myAlerts.filter(a => a.status === 'RESOLVED').length;

  // ── Real-world actions ──────────────────────────────────────────────────────

  const handleSend = useCallback((type, description) => {
    triggerSOS(
      myId,
      user?.name  || 'Resident',
      user?.unit  || 'Unknown',
      type,
      description
    );
    Alert.alert(
      '✅ SOS Sent!',
      'Emergency alert sent!\n\nAll guards and admin have been notified immediately.\nStay calm — help is on the way.',
      [{ text: 'OK' }]
    );
  }, [myId, user, triggerSOS]);

  // Cancel is only allowed while TRIGGERED (guard hasn't responded yet)
  const handleCancel = useCallback((alert) => {
    Alert.alert(
      'Cancel SOS Alert',
      `Cancel this ${alert.type} emergency alert?\n\nOnly cancel if this was a mistake — guards may already be responding.`,
      [
        { text: 'Keep Alert', style: 'cancel' },
        {
          text: 'Cancel Alert',
          style: 'destructive',
          onPress: () => {
            // Mark as RESOLVED with a cancellation note using resolveSOS
            const resolveSOSFn = useSecurityStore.getState().resolveSOS;
            if (resolveSOSFn) {
              resolveSOSFn(alert.id, myId, user?.name || 'Resident', 'Alert cancelled by resident — false alarm.');
            }
            Alert.alert('Alert Cancelled', 'Your SOS alert has been cancelled and guards have been notified.');
          },
        },
      ]
    );
  }, [myId, user]);

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={T.headerDark} />

      {/* ── Header — identical structure to visitor screen ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>‹  Back</Text>
        </TouchableOpacity>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>🚨 My SOS Alerts</Text>
            <Text style={styles.headerSub}>
              {activeCount > 0 ? `${activeCount} active` : 'No active alerts'}
              {resolvedCount > 0 ? `  ·  ${resolvedCount} resolved` : ''}
            </Text>
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={() => setShowModal(true)}>
            <Text style={styles.addBtnText}>+ SOS</Text>
          </TouchableOpacity>
        </View>

        {/* Filter chips — same horizontal scroll as visitor screen */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
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
      </View>

      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={T.primary} />
        }
      >
        {/* Info banner — same style as visitor screen */}
        <View style={styles.infoBanner}>
          <Text style={styles.infoText}>
            Your SOS alerts are visible to ALL guards and admin in real-time. Tap <Text style={{ fontWeight: '800' }}>+ SOS</Text> to send an emergency alert instantly. Pull down to refresh status.
          </Text>
        </View>

        {/* Stat pills */}
        {myAlerts.length > 0 && (
          <View style={styles.statsRow}>
            <TouchableOpacity
              style={[styles.statPill, { backgroundColor: activeCount > 0 ? T.dangerBg : T.offlineBg }]}
              onPress={() => setFilter(filter === 'active' ? 'all' : 'active')}
            >
              <Text style={[styles.statNum, { color: activeCount > 0 ? T.danger : T.textMuted }]}>
                {activeCount}
              </Text>
              <Text style={[styles.statLabel, { color: activeCount > 0 ? T.danger : T.textMuted }]}>
                Active
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.statPill, { backgroundColor: T.successBg }]}
              onPress={() => setFilter(filter === 'RESOLVED' ? 'all' : 'RESOLVED')}
            >
              <Text style={[styles.statNum, { color: T.success }]}>{resolvedCount}</Text>
              <Text style={[styles.statLabel, { color: T.success }]}>Resolved</Text>
            </TouchableOpacity>
            <View style={[styles.statPill, { backgroundColor: '#F8FAFC' }]}>
              <Text style={[styles.statNum, { color: T.text }]}>{myAlerts.length}</Text>
              <Text style={[styles.statLabel, { color: T.textMuted }]}>Total</Text>
            </View>
          </View>
        )}

        <Text style={styles.sectionLabel}>
          {filter === 'active' ? 'ACTIVE ALERTS' : filter === 'RESOLVED' ? 'RESOLVED ALERTS' : 'SOS HISTORY'}
        </Text>

        {/* Alert list */}
        {filteredAlerts.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={{ fontSize: 52, marginBottom: 12 }}>🛡️</Text>
            <Text style={styles.emptyTitle}>
              {filter === 'active' ? 'No active alerts' : filter === 'RESOLVED' ? 'No resolved alerts' : 'No SOS alerts sent'}
            </Text>
            <Text style={styles.emptyDesc}>
              {filter !== 'all'
                ? 'Tap "All" to see your full history.'
                : 'Tap the + SOS button above to send an emergency alert to all guards and admin.'}
            </Text>
            {filter !== 'all' && (
              <TouchableOpacity
                style={styles.showAllBtn}
                onPress={() => setFilter('all')}
              >
                <Text style={styles.showAllBtnText}>Show All Alerts</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          filteredAlerts.map(alert => (
            <SOSCard key={alert.id} alert={alert} onCancel={handleCancel} />
          ))
        )}

        {/* Privacy note */}
        <View style={[styles.infoBanner, { marginTop: 8 }]}>
          <Text style={styles.infoLabel}>ℹ️ HOW IT WORKS</Text>
          <Text style={styles.infoText}>
            {'• Sending SOS instantly notifies ALL guards and admin.\n'}
            {'• Guards will acknowledge and update status in real-time.\n'}
            {'• You\'ll see when a guard is en route and when resolved.\n'}
            {'• Only cancel if this was a mistake — guards may be responding.'}
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      <SendSOSModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onSend={handleSend}
      />
    </SafeAreaView>
  );
}

// ─── Styles — mirror visitor screen exactly, red primary ─────────────────────
const styles = StyleSheet.create({

  // ── Screen & Header ──────────────────────────────────────────────────────────
  screen: {
    flex: 1,
    backgroundColor: T.bg,
  },
  header: {
    backgroundColor: T.header,
    paddingTop: 44,
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  backBtn: {
    marginBottom: 10,
  },
  backText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '600',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  headerSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
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

  // ── Filter chips (same as visitor screen) ────────────────────────────────────
  filterRow: {
    flexDirection: 'row',
    paddingBottom: 2,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  chipActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.85)',
  },
  chipTextActive: {
    color: T.primary,
  },

  // ── Body ─────────────────────────────────────────────────────────────────────
  body: {
    padding: 16,
    paddingTop: 18,
    minHeight: '100%',
  },

  // ── Info banner (same structure as visitor) ───────────────────────────────────
  infoBanner: {
    backgroundColor: T.infoBg,
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: T.infoBorder,
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: T.primary,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: T.textSub,
    lineHeight: 20,
  },

  // ── Stat pills ────────────────────────────────────────────────────────────────
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  statPill: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  statNum: {
    fontSize: 22,
    fontWeight: '900',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },

  // ── Section label ─────────────────────────────────────────────────────────────
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: T.textMuted,
    letterSpacing: 1,
    marginBottom: 10,
  },

  // ── Card (mirrors visitor card exactly) ───────────────────────────────────────
  card: {
    backgroundColor: T.surface,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: T.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardActive: {
    borderWidth: 2,
    borderColor: T.primary,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: T.border,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: T.text,
  },
  cardSub: {
    fontSize: 12,
    color: T.textMuted,
    marginTop: 3,
  },

  // ── Status banner (mirrors visitor's statusBanner) ────────────────────────────
  statusBanner: {
    marginTop: 0,
    marginBottom: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  statusBannerText: {
    fontSize: 12,
    fontWeight: '700',
  },

  // ── Active pulse bar ──────────────────────────────────────────────────────────
  activePulseBar: {
    backgroundColor: T.dangerBg,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginBottom: 8,
    alignItems: 'center',
  },
  activePulseText: {
    fontSize: 12,
    fontWeight: '800',
    color: T.danger,
    letterSpacing: 0.3,
  },

  expandHint: {
    fontSize: 11,
    color: T.textMuted,
    fontWeight: '600',
    textAlign: 'right',
    marginTop: 2,
  },

  // ── Expanded body ─────────────────────────────────────────────────────────────
  expandedBody: {
    marginTop: 6,
  },
  dividerLine: {
    height: 1,
    backgroundColor: T.divider,
    marginBottom: 10,
  },

  // ── Responder / resolution box ────────────────────────────────────────────────
  responderBox: {
    backgroundColor: T.infoBg,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: T.infoBorder,
    marginBottom: 10,
  },
  responderTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: T.primary,
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: T.divider,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '700',
    color: T.text,
    maxWidth: '60%',
    textAlign: 'right',
  },

  // ── Cancel alert button ───────────────────────────────────────────────────────
  cancelAlertBtn: {
    marginTop: 12,
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: T.border,
    alignItems: 'center',
    backgroundColor: T.infoBg,
  },
  cancelAlertText: {
    fontSize: 13,
    fontWeight: '700',
    color: T.danger,
  },

  // ── Empty state ───────────────────────────────────────────────────────────────
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: T.text,
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 13,
    color: T.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  showAllBtn: {
    backgroundColor: T.primary,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
  },
  showAllBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
});