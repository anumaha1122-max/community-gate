import React, { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  SafeAreaView, TextInput, ScrollView,
} from 'react-native';
import useAppStore from '../../../store/appStore';
import { COLORS, globalStyles, STATUS_LABELS } from '../../../components/common/theme';
import { useTheme } from '../../../hooks/useTheme';

// Statuses where admin must take action
const ADMIN_ACTION_REQUIRED = [
  'submitted',       // → send quote request to vendors
  'quoted',          // → forward quote to resident
  'quote_accepted',  // → confirm work start
  'payment_requested_to_admin', // → request payment from resident
  'payment_received',           // → pay vendor
];

const STATUS_COLOR_MAP = {
  submitted:                    '#F59E0B',
  quote_requested:              '#0891B2',
  assigned:                     '#6366F1',
  quoted:                       '#8B5CF6',
  quote_sent_to_resident:       '#0D9488',
  quote_accepted:               '#16A34A',
  quote_rejected:               '#DC2626',
  approved_to_start:            '#2563EB',
  work_in_progress:             '#D97706',
  work_completed:               '#15803D',
  payment_requested_to_admin:   '#EA580C',
  payment_requested_to_resident:'#7C3AED',
  payment_received:             '#0891B2',
  paid_to_vendor:               '#16A34A',
};

const FILTERS = [
  { key: 'all',                          label: 'All' },
  { key: 'submitted',                    label: '🆕 New' },
  { key: 'quote_requested',              label: '📤 Quote Sent' },
  { key: 'quoted',                       label: '💰 Quote In' },
  { key: 'quote_sent_to_resident',       label: '📨 Resident Review' },
  { key: 'quote_accepted',              label: '✅ Accepted' },
  { key: 'quote_rejected',              label: '❌ Rejected' },
  { key: 'approved_to_start',           label: '🚀 Approved' },
  { key: 'work_in_progress',            label: '🔧 In Progress' },
  { key: 'work_completed',              label: '🏁 Completed' },
  { key: 'payment_requested_to_admin',  label: '💳 Pay Due' },
  { key: 'payment_requested_to_resident', label: '⏳ Resident Pay' },
  { key: 'payment_received',            label: '💵 Pay Vendor' },
  { key: 'paid_to_vendor',              label: '✔️ Closed' },
];

