/**
 * WalkInEntryScreen.js — NEW
 *
 * Guard adds walk-in visitor to live queue,
 * simulates calling the resident for approval,
 * approves or denies based on resident response.
 * Blacklist check on every entry attempt.
 */

import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar,
  TextInput, ScrollView, Alert, Modal,
} from 'react-native';
import { useAuthStore }     from '../../../store/AuthStore';
import { useSecurityStore } from '../../../store/securityStore';
import { useTheme } from '../../../hooks/useTheme';

const PURPOSES = ['Guest', 'Delivery', 'Service', 'Maintenance', 'Official Work', 'Cab / Taxi', 'Other'];

const STATUS_META = {
  WAITING:            { label: 'Waiting',           color: '#E65100', bg: '#FEF3C7' },
  RESIDENT_CALLED:    { label: 'Notified Resident', color: '#1A7A7A', bg: '#DBEAFE' },
  RESIDENT_NOTIFIED:  { label: 'Awaiting Response', color: '#1A7A7A', bg: '#EDE9FE' },
  APPROVED:           { label: 'Approved — Let In', color: '#1A7A7A', bg: '#CCFBF1' },
  DENIED:             { label: 'Denied — Turn Away', color: '#C62828', bg: '#FEE2E2' },
};

function QueueCard({ item, onCall, onApprove, onDeny, onRemove }) {
  const meta = STATUS_META[item.status] || STATUS_META.WAITING;
  return (
    <View style={styles.qCard}>
      <View style={styles.qCardHeader}>
        <View style={styles.qAvatar}><Text style={{ fontSize: 22 }}>👤</Text></View>
        <View style={{ flex: 1 }}>
          <Text style={styles.qName}>{item.name}</Text>
          <Text style={styles.qSub}>{item.purpose} · For unit {item.hostUnit}</Text>
          <Text style={styles.qSub}>📱 {item.phone}</Text>
        </View>
        <View style={[styles.qBadge, { backgroundColor: meta.bg }]}>
          <Text style={[styles.qBadgeText, { color: meta.color }]}>{meta.label}</Text>
        </View>
      </View>
      <Text style={styles.qTime}>
        Arrived: {new Date(item.arrivalTime).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit' })}
        {item.callAttempts > 0 ? `  ·  Called ${item.callAttempts}x` : ''}
      </Text>

      {item.status === 'WAITING' && (
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#1A7A7A' }]} onPress={() => onCall(item.id)}>
          <Text style={styles.actionBtnText}>📞 Call Resident</Text>
        </TouchableOpacity>
      )}
      {(item.status === 'RESIDENT_CALLED' || item.status === 'RESIDENT_NOTIFIED') && (
        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 10, padding: 12, alignItems: 'center' }}>
          <Text style={{ color: '#1A7A7A', fontWeight: '800', fontSize: 13 }}>⏳ Waiting for resident to respond...</Text>
          <Text style={{ color: '#1A7A7A', fontSize: 11, marginTop: 4 }}>Resident has been notified on their app</Text>
        </View>
      )}
      {item.status === 'APPROVED' && (
        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 10, padding: 12, alignItems: 'center' }}>
          <Text style={{ color: '#1A7A7A', fontWeight: '800', fontSize: 14 }}>✅ Resident Approved — Allow Entry</Text>
        </View>
      )}
      {item.status === 'DENIED' && (
        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 10, padding: 12, alignItems: 'center' }}>
          <Text style={{ color: '#C62828', fontWeight: '800', fontSize: 14 }}>🚫 Resident Denied — Turn Away</Text>
        </View>
      )}
      {(item.status === 'APPROVED' || item.status === 'DENIED') && (
        <TouchableOpacity style={styles.removeBtn} onPress={() => onRemove(item.id)}>
          <Text style={styles.removeBtnText}>Remove from queue</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function WalkInEntryScreen({ navigation }) {
  const theme = useTheme();
  const user = useAuthStore(s => s.user);
  const liveQueue       = useSecurityStore(s => s.liveQueue);
  const addToQueue      = useSecurityStore(s => s.addToQueue);
  const callResident    = useSecurityStore(s => s.callResident);
  const removeFromQueue = useSecurityStore(s => s.removeFromQueue);
  const checkBlacklist  = useSecurityStore(s => s.checkBlacklist);

  const guardId = user?.id || 'sec1';

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', purpose: 'Guest', hostUnit: '', hostResidentId: '', hostResidentName: '' });

  const handleAdd = () => {
    if (!form.name.trim())    { Alert.alert('Required', 'Enter visitor name'); return; }
    if (!form.phone.trim())   { Alert.alert('Required', 'Enter phone number'); return; }
    if (!form.hostUnit.trim()){ Alert.alert('Required', 'Enter host unit'); return; }

    const bl = checkBlacklist(form.name, form.phone);
    if (bl) {
      Alert.alert('🚫 BLACKLISTED', `${form.name} is on the society blacklist.\n\nReason: ${bl.reason}\n\nEntry NOT allowed.`);
      return;
    }

    addToQueue({ ...form, hostResidentName: form.hostResidentName || `Resident of ${form.hostUnit}` }, guardId);
    setForm({ name: '', phone: '', purpose: 'Guest', hostUnit: '', hostResidentId: '', hostResidentName: '' });
    setShowForm(false);
    Alert.alert('Added to Queue', `${form.name} added. Call the resident to get approval.`);
  };

  const handleCall = (id) => {
    // callResident updates queue status AND re-sends a reminder notification to the resident
    callResident(id);
    Alert.alert(
      '📲 Reminder Sent',
      'A reminder notification has been sent to the resident.\n\nYou will be notified on your Notifications tab once they respond.',
      [{ text: 'OK' }]
    );
  };

  const queue = [...liveQueue].sort((a, b) => new Date(b.arrivalTime) - new Date(a.arrivalTime));

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" backgroundColor="#0D6E6E" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Walk-In Entry</Text>
          <Text style={styles.headerSub}>Visitor queue management</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowForm(true)}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {queue.length === 0 ? (
          <View style={styles.empty}>
            <Text style={{ fontSize: 56 }}>🚶</Text>
            <Text style={styles.emptyTitle}>No visitors at gate</Text>
            <Text style={styles.emptySub}>Tap + Add when a walk-in visitor arrives</Text>
          </View>
        ) : (
          queue.map(item => (
            <QueueCard
              key={item.id}
              item={item}
              onCall={handleCall}
              onRemove={removeFromQueue}
            />
          ))
        )}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Add Walk-In Modal */}
      <Modal visible={showForm} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.formModal}>
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>Add Walk-In Visitor</Text>
              <TouchableOpacity onPress={() => setShowForm(false)}>
                <Text style={{ fontSize: 22, color: '#64748B' }}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.fieldLabel}>Visitor Name *</Text>
            <TextInput style={styles.input} placeholder="Full name" placeholderTextColor="#94A3B8" value={form.name} onChangeText={v => setForm(f => ({ ...f, name: v }))} />

            <Text style={styles.fieldLabel}>Phone Number *</Text>
            <TextInput style={styles.input} placeholder="Mobile number" placeholderTextColor="#94A3B8" value={form.phone} onChangeText={v => setForm(f => ({ ...f, phone: v }))} keyboardType="phone-pad" />

            <Text style={styles.fieldLabel}>Host Unit *</Text>
            <TextInput style={styles.input} placeholder="e.g. A-101" placeholderTextColor="#94A3B8" value={form.hostUnit} onChangeText={v => setForm(f => ({ ...f, hostUnit: v }))} autoCapitalize="characters" />

            <Text style={styles.fieldLabel}>Purpose</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              <View style={styles.purposeRow}>
                {PURPOSES.map(p => (
                  <TouchableOpacity
                    key={p}
                    style={[styles.purposeChip, form.purpose === p && styles.purposeChipActive]}
                    onPress={() => setForm(f => ({ ...f, purpose: p }))}
                  >
                    <Text style={[styles.purposeChipText, form.purpose === p && styles.purposeChipTextActive]}>{p}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <TouchableOpacity style={styles.submitBtn} onPress={handleAdd}>
              <Text style={styles.submitBtnText}>Add to Queue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen:      { flex: 1, backgroundColor: '#FFFFFF' },
  header:      { backgroundColor: '#0D6E6E', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20, gap: 14 },
  backBtn:     { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  backText:    { color: '#FFF', fontSize: 24, fontWeight: '300', lineHeight: 28, marginTop: -1 },
  headerTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '900' },
  headerSub:   { color: 'rgba(255,255,255,0.65)', fontSize: 12, marginTop: 2 },
  addBtn:      { backgroundColor: '#D4AF5A', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
  addBtnText:  { color: '#1A7A7A', fontSize: 13, fontWeight: '800' },
  body:        { padding: 16 },
  empty:       { alignItems: 'center', padding: 60, gap: 12 },
  emptyTitle:  { fontSize: 18, fontWeight: '800', color: '#1A2E2E' },
  emptySub:    { fontSize: 13, color: '#64748B', textAlign: 'center' },
  qCard:       { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: '#D0EEEE' },
  qCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  qAvatar:     { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  qName:       { fontSize: 15, fontWeight: '800', color: '#1A2E2E' },
  qSub:        { fontSize: 12, color: '#64748B', marginTop: 2 },
  qBadge:      { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  qBadgeText:  { fontSize: 11, fontWeight: '800' },
  qTime:       { fontSize: 11, color: '#7A9E9E', marginBottom: 10 },
  actionBtn:   { borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  actionBtnText:{ color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  decisionRow: { flexDirection: 'row', gap: 10 },
  halfBtn:     { flex: 1, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  removeBtn:   { paddingVertical: 10, alignItems: 'center' },
  removeBtnText: { color: '#7A9E9E', fontSize: 12, fontWeight: '600' },
  overlay:     { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  formModal:   { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '85%' },
  formHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  formTitle:   { fontSize: 18, fontWeight: '800', color: '#1A2E2E' },
  fieldLabel:  { fontSize: 12, fontWeight: '700', color: '#7A9E9E', marginBottom: 6, marginTop: 4 },
  input:       { backgroundColor: '#E8F5F5', borderWidth: 1.5, borderColor: '#D0EEEE', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: '#1A2E2E', marginBottom: 4 },
  purposeRow:  { flexDirection: 'row', gap: 8 },
  purposeChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#D0EEEE' },
  purposeChipActive: { backgroundColor: '#1A7A7A', borderColor: '#1A7A7A' },
  purposeChipText:   { fontSize: 12, fontWeight: '600', color: '#7A9E9E' },
  purposeChipTextActive: { color: '#FFFFFF' },
  submitBtn:   { backgroundColor: '#1A7A7A', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  submitBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
});