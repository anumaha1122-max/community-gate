import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar,
  ScrollView, Alert, Modal, Share,
} from 'react-native';
import { COLORS, globalStyles } from '../../../components/common/theme';
import { useTheme } from '../../../hooks/useTheme';

// ─── Constants ────────────────────────────────────────────────────────────────

const TEAL      = '#1A7A7A';
const TEAL_DARK = '#155F5F';
const TEAL_SOFT = '#E8F5F5';
const TEAL_MID  = '#D0EEEE';
const TEAL_TEXT = '#3D6E6E';

const BILL_TYPE_META = {
  maintenance: { emoji: '🏢', label: 'Maintenance Charges', color: '#1A7A7A', bg: '#E8F5F5' },
  water:       { emoji: '💧', label: 'Water Charges',        color: '#0277BD', bg: '#E3F2FD' },
  electricity:  { emoji: '⚡', label: 'Electricity Bill',    color: '#F57F17', bg: '#FFF8E1' },
  parking:     { emoji: '🚗', label: 'Parking Charges',      color: '#6A1B9A', bg: '#F3E5F5' },
  penalty:     { emoji: '⚠️',  label: 'Penalty / Fine',      color: '#C62828', bg: '#FFEBEE' },
  other:       { emoji: '📄', label: 'Miscellaneous',         color: '#37474F', bg: '#ECEFF1' },
};

function fmt(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
}
function fmtTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
function isOverdue(bill) {
  return bill.status === 'unpaid' && new Date(bill.dueDate) < new Date();
}

// ─── Share Receipt Modal ──────────────────────────────────────────────────────

