/**
 * ShiftHandoverScreen.js — Guard
 *
 * Real workflow:
 * 1. Outgoing guard fills shift summary (auto-pulls live stats from store)
 * 2. Enters incoming guard name + remarks on pending items
 * 3. Submits → saved in securityStore.handoverLogs → admin can see it
 * 4. Shows full history of past handovers
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
};

const SHIFTS = ['Morning (6AM–2PM)', 'Afternoon (2PM–10PM)', 'Night (10PM–6AM)'];
const GATES  = ['Main Gate', 'Side Gate', 'Back Gate', 'Parking Gate'];

function fmt(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true });
}

export default function ShiftHandoverScreen({ navigation }) {
  const user            = useAuthStore(s => s.user);
  const handoverLogs    = useSecurityStore(s => s.handoverLogs    || []);
  const addHandoverLog  = useSecurityStore(s => s.addHandoverLog);
  const visitors        = useSecurityStore(s => s.visitors        || []);
  const deliveries      = useSecurityStore(s => s.deliveries      || []);
  const incidents       = useSecurityStore(s => s.incidents       || []);
  const sosAlerts       = useSecurityStore(s => s.sosAlerts       || []);

  const [tab, setTab] = useState('new'); // new | history
  const [form, setForm] = useState({
    incomingGuard: '',
    gate: 'Main Gate',
    shiftType: 'Morning (6AM–2PM)',
    pendingVisitors: '',
    vehicleUpdates: '',
    sosUpdates: '',
    incidentNotes: '',
    equipmentStatus: '',
    generalRemarks: '',
    keyHandedOver: true,
    walkyTalkieHandedOver: true,
    registerHandedOver: true,
  });
  const f = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  // Auto-compute live stats for this guard's current shift
  const todayStart = new Date(); todayStart.setHours(0,0,0,0);
  const todayVisitors   = visitors.filter(v => new Date(v.checkIn || 0) >= todayStart).length;
  const todayDeliveries = deliveries.filter(d => new Date(d.createdAt || 0) >= todayStart).length;
  const openIncidents   = incidents.filter(i => i.status === 'open').length;
  const activeSOS       = sosAlerts.filter(s => s.status === 'TRIGGERED').length;

  const [search, setSearch] = useState('');
  const filtered = useMemo(() =>
    handoverLogs.filter(l =>
      !search ||
      l.outgoingGuard?.toLowerCase().includes(search.toLowerCase()) ||
      l.incomingGuard?.toLowerCase().includes(search.toLowerCase()) ||
      l.gate?.toLowerCase().includes(search.toLowerCase())
    ), [handoverLogs, search]
  );

  const handleSubmit = () => {
    if (!form.incomingGuard.trim()) {
      Alert.alert('Required', 'Enter the incoming guard name.');
      return;
    }
    if (!form.generalRemarks.trim()) {
      Alert.alert('Required', 'General remarks are required for handover.');
      return;
    }

    Alert.alert(
      'Confirm Handover',
      `Hand over shift to ${form.incomingGuard} at ${form.gate}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit Handover',
          onPress: () => {
            addHandoverLog({
              outgoingGuard: user?.name || 'Guard',
              incomingGuard: form.incomingGuard,
              gate: form.gate,
              shiftType: form.shiftType,
              pendingVisitors: form.pendingVisitors || `${todayVisitors} visitors handled today`,
              vehicleUpdates: form.vehicleUpdates || 'No special vehicle notes',
              sosUpdates: form.sosUpdates || (activeSOS > 0 ? `${activeSOS} active SOS alert(s)!` : 'No active SOS'),
              incidentNotes: form.incidentNotes || (openIncidents > 0 ? `${openIncidents} open incident(s)` : 'No open incidents'),
              equipmentStatus: form.equipmentStatus || 'All equipment functional',
              generalRemarks: form.generalRemarks,
              keyHandedOver: form.keyHandedOver,
              walkyTalkieHandedOver: form.walkyTalkieHandedOver,
              registerHandedOver: form.registerHandedOver,
              guardId: user?.id || 'guard',
              guardName: user?.name || 'Guard',
              liveStats: {
                visitorsHandled: todayVisitors,
                deliveriesHandled: todayDeliveries,
                incidentsReported: openIncidents,
                activeSOS,
              },
            });
            setForm({ incomingGuard: '', gate: 'Main Gate', shiftType: 'Morning (6AM–2PM)', pendingVisitors: '', vehicleUpdates: '', sosUpdates: '', incidentNotes: '', equipmentStatus: '', generalRemarks: '', keyHandedOver: true, walkyTalkieHandedOver: true, registerHandedOver: true });
            setTab('history');
            Alert.alert('✅ Handover Submitted', 'Shift handover recorded. Admin has been notified.');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={P.navyDark} />

      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#FFF" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle}>Shift Handover</Text>
          <Text style={s.headerSub}>{user?.name || 'Guard'} · {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' })}</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={s.tabRow}>
        {[['new','New Handover'], ['history',`History (${handoverLogs.length})`]].map(([k,l]) => (
          <TouchableOpacity key={k} style={[s.tab, tab===k && s.tabActive]} onPress={() => setTab(k)}>
            <Text style={[s.tabText, tab===k && s.tabTextActive]}>{l}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'new' ? (
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          {/* Live shift summary */}
          <View style={s.sectionCard}>
            <Text style={s.sectionTitle}>📊 Your Shift Summary (Auto)</Text>
            <View style={s.statsRow}>
              {[
                { label: 'Visitors', val: todayVisitors,   icon: '👤', color: P.teal    },
                { label: 'Deliveries', val: todayDeliveries, icon: '📦', color: '#1D4ED8' },
                { label: 'Open Incidents', val: openIncidents, icon: '⚠️', color: P.warning },
                { label: 'Active SOS', val: activeSOS, icon: '🚨', color: P.danger   },
              ].map(st => (
                <View key={st.label} style={[s.statBox, { borderColor: st.color + '30' }]}>
                  <Text style={{ fontSize: 20 }}>{st.icon}</Text>
                  <Text style={[s.statVal, { color: st.color }]}>{st.val}</Text>
                  <Text style={s.statLabel}>{st.label}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Gate & Shift */}
          <View style={s.sectionCard}>
            <Text style={s.sectionTitle}>🚪 Handover Details</Text>
            <Text style={s.fieldLabel}>Incoming Guard Name *</Text>
            <TextInput style={s.input} value={form.incomingGuard} onChangeText={v => f('incomingGuard', v)}
              placeholder="e.g. Ravi Kumar" placeholderTextColor={P.muted} />

            <Text style={s.fieldLabel}>Gate</Text>
            <View style={s.chipRow}>
              {GATES.map(g => (
                <TouchableOpacity key={g} style={[s.chip, form.gate === g && s.chipActive]} onPress={() => f('gate', g)}>
                  <Text style={[s.chipText, form.gate === g && s.chipTextActive]}>{g}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={s.fieldLabel}>Shift Being Handed Over</Text>
            <View style={s.chipRow}>
              {SHIFTS.map(sh => (
                <TouchableOpacity key={sh} style={[s.chip, form.shiftType === sh && s.chipActive]} onPress={() => f('shiftType', sh)}>
                  <Text style={[s.chipText, form.shiftType === sh && s.chipTextActive]}>{sh}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Situation report */}
          <View style={s.sectionCard}>
            <Text style={s.sectionTitle}>📋 Situation Report</Text>
            {[
              { label: 'Pending Visitors / Approvals', key: 'pendingVisitors', placeholder: `e.g. ${todayVisitors} visitors processed. 2 pending inside.` },
              { label: 'Vehicle / Parking Updates',    key: 'vehicleUpdates',  placeholder: 'e.g. 3 vehicles in visitor bay. Van at B-block.' },
              { label: 'SOS / Emergency Status',       key: 'sosUpdates',      placeholder: activeSOS > 0 ? `⚠️ ${activeSOS} ACTIVE SOS — fill details!` : 'No active emergencies.' },
              { label: 'Incident Notes',               key: 'incidentNotes',   placeholder: openIncidents > 0 ? `${openIncidents} open incident(s) — describe status.` : 'No open incidents.' },
              { label: 'Equipment & Keys Status',      key: 'equipmentStatus', placeholder: 'e.g. All equipment functional. Camera 2 needs attention.' },
              { label: 'General Remarks *',            key: 'generalRemarks',  placeholder: 'Overall situation, any specific instructions for incoming guard…', multiline: true },
            ].map(fi => (
              <View key={fi.key}>
                <Text style={s.fieldLabel}>{fi.label}</Text>
                <TextInput
                  style={[s.input, fi.multiline && { height: 90, textAlignVertical: 'top' }]}
                  value={form[fi.key]} onChangeText={v => f(fi.key, v)}
                  placeholder={fi.placeholder} placeholderTextColor={P.muted} multiline={fi.multiline}
                />
              </View>
            ))}
          </View>

          {/* Equipment checklist */}
          <View style={s.sectionCard}>
            <Text style={s.sectionTitle}>✅ Handover Checklist</Text>
            {[
              { key: 'keyHandedOver',          label: 'Gate Keys Handed Over',      icon: '🔑' },
              { key: 'walkyTalkieHandedOver',   label: 'Walky-Talkie Handed Over',   icon: '📻' },
              { key: 'registerHandedOver',      label: 'Visitor Register Handed Over',icon: '📖' },
            ].map(item => (
              <TouchableOpacity key={item.key} style={s.checkRow} onPress={() => f(item.key, !form[item.key])} activeOpacity={0.8}>
                <View style={[s.checkbox, form[item.key] && s.checkboxActive]}>
                  {form[item.key] && <Ionicons name="checkmark" size={14} color="#FFF" />}
                </View>
                <Text style={{ fontSize: 18 }}>{item.icon}</Text>
                <Text style={s.checkLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={s.submitBtn} onPress={handleSubmit} activeOpacity={0.85}>
            <Ionicons name="send-outline" size={18} color="#FFF" />
            <Text style={s.submitBtnText}>Submit Shift Handover</Text>
          </TouchableOpacity>
          <View style={{ height: 30 }} />
        </ScrollView>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={l => l.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          ListHeaderComponent={
            <View style={s.searchRow}>
              <Ionicons name="search-outline" size={16} color={P.muted} />
              <TextInput style={s.searchInput} placeholder="Search by guard name or gate…"
                value={search} onChangeText={setSearch} placeholderTextColor={P.muted} />
            </View>
          }
          ListEmptyComponent={
            <View style={s.empty}>
              <Text style={{ fontSize: 48, marginBottom: 12 }}>📋</Text>
              <Text style={s.emptyText}>No handover logs yet</Text>
            </View>
          }
          renderItem={({ item: log }) => (
            <View style={s.logCard}>
              <View style={s.logTop}>
                <View style={{ flex: 1 }}>
                  <Text style={s.logTitle}>{log.outgoingGuard} → {log.incomingGuard}</Text>
                  <Text style={s.logSub}>{log.gate || 'Main Gate'} · {log.shiftType || log.shiftTime}</Text>
                </View>
                <Text style={s.logTime}>{fmt(log.submittedAt)}</Text>
              </View>
              {log.liveStats && (
                <View style={s.logStats}>
                  {[
                    { label: 'Visitors', val: log.liveStats.visitorsHandled },
                    { label: 'Deliveries', val: log.liveStats.deliveriesHandled },
                    { label: 'Incidents', val: log.liveStats.incidentsReported },
                  ].map(st => (
                    <View key={st.label} style={s.logStatBox}>
                      <Text style={s.logStatVal}>{st.val}</Text>
                      <Text style={s.logStatLabel}>{st.label}</Text>
                    </View>
                  ))}
                </View>
              )}
              {[
                ['Pending Visitors', log.pendingVisitors],
                ['SOS Status',       log.sosUpdates],
                ['Incidents',        log.incidentNotes],
                ['Remarks',          log.generalRemarks],
              ].filter(([,v]) => v && v !== 'No pending visitors' && v !== 'No active SOS' && v !== 'No open incidents').map(([k, v]) => (
                <View key={k} style={s.logRow}>
                  <Text style={s.logRowKey}>{k}</Text>
                  <Text style={s.logRowVal}>{v}</Text>
                </View>
              ))}
              {/* Checklist pills */}
              <View style={{ flexDirection: 'row', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
                {log.keyHandedOver && <View style={s.pill}><Text style={s.pillText}>🔑 Keys</Text></View>}
                {log.walkyTalkieHandedOver && <View style={s.pill}><Text style={s.pillText}>📻 W/T</Text></View>}
                {log.registerHandedOver && <View style={s.pill}><Text style={s.pillText}>📖 Register</Text></View>}
              </View>
            </View>
          )}
        />
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
  tabRow:     { flexDirection: 'row', backgroundColor: P.surface, borderBottomWidth: 1, borderBottomColor: P.border },
  tab:        { flex: 1, paddingVertical: 13, alignItems: 'center' },
  tabActive:  { borderBottomWidth: 3, borderBottomColor: P.navy },
  tabText:    { fontSize: 13, fontWeight: '600', color: P.muted },
  tabTextActive:{ color: P.navy, fontWeight: '800' },
  scroll:     { padding: 16 },
  sectionCard:{ backgroundColor: P.surface, borderRadius: 18, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: P.border, elevation: 2 },
  sectionTitle:{ fontSize: 15, fontWeight: '800', color: P.text, marginBottom: 14 },
  statsRow:   { flexDirection: 'row', gap: 8 },
  statBox:    { flex: 1, borderRadius: 12, borderWidth: 1, backgroundColor: P.bg, padding: 10, alignItems: 'center', gap: 4 },
  statVal:    { fontSize: 22, fontWeight: '900' },
  statLabel:  { fontSize: 9, fontWeight: '700', color: P.muted, textAlign: 'center' },
  fieldLabel: { fontSize: 12, fontWeight: '700', color: P.sub, marginBottom: 6, marginTop: 4 },
  input:      { backgroundColor: P.bg, borderWidth: 1.5, borderColor: P.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14, color: P.text, marginBottom: 12 },
  chipRow:    { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  chip:       { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: P.bg, borderWidth: 1, borderColor: P.border },
  chipActive: { backgroundColor: P.navy, borderColor: P.navy },
  chipText:   { fontSize: 12, fontWeight: '700', color: P.sub },
  chipTextActive:{ color: '#FFF' },
  checkRow:   { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: P.border },
  checkbox:   { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: P.border, alignItems: 'center', justifyContent: 'center' },
  checkboxActive:{ backgroundColor: P.teal, borderColor: P.teal },
  checkLabel: { fontSize: 14, fontWeight: '600', color: P.text, flex: 1 },
  submitBtn:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: P.navy, borderRadius: 16, paddingVertical: 16, marginTop: 4 },
  submitBtnText:{ color: '#FFF', fontSize: 16, fontWeight: '900' },
  searchRow:  { flexDirection: 'row', alignItems: 'center', backgroundColor: P.surface, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: P.border, gap: 8, marginBottom: 14 },
  searchInput:{ flex: 1, fontSize: 14, color: P.text },
  logCard:    { backgroundColor: P.surface, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: P.border, elevation: 2 },
  logTop:     { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  logTitle:   { fontSize: 15, fontWeight: '800', color: P.text },
  logSub:     { fontSize: 12, color: P.muted, marginTop: 2 },
  logTime:    { fontSize: 11, color: P.muted, marginLeft: 8 },
  logStats:   { flexDirection: 'row', gap: 10, backgroundColor: P.bg, borderRadius: 10, padding: 10, marginBottom: 10 },
  logStatBox: { flex: 1, alignItems: 'center' },
  logStatVal: { fontSize: 18, fontWeight: '900', color: P.navy },
  logStatLabel:{ fontSize: 10, color: P.muted, fontWeight: '600' },
  logRow:     { flexDirection: 'row', gap: 8, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: P.border },
  logRowKey:  { fontSize: 12, color: P.muted, width: 110, fontWeight: '600' },
  logRowVal:  { fontSize: 12, color: P.text, flex: 1 },
  pill:       { backgroundColor: P.tealBg, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  pillText:   { fontSize: 11, color: P.teal, fontWeight: '700' },
  empty:      { alignItems: 'center', paddingTop: 60 },
  emptyText:  { fontSize: 15, color: P.muted },
});
