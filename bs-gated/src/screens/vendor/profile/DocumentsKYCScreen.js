import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform,
  StyleSheet, SafeAreaView, StatusBar, Switch,
} from 'react-native';
import { Colors, Fonts, Radius } from '../../../vendor/theme';
import { AppHeader, Card, PrimaryButton, InputField, Divider } from '../../../vendor/components';
import { useTheme } from '../../../hooks/useTheme';

// ─── EditProfileScreen ────────────────────────────────────────────────────────

export default function DocumentsKYCScreen({ navigation }) {
  const theme = useTheme();
  const DOCS = [
    { label: 'Aadhar Card',        status: 'Verified',  icon: '🪪' },
    { label: 'PAN Card',           status: 'Verified',  icon: '📄' },
    { label: 'Trade Certificate',  status: 'Pending',   icon: '📋' },
    { label: 'GST Certificate',    status: 'Not Added', icon: '🏛️' },
    { label: 'Police Clearance',   status: 'Not Added', icon: '👮' },
  ];

  const statusColor = { Verified: Colors.green, Pending: Colors.amber, 'Not Added': Colors.text3 };
  const statusBg    = { Verified: Colors.greenLight, Pending: Colors.amberLight, 'Not Added': Colors.bg };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle={theme.mode === 'light' ? 'dark-content' : 'light-content'} backgroundColor={theme.header} />
      <AppHeader title="Documents & KYC" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        <Card style={{ marginBottom: 12, paddingVertical: 4 }}>
          {DOCS.map((doc, i) => (
            <View key={doc.label}>
              <TouchableOpacity style={s.docRow} activeOpacity={0.75}>
                <View style={[s.docIconBox, { backgroundColor: statusBg[doc.status] }]}>
                  <Text style={{ fontSize: 20 }}>{doc.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.docLabel}>{doc.label}</Text>
                  <Text style={[s.docStatus, { color: statusColor[doc.status] }]}>{doc.status}</Text>
                </View>
                <Text style={{ fontSize: 18, color: Colors.text3 }}>›</Text>
              </TouchableOpacity>
              {i < DOCS.length - 1 && <Divider />}
            </View>
          ))}
        </Card>

        <View style={s.infoBanner}>
          <Text style={s.infoText}>📌 Upload clear, readable documents. Verified docs improve customer trust.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: '#E8F5F5' },
  scroll:     { padding: 16, paddingBottom: 40 },
  docRow:     { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#D0EEEE', gap: 14 },
  docIconBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  docLabel:   { fontSize: 14, fontWeight: '700', color: '#1A2E2E', flex: 1 },
  docStatus:  { fontSize: 12, fontWeight: '600' },
  infoBanner: { backgroundColor: '#CCFBF1', borderRadius: 12, padding: 14, marginBottom: 12, borderLeftWidth: 3, borderLeftColor: '#1A7A7A' },
  bg:         { backgroundColor: '#E8F5F5' },
  text3:      { color: '#7A9E9E' },
});
