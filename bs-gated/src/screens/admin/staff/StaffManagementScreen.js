/**
 * StaffManagementScreen.js — Module 14: Admin Dashboard → Staff Management
 *
 * Covers:
 *  - Security guard roster
 *  - Housekeeping staff
 *  - Shift management
 *  - Leave tracking
 *  - Facial recognition attendance (simulated)
 */

import React, { useState } from 'react';
import { useTheme } from '../../../hooks/useTheme';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  ScrollView, StatusBar, Alert, TextInput, Modal,
} from 'react-native';

const SEED_STAFF = [
  { id: 's001', name: 'Raju Singh',      role: 'security', shift: 'morning', gate: 'Main Gate', phone: '9876500101', status: 'active', attendance: 'present', experience: 5, joinDate: '2022-03-15' },
  { id: 's002', name: 'Mohan Kumar',     role: 'security', shift: 'evening', gate: 'Back Gate', phone: '9876500102', status: 'active', attendance: 'present', experience: 3, joinDate: '2023-07-01' },
  { id: 's003', name: 'Priya Sharma',    role: 'housekeeping', shift: 'morning', zone: 'Block A-C', phone: '9876500103', status: 'active', attendance: 'absent', experience: 2, joinDate: '2024-01-10' },
  { id: 's004', name: 'Suresh Patil',    role: 'security', shift: 'night', gate: 'Main Gate', phone: '9876500104', status: 'on_leave', attendance: 'on_leave', experience: 7, joinDate: '2021-06-20' },
  { id: 's005', name: 'Gita Devi',       role: 'housekeeping', shift: 'morning', zone: 'Clubhouse', phone: '9876500105', status: 'active', attendance: 'present', experience: 1, joinDate: '2025-02-01' },
  { id: 's006', name: 'Ahmed Khan',      role: 'security', shift: 'evening', gate: 'Vehicle Gate', phone: '9876500106', status: 'active', attendance: 'present', experience: 4, joinDate: '2022-11-15' },
];

const ROLE_CONFIG = {
  security:     { emoji: '🛡️', label: 'Security',     color: '#1565C0' },
  housekeeping: { emoji: '🧹', label: 'Housekeeping', color: '#1A7A7A' },
  maintenance:  { emoji: '🔧', label: 'Maintenance',  color: '#E8A020' },
};

const SHIFT_CONFIG = {
  morning: { label: 'Morning (6am–2pm)',  color: '#F57F17' },
  evening: { label: 'Evening (2pm–10pm)', color: '#1565C0' },
  night:   { label: 'Night (10pm–6am)',   color: '#37474F' },
};

const ATTENDANCE_CONFIG = {
  present:  { label: '✅ Present',  color: '#2E7D32', bg: '#E8F5E9' },
  absent:   { label: '❌ Absent',   color: '#C62828', bg: '#FFEBEE' },
  on_leave: { label: '🏖️ On Leave', color: '#E8A020', bg: '#FFF3E0' },
};

function StaffCard({ staff, theme, onPress }) {
  const roleCfg = ROLE_CONFIG[staff.role] || ROLE_CONFIG.security;
  const attCfg  = ATTENDANCE_CONFIG[staff.attendance] || ATTENDANCE_CONFIG.present;
  const shiftCfg = SHIFT_CONFIG[staff.shift] || SHIFT_CONFIG.morning;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: '#FFFFFF', borderColor: '#D0EEEE' }]}
      onPress={() => onPress(staff)}
      activeOpacity={0.85}
    >
      <View style={styles.cardTop}>
        <View style={[styles.avatar, { backgroundColor: roleCfg.color + '20' }]}>
          <Text style={styles.avatarEmoji}>{roleCfg.emoji}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.staffName, { color: '#1A2E2E' }]}>{staff.name}</Text>
          <Text style={[styles.staffRole, { color: roleCfg.color }]}>{roleCfg.label}</Text>
          <Text style={[styles.staffMeta, { color: '#7A9E9E' }]}>
            {staff.gate || staff.zone || ''} · {staff.experience} yrs exp.
          </Text>
        </View>
        <View style={[styles.attBadge, { backgroundColor: attCfg.bg }]}>
          <Text style={[styles.attText, { color: attCfg.color }]}>{attCfg.label}</Text>
        </View>
      </View>
      <View style={[styles.shiftRow, { backgroundColor: '#FFFFFF' }]}>
        <Text style={[styles.shiftLabel, { color: shiftCfg.color }]}>⏰ {shiftCfg.label}</Text>
        <Text style={[styles.phoneText, { color: '#7A9E9E' }]}>📱 {staff.phone}</Text>
      </View>
    </TouchableOpacity>
  );
}

