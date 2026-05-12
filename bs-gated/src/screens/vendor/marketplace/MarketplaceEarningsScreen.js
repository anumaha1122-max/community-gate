import React, { useState } from 'react';
import {
  View, Text, ScrollView, FlatList, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, StatusBar, Alert,
} from 'react-native';
import { Colors, Fonts, Radius, Shadows } from '../../../vendor/theme';
import { AppHeader, Card, PrimaryButton, Divider, Badge, Avatar, SectionTitle, TabChip } from '../../../vendor/components';
import { MarketplaceTabBar } from '../../../vendor/components/TabBars';
import useAppStore from '../../../store/appStore';
import { useTheme } from '../../../hooks/useTheme';

const EMOJIS = ['🍚','🫙','🫘','🌾','🍬','🧂','🧈','🥛','🥚','🧅','🍅','🥦','🧃','🍫','🫐','📦'];

// ─── ProductListScreen ────────────────────────────────────────────────────────

export default function MarketplaceEarningsScreen({ navigation }) {
  const theme = useTheme();
  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.teal} />
      <View style={s.mktEarningsHero}>
        <View style={s.mktHeroCircle} />
        <TouchableOpacity style={s.heroBackBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Text style={s.heroBackArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={s.earningsTitle}>Sales Overview</Text>
        <Text style={s.earningsSub}>This Month — May 2024</Text>
        <Text style={s.earningsAmt}>₹25,680</Text>
        <Text style={s.earningsDelta}>↑ 16.8% from last month</Text>
        <View style={s.periodTabs}>
          {['W','M','3M','Y'].map((t, i) => (
            <TouchableOpacity key={t} style={[s.periodTab, i === 1 && s.periodTabActive]} activeOpacity={0.75}>
              <Text style={[s.periodTabText, i === 1 && { color: Colors.teal }]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView contentContainerStyle={[s.scroll, { paddingTop: 14 }]} showsVerticalScrollIndicator={false}>
        <View style={s.statsGridRow}>
          {[
            { label: 'Total Orders',value: '145',   color: Colors.teal,  bg: Colors.tealLight  },
            { label: 'Delivered',   value: '138',   color: Colors.green, bg: Colors.greenLight  },
            { label: 'Avg. Order',  value: '₹177',  color: Colors.amber, bg: Colors.amberLight  },
            { label: 'Returns',     value: '7',     color: Colors.red,   bg: Colors.redLight    },
          ].map((c, i) => (
            <View key={i} style={[s.statGridCard, { backgroundColor: c.bg }]}>
              <Text style={[s.statGridVal, { color: c.color }]}>{c.value}</Text>
              <Text style={[s.statGridLabel, { color: c.color }]}>{c.label}</Text>
            </View>
          ))}
        </View>

        <SectionTitle title="Top Selling Products" />
        {[
          ['🍚','Basmati Rice 1kg', 330, '₹39,600'],
          ['🫙','Sunflower Oil 1L', 250, '₹37,500'],
          ['🫘','Toor Dal 1kg',     200, '₹22,000'],
          ['🌾','Wheat Flour 1kg',  180, '₹7,200' ],
        ].map(([e, n, units, rev], i) => (
          <Card key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={[s.itemEmoji, { backgroundColor: Colors.tealLight }]}>
              <Text style={{ fontSize: 24 }}>{e}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.itemName}>{n}</Text>
              <Text style={s.itemQty}>{units} units sold</Text>
            </View>
            <Text style={[s.txnAmt, { color: Colors.teal }]}>{rev}</Text>
          </Card>
        ))}
      </ScrollView>

      <MarketplaceTabBar activeTab="Earnings" onTabPress={(tab) => {
        if (tab === 'Home')     navigation.navigate('MarketplaceHome');
        if (tab === 'Orders')   navigation.navigate('VendorOrders');
        if (tab === 'Products') navigation.navigate('ProductList');
        if (tab === 'More')     navigation.navigate('MarketplaceProfile');
      }} />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: Colors.bg },
  scroll: { padding: 16, paddingBottom: 100 },
  footer: { padding: 16, backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.border },

  listHeader: { backgroundColor: Colors.teal, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16 },
  listHeaderTop: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  backBtn:   { width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.bg, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  backArrow: { fontSize: 22, color: Colors.text, fontWeight: '700', marginTop: -2 },
  heading: { fontSize: 22, fontWeight: Fonts.extraBold, color: Colors.text, flex: 1 },
  addBtn: { width: 38, height: 38, borderRadius: Radius.md, backgroundColor: Colors.teal, alignItems: 'center', justifyContent: 'center' },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, backgroundColor: Colors.bg, borderRadius: Radius.md, marginBottom: 12 },
  searchPlaceholder: { fontSize: 14, color: Colors.text3 },
  tabRow: { flexDirection: 'row', gap: 8, paddingBottom: 14 },

  productGrid: { padding: 12, paddingBottom: 90 },
  productCard: { flex: 1, backgroundColor: Colors.white, borderRadius: Radius.lg, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: Colors.border, ...Shadows.card },
  productEmoji: { height: 88, backgroundColor: Colors.bg, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  productName: { fontSize: 13, fontWeight: Fonts.bold, color: Colors.text },
  productPrice: { fontSize: 15, fontWeight: Fonts.extraBold, color: Colors.teal },
  lowStockText: { fontSize: 11, color: Colors.red, marginTop: 5, fontWeight: Fonts.medium },
  miniBtn: { paddingVertical: 6, paddingHorizontal: 8, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  deleteBtn: { alignItems: 'center', paddingVertical: 10, borderRadius: 10, borderWidth: 1.5, borderColor: '#FCA5A5', backgroundColor: '#FFF5F5' },

  label: { fontSize: 12, fontWeight: Fonts.semiBold, color: Colors.text2, marginBottom: 6 },
  input: { borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.md, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: Colors.text },

  imageUploadBox: { height: 130, backgroundColor: Colors.bg, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderStyle: 'dashed', borderColor: Colors.border, gap: 6 },
  imageUploadText: { fontSize: 13, color: Colors.text3 },
  thumbBox: { width: 62, height: 62, borderRadius: 10, backgroundColor: Colors.tealLight, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: Colors.teal },
  thumbAdd: { backgroundColor: Colors.bg, borderColor: Colors.border, borderStyle: 'dashed' },
  offerChip: { paddingHorizontal: 10, paddingVertical: 7, borderRadius: Radius.md, backgroundColor: Colors.bg, borderWidth: 1, borderColor: Colors.border },
  offerChipText: { fontSize: 12, color: Colors.text2, fontWeight: Fonts.medium },

  listContent: { padding: 16, paddingBottom: 90 },
  orderCard: { backgroundColor: Colors.white, borderRadius: Radius.lg, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: Colors.border, ...Shadows.card },
  orderTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  orderId:  { fontSize: 15, fontWeight: Fonts.extraBold, color: Colors.text },
  orderName:{ fontSize: 14, fontWeight: Fonts.bold, color: Colors.text },
  orderMeta:{ fontSize: 11, color: Colors.text3, marginTop: 2 },
  orderActionBtn: { flex: 1, paddingVertical: 11, borderRadius: Radius.md, alignItems: 'center' },
  orderActionText:{ fontSize: 13, fontWeight: Fonts.bold },

  customerName: { fontSize: 16, fontWeight: Fonts.bold, color: Colors.text },
  customerLoc:  { fontSize: 12, color: Colors.text2, marginTop: 2, lineHeight: 17 },
  sectionLabel: { fontSize: 14, fontWeight: Fonts.bold, color: Colors.text, marginBottom: 12 },
  itemRow:   { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10 },
  itemBorder:{ borderBottomWidth: 1, borderBottomColor: Colors.border },
  itemEmoji: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  itemName:  { fontSize: 13, fontWeight: Fonts.bold, color: Colors.text },
  itemQty:   { fontSize: 12, color: Colors.text3, marginTop: 2 },
  itemPrice: { fontSize: 14, fontWeight: Fonts.extraBold, color: Colors.teal },
  rowKey:    { fontSize: 13, color: Colors.text2 },
  rowVal:    { fontSize: 13, fontWeight: Fonts.semiBold, color: Colors.text },
  footerBtn: { flex: 1, paddingVertical: 14, borderRadius: Radius.md, alignItems: 'center' },
  footerBtnText: { fontSize: 15, fontWeight: Fonts.bold },

  trackCircle: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  trackLine:   { width: 2, height: 30, marginTop: 2 },
  callBtn:     { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  mapBtn:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 14, backgroundColor: Colors.tealLight, borderRadius: Radius.md, marginTop: 8 },
  mapBtnText:  { fontSize: 14, fontWeight: Fonts.bold, color: Colors.teal },

  menuItem:   { backgroundColor: Colors.white, borderRadius: Radius.lg, padding: 14, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: Colors.border, ...Shadows.card },
  menuIcon:   { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  menuLabel:  { fontSize: 14, fontWeight: Fonts.bold, color: Colors.text },
  menuSub:    { fontSize: 12, color: Colors.text3, marginTop: 2 },
  toggleBase: { width: 44, height: 24, borderRadius: 12, backgroundColor: Colors.border },
  toggleThumb:{ position: 'absolute', left: 2, top: 2, width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff' },
  uploadBtn:  { paddingHorizontal: 14, paddingVertical: 7, borderRadius: Radius.md },
  uploadBtnText: { fontSize: 12, fontWeight: Fonts.bold, color: Colors.teal },

  mktEarningsHero: { backgroundColor: Colors.teal, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 20, overflow: 'hidden', position: 'relative' },
  mktHeroCircle:   { position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.08)' },
  earningsTitle:   { fontSize: 18, fontWeight: Fonts.extraBold, color: '#fff' },
  earningsSub:     { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 4 },
  earningsAmt:     { fontSize: 36, fontWeight: Fonts.extraBold, color: '#fff', marginTop: 2 },
  earningsDelta:   { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 14 },
  periodTabs:     { flexDirection: 'row', gap: 8 },
  periodTab:      { paddingHorizontal: 14, paddingVertical: 7, borderRadius: Radius.md, backgroundColor: 'rgba(255,255,255,0.15)' },
  periodTabActive:{ backgroundColor: '#fff' },
  periodTabText:  { fontSize: 12, fontWeight: Fonts.bold, color: '#fff' },

  statsGridRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  statGridCard: { width: '48%', borderRadius: Radius.md, padding: 14, alignItems: 'center' },
  statGridVal:  { fontSize: 22, fontWeight: Fonts.extraBold, marginBottom: 3 },
  statGridLabel:{ fontSize: 12, fontWeight: Fonts.medium, opacity: 0.8 },
  txnAmt:       { fontSize: 14, fontWeight: Fonts.extraBold, color: Colors.green },

  heroBackBtn:   { position: 'absolute', top: 48, left: 16, width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', zIndex: 10 },
  heroBackArrow: { fontSize: 22, color: '#fff', fontWeight: '700', marginTop: -2 },
});
