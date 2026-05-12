/**
 * ResidentMarketplace.js — MODIFIED
 *
 * Changes:
 *   ❌ REMOVED: import useStore from '../../../store/useStore'
 *   ✅ ADDED:   import useAppStore from '../../../store/appStore'
 *   ✅ ADDED:   P2P "Buy/Sell" tab alongside existing "Shop" tab
 *   ✅ Tab bar now has 4 tabs: Shop | Buy/Sell | Cart | Orders
 *
 * All existing screens (ResidentMarketHomeScreen, ResidentProductDetailScreen,
 * ResidentCartScreen, ResidentOrderConfirmedScreen, ResidentOrderTrackingScreen,
 * ResidentPurchaseHistoryScreen) are kept and migrated to appStore.
 *
 * NEW: P2PMarketScreen — resident-to-resident buy/sell listings
 */

import React, { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, FlatList, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, StatusBar, Alert, Modal,
} from 'react-native';
import { Colors, Fonts, Radius, Shadows } from '../../../vendor/theme';
import { AppHeader, Card, PrimaryButton, Badge, Avatar, Divider } from '../../../vendor/components';
import useAppStore          from '../../../store/appStore'; // ← replaces useStore
import { useAuthStore }     from '../../../store/AuthStore';
import { useDemoStore }     from '../../../store/demoStore';

const fmt = (d) => d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';

const ORDER_STATUS_META = {
  pending:           { label: 'Pending',            color: Colors.amber,  bg: Colors.amberLight  },
  accepted:          { label: 'Confirmed',           color: Colors.teal,   bg: Colors.tealLight   },
  assigned_delivery: { label: 'Out for Delivery',    color: Colors.blue,   bg: Colors.blueLight   },
  out_for_delivery:  { label: '🚶 Arrived at Door!',  color: '#7C3AED',     bg: '#F5F3FF'          },
  delivered:         { label: 'Delivered ✅',         color: Colors.green,  bg: Colors.greenLight  },
  rejected:          { label: 'Rejected',            color: '#DC2626',     bg: '#FEE2E2'          },
  returned:          { label: 'Return Requested',    color: '#EA580C',     bg: '#FFF7ED'          },
};

