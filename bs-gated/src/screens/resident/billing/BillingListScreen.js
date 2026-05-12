import React, { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar,
  ScrollView, Animated, Modal, Alert,
} from 'react-native';
import { useAuthStore } from '../../../store/AuthStore';
import useResidentStore from '../../../store/residentStore';
import { COLORS, globalStyles } from '../../../components/common/theme';
import { useTheme } from '../../../hooks/useTheme';

// ─── Constants ────────────────────────────────────────────────────────────────

const TEAL      = '#1A7A7A';
const TEAL_DARK = '#155F5F';
const TEAL_SOFT = '#E8F5F5';
const TEAL_MID  = '#D0EEEE';
const TEAL_TEXT = '#3D6E6E';

const BILL_TYPE_META = {
  maintenance: { emoji: '🏢', label: 'Maintenance',  color: '#1A7A7A', bg: '#E8F5F5' },
  water:       { emoji: '💧', label: 'Water Charges', color: '#0277BD', bg: '#E3F2FD' },
  electricity:  { emoji: '⚡', label: 'Electricity',  color: '#F57F17', bg: '#FFF8E1' },
  parking:     { emoji: '🚗', label: 'Parking',       color: '#6A1B9A', bg: '#F3E5F5' },
  clubhouse:   { emoji: '🏛️', label: 'Clubhouse',   color: '#1B5E20', bg: '#E8F5E9' },
  penalty:     { emoji: '⚠️',  label: 'Penalty',      color: '#C62828', bg: '#FFEBEE' },
  other:       { emoji: '📄', label: 'Misc Charges',  color: '#37474F', bg: '#ECEFF1' },
};

const FILTERS = [
  { k: 'all',      label: 'All Bills' },
  { k: 'unpaid',   label: '⚠️ Unpaid' },
  { k: 'paid',     label: '✅ Paid' },
  { k: 'overdue',  label: '🔴 Overdue' },
];

function isOverdue(bill) {
  return bill.status === 'unpaid' && new Date(bill.dueDate) < new Date();
}

function daysUntilDue(dueDate) {
  const diff = Math.ceil((new Date(dueDate) - new Date()) / (1000 * 60 * 60 * 24));
  return diff;
}

