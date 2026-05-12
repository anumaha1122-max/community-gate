/**
 * PatrolLogScreen.js — Guard
 *
 * Real workflow:
 * Guard starts a patrol → taps each checkpoint as reached → completes patrol
 * All logs visible to admin. History shows past patrol rounds with duration.
 *
 * Store: securityStore.patrolLogs
 */

import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, SafeAreaView, StatusBar, FlatList, TextInput,
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
};

const PATROL_ROUTES = [
  {
    name: 'Full Society Patrol',
    checkpoints: ['Main Gate', 'Block A Lobby', 'Block B Lobby', 'Block C Lobby', 'Basement Parking', 'Terrace', 'Back Gate'],
  },
  {
    name: 'Perimeter Check',
    checkpoints: ['Main Gate', 'Side Gate', 'Back Gate', 'Boundary Wall North', 'Boundary Wall South'],
  },
  {
    name: 'Night Security Round',
    checkpoints: ['Main Gate', 'Parking Area', 'Generator Room', 'Pump Room', 'Block A Lobby', 'Block B Lobby'],
  },
  {
    name: 'Quick Gate Check',
    checkpoints: ['Main Gate', 'Side Gate', 'Back Gate'],
  },
];

function fmt(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-IN', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit', hour12:true });
}

function duration(startIso, endIso) {
  if (!startIso) return '—';
  const end = endIso ? new Date(endIso) : new Date();
  const mins = Math.round((end - new Date(startIso)) / 60000);
  if (mins < 60) return `${mins} min`;
  return `${Math.floor(mins/60)}h ${mins%60}m`;
}

