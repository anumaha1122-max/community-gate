import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView, Alert, ActivityIndicator, StatusBar,
} from 'react-native';
import useAdminStore from '../../../store/adminStore';
import { COLORS, globalStyles } from '../../../components/common/theme';
import { useTheme } from '../../../hooks/useTheme';

const TYPES = ['Maintenance', 'Water', 'Electricity', 'Sinking Fund', 'Other'];
const MONTHS = [
  'January 2025','February 2025','March 2025','April 2025','May 2025',
  'June 2025','July 2025','August 2025','September 2025','October 2025',
  'November 2025','December 2025',
];

export default function GenerateInvoiceScreen({ navigation }) {
  const theme = useTheme();
  const generateInvoices = useAdminStore((s) => s.generateInvoices);
  const residents        = useAdminStore((s) => s.residents);

  const [month,   setMonth]   = useState('April 2025');
  const [amount,  setAmount]  = useState('3500');
  const [type,    setType]    = useState('Maintenance');
  const [loading, setLoading] = useState(false);

  const activeResidents = residents.filter(r => r.active).length;

  const handleGenerate = () => {
    if (!amount || isNaN(parseInt(amount, 10))) {
      Alert.alert('Validation', 'Enter a valid amount.');
      return;
    }
    Alert.alert(
      'Confirm',
      `Generate ${type} invoices of ₹${amount} for ${activeResidents} active residents for ${month}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Generate',
          onPress: () => {
            setLoading(true);
            setTimeout(() => {
              const count = generateInvoices(month, parseInt(amount, 10), type);
              setLoading(false);
              Alert.alert('Success', `${count} invoices generated for ${month}.`, [
                { text: 'View Billing', onPress: () => navigation.navigate('BillingDashboard') },
              ]);
            }, 700);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={globalStyles.screen}>
      <StatusBar barStyle="light-content" backgroundColor="#1A7A7A" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Generate Invoice</Text>
          <Text style={styles.headerSub}>Create bulk billing for residents</Text>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.previewCard}>
          <Text style={styles.previewTitle}>Invoice Preview</Text>
          <Text style={styles.previewDetail}>📅 Month: {month}</Text>
          <Text style={styles.previewDetail}>💰 Amount: ₹{amount || '—'}</Text>
          <Text style={styles.previewDetail}>📋 Type: {type}</Text>
          <Text style={styles.previewDetail}>👥 Recipients: {activeResidents} residents</Text>
          <Text style={styles.previewTotal}>Total: ₹{(parseInt(amount, 10) || 0) * activeResidents}</Text>
        </View>

        <View style={[globalStyles.card, styles.formCard]}>
          <Text style={globalStyles.label}>Billing Month</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.monthScroll}>
            {MONTHS.map((m) => (
              <TouchableOpacity
                key={m}
                style={[styles.monthChip, month === m && styles.monthChipActive]}
                onPress={() => setMonth(m)}
              >
                <Text style={[styles.monthChipText, month === m && styles.monthChipTextActive]}>{m}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={[globalStyles.label, { marginTop: 12 }]}>Invoice Type</Text>
          <View style={styles.typeRow}>
            {TYPES.map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.typeChip, type === t && styles.typeChipActive]}
                onPress={() => setType(t)}
              >
                <Text style={[styles.typeChipText, type === t && styles.typeChipTextActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[globalStyles.label, { marginTop: 4 }]}>Amount per Unit (₹) *</Text>
          <TextInput
            style={globalStyles.input}
            placeholder="e.g. 3500"
            placeholderTextColor={COLORS.textMuted}
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
          />

          <TouchableOpacity
            style={[globalStyles.btn, globalStyles.btnSuccess, loading && { opacity: 0.7 }]}
            onPress={handleGenerate}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={globalStyles.btnText}>🧾 Generate Invoices for All Residents</Text>
            }
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header:      { backgroundColor: '#1A7A7A', paddingTop: 40, paddingBottom: 16, paddingHorizontal: 20 },
  backText:    { color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: '600', marginBottom: 8 },
  headerTitle: { fontSize: 22, fontWeight: '900', color: '#FFF' },
  headerSub:   { fontSize: 12, color: 'rgba(255,255,255,0.72)', marginTop: 1 },
  scroll: { padding: 16 },
  previewCard: { backgroundColor: COLORS.primary, borderRadius: 16, padding: 20, marginBottom: 16 },
  previewTitle: { fontSize: 16, fontWeight: '800', color: '#FFFFFF', marginBottom: 12 },
  previewDetail: { fontSize: 14, color: '#D0EEEE', marginBottom: 4 },
  previewTotal: { fontSize: 22, fontWeight: '800', color: '#FFFFFF', marginTop: 12 },
  formCard: { padding: 20 },
  monthScroll: { marginBottom: 12 },
  monthChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.border, marginRight: 8 },
  monthChipActive: { backgroundColor: COLORS.primary },
  monthChipText: { fontSize: 12, fontWeight: '600', color: COLORS.textLight },
  monthChipTextActive: { color: '#FFFFFF' },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  typeChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, backgroundColor: COLORS.border },
  typeChipActive: { backgroundColor: COLORS.accent },
  typeChipText: { fontSize: 12, fontWeight: '600', color: COLORS.textLight },
  typeChipTextActive: { color: '#FFFFFF' },
});
