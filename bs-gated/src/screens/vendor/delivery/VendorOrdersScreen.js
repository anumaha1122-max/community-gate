/**
 * VendorDeliveryWorkflow.js
 * ──────────────────────────────────────────────────────────────────────────────
 * TEMPORARY / TESTING ONLY — Dummy delivery partner workflow inside Vendor.
 * This file can be removed once a real third-party delivery integration is added.
 *
 * Screens exported:
 *   VendorOrdersWithDeliveryScreen — enhanced orders list (replaces OrdersListScreen)
 *   VendorAssignDeliveryScreen     — pick a dummy delivery partner + see OTP
 *   VendorDeliveryStatusScreen     — live status of a specific order, mark delivered
 *
 * All screens read/write the global Zustand store (useStore).
 */

import React, { useState } from 'react';
import {
  View, Text, ScrollView, FlatList, TouchableOpacity,
  StyleSheet, SafeAreaView, StatusBar, Alert, TextInput,
} from 'react-native';
import { Colors, Fonts, Radius, Shadows } from '../../../vendor/theme';
import { AppHeader, Card, PrimaryButton, Badge, Avatar, Divider } from '../../../vendor/components';
import { MarketplaceTabBar } from '../../../vendor/components/TabBars';
import useAppStore from '../../../store/appStore';
import { useTheme } from '../../../hooks/useTheme';

// ─── Dummy delivery partners ──────────────────────────────────────────────────
const DUMMY_PARTNERS = [
  { id: 'dp1', name: 'Rajesh Kumar',  phone: '98765 43210', vehicle: 'Bike · UP16 AB 1234', emoji: '🏍️' },
  { id: 'dp2', name: 'Suresh Singh',  phone: '87654 32109', vehicle: 'Bike · UP14 CD 5678', emoji: '🏍️' },
  { id: 'dp3', name: 'Anil Sharma',   phone: '76543 21098', vehicle: 'Cycle · N/A',          emoji: '🚲' },
];

// ─── Helper ───────────────────────────────────────────────────────────────────
const fmt = (d) => d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';

const STATUS_META = {
  pending:           { label: 'New',              color: Colors.amber,   bg: Colors.amberLight  },
  accepted:          { label: 'Confirmed',         color: Colors.teal,    bg: Colors.tealLight   },
  assigned_delivery: { label: 'Delivery Assigned', color: Colors.blue,    bg: Colors.blueLight   },
  out_for_delivery:  { label: 'Out for Delivery',  color: Colors.blue,    bg: Colors.blueLight   },
  delivered:         { label: 'Delivered ✅',       color: Colors.green,   bg: Colors.greenLight  },
  rejected:          { label: 'Rejected',          color: '#C62828',      bg: '#FEE2E2'          },
  returned:          { label: 'Returned 📦',        color: '#E8A020',      bg: '#FFF7ED'          },
};

// ─── 1. VendorOrdersWithDeliveryScreen ───────────────────────────────────────
// Enhanced version of the original OrdersListScreen that includes delivery management

