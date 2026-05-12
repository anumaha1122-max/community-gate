/**
 * shared.js — COMMUNITY CONNECT THEME
 *
 * Color system extracted from the Community Connect design:
 *   • Deep navy backgrounds  (#0A0E1A, #0D1225, #111827)
 *   • Purple/blue gradient accents (#6C47FF → #4F8EF7 → #00D4FF)
 *   • Glassy card surfaces with subtle borders
 *   • Neon glow effects on interactive elements
 *   • Role-specific accent colours for footers
 */

import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, StatusBar, ActivityIndicator, Platform,
} from 'react-native';

// ─── Community Connect Design Tokens ─────────────────────────────────────────

export const COLORS = {
  // ── Backgrounds
  bg:           '#0A0E1A',
  bgCard:       '#0D1225',
  bgSurface:    '#111827',
  bgGlass:      'rgba(255,255,255,0.05)',

  // ── Brand gradient stops
  gradStart:    '#6C47FF',
  gradMid:      '#4F8EF7',
  gradEnd:      '#00D4FF',

  // ── Accent
  primary:      '#6C47FF',
  primaryLight: '#8B6DFF',
  accent:       '#4F8EF7',
  accentCyan:   '#00D4FF',

  // ── Role accent colours
  roleAdmin:    '#6C47FF',
  roleResident: '#4F8EF7',
  roleGuard:    '#F59E0B',
  roleVendor:   '#10B981',
  roleBuilder:  '#A78BFA',

  // ── Semantic
  success:      '#10B981',
  successLight: 'rgba(16,185,129,0.15)',
  warning:      '#F59E0B',
  warningLight: 'rgba(245,158,11,0.15)',
  danger:       '#EF4444',
  dangerLight:  'rgba(239,68,68,0.15)',
  info:         '#4F8EF7',
  infoLight:    'rgba(79,142,247,0.15)',

  // ── Text
  text:         '#F1F5F9',
  textSub:      '#94A3B8',
  textMuted:    '#475569',
  white:        '#FFFFFF',

  // ── Borders
  border:       'rgba(255,255,255,0.08)',
  borderGlow:   'rgba(108,71,255,0.35)',

  // ── Card surface (alias for bgSurface — used by many screens)
  card:           '#111827',

  // ── Role header backgrounds
  headerAdmin:    '#0A0E1A',
  headerGuard:    '#0D1A2A',
  headerResident: '#0A0E1A',
  headerVendor:   '#0A1A12',
  headerBuilder:  '#120A1A',
};

export const GRADIENT = {
  brand:   ['#6C47FF', '#4F8EF7', '#00D4FF'],
  brandH:  ['#6C47FF', '#4F8EF7'],
  dark:    ['#0A0E1A', '#0D1225'],
  card:    ['rgba(13,18,37,0.95)', 'rgba(17,24,39,0.9)'],
  danger:  ['#EF4444', '#DC2626'],
  success: ['#10B981', '#059669'],
};

export const FONT = {
  xs: 10, sm: 12, md: 14, lg: 16, xl: 18, xxl: 22, xxxl: 28,
  regular: '400', medium: '600', bold: '700', black: '900',
};

export const RADIUS = { sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, round: 9999 };

export const SHADOW = {
  sm:   { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3,  shadowRadius: 6,  elevation: 4 },
  md:   { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4,  shadowRadius: 12, elevation: 8 },
  lg:   { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.5,  shadowRadius: 24, elevation: 16 },
  glow: { shadowColor: '#6C47FF', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 16, elevation: 10 },
};

// ─── ScreenWrapper ────────────────────────────────────────────────────────────
export function ScreenWrapper({
  children,
  headerColor = COLORS.bg,
  barStyle    = 'light-content',
  bodyColor   = COLORS.bg,
  style,
}) {
  return (
    <SafeAreaView style={[{ flex: 1, backgroundColor: headerColor }, style]}>
      <StatusBar barStyle={barStyle} backgroundColor={headerColor} />
      <View style={{ flex: 1, backgroundColor: bodyColor }}>
        {children}
      </View>
    </SafeAreaView>
  );
}