function fmt(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ─── Summary Banner ───────────────────────────────────────────────────────────

function SummaryBanner({ bills }) {
  const unpaidBills  = bills.filter(b => b.status === 'unpaid');
  const overdueBills = unpaidBills.filter(b => isOverdue(b));
  const totalDue     = unpaidBills.reduce((s, b) => s + b.total, 0);
  const totalOverdue = overdueBills.reduce((s, b) => s + b.total, 0);

  if (unpaidBills.length === 0) {
    return (
      <View style={bannerStyles.allClearBanner}>
        <Text style={bannerStyles.allClearEmoji}>🎉</Text>
        <View>
          <Text style={bannerStyles.allClearTitle}>All Paid Up!</Text>
          <Text style={bannerStyles.allClearSub}>You have no pending dues.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={bannerStyles.container}>
      {/* Main due amount */}
      <View style={bannerStyles.topRow}>
        <View>
          <Text style={bannerStyles.dueLabel}>Total Pending Dues</Text>
          <Text style={bannerStyles.dueAmount}>₹{totalDue.toLocaleString('en-IN')}</Text>
          <Text style={bannerStyles.dueSub}>{unpaidBills.length} bill{unpaidBills.length > 1 ? 's' : ''} pending</Text>
        </View>
        <View style={bannerStyles.iconCircle}>
          <Text style={{ fontSize: 28 }}>💰</Text>
        </View>
      </View>

      {/* Overdue alert strip */}
      {overdueBills.length > 0 && (
        <View style={bannerStyles.overdueStrip}>
          <Text style={bannerStyles.overdueText}>
            🔴  {overdueBills.length} bill{overdueBills.length > 1 ? 's' : ''} overdue · ₹{totalOverdue.toLocaleString('en-IN')} — Late charges may apply
          </Text>
        </View>
      )}

      {/* Stat pills */}
      <View style={bannerStyles.statRow}>
        <View style={bannerStyles.statPill}>
          <Text style={bannerStyles.statValue}>{unpaidBills.length}</Text>
          <Text style={bannerStyles.statLabel}>Unpaid</Text>
        </View>
        <View style={[bannerStyles.statPill, { borderColor: '#C62828' }]}>
          <Text style={[bannerStyles.statValue, { color: '#C62828' }]}>{overdueBills.length}</Text>
          <Text style={bannerStyles.statLabel}>Overdue</Text>
        </View>
        <View style={[bannerStyles.statPill, { borderColor: '#2E7D32' }]}>
          <Text style={[bannerStyles.statValue, { color: '#2E7D32' }]}>
            {bills.filter(b => b.status === 'paid').length}
          </Text>
          <Text style={bannerStyles.statLabel}>Paid</Text>
        </View>
      </View>
    </View>
  );
}

const bannerStyles = StyleSheet.create({
  container: {
    backgroundColor: TEAL,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    padding: 20,
    shadowColor: TEAL_DARK,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  dueLabel: { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.7)', letterSpacing: 0.5, marginBottom: 4 },
  dueAmount: { fontSize: 34, fontWeight: '900', color: '#FFFFFF' },
  dueSub: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  iconCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  overdueStrip: { backgroundColor: 'rgba(198,40,40,0.85)', borderRadius: 10, padding: 10, marginBottom: 12 },
  overdueText: { fontSize: 12, color: '#FFFFFF', fontWeight: '700', textAlign: 'center' },
  statRow: { flexDirection: 'row', gap: 8 },
  statPill: { flex: 1, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, paddingVertical: 10, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' },
  statValue: { fontSize: 20, fontWeight: '900', color: '#FFFFFF' },
  statLabel: { fontSize: 10, color: 'rgba(255,255,255,0.7)', fontWeight: '700', marginTop: 2 },
  allClearBanner: { backgroundColor: '#E8F5E9', marginHorizontal: 16, marginTop: 16, borderRadius: 20, padding: 20, flexDirection: 'row', alignItems: 'center', gap: 14, borderWidth: 1, borderColor: '#A5D6A7' },
  allClearEmoji: { fontSize: 36 },
  allClearTitle: { fontSize: 17, fontWeight: '800', color: '#1B5E20' },
  allClearSub: { fontSize: 13, color: '#388E3C', marginTop: 2 },
});

// ─── Bill Card ────────────────────────────────────────────────────────────────

function BillCard({ bill, onPress, onPay }) {
  const meta     = BILL_TYPE_META[bill.type] || BILL_TYPE_META.other;
  const overdue  = isOverdue(bill);
  const days     = bill.status === 'unpaid' ? daysUntilDue(bill.dueDate) : null;

  return (
    <TouchableOpacity
      style={[
        cardStyles.card,
        overdue && cardStyles.cardOverdue,
        bill.status === 'paid' && cardStyles.cardPaid,
      ]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {/* Left accent bar */}
      <View style={[cardStyles.accentBar, { backgroundColor: overdue ? '#C62828' : meta.color }]} />

      <View style={cardStyles.inner}>
        {/* Top row */}
        <View style={cardStyles.topRow}>
          {/* Type badge */}
          <View style={[cardStyles.typeBadge, { backgroundColor: meta.bg }]}>
            <Text style={cardStyles.typeBadgeEmoji}>{meta.emoji}</Text>
            <Text style={[cardStyles.typeBadgeText, { color: meta.color }]}>{meta.label}</Text>
          </View>

          {/* Status chip */}
          <View style={[cardStyles.statusChip, { backgroundColor: bill.status === 'paid' ? '#E8F5E9' : overdue ? '#FFEBEE' : '#FFF8E1' }]}>
            <Text style={[cardStyles.statusText, { color: bill.status === 'paid' ? '#2E7D32' : overdue ? '#C62828' : '#E65100' }]}>
              {bill.status === 'paid' ? '✅ PAID' : overdue ? '🔴 OVERDUE' : '⏳ UNPAID'}
            </Text>
          </View>
        </View>

        {/* Bill title & period */}
        <Text style={cardStyles.billTitle}>{bill.month}</Text>
        <Text style={cardStyles.billSub}>Unit: {bill.unit}  ·  Invoice #{bill.id}</Text>

        {/* Due date row */}
        <View style={cardStyles.metaRow}>
          <Text style={cardStyles.metaText}>
            📅 Due: {fmt(bill.dueDate)}
            {bill.status === 'unpaid' && days !== null && (
              <Text style={{ color: days < 0 ? '#C62828' : days <= 3 ? '#E65100' : '#1A7A7A', fontWeight: '800' }}>
                {days < 0 ? `  (${Math.abs(days)}d overdue)` : days === 0 ? '  (Due today)' : `  (${days}d left)`}
              </Text>
            )}
          </Text>
          {bill.status === 'paid' && bill.paidAt && (
            <Text style={cardStyles.paidOnText}>Paid: {fmt(bill.paidAt)}</Text>
          )}
        </View>

        {/* Amount + action */}
        <View style={cardStyles.bottomRow}>
          <View>
            <Text style={cardStyles.amountLabel}>Amount</Text>
            <Text style={[cardStyles.amount, { color: bill.status === 'paid' ? '#2E7D32' : overdue ? '#C62828' : TEAL }]}>
              ₹{bill.total.toLocaleString('en-IN')}
            </Text>
          </View>

          {bill.status === 'unpaid' ? (
            <TouchableOpacity
              style={[cardStyles.payBtn, overdue && cardStyles.payBtnOverdue]}
              onPress={onPay}
            >
              <Text style={cardStyles.payBtnText}>Pay Now →</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={cardStyles.viewBtn} onPress={onPress}>
              <Text style={cardStyles.viewBtnText}>Receipt ↗</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Transaction ID for paid bills */}
        {bill.status === 'paid' && bill.transactionId && (
          <View style={cardStyles.txnRow}>
            <Text style={cardStyles.txnText}>🧾 Txn: {bill.transactionId}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const cardStyles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: TEAL_MID,
    overflow: 'hidden',
  },
  cardOverdue: { borderColor: '#FFCDD2', shadowColor: '#C62828', shadowOpacity: 0.15 },
  cardPaid: { borderColor: '#C8E6C9', opacity: 0.9 },
  accentBar: { width: 5, backgroundColor: TEAL },
  inner: { flex: 1, padding: 14 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  typeBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, gap: 5 },
  typeBadgeEmoji: { fontSize: 13 },
  typeBadgeText: { fontSize: 12, fontWeight: '800' },
  statusChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.3 },
  billTitle: { fontSize: 16, fontWeight: '800', color: '#1A2E2E', marginBottom: 2 },
  billSub: { fontSize: 12, color: '#7A9E9E', marginBottom: 6 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', marginBottom: 10 },
  metaText: { fontSize: 12, color: '#7A9E9E', fontWeight: '600' },
  paidOnText: { fontSize: 12, color: '#2E7D32', fontWeight: '600' },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  amountLabel: { fontSize: 11, color: '#7A9E9E', fontWeight: '700', marginBottom: 2 },
  amount: { fontSize: 22, fontWeight: '900' },
  payBtn: { backgroundColor: TEAL, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 12 },
  payBtnOverdue: { backgroundColor: '#C62828' },
  payBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  viewBtn: { backgroundColor: TEAL_SOFT, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: TEAL_MID },
  viewBtnText: { color: TEAL, fontSize: 13, fontWeight: '700' },
  txnRow: { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#F0FAFA' },
  txnText: { fontSize: 11, color: '#7A9E9E', fontFamily: 'monospace' },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function BillingListScreen({ navigation }) {
  const theme = useTheme();
  const user  = useAuthStore(s => s.user);
  const bills = useResidentStore(s => s.bills);

  const myBills = bills
    .filter(b => b.residentId === (user?.id || 'res1'))
    .sort((a, b) => {
      // Sort: overdue first, then unpaid by due date, then paid by date desc
      if (isOverdue(a) && !isOverdue(b)) return -1;
      if (!isOverdue(a) && isOverdue(b)) return 1;
      if (a.status === 'unpaid' && b.status === 'paid') return -1;
      if (a.status === 'paid' && b.status === 'unpaid') return 1;
      return new Date(b.dueDate) - new Date(a.dueDate);
    });

  const [filter, setFilter] = useState('all');

  const filtered = myBills.filter(b => {
    if (filter === 'all') return true;
    if (filter === 'overdue') return isOverdue(b);
    return b.status === filter;
  });

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={TEAL_DARK} />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>My Bills</Text>
            <Text style={styles.headerSub}>Unit {user?.unit || 'A-101'}</Text>
          </View>
          <TouchableOpacity style={styles.historyBtn} onPress={() => setFilter(f => f === 'paid' ? 'all' : 'paid')}>
            <Text style={styles.historyBtnText}>History</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Filter Chips ── */}
      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12, gap: 8, flexDirection: 'row' }}>
          {FILTERS.map(f => (
            <TouchableOpacity
              key={f.k}
              style={[styles.chip, filter === f.k && styles.chipActive]}
              onPress={() => setFilter(f.k)}
            >
              <Text style={[styles.chipText, filter === f.k && styles.chipTextActive]}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false}>
        {/* Summary banner - only show on 'all' or 'unpaid' */}
        {(filter === 'all' || filter === 'unpaid' || filter === 'overdue') && (
          <SummaryBanner bills={myBills} />
        )}

        {/* Section label */}
        <View style={styles.sectionLabelRow}>
          <Text style={styles.sectionLabel}>
            {filter === 'all' ? `All Bills (${filtered.length})` :
             filter === 'unpaid' ? `Unpaid Bills (${filtered.length})` :
             filter === 'overdue' ? `Overdue Bills (${filtered.length})` :
             `Payment History (${filtered.length})`}
          </Text>
        </View>

        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={{ fontSize: 52 }}>{filter === 'paid' ? '🎉' : '📭'}</Text>
            <Text style={styles.emptyTitle}>
              {filter === 'paid' ? 'No payments yet' : 'No bills here'}
            </Text>
            <Text style={styles.emptySub}>
              {filter === 'paid' ? 'Your payment history will appear here.' : 'You\'re all clear on this filter.'}
            </Text>
          </View>
        ) : (
          filtered.map(bill => (
            <BillCard
              key={bill.id}
              bill={bill}
              onPress={() => navigation.navigate('InvoiceDetail', { bill })}
              onPay={() => navigation.navigate('Payment', { bill })}
            />
          ))
        )}

        {/* Year summary if showing all paid */}
        {filter === 'paid' && filtered.length > 0 && (
          <View style={styles.yearSummaryCard}>
            <Text style={styles.yearSummaryTitle}>💼 2025 Payment Summary</Text>
            <View style={styles.yearSummaryRow}>
              <Text style={styles.yearSummaryLabel}>Total Paid This Year</Text>
              <Text style={styles.yearSummaryValue}>
                ₹{filtered.filter(b => b.paidAt && new Date(b.paidAt).getFullYear() === 2025).reduce((s, b) => s + b.total, 0).toLocaleString('en-IN')}
              </Text>
            </View>
            <View style={styles.yearSummaryRow}>
              <Text style={styles.yearSummaryLabel}>Bills Settled</Text>
              <Text style={styles.yearSummaryValue}>{filtered.length}</Text>
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F5F7FA' },

  // ── Header
  header: {
    backgroundColor: TEAL,
    padding: 20,
    paddingTop: 40,
  },
  backBtn: { marginBottom: 8 },
  backText: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerCenter: {},
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 2 },
  historyBtn: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  historyBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },

  // ── Filter bar
  filterBar: { backgroundColor: '#FFFFFF', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: TEAL_MID },
  chip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: TEAL_SOFT, borderWidth: 1, borderColor: TEAL_MID, justifyContent: 'center' },
  chipActive: { backgroundColor: TEAL, borderColor: TEAL },
  chipText: { fontSize: 12, fontWeight: '700', color: TEAL_TEXT },
  chipTextActive: { color: '#FFFFFF' },

  // ── Section label
  sectionLabelRow: { marginTop: 20, marginBottom: 12 },
  sectionLabel: { fontSize: 12, fontWeight: '800', color: '#94A3B8', letterSpacing: 0.8, textTransform: 'uppercase' },

  // ── Empty
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 17, fontWeight: '800', color: '#1A2E2E', marginTop: 12 },
  emptySub: { fontSize: 13, color: '#7A9E9E', marginTop: 6, textAlign: 'center' },

  // ── Year summary
  yearSummaryCard: { backgroundColor: TEAL_SOFT, borderRadius: 16, padding: 16, marginTop: 8, borderWidth: 1, borderColor: TEAL_MID },
  yearSummaryTitle: { fontSize: 14, fontWeight: '800', color: TEAL_DARK, marginBottom: 12 },
  yearSummaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: TEAL_MID },
  yearSummaryLabel: { fontSize: 13, color: TEAL_TEXT, fontWeight: '600' },
  yearSummaryValue: { fontSize: 14, fontWeight: '800', color: TEAL_DARK },
});