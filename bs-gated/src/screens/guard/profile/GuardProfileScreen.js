/**
 * GuardProfileScreen.js — Guard
 *
 * Shows: guard info, current shift status, today's stats,
 * verification status, quick links to shift handover/incidents/patrol,
 * attendance summary, and logout.
 */

import React, { useMemo } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  StatusBar, ScrollView, Alert, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore }     from '../../../store/AuthStore';
import { useSecurityStore } from '../../../store/securityStore';
import PendingVerificationBanner from '../../../components/common/PendingVerificationBanner';

const P = {
  navy: '#1A7A7A', navyDark: '#0D6E6E', bg: '#E8F5F5',
  surface: '#FFF', text: '#1E293B', sub: '#64748B', muted: '#94A3B8',
  border: '#E2E8F0', teal: '#1A7A7A', tealBg: '#E8F5F5',
  success: '#16A34A', successBg: '#DCFCE7',
  warning: '#D97706', warningBg: '#FEF3C7',
  danger: '#DC2626', dangerBg: '#FEE2E2',
};

function VerifyCard({ navigation }) {
  const verificationStatus = useAuthStore(s => {
    const live = s.registeredUsers?.find(u => u.id === s.user?.id);
    return live?.verificationStatus || s.user?.verificationStatus || 'not_submitted';
  });
  if (verificationStatus === 'approved') return (
    <View style={vc.row}>
      <Text style={{ fontSize: 24 }}>✅</Text>
      <View style={{ flex: 1 }}>
        <Text style={vc.title}>Verified & Approved</Text>
        <Text style={vc.sub}>All features unlocked</Text>
      </View>
    </View>
  );
  const isPending = ['pending','pending_approval'].includes(verificationStatus);
  if (isPending) return (
    <View style={[vc.row, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}>
      <Text style={{ fontSize: 24 }}>⏳</Text>
      <View style={{ flex: 1 }}>
        <Text style={[vc.title, { color: '#1D4ED8' }]}>Under Review</Text>
        <Text style={vc.sub}>Admin is reviewing your documents</Text>
      </View>
    </View>
  );
  return (
    <TouchableOpacity style={[vc.row, { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }]}
      onPress={() => navigation.navigate('Verification')} activeOpacity={0.85}>
      <Text style={{ fontSize: 24 }}>📋</Text>
      <View style={{ flex: 1 }}>
        <Text style={[vc.title, { color: '#92400E' }]}>Verify Your Account</Text>
        <Text style={vc.sub}>Upload documents to get approved</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#92400E" />
    </TouchableOpacity>
  );
}
const vc = StyleSheet.create({
  row:   { flexDirection:'row', alignItems:'center', gap:14, backgroundColor: P.successBg, borderColor: P.success, borderWidth:1.5, borderRadius:14, padding:14, marginBottom:4 },
  title: { fontSize:14, fontWeight:'800', color: P.success },
  sub:   { fontSize:12, color: P.muted, marginTop:2 },
});

const MENU_SECTIONS = [
  {
    title: '🛡️ Duty',
    items: [
      { emoji: '🔄', label: 'Shift Handover',     sub: 'Submit end-of-shift report',    screen: 'ShiftHandover'    },
      { emoji: '⚠️', label: 'Security Incidents',  sub: 'Report & manage incidents',     screen: 'SecurityIncident' },
      { emoji: '🚶', label: 'Patrol Log',          sub: 'Start or view patrol rounds',   screen: 'PatrolLog'        },
    ],
  },
  {
    title: '📋 My Account',
    items: [
      { emoji: '🪪', label: 'Profile Verification', sub: 'Upload required documents',    screen: 'Verification'     },
      { emoji: '🔔', label: 'Notifications',         sub: 'View all alerts',              screen: 'GuardNotifications'},
      { emoji: '❓', label: 'Help & Support',        sub: 'FAQs and contact',             screen: null               },
    ],
  },
];


// ─── Guard Tab Bar ─────────────────────────────────────────────────────────────
function GuardTabBar({ active, navigation }) {
  const TABS = [
    { key: 'GuardDashboard',      icon: 'home',          label: 'Home'    },
    { key: 'EntryLogs',           icon: 'list',          label: 'Logs'    },
    { key: 'GuardNotifications',  icon: 'notifications', label: 'Alerts'  },
    { key: 'GuardProfile',        icon: 'person',        label: 'Profile' },
  ];
  return (
    <View style={gtb.bar}>
      {TABS.map(t => {
        const isActive = active === t.key;
        return (
          <TouchableOpacity key={t.key} style={gtb.tab}
            onPress={() => t.key !== active && navigation.navigate(t.key)}
            activeOpacity={0.7}>
            <Ionicons name={isActive ? t.icon : `${t.icon}-outline`} size={24}
              color={isActive ? '#1A7A7A' : '#94A3B8'} />
            <Text style={[gtb.label, isActive && gtb.labelActive]}>{t.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
const gtb = StyleSheet.create({
  bar:         { flexDirection: 'row', backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#D0EEEE', paddingBottom: 8, paddingTop: 8 },
  tab:         { flex: 1, alignItems: 'center', gap: 3 },
  label:       { fontSize: 10, fontWeight: '600', color: '#94A3B8' },
  labelActive: { color: '#1A7A7A', fontWeight: '800' },
});

export default function GuardProfileScreen({ navigation }) {
  const user   = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);

  const visitors   = useSecurityStore(s => s.visitors   || []);
  const deliveries = useSecurityStore(s => s.deliveries || []);
  const incidents  = useSecurityStore(s => s.incidents  || []);
  const handoverLogs = useSecurityStore(s => s.handoverLogs || []);
  const patrolLogs = useSecurityStore(s => s.patrolLogs  || []);
  const guardShifts = useSecurityStore(s => s.guardShifts || []);

  const todayStart = useMemo(() => { const d = new Date(); d.setHours(0,0,0,0); return d; }, []);
  const todayVisitors   = visitors.filter(v => new Date(v.checkIn || 0) >= todayStart).length;
  const todayDeliveries = deliveries.filter(d => new Date(d.createdAt || 0) >= todayStart).length;
  const openIncidents   = incidents.filter(i => i.status === 'open').length;
  const todayPatrols    = patrolLogs.filter(p => new Date(p.startedAt || 0) >= todayStart).length;

  const myShift = guardShifts.find(gs => gs.guardId === user?.id && gs.status === 'active');
  const myHandovers = handoverLogs.filter(l => l.guardId === user?.id || l.outgoingGuard === user?.name);

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      const confirmLogout = window.confirm('Are you sure you want to logout? (Note: Submit a shift handover if needed)');
      if (confirmLogout) logout();
      return;
    }

    Alert.alert('End Shift & Logout', 'Submit a shift handover before logging out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Skip & Logout', style: 'destructive', onPress: logout },
      { text: 'Do Handover First', onPress: () => navigation.navigate('ShiftHandover') },
    ]);
  };

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={P.navyDark} />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#FFF" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle}>My Profile</Text>
          <Text style={s.headerSub}>Guard · {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' })}</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('GuardNotifications')} style={s.notifBtn}>
          <Ionicons name="notifications-outline" size={22} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Verification */}
        <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
          <VerifyCard navigation={navigation} />
        </View>

        {/* Profile Card */}
        <View style={s.profileCard}>
          <View style={s.avatar}>
            <Text style={s.avatarText}>{(user?.name || 'G').charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={s.userName}>{user?.name || 'Guard'}</Text>
          <View style={[s.rolePill, myShift ? { backgroundColor: P.successBg, borderColor: P.success } : {}]}>
            <Text style={[s.rolePillText, myShift ? { color: P.success } : {}]}>
              {myShift ? `🟢 On Shift · ${myShift.gate}` : '⚪ Off Shift'}
            </Text>
          </View>
          <Text style={s.userPhone}>{user?.phone ? `📞 +91 ${user.phone}` : '—'}</Text>
        </View>

        {/* Today's Stats */}
        <View style={s.statsSection}>
          <Text style={s.sectionTitle}>Today's Activity</Text>
          <View style={s.statsRow}>
            {[
              { label: 'Visitors',   val: todayVisitors,   icon: '👤', color: P.teal    },
              { label: 'Deliveries', val: todayDeliveries, icon: '📦', color: '#1D4ED8' },
              { label: 'Incidents',  val: openIncidents,   icon: '⚠️', color: P.warning },
              { label: 'Patrols',    val: todayPatrols,    icon: '🚶', color: P.success },
            ].map(st => (
              <TouchableOpacity key={st.label} style={[s.statCard, { borderColor: st.color + '30' }]}
                onPress={() => {
                  if (st.label === 'Incidents') navigation.navigate('SecurityIncident');
                  if (st.label === 'Patrols')   navigation.navigate('PatrolLog');
                }} activeOpacity={0.85}>
                <Text style={{ fontSize: 22 }}>{st.icon}</Text>
                <Text style={[s.statVal, { color: st.color }]}>{st.val}</Text>
                <Text style={s.statLabel}>{st.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Handover Summary */}
        <View style={s.infoCard}>
          <Text style={s.sectionTitle}>📋 My Shift Handovers</Text>
          {myHandovers.length === 0 ? (
            <Text style={s.noDataText}>No handovers submitted yet this month.</Text>
          ) : (
            myHandovers.slice(0, 3).map(log => (
              <View key={log.id} style={s.logRow}>
                <View style={{ flex: 1 }}>
                  <Text style={s.logText}>{log.outgoingGuard} → {log.incomingGuard}</Text>
                  <Text style={s.logSub}>{log.gate || 'Main Gate'} · {log.shiftType || log.shiftTime || 'Shift'}</Text>
                </View>
                <Text style={s.logTime}>
                  {new Date(log.submittedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                </Text>
              </View>
            ))
          )}
          <TouchableOpacity style={s.viewAllBtn} onPress={() => navigation.navigate('ShiftHandover')}>
            <Text style={s.viewAllText}>View All Handovers →</Text>
          </TouchableOpacity>
        </View>

        {/* Menu Sections */}
        {MENU_SECTIONS.map(section => (
          <View key={section.title} style={s.menuSection}>
            <Text style={s.menuSectionTitle}>{section.title}</Text>
            <View style={s.menuCard}>
              {section.items.map((item, i) => (
                <TouchableOpacity
                  key={i}
                  style={[s.menuRow, i < section.items.length - 1 && s.menuBorder]}
                  onPress={() => item.screen
                    ? navigation.navigate(item.screen)
                    : Alert.alert(item.label, 'Coming soon')}
                  activeOpacity={0.8}
                >
                  <Text style={s.menuEmoji}>{item.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={s.menuLabel}>{item.label}</Text>
                    <Text style={s.menuSub}>{item.sub}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={P.muted} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={P.danger} />
          <Text style={s.logoutText}>End Shift & Logout</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
      <GuardTabBar active="GuardProfile" navigation={navigation} />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root:        { flex: 1, backgroundColor: P.bg },
  header:      { backgroundColor: P.navyDark, paddingTop: 16, paddingBottom: 20, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 14 },
  backBtn:     { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '900' },
  headerSub:   { color: 'rgba(255,255,255,0.65)', fontSize: 12, marginTop: 2 },
  notifBtn:    { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', marginLeft: 'auto' },
  profileCard: { backgroundColor: P.surface, margin: 16, borderRadius: 18, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: P.border, elevation: 2 },
  avatar:      { width: 76, height: 76, borderRadius: 38, backgroundColor: P.navy, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText:  { fontSize: 30, fontWeight: '900', color: '#FFF' },
  userName:    { fontSize: 20, fontWeight: '900', color: P.text, marginBottom: 8 },
  rolePill:    { backgroundColor: P.bg, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1, borderColor: P.border, marginBottom: 8 },
  rolePillText:{ fontSize: 13, fontWeight: '700', color: P.sub },
  userPhone:   { fontSize: 13, color: P.muted },
  statsSection:{ paddingHorizontal: 16, marginBottom: 8 },
  sectionTitle:{ fontSize: 15, fontWeight: '800', color: P.text, marginBottom: 12 },
  statsRow:    { flexDirection: 'row', gap: 10 },
  statCard:    { flex: 1, backgroundColor: P.surface, borderRadius: 14, padding: 12, alignItems: 'center', borderWidth: 1, gap: 4, elevation: 1 },
  statVal:     { fontSize: 22, fontWeight: '900' },
  statLabel:   { fontSize: 9, fontWeight: '700', color: P.muted, textAlign: 'center' },
  infoCard:    { backgroundColor: P.surface, marginHorizontal: 16, marginBottom: 16, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: P.border },
  noDataText:  { fontSize: 13, color: P.muted, fontStyle: 'italic' },
  logRow:      { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: P.border },
  logText:     { fontSize: 13, fontWeight: '700', color: P.text },
  logSub:      { fontSize: 11, color: P.muted, marginTop: 2 },
  logTime:     { fontSize: 11, color: P.muted },
  viewAllBtn:  { marginTop: 10, alignItems: 'flex-end' },
  viewAllText: { fontSize: 13, color: P.teal, fontWeight: '700' },
  menuSection: { paddingHorizontal: 16, marginBottom: 12 },
  menuSectionTitle:{ fontSize: 12, fontWeight: '800', color: P.muted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.8 },
  menuCard:    { backgroundColor: P.surface, borderRadius: 16, borderWidth: 1, borderColor: P.border, overflow: 'hidden' },
  menuRow:     { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14 },
  menuBorder:  { borderBottomWidth: 1, borderBottomColor: P.border },
  menuEmoji:   { fontSize: 22, width: 32, textAlign: 'center' },
  menuLabel:   { fontSize: 14, fontWeight: '700', color: P.text },
  menuSub:     { fontSize: 12, color: P.muted, marginTop: 2 },
  logoutBtn:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginHorizontal: 16, marginTop: 8, backgroundColor: P.dangerBg, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: P.danger + '40' },
  logoutText:  { fontSize: 15, fontWeight: '800', color: P.danger },
});