export default function PatrolLogScreen({ navigation }) {
  const user           = useAuthStore(s => s.user);
  const patrolLogs     = useSecurityStore(s => s.patrolLogs      || []);
  const addPatrolLog   = useSecurityStore(s => s.addPatrolLog);
  const completePatrol = useSecurityStore(s => s.completePatrol);
  const checkPatrolPoint = useSecurityStore(s => s.checkPatrolPoint);

  const [tab, setTab] = useState('active'); // active | history | start
  const [remarks, setRemarks] = useState('');

  const myActivePatrol = patrolLogs.find(p =>
    p.guardId === (user?.id || 'g1') && p.status === 'in_progress'
  );

  const completedPatrols = patrolLogs.filter(p => p.status === 'completed')
    .sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt));

  const handleStartPatrol = (route) => {
    if (myActivePatrol) {
      Alert.alert('Active Patrol', 'You already have an active patrol in progress. Complete it first.');
      return;
    }
    Alert.alert(
      'Start Patrol',
      `Start "${route.name}"?\n\n${route.checkpoints.length} checkpoints to cover.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start',
          onPress: () => {
            addPatrolLog({
              guardId: user?.id || 'g1',
              guardName: user?.name || 'Guard',
              gate: 'Main Gate',
              route: route.name,
              checkpoints: route.checkpoints.map(name => ({ name, checkedAt: null, ok: false })),
              remarks: '',
            });
            setTab('active');
          },
        },
      ]
    );
  };

  const handleCheckpoint = (checkpoint) => {
    if (!myActivePatrol || checkpoint.ok) return;
    Alert.alert(
      'Check Checkpoint',
      `Mark "${checkpoint.name}" as visited?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Mark Visited', onPress: () => checkPatrolPoint(myActivePatrol.id, checkpoint.name) },
      ]
    );
  };

  const handleComplete = () => {
    if (!myActivePatrol) return;
    const allDone = myActivePatrol.checkpoints.every(c => c.ok);
    if (!allDone) {
      const missed = myActivePatrol.checkpoints.filter(c => !c.ok).map(c => c.name).join(', ');
      Alert.alert(
        'Incomplete Patrol',
        `These checkpoints are not checked: ${missed}\n\nComplete them or finish with remarks?`,
        [
          { text: 'Continue Patrol', style: 'cancel' },
          { text: 'Finish Anyway', onPress: () => finishPatrol() },
        ]
      );
      return;
    }
    finishPatrol();
  };

  const finishPatrol = () => {
    completePatrol(myActivePatrol.id, remarks || 'Patrol completed — all clear.');
    setRemarks('');
    setTab('history');
    Alert.alert('✅ Patrol Completed', 'Patrol log saved successfully.');
  };

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={P.navyDark} />

      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#FFF" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle}>Patrol Log</Text>
          <Text style={s.headerSub}>{completedPatrols.length} completed today</Text>
        </View>
        {!myActivePatrol && (
          <TouchableOpacity style={s.startBtn} onPress={() => setTab('start')}>
            <Ionicons name="add" size={20} color="#FFF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Tabs */}
      <View style={s.tabRow}>
        {[
          ['active',  myActivePatrol ? '🟢 Active Patrol' : 'Active'],
          ['history', `History (${completedPatrols.length})`],
          ['start',   '+ New Patrol'],
        ].map(([k, l]) => (
          <TouchableOpacity key={k} style={[s.tab, tab===k && s.tabActive]} onPress={() => setTab(k)}>
            <Text style={[s.tabText, tab===k && s.tabTextActive]}>{l}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Active Patrol */}
      {tab === 'active' && (
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          {!myActivePatrol ? (
            <View style={s.empty}>
              <Text style={{ fontSize: 48, marginBottom: 12 }}>🚶</Text>
              <Text style={s.emptyTitle}>No active patrol</Text>
              <Text style={s.emptyText}>Start a new patrol from the "+ New Patrol" tab.</Text>
              <TouchableOpacity style={s.bigBtn} onPress={() => setTab('start')}>
                <Ionicons name="walk-outline" size={20} color="#FFF" />
                <Text style={s.bigBtnText}>Start Patrol Round</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={s.card}>
              <View style={s.activeHeader}>
                <View style={s.activePulse} />
                <View style={{ flex: 1 }}>
                  <Text style={s.activeRoute}>{myActivePatrol.route}</Text>
                  <Text style={s.activeTime}>Started {fmt(myActivePatrol.startedAt)} · {duration(myActivePatrol.startedAt, null)} elapsed</Text>
                </View>
              </View>

              {/* Progress */}
              <View style={s.progressRow}>
                <View style={s.progressBarBg}>
                  <View style={[s.progressBarFill, {
                    width: `${(myActivePatrol.checkpoints.filter(c=>c.ok).length / myActivePatrol.checkpoints.length) * 100}%`
                  }]} />
                </View>
                <Text style={s.progressText}>
                  {myActivePatrol.checkpoints.filter(c=>c.ok).length}/{myActivePatrol.checkpoints.length} done
                </Text>
              </View>

              {/* Checkpoints */}
              <Text style={s.cpTitle}>Checkpoints</Text>
              {myActivePatrol.checkpoints.map((cp, i) => (
                <TouchableOpacity
                  key={cp.name}
                  style={[s.cpRow, cp.ok && s.cpRowDone]}
                  onPress={() => handleCheckpoint(cp)}
                  activeOpacity={cp.ok ? 1 : 0.85}
                >
                  <View style={[s.cpDot, cp.ok && s.cpDotDone]}>
                    {cp.ok
                      ? <Ionicons name="checkmark" size={14} color="#FFF" />
                      : <Text style={s.cpNum}>{i + 1}</Text>}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.cpName, cp.ok && s.cpNameDone]}>{cp.name}</Text>
                    {cp.ok && <Text style={s.cpTime}>{fmt(cp.checkedAt)}</Text>}
                  </View>
                  {!cp.ok && (
                    <View style={s.tapBtn}>
                      <Text style={s.tapBtnText}>Tap to check</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}

              <Text style={s.fieldLabel}>Final Remarks</Text>
              <TextInput
                style={[s.input, { height: 70, textAlignVertical: 'top' }]}
                value={remarks} onChangeText={setRemarks}
                placeholder="e.g. All clear. Camera 3 flickering — reported." placeholderTextColor={P.muted} multiline
              />

              <TouchableOpacity style={s.completeBtn} onPress={handleComplete} activeOpacity={0.85}>
                <Ionicons name="flag-outline" size={18} color="#FFF" />
                <Text style={s.completeBtnText}>Complete Patrol</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      )}

      {/* History */}
      {tab === 'history' && (
        <FlatList
          data={completedPatrols}
          keyExtractor={p => p.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          ListEmptyComponent={
            <View style={s.empty}>
              <Text style={{ fontSize: 48, marginBottom: 12 }}>📋</Text>
              <Text style={s.emptyTitle}>No patrol history</Text>
              <Text style={s.emptyText}>Completed patrols appear here.</Text>
            </View>
          }
          renderItem={({ item: p }) => {
            const done = p.checkpoints?.filter(c => c.ok).length || 0;
            const total = p.checkpoints?.length || 0;
            const pct = total > 0 ? Math.round((done/total)*100) : 100;
            return (
              <View style={s.histCard}>
                <View style={s.histTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.histRoute}>{p.route}</Text>
                    <Text style={s.histGuard}>by {p.guardName}</Text>
                  </View>
                  <View style={[s.pctBadge, { backgroundColor: pct === 100 ? P.successBg : P.warningBg }]}>
                    <Text style={[s.pctText, { color: pct === 100 ? P.success : P.warning }]}>{pct}%</Text>
                  </View>
                </View>
                <View style={s.histMeta}>
                  <Text style={s.histMetaText}>🕐 {fmt(p.startedAt)} → {fmt(p.completedAt)}</Text>
                  <Text style={s.histMetaText}>⏱️ {duration(p.startedAt, p.completedAt)}</Text>
                  <Text style={s.histMetaText}>✅ {done}/{total} checkpoints</Text>
                </View>
                {p.remarks ? (
                  <View style={s.histRemarks}>
                    <Text style={s.histRemarksText}>"{p.remarks}"</Text>
                  </View>
                ) : null}
              </View>
            );
          }}
        />
      )}

      {/* Start new patrol */}
      {tab === 'start' && (
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          {myActivePatrol && (
            <View style={s.warnBanner}>
              <Ionicons name="warning-outline" size={16} color={P.warning} />
              <Text style={s.warnText}>You have an active patrol. Complete it before starting a new one.</Text>
            </View>
          )}
          <Text style={s.sectionTitle}>Select Patrol Route</Text>
          {PATROL_ROUTES.map(route => (
            <TouchableOpacity
              key={route.name}
              style={[s.routeCard, myActivePatrol && s.routeCardDisabled]}
              onPress={() => !myActivePatrol && handleStartPatrol(route)}
              activeOpacity={myActivePatrol ? 1 : 0.85}
            >
              <View style={s.routeTop}>
                <Text style={s.routeName}>{route.name}</Text>
                <View style={s.cpCountBadge}>
                  <Text style={s.cpCountText}>{route.checkpoints.length} stops</Text>
                </View>
              </View>
              <View style={s.routeCheckpoints}>
                {route.checkpoints.map((cp, i) => (
                  <View key={cp} style={s.cpPill}>
                    <Text style={s.cpPillText}>{i + 1}. {cp}</Text>
                  </View>
                ))}
              </View>
              {!myActivePatrol && (
                <View style={s.startRouteBtn}>
                  <Ionicons name="walk-outline" size={16} color="#FFF" />
                  <Text style={s.startRouteBtnText}>Start This Route</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
          <View style={{ height: 30 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root:        { flex: 1, backgroundColor: P.bg },
  header:      { backgroundColor: P.navyDark, paddingTop: 16, paddingBottom: 20, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 14 },
  backBtn:     { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '900' },
  headerSub:   { color: 'rgba(255,255,255,0.65)', fontSize: 12, marginTop: 2 },
  startBtn:    { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginLeft: 'auto' },
  tabRow:      { flexDirection: 'row', backgroundColor: P.surface, borderBottomWidth: 1, borderBottomColor: P.border },
  tab:         { flex: 1, paddingVertical: 13, alignItems: 'center' },
  tabActive:   { borderBottomWidth: 3, borderBottomColor: P.navy },
  tabText:     { fontSize: 11, fontWeight: '600', color: P.muted },
  tabTextActive:{ color: P.navy, fontWeight: '800' },
  scroll:      { padding: 16 },
  card:        { backgroundColor: P.surface, borderRadius: 18, padding: 18, borderWidth: 1, borderColor: P.border, elevation: 2 },
  activeHeader:{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16 },
  activePulse: { width: 14, height: 14, borderRadius: 7, backgroundColor: P.success },
  activeRoute: { fontSize: 16, fontWeight: '800', color: P.text },
  activeTime:  { fontSize: 12, color: P.muted, marginTop: 2 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 18 },
  progressBarBg:{ flex: 1, height: 8, backgroundColor: P.border, borderRadius: 4, overflow: 'hidden' },
  progressBarFill:{ height: 8, backgroundColor: P.teal, borderRadius: 4 },
  progressText:{ fontSize: 12, color: P.sub, fontWeight: '700', width: 55 },
  cpTitle:     { fontSize: 14, fontWeight: '800', color: P.text, marginBottom: 12 },
  cpRow:       { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: P.border },
  cpRowDone:   { opacity: 0.7 },
  cpDot:       { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: P.border },
  cpDotDone:   { backgroundColor: P.teal, borderColor: P.teal },
  cpNum:       { fontSize: 13, fontWeight: '800', color: P.muted },
  cpName:      { fontSize: 14, fontWeight: '700', color: P.text },
  cpNameDone:  { color: P.teal },
  cpTime:      { fontSize: 11, color: P.muted, marginTop: 2 },
  tapBtn:      { backgroundColor: P.tealBg, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5 },
  tapBtnText:  { fontSize: 11, color: P.teal, fontWeight: '700' },
  fieldLabel:  { fontSize: 12, fontWeight: '700', color: P.sub, marginBottom: 6, marginTop: 16 },
  input:       { backgroundColor: P.bg, borderWidth: 1.5, borderColor: P.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14, color: P.text },
  completeBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: P.navy, borderRadius: 14, paddingVertical: 15, marginTop: 16 },
  completeBtnText:{ color: '#FFF', fontSize: 15, fontWeight: '800' },
  histCard:    { backgroundColor: P.surface, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: P.border, elevation: 1 },
  histTop:     { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  histRoute:   { fontSize: 15, fontWeight: '800', color: P.text },
  histGuard:   { fontSize: 12, color: P.muted, marginTop: 2 },
  pctBadge:    { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  pctText:     { fontSize: 12, fontWeight: '800' },
  histMeta:    { gap: 4, marginBottom: 8 },
  histMetaText:{ fontSize: 12, color: P.sub },
  histRemarks: { backgroundColor: P.bg, borderRadius: 10, padding: 10, borderLeftWidth: 3, borderLeftColor: P.teal },
  histRemarksText:{ fontSize: 12, color: P.sub, fontStyle: 'italic' },
  sectionTitle:{ fontSize: 16, fontWeight: '800', color: P.text, marginBottom: 14 },
  routeCard:   { backgroundColor: P.surface, borderRadius: 18, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: P.border, elevation: 2 },
  routeCardDisabled:{ opacity: 0.5 },
  routeTop:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  routeName:   { fontSize: 16, fontWeight: '800', color: P.text },
  cpCountBadge:{ backgroundColor: P.tealBg, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  cpCountText: { fontSize: 12, color: P.teal, fontWeight: '700' },
  routeCheckpoints:{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 14 },
  cpPill:      { backgroundColor: P.bg, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: P.border },
  cpPillText:  { fontSize: 11, color: P.sub },
  startRouteBtn:{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: P.navy, borderRadius: 12, paddingVertical: 12 },
  startRouteBtnText:{ color: '#FFF', fontSize: 14, fontWeight: '800' },
  warnBanner:  { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: P.warningBg, borderRadius: 12, padding: 12, marginBottom: 16, borderLeftWidth: 3, borderLeftColor: P.warning },
  warnText:    { fontSize: 13, color: '#92400E', fontWeight: '600', flex: 1 },
  bigBtn:      { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: P.navy, borderRadius: 14, paddingHorizontal: 24, paddingVertical: 14, marginTop: 20 },
  bigBtnText:  { color: '#FFF', fontSize: 15, fontWeight: '800' },
  empty:       { alignItems: 'center', paddingTop: 60, paddingHorizontal: 30 },
  emptyTitle:  { fontSize: 17, fontWeight: '800', color: P.text, marginBottom: 8 },
  emptyText:   { fontSize: 13, color: P.muted, textAlign: 'center', lineHeight: 20 },
});
