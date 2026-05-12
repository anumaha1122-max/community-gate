/**
 * MarketplaceProfileScreen.js
 *
 * Merged: My Account + Manage Store (single screen)
 * Accessible via "More" tab in MarketplaceTabBar
 *
 * Contains:
 *  - VerifyCard (verification status + action)
 *  - Store summary card + Edit Store
 *  - Vacation Mode toggle
 *  - Store management: Store Profile, Delivery, Payment, Timings, Offers, Reports
 *  - Account: Help, Rate App, Logout
 */
import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, StatusBar, Alert, Switch,
} from 'react-native';
import { Colors, Fonts, Radius } from '../../../vendor/theme';
import { AppHeader, Card, Divider } from '../../../vendor/components';
import { MarketplaceTabBar } from '../../../vendor/components/TabBars';
import { useAuthStore } from '../../../store/AuthStore';
import { useTheme } from '../../../hooks/useTheme';

// ── Verify Card ───────────────────────────────────────────────────────────────
function MarketplaceVerifyCard({ navigation }) {
  const verificationStatus = useAuthStore(s => {
    try {
      const live = s.registeredUsers && s.user
        ? s.registeredUsers.find(u => u.id === s.user.id)
        : null;
      return live?.verificationStatus || s.user?.verificationStatus || 'not_submitted';
    } catch { return 'not_submitted'; }
  });

  if (verificationStatus === 'approved') return (
    <View style={vc.card}>
      <Text style={vc.icon}>✅</Text>
      <View style={{ flex: 1 }}>
        <Text style={[vc.title, { color: '#2E7D32' }]}>Verified & Approved</Text>
        <Text style={vc.sub}>All features are unlocked.</Text>
      </View>
    </View>
  );

  const isPending = verificationStatus === 'pending' || verificationStatus === 'pending_approval';
  if (isPending) return (
    <View style={[vc.card, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}>
      <Text style={vc.icon}>⏳</Text>
      <View style={{ flex: 1 }}>
        <Text style={[vc.title, { color: '#1D4ED8' }]}>Under Review</Text>
        <Text style={vc.sub}>Admin is reviewing your documents. Features unlock once approved.</Text>
      </View>
    </View>
  );

  const isRejected = verificationStatus === 'rejected';
  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('Verification')}
      activeOpacity={0.85}
      style={[vc.card, { backgroundColor: isRejected ? '#FEE2E2' : '#FFFBEB', borderColor: isRejected ? '#FECACA' : '#FDE68A' }]}
    >
      <Text style={vc.icon}>{isRejected ? '❌' : '📋'}</Text>
      <View style={{ flex: 1 }}>
        <Text style={[vc.title, { color: isRejected ? '#C62828' : '#92400E' }]}>
          {isRejected ? 'Verification Rejected' : 'Verify Your Account'}
        </Text>
        <Text style={vc.sub}>
          {isRejected ? 'Tap to resubmit your documents.' : 'Tap to upload documents and unlock all features.'}
        </Text>
      </View>
      <Text style={{ fontSize: 20, color: isRejected ? '#C62828' : '#92400E' }}>›</Text>
    </TouchableOpacity>
  );
}
const vc = StyleSheet.create({
  card:  { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#F0FFF4', borderColor: '#A5D6A7', borderWidth: 1.5, borderRadius: 14, padding: 14, marginBottom: 12 },
  icon:  { fontSize: 24 },
  title: { fontSize: 14, fontWeight: '800', marginBottom: 2 },
  sub:   { fontSize: 12, color: '#64748B', lineHeight: 17 },
});

// ── Menu Row ──────────────────────────────────────────────────────────────────
function MenuRow({ emoji, label, sub, onPress, rightElement, last }) {
  return (
    <View>
      <TouchableOpacity style={s.menuRow} onPress={onPress} activeOpacity={0.75}>
        <View style={s.menuIcon}>
          <Text style={{ fontSize: 18 }}>{emoji}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.menuLabel}>{label}</Text>
          {sub && <Text style={s.menuSub}>{sub}</Text>}
        </View>
        {rightElement || <Text style={s.menuArrow}>›</Text>}
      </TouchableOpacity>
      {!last && <Divider />}
    </View>
  );
}

function SectionLabel({ title }) {
  return <Text style={s.sectionLabel}>{title}</Text>;
}

