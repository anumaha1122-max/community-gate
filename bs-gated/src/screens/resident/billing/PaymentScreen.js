import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar,
  ScrollView, TextInput, Alert, ActivityIndicator, Animated, Modal,
} from 'react-native';
import { useAuthStore } from '../../../store/AuthStore';
import useResidentStore from '../../../store/residentStore';
import { COLORS } from '../../../components/common/theme';
import { useTheme } from '../../../hooks/useTheme';

// ─── Constants ────────────────────────────────────────────────────────────────

const TEAL      = '#1A7A7A';
const TEAL_DARK = '#155F5F';
const TEAL_SOFT = '#E8F5F5';
const TEAL_MID  = '#D0EEEE';
const TEAL_TEXT = '#3D6E6E';

const UPI_APPS = [
  { id: 'gpay',    label: 'Google Pay',  emoji: '🔵', color: '#1A73E8' },
  { id: 'phonepe', label: 'PhonePe',     emoji: '🟣', color: '#5F259F' },
  { id: 'paytm',   label: 'Paytm',       emoji: '🔷', color: '#00BAF2' },
  { id: 'bhim',    label: 'BHIM UPI',    emoji: '🟠', color: '#F37021' },
  { id: 'other',   label: 'Other UPI',   emoji: '📲', color: '#37474F' },
];

const PAYMENT_METHODS = [
  { key: 'upi',        label: 'UPI',               emoji: '📲', sub: 'Google Pay, PhonePe, Paytm, BHIM' },
  { key: 'netbanking', label: 'Net Banking',        emoji: '🏦', sub: 'SBI, HDFC, ICICI, Axis & more' },
  { key: 'card',       label: 'Debit / Credit Card', emoji: '💳', sub: 'Visa, Mastercard, RuPay' },
  { key: 'wallet',     label: 'Wallet / Cash',       emoji: '👝', sub: 'Amazon Pay, Freecharge, etc.' },
];

const BANKS = ['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak Bank', 'Punjab National Bank', 'Bank of Baroda'];

function genTxnId() {
  return 'TXN' + Date.now() + Math.random().toString(36).slice(2, 6).toUpperCase();
}

// ─── Processing Overlay ───────────────────────────────────────────────────────

function ProcessingOverlay({ visible, amount }) {
  const spin  = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (visible) {
      Animated.loop(
        Animated.timing(spin, { toValue: 1, duration: 1000, useNativeDriver: true })
      ).start();
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
    } else {
      spin.setValue(0);
      scale.setValue(0.8);
    }
  }, [visible]);

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  if (!visible) return null;
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={procStyles.overlay}>
        <Animated.View style={[procStyles.card, { transform: [{ scale }] }]}>
          <Animated.Text style={[{ fontSize: 40 }, { transform: [{ rotate }] }]}>⚙️</Animated.Text>
          <Text style={procStyles.title}>Processing Payment</Text>
          <Text style={procStyles.amount}>₹{amount?.toLocaleString('en-IN')}</Text>
          <Text style={procStyles.sub}>Please do not press back or close the app</Text>
          <View style={procStyles.stepRow}>
            {['Initiating', 'Verifying', 'Confirming'].map((step, i) => (
              <View key={step} style={procStyles.step}>
                <ActivityIndicator size="small" color={TEAL} />
                <Text style={procStyles.stepText}>{step}</Text>
              </View>
            ))}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const procStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 32, alignItems: 'center', width: '80%', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 16, elevation: 10 },
  title: { fontSize: 18, fontWeight: '800', color: '#1A2E2E', marginTop: 16, marginBottom: 6 },
  amount: { fontSize: 28, fontWeight: '900', color: TEAL, marginBottom: 8 },
  sub: { fontSize: 12, color: '#94A3B8', textAlign: 'center', lineHeight: 18, marginBottom: 20 },
  stepRow: { flexDirection: 'row', gap: 16 },
  step: { alignItems: 'center', gap: 4 },
  stepText: { fontSize: 10, color: '#64748B', fontWeight: '600' },
});

