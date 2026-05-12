/**
 * SecurityIncidentScreen.js — Guard
 *
 * Real workflow:
 * Guard reports incident → saved to securityStore.incidents → admin sees it
 * Types: Unauthorized Entry, Theft/Damage, Fire/Emergency, Resident Dispute,
 *        Medical, Suspicious Activity, Equipment Failure, Other
 * Severity: low | medium | high | critical
 * Status: open → closed (guard closes with resolution)
 */

import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, Alert, SafeAreaView, StatusBar, FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSecurityStore } from '../../../store/securityStore';
import { useAuthStore }     from '../../../store/AuthStore';

const P = {
  navy: '#1A7A7A', navyDark: '#0D6E6E', bg: '#E8F5F5',
  surface: '#FFF', text: '#1E293B', sub: '#64748B', muted: '#94A3B8',
  border: '#E2E8F0', teal: '#1A7A7A', tealBg: '#E8F5F5',
  success: '#16A34A', successBg: '#DCFCE7',
  warning: '#D97706', warningBg: '#FEF3C7',
  danger: '#DC2626', dangerBg: '#FEE2E2',
  critical: '#7C3AED', criticalBg: '#F3E8FF',
};

const SEVERITY_CFG = {
  low:      { label: 'Low',      color: P.success, bg: P.successBg },
  medium:   { label: 'Medium',   color: P.warning, bg: P.warningBg },
  high:     { label: 'High',     color: P.danger,  bg: P.dangerBg  },
  critical: { label: 'Critical', color: P.critical,bg: P.criticalBg},
};

const INCIDENT_TYPES = [
  'Unauthorized Entry', 'Theft / Damage', 'Fire / Emergency',
  'Resident Dispute', 'Medical Emergency', 'Suspicious Activity',
  'Equipment Failure', 'Parking Issue', 'Other',
];

const LOCATIONS = [
  'Main Gate', 'Side Gate', 'Block A', 'Block B', 'Block C',
  'Basement Parking', 'Terrace', 'Common Area', 'Lift', 'Other',
];

function fmt(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-IN', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit', hour12: true });
}