// ─── 4-Tab Bar ────────────────────────────────────────────────────────────────
function MarketTabBar({ activeTab, onTabPress }) {
  const cart = useAppStore(s => s.cart);
  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0);
  const p2pListings = useAppStore(s => s.p2pListings);
  const activeP2P   = p2pListings.filter(l => l.status === 'ACTIVE').length;

  const tabs = [
    { key: 'Shop',    icon: '🛒', label: 'Shop',     badge: 0 },
    { key: 'BuySell', icon: '♻️', label: 'Buy/Sell', badge: activeP2P },
    { key: 'Cart',    icon: '🛍️', label: 'Cart',     badge: cartCount },
    { key: 'Orders',  icon: '📦', label: 'Orders',   badge: 0 },
  ];

  return (
    <View style={tb.bar}>
      {tabs.map(t => {
        const active = activeTab === t.key;
        return (
          <TouchableOpacity key={t.key} onPress={() => onTabPress(t.key)} activeOpacity={0.7} style={[tb.item, active && { backgroundColor: Colors.tealLight }]}>
            <View style={{ position: 'relative' }}>
              <Text style={tb.icon}>{t.icon}</Text>
              {t.badge > 0 && (
                <View style={tb.badge}>
                  <Text style={tb.badgeText}>{t.badge > 9 ? '9+' : t.badge}</Text>
                </View>
              )}
            </View>
            <Text style={[tb.label, active && { color: Colors.teal, fontWeight: Fonts.bold }]}>{t.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const tb = StyleSheet.create({
  bar:       { height: 68, backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingHorizontal: 8, paddingBottom: 8 },
  item:      { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: Radius.md },
  icon:      { fontSize: 20 },
  label:     { fontSize: 10, color: Colors.textSecondary, marginTop: 2 },
  badge:     { position: 'absolute', top: -5, right: -10, backgroundColor: '#EF4444', borderRadius: 8, minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  badgeText: { color: '#FFF', fontSize: 9, fontWeight: '800' },
});

// ─── P2P Market Screen ────────────────────────────────────────────────────────
function P2PMarketScreen({ navigation }) {
  const user = useAuthStore(s => s.user);
  const { demoResident } = useDemoStore();

  // Active user context: demo resident if set, else logged-in user
  // Demo resident can browse and list as themselves; real resident sees all ACTIVE listings
  const activeUser = demoResident || user;
  const myId = activeUser?.id || 'res1';
  const myName = activeUser?.name || 'Resident';
  const myUnit = activeUser?.unit || 'A-101';
  const isDemo = !!demoResident;

  const p2pListings    = useAppStore(s => s.p2pListings);
  const createP2PListing = useAppStore(s => s.createP2PListing);
  const markP2PSold    = useAppStore(s => s.markP2PSold);
  const sendP2PMessage = useAppStore(s => s.sendP2PMessage);

  const [viewMode, setViewMode] = useState('browse'); // browse | sell | mine
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch]     = useState('');

  const CATEGORIES = ['Electronics', 'Furniture', 'Clothing', 'Books', 'Appliances', 'Sports', 'Toys', 'Other'];

  const [form, setForm] = useState({
    title: '', category: 'Electronics', description: '', price: '', negotiable: true,
  });

  // All ACTIVE listings visible to everyone (both real + demo resident see each other's listings)
  const activeListings = p2pListings.filter(l => l.status === 'ACTIVE');
  const filtered = activeListings.filter(l =>
    !search ||
    l.title.toLowerCase().includes(search.toLowerCase()) ||
    l.category.toLowerCase().includes(search.toLowerCase())
  );
  // "My listings" = listings belonging to the currently active user context
  const mine = p2pListings.filter(l => l.sellerId === myId);

  const handleSell = () => {
    if (!form.title.trim()) { Alert.alert('Required', 'Enter item title'); return; }
    if (!form.price.trim()) { Alert.alert('Required', 'Enter price'); return; }
    const newListing = createP2PListing({
      sellerId: myId,
      sellerName: myName,
      sellerUnit: myUnit,
      ...form,
      price: parseInt(form.price.replace(/[^0-9]/g, '')) || 0,
      images: [],
    });
    setForm({ title: '', category: 'Electronics', description: '', price: '', negotiable: true });
    setShowForm(false);

    if (newListing.isFirstListing) {
      Alert.alert(
        '🔍 Under Review',
        `Your first listing "${newListing.title}" has been submitted for admin approval.\n\nOnce approved, it will be visible to all residents.\n\nFuture listings will go live instantly.`
      );
    } else {
      Alert.alert('✅ Listed!', `"${newListing.title}" is now live and visible to all residents.`);
    }
  };

  const handleContact = (listing) => {
    navigation.navigate('ResidentChat', {
      contextId:    listing.id,
      contextTitle: listing.title,
      contextType:  'p2p',
      buyerId:      myId,
      buyerName:    myName,
      buyerUnit:    myUnit,
      sellerId:     listing.sellerId,
      sellerName:   listing.sellerName,
      sellerUnit:   listing.sellerUnit,
      myId, myName, myUnit,
    });
  };

  const LISTING_STATUS_META = {
    ACTIVE:           { label: 'Available',   color: '#0F766E', bg: '#CCFBF1' },
    PENDING_APPROVAL: { label: 'Under Review', color: '#D97706', bg: '#FEF3C7' },
    SOLD:             { label: 'Sold',         color: '#7A9E9E', bg: '#F1F5F9' },
    REJECTED:         { label: 'Rejected',     color: '#DC2626', bg: '#FEE2E2' },
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      {/* Demo mode banner */}
      {isDemo && (
        <View style={{ backgroundColor: '#FEF3C7', borderBottomWidth: 1.5, borderBottomColor: '#D97706', paddingHorizontal: 16, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Text style={{ fontSize: 16 }}>🎭</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 12, fontWeight: '800', color: '#92400E' }}>Demo Mode: Viewing as Jane Resident (B-202)</Text>
            <Text style={{ fontSize: 11, color: '#92400E' }}>Listings by both residents appear here — no conflict</Text>
          </View>
        </View>
      )}
      <View style={p2p.modeBar}>
        {[['browse','🔍 Browse'], ['mine','📋 My Listings']].map(([mode, label]) => (
          <TouchableOpacity key={mode} style={[p2p.modeBtn, viewMode === mode && p2p.modeBtnActive]} onPress={() => setViewMode(mode)}>
            <Text style={[p2p.modeBtnText, viewMode === mode && p2p.modeBtnTextActive]}>{label}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={p2p.sellBtn} onPress={() => setShowForm(true)}>
          <Text style={p2p.sellBtnText}>+ Sell</Text>
        </TouchableOpacity>
      </View>

      {viewMode === 'browse' && (
        <>
          <View style={{ paddingHorizontal: 16, paddingTop: 10 }}>
            <TextInput
              style={p2p.search}
              placeholder="Search items..."
              placeholderTextColor="#94A3B8"
              value={search}
              onChangeText={setSearch}
            />
          </View>
          <FlatList
            data={filtered}
            keyExtractor={i => i.id}
            contentContainerStyle={{ padding: 16, gap: 12 }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={p2p.card}>
                <View style={p2p.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={p2p.cardTitle}>{item.title}</Text>
                    <Text style={p2p.cardSub}>{item.category} · {item.negotiable ? 'Negotiable' : 'Fixed'}</Text>
                  </View>
                  <View style={[p2p.badge, { backgroundColor: '#CCFBF1' }]}>
                    <Text style={[p2p.badgeText, { color: '#0F766E' }]}>Available</Text>
                  </View>
                </View>
                <Text style={p2p.price}>₹{item.price.toLocaleString('en-IN')}</Text>
                <Text style={p2p.desc} numberOfLines={2}>{item.description}</Text>
                <View style={p2p.sellerRow}>
                  <Text style={p2p.sellerText}>👤 {item.sellerName} · {item.sellerUnit}</Text>
                  <Text style={p2p.interestedText}>💬 {item.interestedCount} interested</Text>
                </View>
                {item.sellerId !== myId && (
                  <TouchableOpacity style={p2p.contactBtn} onPress={() => handleContact(item)}>
                    <Text style={p2p.contactBtnText}>💬 I'm Interested</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
            ListEmptyComponent={<View style={p2p.empty}><Text style={{ fontSize: 48 }}>♻️</Text><Text style={p2p.emptyText}>No listings available</Text></View>}
          />
        </>
      )}

      {viewMode === 'mine' && (
        <FlatList
          data={mine}
          keyExtractor={i => i.id}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const meta = LISTING_STATUS_META[item.status] || LISTING_STATUS_META.ACTIVE;
            return (
              <View style={p2p.card}>
                <View style={p2p.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={p2p.cardTitle}>{item.title}</Text>
                    <Text style={p2p.cardSub}>{item.category} · ₹{item.price.toLocaleString('en-IN')}</Text>
                  </View>
                  <View style={[p2p.badge, { backgroundColor: meta.bg }]}>
                    <Text style={[p2p.badgeText, { color: meta.color }]}>{meta.label}</Text>
                  </View>
                </View>
                <Text style={p2p.cardSub}>💬 {item.interestedCount} interested buyers</Text>
                {item.status === 'ACTIVE' && (
                  <TouchableOpacity style={[p2p.contactBtn, { backgroundColor: '#475569' }]} onPress={() => {
                    Alert.alert('Mark Sold', `Mark "${item.title}" as sold?`, [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Mark Sold', onPress: () => markP2PSold(item.id) },
                    ]);
                  }}>
                    <Text style={p2p.contactBtnText}>Mark as Sold</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          }}
          ListEmptyComponent={<View style={p2p.empty}><Text style={{ fontSize: 48 }}>📋</Text><Text style={p2p.emptyText}>You haven't listed anything yet</Text></View>}
        />
      )}

      {/* Sell Form Modal */}
      {showForm && (
        <Modal visible transparent animationType="slide">
          <View style={p2p.overlay}>
            <ScrollView>
              <View style={[p2p.modal, { marginTop: 60 }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
                  <Text style={p2p.modalTitle}>Sell an Item</Text>
                  <TouchableOpacity onPress={() => setShowForm(false)}><Text style={{ fontSize: 22, color: '#7A9E9E' }}>✕</Text></TouchableOpacity>
                </View>
                <Text style={p2p.fieldLabel}>Item Title *</Text>
                <TextInput style={p2p.input} placeholder="e.g. Samsung TV 32 inch" placeholderTextColor="#94A3B8" value={form.title} onChangeText={v => setForm(f => ({ ...f, title: v }))} />
                <Text style={p2p.fieldLabel}>Price (₹) *</Text>
                <TextInput style={p2p.input} placeholder="e.g. 5000" placeholderTextColor="#94A3B8" value={form.price} onChangeText={v => setForm(f => ({ ...f, price: v }))} keyboardType="numeric" />
                <Text style={p2p.fieldLabel}>Category</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
                    {CATEGORIES.map(c => (
                      <TouchableOpacity key={c} style={[p2p.catChip, form.category === c && p2p.catChipActive]} onPress={() => setForm(f => ({ ...f, category: c }))}>
                        <Text style={[p2p.catChipText, form.category === c && p2p.catChipTextActive]}>{c}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
                <Text style={p2p.fieldLabel}>Description</Text>
                <TextInput style={[p2p.input, { minHeight: 70, textAlignVertical: 'top' }]} placeholder="Condition, age, what's included..." placeholderTextColor="#94A3B8" value={form.description} onChangeText={v => setForm(f => ({ ...f, description: v }))} multiline />
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <TouchableOpacity
                    style={[p2p.toggle, form.negotiable ? p2p.toggleOn : p2p.toggleOff]}
                    onPress={() => setForm(f => ({ ...f, negotiable: !f.negotiable }))}
                  >
                    <View style={[p2p.toggleThumb, form.negotiable ? p2p.thumbOn : p2p.thumbOff]} />
                  </TouchableOpacity>
                  <Text style={{ fontSize: 13, color: '#7A9E9E' }}>Price is Negotiable</Text>
                </View>
                <TouchableOpacity style={[p2p.contactBtn, { backgroundColor: '#1A7A7A' }]} onPress={handleSell}>
                  <Text style={p2p.contactBtnText}>♻️ Submit for Review</Text>
                </TouchableOpacity>
                <View style={{ height: 40 }} />
              </View>
            </ScrollView>
          </View>
        </Modal>
      )}

    </View>
  );
}

const p2p = StyleSheet.create({
  modeBar:   { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0', gap: 8 },
  modeBtn:   { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: '#F0FAFA', borderWidth: 1, borderColor: '#D0EEEE' },
  modeBtnActive: { backgroundColor: '#1A7A7A', borderColor: '#1A7A7A' },
  modeBtnText:   { fontSize: 12, fontWeight: '600', color: '#7A9E9E' },
  modeBtnTextActive: { color: '#FFF' },
  sellBtn:   { marginLeft: 'auto', backgroundColor: '#D4AF5A', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
  sellBtnText: { fontSize: 12, fontWeight: '800', color: '#1A2E4A' },
  search:    { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#D0EEEE', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: '#1E293B', marginBottom: 4 },
  card:      { backgroundColor: '#FFF', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#D0EEEE' },
  cardHeader:{ flexDirection: 'row', marginBottom: 8 },
  cardTitle: { fontSize: 15, fontWeight: '800', color: '#1E293B' },
  cardSub:   { fontSize: 12, color: '#7A9E9E', marginTop: 2 },
  price:     { fontSize: 18, fontWeight: '900', color: '#1E293B', marginBottom: 4 },
  desc:      { fontSize: 13, color: '#7A9E9E', marginBottom: 8 },
  badge:     { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, alignSelf: 'flex-start' },
  badgeText: { fontSize: 11, fontWeight: '800' },
  sellerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  sellerText:{ fontSize: 12, color: '#7A9E9E' },
  interestedText: { fontSize: 12, color: '#0F766E', fontWeight: '600' },
  contactBtn:{ borderRadius: 12, paddingVertical: 12, alignItems: 'center', backgroundColor: '#0F766E' },
  contactBtnText: { color: '#FFF', fontSize: 14, fontWeight: '800' },
  empty:     { alignItems: 'center', padding: 50, gap: 12 },
  emptyText: { fontSize: 15, color: '#7A9E9E', fontWeight: '600' },
  overlay:   { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  modal:     { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalTitle:{ fontSize: 18, fontWeight: '800', color: '#1E293B' },
  fieldLabel:{ fontSize: 12, fontWeight: '700', color: '#7A9E9E', marginBottom: 6, marginTop: 8 },
  input:     { backgroundColor: '#F8FAFC', borderWidth: 1.5, borderColor: '#D0EEEE', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: '#1E293B', marginBottom: 4 },
  catChip:   { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: '#F0FAFA', borderWidth: 1, borderColor: '#D0EEEE' },
  catChipActive: { backgroundColor: '#1A7A7A', borderColor: '#1A7A7A' },
  catChipText:   { fontSize: 12, fontWeight: '600', color: '#7A9E9E' },
  catChipTextActive: { color: '#FFF' },
  toggle:    { width: 44, height: 24, borderRadius: 12 },
  toggleOn:  { backgroundColor: '#0F766E' },
  toggleOff: { backgroundColor: '#CBD5E1' },
  toggleThumb: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#FFF', margin: 2 },
  thumbOn:   { marginLeft: 22 },
  thumbOff:  { marginLeft: 2 },
});

// ═══════════════════════════════════════════════════════════════════════════════
//  MARKET HOME — MIGRATED (useStore → appStore), 4-tab layout
// ═══════════════════════════════════════════════════════════════════════════════
import { useTheme } from '../../../hooks/useTheme';

// ── Order status timeline ────────────────────────────────────────────────────
const ORDER_STEPS = [
  { status: 'pending',           label: 'Order Placed',       icon: '🛒' },
  { status: 'accepted',          label: 'Confirmed by Vendor', icon: '✅' },
  { status: 'assigned_delivery', label: 'Out for Delivery',    icon: '🚚' },
  { status: 'out_for_delivery',  label: 'Arrived at Gate',     icon: '🏘️' },
  { status: 'delivered',         label: 'Delivered',           icon: '📦' },
];
const STATUS_ORDER = ORDER_STEPS.map(s => s.status);

function StatusTimeline({ currentStatus }) {
  const currentIdx = STATUS_ORDER.indexOf(currentStatus);
  const isRejected = currentStatus === 'rejected' || currentStatus === 'returned';
  if (isRejected) return (
    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEE2E2', borderRadius: 10, padding: 10, marginTop: 10 }}>
      <Text style={{ fontSize: 18, marginRight: 8 }}>❌</Text>
      <Text style={{ fontSize: 13, color: '#DC2626', fontWeight: '700' }}>
        {currentStatus === 'returned' ? 'Return Requested' : 'Order Rejected'}
      </Text>
    </View>
  );
  return (
    <View style={{ marginTop: 12 }}>
      {ORDER_STEPS.map((step, i) => {
        const done    = i <= currentIdx;
        const active  = i === currentIdx;
        const last    = i === ORDER_STEPS.length - 1;
        return (
          <View key={step.status} style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            {/* Line + dot */}
            <View style={{ alignItems: 'center', width: 28 }}>
              <View style={{
                width: 22, height: 22, borderRadius: 11, borderWidth: 2,
                borderColor: done ? '#1A7A7A' : '#D0EEEE',
                backgroundColor: done ? (active ? '#1A7A7A' : '#CCFBF1') : '#F8FBFB',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <Text style={{ fontSize: 11 }}>{done ? (active ? step.icon : '✓') : '○'}</Text>
              </View>
              {!last && <View style={{ width: 2, flex: 1, minHeight: 18, backgroundColor: done && !active ? '#1A7A7A' : '#D0EEEE', marginVertical: 2 }} />}
            </View>
            {/* Label */}
            <Text style={{
              fontSize: 12, marginLeft: 10, marginBottom: last ? 0 : 14, marginTop: 3,
              fontWeight: active ? '800' : '600',
              color: active ? '#1A7A7A' : done ? '#3D6E6E' : '#7A9E9E',
            }}>
              {step.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

export default function OrderTrackingScreen({navigation }) {
  const theme = useTheme();
  const user   = useAuthStore(s => s.user);
  const orders = useAppStore(s => s.marketplaceOrders);
  const residentConfirmDelivery = useAppStore(s => s.residentConfirmDelivery);
  const residentRejectDelivery  = useAppStore(s => s.residentRejectDelivery);
  const residentRequestReturn   = useAppStore(s => s.residentRequestReturn);
  const myOrders = orders.filter(o => o.residentId === (user?.id || 'res1'));

  const handleAccept = (order) => {
    Alert.alert(
      '✅ Confirm Delivery',
      `Confirm that you have received Order #${order.id}?\n\nThis will mark the order as delivered.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Yes, Received!', onPress: () => {
            residentConfirmDelivery(order.id);
            Alert.alert('🎉 Thank you!', 'Your order has been marked as delivered.');
          },
        },
      ]
    );
  };

  const handleReject = (order) => {
    Alert.alert(
      '❌ Reject Delivery',
      'Are you sure you want to reject this delivery? (e.g. wrong order / damaged items)',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reject', style: 'destructive', onPress: () => {
            residentRejectDelivery(order.id);
            Alert.alert('Delivery Rejected', 'The vendor has been notified.');
          },
        },
      ]
    );
  };

  return (
    <FlatList
      data={myOrders}
      keyExtractor={i => i.id}
      contentContainerStyle={{ padding: 16 }}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => {
        const meta = ORDER_STATUS_META[item.status] || ORDER_STATUS_META.pending;
        const arrivedAtDoor = item.status === 'out_for_delivery' && item.otpVerified;
        return (
          <View style={[
            ms.orderCard,
            arrivedAtDoor && { borderColor: '#7C3AED', borderWidth: 2 }
          ]}>
            <View style={ms.orderHeader}>
              <Text style={ms.orderId}>Order #{item.id}</Text>
              <View style={[ms.orderBadge, { backgroundColor: meta.bg }]}>
                <Text style={[ms.orderBadgeText, { color: meta.color }]}>{meta.label}</Text>
              </View>
            </View>
            <Text style={ms.orderItems}>{item.items.map(i => `${i.emoji} ${i.name} x${i.qty}`).join(', ')}</Text>
            <StatusTimeline currentStatus={item.status} />
            <View style={ms.orderFooter}>
              <Text style={ms.orderTotal}>₹{item.total}</Text>
              <Text style={ms.orderDate}>{fmt(item.placedAt)}</Text>
            </View>

            {/* OTP to share with delivery person (before guard scans) */}
            {item.otp && item.status === 'assigned_delivery' && !item.otpVerified && (
              <View style={ms.otpBox}>
                <Text style={ms.otpLabel}>🔐 Share this OTP with the delivery person at the gate</Text>
                <Text style={ms.otpValue}>{item.otp}</Text>
              </View>
            )}

            {/* Delivery partner arrived — Accept / Reject */}
            {arrivedAtDoor && (
              <View style={ms.arrivedBox}>
                <Text style={ms.arrivedTitle}>
                  🚶 {item.deliveryPartnerName || 'Delivery partner'} has arrived!
                </Text>
                <Text style={ms.arrivedSub}>Please confirm you have received your order.</Text>
                <View style={ms.arrivedActions}>
                  <TouchableOpacity
                    style={[ms.arrivedBtn, { backgroundColor: '#FEE2E2' }]}
                    onPress={() => handleReject(item)}
                    activeOpacity={0.8}
                  >
                    <Text style={[ms.arrivedBtnText, { color: '#DC2626' }]}>✗  Reject</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[ms.arrivedBtn, { backgroundColor: '#D1FAE5', flex: 2 }]}
                    onPress={() => handleAccept(item)}
                    activeOpacity={0.8}
                  >
                    <Text style={[ms.arrivedBtnText, { color: '#064E3B' }]}>✓  Accept Order</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Request Return (only on delivered orders) */}
            {item.status === 'delivered' && (
              <TouchableOpacity
                style={ms.returnBtn}
                onPress={() => Alert.alert(
                  '📦 Request Return',
                  `Request a return for Order #${item.id}?\nThe vendor will be notified.`,
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Request Return', style: 'destructive', onPress: () => {
                        residentRequestReturn(item.id);
                        Alert.alert('✅ Return Requested', 'Your return request has been sent to the vendor.');
                      },
                    },
                  ]
                )}
                activeOpacity={0.8}
              >
                <Text style={ms.returnBtnText}>📦 Request Return</Text>
              </TouchableOpacity>
            )}
          </View>
        );
      }}
      ListEmptyComponent={<View style={{ alignItems: 'center', padding: 50 }}><Text style={{ fontSize: 48 }}>📦</Text><Text style={{ fontSize: 15, color: '#7A9E9E', marginTop: 12 }}>No orders yet</Text></View>}
    />
  );
}