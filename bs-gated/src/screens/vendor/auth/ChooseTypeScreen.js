/**
 * ChooseTypeScreen.js
 *
 * Design: matches ResidentDashboard exactly
 *   – Deep teal header (P.tealDeep) bleeds into soft teal body (P.bg)
 *   – Same palette, same border-radius, same shadow, same padding tokens
 *   – Back button → logout → login page (no navigation header, custom back in header)
 *   – Business card  → BusinessHome
 *   – Marketplace card → StoreSetup
 */

import React, { useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView, StatusBar, Animated,
} from 'react-native';
import { useAuthStore } from '../../../store/AuthStore';

// ─── Same palette as ResidentDashboard ───────────────────────────────────────
const P = {
  teal:       '#1A7A7A',
  tealDark:   '#0D6E6E',
  tealDeep:   '#1A7A7A',
  tealSoft:   '#E8F5F5',
  tealMid:    '#D0EEEE',
  tealText:   '#3D6E6E',
  bg:         '#E8F5F5',
  surface:    '#FFFFFF',
  text:       '#1A2E2E',
  textMuted:  '#7A9E9E',
  textSub:    '#3D6E6E',
  border:     '#D0EEEE',
  purple:     '#6A1B9A',
};

const FEATURES = [
  { emoji: '🔔', text: 'Real-time request notifications' },
  { emoji: '📊', text: 'Earnings & performance analytics' },
  { emoji: '⭐', text: 'User reviews & star ratings'     },
  { emoji: '💳', text: 'Seamless UPI / card payments'    },
  { emoji: '📄', text: 'Auto invoice generation'         },
  { emoji: '📦', text: 'AMC & contract management'       },
];