function ShareReceiptModal({ visible, onClose, bill }) {
  const [sent, setSent] = useState(false);
  const CHANNELS = [
    { icon: '💬', label: 'WhatsApp' },
    { icon: '📧', label: 'Email' },
    { icon: '📋', label: 'Copy' },
    { icon: '📥', label: 'Download' },
  ];
  const receiptText =
    `🧾 PAYMENT RECEIPT\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `Community: BS Gated Community\n` +
    `Invoice #: ${bill?.id}\n` +
    `Unit: ${bill?.unit}\n` +
    `Period: ${bill?.month}\n` +
    `Amount: ₹${bill?.total?.toLocaleString('en-IN')}\n` +
    `Status: PAID ✅\n` +
    `Paid On: ${fmtTime(bill?.paidAt)}\n` +
    `Txn ID: ${bill?.transactionId}\n` +
    `━━━━━━━━━━━━━━━━━━━━`;

  const handleShare = (channel) => {
    setSent(true);
    setTimeout(() => {
      setSent(false);
      onClose();
      if (channel === 'Copy') {
        Alert.alert('✅ Copied!', 'Receipt text copied to clipboard.');
      } else {
        Alert.alert('✅ Shared!', `Receipt sent via ${channel}.`);
      }
    }, 900);
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={shareStyles.overlay}>
        <View style={shareStyles.sheet}>
          <View style={shareStyles.handle} />
          <Text style={shareStyles.title}>📤 Share Receipt</Text>
          <View style={shareStyles.previewBox}>
            <Text style={shareStyles.previewText}>{receiptText}</Text>
          </View>
          {sent ? (
            <View style={shareStyles.sentRow}>
              <Text style={shareStyles.sentText}>✅ Sharing...</Text>
            </View>
          ) : (
            <>
              <Text style={shareStyles.channelLabel}>SEND VIA</Text>
              <View style={shareStyles.channelRow}>
                {CHANNELS.map(c => (
                  <TouchableOpacity key={c.label} style={shareStyles.channelBtn} onPress={() => handleShare(c.label)}>
                    <Text style={shareStyles.channelIcon}>{c.icon}</Text>
                    <Text style={shareStyles.channelText}>{c.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
          <TouchableOpacity style={shareStyles.cancelBtn} onPress={onClose}>
            <Text style={shareStyles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const shareStyles = StyleSheet.create({
  overlay:     { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  sheet:       { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 34 },
  handle:      { width: 40, height: 4, backgroundColor: TEAL_MID, borderRadius: 2, alignSelf: 'center', marginBottom: 18 },
  title:       { fontSize: 18, fontWeight: '800', color: '#1A2E2E', marginBottom: 14 },
  previewBox:  { backgroundColor: TEAL_SOFT, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: TEAL_MID, marginBottom: 16 },
  previewText: { fontSize: 12, color: TEAL_TEXT, lineHeight: 20, fontFamily: 'monospace' },
  channelLabel:{ fontSize: 11, fontWeight: '800', color: '#94A3B8', letterSpacing: 0.8, marginBottom: 10 },
  channelRow:  { flexDirection: 'row', gap: 8, marginBottom: 8 },
  channelBtn:  { flex: 1, alignItems: 'center', backgroundColor: TEAL_SOFT, borderRadius: 14, paddingVertical: 12, borderWidth: 1, borderColor: TEAL_MID },
  channelIcon: { fontSize: 22 },
  channelText: { fontSize: 11, fontWeight: '700', color: TEAL_TEXT, marginTop: 4 },
  sentRow:     { alignItems: 'center', paddingVertical: 20 },
  sentText:    { fontSize: 16, fontWeight: '800', color: TEAL },
  cancelBtn:   { paddingVertical: 14, alignItems: 'center' },
  cancelText:  { fontSize: 14, fontWeight: '700', color: '#64748B' },
});

// ─── Invoice Row ──────────────────────────────────────────────────────────────

function InvoiceRow({ label, value, bold, valueColor, noBorder }) {
  return (
    <View style={[invStyles.row, noBorder && { borderBottomWidth: 0 }]}>
      <Text style={[invStyles.label, bold && { fontWeight: '800', color: '#1A2E2E', fontSize: 14 }]}>{label}</Text>
      <Text style={[invStyles.value, bold && { fontWeight: '900', fontSize: 16 }, valueColor && { color: valueColor }]}>{value}</Text>
    </View>
  );
}

const invStyles = StyleSheet.create({
  row:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F0FAFA' },
  label: { fontSize: 13, color: '#7A9E9E', fontWeight: '600', flex: 1 },
  value: { fontSize: 13, color: '#1A2E2E', fontWeight: '700', maxWidth: '55%', textAlign: 'right' },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function InvoiceDetailScreen({ navigation, route }) {
  const theme = useTheme();
  const { bill } = route.params || {};
  const [showShare, setShowShare] = useState(false);

  if (!bill) return null;

  const meta    = BILL_TYPE_META[bill.type] || BILL_TYPE_META.maintenance;
  const overdue = isOverdue(bill);

  // Compute GST/service fee line if applicable (real-world: 18% GST on some charges)
  const gstAmount = bill.items
    ? bill.items.filter(i => i.gst).reduce((s, i) => s + Math.round(i.amount * 0.18), 0)
    : 0;

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={TEAL_DARK} />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Invoice</Text>
          {bill.status === 'paid' ? (
            <TouchableOpacity style={styles.shareBtn} onPress={() => setShowShare(true)}>
              <Text style={styles.shareBtnText}>Share 📤</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 80 }} />
          )}
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false}>

        {/* ── Society Letterhead ── */}
        <View style={styles.letterhead}>
          <View style={styles.letterheadLeft}>
            <View style={styles.societyIcon}>
              <Text style={{ fontSize: 28 }}>🏢</Text>
            </View>
            <View>
              <Text style={styles.societyName}>BS Gated Community</Text>
              <Text style={styles.societyAddr}>Block A, Hyderabad – 500032</Text>
              <Text style={styles.societyGST}>GSTIN: 36AABCS1234N1ZK</Text>
            </View>
          </View>
          <View style={styles.invNumBox}>
            <Text style={styles.invNumLabel}>INVOICE</Text>
            <Text style={styles.invNum}>#{bill.id}</Text>
          </View>
        </View>

        {/* ── Type badge + Status ── */}
        <View style={styles.typeRow}>
          <View style={[styles.typePill, { backgroundColor: meta.bg }]}>
            <Text style={{ fontSize: 16 }}>{meta.emoji}</Text>
            <Text style={[styles.typePillText, { color: meta.color }]}>{meta.label}</Text>
          </View>
          <View style={[styles.statusPill, {
            backgroundColor: bill.status === 'paid' ? '#E8F5E9' : overdue ? '#FFEBEE' : '#FFF8E1'
          }]}>
            <Text style={[styles.statusPillText, {
              color: bill.status === 'paid' ? '#2E7D32' : overdue ? '#C62828' : '#E65100'
            }]}>
              {bill.status === 'paid' ? '✅ PAID' : overdue ? '🔴 OVERDUE' : '⏳ UNPAID'}
            </Text>
          </View>
        </View>

        {/* ── Invoice Details ── */}
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>Invoice Details</Text>
          <InvoiceRow label="Invoice ID"  value={bill.id} />
          <InvoiceRow label="Resident Unit" value={bill.unit} />
          <InvoiceRow label="Billing Period" value={bill.month} />
          <InvoiceRow label="Issue Date" value={fmt(bill.createdAt || bill.dueDate)} />
          <InvoiceRow label="Due Date" value={fmt(bill.dueDate)} noBorder />
        </View>

        {/* ── Charge Breakdown ── */}
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>Charge Breakdown</Text>
          {(bill.items || []).map((item, i) => (
            <View key={i} style={invStyles.row}>
              <Text style={invStyles.label}>{item.label}</Text>
              <Text style={invStyles.value}>₹{item.amount.toLocaleString('en-IN')}</Text>
            </View>
          ))}
          {gstAmount > 0 && (
            <View style={invStyles.row}>
              <Text style={[invStyles.label, { color: '#E65100' }]}>GST (18%)</Text>
              <Text style={[invStyles.value, { color: '#E65100' }]}>₹{gstAmount.toLocaleString('en-IN')}</Text>
            </View>
          )}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={[styles.totalValue, { color: bill.status === 'paid' ? '#2E7D32' : overdue ? '#C62828' : TEAL }]}>
              ₹{bill.total.toLocaleString('en-IN')}
            </Text>
          </View>
        </View>

        {/* ── Payment Info (if paid) ── */}
        {bill.status === 'paid' && (
          <View style={styles.card}>
            <Text style={styles.cardSectionTitle}>Payment Details</Text>
            <InvoiceRow label="Paid On"     value={fmtTime(bill.paidAt)} />
            <InvoiceRow label="Payment Mode" value={bill.paymentMode || 'UPI'} />
            <InvoiceRow label="Transaction ID" value={bill.transactionId || '—'} noBorder />

            {/* PAID stamp */}
            <View style={styles.stampContainer}>
              <View style={styles.stamp}>
                <Text style={styles.stampText}>✓ PAID</Text>
                <Text style={styles.stampAmount}>₹{bill.total.toLocaleString('en-IN')}</Text>
              </View>
            </View>
          </View>
        )}

        {/* ── Late penalty notice (if overdue) ── */}
        {overdue && bill.status === 'unpaid' && (
          <View style={styles.penaltyNotice}>
            <Text style={styles.penaltyTitle}>⚠️ Overdue Notice</Text>
            <Text style={styles.penaltyText}>
              This invoice is past its due date. A late payment penalty of ₹100/week may be levied by the society committee per bye-law 14(b). Please clear dues immediately.
            </Text>
          </View>
        )}

        {/* ── Due date reminder (if unpaid but not overdue) ── */}
        {!overdue && bill.status === 'unpaid' && (
          <View style={styles.reminderNotice}>
            <Text style={styles.reminderText}>
              💡 Pay before {fmt(bill.dueDate)} to avoid late fees. Payments are processed within 24 hours.
            </Text>
          </View>
        )}

        {/* ── CTA ── */}
        {bill.status === 'unpaid' ? (
          <TouchableOpacity
            style={[styles.ctaBtn, overdue && styles.ctaBtnDanger]}
            onPress={() => navigation.navigate('Payment', { bill })}
          >
            <Text style={styles.ctaBtnText}>💳 Pay ₹{bill.total.toLocaleString('en-IN')}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.ctaBtnOutline} onPress={() => setShowShare(true)}>
            <Text style={styles.ctaBtnOutlineText}>📤 Share / Download Receipt</Text>
          </TouchableOpacity>
        )}

        {/* Footer note */}
        <Text style={styles.footerNote}>
          This is a computer-generated invoice and does not require a signature.
          For disputes, contact: admin@bsgatedcommunity.in
        </Text>

        <View style={{ height: 40 }} />
      </ScrollView>

      <ShareReceiptModal visible={showShare} onClose={() => setShowShare(false)} bill={bill} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F5F7FA' },

  // Header
  header: {
    backgroundColor: TEAL,
    padding: 20,
    paddingTop: 40,
  },
  backBtn:      { marginBottom: 8 },
  backText:     { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  headerRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle:  { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
  shareBtn:     { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  shareBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },

  // Letterhead
  letterhead: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: TEAL_MID,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  letterheadLeft: { flexDirection: 'row', alignItems: 'flex-start', flex: 1 },
  societyIcon: { width: 48, height: 48, borderRadius: 14, backgroundColor: TEAL_SOFT, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  societyName: { fontSize: 15, fontWeight: '800', color: '#1A2E2E' },
  societyAddr: { fontSize: 11, color: '#7A9E9E', marginTop: 2 },
  societyGST:  { fontSize: 10, color: '#94A3B8', marginTop: 1, fontFamily: 'monospace' },
  invNumBox:   { alignItems: 'flex-end' },
  invNumLabel: { fontSize: 10, fontWeight: '800', color: '#94A3B8', letterSpacing: 1 },
  invNum:      { fontSize: 14, fontWeight: '900', color: TEAL, fontFamily: 'monospace' },

  // Type & status row
  typeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  typePill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, gap: 6 },
  typePillText: { fontSize: 13, fontWeight: '800' },
  statusPill: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  statusPillText: { fontSize: 12, fontWeight: '800' },

  // Card
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: TEAL_MID,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  cardSectionTitle: { fontSize: 12, fontWeight: '800', color: '#94A3B8', letterSpacing: 0.8, marginBottom: 10, textTransform: 'uppercase' },

  // Total row
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 12, borderTopWidth: 2, borderTopColor: TEAL_MID },
  totalLabel: { fontSize: 15, fontWeight: '800', color: '#1A2E2E' },
  totalValue: { fontSize: 22, fontWeight: '900' },

  // Paid stamp
  stampContainer: { alignItems: 'center', marginTop: 16 },
  stamp: {
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: '#2E7D32',
    alignItems: 'center',
    transform: [{ rotate: '-6deg' }],
    backgroundColor: 'rgba(46,125,50,0.05)',
  },
  stampText:   { fontSize: 20, fontWeight: '900', color: '#2E7D32', letterSpacing: 5 },
  stampAmount: { fontSize: 14, fontWeight: '700', color: '#2E7D32', marginTop: 2 },

  // Notices
  penaltyNotice: { backgroundColor: '#FFEBEE', borderRadius: 14, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: '#FFCDD2', borderLeftWidth: 4, borderLeftColor: '#C62828' },
  penaltyTitle:  { fontSize: 14, fontWeight: '800', color: '#C62828', marginBottom: 6 },
  penaltyText:   { fontSize: 13, color: '#B71C1C', lineHeight: 20 },
  reminderNotice:{ backgroundColor: '#FFF8E1', borderRadius: 14, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: '#FFE082' },
  reminderText:  { fontSize: 13, color: '#E65100', lineHeight: 20 },

  // CTA buttons
  ctaBtn:            { backgroundColor: TEAL, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginBottom: 12, shadowColor: TEAL_DARK, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 5 },
  ctaBtnDanger:      { backgroundColor: '#C62828' },
  ctaBtnText:        { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  ctaBtnOutline:     { borderWidth: 2, borderColor: TEAL, borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginBottom: 12 },
  ctaBtnOutlineText: { color: TEAL, fontSize: 15, fontWeight: '800' },

  // Footer
  footerNote: { fontSize: 11, color: '#94A3B8', textAlign: 'center', lineHeight: 17, marginTop: 4 },
});