// ─── PageHeader ───────────────────────────────────────────────────────────────
export function PageHeader({ title, subtitle, bg = COLORS.bg, onBack, right }) {
  return (
    <View style={[hdrStyles.header, { backgroundColor: bg }]}>
      <View style={hdrStyles.side}>
        {onBack ? (
          <TouchableOpacity onPress={onBack} style={hdrStyles.backBtn} activeOpacity={0.7}>
            <Text style={hdrStyles.backArrow}>←</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      <View style={hdrStyles.centre}>
        <Text style={hdrStyles.title} numberOfLines={1}>{title}</Text>
        {subtitle ? <Text style={hdrStyles.subtitle} numberOfLines={1}>{subtitle}</Text> : null}
      </View>
      <View style={[hdrStyles.side, { alignItems: 'flex-end' }]}>
        {right || null}
      </View>
    </View>
  );
}

const hdrStyles = StyleSheet.create({
  header:    { paddingHorizontal: 16, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', minHeight: 60, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  side:      { width: 52, justifyContent: 'center' },
  centre:    { flex: 1, alignItems: 'center' },
  backBtn:   { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.bgGlass, borderWidth: 1, borderColor: COLORS.border, justifyContent: 'center', alignItems: 'center' },
  backArrow: { color: COLORS.text, fontSize: 20, fontWeight: '700', lineHeight: 22 },
  title:     { fontSize: FONT.lg, fontWeight: FONT.bold, color: COLORS.text, letterSpacing: 0.2 },
  subtitle:  { fontSize: FONT.xs, color: COLORS.textSub, marginTop: 2 },
});

// ─── Role Footer Bars ─────────────────────────────────────────────────────────

function FooterBar({ tabs, active, navigation, bg, activeColor }) {
  return (
    <View style={[ftStyles.bar, { backgroundColor: bg }]}>
      {tabs.map(tab => {
        const isFocused = active === tab.id;
        return (
          <TouchableOpacity
            key={tab.id}
            style={ftStyles.tab}
            onPress={() => tab.route && navigation.navigate(tab.route)}
            activeOpacity={0.75}
          >
            {isFocused && (
              <View style={[ftStyles.activeDot, { backgroundColor: activeColor }]} />
            )}
            <View style={ftStyles.iconWrap}>
              <Text style={[ftStyles.icon, isFocused && { opacity: 1 }]}>{tab.icon}</Text>
              {tab.badge > 0 && (
                <View style={ftStyles.badge}>
                  <Text style={ftStyles.badgeText}>{tab.badge > 9 ? '9+' : tab.badge}</Text>
                </View>
              )}
            </View>
            <Text style={[ftStyles.label, isFocused && { color: activeColor, fontWeight: '800' }]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export function AdminFooter({ active, navigation, badges = {} }) {
  const TABS = [
    { id: 'home',        icon: '🏠', label: 'Dashboard',   route: null },
    { id: 'residents',   icon: '👥', label: 'Residents',   route: 'ResidentList' },
    { id: 'maintenance', icon: '🔧', label: 'Maintenance', route: 'AdminMaintenanceTab' },
    { id: 'billing',     icon: '💰', label: 'Billing',     route: 'BillingDashboard' },
    { id: 'security',    icon: '🛡️', label: 'Security',    route: 'VisitorLogs', badge: badges.security },
    { id: 'more',        icon: '☰',  label: 'More',        route: 'AdminMore', badge: badges.more },
  ];
  return <FooterBar tabs={TABS} active={active} navigation={navigation} bg={COLORS.headerAdmin} activeColor={COLORS.roleAdmin} />;
}

export function ResidentFooter({ active, navigation, badges = {} }) {
  const TABS = [
    { id: 'home',     icon: '🏠', label: 'Home',       route: null },
    { id: 'visitors', icon: '👥', label: 'Visitors',   route: 'VisitorList',         badge: badges.visitors },
    { id: 'bills',    icon: '💳', label: 'Bills',      route: 'BillingList',         badge: badges.bills },
    { id: 'maintain', icon: '🔧', label: 'Requests',   route: 'ResidentMaintenance', badge: badges.maintain },
    { id: 'more',     icon: '☰',  label: 'More',       route: 'Amenities' },
  ];
  return <FooterBar tabs={TABS} active={active} navigation={navigation} bg={COLORS.headerResident} activeColor={COLORS.roleResident} />;
}

export function GuardFooter({ active, navigation, badges = {} }) {
  const TABS = [
    { id: 'dashboard', icon: '🏠', label: 'Dashboard',  route: null },
    { id: 'gate',      icon: '🚶', label: 'At Gate',    route: 'WalkInEntry',          badge: badges.gate },
    { id: 'verify',    icon: '✅', label: 'Verify',     route: 'VisitorVerification' },
    { id: 'sos',       icon: '🚨', label: 'SOS',        route: 'SOSAlerts',            badge: badges.sos },
    { id: 'more',      icon: '☰',  label: 'More',       route: 'EntryLogs' },
  ];
  return <FooterBar tabs={TABS} active={active} navigation={navigation} bg={COLORS.headerGuard} activeColor={COLORS.roleGuard} />;
}

export function VendorFooter({ active, navigation, badges = {} }) {
  const TABS = [
    { id: 'home',     icon: '🏠', label: 'Home',      route: null },
    { id: 'requests', icon: '📋', label: 'Requests',  route: 'RequestList',    badge: badges.requests },
    { id: 'work',     icon: '🔧', label: 'Work',      route: 'WorkScreens' },
    { id: 'payments', icon: '💰', label: 'Payments',  route: 'PaymentAndMore' },
    { id: 'profile',  icon: '👤', label: 'Profile',   route: 'ProfileScreen' },
  ];
  return <FooterBar tabs={TABS} active={active} navigation={navigation} bg={COLORS.headerVendor} activeColor={COLORS.roleVendor} />;
}

export function BuilderFooter({ active, navigation, badges = {} }) {
  const TABS = [
    { id: 'home',      icon: '🏗️', label: 'Projects',  route: null },
    { id: 'approvals', icon: '✅', label: 'Approvals', route: null, badge: badges.approvals },
    { id: 'docs',      icon: '📄', label: 'Documents', route: null },
    { id: 'profile',   icon: '👤', label: 'Profile',   route: null },
  ];
  return <FooterBar tabs={TABS} active={active} navigation={navigation} bg={COLORS.headerBuilder} activeColor={COLORS.roleBuilder} />;
}

const ftStyles = StyleSheet.create({
  bar:       { flexDirection: 'row', paddingBottom: Platform.OS === 'ios' ? 4 : 8, paddingTop: 6, borderTopWidth: 1, borderTopColor: COLORS.border },
  tab:       { flex: 1, alignItems: 'center', paddingVertical: 4, position: 'relative' },
  activeDot: { position: 'absolute', top: 0, width: 24, height: 2, borderRadius: 1 },
  iconWrap:  { position: 'relative' },
  icon:      { fontSize: 20, opacity: 0.35 },
  label:     { fontSize: 10, marginTop: 3, color: COLORS.textMuted, fontWeight: '600' },
  badge:     { position: 'absolute', top: -5, right: -10, backgroundColor: COLORS.danger, borderRadius: 9, minWidth: 17, height: 17, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  badgeText: { color: '#FFF', fontSize: 9, fontWeight: '800' },
});

// ─── Atoms ────────────────────────────────────────────────────────────────────

export function Badge({ text, color = COLORS.danger, bg }) {
  return (
    <View style={[atomStyles.badge, { backgroundColor: bg || color + '22', borderColor: color + '55', borderWidth: 1 }]}>
      <Text style={[atomStyles.badgeText, { color }]}>{text}</Text>
    </View>
  );
}

export function EmptyState({ emoji = '📭', title, sub }) {
  return (
    <View style={atomStyles.empty}>
      <Text style={atomStyles.emptyEmoji}>{emoji}</Text>
      <Text style={atomStyles.emptyTitle}>{title}</Text>
      {sub ? <Text style={atomStyles.emptySub}>{sub}</Text> : null}
    </View>
  );
}

export function LoadingOverlay({ label = 'Loading…' }) {
  return (
    <View style={atomStyles.overlay}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={atomStyles.overlayText}>{label}</Text>
    </View>
  );
}

export function SectionLabel({ children, style }) {
  return <Text style={[atomStyles.sectionLabel, style]}>{children}</Text>;
}

export function Card({ children, style, glow }) {
  return (
    <View style={[atomStyles.card, glow && SHADOW.glow, style]}>
      {children}
    </View>
  );
}

export function GlassCard({ children, style }) {
  return (
    <View style={[atomStyles.glassCard, style]}>
      {children}
    </View>
  );
}

const atomStyles = StyleSheet.create({
  badge:       { paddingHorizontal: 10, paddingVertical: 4, borderRadius: RADIUS.round, alignSelf: 'flex-start' },
  badgeText:   { fontSize: FONT.xs, fontWeight: FONT.bold },
  empty:       { alignItems: 'center', paddingVertical: 56 },
  emptyEmoji:  { fontSize: 40, marginBottom: 12 },
  emptyTitle:  { fontSize: FONT.lg, fontWeight: FONT.bold, color: COLORS.textSub },
  emptySub:    { fontSize: FONT.sm, color: COLORS.textMuted, marginTop: 6, textAlign: 'center', paddingHorizontal: 24, lineHeight: 20 },
  overlay:     { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  overlayText: { fontSize: FONT.md, color: COLORS.textSub },
  sectionLabel:{ fontSize: 10, fontWeight: '800', color: COLORS.textMuted, letterSpacing: 1.4, marginTop: 20, marginBottom: 10, textTransform: 'uppercase' },
  card:        { backgroundColor: COLORS.bgSurface, borderRadius: RADIUS.lg, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border, ...SHADOW.sm },
  glassCard:   { backgroundColor: COLORS.bgGlass, borderRadius: RADIUS.xl, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border },
});
