/**
 * AMCScreen.js — Module 6: Annual Maintenance Contracts
 *
 * Manages:
 *  - Equipment registration (elevators, generators, pumps, etc.)
 *  - AMC contract details
 *  - Scheduled visits (monthly/quarterly)
 *  - Renewal reminders
 *  - Service report logging
 *
 * Accessible from Admin dashboard.
 */

import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  ScrollView, StatusBar, Alert, TextInput, Modal,
} from 'react-native';
import { useAuthStore } from '../../../store/AuthStore';
import { useTheme } from '../../../hooks/useTheme';

// ─── Seed AMC data ────────────────────────────────────────────────────────────
const SEED_AMC = [
  {
    id: 'amc-001',
    equipment:    'Passenger Elevator — Block A',
    vendor:       'Otis Elevators Pvt Ltd',
    contractNo:   'OE/2025/0042',
    startDate:    '2025-01-01',
    endDate:      '2025-12-31',
    frequency:    'monthly',
    nextVisit:    '2026-05-05',
    lastVisit:    '2026-04-02',
    status:       'active',
    cost:         48000,
    contactPerson:'Ramesh Kumar',
    contactPhone: '9876500001',
    notes:        'Monthly lubrication & safety check. Annual overhaul in December.',
    visitLog:     [
      { date: '2026-04-02', tech: 'Ramesh Kumar', notes: 'Routine check — all OK', status: 'completed' },
      { date: '2026-03-03', tech: 'Ramesh Kumar', notes: 'Oil replaced, door sensor checked', status: 'completed' },
    ],
  },
  {
    id: 'amc-002',
    equipment:    'DG Set — 100 KVA',
    vendor:       'Sudhir Power Gen',
    contractNo:   'SP/2025/0180',
    startDate:    '2025-04-01',
    endDate:      '2026-03-31',
    frequency:    'quarterly',
    nextVisit:    '2026-06-15',
    lastVisit:    '2026-03-15',
    status:       'active',
    cost:         32000,
    contactPerson:'Suresh Nair',
    contactPhone: '9876500002',
    notes:        'Quarterly load test & preventive maintenance.',
    visitLog:     [
      { date: '2026-03-15', tech: 'Suresh Nair', notes: 'Load test OK, battery replaced', status: 'completed' },
    ],
  },
  {
    id: 'amc-003',
    equipment:    'Overhead Water Tank Cleaning',
    vendor:       'AquaClean Services',
    contractNo:   'AC/2025/0055',
    startDate:    '2025-01-01',
    endDate:      '2025-12-31',
    frequency:    'bi-annual',
    nextVisit:    '2025-12-20',
    lastVisit:    '2025-06-20',
    status:       'renewal_due',
    cost:         18000,
    contactPerson:'Anil Shah',
    contactPhone: '9876500003',
    notes:        'Tank cleaning and water quality test twice a year.',
    visitLog:     [],
  },
];

const FREQ_LABELS = {
  monthly:    '📅 Monthly',
  quarterly:  '📅 Quarterly',
  'bi-annual':'📅 Bi-Annual',
  annual:     '📅 Annual',
};

const STATUS_CONFIG = {
  active:       { label: 'Active',       color: '#2E7D32', bg: '#E8F5E9' },
  renewal_due:  { label: 'Renewal Due',  color: '#E8A020', bg: '#FFF3E0' },
  expired:      { label: 'Expired',      color: '#C62828', bg: '#FFEBEE' },
  inactive:     { label: 'Inactive',     color: '#757575', bg: '#F5F5F5' },
};

function daysUntil(dateStr) {
  const diff = new Date(dateStr).getTime() - Date.now();
  if (diff < 0) return 'Overdue';
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  return `In ${days} days`;
}

