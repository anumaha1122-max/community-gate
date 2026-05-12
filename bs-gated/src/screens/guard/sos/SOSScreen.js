/**
 * SOSScreen.js — REBUILT FROM SCRATCH
 *
 * ❌ REPLACES: EmergencyAlertScreen.js (local useState only, no global state)
 *
 * ✅ NEW:
 *   - Reads live sosAlerts from securityStore (real-time global state)
 *   - Full lifecycle: TRIGGERED → ACKNOWLEDGED → IN_PROGRESS → RESOLVED
 *   - Guard can: acknowledge / respond (in-progress) / resolve with note
 *   - Shows pulsing alert for TRIGGERED status
 *   - Tabs: Active | Resolved
 *   - Accessible as its own Guard tab (SOS tab)
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar,
  ScrollView, Alert, Animated, TextInput, Modal,
} from 'react-native';
import { useAuthStore }     from '../../../store/AuthStore';
import { useSecurityStore } from '../../../store/securityStore';
import { useTheme } from '../../../hooks/useTheme';

// ─── Status Config ────────────────────────────────────────────────────────────
const STATUS_META = {
  TRIGGERED:    { label: 'TRIGGERED',    color: '#C62828', bg: '#FEF2F2', emoji: '🚨' },
  ACKNOWLEDGED: { label: 'ACKNOWLEDGED', color: '#E65100', bg: '#FEF3C7', emoji: '👀' },
  IN_PROGRESS:  { label: 'IN PROGRESS',  color: '#1A7A7A', bg: '#F5F3FF', emoji: '🏃' },
  RESOLVED:     { label: 'RESOLVED',     color: '#1A7A7A', bg: '#F0FDFA', emoji: '✅' },
};

// ─── Pulsing alert card for TRIGGERED SOS ─────────────────────────────────────
function PulseCard({ children, triggered }) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (!triggered) return;
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.02, duration: 600, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,    duration: 600, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [triggered]);

  return (
    <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
      {children}
    </Animated.View>
  );
}

// ─── Resolve Modal ────────────────────────────────────────────────────────────
function ResolveModal({ sos, onResolve, onClose }) {
  const [note, setNote] = useState('');
  return (
    <Modal visible transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.modalTitle}>Resolve SOS</Text>
          <Text style={styles.modalSub}>
            {sos.residentName} · Unit {sos.unit} · {sos.type}
          </Text>
          <TextInput
            style={styles.modalInput}
            placeholder="Resolution note (e.g. 'Ambulance called, situation under control')"
            placeholderTextColor="#94A3B8"
            value={note}
            onChangeText={setNote}
            multiline
            numberOfLines={3}
          />
          <View style={styles.modalBtns}>
            <TouchableOpacity style={styles.modalCancelBtn} onPress={onClose}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalResolveBtn, !note.trim() && { opacity: 0.5 }]}
              onPress={() => note.trim() && onResolve(note)}
            >
              <Text style={styles.modalResolveBtnText}>✅ Mark Resolved</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── SOS Card ─────────────────────────────────────────────────────────────────
function SOSCard({ sos, guardId, guardName, onAcknowledge, onRespond, onResolve }) {
  const meta = STATUS_META[sos.status] || STATUS_META.TRIGGERED;
  const isTriggered = sos.status === 'TRIGGERED';

  return (
    <PulseCard triggered={isTriggered}>
      <View style={[styles.sosCard, { borderLeftColor: meta.color, borderLeftWidth: 4 }]}>
        {/* Header */}
        <View style={styles.sosCardHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: 8 }}>
          <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 16, fontWeight: '600' }}>‹ Back</Text>
        </TouchableOpacity>
          <Text style={styles.sosEmoji}>{meta.emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.sosName}>{sos.residentName}</Text>
            <Text style={styles.sosSub}>Unit {sos.unit} · {sos.type}</Text>
          </View>
          <View style={[styles.sosBadge, { backgroundColor: meta.bg }]}>
            <Text style={[styles.sosBadgeText, { color: meta.color }]}>{meta.label}</Text>
          </View>
        </View>

        {/* Details */}
        <View style={styles.sosDetails}>
          {sos.description ? (
            <Text style={styles.sosDescription}>"{sos.description}"</Text>
          ) : null}
          <Text style={styles.sosTime}>
            🕒 Triggered: {new Date(sos.triggeredAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
          </Text>
          {sos.acknowledgedByName && (
            <Text style={styles.sosTime}>👀 Acknowledged by: {sos.acknowledgedByName}</Text>
          )}
          {sos.resolvedByName && (
            <Text style={styles.sosTime}>✅ Resolved by: {sos.resolvedByName}</Text>
          )}
          {sos.resolution && (
            <Text style={[styles.sosTime, { color: '#1A7A7A' }]}>📋 Resolution: {sos.resolution}</Text>
          )}
        </View>

        {/* Timeline */}
        <View style={styles.timeline}>
          {sos.timeline.map((t, i) => (
            <View key={i} style={styles.timelineRow}>
              <View style={[styles.timelineDot, { backgroundColor: i === 0 ? meta.color : '#CBD5E1' }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.timelineAction}>{t.action}</Text>
                <Text style={styles.timelineAt}>{new Date(t.at).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Actions */}
        {sos.status === 'TRIGGERED' && (
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#E65100' }]} onPress={() => onAcknowledge(sos.id)}>
            <Text style={styles.actionBtnText}>👀 Acknowledge SOS</Text>
          </TouchableOpacity>
        )}
        {sos.status === 'ACKNOWLEDGED' && (
          <View style={styles.actionRow}>
            <TouchableOpacity style={[styles.actionBtnHalf, { backgroundColor: '#1A7A7A' }]} onPress={() => onRespond(sos.id)}>
              <Text style={styles.actionBtnText}>🏃 Responding</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtnHalf, { backgroundColor: '#1A7A7A' }]} onPress={() => onResolve(sos)}>
              <Text style={styles.actionBtnText}>✅ Resolve</Text>
            </TouchableOpacity>
          </View>
        )}
        {sos.status === 'IN_PROGRESS' && (
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#1A7A7A' }]} onPress={() => onResolve(sos)}>
            <Text style={styles.actionBtnText}>✅ Mark Resolved</Text>
          </TouchableOpacity>
        )}
      </View>
    </PulseCard>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function SOSScreen({ navigation }) {
  const theme = useTheme();
  const user    = useAuthStore(s => s.user);
  const guardId   = user?.id   || 'sec1';
  const guardName = user?.name || 'Guard';

  const sosAlerts     = useSecurityStore(s => s.sosAlerts);
  const acknowledgeSOS = useSecurityStore(s => s.acknowledgeSOS);
  const respondSOS     = useSecurityStore(s => s.respondSOS);
  const resolveSOS     = useSecurityStore(s => s.resolveSOS);

  const [tab, setTab]             = useState('active');
  const [resolveTarget, setResolveTarget] = useState(null);

  const activeSOS   = sosAlerts.filter(a => a.status !== 'RESOLVED');
  const resolvedSOS = sosAlerts.filter(a => a.status === 'RESOLVED');

  const handleAcknowledge = (id) => {
    acknowledgeSOS(id, guardId, guardName);
    Alert.alert('Acknowledged', 'You have acknowledged this SOS. Please respond immediately.');
  };

  const handleRespond = (id) => {
    respondSOS(id, guardId, guardName);
    Alert.alert('Status Updated', 'Marked as In Progress. Please resolve once situation is handled.');
  };

  const handleResolve = (sos) => {
    setResolveTarget(sos);
  };

  const confirmResolve = (note) => {
    resolveSOS(resolveTarget.id, guardId, guardName, note);
    setResolveTarget(null);
    Alert.alert('✅ Resolved', 'SOS has been marked as resolved.');
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" backgroundColor="#0D6E6E" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>🚨 SOS Alerts</Text>
          <Text style={styles.headerSub}>{activeSOS.length} active alert{activeSOS.length !== 1 ? 's' : ''}</Text>
        </View>
        <View style={[styles.headerBadge, { backgroundColor: activeSOS.length > 0 ? '#DC2626' : '#0F766E' }]}>
          <Text style={styles.headerBadgeText}>{activeSOS.length} Active</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        {['active', 'resolved'].map(t => (
          <TouchableOpacity key={t} style={[styles.tabItem, tab === t && styles.tabItemActive]} onPress={() => setTab(t)}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === 'active' ? `🚨 Active (${activeSOS.length})` : `✅ Resolved (${resolvedSOS.length})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>

        {tab === 'active' && (
          <>
            {activeSOS.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={{ fontSize: 64 }}>✅</Text>
                <Text style={styles.emptyTitle}>All Clear</Text>
                <Text style={styles.emptySub}>No active SOS alerts at this time</Text>
              </View>
            ) : (
              <>
                <View style={styles.alertBanner}>
                  <Text style={styles.alertBannerText}>
                    ⚠️ {activeSOS.length} active SOS alert{activeSOS.length > 1 ? 's' : ''} require immediate attention
                  </Text>
                </View>
                {activeSOS.map(sos => (
                  <SOSCard
                    key={sos.id}
                    sos={sos}
                    guardId={guardId}
                    guardName={guardName}
                    onAcknowledge={handleAcknowledge}
                    onRespond={handleRespond}
                    onResolve={handleResolve}
                  />
                ))}
              </>
            )}
          </>
        )}

        {tab === 'resolved' && (
          <>
            {resolvedSOS.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={{ fontSize: 48 }}>📋</Text>
                <Text style={styles.emptyTitle}>No Resolved Alerts</Text>
              </View>
            ) : (
              resolvedSOS.map(sos => (
                <SOSCard
                  key={sos.id}
                  sos={sos}
                  guardId={guardId}
                  guardName={guardName}
                  onAcknowledge={() => {}}
                  onRespond={() => {}}
                  onResolve={() => {}}
                />
              ))
            )}
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {resolveTarget && (
        <ResolveModal
          sos={resolveTarget}
          onResolve={confirmResolve}
          onClose={() => setResolveTarget(null)}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen:      { flex: 1, backgroundColor: '#FFFFFF' },
  header:      { backgroundColor: '#0D6E6E', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20, flexDirection: 'row', alignItems: 'center', gap: 14 },
  backBtn:     { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  backText:    { color: '#FFF', fontSize: 28, fontWeight: '300' },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '900' },
  headerSub:   { color: 'rgba(255,255,255,0.65)', fontSize: 12, marginTop: 2 },
  headerBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  headerBadgeText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  tabBar:      { flexDirection: 'row', backgroundColor: '#C62828', borderTopWidth: 1, borderTopColor: '#991B1B' },
  tabItem:     { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabItemActive:{ borderBottomWidth: 3, borderBottomColor: '#FCA5A5' },
  tabText:     { color: '#FCA5A5', fontSize: 12, fontWeight: '600' },
  tabTextActive:{ color: '#FFFFFF', fontWeight: '800' },
  body:        { padding: 16 },
  alertBanner: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 12, marginBottom: 14, borderWidth: 1, borderColor: '#FECACA' },
  alertBannerText: { fontSize: 13, fontWeight: '700', color: '#991B1B', textAlign: 'center' },

  sosCard:     { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#D0EEEE' },
  sosCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  sosEmoji:    { fontSize: 28 },
  sosName:     { fontSize: 17, fontWeight: '800', color: '#1A2E2E' },
  sosSub:      { fontSize: 12, color: '#64748B', marginTop: 2 },
  sosBadge:    { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  sosBadgeText:{ fontSize: 10, fontWeight: '800' },
  sosDetails:  { backgroundColor: '#E8F5F5', borderRadius: 10, padding: 12, marginBottom: 12 },
  sosDescription: { fontSize: 13, color: '#3D6E6E', fontStyle: 'italic', marginBottom: 8 },
  sosTime:     { fontSize: 12, color: '#64748B', marginTop: 4 },

  timeline:    { borderLeftWidth: 2, borderLeftColor: '#D0EEEE', marginLeft: 8, paddingLeft: 16, marginBottom: 14 },
  timelineRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  timelineDot: { width: 10, height: 10, borderRadius: 5, marginTop: 4, marginLeft: -21 },
  timelineAction: { fontSize: 12, fontWeight: '700', color: '#1A2E2E' },
  timelineAt:  { fontSize: 10, color: '#7A9E9E', marginTop: 2 },

  actionBtn:   { borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
  actionBtnText:{ color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  actionRow:   { flexDirection: 'row', gap: 10 },
  actionBtnHalf: { flex: 1, borderRadius: 12, paddingVertical: 13, alignItems: 'center' },

  emptyState:  { alignItems: 'center', padding: 60, gap: 12 },
  emptyTitle:  { fontSize: 20, fontWeight: '800', color: '#1A2E2E' },
  emptySub:    { fontSize: 14, color: '#64748B', textAlign: 'center' },

  overlay:     { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modal:       { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalTitle:  { fontSize: 20, fontWeight: '800', color: '#1A2E2E', marginBottom: 4 },
  modalSub:    { fontSize: 13, color: '#64748B', marginBottom: 16 },
  modalInput:  { backgroundColor: '#E8F5F5', borderWidth: 1.5, borderColor: '#D0EEEE', borderRadius: 12, padding: 14, fontSize: 14, color: '#1A2E2E', minHeight: 90, textAlignVertical: 'top', marginBottom: 16 },
  modalBtns:   { flexDirection: 'row', gap: 10 },
  modalCancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center', backgroundColor: '#F0FAFA' },
  modalCancelText: { color: '#64748B', fontSize: 14, fontWeight: '700' },
  modalResolveBtn: { flex: 2, paddingVertical: 14, borderRadius: 12, alignItems: 'center', backgroundColor: '#1A7A7A' },
  modalResolveBtnBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  modalResolveBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
});
