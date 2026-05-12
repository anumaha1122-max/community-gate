import React, { useState } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, StatusBar, Switch,
} from 'react-native';
import { Colors, Fonts, Radius, Shadows } from '../../../vendor/theme';
import { AppHeader, Card, PrimaryButton, Divider, Badge, SectionTitle } from '../../../vendor/components';
import { MarketplaceTabBar } from '../../../vendor/components/TabBars';

// ─── StoreSetupScreen ─────────────────────────────────────────────────────────
import { useTheme } from '../../../hooks/useTheme';

export default function MarketplaceHomeScreen({ navigation }) {
  const QUICK = [
    { emoji: '➕', label: 'Add Product', screen: 'AddProduct',       color: Colors.teal,  bg: Colors.tealLight  },
    { emoji: '📦', label: 'New Order',   screen: 'OrdersList',        color: Colors.green, bg: Colors.greenLight },
    { emoji: '🏪', label: 'Manage Store',screen: 'MarketplaceProfile',       color: Colors.blue,  bg: Colors.blueLight  },
    { emoji: '💰', label: 'Earnings',    screen: 'MarketplaceEarnings',color: Colors.amber, bg: Colors.amberLight },
  ];
  const RECENT = [
    { id: '#ORD12345', name: 'Ramesh Kumar',  status: 'Delivered',        statusColor: Colors.green, statusBg: Colors.greenLight },
    { id: '#ORD12344', name: 'Anita Sharma',  status: 'Out for Delivery',  statusColor: Colors.blue,  statusBg: Colors.blueLight  },
    { id: '#ORD12343', name: 'Vikram Singh',  status: 'Preparing',         statusColor: Colors.amber, statusBg: Colors.amberLight },
  ];

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.teal} />

      <View style={s.mktHero}>
        <View style={s.mktHeroCircle} />
        <TouchableOpacity style={s.heroBackBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Text style={s.heroBackArrow}>‹</Text>
        </TouchableOpacity>
        <View style={s.mktHeroTop}>
          <View>
            <Text style={s.mktGreet}>Hello,</Text>
            <Text style={s.mktName}>Fresh Mart 🛒</Text>
          </View>
          <TouchableOpacity style={s.mktBell} activeOpacity={0.8}>
            <Text style={{ fontSize: 20 }}>🔔</Text>
            <View style={s.bellDot} />
          </TouchableOpacity>
        </View>
        <Text style={s.mktSubtitle}>Today's Overview</Text>
        <View style={s.statsRow}>
          {[['12','New Orders'],['8','Preparing'],['15','Out for Del.'],['₹8,450','Today\'s Sales']].map(([v, l], i) => (
            <View key={i} style={s.statBox}>
              <Text style={[s.statValue, i === 3 && { fontSize: 12 }]}>{v}</Text>
              <Text style={s.statLabel}>{l}</Text>
            </View>
          ))}
        </View>
      </View>

      <ScrollView contentContainerStyle={[s.scroll, { paddingTop: 14 }]} showsVerticalScrollIndicator={false}>
        <View style={s.gridRow}>
          {QUICK.map((a, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => navigation.navigate(a.screen)}
              activeOpacity={0.78}
              style={[s.actionCard, { backgroundColor: a.bg }]}
            >
              <View style={[s.actionIconBox]}>
                <Text style={{ fontSize: 18 }}>{a.emoji}</Text>
              </View>
              <Text style={[s.actionLabel, { color: a.color }]}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Low Stock Alert */}
        <Card style={{ backgroundColor: Colors.redLight, borderColor: Colors.red + '40', marginBottom: 14 }}>
          <Text style={{ fontSize: 13, fontWeight: Fonts.bold, color: Colors.red, marginBottom: 8 }}>⚠️  Low Stock Alert</Text>
          {[['Toor Dal 1kg', '2 units left'], ['Sunflower Oil 1L', '3 units left']].map(([n, q], i) => (
            <View key={i} style={[{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 }, i === 0 && { borderBottomWidth: 1, borderBottomColor: Colors.red + '20' }]}>
              <Text style={{ fontSize: 13, color: Colors.text }}>{n}</Text>
              <Text style={{ fontSize: 12, fontWeight: Fonts.bold, color: Colors.red }}>{q} — Restock</Text>
            </View>
          ))}
        </Card>

        <SectionTitle title="Recent Orders" onAction={() => navigation.navigate('VendorOrders')} />
        {RECENT.map((o, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => navigation.navigate('OrderDetails', { order: o })}
            activeOpacity={0.8}
            style={s.jobCard}
          >
            <View style={[s.jobIcon, { backgroundColor: o.statusBg }]}>
              <Text style={{ fontSize: 20 }}>📦</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={s.jobRow}>
                <Text style={s.jobId}>{o.id}</Text>
                <Badge label={o.status} color={o.statusColor} bg={o.statusBg} />
              </View>
              <Text style={s.jobName}>{o.name}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <MarketplaceTabBar
        activeTab="Home"
        onTabPress={(tab) => {
          if (tab === 'Orders')   navigation.navigate('VendorOrders');
          if (tab === 'Products') navigation.navigate('ProductList');
          if (tab === 'Earnings') navigation.navigate('MarketplaceEarnings');
          if (tab === 'More')     navigation.navigate('MarketplaceProfile');
        }}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: Colors.bg },
  scroll: { padding: 16, paddingBottom: 90 },
  footer: { padding: 16, backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.border },

  logoBox:  { alignItems: 'center', borderWidth: 2, borderStyle: 'dashed', borderColor: Colors.border, borderRadius: Radius.lg, paddingVertical: 24, marginBottom: 12, gap: 8 },
  logoText: { fontSize: 13, color: Colors.text3 },

  label: { fontSize: 12, fontWeight: Fonts.semiBold, color: Colors.text2, marginBottom: 6 },
  input: { borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.md, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: Colors.text },

  radioRow:   { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  radioOuter: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  radioInner: { width: 10, height: 10, borderRadius: 5 },
  radioLabel: { fontSize: 14, color: Colors.text },

  docRow:    { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10 },
  docBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  docName:   { flex: 1, fontSize: 13, color: Colors.text },
  uploadBtn: { paddingHorizontal: 14, paddingVertical: 7, backgroundColor: Colors.tealLight, borderRadius: Radius.md },
  uploadBtnText: { fontSize: 12, fontWeight: Fonts.bold, color: Colors.teal },

  verifiedWrapper: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  verifiedIcon: { width: 110, height: 110, borderRadius: 55, backgroundColor: Colors.greenLight, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  verifiedTitle:{ fontSize: 24, fontWeight: Fonts.extraBold, color: Colors.text, textAlign: 'center', lineHeight: 30 },
  verifiedSub:  { fontSize: 14, color: Colors.text2, textAlign: 'center', marginTop: 8, marginBottom: 24 },
  verifiedCard: { width: '100%', marginBottom: 24 },
  checkRow:  { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  checkCircle:{ width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.greenLight, alignItems: 'center', justifyContent: 'center' },
  checkText: { fontSize: 14, color: Colors.text },

  mktHero: { backgroundColor: Colors.teal, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 20, overflow: 'hidden', position: 'relative' },
  mktHeroCircle: { position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.08)' },
  mktHeroTop:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  mktGreet:    { fontSize: 14, color: 'rgba(255,255,255,0.75)' },
  mktName:     { fontSize: 20, fontWeight: Fonts.extraBold, color: '#fff' },
  mktBell:     { width: 42, height: 42, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  bellDot:     { position: 'absolute', top: 7, right: 7, width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF4757' },
  mktSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 14 },
  statsRow:    { flexDirection: 'row', gap: 8 },
  statBox:     { flex: 1, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 6, alignItems: 'center' },
  statValue:   { fontSize: 18, fontWeight: Fonts.extraBold, color: '#fff' },
  statLabel:   { fontSize: 10, color: 'rgba(255,255,255,0.7)', marginTop: 3, lineHeight: 13, textAlign: 'center' },

  gridRow:    { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 },
  actionCard: { width: '48%', borderRadius: Radius.lg, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  actionIconBox: { width: 38, height: 38, borderRadius: Radius.md, backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  actionLabel:{ fontSize: 13, fontWeight: Fonts.bold, flex: 1 },

  jobCard: { backgroundColor: Colors.white, borderRadius: Radius.lg, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: Colors.border, ...Shadows.card },
  jobIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  jobRow:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 },
  jobId:   { fontSize: 14, fontWeight: Fonts.extraBold, color: Colors.text, flex: 1, marginRight: 8 },
  jobName: { fontSize: 12, color: Colors.text2 },

  heroBackBtn:   { position: 'absolute', top: 48, left: 16, width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', zIndex: 10 },
  heroBackArrow: { fontSize: 22, color: '#fff', fontWeight: '700', marginTop: -2 },
  topBackBtn:    { position: 'absolute', top: 48, left: 16, width: 36, height: 36, borderRadius: 12, backgroundColor: Colors.bg, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center', zIndex: 10 },
  topBackArrow:  { fontSize: 22, color: Colors.text, fontWeight: '700', marginTop: -2 },
});
