/**
 * ResidentProfileScreen.js
 *
 * Redesigned to match ResidentDashboard exactly:
 * – Deep teal header bleeding into P.bg body
 * – Same P palette, same borderTopRadius 28 body join
 * – Same card / border / shadow tokens
 * – Keeps all Demo Resident logic untouched
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Alert,
  Modal,
  Platform,
} from 'react-native';
import PendingVerificationBanner from '../../../components/common/PendingVerificationBanner';
import { useAuthStore } from '../../../store/AuthStore';
import useResidentStore from '../../../store/residentStore';
import { useDemoStore } from '../../../store/demoStore';
import ThemeToggle from '../../../components/common/ThemeToggle';

// ─── Palette ───────────────────────────────────────────────────────────────────
const P = {
  teal: '#1A7A7A',
  tealDark: '#0D6E6E',
  tealDeep: '#1A7A7A',
  tealSoft: '#E8F5F5',
  tealMid: '#D0EEEE',
  bg: '#E8F5F5',
  surface: '#FFFFFF',
  text: '#1A2E2E',
  textMuted: '#7A9E9E',
  textSub: '#3D6E6E',
  border: '#D0EEEE',
  danger: '#C62828',
  dangerBg: '#FEE2E2',
  warning: '#E65100',
  warningBg: '#FEF3C7',
};

// ─── Demo resident fixture ─────────────────────────────────────────────────────
export const DEMO_RESIDENT = {
  id: 'res2',
  name: 'Jane Resident',
  unit: 'B-202',
  phone: '9876543211',
  role: 'resident',
  approvalStatus: 'approved',
  isDemo: true,
};

// ─── MenuItem ─────────────────────────────────────────────────────────────────
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: P.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: P.border,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 20 },
  label: { fontSize: 14, fontWeight: '700', color: P.text },
  sub: { fontSize: 12, color: P.textMuted, marginTop: 2 },
  chev: { color: P.textMuted, fontSize: 20 },
});

// ─── VerifyCard — prominent verification status + action ─────────────────────
function VerifyCard({ navigation }) {
  const verificationStatus = useAuthStore(s => {
    const live = s.registeredUsers.find(u => u.id === s.user?.id);
    return live?.verificationStatus || s.user?.verificationStatus || 'not_submitted';
  });

  if (verificationStatus === 'approved') {
    return (
      <View style={[vc.card, { borderColor: '#A5D6A7', backgroundColor: '#F0FFF4' }]}>
        <Text style={{ fontSize: 28 }}>✅</Text>
        <View style={{ flex: 1 }}>
          <Text style={[vc.title, { color: '#2E7D32' }]}>Verified & Approved</Text>
          <Text style={vc.sub}>Your account is fully verified. All features are unlocked.</Text>
        </View>
      </View>
    );
  }

  if (verificationStatus === 'pending' || verificationStatus === 'pending_approval') {
    return (
      <View style={[vc.card, { borderColor: '#BFDBFE', backgroundColor: '#EFF6FF' }]}>
        <Text style={{ fontSize: 28 }}>⏳</Text>
        <View style={{ flex: 1 }}>
          <Text style={[vc.title, { color: '#1D4ED8' }]}>Under Review</Text>
          <Text style={vc.sub}>Your documents are being reviewed by the admin. Features unlock once approved.</Text>
        </View>
      </View>
    );
  }

  // not_submitted or rejected
  const isRejected = verificationStatus === 'rejected';
  return (
    <TouchableOpacity
      style={[vc.card, { borderColor: isRejected ? '#FECACA' : '#FDE68A', backgroundColor: isRejected ? '#FEE2E2' : '#FFFBEB' }]}
      onPress={() => navigation.navigate('Verification')}
      activeOpacity={0.85}
    >
      <Text style={{ fontSize: 28 }}>{isRejected ? '❌' : '📋'}</Text>
      <View style={{ flex: 1 }}>
        <Text style={[vc.title, { color: isRejected ? '#C62828' : '#92400E' }]}>
          {isRejected ? 'Verification Rejected' : 'Verify Your Account'}
        </Text>
        <Text style={vc.sub}>
          {isRejected
            ? 'Your documents were rejected. Tap to resubmit.'
            : 'Tap here to upload documents and get approved. Required to unlock all features.'}
        </Text>
      </View>
      <Text style={{ fontSize: 20, color: isRejected ? '#C62828' : '#92400E' }}>›</Text>
    </TouchableOpacity>
  );
}
const vc = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: 16, borderWidth: 1.5, padding: 16, marginBottom: 10 },
  title: { fontSize: 14, fontWeight: '800', marginBottom: 3 },
  sub: { fontSize: 12, color: '#64748B', lineHeight: 17 },
});

// ─── SectionHead ──────────────────────────────────────────────────────────────
function SectionHead({ title }) {
  return (
    <View style={sh.row}>
      <Text style={sh.title}>{title}</Text>
      <View style={sh.line} />
    </View>
  );
}

const sh = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
    marginTop: 20,
  },
  title: {
    fontSize: 12,
    fontWeight: '800',
    color: P.textMuted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  line: { flex: 1, height: 1, backgroundColor: P.border },
});

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN SCREEN
// ═══════════════════════════════════════════════════════════════════════════════
export default function ResidentProfileScreen({ navigation }) {
  const user = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);
  const society = useResidentStore(s => s.society);
  const { demoResident, setDemoResident, clearDemoResident } = useDemoStore();

  const [showDemoModal, setShowDemoModal] = useState(false);

  const isDemoActive = !!demoResident;

  // ── Menu items ──────────────────────────────────────────────────────────────
  const MENU_ITEMS = [
    {
      emoji: '🪪',
      label: 'Profile Verification',
      sub: 'Upload documents & get approved',
      onPress: () => navigation.navigate('Verification'),
    },
    {
      emoji: '👤',
      label: 'Personal Information',
      sub: user?.name,
      onPress: () => navigation.navigate('PersonalInfo'),
    },
    {
      emoji: '🏠',
      label: 'Unit Details',
      sub: `Unit ${user?.unit || 'A-101'}`,
      onPress: () => navigation.navigate('UnitDetails'),
    },
    {
      emoji: '🚗',
      label: 'My Vehicles',
      sub: `${(useResidentStore.getState().profileData?.vehicles || []).length} registered`,
      onPress: () => navigation.navigate('VehicleManagement'),
    },
    {
      emoji: '🔔',
      label: 'Notifications',
      sub: 'Manage preferences',
      onPress: () => navigation.navigate('NotificationSettings'),
    },
    {
      emoji: '🗺️',
      label: 'Community Map',
      sub: 'GPS & gate status',
      onPress: () => navigation.navigate('ResidentGPS'),
    },
    {
      emoji: '📊',
      label: 'My Reports',
      sub: 'Activity & spending',
      onPress: () => navigation.navigate('ResidentReports'),
    },
    {
      emoji: '❓',
      label: 'Help & Support',
      sub: `Call: ${society?.managementContact || '+91 99999 00000'}`,
      onPress: () => navigation.navigate('HelpSupport'),
    },
    {
      emoji: '📋',
      label: 'Terms & Privacy',
      sub: 'Legal documents',
      onPress: () => navigation.navigate('TermsPrivacy'),
    },
  ];

  // ── Demo handlers ───────────────────────────────────────────────────────────
  const handleActivateDemo = () => {
    setDemoResident(DEMO_RESIDENT); l
    setShowDemoModal(false);
    Alert.alert(
      '👤 Demo Resident Active',
      `You are now viewing as Jane Resident (B-202).\n\nYou can browse:\n• Buy/Sell Marketplace\n• Real Estate`,
      [
        { text: 'Go to Marketplace', onPress: () => navigation.navigate('MarketHome') },
        { text: 'Go to Real Estate', onPress: () => navigation.navigate('RealEstate') },
        { text: 'Stay Here', style: 'cancel' },
      ],
    );
  };

  const handleDeactivateDemo = () => {
    Alert.alert('Exit Demo Mode', 'Stop viewing as Jane Resident?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Exit Demo', style: 'destructive', onPress: clearDemoResident },
    ]);
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <View style={s.root}>
      <SafeAreaView style={s.safeTop} />
      <StatusBar barStyle="light-content" backgroundColor={P.tealDeep} />

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ════ HEADER ════ */}
        <View style={s.header}>
          <View style={s.headerTop}>
            <TouchableOpacity
              style={s.backBtn}
              onPress={() => navigation.goBack()}
              activeOpacity={0.75}
            >
              <Text style={s.backArrow}>←</Text>
            </TouchableOpacity>
            <Text style={s.headerLabel}>My Profile</Text>
            <View style={{ width: 42 }} />
          </View>

          {/* Avatar hero */}
          <View style={s.avatarWrap}>
            <View style={s.avatar}>
              <Text style={{ fontSize: 38 }}>👤</Text>
            </View>
            <Text style={s.profileName}>{user?.name || 'Resident'}</Text>
            <Text style={s.profileUnit}>
              Unit {user?.unit || 'A-101'} · {society?.name || 'Society'}
            </Text>
            <View style={s.verifiedPill}>
              <Text style={s.verifiedText}>✅ RESIDENT · Verified</Text>
            </View>
          </View>
        </View>

        {/* ════ BODY ════ */}
        <View style={s.body}>

          {/* Demo active banner */}
          {isDemoActive && (
            <View style={s.demoBanner}>
              <View style={{ flex: 1 }}>
                <Text style={s.demoBannerTitle}>🎭 Demo Mode Active</Text>
                <Text style={s.demoBannerSub}>
                  Viewing as{' '}
                  <Text style={{ fontWeight: '800' }}>Jane Resident · B-202</Text>
                </Text>
              </View>
              <TouchableOpacity style={s.demoExitBtn} onPress={handleDeactivateDemo}>
                <Text style={s.demoExitText}>Exit</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Quick links (shown when demo is active) */}
          {isDemoActive && (
            <View style={s.quickLinks}>
              <TouchableOpacity
                style={s.quickBtn}
                onPress={() => navigation.navigate('MarketHome')}
              >
                <Text style={s.quickBtnText}>♻️ Buy/Sell</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={s.quickBtn}
                onPress={() => navigation.navigate('RealEstate')}
              >
                <Text style={s.quickBtnText}>🏠 Real Estate</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ── Developer Testing ── */}
          <SectionHead title="🧪 Developer Testing" />
          <TouchableOpacity
            style={[s.demoCard, isDemoActive && s.demoCardActive]}
            onPress={() => (isDemoActive ? handleDeactivateDemo() : setShowDemoModal(true))}
            activeOpacity={0.85}
          >
            <View style={s.demoIconWrap}>
              <Text style={{ fontSize: 26 }}>👥</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.demoTitle}>Demo Resident</Text>
              <Text style={s.demoSub}>
                {isDemoActive
                  ? '🟢 Active — Jane Resident (B-202) · Tap to exit'
                  : 'Test P2P Marketplace & Real Estate as another resident'}
              </Text>
            </View>
            <Text style={{ color: isDemoActive ? P.danger : P.teal, fontSize: 20 }}>›</Text>
          </TouchableOpacity>

          {/* ── Display ── */}
          <SectionHead title="⚙️ Display" />
          <ThemeToggle style={{ marginBottom: 10 }} />

          {/* ── Verify Account ── */}
          <SectionHead title="🪪 Account Verification" />
          <VerifyCard navigation={navigation} />

          {/* ── Account Settings ── */}
          <SectionHead title="⚙️ Account Settings" />
          {MENU_ITEMS.filter(item => item.label !== 'Profile Verification').map((item, i) => (
            <MenuItem key={i} {...item} />
          ))}

          {/* Logout */}
          <TouchableOpacity
            style={s.logoutBtn}
            activeOpacity={0.85}
            onPress={() => {
              const doLogout = () => logout();
              if (Platform.OS === 'web') {
                if (window.confirm('Are you sure you want to logout?')) doLogout();
              } else {
                Alert.alert('Logout', 'Are you sure?', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Logout', style: 'destructive', onPress: doLogout },
                ]);
              }
            }}
          >
            <Text style={s.logoutText}>🚪 Logout</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>

      {/* ════ DEMO MODAL ════ */}
      <Modal visible={showDemoModal} transparent animationType="slide">
        <View style={s.overlay}>
          <View style={s.modal}>

            {/* Modal header */}
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>👥 Demo Resident</Text>
              <TouchableOpacity onPress={() => setShowDemoModal(false)}>
                <Text style={s.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Profile card inside modal */}
            <View style={s.modalProfile}>
              <Text style={{ fontSize: 38, marginBottom: 8 }}>👤</Text>
              <Text style={s.modalName}>Jane Resident</Text>
              <Text style={s.modalSub}>Unit B-202 · Verified Resident</Text>
              <View style={s.verifiedPill}>
                <Text style={s.verifiedText}>✅ Verified</Text>
              </View>
            </View>

            {/* Description */}
            <Text style={s.modalDesc}>
              Activating demo mode lets you temporarily view the{' '}
              <Text style={{ fontWeight: '800' }}>Buy/Sell Marketplace</Text> and{' '}
              <Text style={{ fontWeight: '800' }}>Real Estate</Text> screens as Jane
              Resident.
            </Text>

            {/* Info list */}
            <View style={s.modalList}>
              {[
                '♻️ You can see listings posted by Jane',
                '♻️ Jane can see listings posted by you',
                '🛡️ Admin must approve first listing from any resident',
                '⚡ After approval, subsequent listings go live instantly',
                '🔒 Demo mode does NOT change your login',
              ].map((t, i) => (
                <Text key={i} style={s.modalListItem}>{t}</Text>
              ))}
            </View>

            {/* Activate button */}
            <TouchableOpacity style={s.activateBtn} onPress={handleActivateDemo}>
              <Text style={s.activateBtnText}>🎭 Activate Demo Mode</Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: P.tealDeep },
  safeTop: { backgroundColor: P.tealDeep },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 0 },

  // ── Header ──
  header: {
    backgroundColor: P.tealDeep,
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 28,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: { fontSize: 22, color: '#FFFFFF', marginTop: -1 },
  headerLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },

  // ── Avatar hero ──
  avatarWrap: { alignItems: 'center', paddingBottom: 4 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  profileName: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  profileUnit: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.65)',
    fontWeight: '600',
    marginBottom: 10,
  },
  verifiedPill: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  verifiedText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '700',
  },

  // ── Body ──
  body: {
    backgroundColor: P.bg,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    paddingTop: 24,
    minHeight: 500,
  },

  // ── Demo banner ──
  demoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: P.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 4,
    borderWidth: 1.5,
    borderColor: P.warning,
  },
  demoBannerTitle: { fontSize: 13, fontWeight: '800', color: P.warning, marginBottom: 4 },
  demoBannerSub: { fontSize: 12, color: P.warning },
  demoExitBtn: {
    backgroundColor: P.danger,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  demoExitText: { color: '#FFFFFF', fontWeight: '800', fontSize: 12 },

  // ── Quick links ──
  quickLinks: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  quickBtn: {
    flex: 1,
    backgroundColor: P.tealDeep,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  quickBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },

  // ── Demo card ──
  demoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: P.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: P.tealMid,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  demoCardActive: { borderColor: '#FECACA' },
  demoIconWrap: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: P.tealSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  demoTitle: { fontSize: 15, fontWeight: '700', color: P.text },
  demoSub: { fontSize: 12, color: P.textMuted, marginTop: 2 },

  // ── Logout ──
  logoutBtn: {
    backgroundColor: P.surface,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 6,
    borderWidth: 1.5,
    borderColor: P.dangerBg,
  },
  logoutText: { fontSize: 15, fontWeight: '800', color: P.danger },

  // ── Modal ──
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: P.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: { fontSize: 19, fontWeight: '900', color: P.text },
  modalClose: { fontSize: 22, color: P.textMuted },
  modalProfile: {
    backgroundColor: P.tealSoft,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: P.border,
  },
  modalName: { fontSize: 18, fontWeight: '800', color: P.text, marginBottom: 2 },
  modalSub: { fontSize: 13, color: P.textMuted, marginBottom: 10 },
  modalDesc: {
    fontSize: 13,
    color: P.textMuted,
    lineHeight: 20,
    marginBottom: 14,
  },
  modalList: {
    backgroundColor: P.tealSoft,
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: P.border,
  },
  modalListItem: { fontSize: 12, color: P.textSub, lineHeight: 22 },
  activateBtn: {
    backgroundColor: P.tealDeep,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 8,
  },
  activateBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '900' },
});