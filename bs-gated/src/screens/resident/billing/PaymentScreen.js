/**
 * PaymentScreen.js
 *
 * A premium payment gateway simulation for the BS-Gated community.
 * Handles Maintenance Bills, Utility Bills, and Amenity Bookings.
 * Features: Multi-method selection, simulated processing, and success state sync.
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
  SafeAreaView, StatusBar, TextInput, Modal, Alert, ActivityIndicator,
  Dimensions, Animated, Easing
} from 'react-native';
import useResidentStore from '../../../store/residentStore';
import useSharedStore from '../../../store/appStore';
import { useTheme } from '../../../hooks/useTheme';

const { width, height } = Dimensions.get('window');

// ─── Constants ────────────────────────────────────────────────────────────────

const TEAL = '#1A7A7A';
const TEAL_DARK = '#0D6E6E';
const TEAL_SOFT = '#F0FAFA';
const TEAL_MID = '#D0EEEE';
const TEAL_TEXT = '#3D6E6E';

const PAYMENT_METHODS = [
  { key: 'upi', label: 'UPI / Google Pay / PhonePe', sub: 'Instant & Secure', emoji: '📱' },
  { key: 'card', label: 'Credit / Debit Card', sub: 'Visa, Mastercard, RuPay', emoji: '💳' },
  { key: 'netbanking', label: 'Net Banking', sub: 'All major Indian banks', emoji: '🏦' },
  { key: 'wallet', label: 'Wallets / Other', sub: 'Paytm, Amazon Pay, etc.', emoji: '👛' },
];

const UPI_APPS = [
  { id: 'gpay', label: 'Google Pay', emoji: '🌀' },
  { id: 'phonepe', label: 'PhonePe', emoji: '🟣' },
  { id: 'paytm', label: 'Paytm', emoji: '🔵' },
  { id: 'other', label: 'Other UPI ID', emoji: '🆔' },
];

const BANKS = ['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra Bank'];

const genTxnId = () => `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

// ─── Components ───────────────────────────────────────────────────────────────

/** Processing Overlay - Shows during simulated bank communication */
function ProcessingOverlay({ visible, amount }) {
  if (!visible) return null;
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={procStyles.overlay}>
        <View style={procStyles.card}>
          <ActivityIndicator size="large" color={TEAL} />
          <Text style={procStyles.title}>Processing Payment</Text>
          <Text style={procStyles.amount}>₹{amount?.toLocaleString('en-IN')}</Text>
          <Text style={procStyles.sub}>Please do not refresh or close the app. We are communicating with your bank securely...</Text>
          <View style={procStyles.securityRow}>
            <Text style={procStyles.securityText}>🔒 256-bit Encryption</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const procStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  card: { backgroundColor: '#FFF', borderRadius: 24, padding: 30, alignItems: 'center', width: '100%', maxWidth: 340 },
  title: { fontSize: 18, fontWeight: '800', color: '#1A2E2E', marginTop: 20 },
  amount: { fontSize: 28, fontWeight: '900', color: TEAL, marginVertical: 10 },
  sub: { fontSize: 13, color: '#64748B', textAlign: 'center', lineHeight: 20 },
  securityRow: { marginTop: 20, paddingTop: 15, borderTopWidth: 1, borderTopColor: '#F1F5F9', width: '100%', alignItems: 'center' },
  securityText: { fontSize: 11, fontWeight: '700', color: '#94A3B8' },
});