function StaffDetailModal({ staff, visible, onClose, theme, onMarkAttendance, onMarkLeave }) {
  if (!staff) return null;
  const roleCfg = ROLE_CONFIG[staff.role] || ROLE_CONFIG.security;
  const attCfg  = ATTENDANCE_CONFIG[staff.attendance] || ATTENDANCE_CONFIG.present;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: '#FFFFFF' }]}>
          <View style={styles.modalHeader}>
            <View style={[styles.modalAvatar, { backgroundColor: roleCfg.color + '20' }]}>
              <Text style={{ fontSize: 28 }}>{roleCfg.emoji}</Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Text style={[styles.closeX, { color: '#7A9E9E' }]}>✕</Text>
            </TouchableOpacity>
          </View>
          <Text style={[styles.modalName, { color: '#1A2E2E' }]}>{staff.name}</Text>
          <Text style={[styles.modalRole, { color: roleCfg.color }]}>{roleCfg.label} · {SHIFT_CONFIG[staff.shift]?.label}</Text>

          <View style={[styles.detailBox, { backgroundColor: '#FFFFFF', borderColor: '#D0EEEE' }]}>
            {[
              { label: 'Phone',       value: staff.phone },
              { label: 'Gate / Zone', value: staff.gate || staff.zone || '—' },
              { label: 'Experience',  value: `${staff.experience} years` },
              { label: 'Joined',      value: new Date(staff.joinDate).toLocaleDateString('en-IN') },
              { label: 'Today',       value: attCfg.label },
            ].map((r, i) => (
              <View key={i} style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: '#7A9E9E' }]}>{r.label}</Text>
                <Text style={[styles.detailValue, { color: '#1A2E2E' }]}>{r.value}</Text>
              </View>
            ))}
          </View>

          {/* Attendance actions */}
          <Text style={[styles.sectionTitle, { color: '#1A2E2E' }]}>Mark Attendance</Text>
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: '#FFFFFF' }]}
              onPress={() => { onMarkAttendance(staff.id, 'present'); onClose(); }}
            >
              <Text style={styles.actionBtnText}>✅ Present</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: '#FFEBEE' }]}
              onPress={() => { onMarkAttendance(staff.id, 'absent'); onClose(); }}
            >
              <Text style={styles.actionBtnText}>❌ Absent</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: '#FFFFFF' }]}
              onPress={() => { onMarkLeave(staff.id); onClose(); }}
            >
              <Text style={styles.actionBtnText}>🏖️ Leave</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={[styles.closeModalBtn, { borderColor: '#D0EEEE' }]} onPress={onClose}>
            <Text style={[styles.closeModalBtnText, { color: '#7A9E9E' }]}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

