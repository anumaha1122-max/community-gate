/**
 * ModuleToggleScreen.js — Admin → Settings → Module Toggles
 * Scope Module 14: Module Toggles
 * - Enable/disable app features per module
 * - Access control per module
 * - Beta feature flags
 * Store: adminStore.moduleToggles + updateModuleToggle()
 */
import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  ScrollView, StatusBar, Alert, Switch,
} from 'react-native';
import useAdminStore from '../../../store/adminStore';

const P = {
  teal:'#1A7A7A', tealDark:'#0D6E6E', tealSoft:'#E8F5F5',
  bg:'#E8F5F5', surface:'#FFFFFF', text:'#1A2E2E',
  textMuted:'#7A9E9E', textSub:'#3D6E6E', border:'#D0EEEE',
  warning:'#E65100', warningBg:'#FEF3C7',
  success:'#2E7D32',
};

const MODULE_GROUPS = [
  {
    group: '🔒 Security & Access',
    modules: [
      { key: 'visitor_management',   label: 'Visitor Management',    sub: 'Pre-approvals, gate passes, QR entry',  beta: false, critical: true  },
      { key: 'blacklist',            label: 'Blacklist System',       sub: 'Block unauthorized persons at gate',    beta: false, critical: false },
      { key: 'biometric',            label: 'Biometric Access',       sub: 'Fingerprint/face recognition at gates', beta: true,  critical: false },
      { key: 'sos',                  label: 'SOS Emergency System',   sub: 'One-tap emergency alerts',              beta: false, critical: true  },
    ],
  },
  {
    group: '🏠 Resident Features',
    modules: [
      { key: 'maintenance',          label: 'Maintenance Requests',   sub: 'Residents can raise maintenance tickets', beta: false, critical: false },
      { key: 'amenity_booking',      label: 'Amenity Booking',        sub: 'Pool, gym, clubhouse reservations',       beta: false, critical: false },
      { key: 'ev_charging',          label: 'EV Charging Slots',      sub: 'Electric vehicle slot booking',           beta: false, critical: false },
      { key: 'notice_board',         label: 'Notice Board',           sub: 'Society announcements & notices',         beta: false, critical: false },
      { key: 'gps_tracking',         label: 'GPS Tracking',           sub: 'Child & helper location tracking',        beta: true,  critical: false },
    ],
  },
  {
    group: '💰 Finance & Billing',
    modules: [
      { key: 'billing',              label: 'Billing & Invoices',     sub: 'Monthly maintenance invoicing',           beta: false, critical: true  },
      { key: 'online_payment',       label: 'Online Payments',        sub: 'UPI, cards, net banking',                 beta: false, critical: false },
      { key: 'expense_management',   label: 'Expense Management',     sub: 'Track society expenses',                  beta: false, critical: false },
    ],
  },
  {
    group: '🛒 Marketplace',
    modules: [
      { key: 'e_commerce',           label: 'E-Commerce Shop',        sub: 'Grocery & essentials delivery',           beta: false, critical: false },
      { key: 'p2p_marketplace',      label: 'P2P Buy/Sell',           sub: 'Resident-to-resident listings',           beta: false, critical: false },
      { key: 'real_estate',          label: 'Real Estate Listings',   sub: 'Buy/sell/rent property listings',         beta: false, critical: false },
    ],
  },
  {
    group: '🔔 Communication',
    modules: [
      { key: 'push_notifications',   label: 'Push Notifications',     sub: 'In-app alerts for all roles',             beta: false, critical: true  },
      { key: 'sms_notifications',    label: 'SMS Notifications',      sub: 'Transactional SMS to residents',          beta: false, critical: false },
      { key: 'whatsapp',             label: 'WhatsApp Alerts',        sub: 'WhatsApp Business API integration',       beta: true,  critical: false },
      { key: 'event_management',     label: 'Event Management',       sub: 'Society events, RSVP tracking',           beta: false, critical: false },
    ],
  },
  {
    group: '📊 Analytics & Reports',
    modules: [
      { key: 'reports',              label: 'Reports & Analytics',    sub: 'Financial, security, maintenance reports',beta: false, critical: false },
      { key: 'audit_trail',          label: 'Audit Trail',            sub: 'Log all admin actions',                   beta: false, critical: false },
    ],
  },
];

const DEFAULTS = MODULE_GROUPS.flatMap(g => g.modules).reduce((acc, m) => {
  acc[m.key] = !m.beta; // beta modules default OFF, rest default ON
  return acc;
}, {});

