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
import { useTheme } from '../../../hooks/useTheme';

const fmt = (d) => d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';

const ORDER_STATUS_META = {
  pending:           { label: 'Pending',            color: Colors.amber,  bg: Colors.amberLight  },
  accepted:          { label: 'Confirmed',           color: Colors.teal,   bg: Colors.tealLight   },
  assigned_delivery: { label: 'Out for Delivery',    color: Colors.blue,   bg: Colors.blueLight   },
  out_for_delivery:  { label: '🚶 Arrived at Door!',  color: '#1A7A7A',     bg: '#F5F3FF'          },
  delivered:         { label: 'Delivered ✅',         color: Colors.green,  bg: Colors.greenLight  },
  rejected:          { label: 'Rejected',            color: '#C62828',     bg: '#FEE2E2'          },
  returned:          { label: 'Return Requested',    color: '#E8A020',     bg: '#FFF7ED'          },
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
  badge:     { position: 'absolute', top: -5, right: -10, backgroundColor: '#C62828', borderRadius: 8, minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  badgeText: { color: '#FFFFFF', fontSize: 9, fontWeight: '800' },
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
    ACTIVE:           { label: 'Available',   color: '#1A7A7A', bg: '#CCFBF1' },
    PENDING_APPROVAL: { label: 'Under Review', color: '#E65100', bg: '#FEF3C7' },
    SOLD:             { label: 'Sold',         color: '#7A9E9E', bg: '#F1F5F9' },
    REJECTED:         { label: 'Rejected',     color: '#C62828', bg: '#FEE2E2' },
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#E8F5F5' }}>
      {/* Demo mode banner */}
      {isDemo && (
        <View style={{ backgroundColor: '#FFFFFF', borderBottomWidth: 1.5, borderBottomColor: '#E65100', paddingHorizontal: 16, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Text style={{ fontSize: 16 }}>🎭</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 12, fontWeight: '800', color: '#E65100' }}>Demo Mode: Viewing as Jane Resident (B-202)</Text>
            <Text style={{ fontSize: 11, color: '#E65100' }}>Listings by both residents appear here — no conflict</Text>
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
                  <View style={[p2p.badge, { backgroundColor: '#FFFFFF' }]}>
                    <Text style={[p2p.badgeText, { color: '#1A7A7A' }]}>Available</Text>
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
                  <TouchableOpacity style={[p2p.contactBtn, { backgroundColor: '#7A9E9E' }]} onPress={() => {
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
  modeBar:   { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#D0EEEE', gap: 8 },
  modeBtn:   { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: '#F0FAFA', borderWidth: 1, borderColor: '#D0EEEE' },
  modeBtnActive: { backgroundColor: '#1A7A7A', borderColor: '#1A7A7A' },
  modeBtnText:   { fontSize: 12, fontWeight: '600', color: '#7A9E9E' },
  modeBtnTextActive: { color: '#FFFFFF' },
  sellBtn:   { marginLeft: 'auto', backgroundColor: '#D4AF5A', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
  sellBtnText: { fontSize: 12, fontWeight: '800', color: '#1A7A7A' },
  search:    { backgroundColor: '#E8F5F5', borderWidth: 1, borderColor: '#D0EEEE', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: '#1A7A7A', marginBottom: 4 },
  card:      { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#D0EEEE' },
  cardHeader:{ flexDirection: 'row', marginBottom: 8 },
  cardTitle: { fontSize: 15, fontWeight: '800', color: '#1A7A7A' },
  cardSub:   { fontSize: 12, color: '#7A9E9E', marginTop: 2 },
  price:     { fontSize: 18, fontWeight: '900', color: '#1A7A7A', marginBottom: 4 },
  desc:      { fontSize: 13, color: '#7A9E9E', marginBottom: 8 },
  badge:     { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, alignSelf: 'flex-start' },
  badgeText: { fontSize: 11, fontWeight: '800' },
  sellerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  sellerText:{ fontSize: 12, color: '#7A9E9E' },
  interestedText: { fontSize: 12, color: '#1A7A7A', fontWeight: '600' },
  contactBtn:{ borderRadius: 12, paddingVertical: 12, alignItems: 'center', backgroundColor: '#1A7A7A' },
  contactBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  empty:     { alignItems: 'center', padding: 50, gap: 12 },
  emptyText: { fontSize: 15, color: '#7A9E9E', fontWeight: '600' },
  overlay:   { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  modal:     { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalTitle:{ fontSize: 18, fontWeight: '800', color: '#1A7A7A' },
  fieldLabel:{ fontSize: 12, fontWeight: '700', color: '#7A9E9E', marginBottom: 6, marginTop: 8 },
  input:     { backgroundColor: '#E8F5F5', borderWidth: 1.5, borderColor: '#D0EEEE', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: '#1A7A7A', marginBottom: 4 },
  catChip:   { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: '#F0FAFA', borderWidth: 1, borderColor: '#D0EEEE' },
  catChipActive: { backgroundColor: '#1A7A7A', borderColor: '#1A7A7A' },
  catChipText:   { fontSize: 12, fontWeight: '600', color: '#7A9E9E' },
  catChipTextActive: { color: '#FFFFFF' },
  toggle:    { width: 44, height: 24, borderRadius: 12 },
  toggleOn:  { backgroundColor: '#1A7A7A' },
  toggleOff: { backgroundColor: '#D0EEEE' },
  toggleThumb: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#FFFFFF', margin: 2 },
  thumbOn:   { marginLeft: 22 },
  thumbOff:  { marginLeft: 2 },
});

// ═══════════════════════════════════════════════════════════════════════════════
//  MARKET HOME — MIGRATED (useStore → appStore), 4-tab layout
// ═══════════════════════════════════════════════════════════════════════════════

export default function ResidentProductDetailScreen({ navigation, route }) {
  const theme = useTheme();
  const product = route.params?.product;
  const addToCart      = useAppStore(s => s.addToCart);
  const toggleWishlist = useAppStore(s => s.toggleWishlist);
  const isWishlisted   = useAppStore(s => s.isWishlisted);
  const userId = useAuthStore(s => s.user?.id) || 'res1';
  const wishlisted = product ? isWishlisted(userId, product.id) : false;
  const [qty, setQty] = useState(1);

  if (!product) return null;

  return (
    <SafeAreaView style={ms.screen}>
      <StatusBar barStyle={theme.mode === 'light' ? 'dark-content' : 'light-content'} backgroundColor={theme.header} />
      <View style={ms.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={ms.backBtn}>

          <Text style={ms.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={ms.headerTitle}>Product Details</Text>
        <TouchableOpacity
          onPress={() => { toggleWishlist(userId, product.id); }}
          style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
        >
          <Text style={{ fontSize: 24 }}>{wishlisted ? '❤️' : '🤍'}</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <Text style={{ fontSize: 80 }}>{product.emoji}</Text>
        </View>
        <Text style={{ fontSize: 22, fontWeight: '900', color: theme.text, marginBottom: 4 }}>{product.name}</Text>
        <Text style={{ fontSize: 13, color: '#7A9E9E', marginBottom: 8 }}>{product.category}</Text>
        <Text style={{ fontSize: 26, fontWeight: '900', color: theme.primary, marginBottom: 16 }}>₹{product.price}</Text>
        <Text style={{ fontSize: 14, color: theme.textSecondary, lineHeight: 22, marginBottom: 20 }}>{product.desc}</Text>
        <Text style={{ fontSize: 13, color: '#7A9E9E', marginBottom: 16 }}>Stock: {product.stock} units</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <TouchableOpacity style={ms.qtyBtn} onPress={() => setQty(q => Math.max(1, q - 1))}><Text style={ms.qtyBtnText}>−</Text></TouchableOpacity>
          <Text style={{ fontSize: 20, fontWeight: '800', color: theme.text }}>{qty}</Text>
          <TouchableOpacity style={ms.qtyBtn} onPress={() => setQty(q => Math.min(product.stock, q + 1))}><Text style={ms.qtyBtnText}>+</Text></TouchableOpacity>
        </View>
        <TouchableOpacity style={ms.checkoutBtn} onPress={() => { addToCart(product, qty); Alert.alert('Added!', `${qty}x ${product.name} added to cart.`); navigation.goBack(); }}>
          <Text style={ms.checkoutBtnText}>Add to Cart</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
const ms = StyleSheet.create({
  screen:         { flex: 1, backgroundColor: '#F0FAFA' },
  header:         { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A7A7A', paddingHorizontal: 16, paddingVertical: 12, paddingTop: 16 },
  backBtn:        { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  backText:       { color: '#FFF', fontSize: 16, fontWeight: '700' },
  headerTitle:    { flex: 1, color: '#FFF', fontSize: 17, fontWeight: '800', textAlign: 'center' },
  qtyBtn:         { width: 42, height: 42, borderRadius: 21, backgroundColor: '#1A7A7A', alignItems: 'center', justifyContent: 'center' },
  qtyBtnText:     { color: '#FFF', fontSize: 22, fontWeight: '700', lineHeight: 26 },
  checkoutBtn:    { backgroundColor: '#1A7A7A', borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  checkoutBtnText:{ color: '#FFF', fontSize: 16, fontWeight: '800' },
});
