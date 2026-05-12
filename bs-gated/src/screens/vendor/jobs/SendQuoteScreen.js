import React, { useState } from 'react';
import {
  View, Text, ScrollView, TextInput, KeyboardAvoidingView, Platform,
  StyleSheet, SafeAreaView, StatusBar, Alert,
} from 'react-native';
import { Colors, Fonts, Radius } from '../../../vendor/theme';
import { AppHeader, Card, PrimaryButton } from '../../../vendor/components';
import useSharedStore from '../../../store/appStore';
import { useTheme } from '../../../hooks/useTheme';

export default function SendQuoteScreen({ navigation, route }) {
  const theme = useTheme();
  const { requestId } = route?.params || {};
  const requests = useSharedStore(s => s.maintenanceRequests);
  const submitQuote = useSharedStore(s => s.submitQuote);

  const request = requests.find(r => r.id === requestId) || { id: requestId, category: 'Service', residentName: '' };

  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [estDays, setEstDays] = useState('');

  const handleSubmit = () => {
    if (!amount || !description || !estDays) {
      Alert.alert('Missing Fields', 'Please fill in all fields before submitting.');
      return;
    }
    submitQuote(request.id, {
      amount: parseFloat(amount),
      description,
      estimatedDays: parseInt(estDays, 10),
    });
    Alert.alert('Quote Submitted', 'Admin will review and forward to the resident.', [
      { text: 'OK', onPress: () => navigation.navigate('RequestList') },
    ]);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.mode === 'light' ? 'dark-content' : 'light-content'} backgroundColor={theme.header} />
      <AppHeader title="Send Quote" onBack={() => navigation.goBack()} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >

          {/* Info banner */}
          <View style={styles.infoBanner}>
            <Text style={styles.infoBannerText}>
              {request.id}  ·  {request.category}  ·  {request.residentName}
            </Text>
          </View>

          {/* Issue title read-only */}
          <Card>
            <Text style={styles.label}>Issue</Text>
            <Text style={styles.issueText}>{request.title || request.description || '—'}</Text>
          </Card>

          {/* Amount */}
          <Card>
            <Text style={styles.label}>Quote Amount (₹) *</Text>
            <View style={styles.amountRow}>
              <View style={styles.currencyBox}><Text style={styles.currency}>₹</Text></View>
              <TextInput
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                style={styles.amountInput}
                placeholderTextColor={Colors.text3}
                placeholder="0"
              />
            </View>
          </Card>

          {/* Work Description */}
          <Card>
            <Text style={styles.label}>Work Description *</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              style={styles.textarea}
              placeholderTextColor={Colors.text3}
              placeholder="Describe the work you will do..."
              textAlignVertical="top"
            />
          </Card>

          {/* Estimated Days */}
          <Card>
            <Text style={styles.label}>Estimated Days to Complete *</Text>
            <TextInput
              value={estDays}
              onChangeText={setEstDays}
              keyboardType="numeric"
              style={styles.input}
              placeholderTextColor={Colors.text3}
              placeholder="e.g. 3"
            />
          </Card>

          {/* Summary */}
          {amount ? (
            <Card style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Quote Summary</Text>
              {[
                ['Category', request.category || '—'],
                ['Amount', amount ? ('₹' + amount) : '—'],
                ['Est. Days', estDays ? (estDays + ' days') : '—'],
              ].map(([k, v], i) => (
                <View key={i} style={[styles.summaryRow, i < 2 && styles.summaryBorder]}>
                  <Text style={styles.summaryKey}>{k}</Text>
                  <Text style={styles.summaryVal}>{v}</Text>
                </View>
              ))}
            </Card>
          ) : null}

        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <PrimaryButton title="Submit Quote to Admin" onPress={handleSubmit} color={Colors.purple} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: { padding: 16, paddingBottom: 100 },

  infoBanner: { backgroundColor: Colors.tealLight, borderRadius: Radius.md, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: Colors.teal + '40' },
  infoBannerText: { fontSize: 12, color: Colors.purple, fontWeight: Fonts.semiBold },

  label: { fontSize: 12, fontWeight: Fonts.semiBold, color: Colors.text2, marginBottom: 8 },
  issueText: { fontSize: 14, color: Colors.text, lineHeight: 20 },

  amountRow: { flexDirection: 'row', alignItems: 'center' },
  currencyBox: { paddingHorizontal: 14, paddingVertical: 12, backgroundColor: Colors.bg, borderWidth: 1.5, borderColor: Colors.border, borderRightWidth: 0, borderTopLeftRadius: Radius.md, borderBottomLeftRadius: Radius.md },
  currency: { fontSize: 16, fontWeight: Fonts.bold, color: Colors.purple },
  amountInput: { flex: 1, borderWidth: 1.5, borderColor: Colors.border, borderTopRightRadius: Radius.md, borderBottomRightRadius: Radius.md, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, fontWeight: Fonts.bold, color: Colors.text },

  input: { borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.md, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: Colors.text },
  textarea: { borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.md, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: Colors.text, minHeight: 90 },

  summaryCard: { backgroundColor: Colors.tealLight, borderColor: Colors.teal + '30' },
  summaryTitle: { fontSize: 14, fontWeight: Fonts.bold, color: Colors.purple, marginBottom: 10 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  summaryBorder: { borderBottomWidth: 1, borderBottomColor: Colors.purple + '20' },
  summaryKey: { fontSize: 13, color: Colors.text2 },
  summaryVal: { fontSize: 13, fontWeight: Fonts.bold, color: Colors.text },

  footer: { padding: 16, backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.border },
});