function ToggleRow({ label, sub, value, onChange, beta, critical, last }) {
  return (
    <View style={[tr.row, !last && tr.border]}>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={tr.label}>{label}</Text>
          {beta     && <View style={tr.betaBadge}><Text style={tr.betaText}>BETA</Text></View>}
          {critical && <View style={tr.critBadge}><Text style={tr.critText}>CORE</Text></View>}
        </View>
        <Text style={tr.sub}>{sub}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={v => {
          if (critical && !v) {
            Alert.alert('Core Module', 'This is a core module. Disabling it may affect critical society operations. Are you sure?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Disable', style: 'destructive', onPress: () => onChange(v) },
            ]);
          } else {
            onChange(v);
          }
        }}
        trackColor={{ false: P.border, true: P.teal + '60' }}
        thumbColor={value ? P.teal : '#94A3B8'}
      />
    </View>
  );
}
const tr = StyleSheet.create({
  row:       { flexDirection: 'row', alignItems: 'center', paddingVertical: 13 },
  border:    { borderBottomWidth: 1, borderBottomColor: P.border },
  label:     { fontSize: 14, fontWeight: '700', color: P.text },
  sub:       { fontSize: 12, color: P.textMuted, marginTop: 2, lineHeight: 16 },
  betaBadge: { backgroundColor: '#F3E8FF', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  betaText:  { fontSize: 9,  fontWeight: '800', color: '#7C3AED' },
  critBadge: { backgroundColor: P.tealSoft, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  critText:  { fontSize: 9,  fontWeight: '800', color: P.teal },
});

export default function ModuleToggleScreen({ navigation }) {
  const storedToggles = useAdminStore(st => st.moduleToggles);
  const updateToggle  = useAdminStore(st => st.updateModuleToggle);
  const [local, setLocal] = useState({ ...DEFAULTS, ...(storedToggles || {}) });

  const toggle = (key, val) => {
    setLocal(p => ({ ...p, [key]: val }));
    updateToggle(key, val);
  };

  const enabledCount  = Object.values(local).filter(Boolean).length;
  const totalCount    = Object.keys(local).length;

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#1A7A7A" />
            <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>🔌 Module Toggles</Text>
        <Text style={s.headerSub}>Enable / disable app features</Text>
      </View>

      <ScrollView style={s.body} contentContainerStyle={{ padding: 16, paddingBottom: 48 }} showsVerticalScrollIndicator={false}>

        {/* Status banner */}
        <View style={s.banner}>
          <Text style={{ fontSize: 22 }}>⚙️</Text>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={s.bannerTitle}>Feature Control</Text>
            <Text style={s.bannerSub}>Toggle modules on/off for your society. CORE modules affect critical operations.</Text>
          </View>
        </View>

        {MODULE_GROUPS.map(group => (
          <View key={group.group}>
            <Text style={s.groupHead}>{group.group}</Text>
            <View style={s.card}>
              {group.modules.map((mod, i) => (
                <ToggleRow
                  key={mod.key}
                  label={mod.label}
                  sub={mod.sub}
                  value={local[mod.key] ?? !mod.beta}
                  onChange={v => toggle(mod.key, v)}
                  beta={mod.beta}
                  critical={mod.critical}
                  last={i === group.modules.length - 1}
                />
              ))}
            </View>
          </View>
        ))}

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: P.tealDark },
  header:    { flexDirection: 'row', alignItems: 'center', backgroundColor: P.tealDark, padding: 16, paddingTop: 8 },
  back:      { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  backTxt:   { color: '#FFF', fontSize: 28, fontWeight: '300', lineHeight: 32 },
  htitle:    { color: '#FFF', fontSize: 17, fontWeight: '800' },
  hsub:      { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 2 },
  body:      { flex: 1, backgroundColor: P.bg },
  banner:    { flexDirection: 'row', alignItems: 'center', backgroundColor: P.tealSoft, borderRadius: 14, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: P.border },
  bannerTitle:{ fontSize: 14, fontWeight: '800', color: P.text },
  bannerSub: { fontSize: 12, color: P.textMuted, marginTop: 2, lineHeight: 17 },
  groupHead: { fontSize: 12, fontWeight: '800', color: P.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, marginTop: 4 },
  card:      { backgroundColor: P.surface, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: P.border },
  header:      { backgroundColor: '#1A7A7A', paddingTop: 40, paddingBottom: 16, paddingHorizontal: 20 },
  backText:    { color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: '600', marginBottom: 8 },
  headerTitle: { fontSize: 22, fontWeight: '900', color: '#FFF', marginBottom: 2 },
  headerSub:   { fontSize: 12, color: 'rgba(255,255,255,0.72)', marginTop: 1 },
});