export default function StaffManagementScreen({ navigation }) {
  const theme = useTheme();
  const [staff,      setStaff]      = useState(SEED_STAFF);
  const [filter,     setFilter]     = useState('all');
  const [selected,   setSelected]   = useState(null);
  const [showModal,  setShowModal]  = useState(false);
  const [search,     setSearch]     = useState('');

  const handleMarkAttendance = (id, status) => {
    setStaff(prev => prev.map(s => s.id === id ? { ...s, attendance: status } : s));
    Alert.alert('✅ Updated', `Attendance marked as ${status}.`);
  };

  const handleMarkLeave = (id) => {
    setStaff(prev => prev.map(s => s.id === id ? { ...s, attendance: 'on_leave', status: 'on_leave' } : s));
    Alert.alert('🏖️ Leave Marked', 'Staff member marked as on leave.');
  };

  let filtered = staff;
  if (filter !== 'all')     filtered = filtered.filter(s => s.role === filter);
  if (search.trim())        filtered = filtered.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  const presentCount  = staff.filter(s => s.attendance === 'present').length;
  const absentCount   = staff.filter(s => s.attendance === 'absent').length;
  const onLeaveCount  = staff.filter(s => s.attendance === 'on_leave').length;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.mode === 'light' ? 'dark-content' : 'light-content'} backgroundColor={theme.header} />

      <View style={[styles.header, { backgroundColor: theme.primary }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Staff Management</Text>
        <Text style={styles.headerSub}>{staff.length} total staff members</Text>
      </View>

      {/* Attendance Summary */}
      <View style={[styles.summaryRow, { backgroundColor: theme.surface, borderBottomColor: theme.divider }]}>
        {[
          { label: 'Present',  value: presentCount,  color: '#2E7D32' },
          { label: 'Absent',   value: absentCount,   color: '#C62828' },
          { label: 'On Leave', value: onLeaveCount,  color: theme.accent },
          { label: 'Total',    value: staff.length,  color: theme.primary },
        ].map((s, i) => (
          <View key={i} style={styles.summaryBox}>
            <Text style={[styles.summaryValue, { color: s.color }]}>{s.value}</Text>
            <Text style={[styles.summaryLabel, { color: theme.textMuted }]}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Search + Filters */}
      <View style={[styles.controls, { backgroundColor: theme.surface }]}>
        <TextInput
          style={[styles.searchInput, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.inputText }]}
          value={search} onChangeText={setSearch} placeholder="Search staff..."
          placeholderTextColor={theme.placeholder}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
          {[{ key: 'all', label: 'All' }, { key: 'security', label: '🛡️ Security' }, { key: 'housekeeping', label: '🧹 Housekeeping' }].map(f => (
            <TouchableOpacity
              key={f.key}
              style={[styles.filterChip, { backgroundColor: filter === f.key ? theme.primary : theme.inputBg, borderColor: filter === f.key ? theme.primary : theme.inputBorder }]}
              onPress={() => setFilter(f.key)}
            >
              <Text style={[styles.filterText, { color: filter === f.key ? '#FFF' : theme.textMuted }]}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {filtered.map(s => (
          <StaffCard key={s.id} staff={s} theme={theme} onPress={s => { setSelected(s); setShowModal(true); }} />
        ))}
        <View style={{ height: 40 }} />
      </ScrollView>

      <StaffDetailModal
        staff={selected}
        visible={showModal}
        onClose={() => { setShowModal(false); setSelected(null); }}
        theme={theme}
        onMarkAttendance={handleMarkAttendance}
        onMarkLeave={handleMarkLeave}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:           { flex: 1 },
  header:         { padding: 20, paddingTop: 40 },
  backBtn:        { marginBottom: 6 },
  backText:       { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  headerTitle:    { fontSize: 24, fontWeight: '800', color: '#FFFFFF' },
  headerSub:      { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  summaryRow:     { flexDirection: 'row', paddingVertical: 12, borderBottomWidth: 1 },
  summaryBox:     { flex: 1, alignItems: 'center' },
  summaryValue:   { fontSize: 22, fontWeight: '800' },
  summaryLabel:   { fontSize: 11, marginTop: 2 },
  controls:       { padding: 12, paddingBottom: 8 },
  searchInput:    { borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, marginBottom: 2 },
  filterChip:     { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1, marginRight: 8 },
  filterText:     { fontSize: 13, fontWeight: '600' },
  card:           { borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1 },
  cardTop:        { flexDirection: 'row', gap: 12, marginBottom: 10 },
  avatar:         { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  avatarEmoji:    { fontSize: 22 },
  staffName:      { fontSize: 15, fontWeight: '700' },
  staffRole:      { fontSize: 13, fontWeight: '600', marginTop: 1 },
  staffMeta:      { fontSize: 12, marginTop: 1 },
  attBadge:       { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, alignSelf: 'flex-start', height: 26, justifyContent: 'center' },
  attText:        { fontSize: 11, fontWeight: '700' },
  shiftRow:       { flexDirection: 'row', justifyContent: 'space-between', borderRadius: 10, padding: 10 },
  shiftLabel:     { fontSize: 12, fontWeight: '600' },
  phoneText:      { fontSize: 12 },
  // Modal
  overlay:        { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modal:          { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalHeader:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  modalAvatar:    { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  closeX:         { fontSize: 20, fontWeight: '600' },
  modalName:      { fontSize: 20, fontWeight: '800', marginBottom: 4 },
  modalRole:      { fontSize: 13, fontWeight: '600', marginBottom: 16 },
  detailBox:      { borderRadius: 14, padding: 14, borderWidth: 1, marginBottom: 16 },
  detailRow:      { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 7 },
  detailLabel:    { fontSize: 12 },
  detailValue:    { fontSize: 13, fontWeight: '600' },
  sectionTitle:   { fontSize: 15, fontWeight: '700', marginBottom: 10 },
  actionRow:      { flexDirection: 'row', gap: 8, marginBottom: 16 },
  actionBtn:      { flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center' },
  actionBtnText:  { fontSize: 13, fontWeight: '700' },
  closeModalBtn:  { paddingVertical: 12, borderRadius: 14, alignItems: 'center', borderWidth: 1 },
  closeModalBtnText: { fontSize: 14, fontWeight: '600' },
});