function AMCCard({ item, theme, onPress }) {
  const status = STATUS_CONFIG[item.status] || STATUS_CONFIG.active;
  const daysToVisit = daysUntil(item.nextVisit);
  const isUrgent = item.nextVisit && new Date(item.nextVisit).getTime() - Date.now() < 7 * 86400000;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: '#FFFFFF', borderColor: isUrgent ? '#E65100' : '#D0EEEE', borderWidth: isUrgent ? 2 : 1 }]}
      onPress={() => onPress(item)}
      activeOpacity={0.85}
    >
      <View style={styles.cardHeader}>
        <Text style={[styles.equipment, { color: '#1A2E2E' }]}>{item.equipment}</Text>
        <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
          <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
        </View>
      </View>
      <Text style={[styles.vendor, { color: '#1A7A7A' }]}>🏢 {item.vendor}</Text>
      <View style={styles.infoRow}>
        <Text style={[styles.infoItem, { color: '#7A9E9E' }]}>{FREQ_LABELS[item.frequency] || item.frequency}</Text>
        <Text style={[styles.infoItem, { color: '#7A9E9E' }]}>₹{item.cost.toLocaleString('en-IN')}/yr</Text>
      </View>
      <View style={[styles.visitRow, { backgroundColor: isUrgent ? '#FFF3E0' : '#FFFFFF' }]}>
        <Text style={[styles.visitLabel, { color: isUrgent ? '#E65100' : '#7A9E9E' }]}>Next Visit:</Text>
        <Text style={[styles.visitDate, { color: isUrgent ? '#E65100' : '#1A2E2E' }]}>
          {new Date(item.nextVisit).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} · {daysToVisit}
        </Text>
      </View>
      {item.visitLog.length > 0 && (
        <Text style={[styles.lastVisit, { color: '#7A9E9E' }]}>
          ✅ Last: {new Date(item.lastVisit).toLocaleDateString('en-IN')} — {item.visitLog[0].notes}
        </Text>
      )}
    </TouchableOpacity>
  );
}