export default function SecurityIncidentScreen({ navigation }) {
  const user         = useAuthStore(s => s.user);
  const incidents    = useSecurityStore(s => s.incidents    || []);
  const addIncident  = useSecurityStore(s => s.addIncident);
  const closeIncident = useSecurityStore(s => s.closeIncident);

  const [tab, setTab] = useState('report'); // report | open | closed
  const [form, setForm] = useState({
    title: '', type: 'Unauthorized Entry', severity: 'medium',
    location: 'Main Gate', description: '', actionTaken: '',
    witnessName: '', policeCallMade: false,
  });
  const f = (k, v) => setForm(prev => ({ ...prev, [k]: v }));
  const [search, setSearch] = useState('');
  const [closingId, setClosingId] = useState(null);
  const [resolution, setResolution] = useState('');

  const openIncidents   = incidents.filter(i => i.status === 'open');
  const closedIncidents = incidents.filter(i => i.status === 'closed');
  const listData = tab === 'open' ? openIncidents : closedIncidents;

  const filtered = useMemo(() =>
    listData.filter(i =>
      !search ||
      i.title?.toLowerCase().includes(search.toLowerCase()) ||
      i.type?.toLowerCase().includes(search.toLowerCase()) ||
      i.location?.toLowerCase().includes(search.toLowerCase())
    ), [listData, search]
  );

  const handleSubmit = () => {
    if (!form.title.trim()) { Alert.alert('Required', 'Enter an incident title.'); return; }
    if (!form.description.trim()) { Alert.alert('Required', 'Describe the incident.'); return; }

    Alert.alert(
      'Report Incident',
      `Report: "${form.title}" at ${form.location}?\n\nSeverity: ${form.severity.toUpperCase()}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Report',
          onPress: () => {
            addIncident({
              ...form,
              guardId: user?.id || 'g1',
              guardName: user?.name || 'Guard',
            });
            setForm({ title:'', type:'Unauthorized Entry', severity:'medium', location:'Main Gate', description:'', actionTaken:'', witnessName:'', policeCallMade: false });
            setTab('open');
            Alert.alert('✅ Reported', 'Incident reported and admin notified.');
          },
        },
      ]
    );
  };

  const handleClose = () => {
    if (!resolution.trim()) { Alert.alert('Required', 'Enter resolution details.'); return; }
    closeIncident(closingId, resolution);
    setClosingId(null);
    setResolution('');
    Alert.alert('✅ Closed', 'Incident marked as closed.');
  };

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={P.navyDark} />

      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#FFF" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle}>Security Incidents</Text>
          <Text style={s.headerSub}>{openIncidents.length} open · {closedIncidents.length} closed</Text>
        </View>
        {openIncidents.length > 0 && (
          <View style={s.alertBadge}>
            <Text style={s.alertBadgeText}>{openIncidents.length}</Text>
          </View>
        )}
      </View>

      {/* Tabs */}
      <View style={s.tabRow}>
        {[['report','Report New'],['open',`Open (${openIncidents.length})`],['closed',`Closed (${closedIncidents.length})`]].map(([k,l]) => (
          <TouchableOpacity key={k} style={[s.tab, tab===k && s.tabActive]} onPress={() => setTab(k)}>
            <Text style={[s.tabText, tab===k && s.tabTextActive]}>{l}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'report' ? (
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={s.card}>
            <Text style={s.sectionTitle}>📋 New Incident Report</Text>

            <Text style={s.fieldLabel}>Incident Title *</Text>
            <TextInput style={s.input} value={form.title} onChangeText={v => f('title', v)}
              placeholder="Brief title, e.g. Unauthorized entry attempt" placeholderTextColor={P.muted} />

            <Text style={s.fieldLabel}>Incident Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
              {INCIDENT_TYPES.map(t => (
                <TouchableOpacity key={t} style={[s.chip, form.type === t && s.chipActive]} onPress={() => f('type', t)}>
                  <Text style={[s.chipText, form.type === t && s.chipTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={s.fieldLabel}>Severity *</Text>
            <View style={s.chipRow}>
              {Object.entries(SEVERITY_CFG).map(([key, cfg]) => (
                <TouchableOpacity key={key}
                  style={[s.chip, form.severity === key && { backgroundColor: cfg.bg, borderColor: cfg.color }]}
                  onPress={() => f('severity', key)}>
                  <Text style={[s.chipText, form.severity === key && { color: cfg.color, fontWeight: '800' }]}>
                    {cfg.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={s.fieldLabel}>Location</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
              {LOCATIONS.map(loc => (
                <TouchableOpacity key={loc} style={[s.chip, form.location === loc && s.chipActive]} onPress={() => f('location', loc)}>
                  <Text style={[s.chipText, form.location === loc && s.chipTextActive]}>{loc}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={s.fieldLabel}>Description *</Text>
            <TextInput style={[s.input, { height: 100, textAlignVertical: 'top' }]}
              value={form.description} onChangeText={v => f('description', v)}
              placeholder="Detailed description of what happened, who was involved, time sequence…"
              placeholderTextColor={P.muted} multiline />

            <Text style={s.fieldLabel}>Action Taken</Text>
            <TextInput style={[s.input, { height: 80, textAlignVertical: 'top' }]}
              value={form.actionTaken} onChangeText={v => f('actionTaken', v)}
              placeholder="e.g. Person escorted out, resident notified, admin called…"
              placeholderTextColor={P.muted} multiline />

            <Text style={s.fieldLabel}>Witness Name (if any)</Text>
            <TextInput style={s.input} value={form.witnessName} onChangeText={v => f('witnessName', v)}
              placeholder="Name of resident / staff who witnessed" placeholderTextColor={P.muted} />

            <TouchableOpacity style={s.toggleRow} onPress={() => f('policeCallMade', !form.policeCallMade)} activeOpacity={0.8}>
              <View style={[s.checkbox, form.policeCallMade && s.checkboxActive]}>
                {form.policeCallMade && <Ionicons name="checkmark" size={14} color="#FFF" />}
              </View>
              <Text style={s.checkLabel}>🚔 Police / Emergency services called</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[s.submitBtn, { marginTop: 16 }]} onPress={handleSubmit} activeOpacity={0.85}>
              <Ionicons name="warning-outline" size={18} color="#FFF" />
              <Text style={s.submitBtnText}>File Incident Report</Text>
            </TouchableOpacity>
          </View>
          <View style={{ height: 30 }} />
        </ScrollView>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={i => i.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          ListHeaderComponent={
            <View style={s.searchRow}>
              <Ionicons name="search-outline" size={16} color={P.muted} />
              <TextInput style={s.searchInput} placeholder="Search incidents…"
                value={search} onChangeText={setSearch} placeholderTextColor={P.muted} />
            </View>
          }
          ListEmptyComponent={
            <View style={s.empty}>
              <Text style={{ fontSize: 48, marginBottom: 12 }}>
                {tab === 'open' ? '✅' : '📁'}
              </Text>
              <Text style={s.emptyText}>
                {tab === 'open' ? 'No open incidents' : 'No closed incidents'}
              </Text>
            </View>
          }
          renderItem={({ item: inc }) => {
            const sev = SEVERITY_CFG[inc.severity] || SEVERITY_CFG.medium;
            return (
              <View style={s.incCard}>
                <View style={s.incTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.incTitle}>{inc.title}</Text>
                    <Text style={s.incSub}>{inc.type} · {inc.location}</Text>
                  </View>
                  <View style={[s.sevBadge, { backgroundColor: sev.bg }]}>
                    <Text style={[s.sevText, { color: sev.color }]}>{sev.label}</Text>
                  </View>
                </View>
                <Text style={s.incDesc} numberOfLines={2}>{inc.description}</Text>
                {inc.actionTaken ? (
                  <View style={s.actionBox}>
                    <Text style={s.actionLabel}>Action Taken</Text>
                    <Text style={s.actionText}>{inc.actionTaken}</Text>
                  </View>
                ) : null}
                <View style={s.incFooter}>
                  <Text style={s.incTime}>Reported {fmt(inc.reportedAt)}</Text>
                  <Text style={s.incBy}>by {inc.guardName}</Text>
                </View>
                {inc.policeCallMade && (
                  <View style={s.policePill}><Text style={s.policePillText}>🚔 Police called</Text></View>
                )}
                {inc.status === 'open' && (
                  <TouchableOpacity style={s.closeBtn} onPress={() => { setClosingId(inc.id); setResolution(''); }} activeOpacity={0.85}>
                    <Ionicons name="checkmark-circle-outline" size={16} color={P.success} />
                    <Text style={s.closeBtnText}>Mark as Closed</Text>
                  </TouchableOpacity>
                )}
                {inc.status === 'closed' && (
                  <View style={[s.actionBox, { backgroundColor: P.successBg, borderLeftColor: P.success }]}>
                    <Text style={[s.actionLabel, { color: P.success }]}>Resolution</Text>
                    <Text style={[s.actionText, { color: '#166534' }]}>{inc.actionTaken}</Text>
                    <Text style={[s.incTime, { marginTop: 4 }]}>Closed {fmt(inc.closedAt)}</Text>
                  </View>
                )}
              </View>
            );
          }}
        />
      )}

      {/* Close Incident Modal */}
      {closingId && (
        <View style={s.closingOverlay}>
          <View style={s.closingCard}>
            <Text style={s.closingTitle}>Close Incident</Text>
            <Text style={s.fieldLabel}>Resolution / Final Action Taken *</Text>
            <TextInput
              style={[s.input, { height: 90, textAlignVertical: 'top' }]}
              value={resolution} onChangeText={setResolution}
              placeholder="e.g. Person removed from premises. Admin informed. No further action required."
              placeholderTextColor={P.muted} multiline autoFocus
            />
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
              <TouchableOpacity style={[s.chip, { flex: 1, justifyContent: 'center', paddingVertical: 12 }]}
                onPress={() => setClosingId(null)}>
                <Text style={[s.chipText, { textAlign: 'center' }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.submitBtn, { flex: 2, paddingVertical: 12, marginTop: 0 }]}
                onPress={handleClose} activeOpacity={0.85}>
                <Text style={[s.submitBtnText, { fontSize: 14 }]}>Close Incident</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root:       { flex: 1, backgroundColor: P.bg },
  header:     { backgroundColor: P.navyDark, paddingTop: 16, paddingBottom: 20, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 14 },
  backBtn:    { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  headerTitle:{ color: '#FFF', fontSize: 18, fontWeight: '900' },
  headerSub:  { color: 'rgba(255,255,255,0.65)', fontSize: 12, marginTop: 2 },
  alertBadge: { width: 28, height: 28, borderRadius: 14, backgroundColor: P.danger, alignItems: 'center', justifyContent: 'center', marginLeft: 'auto' },
  alertBadgeText:{ color: '#FFF', fontSize: 13, fontWeight: '900' },
  tabRow:     { flexDirection: 'row', backgroundColor: P.surface, borderBottomWidth: 1, borderBottomColor: P.border },
  tab:        { flex: 1, paddingVertical: 13, alignItems: 'center' },
  tabActive:  { borderBottomWidth: 3, borderBottomColor: P.navy },
  tabText:    { fontSize: 12, fontWeight: '600', color: P.muted },
  tabTextActive:{ color: P.navy, fontWeight: '800' },
  scroll:     { padding: 16 },
  card:       { backgroundColor: P.surface, borderRadius: 18, padding: 18, borderWidth: 1, borderColor: P.border, elevation: 2 },
  sectionTitle:{ fontSize: 16, fontWeight: '800', color: P.text, marginBottom: 16 },
  fieldLabel: { fontSize: 12, fontWeight: '700', color: P.sub, marginBottom: 6 },
  input:      { backgroundColor: P.bg, borderWidth: 1.5, borderColor: P.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14, color: P.text, marginBottom: 12 },
  chipRow:    { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  chip:       { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: P.bg, borderWidth: 1, borderColor: P.border, marginRight: 6 },
  chipActive: { backgroundColor: P.navy, borderColor: P.navy },
  chipText:   { fontSize: 12, fontWeight: '700', color: P.sub },
  chipTextActive:{ color: '#FFF' },
  toggleRow:  { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  checkbox:   { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: P.border, alignItems: 'center', justifyContent: 'center' },
  checkboxActive:{ backgroundColor: P.teal, borderColor: P.teal },
  checkLabel: { fontSize: 14, fontWeight: '600', color: P.text, flex: 1 },
  submitBtn:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: P.navy, borderRadius: 14, paddingVertical: 15 },
  submitBtnText:{ color: '#FFF', fontSize: 15, fontWeight: '800' },
  searchRow:  { flexDirection: 'row', alignItems: 'center', backgroundColor: P.surface, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: P.border, gap: 8, marginBottom: 14 },
  searchInput:{ flex: 1, fontSize: 14, color: P.text },
  incCard:    { backgroundColor: P.surface, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: P.border, elevation: 2 },
  incTop:     { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  incTitle:   { fontSize: 15, fontWeight: '800', color: P.text },
  incSub:     { fontSize: 12, color: P.muted, marginTop: 3 },
  sevBadge:   { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  sevText:    { fontSize: 11, fontWeight: '800' },
  incDesc:    { fontSize: 13, color: P.sub, lineHeight: 20, marginBottom: 10 },
  actionBox:  { backgroundColor: '#FEF9E7', borderRadius: 10, padding: 10, marginBottom: 10, borderLeftWidth: 3, borderLeftColor: P.warning },
  actionLabel:{ fontSize: 11, fontWeight: '800', color: P.warning, marginBottom: 4 },
  actionText: { fontSize: 13, color: P.text },
  incFooter:  { flexDirection: 'row', justifyContent: 'space-between' },
  incTime:    { fontSize: 11, color: P.muted },
  incBy:      { fontSize: 11, color: P.muted },
  policePill: { alignSelf: 'flex-start', backgroundColor: P.dangerBg, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, marginTop: 8 },
  policePillText:{ fontSize: 11, color: P.danger, fontWeight: '700' },
  closeBtn:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 10, paddingVertical: 10, borderWidth: 1.5, borderColor: P.success, backgroundColor: P.successBg, marginTop: 10 },
  closeBtnText:{ color: P.success, fontSize: 13, fontWeight: '800' },
  empty:      { alignItems: 'center', paddingTop: 60 },
  emptyText:  { fontSize: 15, color: P.muted },
  closingOverlay:{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  closingCard:{ backgroundColor: P.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 36 },
  closingTitle:{ fontSize: 18, fontWeight: '900', color: P.text, marginBottom: 16 },
});