// ─── Animated type card ───────────────────────────────────────────────────────
function TypeCard({ emoji, title, tag, desc, cardColor, onPress, delay }) {
  const scale   = useRef(new Animated.Value(0.95)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 380, delay, useNativeDriver: true }),
      Animated.spring(scale,   { toValue: 1, delay, useNativeDriver: true, friction: 7, tension: 60 }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity, transform: [{ scale }] }}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.87}
        style={[tc.card, { backgroundColor: cardColor }]}
      >
        {/* Decorative bg circles */}
        <View style={tc.circle1} />
        <View style={tc.circle2} />

        <View style={tc.inner}>
          <View style={tc.iconWrap}>
            <Text style={{ fontSize: 28 }}>{emoji}</Text>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={tc.title}>{title}</Text>
            <View style={tc.tagPill}>
              <Text style={tc.tagText}>{tag}</Text>
            </View>
            <Text style={tc.desc}>{desc}</Text>
          </View>

          <View style={tc.arrowWrap}>
            <Text style={tc.arrow}>›</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const tc = StyleSheet.create({
  card: {
    borderRadius: 20, padding: 20, marginBottom: 14,
    overflow: 'hidden', position: 'relative',
    elevation: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 10,
  },
  inner:    { flexDirection: 'row', alignItems: 'center', gap: 14, zIndex: 1 },
  circle1:  {
    position: 'absolute', top: -30, right: -30,
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  circle2:  {
    position: 'absolute', bottom: -40, right: 50,
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  iconWrap: {
    width: 56, height: 56, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  title:   { fontSize: 20, fontWeight: '900', color: '#FFFFFF' },
  tagPill: {
    alignSelf: 'flex-start', marginTop: 4, marginBottom: 6,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3,
  },
  tagText: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.9)' },
  desc:    { fontSize: 12, color: 'rgba(255,255,255,0.7)', lineHeight: 17 },
  arrowWrap: {
    width: 36, height: 36, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  arrow: { fontSize: 24, color: '#FFFFFF', marginTop: -2 },
});

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN SCREEN
// ═══════════════════════════════════════════════════════════════════════════════
export default function ChooseTypeScreen({ navigation }) {
  const logout        = useAuthStore((state) => state.logout);
  const setVendorType = useAuthStore((state) => state.setVendorType);

  return (
    <View style={s.root}>
      <SafeAreaView style={s.safeTop} />
      <StatusBar barStyle="light-content" backgroundColor={P.tealDeep} />

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ═══ HEADER — mirrors ResidentDashboard header ═══ */}
        <View style={s.header}>

          {/* Top row: back + title */}
          <View style={s.headerTop}>
            <TouchableOpacity style={s.backBtn} onPress={logout} activeOpacity={0.75}>
              <Text style={s.backArrow}>←</Text>
            </TouchableOpacity>
            <Text style={s.headerLabel}>Vendor Portal</Text>
            <View style={{ width: 42 }} />
          </View>

          {/* Hero greeting + title + pill */}
          <Text style={s.greeting}>Welcome back 👋</Text>
          <Text style={s.heroTitle}>Choose Your{'\n'}Business Type</Text>
          <View style={s.subtitlePill}>
            <Text style={s.subtitleText}>Select how you want to operate</Text>
          </View>
        </View>

        {/* ═══ BODY — exact match: borderTopRadius 28, bg P.bg, padding 20 pt 24 ═══ */}
        <View style={s.body}>

          {/* Section heading */}
          <View style={s.sectionRow}>
            <Text style={s.sectionTitle}>Select a category</Text>
            <View style={s.sectionLine} />
          </View>

          {/* Business */}
          <TypeCard
            emoji="🔧"
            title="Business"
            tag="Local Services"
            desc="Offer skilled services to residents — plumbing, electrical, carpentry & more"
            cardColor={P.purple}
            onPress={() => { setVendorType('business'); navigation.navigate('BusinessHome'); }}
            delay={80}
          />

          {/* Marketplace */}
          <TypeCard
            emoji="🛒"
            title="Marketplace"
            tag="Store & Delivery"
            desc="Sell products online, manage inventory & handle doorstep deliveries"
            cardColor={P.teal}
            onPress={() => { setVendorType('marketplace'); navigation.navigate('MarketplaceHome'); }}
            delay={180}
          />

          {/* Features card — mirrors activityCard style */}
          <View style={s.featureCard}>
            <Text style={s.featureHeading}>What's included</Text>
            {FEATURES.map((f, i) => (
              <View key={i} style={[s.featureRow, i < FEATURES.length - 1 && s.featureDivider]}>
                <View style={s.featureIconWrap}>
                  <Text style={{ fontSize: 16 }}>{f.emoji}</Text>
                </View>
                <Text style={s.featureText}>{f.text}</Text>
              </View>
            ))}
          </View>

          {/* Sign out */}
          <TouchableOpacity style={s.logoutRow} onPress={logout} activeOpacity={0.7}>
            <Text style={s.logoutText}>Sign out  ›</Text>
          </TouchableOpacity>

          <View style={{ height: 36 }} />
        </View>
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root:          { flex: 1, backgroundColor: P.tealDeep },
  safeTop:       { backgroundColor: P.tealDeep },
  scroll:        { flex: 1 },
  scrollContent: { paddingBottom: 0 },

  // Header
  header: {
    backgroundColor: P.tealDeep,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 28,
  },
  headerTop: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 24,
  },
  backBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },
  backArrow:   { fontSize: 22, color: '#FFFFFF', marginTop: -1 },
  headerLabel: {
    fontSize: 13, fontWeight: '700',
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 1.2, textTransform: 'uppercase',
  },

  greeting:  { fontSize: 13, color: 'rgba(255,255,255,0.55)', fontWeight: '600' },
  heroTitle: {
    fontSize: 28, fontWeight: '900', color: '#FFFFFF',
    marginTop: 4, marginBottom: 12, lineHeight: 34,
  },
  subtitlePill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6,
  },
  subtitleText: { fontSize: 12, color: 'rgba(255,255,255,0.75)', fontWeight: '600' },

  // Body
  body: {
    backgroundColor: P.bg,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    paddingTop: 24,
    minHeight: 500,
  },

  sectionRow:   { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 10 },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: P.text, letterSpacing: 0.3 },
  sectionLine:  { flex: 1, height: 1, backgroundColor: P.border },

  // Feature card — mirrors activityCard
  featureCard: {
    backgroundColor: P.surface,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingTop: 14,
    borderWidth: 1,
    borderColor: P.border,
    marginTop: 4,
    marginBottom: 6,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  featureHeading: {
    fontSize: 13, fontWeight: '800', color: P.text,
    marginBottom: 10, letterSpacing: 0.3,
  },
  featureRow:     { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  featureDivider: { borderBottomWidth: 1, borderBottomColor: P.border },
  featureIconWrap: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: P.tealSoft,
    alignItems: 'center', justifyContent: 'center',
  },
  featureText: { fontSize: 13, color: P.textSub, flex: 1, fontWeight: '500' },

  logoutRow: { alignItems: 'center', marginTop: 20, paddingVertical: 8 },
  logoutText:{ fontSize: 13, fontWeight: '700', color: P.textMuted },
});
