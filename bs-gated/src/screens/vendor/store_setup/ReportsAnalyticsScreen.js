import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, StatusBar, Alert, Switch,
} from 'react-native';
import { Colors, Fonts, Radius, Shadows } from '../../../vendor/theme';
import { AppHeader, Card, PrimaryButton, InputField, Divider, Badge } from '../../../vendor/components';
import { MarketplaceTabBar } from '../../../vendor/components/TabBars';
import { useTheme } from '../../../hooks/useTheme';

// ─── StoreProfileScreen ───────────────────────────────────────────────────────

export default function ReportsAnalyticsScreen({ navigation }) {
  const theme = useTheme();
  const STATS = [
    { label: 'Total Orders',   value: '312',      color: Colors.teal,   bg: Colors.tealLight   },
    { label: 'Revenue',        value: '₹1.2L',    color: Colors.green,  bg: Colors.greenLight  },
    { label: 'Avg Order Val',  value: '₹385',     color: Colors.purple, bg: Colors.purpleLight },
    { label: 'Return Rate',    value: '2.1%',      color: Colors.amber,  bg: Colors.amberLight  },
  ];

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle={theme.mode === 'light' ? 'dark-content' : 'light-content'} backgroundColor={theme.header} />
      <AppHeader title="Reports & Analytics" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        <View style={s.statsGrid}>
          {STATS.map((stat, i) => (
            <View key={i} style={[s.statCard, { backgroundColor: stat.bg }]}>
              <Text style={[s.statVal, { color: stat.color }]}>{stat.value}</Text>
              <Text style={[s.statLabel, { color: stat.color }]}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <Card style={{ marginBottom: 12 }}>
          <Text style={s.sectionLabel}>Top Products This Month</Text>
          {[
            { name: 'Tata Salt 1kg',         orders: 48, revenue: '₹2,400' },
            { name: 'Aashirvaad Atta 5kg',   orders: 35, revenue: '₹5,250' },
            { name: 'Amul Milk 500ml',        orders: 62, revenue: '₹3,100' },
            { name: 'Surf Excel 1kg',         orders: 29, revenue: '₹4,350' },
          ].map((p, i) => (
            <View key={i} style={[s.detailRow, i < 3 && s.detailBorder]}>
              <Text style={[s.detailKey, { flex: 1 }]}>{p.name}</Text>
              <Text style={s.detailSub}>{p.orders} orders</Text>
              <Text style={[s.detailVal, { color: Colors.green, marginLeft: 12 }]}>{p.revenue}</Text>
            </View>
          ))}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: Colors.bg },
  scroll: { padding: 16, paddingBottom: 100 },

  profileHero: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: 20,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.card,
  },
  storeLogoCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.tealLight,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
  },
  profileName:     { fontSize: 20, fontWeight: Fonts.extraBold, color: Colors.text },
  profileCategory: { fontSize: 13, color: Colors.teal, fontWeight: Fonts.semiBold, marginTop: 4, marginBottom: 12 },
  badgeRow:        { flexDirection: 'row', gap: 8 },

  sectionLabel: { fontSize: 13, fontWeight: Fonts.bold, color: Colors.text2, marginBottom: 10 },

  toggleRow:    { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  toggleLabel:  { fontSize: 14, fontWeight: Fonts.semiBold, color: Colors.text },
  toggleSub:    { fontSize: 11, color: Colors.text3, marginTop: 2 },

  detailRow:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 },
  detailBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  detailKey:    { fontSize: 13, color: Colors.text2 },
  detailSub:    { fontSize: 12, color: Colors.text3 },
  detailVal:    { fontSize: 13, fontWeight: Fonts.semiBold, color: Colors.text },

  menuRow:   { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  menuIcon:  { width: 36, height: 36, borderRadius: Radius.md, backgroundColor: Colors.tealLight, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  menuLabel: { fontSize: 14, fontWeight: Fonts.semiBold, color: Colors.text },
  menuSub:   { fontSize: 11, color: Colors.text3, marginTop: 2 },
  menuArrow: { fontSize: 20, color: Colors.text3 },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 12 },
  statCard:  { width: '48%', borderRadius: Radius.md, padding: 14, alignItems: 'center' },
  statVal:   { fontSize: 22, fontWeight: Fonts.extraBold, marginBottom: 3 },
  statLabel: { fontSize: 12, fontWeight: Fonts.medium, opacity: 0.85 },

  logoRow:       { alignItems: 'center', marginBottom: 16 },
  logoCircle:    { width: 90, height: 90, borderRadius: 45, backgroundColor: Colors.tealLight, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  changeLogoBtn: { backgroundColor: Colors.teal, borderRadius: Radius.md, paddingHorizontal: 16, paddingVertical: 8 },
  changeLogoText:{ fontSize: 13, fontWeight: Fonts.semiBold, color: '#fff' },

  offerRow:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  couponBox:   { backgroundColor: Colors.tealLight, borderRadius: Radius.md, paddingHorizontal: 10, paddingVertical: 6 },
  couponCode:  { fontSize: 13, fontWeight: Fonts.extraBold, color: Colors.teal },
  offerDesc:   { fontSize: 13, color: Colors.text, marginBottom: 4 },
  offerExpiry: { fontSize: 11, color: Colors.text3 },

  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF1F1',
    borderRadius: Radius.lg,
    paddingVertical: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FFCCCC',
  },
  logoutIcon: { fontSize: 18, marginRight: 8 },
  logoutText: { fontSize: 16, fontWeight: Fonts.bold, color: '#E53E3E' },
  version:    { textAlign: 'center', fontSize: 12, color: Colors.text3, marginBottom: 8 },
});
