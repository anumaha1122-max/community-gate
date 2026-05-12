/**
 * TermsPrivacyScreen.js
 *
 * Terms of Service & Privacy Policy viewer with tab switching.
 * Theme: Identical to VisitorListScreen.
 */

import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, ScrollView,
} from 'react-native';

const V = {
  header: '#1A7A7A', headerDark: '#0D6E6E',
  bg: '#E8F5F5', surface: '#FFFFFF',
  border: '#D0EEEE', divider: '#E8F5F5',
  text: '#1A2E2E', textSub: '#3D6E6E', textMuted: '#7A9E9E',
  primary: '#1A7A7A', chip: '#E8F5F5',
};

const TERMS = [
  { title: '1. Acceptance of Terms', body: 'By using the BS Gated Community app ("App"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the App.' },
  { title: '2. User Responsibilities', body: 'You are responsible for maintaining the security of your account credentials. You must not share your OTP, password, or access with unauthorized persons. You are responsible for all activities that occur under your account.' },
  { title: '3. Visitor Management', body: 'Resident-generated visitor passes are your responsibility. Ensure passes are shared only with genuine visitors. The society reserves the right to revoke access for misuse of the visitor management system.' },
  { title: '4. SOS & Emergency Features', body: 'The SOS feature is for genuine emergencies only. False alarms are subject to disciplinary action as per society bye-laws. The platform is not a substitute for calling emergency services (100/101/108).' },
  { title: '5. Payments & Billing', body: 'Maintenance dues are payable by the due date each month. Late payment attracts interest as per society rules. All payments are final. Refund requests must be submitted within 7 days to the management office.' },
  { title: '6. Marketplace Usage', body: 'The P2P Marketplace connects residents for buying and selling second-hand items. The society/platform is not responsible for the quality, authenticity, or safety of items listed. Transactions are at users\' own risk.' },
  { title: '7. GPS Tracking', body: 'GPS tracking of maids/family members requires explicit consent from the tracked individual. You must obtain consent before enabling tracking. The platform provides consent workflows for this purpose.' },
  { title: '8. Data Retention', body: 'Visit logs are retained for 90 days. Billing records for 7 years. GPS location data is not stored beyond the active session unless explicitly enabled. You may request data deletion by contacting the management office.' },
  { title: '9. Account Termination', body: 'The society reserves the right to suspend or terminate accounts that violate these terms, misuse platform features, or engage in behaviour contrary to society bye-laws.' },
  { title: '10. Governing Law', body: 'These terms are governed by the laws of India. Disputes shall be resolved in the courts of Hyderabad, Telangana.' },
];

const PRIVACY = [
  { title: '1. Information We Collect', body: 'We collect: name, phone number, email address, unit number, family member details, vehicle registration numbers, pet information, visitor records, payment information, GPS location (only when explicitly enabled), and device information.' },
  { title: '2. How We Use Your Information', body: 'Your information is used to: manage society operations, process payments, verify visitor identity, send maintenance updates, enable amenity bookings, provide security alerts, and improve the App experience.' },
  { title: '3. Data Sharing', body: 'We do not sell your personal data. We share data with: society management (for operations), payment gateways (for billing), and security personnel (for gate management). We never share data with third-party advertisers.' },
  { title: '4. GPS & Location Data', body: 'Location data is collected ONLY when you explicitly enable GPS tracking. It is used solely for the tracking features you activate. Live location is not stored on servers — it exists only during active sessions.' },
  { title: '5. Payment Security', body: 'All payment transactions are processed through PCI-DSS compliant gateways (Razorpay). We do not store card numbers, CVVs, or full UPI IDs. Only transaction IDs and status are retained for reconciliation.' },
  { title: '6. Your Rights', body: 'You have the right to: access your personal data, correct inaccurate data, request data deletion (subject to legal obligations), opt out of non-essential communications, and export your data in CSV format.' },
  { title: '7. Data Security', body: 'We use AES-256 encryption for data at rest, TLS 1.3 for data in transit, role-based access controls, and regular security audits. Despite these measures, no system is 100% secure.' },
  { title: '8. Cookies & Analytics', body: 'The App uses anonymous analytics to improve performance. No personally identifiable information is included in analytics. You may opt out in notification settings.' },
  { title: '9. Contact Us', body: 'For privacy concerns, data requests, or to report a breach: Email: privacy@goldenrich.in | Phone: +91 99999 00000 | Office: Management Office, Ground Floor.' },
];

export default function TermsPrivacyScreen({ navigation }) {
  const [tab, setTab] = useState('terms');
  const data = tab === 'terms' ? TERMS : PRIVACY;

  return (
    <SafeAreaView style={s.screen}>
      <StatusBar barStyle="light-content" backgroundColor={V.headerDark} />
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()} style={s.backBtn}>
          <Text style={s.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={s.headerRow}>
          <Text style={s.headerTitle}>{tab === 'terms' ? 'Terms of Service' : 'Privacy Policy'}</Text>
        </View>
        {/* Tab chips inside header */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tabRow}>
          {[{ k: 'terms', label: '📋 Terms of Service' }, { k: 'privacy', label: '🔒 Privacy Policy' }].map(t => (
            <TouchableOpacity key={t.k} style={[s.tabChip, tab === t.k && s.tabChipActive]} onPress={() => setTab(t.k)}>
              <Text style={[s.tabText, tab === t.k && s.tabTextActive]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={s.body} showsVerticalScrollIndicator={false}>
        <View style={s.lastUpdated}>
          <Text style={s.lastUpdatedText}>Last updated: 1 April 2025 · Version 2.1</Text>
        </View>
        {data.map((section, i) => (
          <View key={i} style={s.section}>
            <Text style={s.sTitle}>{section.title}</Text>
            <Text style={s.sBody}>{section.body}</Text>
          </View>
        ))}
        <View style={s.footer}>
          <Text style={s.footerText}>© 2025 Golden Rich White Label Platform. All rights reserved.</Text>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: V.bg },
  header: { backgroundColor: V.header, paddingTop: 40, paddingHorizontal: 20, paddingBottom: 16 },
  backBtn: { marginBottom: 10 },
  backText: { color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: '600', marginBottom: 8 },
  headerRow: { marginBottom: 12 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#FFF' },
  tabRow: { flexDirection: 'row', gap: 8, paddingBottom: 2 },
  tabChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' },
  tabChipActive: { backgroundColor: '#FFF' },
  tabText: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.85)' },
  tabTextActive: { color: V.primary },
  body: { padding: 16 },
  lastUpdated: { backgroundColor: V.chip, borderRadius: 10, padding: 10, marginBottom: 16, borderWidth: 1, borderColor: V.border },
  lastUpdatedText: { fontSize: 12, color: V.textMuted, textAlign: 'center', fontWeight: '600' },
  section: { backgroundColor: V.surface, borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: V.border },
  sTitle: { fontSize: 14, fontWeight: '800', color: V.primary, marginBottom: 8 },
  sBody: { fontSize: 13, color: V.text, lineHeight: 21 },
  footer: { backgroundColor: V.chip, borderRadius: 10, padding: 14, borderWidth: 1, borderColor: V.border, alignItems: 'center', marginTop: 6 },
  footerText: { fontSize: 12, color: V.textMuted, textAlign: 'center' },
});
