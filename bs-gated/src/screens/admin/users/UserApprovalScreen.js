/**
 * UserApprovalScreen.js — Admin
 *
 * CHANGED:
 * - Now filters on verificationStatus (not status/approvalStatus) for the
 *   Pending / Approved / Rejected views. Only users who have submitted
 *   their verification form appear in the "Pending" list.
 * - Uses approveVerification() (new action) which sets both verificationStatus
 *   AND approvalStatus, so the change is reflected in the user's profile too.
 * - Counts in the chips and tab badges are based on verificationStatus.
 * - "All" tab includes all users in admin-managed roles regardless of status.
 *
 * Admin manages: resident, vendor (business + marketplace), security
 * SuperAdmin manages: admin, builder  (see NewAdminRequestsScreen)
 */

import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, FlatList, StatusBar, Alert,
} from 'react-native';
import { useAuthStore } from '../../../store/AuthStore';
import { useTheme } from '../../../hooks/useTheme';

// ─── Palette ────────────────────────────────────────────────────────────────
const C = {
  pending:      { bg: '#FEF3C7', text: '#B45309', border: '#FDE68A' },
  approved:     { bg: '#DCFCE7', text: '#15803D', border: '#BBF7D0' },
  rejected:     { bg: '#FEE2E2', text: '#DC2626', border: '#FECACA' },
  not_submitted:{ bg: '#F1F5F9', text: '#64748B', border: '#CBD5E1' },
};

const ROLE_TABS = [
  { key: 'all',          label: '👥 All',          filter: u => ['resident','vendor','security'].includes(u.role) },
  { key: 'resident',     label: '🏠 Residents',     filter: u => u.role === 'resident' },
  { key: 'security',     label: '🛡️ Security',      filter: u => u.role === 'security' },
  { key: 'business',     label: '🔧 Business',      filter: u => u.role === 'vendor' && (u.vendorType === 'business' || !u.vendorType) },
  { key: 'marketplace',  label: '🛍️ Marketplace',   filter: u => u.role === 'vendor' && u.vendorType === 'marketplace' },
];

const STATUS_FILTERS = [
  { key: 'pending',       label: 'Pending'  },
  { key: 'approved',      label: 'Approved' },
  { key: 'rejected',      label: 'Rejected' },
  { key: 'not_submitted', label: 'Not Submitted' },
  { key: 'all',           label: 'All'      },
];

const ROLE_META = {
  resident:            { emoji: '🏠', label: 'Resident',            color: '#0EA5E9' },
  security:            { emoji: '🛡️', label: 'Security Guard',       color: '#8B5CF6' },
  vendor_business:     { emoji: '🔧', label: 'Business Vendor',      color: '#F59E0B' },
  vendor_marketplace:  { emoji: '🛍️', label: 'Marketplace Vendor',   color: '#10B981' },
};

function getVendorMeta(user) {
  if (user.role !== 'vendor') return ROLE_META[user.role] || { emoji: '👤', label: user.role, color: '#64748B' };
  return user.vendorType === 'marketplace'
    ? ROLE_META.vendor_marketplace
    : ROLE_META.vendor_business;
}

// ── Verification status label helper ────────────────────────────────────────
function verifLabel(vStatus) {
  switch (vStatus) {
    case 'pending':       return '⏳ Docs Submitted';
    case 'approved':      return '✓ Approved';
    case 'rejected':      return '✗ Rejected';
    case 'not_submitted':
    default:              return '— Not Submitted';
  }
}