export default function VendorOrdersScreen({ navigation }) {
  const theme = useTheme();
  const orders            = useAppStore(s => s.marketplaceOrders);
  const vendorAcceptOrder = useAppStore(s => s.vendorAcceptOrder);
  const vendorRejectOrder = useAppStore(s => s.vendorRejectOrder);
  const [tab, setTab]     = useState('pending');

  const TABS = [
    { key: 'pending',   label: 'New'       },
    { key: 'accepted',  label: 'Confirmed' },
    { key: 'delivery',  label: 'Delivery'  },
    { key: 'delivered', label: 'Delivered' },
    { key: 'returns',   label: 'Returns'   },
  ];

  const filtered = orders.filter(o => {
    if (tab === 'pending')   return o.status === 'pending';
    if (tab === 'accepted')  return o.status === 'accepted';
    if (tab === 'delivery')  return ['assigned_delivery', 'out_for_delivery'].includes(o.status);
    if (tab === 'delivered') return ['delivered', 'rejected'].includes(o.status);
    if (tab === 'returns')   return o.status === 'returned';
    return true;
  });

  const handleAccept = (orderId) => {
    Alert.alert('Accept Order', 'Confirm and accept this order?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Accept', onPress: () => vendorAcceptOrder(orderId) },
    ]);
  };

  const handleReject = (orderId) => {
    Alert.alert('Reject Order', 'Are you sure you want to reject this order?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reject', style: 'destructive', onPress: () => vendorRejectOrder(orderId) },
    ]);
  };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#1A7A7A" />
      <View style={s.listHeader}>
        <View style={[s.listHeaderTop, { marginBottom: 0 }]}>
          <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Text style={s.backArrow}>‹</Text>
          </TouchableOpacity>
          <Text style={s.heading}>Orders</Text>
          <View style={[s.dummyBadge]}>
            <Text style={s.dummyBadgeText}>⚠️ Test Mode</Text>
          </View>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 12, gap: 8, flexDirection: 'row' }}>
          {TABS.map(t => (
            <TouchableOpacity
              key={t.key}
              onPress={() => setTab(t.key)}
              style={[s.catChip, tab === t.key && { backgroundColor: Colors.teal, borderColor: Colors.teal }]}
              activeOpacity={0.7}
            >
              <Text style={[s.catChipText, tab === t.key && { color: theme.card }]}>
                {t.label} ({orders.filter(o => {
                  if (t.key === 'pending')   return o.status === 'pending';
                  if (t.key === 'accepted')  return o.status === 'accepted';
                  if (t.key === 'delivery')  return ['assigned_delivery','out_for_delivery'].includes(o.status);
                  if (t.key === 'delivered') return ['delivered','rejected'].includes(o.status);
                  if (t.key === 'returns')   return o.status === 'returned';
                  return false;
                }).length})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {filtered.length === 0 ? (
        <View style={s.emptyContainer}>
          <Text style={{ fontSize: 48, marginBottom: 12 }}>📦</Text>
          <Text style={s.emptyTitle}>No orders here</Text>
        </View>
      ) : (
        <FlatList
          data={[...filtered].sort((a, b) => new Date(b.placedAt) - new Date(a.placedAt))}
          keyExtractor={o => o.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 90 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const meta = STATUS_META[item.status] || STATUS_META.pending;
            return (
              <TouchableOpacity
                style={s.orderCard}
                onPress={() => navigation.navigate('VendorDeliveryStatus', { orderId: item.id })}
                activeOpacity={0.85}
              >
                <View style={s.orderTop}>
                  <Text style={s.orderId}>#{item.id}</Text>
                  <Badge label={meta.label} color={meta.color} bg={meta.bg} />
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <Avatar name={item.residentName} size={38} color={Colors.teal} />
                  <View>
                    <Text style={s.orderName}>{item.residentName}</Text>
                    <Text style={s.orderMeta}>Unit {item.unit} · {item.items.length} item{item.items.length > 1 ? 's' : ''} · ₹{item.total}</Text>
                    <Text style={s.orderMeta}>{fmt(item.placedAt)}</Text>
                  </View>
                </View>

                {/* OTP chip */}
                {item.otp && item.status !== 'delivered' && item.status !== 'rejected' && (
                  <View style={s.otpChip}>
                    <Text style={s.otpChipLabel}>🔑 OTP:</Text>
                    <Text style={s.otpChipValue}>{item.otp}</Text>
                    <Text style={s.otpChipSub}>{item.otpVerified ? '✓ Guard Verified' : 'Guard not verified yet'}</Text>
                  </View>
                )}

                {/* Actions */}
                {item.status === 'pending' && (
                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                    <TouchableOpacity style={[s.actionBtn, { backgroundColor: theme.surface }]} onPress={() => handleReject(item.id)} activeOpacity={0.8}>
                      <Text style={[s.actionBtnText, { color: theme.danger }]}>✗  Reject</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[s.actionBtn, { backgroundColor: Colors.teal, flex: 2 }]} onPress={() => handleAccept(item.id)} activeOpacity={0.8}>
                      <Text style={[s.actionBtnText, { color: theme.card }]}>✓  Accept</Text>
                    </TouchableOpacity>
                  </View>
                )}
                {item.status === 'accepted' && (
                  <TouchableOpacity
                    style={[s.actionBtn, { backgroundColor: Colors.blueLight, marginTop: 4 }]}
                    onPress={() => navigation.navigate('VendorAssignDelivery', { orderId: item.id })}
                    activeOpacity={0.8}
                  >
                    <Text style={[s.actionBtnText, { color: Colors.blue }]}>🚚  Assign Delivery Partner</Text>
                  </TouchableOpacity>
                )}
                {item.status === 'out_for_delivery' && !item.otpVerified && (
                  <View style={[s.otpChip, { backgroundColor: Colors.amberLight }]}>
                    <Text style={[s.otpChipSub, { color: Colors.amber }]}>⏳ Waiting for guard to verify OTP...</Text>
                  </View>
                )}
                {item.status === 'out_for_delivery' && item.otpVerified && (
                  <TouchableOpacity
                    style={[s.actionBtn, { backgroundColor: Colors.greenLight, marginTop: 4 }]}
                    onPress={() => navigation.navigate('VendorDeliveryStatus', { orderId: item.id })}
                    activeOpacity={0.8}
                  >
                    <Text style={[s.actionBtnText, { color: Colors.green }]}>📦  Mark as Delivered</Text>
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            );
          }}
        />
      )}

      <MarketplaceTabBar activeTab="Orders" onTabPress={(tab) => {
        if (tab === 'Home')     navigation.navigate('MarketplaceHome');
        if (tab === 'Products') navigation.navigate('ProductList');
        if (tab === 'Earnings') navigation.navigate('MarketplaceEarnings');
        if (tab === 'More')     navigation.navigate('MarketplaceProfile');
      }} />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: Colors.bg },
  scroll: { padding: 16, paddingBottom: 100 },
  footer: { padding: 16, backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.border },

  listHeader:    { backgroundColor: '#1A7A7A', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16 },
  listHeaderTop: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  backBtn:       { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  backArrow:     { fontSize: 26, color: '#FFFFFF', fontWeight: '300', lineHeight: 30, marginTop: -2 },
  heading:       { fontSize: 18, fontWeight: Fonts.extraBold, color: '#FFFFFF', flex: 1 },
  dummyBadge:    { paddingHorizontal: 8, paddingVertical: 4, backgroundColor: Colors.amberLight, borderRadius: Radius.md },
  dummyBadgeText:{ fontSize: 10, color: Colors.amber, fontWeight: Fonts.bold },

  catChip:    { paddingHorizontal: 12, paddingVertical: 7, borderRadius: Radius.full, backgroundColor: Colors.bg, borderWidth: 1, borderColor: Colors.border },
  catChipText:{ fontSize: 12, color: Colors.text2, fontWeight: Fonts.medium },

  orderCard:  { backgroundColor: Colors.white, borderRadius: Radius.lg, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: Colors.border, ...Shadows.card },
  orderTop:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  orderId:    { fontSize: 15, fontWeight: Fonts.extraBold, color: Colors.text },
  orderName:  { fontSize: 14, fontWeight: Fonts.bold, color: Colors.text },
  orderMeta:  { fontSize: 11, color: Colors.text3, marginTop: 1 },
  actionBtn:  { flex: 1, paddingVertical: 11, borderRadius: Radius.md, alignItems: 'center' },
  actionBtnText: { fontSize: 13, fontWeight: Fonts.bold },

  otpChip:      { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.tealLight, borderRadius: Radius.md, paddingHorizontal: 12, paddingVertical: 8, marginTop: 8, flexWrap: 'wrap' },
  otpChipLabel: { fontSize: 12, fontWeight: Fonts.bold, color: Colors.teal },
  otpChipValue: { fontSize: 18, fontWeight: Fonts.extraBold, color: Colors.teal, letterSpacing: 4 },
  otpChipSub:   { fontSize: 11, color: Colors.teal },
  otpLarge:     { fontSize: 42, fontWeight: Fonts.extraBold, color: Colors.teal, letterSpacing: 12, textAlign: 'center' },

  sectionLabel: { fontSize: 14, fontWeight: Fonts.bold, color: Colors.text, marginBottom: 12 },

  partnerCard:  { backgroundColor: Colors.white, borderRadius: Radius.lg, padding: 14, marginBottom: 10, borderWidth: 2, borderColor: Colors.border, flexDirection: 'row', alignItems: 'center', gap: 12, ...Shadows.card },
  partnerEmoji: { width: 52, height: 52, borderRadius: 16, backgroundColor: Colors.bg, alignItems: 'center', justifyContent: 'center' },
  partnerName:  { fontSize: 15, fontWeight: Fonts.bold, color: Colors.text },
  partnerSub:   { fontSize: 12, color: Colors.text2, marginTop: 2 },
  radioOuter:   { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  radioInner:   { width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.teal },

  trackCircle:  { width: 28, height: 28, borderRadius: 14, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  trackLine:    { width: 2, height: 28, marginTop: 2 },

  emptyContainer:{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyTitle:    { fontSize: 18, fontWeight: Fonts.bold, color: Colors.text, marginBottom: 6 },
});