// ─── Success Screen ───────────────────────────────────────────────────────────

function SuccessModal({ visible, bill, txnId, method, onDone }) {
  const scale = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(scale, { toValue: 1, tension: 60, friction: 6, useNativeDriver: true }).start();
    } else {
      scale.setValue(0.5);
    }
  }, [visible]);

  if (!visible) return null;
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={successStyles.overlay}>
        <Animated.View style={[successStyles.card, { transform: [{ scale }] }]}>
          {/* Success icon */}
          <View style={successStyles.iconCircle}>
            <Text style={{ fontSize: 48 }}>✅</Text>
          </View>
          <Text style={successStyles.title}>Payment Successful!</Text>
          <Text style={successStyles.sub}>Your dues have been cleared. Thank you!</Text>

          {/* Receipt preview */}
          <View style={successStyles.receipt}>
            <View style={successStyles.receiptRow}>
              <Text style={successStyles.receiptLabel}>Amount Paid</Text>
              <Text style={successStyles.receiptValue}>₹{bill?.total?.toLocaleString('en-IN')}</Text>
            </View>
            <View style={successStyles.receiptRow}>
              <Text style={successStyles.receiptLabel}>Invoice</Text>
              <Text style={successStyles.receiptValue}>{bill?.id}</Text>
            </View>
            <View style={successStyles.receiptRow}>
              <Text style={successStyles.receiptLabel}>Period</Text>
              <Text style={successStyles.receiptValue}>{bill?.month}</Text>
            </View>
            <View style={successStyles.receiptRow}>
              <Text style={successStyles.receiptLabel}>Payment Mode</Text>
              <Text style={successStyles.receiptValue}>{method}</Text>
            </View>
            <View style={[successStyles.receiptRow, { borderBottomWidth: 0 }]}>
              <Text style={successStyles.receiptLabel}>Transaction ID</Text>
              <Text style={[successStyles.receiptValue, { fontFamily: 'monospace', fontSize: 11 }]}>{txnId}</Text>
            </View>
          </View>

          <Text style={successStyles.note}>A receipt has been sent to your registered email.</Text>

          <TouchableOpacity style={successStyles.doneBtn} onPress={onDone}>
            <Text style={successStyles.doneBtnText}>Back to Bills →</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const successStyles = StyleSheet.create({
  overlay:      { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  card:         { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 28, width: '100%', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 12 },
  iconCircle:   { width: 80, height: 80, borderRadius: 40, backgroundColor: '#E8F5E9', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  title:        { fontSize: 22, fontWeight: '900', color: '#1A2E2E', marginBottom: 6 },
  sub:          { fontSize: 14, color: '#7A9E9E', marginBottom: 20, textAlign: 'center' },
  receipt:      { width: '100%', backgroundColor: TEAL_SOFT, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: TEAL_MID, marginBottom: 14 },
  receiptRow:   { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: TEAL_MID },
  receiptLabel: { fontSize: 12, color: TEAL_TEXT, fontWeight: '600' },
  receiptValue: { fontSize: 12, color: '#1A2E2E', fontWeight: '800', maxWidth: '55%', textAlign: 'right' },
  note:         { fontSize: 11, color: '#94A3B8', textAlign: 'center', marginBottom: 20 },
  doneBtn:      { backgroundColor: TEAL, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 40, width: '100%', alignItems: 'center' },
  doneBtnText:  { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function PaymentScreen({ navigation, route }) {
  const theme   = useTheme();
  const { bill } = route.params || {};
  const payBill = useResidentStore(s => s.payBill);

  const [method,     setMethod]     = useState('upi');
  const [upiApp,     setUpiApp]     = useState('gpay');
  const [upiId,      setUpiId]      = useState('');
  const [selectedBank, setSelectedBank] = useState('State Bank of India');
  const [cardNum,    setCardNum]    = useState('');
  const [cardName,   setCardName]   = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVV,    setCardCVV]    = useState('');
  const [processing, setProcessing] = useState(false);
  const [success,    setSuccess]    = useState(false);
  const [txnId,      setTxnId]      = useState('');

  if (!bill) return null;

  const selectedMethod = PAYMENT_METHODS.find(m => m.key === method);

  const handlePay = () => {
    // Basic validation
    if (method === 'upi' && upiApp === 'other' && !upiId.trim()) {
      Alert.alert('Enter UPI ID', 'Please enter your UPI ID to proceed.'); return;
    }
    if (method === 'card') {
      if (cardNum.replace(/\s/g, '').length < 16) { Alert.alert('Invalid Card', 'Please enter a valid 16-digit card number.'); return; }
      if (!cardName.trim())  { Alert.alert('Missing Info', 'Please enter cardholder name.'); return; }
      if (cardExpiry.length < 5) { Alert.alert('Invalid Expiry', 'Please enter expiry as MM/YY.'); return; }
      if (cardCVV.length < 3)    { Alert.alert('Invalid CVV', 'Please enter a valid CVV.'); return; }
    }

    Alert.alert(
      'Confirm Payment',
      `Pay ₹${bill.total.toLocaleString('en-IN')} via ${selectedMethod?.label}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm & Pay',
          style: 'default',
          onPress: () => {
            setProcessing(true);
            // Simulate payment gateway latency
            setTimeout(() => {
              const newTxn = payBill(bill.id) || genTxnId();
              setTxnId(newTxn);
              setProcessing(false);
              setSuccess(true);
            }, 2500);
          },
        },
      ]
    );
  };

  const formatCardNumber = (text) => {
    const digits = text.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(.{4})/g, '$1 ').trim();
  };
  const formatExpiry = (text) => {
    const digits = text.replace(/\D/g, '').slice(0, 4);
    if (digits.length > 2) return digits.slice(0, 2) + '/' + digits.slice(2);
    return digits;
  };

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={TEAL_DARK} />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Make Payment</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* ── Amount Card ── */}
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>Total Amount Due</Text>
          <Text style={styles.amountValue}>₹{bill.total.toLocaleString('en-IN')}</Text>
          <Text style={styles.amountSub}>{bill.month}  ·  Unit {bill.unit}  ·  {bill.id}</Text>

          {/* Charge mini-breakdown */}
          <View style={styles.breakdownRow}>
            {(bill.items || []).slice(0, 3).map((item, i) => (
              <View key={i} style={styles.breakdownChip}>
                <Text style={styles.breakdownChipText}>{item.label}: ₹{item.amount.toLocaleString('en-IN')}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Payment Method Selection ── */}
        <Text style={styles.sectionLabel}>SELECT PAYMENT METHOD</Text>
        {PAYMENT_METHODS.map(m => (
          <TouchableOpacity
            key={m.key}
            style={[styles.methodRow, method === m.key && styles.methodRowActive]}
            onPress={() => setMethod(m.key)}
          >
            <Text style={styles.methodEmoji}>{m.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.methodLabel, method === m.key && { color: TEAL }]}>{m.label}</Text>
              <Text style={styles.methodSub}>{m.sub}</Text>
            </View>
            <View style={[styles.radio, method === m.key && styles.radioActive]}>
              {method === m.key && <View style={styles.radioDot} />}
            </View>
          </TouchableOpacity>
        ))}

        {/* ── UPI Sub-options ── */}
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
                keyboardType="email-address"
                placeholderTextColor="#94A3B8"
              />
            )}
            <View style={styles.infoStrip}>
              <Text style={styles.infoStripText}>
                🔒 You will be redirected to {UPI_APPS.find(a => a.id === upiApp)?.label} to complete payment securely.
              </Text>
            </View>
          </View>
        )}

        {/* ── Net Banking Sub-options ── */}
        {method === 'netbanking' && (
          <View style={styles.subSection}>
            <Text style={styles.subSectionTitle}>Select Your Bank</Text>
            {BANKS.map(bank => (
              <TouchableOpacity
                key={bank}
                style={[styles.bankRow, selectedBank === bank && styles.bankRowActive]}
                onPress={() => setSelectedBank(bank)}
              >
                <Text style={styles.bankIcon}>🏦</Text>
                <Text style={[styles.bankName, selectedBank === bank && { color: TEAL, fontWeight: '800' }]}>{bank}</Text>
                {selectedBank === bank && <Text style={{ color: TEAL }}>✓</Text>}
              </TouchableOpacity>
            ))}
            <View style={styles.infoStrip}>
              <Text style={styles.infoStripText}>🔒 You'll be redirected to your bank's secure login page.</Text>
            </View>
          </View>
        )}

        {/* ── Card Sub-options ── */}
        {method === 'card' && (
          <View style={styles.subSection}>
            <Text style={styles.subSectionTitle}>Card Details</Text>
            <Text style={styles.fieldLabel}>Card Number</Text>
            <TextInput
              style={styles.input}
              placeholder="1234 5678 9012 3456"
              value={cardNum}
              onChangeText={t => setCardNum(formatCardNumber(t))}
              keyboardType="numeric"
              maxLength={19}
              placeholderTextColor="#94A3B8"
            />
            <Text style={styles.fieldLabel}>Cardholder Name</Text>
            <TextInput
              style={styles.input}
              placeholder="As printed on card"
              value={cardName}
              onChangeText={setCardName}
              autoCapitalize="words"
              placeholderTextColor="#94A3B8"
            />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>Expiry (MM/YY)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="MM/YY"
                  value={cardExpiry}
                  onChangeText={t => setCardExpiry(formatExpiry(t))}
                  keyboardType="numeric"
                  maxLength={5}
                  placeholderTextColor="#94A3B8"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>CVV</Text>
                <TextInput
                  style={styles.input}
                  placeholder="•••"
                  value={cardCVV}
                  onChangeText={t => setCardCVV(t.replace(/\D/g, '').slice(0, 4))}
                  keyboardType="numeric"
                  secureTextEntry
                  maxLength={4}
                  placeholderTextColor="#94A3B8"
                />
              </View>
            </View>
            <View style={styles.infoStrip}>
              <Text style={styles.infoStripText}>🔒 256-bit SSL encrypted. Your card details are never stored.</Text>
            </View>
          </View>
        )}

        {/* ── Wallet info ── */}
        {method === 'wallet' && (
          <View style={styles.subSection}>
            <View style={styles.infoStrip}>
              <Text style={styles.infoStripText}>
                💡 Select this if you are paying via cash to society office or any registered wallet. A manual receipt will be issued by the admin.
              </Text>
            </View>
          </View>
        )}

        {/* ── Security badges ── */}
        <View style={styles.securityRow}>
          {['🔒 SSL Secured', '🏦 RBI Compliant', '✅ PCI-DSS'].map(badge => (
            <View key={badge} style={styles.securityBadge}>
              <Text style={styles.securityBadgeText}>{badge}</Text>
            </View>
          ))}
        </View>

        {/* ── Pay Button ── */}
        <TouchableOpacity style={styles.payBtn} onPress={handlePay} activeOpacity={0.85}>
          <Text style={styles.payBtnText}>🔐 Pay ₹{bill.total.toLocaleString('en-IN')} Securely</Text>
        </TouchableOpacity>

        <Text style={styles.footerNote}>
          By paying, you agree to our payment terms. Refunds, if applicable, will be processed within 5–7 working days.
        </Text>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Processing overlay */}
      <ProcessingOverlay visible={processing} amount={bill.total} />

      {/* Success modal */}
      <SuccessModal
        visible={success}
        bill={bill}
        txnId={txnId}
        method={selectedMethod?.label}
        onDone={() => {
          setSuccess(false);
          navigation.navigate('ResidentBilling');
        }}
      />
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
  backBtn:     { marginBottom: 8 },
  backText:    { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },

  // Amount card
  amountCard: {
    backgroundColor: TEAL,
    borderRadius: 20,
    padding: 22,
    marginBottom: 20,
    shadowColor: TEAL_DARK,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  amountLabel:  { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.65)', marginBottom: 4 },
  amountValue:  { fontSize: 38, fontWeight: '900', color: '#FFFFFF' },
  amountSub:    { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 4, marginBottom: 12 },
  breakdownRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  breakdownChip:{ backgroundColor: 'rgba(255,255,255,0.18)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  breakdownChipText: { fontSize: 11, color: '#FFFFFF', fontWeight: '700' },

  // Section label
  sectionLabel: { fontSize: 11, fontWeight: '800', color: '#94A3B8', letterSpacing: 0.8, marginBottom: 10 },

  // Payment method row
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: TEAL_MID,
  },
  methodRowActive:  { borderColor: TEAL, backgroundColor: TEAL_SOFT, borderWidth: 2 },
  methodEmoji:      { fontSize: 24, marginRight: 12 },
  methodLabel:      { fontSize: 14, fontWeight: '700', color: '#1A2E2E' },
  methodSub:        { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  radio:            { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: TEAL_MID, alignItems: 'center', justifyContent: 'center' },
  radioActive:      { borderColor: TEAL },
  radioDot:         { width: 11, height: 11, borderRadius: 6, backgroundColor: TEAL },

  // Sub-section
  subSection: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: TEAL_MID },
  subSectionTitle: { fontSize: 12, fontWeight: '800', color: '#94A3B8', letterSpacing: 0.5, marginBottom: 10 },

  // UPI grid
  upiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  upiChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, backgroundColor: TEAL_SOFT, borderWidth: 1, borderColor: TEAL_MID, alignItems: 'center', minWidth: 80 },
  upiChipActive: { borderColor: TEAL, borderWidth: 2, backgroundColor: '#E0F7F7' },
  upiChipEmoji: { fontSize: 20, marginBottom: 3 },
  upiChipText: { fontSize: 11, fontWeight: '700', color: TEAL_TEXT },

  // Bank row
  bankRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F0FAFA', gap: 10 },
  bankRowActive: { backgroundColor: TEAL_SOFT, borderRadius: 10, paddingHorizontal: 8 },
  bankIcon: { fontSize: 18 },
  bankName: { flex: 1, fontSize: 14, color: '#1A2E2E', fontWeight: '600' },

  // Field label & input
  fieldLabel: { fontSize: 12, fontWeight: '700', color: TEAL_TEXT, marginBottom: 5, marginTop: 6 },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: TEAL_MID,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1A2E2E',
    marginBottom: 2,
  },

  // Info strip
  infoStrip: { backgroundColor: TEAL_SOFT, borderRadius: 10, padding: 10, borderWidth: 1, borderColor: TEAL_MID, marginTop: 8 },
  infoStripText: { fontSize: 12, color: TEAL_TEXT, lineHeight: 18 },

  // Security badges
  securityRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginVertical: 16 },
  securityBadge: { backgroundColor: '#F0FFF4', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: '#A7F3D0' },
  securityBadgeText: { fontSize: 11, fontWeight: '700', color: '#065F46' },

  // Pay button
  payBtn: {
    backgroundColor: TEAL,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: TEAL_DARK,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
    marginBottom: 12,
  },
  payBtnText: { color: '#FFFFFF', fontSize: 17, fontWeight: '900' },

  footerNote: { fontSize: 11, color: '#94A3B8', textAlign: 'center', lineHeight: 17 },
});