function UserCard({ user, onApprove, onReject }) {
  // KEY CHANGE: use kycStatus for display and action buttons
  const vStatus = user.kycStatus || 'not_submitted';
  const colors  = C[vStatus] || C.not_submitted;
  const meta    = getVendorMeta(user);

  return (
    <View style={styles.card}>
      {/* Row 1: Avatar + Name + verificationStatus badge */}
      <View style={styles.cardHeader}>
        <View style={[styles.avatar, { backgroundColor: meta.color + '20' }]}>
          <Text style={{ fontSize: 22 }}>{meta.emoji}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardName}>{user.name || 'Unknown'}</Text>
          <Text style={styles.cardRole}>{meta.label}  ·  📱 {user.phone || '—'}</Text>
          {user.flat         && <Text style={styles.cardMeta}>🏢 Flat {user.flat}{user.block ? `, Block ${user.block}` : ''}</Text>}
          {user.gate         && <Text style={styles.cardMeta}>🚪 {user.gate}</Text>}
          {user.businessName && <Text style={styles.cardMeta}>🏪 {user.businessName}</Text>}
        </View>
        <View style={[styles.statusBadge, { backgroundColor: colors.bg, borderColor: colors.border }]}>
          <Text style={[styles.statusText, { color: colors.text }]}>{verifLabel(vStatus)}</Text>
        </View>
      </View>

      {/* Row 2: Date + docs submitted info */}
      <Text style={styles.cardDate}>
        📅 Registered: {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
      </Text>
      {vStatus === 'not_submitted' && (
        <Text style={styles.cardNote}>ℹ️ User has not submitted verification documents yet.</Text>
      )}

      {/* Row 3: Action buttons — only for verificationStatus === 'pending' */}
      {vStatus === 'pending' && (
        <View style={styles.actions}>
          <TouchableOpacity style={[styles.actionBtn, styles.approveBtn]} onPress={() => onApprove(user.id)}>
            <Text style={styles.actionText}>✓ Approve</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.rejectBtn]} onPress={() => onReject(user.id)}>
            <Text style={styles.actionText}>✗ Reject</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

export default function UserApprovalScreen({ navigation }) {
  const theme                = useTheme();
  const approveVerification  = useAuthStore((s) => s.approveVerification);
  // Keep approveUser as fallback for backward compat
  const approveUser          = useAuthStore((s) => s.approveUser);
  const fetchUsers           = useAuthStore((s) => s.fetchUsers);
  const registeredUsers      = useAuthStore((s) => s.registeredUsers);

  useEffect(() => { 
    fetchUsers(); 
  }, []);

  const [roleTab,      setRoleTab]      = useState('all');
  const [statusFilter, setStatusFilter] = useState('pending');

  const roleTabDef = ROLE_TABS.find(t => t.key === roleTab);

  // All users in the selected role tab
  const byRole = registeredUsers.filter(roleTabDef.filter);

  // KEY CHANGE: filter by kycStatus, not status/approvalStatus
  const getVStatus = u => u.kycStatus || 'not_submitted';
  const byStatus   = statusFilter === 'all'
    ? byRole
    : byRole.filter(u => getVStatus(u) === statusFilter);

  // Counts
  const counts = {
    pending:       byRole.filter(u => getVStatus(u) === 'pending').length,
    approved:      byRole.filter(u => getVStatus(u) === 'approved').length,
    rejected:      byRole.filter(u => getVStatus(u) === 'rejected').length,
    not_submitted: byRole.filter(u => getVStatus(u) === 'not_submitted').length,
    all:           byRole.length,
  };

  const handleApprove = (id) => {
    const user = registeredUsers.find(u => u.id === id);
    Alert.alert('Approve Verification', `Approve verification for ${user?.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Approve',
        onPress: async () => {
          await approveVerification(id, true);
          Alert.alert('✅ Approved', `${user?.name}'s verification has been approved.`);
        },
      },
    ]);
  };

  const handleReject = (id) => {
    const user = registeredUsers.find(u => u.id === id);
    Alert.alert('Reject Verification', `Reject verification for ${user?.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reject',
        style: 'destructive',
        onPress: async () => {
          await approveVerification(id, false);
          Alert.alert('❌ Rejected', `${user?.name}'s verification has been rejected.`);
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#1A7A7A" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>✅ User Approvals</Text>
        <Text style={styles.headerSub}>Pending verifications & documents</Text>
      </View>


      {/* Header */}
      {/* Info note */}
      <View style={styles.infoBanner}>
        <Text style={styles.infoBannerText}>
          📋 Only users who have submitted their documents from Profile → Verification appear in Pending.
        </Text>
      </View>

      {/* Role tabs */}
      <View style={styles.roleTabs}>
        {ROLE_TABS.map(tab => {
          const tabUsers   = registeredUsers.filter(tab.filter);
          const tabPending = tabUsers.filter(u => getVStatus(u) === 'pending').length;
          const isActive   = roleTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.roleTab, isActive && styles.roleTabActive]}
              onPress={() => { setRoleTab(tab.key); setStatusFilter('pending'); }}
            >
              <Text style={[styles.roleTabText, isActive && styles.roleTabTextActive]}>
                {tab.label}
              </Text>
              {tabPending > 0 && (
                <View style={styles.tabBadge}>
                  <Text style={styles.tabBadgeText}>{tabPending}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Status filter chips */}
      <View style={styles.statusRow}>
        {STATUS_FILTERS.map(f => {
          const isActive = statusFilter === f.key;
          return (
            <TouchableOpacity
              key={f.key}
              style={[styles.chip, isActive && styles.chipActive]}
              onPress={() => setStatusFilter(f.key)}
            >
              <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                {f.label} ({counts[f.key]})
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* List */}
      <FlatList
        data={byStatus}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <UserCard
            user={item}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyTitle}>No {statusFilter.replace('_', ' ')} requests</Text>
            <Text style={styles.emptySub}>
              {statusFilter === 'pending'
                ? 'Users who submit documents from their Profile → Verification will appear here.'
                : `No ${statusFilter.replace('_', ' ')} entries found for this category.`}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#E8F5F5' },

  // Header
  header:      { backgroundColor: '#1A7A7A', paddingTop: 40, paddingBottom: 16, paddingHorizontal: 20 },
  backText:    { color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: '600', marginBottom: 8 },
  headerTitle: { fontSize: 22, fontWeight: '900', color: '#FFF' },
  headerSub:   { fontSize: 12, color: 'rgba(255,255,255,0.72)', marginTop: 1 },

  // Info banner
  infoBanner:     { backgroundColor: '#EFF6FF', borderLeftWidth: 4, borderLeftColor: '#3B82F6', marginHorizontal: 16, marginTop: 12, marginBottom: 2, borderRadius: 10, padding: 12 },
  infoBannerText: { fontSize: 12, color: '#1E40AF', lineHeight: 18 },

  // Role tabs
  roleTabs: { flexDirection: 'row', backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0', marginTop: 10 },
  roleTab:  { flex: 1, paddingVertical: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 4, borderBottomWidth: 3, borderBottomColor: 'transparent' },
  roleTabActive:     { borderBottomColor: '#1A7A7A' },
  roleTabText:       { fontSize: 11, fontWeight: '700', color: '#94A3B8' },
  roleTabTextActive: { color: '#1A7A7A' },
  tabBadge:     { backgroundColor: '#DC2626', borderRadius: 8, minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  tabBadgeText: { color: '#FFF', fontSize: 9, fontWeight: '800' },

  // Status chips
  statusRow:      { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#E8F5F5', gap: 8, borderBottomWidth: 1, borderBottomColor: '#E2E8F0', flexWrap: 'wrap' },
  chip:           { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#CBD5E1', backgroundColor: '#FFF' },
  chipActive:     { backgroundColor: '#1A7A7A', borderColor: '#1A7A7A' },
  chipText:       { fontSize: 12, fontWeight: '700', color: '#64748B' },
  chipTextActive: { color: '#FFF' },

  // List
  list: { padding: 16, paddingBottom: 40 },

  // Card
  card:       { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  cardHeader: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', marginBottom: 8 },
  avatar:     { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  cardName:   { fontSize: 15, fontWeight: '800', color: '#1E293B', marginBottom: 2 },
  cardRole:   { fontSize: 12, color: '#64748B' },
  cardMeta:   { fontSize: 11, color: '#94A3B8', marginTop: 2 },
  cardDate:   { fontSize: 11, color: '#94A3B8', marginBottom: 4 },
  cardNote:   { fontSize: 11, color: '#94A3B8', marginBottom: 8, fontStyle: 'italic' },

  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, borderWidth: 1, alignSelf: 'flex-start' },
  statusText:  { fontSize: 11, fontWeight: '800' },

  // Actions
  actions:    { flexDirection: 'row', gap: 10, marginTop: 4 },
  actionBtn:  { flex: 1, paddingVertical: 11, borderRadius: 12, alignItems: 'center' },
  approveBtn: { backgroundColor: '#16A34A' },
  rejectBtn:  { backgroundColor: '#DC2626' },
  actionText: { color: '#FFF', fontWeight: '800', fontSize: 14 },

  // Empty
  empty:      { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 24 },
  emptyIcon:  { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 17, fontWeight: '800', color: '#1E293B', marginBottom: 6 },
  emptySub:   { fontSize: 13, color: '#64748B', textAlign: 'center', lineHeight: 20 },
});
