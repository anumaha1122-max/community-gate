/**
 * ProfileScreen.js (Vendor) — Rebuilt to match ResidentProfileScreen design
 *
 * Design: Deep teal header bleeds into rounded P.bg body
 * Same P palette, same borderTopRadius 28, same MenuItem component style
 * Avatar hero with stats, contact card, menu list, logout
 */

import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  StatusBar, ScrollView, Alert, Platform,
} from 'react-native';
import { useAuthStore }   from '../../../store/AuthStore';
import useAppStore        from '../../../store/appStore';
import { BusinessTabBar } from '../../../vendor/components/TabBars';

// ─── Palette (mirrors ResidentProfileScreen) ──────────────────────────────────
const P = {
  teal:      '#1A7A7A', tealDark:  '#0D6E6E', tealDeep:  '#1A7A7A',
  tealSoft:  '#E8F5F5', tealMid:   '#D0EEEE', tealText:  '#3D6E6E',
  bg:        '#E8F5F5', surface:   '#FFFFFF',
  text:      '#1A2E2E', textMuted: '#7A9E9E', textSub:   '#3D6E6E',
  border:    '#D0EEEE',
  danger:    '#C62828', dangerBg:  '#FEE2E2',
  warning:   '#E65100', warningBg: '#FEF3C7',
  purple:    '#6D28D9', purpleBg:  '#EDE9FE',
  amber:     '#B45309', amberBg:   '#FEF3C7',
  green:     '#15803D', greenBg:   '#DCFCE7',
};

const MENU = [
  { emoji: '✏️', label: 'Edit Profile',        sub: 'Name, phone, address',           screen: 'EditProfile'          },
  { emoji: '🔧', label: 'Services Offered',     sub: 'Manage your service categories',  screen: 'ServicesOffered'      },
  { emoji: '⭐', label: 'Ratings & Reviews',    sub: 'See what residents say about you', screen: 'VendorRatings'        },
  { emoji: '🏦', label: 'Bank & UPI Details',   sub: 'Payment receiving account',       screen: 'BankDetails'          },
  { emoji: '📄', label: 'Documents & KYC',      sub: 'Aadhar, PAN, certificates',       screen: 'DocumentsKYC'         },
  { emoji: '🔔', label: 'Notifications',         sub: 'Manage alerts & reminders',       screen: 'NotificationSettings' },
  { emoji: '🔒', label: 'Privacy & Security',   sub: 'Password, 2FA settings',          screen: 'PrivacySecurity'      },
  { emoji: '❓', label: 'Help & Support',        sub: 'FAQs, contact support',           screen: 'HelpSupport'          },
];

// ─── MenuItem — same style as ResidentProfileScreen ───────────────────────────
function MenuItem({ emoji, label, sub, onPress, danger }) {
  return (
    <TouchableOpacity style={mi.row} onPress={onPress} activeOpacity={0.82}>
      <View style={[mi.icon, { backgroundColor: danger ? P.dangerBg : P.tealSoft }]}>
        <Text style={mi.emoji}>{emoji}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[mi.label, danger && { color: P.danger }]}>{label}</Text>
        {sub ? <Text style={mi.sub}>{sub}</Text> : null}
      </View>
      <Text style={mi.chev}>›</Text>
    </TouchableOpacity>
  );
}
const mi = StyleSheet.create({
  row:   { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: P.surface, borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: P.border, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4 },
  icon:  { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 20 },
  label: { fontSize: 14, fontWeight: '700', color: P.text },
  sub:   { fontSize: 12, color: P.textMuted, marginTop: 2 },
  chev:  { color: P.textMuted, fontSize: 20 },
});