function DetailModal({ item, visible, onClose, theme, onLogVisit }) {
  if (!item) return null;
  const [logNotes, setLogNotes] = useState('');
  const [logTech, setLogTech]   = useState('');
  const [showLog, setShowLog]   = useState(false);

  const status = STATUS_CONFIG[item.status] || STATUS_CONFIG.active;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: '#FFFFFF' }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: '#1A2E2E' }]} numberOfLines={2}>{item.equipment}</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={[styles.closeX, { color: '#7A9E9E' }]}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={[styles.detailSection, { backgroundColor: '#FFFFFF', borderColor: '#D0EEEE' }]}>
              <DetailRow label="Vendor"          value={item.vendor}       theme={theme} />
              <DetailRow label="Contract No."    value={item.contractNo}   theme={theme} />
              <DetailRow label="Contract Period" value={`${item.startDate} to ${item.endDate}`} theme={theme} />
              <DetailRow label="Frequency"       value={item.frequency}    theme={theme} />
              <DetailRow label="Annual Cost"     value={`₹${item.cost.toLocaleString('en-IN')}`} theme={theme} />
              <DetailRow label="Contact"         value={`${item.contactPerson} · ${item.contactPhone}`} theme={theme} />
              <DetailRow label="Next Visit"      value={`${item.nextVisit} (${daysUntil(item.nextVisit)})`} theme={theme} />
            </View>

            {item.notes && (
              <View style={[styles.notesBox, { backgroundColor: '#FFF8E1', borderColor: '#FFD54F' }]}>
                <Text style={[styles.notesText, { color: '#6D4C41' }]}>📝 {item.notes}</Text>
              </View>
            )}

            <Text style={[styles.sectionTitle, { color: '#1A2E2E' }]}>Visit Log</Text>
            {item.visitLog.length === 0 ? (
              <Text style={[styles.noLog, { color: '#7A9E9E' }]}>No visits logged yet.</Text>
            ) : (
              item.visitLog.map((v, i) => (
                <View key={i} style={[styles.logEntry, { backgroundColor: '#FFFFFF', borderColor: '#D0EEEE' }]}>
                  <Text style={[styles.logDate, { color: '#1A7A7A' }]}>{new Date(v.date).toLocaleDateString('en-IN')}</Text>
                  <Text style={[styles.logTech, { color: '#1A2E2E' }]}>👷 {v.tech}</Text>
                  <Text style={[styles.logNotes, { color: '#3D6E6E' }]}>{v.notes}</Text>
                </View>
              ))
            )}

            {/* Log new visit */}
            {!showLog ? (
              <TouchableOpacity style={[styles.logBtn, { borderColor: '#1A7A7A' }]} onPress={() => setShowLog(true)}>
                <Text style={[styles.logBtnText, { color: '#1A7A7A' }]}>+ Log Visit</Text>
              </TouchableOpacity>
            ) : (
              <View style={[styles.logForm, { backgroundColor: '#FFFFFF', borderColor: '#D0EEEE' }]}>
                <Text style={[styles.sectionTitle, { color: '#1A2E2E' }]}>Log New Visit</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: '#F0FAFA', borderColor: '#B0DEDE', color: '#1A2E2E' }]}
                  value={logTech} onChangeText={setLogTech} placeholder="Technician name"
                  placeholderTextColor={'#7A9E9E'}
                />
                <TextInput
                  style={[styles.input, styles.textArea, { backgroundColor: '#F0FAFA', borderColor: '#B0DEDE', color: '#1A2E2E' }]}
                  value={logNotes} onChangeText={setLogNotes} placeholder="Service notes..."
                  placeholderTextColor={'#7A9E9E'} multiline numberOfLines={3}
                />
                <TouchableOpacity
                  style={[styles.submitLog, { backgroundColor: '#1A7A7A' }]}
                  onPress={() => {
                    if (!logTech.trim() || !logNotes.trim()) { Alert.alert('Fill all fields'); return; }
                    onLogVisit(item.id, { date: new Date().toISOString().split('T')[0], tech: logTech, notes: logNotes, status: 'completed' });
                    setShowLog(false); setLogTech(''); setLogNotes('');
                    onClose();
                  }}
                >
                  <Text style={styles.submitLogText}>✅ Save Visit Log</Text>
                </TouchableOpacity>
              </View>
            )}
            <View style={{ height: 20 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function DetailRow({ label, value, theme }) {
  return (
    <View style={styles.detailRow}>
      <Text style={[styles.detailLabel, { color: '#7A9E9E' }]}>{label}</Text>
      <Text style={[styles.detailValue, { color: '#1A2E2E' }]}>{value}</Text>
    </View>
  );
}

export default function AMCScreen({ navigation }) {
  const theme = useTheme();
  const [amcList,    setAmcList]    = useState(SEED_AMC);
  const [selected,   setSelected]   = useState(null);
  const [showModal,  setShowModal]  = useState(false);
  const [filter,     setFilter]     = useState('all');

  const filtered = amcList.filter(a => {
    if (filter === 'renewal_due') return a.status === 'renewal_due';
    if (filter === 'upcoming')    return daysUntil(a.nextVisit).startsWith('In') && parseInt(daysUntil(a.nextVisit).replace('In ', '').replace(' days', '')) <= 14;
    return true;
  });

  const handleLogVisit = (id, logEntry) => {
    setAmcList(prev => prev.map(a =>
      a.id === id
        ? { ...a, lastVisit: logEntry.date, visitLog: [logEntry, ...a.visitLog] }
        : a
    ));
    Alert.alert('✅ Logged', 'Visit log has been saved.');
  };

  const urgentCount = amcList.filter(a => {
    const diff = new Date(a.nextVisit).getTime() - Date.now();
    return diff > 0 && diff < 7 * 86400000;
  }).length;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.mode === 'light' ? 'dark-content' : 'light-content'} backgroundColor={theme.header} />

      <View style={[styles.header, { backgroundColor: theme.primary }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AMC Management</Text>
        <Text style={styles.headerSub}>Annual Maintenance Contracts</Text>
      </View>

      {/* Stats Row */}
      <View style={[styles.statsRow, { backgroundColor: theme.surface, borderBottomColor: theme.divider }]}>
        {[
          { label: 'Total',       value: amcList.length,                                           color: theme.primary },
          { label: 'Active',      value: amcList.filter(a => a.status === 'active').length,        color: theme.success },
          { label: 'Renewal Due', value: amcList.filter(a => a.status === 'renewal_due').length,   color: theme.accent },
          { label: 'Upcoming',    value: urgentCount,                                              color: theme.accent },
        ].map((s, i) => (
          <View key={i} style={styles.statBox}>
            <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Filters */}
      <View style={[styles.filterRow, { backgroundColor: theme.surface, borderBottomColor: theme.divider }]}>
        {[
          { key: 'all',         label: 'All' },
          { key: 'renewal_due', label: '⚠️ Renewal Due' },
          { key: 'upcoming',    label: '📅 Due Soon' },
        ].map(f => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterChip, { backgroundColor: filter === f.key ? theme.primary : theme.inputBg, borderColor: filter === f.key ? theme.primary : theme.inputBorder }]}
            onPress={() => setFilter(f.key)}
          >
            <Text style={[styles.filterText, { color: filter === f.key ? '#FFF' : theme.textMuted }]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {filtered.map(item => (
          <AMCCard key={item.id} item={item} theme={theme} onPress={i => { setSelected(i); setShowModal(true); }} />
        ))}
        <View style={{ height: 40 }} />
      </ScrollView>

      <DetailModal
        item={selected}
        visible={showModal}
        onClose={() => { setShowModal(false); setSelected(null); }}
        theme={theme}
        onLogVisit={handleLogVisit}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:         { flex: 1 },
  header:       { padding: 20, paddingTop: 40 },
  backBtn:      { marginBottom: 6 },
  backText:     { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  headerTitle:  { fontSize: 24, fontWeight: '800', color: '#FFFFFF' },
  headerSub:    { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  statsRow:     { flexDirection: 'row', paddingVertical: 12, borderBottomWidth: 1 },
  statBox:      { flex: 1, alignItems: 'center' },
  statValue:    { fontSize: 20, fontWeight: '800' },
  statLabel:    { fontSize: 11, marginTop: 2 },
  filterRow:    { flexDirection: 'row', padding: 12, gap: 8, borderBottomWidth: 1 },
  filterChip:   { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  filterText:   { fontSize: 13, fontWeight: '600' },
  card:         { borderRadius: 16, padding: 16, marginBottom: 12 },
  cardHeader:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  equipment:    { fontSize: 15, fontWeight: '700', flex: 1, marginRight: 8 },
  statusBadge:  { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  statusText:   { fontSize: 11, fontWeight: '700' },
  vendor:       { fontSize: 13, fontWeight: '600', marginBottom: 8 },
  infoRow:      { flexDirection: 'row', gap: 16, marginBottom: 10 },
  infoItem:     { fontSize: 12 },
  visitRow:     { flexDirection: 'row', gap: 8, padding: 10, borderRadius: 10, marginBottom: 8 },
  visitLabel:   { fontSize: 12, fontWeight: '600' },
  visitDate:    { fontSize: 12, fontWeight: '700' },
  lastVisit:    { fontSize: 11 },
  // Modal
  overlay:      { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modal:        { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '90%' },
  modalHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  modalTitle:   { fontSize: 17, fontWeight: '800', flex: 1, marginRight: 12 },
  closeX:       { fontSize: 20, fontWeight: '600' },
  detailSection:{ borderRadius: 14, padding: 14, borderWidth: 1, marginBottom: 16 },
  detailRow:    { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 0 },
  detailLabel:  { fontSize: 12 },
  detailValue:  { fontSize: 13, fontWeight: '600', textAlign: 'right', flex: 1, marginLeft: 8 },
  notesBox:     { borderRadius: 12, padding: 12, borderWidth: 1, marginBottom: 16 },
  notesText:    { fontSize: 13, lineHeight: 20 },
  sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 10 },
  noLog:        { fontSize: 13, marginBottom: 16 },
  logEntry:     { borderRadius: 12, padding: 12, borderWidth: 1, marginBottom: 8 },
  logDate:      { fontSize: 12, fontWeight: '700', marginBottom: 2 },
  logTech:      { fontSize: 13, marginBottom: 2 },
  logNotes:     { fontSize: 12 },
  logBtn:       { paddingVertical: 12, borderRadius: 12, alignItems: 'center', borderWidth: 1.5, marginBottom: 16 },
  logBtnText:   { fontSize: 14, fontWeight: '700' },
  logForm:      { borderRadius: 14, padding: 14, borderWidth: 1, marginBottom: 16 },
  input:        { borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14, marginBottom: 10 },
  textArea:     { minHeight: 70, textAlignVertical: 'top' },
  submitLog:    { paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  submitLogText:{ color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
});