/** Success Modal - Final state after payment */
function SuccessModal({ visible, bill, txnId, method, onDone }) {
  const scale = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 50, friction: 7 }).start();
    } else {
      scale.setValue(0);
    }
  }, [visible]);

  if (!visible) return null;

  const isMaintenance = bill?.type === 'maintenance' || bill?.maintenanceRequestId;

  return (
    <Modal transparent visible={visible} animationType="none">
      <View style={successStyles.overlay}>
        <Animated.View style={[successStyles.card, { transform: [{ scale }] }]}>
          <View style={successStyles.iconCircle}>
            <Text style={successStyles.iconText}>🎉</Text>
          </View>
          <Text style={successStyles.title}>Payment Received!</Text>
          <Text style={successStyles.sub}>Thank you! Your payment of ₹{bill?.total?.toLocaleString('en-IN')} has been successfully processed and the maintenance record updated.</Text>

          <View style={successStyles.receipt}>
            <View style={successStyles.receiptRow}>
              <Text style={successStyles.receiptLabel}>Transaction ID</Text>
              <Text style={successStyles.receiptValue}>{txnId || 'N/A'}</Text>
            </View>
            <View style={successStyles.receiptRow}>
              <Text style={successStyles.receiptLabel}>New Status</Text>
              <Text style={[successStyles.receiptValue, { color: '#059669' }]}>✅ Payment Received</Text>
            </View>
            <View style={successStyles.receiptRow}>
              <Text style={successStyles.receiptLabel}>Date</Text>
              <Text style={successStyles.receiptValue}>{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</Text>
            </View>
          </View>

          {isMaintenance && (
            <View style={successStyles.statusUpdateBox}>
              <Text style={successStyles.statusUpdateText}>🏁 Maintenance Lifecycle: Completed</Text>
              <Text style={{ fontSize: 11, color: TEAL_TEXT, textAlign: 'center', marginTop: 2 }}>The vendor and admin have been notified of your payment.</Text>
            </View>
          )}

          <TouchableOpacity style={successStyles.doneBtn} onPress={onDone}>
            <Text style={successStyles.doneBtnText}>Back to Dashboard</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const successStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(26, 122, 122, 0.9)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  card: { backgroundColor: '#FFF', borderRadius: 28, padding: 30, alignItems: 'center', width: '100%', maxWidth: 360 },
  iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#22C55E', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  iconText: { color: '#FFF', fontSize: 40, fontWeight: 'bold' },
  title: { fontSize: 24, fontWeight: '900', color: '#1A2E2E', marginBottom: 8 },
  sub: { fontSize: 14, color: '#64748B', textAlign: 'center', marginBottom: 24 },
  receipt: { backgroundColor: '#F8FAFC', borderRadius: 16, width: '100%', padding: 16, marginBottom: 20 },
  receiptRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  receiptLabel: { fontSize: 12, color: '#94A3B8', fontWeight: '600' },
  receiptValue: { fontSize: 12, color: '#1A2E2E', fontWeight: '800' },
  statusUpdateBox: { backgroundColor: TEAL_SOFT, padding: 12, borderRadius: 12, width: '100%', marginBottom: 24, borderWidth: 1, borderColor: TEAL_MID },
  statusUpdateText: { fontSize: 13, color: TEAL, fontWeight: '700', textAlign: 'center' },
  doneBtn: { backgroundColor: TEAL, borderRadius: 16, paddingVertical: 16, width: '100%', alignItems: 'center' },
  doneBtnText: { color: '#FFF', fontWeight: '800', fontSize: 16 },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function PaymentScreen({ navigation, route }) {
  const bill = route.params?.bill;
  const { payBill } = useResidentStore();
  const displayAmount = bill?.total || bill?.amount || 0;

  const [method, setMethod] = useState('upi');
  const [upiApp, setUpiApp] = useState('gpay');
  const [upiId, setUpiId] = useState('');
  const [cardNum, setCardNum] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVV, setCardCVV] = useState('');
  const [selectedBank, setSelectedBank] = useState(BANKS[0]);

  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [txnId, setTxnId] = useState('');

  const selectedMethod = PAYMENT_METHODS.find(m => m.key === method);

  const formatCardNumber = (val) => {
    const v = val.replace(/\D/g, '').slice(0, 16);
    return v.match(/.{1,4}/g)?.join(' ') || v;
  };

  const formatExpiry = (val) => {
    const v = val.replace(/\D/g, '').slice(0, 4);
    if (v.length >= 3) return v.slice(0, 2) + '/' + v.slice(2);
    return v;
  };

  const handlePay = () => {
    // Basic Validation
    if (method === 'upi' && upiApp === 'other' && !upiId.includes('@')) {
      Alert.alert('Invalid UPI ID', 'Please enter a valid UPI ID.');
      return;
    }
    if (method === 'card' && (cardNum.length < 16 || cardExpiry.length < 5 || cardCVV.length < 3)) {
      Alert.alert('Incomplete Details', 'Please enter all card details correctly.');
      return;
    }

    Alert.alert(
      'Confirm Payment',
      `Pay ₹${displayAmount.toLocaleString('en-IN')} via ${selectedMethod?.label}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm & Pay',
          onPress: () => {
            setProcessing(true);
            // Simulate payment gateway latency
            setTimeout(async () => {
              // 1. Process local billing record
              const newTxn = payBill(bill.id) || genTxnId();
              setTxnId(newTxn);

              // 2. Fetch current bill state to ensure we have the maintenance request ID
              const currentBill = useResidentStore.getState().bills.find(b => b.id === bill.id) || bill;

              // 3. Sync with maintenance workflow if applicable
              if (currentBill.type === 'maintenance' && currentBill.maintenanceRequestId) {
                try {
                  const appStore = useSharedStore.getState();
                  if (appStore && appStore.residentPay) {
                    await appStore.residentPay(currentBill.maintenanceRequestId);
                  }
                } catch (e) {
                  console.error('Failed to sync maintenance payment:', e);
                }
              }

              setProcessing(false);
              setSuccess(true);
            }, 2500);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={TEAL} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Secure Payment</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20 }}>
        {/* Amount Card */}
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>PAYING TO BS GATED COMMUNITY</Text>
          <Text style={styles.amountValue}>₹{displayAmount.toLocaleString('en-IN')}</Text>
          <Text style={styles.amountSub}>Bill ID: {bill?.id || 'BILL-AUTO'}</Text>
          <View style={styles.breakdownRow}>
            <View style={styles.breakdownChip}>
              <Text style={styles.breakdownChipText}>{bill?.month || bill?.type || 'General Payment'}</Text>
            </View>
            <View style={styles.breakdownChip}>
              <Text style={styles.breakdownChipText}>Unit {bill?.unit || 'N/A'}</Text>
            </View>
          </View>
        </View>

        {/* Payment Methods */}
        <Text style={styles.sectionLabel}>SELECT PAYMENT METHOD</Text>
        <View style={styles.methodsList}>
          {PAYMENT_METHODS.map(m => (
            <TouchableOpacity
              key={m.key}
              style={[styles.methodRow, method === m.key && styles.methodRowActive]}
              onPress={() => setMethod(m.key)}
            >
              <Text style={styles.methodEmoji}>{m.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.methodLabel}>{m.label}</Text>
                <Text style={styles.methodSub}>{m.sub}</Text>
              </View>
              <View style={[styles.radio, method === m.key && styles.radioActive]}>
                {method === m.key && <View style={styles.radioDot} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Sub-sections ── */}
        <View style={{ marginTop: 10 }}>
          {method === 'upi' && (
            <View style={styles.subSection}>
              <Text style={styles.subSectionTitle}>Choose UPI App</Text>
              <View style={styles.upiGrid}>
                {UPI_APPS.map(app => (
                  <TouchableOpacity
                    key={app.id}
                    style={[styles.upiChip, upiApp === app.id && styles.upiChipActive]}
                    onPress={() => setUpiApp(app.id)}
                  >
                    <Text style={styles.upiChipEmoji}>{app.emoji}</Text>
                    <Text style={[styles.upiChipText, upiApp === app.id && { color: TEAL }]}>{app.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              {upiApp === 'other' && (
                <TextInput
                  style={styles.input}
                  placeholder="Enter UPI ID (e.g. name@upi)"
                  value={upiId}
                  onChangeText={setUpiId}
                  autoCapitalize="none"
                  placeholderTextColor="#94A3B8"
                />
              )}
            </View>
          )}

          {method === 'card' && (
            <View style={styles.subSection}>
              <Text style={styles.subSectionTitle}>Card Details</Text>
              <TextInput
                style={styles.input}
                placeholder="Card Number"
                value={cardNum}
                onChangeText={t => setCardNum(formatCardNumber(t))}
                keyboardType="numeric"
                maxLength={19}
                placeholderTextColor="#94A3B8"
              />
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                <TextInput
                  style={[styles.input, { flex: 2 }]}
                  placeholder="Expiry (MM/YY)"
                  value={cardExpiry}
                  onChangeText={t => setCardExpiry(formatExpiry(t))}
                  keyboardType="numeric"
                  maxLength={5}
                  placeholderTextColor="#94A3B8"
                />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="CVV"
                  value={cardCVV}
                  onChangeText={t => setCardCVV(t.replace(/\D/g, '').slice(0, 4))}
                  keyboardType="numeric"
                  secureTextEntry
                  maxLength={4}
                  placeholderTextColor="#94A3B8"
                />
              </View>
            </View>
          )}

          {method === 'netbanking' && (
            <View style={styles.subSection}>
              <Text style={styles.subSectionTitle}>Select Bank</Text>
              {BANKS.map(bank => (
                <TouchableOpacity
                  key={bank}
                  style={[styles.bankRow, selectedBank === bank && styles.bankRowActive]}
                  onPress={() => setSelectedBank(bank)}
                >
                  <Text style={styles.bankName}>{bank}</Text>
                  {selectedBank === bank && <Text style={{ color: TEAL, fontWeight: '800' }}>✓</Text>}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Security badges */}
        <View style={styles.securityRow}>
          {['🔒 SSL Secured', '🏦 RBI Compliant', '✅ PCI-DSS'].map(badge => (
            <View key={badge} style={styles.securityBadge}>
              <Text style={styles.securityBadgeText}>{badge}</Text>
            </View>
          ))}
        </View>

        {/* Pay Button Area */}
        <View style={styles.payActionArea}>
          <TouchableOpacity style={styles.payBtn} onPress={handlePay} activeOpacity={0.85}>
            <Text style={styles.payBtnText}>🔐 Pay ₹{displayAmount.toLocaleString('en-IN')} Securely</Text>
          </TouchableOpacity>
          <Text style={styles.footerNote}>
            Your payment is secure. We use bank-grade encryption to protect your data.
          </Text>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Overlays */}
      <ProcessingOverlay visible={processing} amount={displayAmount} />
      <SuccessModal
        visible={success}
        bill={{ ...bill, total: displayAmount }}
        txnId={txnId}
        method={selectedMethod?.label}
        onDone={() => {
          setSuccess(false);
          navigation.goBack();
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { backgroundColor: TEAL, padding: 20, paddingTop: 40 },
  backBtn: { marginBottom: 4 },
  backText: { color: 'rgba(255,255,255,0.7)', fontSize: 13 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#FFF' },
  amountCard: { backgroundColor: TEAL, borderRadius: 20, padding: 20, marginBottom: 20 },
  amountLabel: { fontSize: 10, color: 'rgba(255,255,255,0.6)', fontWeight: '800', marginBottom: 4 },
  amountValue: { fontSize: 32, fontWeight: '900', color: '#FFF' },
  amountSub: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 4, marginBottom: 12 },
  breakdownRow: { flexDirection: 'row', gap: 8 },
  breakdownChip: { backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  breakdownChipText: { fontSize: 11, color: '#FFF', fontWeight: '700' },
  sectionLabel: { fontSize: 11, fontWeight: '800', color: '#94A3B8', letterSpacing: 1, marginBottom: 10, marginTop: 10 },
  methodRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  methodRowActive: { borderColor: TEAL, borderWidth: 2, backgroundColor: TEAL_SOFT },
  methodEmoji: { fontSize: 24, marginRight: 12 },
  methodLabel: { fontSize: 14, fontWeight: '700', color: '#1A2E2E' },
  methodSub: { fontSize: 11, color: '#94A3B8', marginTop: 2 },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center' },
  radioActive: { borderColor: TEAL },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: TEAL },
  subSection: { backgroundColor: '#FFF', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: TEAL_MID },
  subSectionTitle: { fontSize: 11, fontWeight: '800', color: '#94A3B8', marginBottom: 10 },
  upiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  upiChip: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10, backgroundColor: TEAL_SOFT, borderWidth: 1, borderColor: TEAL_MID, alignItems: 'center', minWidth: 70 },
  upiChipActive: { borderColor: TEAL, backgroundColor: '#FFF' },
  upiChipEmoji: { fontSize: 18, marginBottom: 2 },
  upiChipText: { fontSize: 10, fontWeight: '700', color: TEAL_TEXT },
  input: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: TEAL_MID, borderRadius: 12, padding: 12, fontSize: 14, color: '#1A2E2E' },
  bankRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  bankRowActive: { backgroundColor: TEAL_SOFT, paddingHorizontal: 8, borderRadius: 8 },
  bankName: { fontSize: 13, color: '#1A2E2E', fontWeight: '600' },
  securityRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginVertical: 20 },
  securityBadge: { backgroundColor: '#F0FFF4', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: '#BBF7D0' },
  securityBadgeText: { fontSize: 10, fontWeight: '700', color: '#166534' },
  payActionArea: { marginTop: 10 },
  payBtn: { backgroundColor: TEAL, borderRadius: 16, paddingVertical: 18, alignItems: 'center', shadowColor: TEAL, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  payBtnText: { color: '#FFF', fontSize: 16, fontWeight: '900' },
  footerNote: { fontSize: 11, color: '#94A3B8', textAlign: 'center', marginTop: 16, lineHeight: 16 },
});