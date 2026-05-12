/**
 * AuditLogsScreen.js — Admin → Settings → Audit Logs
 * Scope Module 14: Audit Logs
 * - Complete activity log (user actions, data modifications)
 * - Filter by: user, action type, date range, module
 * - Login/logout logs
 * - Export option
 * Store: adminStore.auditLogs (seeded + live)
 */
import React, { useState, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  ScrollView, StatusBar, TextInput, FlatList,
} from 'react-native';
import useAdminStore from '../../../store/adminStore';
import { useAuthStore } from '../../../store/AuthStore';

const P = {
  teal:'#1A7A7A', tealDark:'#0D6E6E', tealSoft:'#E8F5F5',
  bg:'#E8F5F5', surface:'#FFFFFF', text:'#1A2E2E',
  textMuted:'#7A9E9E', textSub:'#3D6E6E', border:'#D0EEEE',
  danger:'#C62828', dangerBg:'#FEE2E2',
  warning:'#E65100', warningBg:'#FEF3C7',
  success:'#2E7D32', successBg:'#E8F5E9',
  blue:'#1D4ED8', blueBg:'#EFF6FF',
};

const MODULES = ['All', 'Auth', 'Residents', 'Billing', 'Maintenance', 'Visitors', 'Amenities', 'Settings', 'Vendors'];
const ACTION_COLORS = {
  'LOGIN':    { bg: P.successBg,  text: P.success  },
  'LOGOUT':   { bg: '#F1F5F9',    text: '#64748B'  },
  'CREATE':   { bg: P.blueBg,     text: P.blue     },
  'UPDATE':   { bg: P.warningBg,  text: P.warning  },
  'DELETE':   { bg: P.dangerBg,   text: P.danger   },
  'APPROVE':  { bg: P.successBg,  text: P.success  },
  'REJECT':   { bg: P.dangerBg,   text: P.danger   },
  'EXPORT':   { bg: '#F3E8FF',    text: '#7C3AED'  },
  'VIEW':     { bg: P.tealSoft,   text: P.teal     },
};

const SEED_LOGS = [
  { id: 'al001', userId: 'admin1', userName: 'Admin User',    action: 'LOGIN',    module: 'Auth',       detail: 'Admin logged in from mobile app',           at: new Date(Date.now() - 10*60000).toISOString() },
  { id: 'al002', userId: 'admin1', userName: 'Admin User',    action: 'APPROVE',  module: 'Residents',  detail: 'Approved resident: Priya Sharma (B-204)',     at: new Date(Date.now() - 25*60000).toISOString() },
  { id: 'al003', userId: 'admin1', userName: 'Admin User',    action: 'CREATE',   module: 'Billing',    detail: 'Generated 45 invoices for May 2025',          at: new Date(Date.now() - 2*3600000).toISOString() },
  { id: 'al004', userId: 'admin1', userName: 'Admin User',    action: 'UPDATE',   module: 'Maintenance',detail: 'Updated maintenance request MNT-012 → Closed', at: new Date(Date.now() - 3*3600000).toISOString() },
  { id: 'al005', userId: 'admin1', userName: 'Admin User',    action: 'DELETE',   module: 'Visitors',   detail: 'Removed visitor log for Arun Delivery',       at: new Date(Date.now() - 5*3600000).toISOString() },
  { id: 'al006', userId: 'sec1',   userName: 'Sam Security',  action: 'LOGIN',    module: 'Auth',       detail: 'Guard logged in',                             at: new Date(Date.now() - 6*3600000).toISOString() },
  { id: 'al007', userId: 'admin1', userName: 'Admin User',    action: 'REJECT',   module: 'Residents',  detail: 'Rejected vendor: Unknown Co. (docs invalid)',  at: new Date(Date.now() - 8*3600000).toISOString() },
  { id: 'al008', userId: 'admin1', userName: 'Admin User',    action: 'UPDATE',   module: 'Settings',   detail: 'Updated society GST rate to 18%',             at: new Date(Date.now() - 24*3600000).toISOString() },
  { id: 'al009', userId: 'admin1', userName: 'Admin User',    action: 'EXPORT',   module: 'Billing',    detail: 'Exported billing report (April 2025)',         at: new Date(Date.now() - 26*3600000).toISOString() },
  { id: 'al010', userId: 'admin1', userName: 'Admin User',    action: 'CREATE',   module: 'Vendors',    detail: 'Added vendor: Clean Pro (Cleaning)',           at: new Date(Date.now() - 48*3600000).toISOString() },
  { id: 'al011', userId: 'res1',   userName: 'John Resident', action: 'LOGIN',    module: 'Auth',       detail: 'Resident logged in',                          at: new Date(Date.now() - 50*3600000).toISOString() },
  { id: 'al012', userId: 'admin1', userName: 'Admin User',    action: 'UPDATE',   module: 'Amenities',  detail: 'Disabled Tennis Court for maintenance',        at: new Date(Date.now() - 72*3600000).toISOString() },
];

function fmt(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('en-IN', { day:'2-digit', month:'short' }) + ' ' +
           d.toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' });
  } catch { return '—'; }
}

