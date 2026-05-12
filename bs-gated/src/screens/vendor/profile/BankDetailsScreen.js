import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform,
  StyleSheet, SafeAreaView, StatusBar, Switch,
} from 'react-native';
import { Colors, Fonts, Radius } from '../../../vendor/theme';
import { AppHeader, Card, PrimaryButton, InputField, Divider } from '../../../vendor/components';
import { useTheme } from '../../../hooks/useTheme';

// ─── EditProfileScreen ────────────────────────────────────────────────────────

export default function BankDetailsScreen({ navigation }) {
  const theme = useTheme();
  const [upi,     setUpi]     = useState('ramesh.kumar@upi');
  const [account, setAccount] = useState('XXXX XXXX 4321');
  const [ifsc,    setIfsc]    = useState('HDFC0001234');
  const [bank,    setBank]    = useState('HDFC Bank');
  const [holder,  setHolder]  = useState('Ramesh Kumar');

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle={theme.mode === 'light' ? 'dark-content' : 'light-content'} backgroundColor={theme.header} />
      <AppHeader title="Bank & UPI Details" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        <Card style={{ marginBottom: 12 }}>
          <Text style={s.cardTitle}>UPI Details</Text>
          <InputField label="UPI ID" value={upi} onChangeText={setUpi} placeholder="yourname@upi" />
        </Card>

        <Card style={{ marginBottom: 12 }}>
          <Text style={s.cardTitle}>Bank Account</Text>
          <InputField label="Account Holder Name" value={holder}  onChangeText={setHolder}  placeholder="Full name" />
          <InputField label="Account Number"       value={account} onChangeText={setAccount} placeholder="Account number" keyboardType="numeric" />
          <InputField label="IFSC Code"            value={ifsc}    onChangeText={setIfsc}    placeholder="e.g. HDFC0001234" />
          <InputField label="Bank Name"            value={bank}    onChangeText={setBank}    placeholder="Bank name" />
        </Card>

        <View style={s.infoBanner}>
          <Text style={s.infoText}>🔒 Your bank details are encrypted and used only for payment processing.</Text>
        </View>

        <PrimaryButton title="Save Details" onPress={() => navigation.goBack()} color={Colors.teal} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: '#E8F5F5' },
  scroll:     { padding: 16, paddingBottom: 40 },
  cardTitle:  { fontSize: 14, fontWeight: '700', color: '#1A7A7A', marginBottom: 12 },
  infoBanner: { backgroundColor: '#CCFBF1', borderRadius: 12, padding: 14, marginTop: 4, borderLeftWidth: 3, borderLeftColor: '#1A7A7A' },
  infoText:   { fontSize: 12, color: '#134E4A', fontWeight: '600', lineHeight: 18 },
  purple:     { color: '#1A7A7A' },
});