// ─── VerifyCard — same shape as ResidentProfileScreen ────────────────────────
function VerifyCard({ navigation }) {
  const verificationStatus = useAuthStore(s => {
    const live = s.registeredUsers ? s.registeredUsers.find(u => u.id === s.user?.id) : null;
    return live?.verificationStatus || s.user?.verificationStatus || 'not_submitted';
  });

  if (verificationStatus === 'approved') return (
    <View style={[vc.card, { borderColor: '#A5D6A7', backgroundColor: '#F0FFF4' }]}>
      <Text style={{ fontSize: 28 }}>✅</Text>
      <View style={{ flex: 1 }}>
        <Text style={[vc.title, { color: '#2E7D32' }]}>Verified & Approved</Text>
        <Text style={vc.sub}>Your account is fully verified. All features are unlocked.</Text>
      </View>
    </View>
  );

  if (verificationStatus === 'pending' || verificationStatus === 'pending_approval') return (
    <View style={[vc.card, { borderColor: '#BFDBFE', backgroundColor: '#EFF6FF' }]}>
      <Text style={{ fontSize: 28 }}>⏳</Text>
      <View style={{ flex: 1 }}>
        <Text style={[vc.title, { color: '#1D4ED8' }]}>Under Review</Text>
        <Text style={vc.sub}>Your documents are being reviewed by the admin.</Text>
      </View>
    </View>
  );

  const isRejected = verificationStatus === 'rejected';
  return (
    <TouchableOpacity
      style={[vc.card, { borderColor: isRejected ? '#FECACA' : '#FDE68A', backgroundColor: isRejected ? '#FEE2E2' : '#FFFBEB' }]}
      onPress={() => navigation.navigate('DocumentsKYC')}
      activeOpacity={0.85}
    >
      <Text style={{ fontSize: 28 }}>{isRejected ? '❌' : '📋'}</Text>
      <View style={{ flex: 1 }}>
        <Text style={[vc.title, { color: isRejected ? '#C62828' : '#92400E' }]}>
          {isRejected ? 'Verification Rejected' : 'Verify Your Account'}
        </Text>
        <Text style={vc.sub}>
          {isRejected ? 'Tap to re-submit your documents.' : 'Upload documents to unlock all features.'}
        </Text>
      </View>
      <Text style={{ fontSize: 20, color: isRejected ? '#C62828' : '#92400E' }}>›</Text>
    </TouchableOpacity>
  );
}
const vc = StyleSheet.create({
  card:  { flexDirection: 'row', alignItems: 'center', gap: 14, borderWidth: 1.5, borderRadius: 14, padding: 14, marginBottom: 16 },
  title: { fontSize: 14, fontWeight: '800', marginBottom: 2 },
  sub:   { fontSize: 12, color: P.textMuted, lineHeight: 18 },
});

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN SCREEN
// ═══════════════════════════════════════════════════════════════════════════════
export default function ProfileScreen({ navigation }) {
  const authUser  = useAuthStore(s => s.user);
  const allUsers  = useAppStore(s => s.users);
  const logout    = useAuthStore(s => s.logout);
  const requests  = useAppStore(s => s.maintenanceRequests);

  const vendorUser = allUsers.find(u => u.role === 'vendor' && u.id === authUser?.id)
    || allUsers.find(u => u.role === 'vendor');

  const vendorName    = authUser?.name    || vendorUser?.name    || 'Vendor';
  const vendorPhone   = authUser?.phone   || vendorUser?.phone   || '—';
  const vendorEmail   = authUser?.email   || '—';
  const vendorCompany = authUser?.company || vendorUser?.company || 'Service Provider';

  // Live stats from store
  const myJobs       = requests.filter(r => r.assignedVendorId === vendorUser?.id);
  const completedJobs = myJobs.filter(r => r.status === 'paid_to_vendor').length;
  const totalEarned   = myJobs.filter(r => r.status === 'paid_to_vendor').reduce((s, r) => s + (r.quote?.amount || 0), 0);
  const activeJobs    = myJobs.filter(r => r.status === 'work_in_progress').length;

  const handleLogout = () => {
    const logoutNow = () => logout();
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logoutNow },
    ]);
    if (Platform.OS === 'web') {
      if (confirm('Logout?')) logoutNow();
    }
  };

  return (
    <View style={s.root}>
      <SafeAreaView style={s.safeTop} />
      <StatusBar barStyle="light-content" backgroundColor={P.tealDeep} />

      {/* ═══ TEAL HEADER ═══ */}
      <View style={s.header}>
        <View style={s.headerTop}>
          <View style={{ flex: 1 }}>
            <Text style={s.headerLabel}>My Profile</Text>
          </View>
          <TouchableOpacity style={s.editBtn} onPress={() => navigation.navigate('EditProfile')} activeOpacity={0.8}>
            <Text style={s.editBtnText}>✏️  Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Avatar hero */}
        <View style={s.avatarRow}>
          <View style={s.avatarCircle}>
            <Text style={s.avatarText}>{vendorName.substring(0, 2).toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.vendorName}>{vendorName}</Text>
            <Text style={s.vendorCompany}>{vendorCompany}</Text>
          </View>
        </View>

        {/* Stats row */}
        <View style={s.statsRow}>
          {[
            { v: activeJobs,    l: 'Active',    c: '#FCD34D' },
            { v: completedJobs, l: 'Completed', c: '#6EE7B7' },
            { v: totalEarned > 0 ? `₹${(totalEarned/1000).toFixed(1)}K` : '₹0', l: 'Earned', c: '#A5B4FC' },
          ].map((st, i) => (
            <View key={i} style={{ flex: 1, alignItems: 'center' }}>
              {i > 0 && <View style={s.statDivider} />}
              <Text style={[s.statValue, { color: st.c }]}>{st.v}</Text>
              <Text style={s.statLabel}>{st.l}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* ═══ BODY ═══ */}
      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Verification card */}
        <VerifyCard navigation={navigation} />

        {/* Contact info card */}
        <View style={s.contactCard}>
          <Text style={s.sectionLabel}>Contact Details</Text>
          {[
            ['📞', 'Phone',   vendorPhone ? `+91 ${vendorPhone}` : '—'],
            ['📧', 'Email',   vendorEmail],
            ['🏢', 'Company', vendorCompany],
          ].map(([icon, key, val], i) => (
            <View key={i} style={[s.detailRow, i < 2 && s.detailBorder]}>
              <Text style={s.detailIcon}>{icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.detailKey}>{key}</Text>
                <Text style={s.detailVal}>{val}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Menu items */}
        {MENU.map((item, i) => (
          <MenuItem
            key={i}
            emoji={item.emoji}
            label={item.label}
            sub={item.sub}
            onPress={() => navigation.navigate(item.screen)}
          />
        ))}

        {/* Logout */}
        <MenuItem
          emoji="🚪"
          label="Logout"
          sub="Sign out of your account"
          onPress={handleLogout}
          danger
        />

        <Text style={s.version}>App Version 1.0.0</Text>
        <View style={{ height: 32 }} />
      </ScrollView>

      <BusinessTabBar
        activeTab="Profile"
        onTabPress={(tab) => {
          if (tab === 'Home')     navigation.navigate('BusinessHome');
          if (tab === 'Requests') navigation.navigate('RequestList');
          if (tab === 'Jobs')     navigation.navigate('JobsList');
          if (tab === 'Earnings') navigation.navigate('Earnings');
        }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  root:    { flex: 1, backgroundColor: P.tealDeep },
  safeTop: { backgroundColor: P.tealDeep },

  // Header
  header:      { backgroundColor: P.tealDeep, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 },
  headerTop:   { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  headerLabel: { fontSize: 22, fontWeight: '900', color: '#FFF' },
  editBtn:     { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7 },
  editBtnText: { fontSize: 13, fontWeight: '700', color: '#FFF' },

  // Avatar row
  avatarRow:    { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 20 },
  avatarCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.35)' },
  avatarText:   { fontSize: 26, fontWeight: '900', color: '#FFF' },
  vendorName:   { fontSize: 20, fontWeight: '900', color: '#FFF', marginBottom: 2 },
  vendorCompany:{ fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: '600' },

  // Stats
  statsRow:    { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16, paddingVertical: 14, paddingHorizontal: 10 },
  statDivider: { position: 'absolute', left: 0, top: 6, bottom: 6, width: 1, backgroundColor: 'rgba(255,255,255,0.2)' },
  statValue:   { fontSize: 20, fontWeight: '900', marginBottom: 2 },
  statLabel:   { fontSize: 10, color: 'rgba(255,255,255,0.6)', fontWeight: '700' },

  // Body
  scroll:        { flex: 1, backgroundColor: P.bg },
  scrollContent: { padding: 20, paddingTop: 24, paddingBottom: 100 },

  // Contact card
  contactCard:  { backgroundColor: P.surface, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: P.border, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4 },
  sectionLabel: { fontSize: 12, fontWeight: '800', color: P.textMuted, letterSpacing: 0.5, marginBottom: 10 },
  detailRow:    { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  detailBorder: { borderBottomWidth: 1, borderBottomColor: P.border },
  detailIcon:   { fontSize: 18, marginRight: 12 },
  detailKey:    { fontSize: 11, color: P.textMuted },
  detailVal:    { fontSize: 14, fontWeight: '600', color: P.text, marginTop: 2 },

  version: { textAlign: 'center', fontSize: 12, color: P.textMuted, marginTop: 8 },
});