function LogRow({ log, last }) {
  const ac = ACTION_COLORS[log.action] || ACTION_COLORS['VIEW'];
  return (
    <View style={[ls.row, !last && ls.border]}>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <View style={[ls.actionBadge, { backgroundColor: ac.bg }]}>
            <Text style={[ls.actionText, { color: ac.text }]}>{log.action}</Text>
          </View>
          <View style={ls.moduleBadge}>
            <Text style={ls.moduleText}>{log.module}</Text>
          </View>
        </View>
        <Text style={ls.detail} numberOfLines={2}>{log.detail}</Text>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
          <Text style={ls.user}>👤 {log.userName}</Text>
          <Text style={ls.time}>🕐 {fmt(log.at)}</Text>
        </View>
      </View>
    </View>
  );
}
const ls = StyleSheet.create({
  row:         { paddingVertical: 12 },
  border:      { borderBottomWidth: 1, borderBottomColor: P.border },
  actionBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  actionText:  { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  moduleBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, backgroundColor: P.tealSoft },
  moduleText:  { fontSize: 10, fontWeight: '700', color: P.teal },
  detail:      { fontSize: 13, color: P.text, fontWeight: '600', lineHeight: 18 },
  user:        { fontSize: 11, color: P.textMuted },
  time:        { fontSize: 11, color: P.textMuted },
});

export default function AuditLogsScreen({ navigation }) {
  const storedLogs = useAdminStore(st => st.auditLogs);
  const allLogs = (storedLogs && storedLogs.length > 0) ? [...storedLogs, ...SEED_LOGS] : SEED_LOGS;
  // Sort newest first
  const sorted = [...allLogs].sort((a, b) => new Date(b.at) - new Date(a.at));

  const [search,    setSearch]    = useState('');
  const [moduleTab, setModuleTab] = useState('All');
  const [actionFilter, setActionFilter] = useState('All');

  const actions = ['All', ...Object.keys(ACTION_COLORS)];

  const filtered = useMemo(() => {
    return sorted.filter(log => {
      const matchMod    = moduleTab === 'All'     || log.module === moduleTab;
      const matchAction = actionFilter === 'All'  || log.action === actionFilter;
      const matchSearch = !search
        || log.detail.toLowerCase().includes(search.toLowerCase())
        || log.userName.toLowerCase().includes(search.toLowerCase());
      return matchMod && matchAction && matchSearch;
    });
  }, [sorted, moduleTab, actionFilter, search]);

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#1A7A7A" />
            <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>📋 Audit Logs</Text>
        <Text style={s.headerSub}>All admin actions & activity</Text>
      </View>

      {/* Search */}
      <View style={s.searchWrap}>
        <TextInput style={s.searchInput} value={search} onChangeText={setSearch}
          placeholder="Search logs…" placeholderTextColor={P.textMuted} />
      </View>

      {/* Module filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}
        style={s.tabScroll} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
        {MODULES.map(m => (
          <TouchableOpacity key={m}
            style={[s.chip, moduleTab === m && s.chipActive]}
            onPress={() => setModuleTab(m)}>
            <Text style={[s.chipText, moduleTab === m && { color: '#FFF' }]}>{m}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Action filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}
        style={[s.tabScroll, { marginTop: 0 }]} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
        {actions.map(a => {
          const ac = ACTION_COLORS[a];
          return (
            <TouchableOpacity key={a}
              style={[s.chip, actionFilter === a && { backgroundColor: ac?.bg || P.tealSoft, borderColor: ac?.text || P.teal }]}
              onPress={() => setActionFilter(a)}>
              <Text style={[s.chipText, actionFilter === a && { color: ac?.text || P.teal }]}>{a}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Logs */}
      <FlatList
        data={filtered}
        keyExtractor={l => l.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item, index }) => <LogRow log={item} last={index === filtered.length - 1} />}
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={{ fontSize: 32, marginBottom: 8 }}>📋</Text>
            <Text style={s.emptyText}>No logs found</Text>
          </View>
        }
        getItemLayout={(_, index) => ({ length: 80, offset: 80 * index, index })}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: P.tealDark },
  header:     { flexDirection: 'row', alignItems: 'center', backgroundColor: P.tealDark, padding: 16, paddingTop: 8 },
  back:       { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  backTxt:    { color: '#FFF', fontSize: 28, fontWeight: '300', lineHeight: 32 },
  htitle:     { color: '#FFF', fontSize: 17, fontWeight: '800' },
  hsub:       { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 2 },
  searchWrap: { backgroundColor: P.bg, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 },
  searchInput:{ backgroundColor: P.surface, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14, color: P.text, borderWidth: 1, borderColor: P.border },
  tabScroll:  { backgroundColor: P.bg, paddingVertical: 8, maxHeight: 52 },
  chip:       { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5, borderColor: P.border, backgroundColor: P.surface },
  chipActive: { backgroundColor: P.teal, borderColor: P.teal },
  chipText:   { fontSize: 12, fontWeight: '600', color: P.textMuted },
  empty:      { alignItems: 'center', paddingTop: 60 },
  emptyText:  { fontSize: 15, color: P.textMuted, fontWeight: '600' },
  header:      { backgroundColor: '#1A7A7A', paddingTop: 40, paddingBottom: 16, paddingHorizontal: 20 },
  backText:    { color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: '600', marginBottom: 8 },
  headerTitle: { fontSize: 22, fontWeight: '900', color: '#FFF', marginBottom: 2 },
  headerSub:   { fontSize: 12, color: 'rgba(255,255,255,0.72)', marginTop: 1 },
});