export default function AdminMaintenanceScreen({ navigation }) {
  const theme = useTheme();
  const maintenanceRequests = useAppStore((s) => s.maintenanceRequests);
  const fetchMaintenance    = useAppStore((s) => s.fetchMaintenance);
  const user                = require('../../../store/AuthStore').useAuthStore.getState().user;

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  React.useEffect(() => {
    fetchMaintenance('admin', user?.id);
  }, []);

  // Count action-required items for the badge on "All"
  const actionCount = maintenanceRequests.filter(r =>
    ADMIN_ACTION_REQUIRED.includes(r.status)
  ).length;

  const filtered = maintenanceRequests
    .filter((r) => {
      const matchSearch =
        r.title.toLowerCase().includes(search.toLowerCase()) ||
        r.unit.toLowerCase().includes(search.toLowerCase()) ||
        r.category.toLowerCase().includes(search.toLowerCase());
      const matchFilter = filter === 'all' || r.status === filter;
      return matchSearch && matchFilter;
    })
    .sort((a, b) => {
      // Action-required items float to top
      const aAction = ADMIN_ACTION_REQUIRED.includes(a.status) ? 0 : 1;
      const bAction = ADMIN_ACTION_REQUIRED.includes(b.status) ? 0 : 1;
      if (aAction !== bAction) return aAction - bAction;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  const getCount = (key) =>
    key === 'all'
      ? maintenanceRequests.length
      : maintenanceRequests.filter(r => r.status === key).length;

  const needsAction = (status) => ADMIN_ACTION_REQUIRED.includes(status);

  const ACTION_LABELS = {
    submitted:                   '⚡ Send Quote Request',
    quoted:                      '⚡ Forward Quote to Resident',
    quote_accepted:              '⚡ Confirm Work Start',
    payment_requested_to_admin:  '⚡ Request Payment from Resident',
    payment_received:            '⚡ Pay Vendor',
  };

  const renderItem = ({ item }) => {
    const color = STATUS_COLOR_MAP[item.status] || COLORS.textMuted;
    const actionNeeded = needsAction(item.status);

    return (
      <TouchableOpacity
        style={[
          globalStyles.card,
          styles.reqCard,
          actionNeeded && styles.reqCardAction,
        ]}
        onPress={() => navigation.navigate('MaintenanceDetail', { requestId: item.id })}
        activeOpacity={0.85}
      >
        <View style={{ flex: 1 }}>
          {/* Top row: ID + status badge */}
          <View style={styles.topRow}>
            <Text style={styles.reqId}>{item.id}</Text>
            <View style={[styles.statusBadge, { backgroundColor: color + '22' }]}>
              <Text style={[styles.statusText, { color }]}>
                {STATUS_LABELS[item.status] || item.status}
              </Text>
            </View>
          </View>

          <Text style={styles.reqTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.reqMeta}>{item.unit} · {item.category} · {item.priority}</Text>
          {item.residentName && (
            <Text style={styles.reqResident}>👤 {item.residentName}</Text>
          )}
          {item.assignedVendorName && (
            <Text style={styles.reqResident}>🔨 {item.assignedVendorName}</Text>
          )}
          {item.quote && (
            <Text style={styles.reqResident}>💰 ₹{item.quote.amount?.toLocaleString()}</Text>
          )}

          {/* Action Required banner */}
          {actionNeeded && ACTION_LABELS[item.status] && (
            <View style={styles.actionBanner}>
              <Text style={styles.actionBannerText}>
                {ACTION_LABELS[item.status]}
              </Text>
            </View>
          )}
        </View>
        <Text style={{ fontSize: 18, color: COLORS.textMuted }}>›</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={globalStyles.screen}>
      {/* Search */}
      <View style={styles.searchRow}>
        <TextInput
          style={[globalStyles.input, { flex: 1, marginBottom: 0 }]}
          placeholder="Search by title, unit or category..."
          placeholderTextColor={COLORS.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Action-required summary banner */}
      {actionCount > 0 && (
        <TouchableOpacity
          style={styles.summaryBanner}
          onPress={() => setFilter('all')}
        >
          <Text style={styles.summaryBannerText}>
            ⚡ {actionCount} request{actionCount > 1 ? 's' : ''} need{actionCount === 1 ? 's' : ''} your action — tap to view all
          </Text>
        </TouchableOpacity>
      )}

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterBar}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 10 }}
      >
        {FILTERS.map(({ key, label }) => {
          const count = getCount(key);
          const isActive = filter === key;
          return (
            <TouchableOpacity
              key={key}
              style={[styles.chip, isActive && styles.chipActive]}
              onPress={() => setFilter(key)}
            >
              <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                {label} ({count})
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <FlatList
        data={filtered}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        ListEmptyComponent={
          <View style={globalStyles.emptyState}>
            <Text style={{ fontSize: 36 }}>🔧</Text>
            <Text style={globalStyles.emptyText}>No maintenance requests</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  searchRow: { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 14 },

  summaryBanner: {
    marginHorizontal: 16, marginTop: 10,
    backgroundColor: '#E8F5F5', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10,
    borderLeftWidth: 4, borderLeftColor: '#1A7A7A',
  },
  summaryBannerText: { color: '#1A7A7A', fontWeight: '700', fontSize: 13 },

  filterBar: { borderBottomWidth: 1, borderBottomColor: '#D0EEEE' },
  chip: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, marginRight: 8,
    backgroundColor: '#F0FAFA', borderWidth: 1, borderColor: '#D0EEEE',
  },
  chipActive: { backgroundColor: '#1A7A7A', borderColor: '#1A7A7A' },
  chipText: { fontSize: 11, fontWeight: '600', color: '#3D6E6E' },
  chipTextActive: { color: '#FFFFFF' },

  reqCard: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  reqCardAction: {
    borderLeftWidth: 4, borderLeftColor: '#1A7A7A',
  },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  reqId: { fontSize: 11, color: '#7A9E9E', fontWeight: '600' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: '700' },
  reqTitle: { fontSize: 14, fontWeight: '700', color: '#1A2E2E', marginBottom: 2 },
  reqMeta: { fontSize: 12, color: '#3D6E6E' },
  reqResident: { fontSize: 11, color: '#7A9E9E', marginTop: 2 },

  actionBanner: {
    marginTop: 8, backgroundColor: '#E8F5F5', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 5, alignSelf: 'flex-start',
    borderLeftWidth: 3, borderLeftColor: '#1A7A7A',
  },
  actionBannerText: { color: '#1A7A7A', fontWeight: '700', fontSize: 11 },
});