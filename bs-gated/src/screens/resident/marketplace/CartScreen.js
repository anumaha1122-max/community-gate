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

export default function CartScreen({navigation }) {
  const theme = useTheme();
  const user = useAuthStore(s => s.user);
  const cart = useAppStore(s => s.cart);
  const removeFromCart = useAppStore(s => s.removeFromCart);
  const updateCartQty  = useAppStore(s => s.updateCartQty);
  const placeOrder     = useAppStore(s => s.placeOrder);

  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

  const handleCheckout = () => {
    if (cart.length === 0) { Alert.alert('Empty Cart', 'Add items before checking out.'); return; }
    const order = placeOrder(user?.id || 'res1', user?.name || 'Resident', user?.unit || 'A-101', cart);
    Alert.alert('✅ Order Placed!', `Order #${order.id} placed.\nDelivery OTP: ${order.otp}\n\nShare with delivery person at the gate.`);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#1A7A7A' }}>
      <StatusBar barStyle="light-content" backgroundColor="#1A7A7A" />
      {/* Header */}
      <View style={{ backgroundColor: '#1A7A7A', paddingHorizontal: 20, paddingTop: 40, paddingBottom: 20 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: 8 }}>
          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>← Back</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 22, fontWeight: '800', color: '#FFFFFF' }}>🛍️ My Cart</Text>
        <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>
          {cart.length} item{cart.length !== 1 ? 's' : ''} in cart
        </Text>
      </View>

      {cart.length === 0 ? (
        <View style={{ flex: 1, backgroundColor: '#E8F5F5', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <Text style={{ fontSize: 56 }}>🛍️</Text>
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#1E293B' }}>Cart is empty</Text>
          <Text style={{ fontSize: 13, color: '#7A9E9E' }}>Add items from the Shop tab</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}
            style={{ marginTop: 12, backgroundColor: '#1A7A7A', borderRadius: 14, paddingHorizontal: 28, paddingVertical: 12 }}>
            <Text style={{ color: '#FFF', fontWeight: '700' }}>← Back to Shop</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={{ flex: 1, backgroundColor: '#E8F5F5' }} contentContainerStyle={{ padding: 16 }}>
          {cart.map(item => (
            <View key={item.productId} style={ms.cartItem}>
              <Text style={{ fontSize: 26 }}>{item.emoji}</Text>
              <View style={{ flex: 1, marginHorizontal: 12 }}>
                <Text style={ms.cartName}>{item.name}</Text>
                <Text style={ms.cartPrice}>₹{item.price} each</Text>
              </View>
              <View style={ms.qtyRow}>
                <TouchableOpacity style={ms.qtyBtn} onPress={() => item.qty === 1 ? removeFromCart(item.productId) : updateCartQty(item.productId, item.qty - 1)}>
                  <Text style={ms.qtyBtnText}>−</Text>
                </TouchableOpacity>
                <Text style={ms.qtyText}>{item.qty}</Text>
                <TouchableOpacity style={ms.qtyBtn} onPress={() => updateCartQty(item.productId, item.qty + 1)}>
                  <Text style={ms.qtyBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
          <View style={ms.totalCard}>
            <View style={ms.totalRow}><Text style={ms.totalLabel}>Subtotal</Text><Text style={ms.totalVal}>₹{total}</Text></View>
            <View style={ms.totalRow}><Text style={ms.totalLabel}>Delivery</Text><Text style={ms.totalVal}>₹20</Text></View>
            <View style={[ms.totalRow, { borderTopWidth: 1, borderTopColor: '#D0EEEE', paddingTop: 12 }]}>
              <Text style={[ms.totalLabel, { fontWeight: '800', color: '#1A2E2E' }]}>Total</Text>
              <Text style={[ms.totalVal, { fontWeight: '900', fontSize: 18, color: '#1A7A7A' }]}>₹{total + 20}</Text>
            </View>
          </View>
          <TouchableOpacity style={ms.checkoutBtn} onPress={handleCheckout}>
            <Text style={ms.checkoutBtnText}>Place Order →</Text>
          </TouchableOpacity>
          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}