// ─────────────────────────────────────────────────────────────────────────────
export default function MarketplaceProfileScreen({ navigation }) {
  const theme       = useTheme();
  const logout      = useAuthStore(s => s.logout);
  const user        = useAuthStore(s => s.user);
  const [vacation, setVacation] = useState(false);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor='#1A7A7A' />
      <AppHeader title="Profile & Store" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Verify Card */}
        <MarketplaceVerifyCard navigation={navigation} />

        {/* Store summary */}
        <Card style={s.storeCard}>
          <View style={s.storeAvatar}>
            <Text style={{ fontSize: 28 }}>🏪</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.storeName}>{user?.name || 'My Store'}</Text>
            <Text style={s.storeCat}>Marketplace Vendor</Text>
            <View style={s.vacationRow}>
              <Text style={s.vacationLabel}>Vacation Mode</Text>
              <Switch
                value={vacation}
                onValueChange={setVacation}
                trackColor={{ false: Colors.border, true: Colors.teal + '60' }}
                thumbColor={vacation ? Colors.teal : '#94A3B8'}
              />
            </View>
          </View>
          <TouchableOpacity style={s.editBtn} onPress={() => navigation.navigate('StoreProfile')}>
            <Text style={s.editBtnText}>Edit Store</Text>
          </TouchableOpacity>
        </Card>

        {/* Store Management */}
        <SectionLabel title="🏪 Store Management" />
        <Card style={s.menuCard}>
          <MenuRow emoji="🏪" label="Store Profile"          sub="Name, category, address"         onPress={() => navigation.navigate('StoreProfile')} />
          <MenuRow emoji="🚚" label="Delivery Settings"      sub="Modes, charges, radius"          onPress={() => navigation.navigate('DeliverySettings')} />
          <MenuRow emoji="💳" label="Payment & Bank Details" sub="UPI, bank account"               onPress={() => navigation.navigate('PaymentBank')} />
          <MenuRow emoji="⏰" label="Store Timings"          sub="Set opening & closing hours"     onPress={() => navigation.navigate('StoreTimings')} />
          <MenuRow emoji="🏷️" label="Offers & Discounts"   sub="Create coupons & promotions"     onPress={() => navigation.navigate('OffersDiscounts')} />
          <MenuRow emoji="📊" label="Reports & Analytics"   sub="Detailed sales & business data"  onPress={() => navigation.navigate('ReportsAnalytics')} last />
        </Card>

        {/* Account */}
        <SectionLabel title="👤 Account" />
        <Card style={s.menuCard}>
          <MenuRow emoji="❓" label="Help & Support"  sub="FAQs, contact support"   onPress={() => Alert.alert('Help', 'Support coming soon.')} />
          <MenuRow emoji="⭐" label="Rate the App"    sub="Share your feedback"      onPress={() => Alert.alert('Thanks!', 'Rating feature coming soon.')} last />
        </Card>

        {/* Logout */}
        <TouchableOpacity style={s.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
          <Text style={s.logoutText}>🚪  Logout</Text>
        </TouchableOpacity>

        <Text style={s.version}>App Version 1.0.0</Text>
        <View style={{ height: 20 }} />
      </ScrollView>

      <MarketplaceTabBar
        activeTab="More"
        onTabPress={(tab) => {
          if (tab === 'Home')     navigation.navigate('MarketplaceHome');
          if (tab === 'Orders')   navigation.navigate('VendorOrders');
          if (tab === 'Products') navigation.navigate('ProductList');
          if (tab === 'Earnings') navigation.navigate('MarketplaceEarnings');
        }}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: Colors.bg || '#F5F5F5' },
  scroll:      { padding: 16, paddingBottom: 32 },

  storeCard:   { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 12 },
  storeAvatar: { width: 56, height: 56, borderRadius: 18, backgroundColor: Colors.tealLight, alignItems: 'center', justifyContent: 'center' },
  storeName:   { fontSize: 16, fontWeight: Fonts.bold || '700', color: Colors.text },
  storeCat:    { fontSize: 12, color: Colors.teal, marginTop: 2, marginBottom: 6 },
  vacationRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  vacationLabel:{ fontSize: 12, color: Colors.text3 },
  editBtn:     { backgroundColor: Colors.tealLight, borderRadius: Radius.md || 8, paddingHorizontal: 12, paddingVertical: 7, alignSelf: 'flex-start' },
  editBtnText: { fontSize: 12, fontWeight: Fonts.semiBold || '600', color: Colors.teal },

  sectionLabel:{ fontSize: 11, fontWeight: '800', color: '#7A9E9E', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, marginTop: 4 },
  menuCard:    { marginBottom: 14, paddingVertical: 4 },
  menuRow:     { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  menuIcon:    { width: 38, height: 38, borderRadius: Radius.md || 8, backgroundColor: Colors.tealLight, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  menuLabel:   { fontSize: 14, fontWeight: Fonts.semiBold || '600', color: Colors.text },
  menuSub:     { fontSize: 11, color: Colors.text3, marginTop: 2 },
  menuArrow:   { fontSize: 20, color: Colors.text3 },

  logoutBtn:   { backgroundColor: '#FEE2E2', borderRadius: 14, padding: 15, alignItems: 'center', marginTop: 4, borderWidth: 1, borderColor: '#FECACA' },
  logoutText:  { color: '#C62828', fontSize: 15, fontWeight: '800' },
  version:     { textAlign: 'center', fontSize: 11, color: Colors.text3, marginTop: 16 },
});
