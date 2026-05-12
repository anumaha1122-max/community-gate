import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform,
  StyleSheet, SafeAreaView, StatusBar, Switch,
} from 'react-native';
import { Colors, Fonts, Radius } from '../../../vendor/theme';
import { AppHeader, Card, PrimaryButton, InputField, Divider } from '../../../vendor/components';
import { useTheme } from '../../../hooks/useTheme';

// ─── EditProfileScreen ────────────────────────────────────────────────────────

export default function HelpSupportScreen({ navigation }) {
  const theme = useTheme();
  const FAQS = [
    { q: 'How do I send a quote to a customer?', a: 'Go to Requests → tap any request → tap "Send Quote". Fill in your amount and details.' },
    { q: 'How do I get paid?',                   a: 'Once the customer approves your work, payment is credited to your registered UPI/bank within 24 hours.' },
    { q: 'What if a customer rejects my quote?', a: 'You can revise and re-send the quote from the Request Details screen.' },
    { q: 'How do I update my service area?',     a: 'Go to Profile → Edit Profile → update your city and service radius.' },
  ];
  const [expanded, setExpanded] = useState(null);

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle={theme.mode === 'light' ? 'dark-content' : 'light-content'} backgroundColor={theme.header} />
      <AppHeader title="Help & Support" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        <View style={s.contactRow}>
          {[
            { icon: '📞', label: 'Call Support', sub: '1800-123-4567' },
            { icon: '💬', label: 'Live Chat',    sub: 'Avg. 2 min reply' },
          ].map((c, i) => (
            <TouchableOpacity key={i} style={s.contactCard} activeOpacity={0.8}>
              <Text style={{ fontSize: 28, marginBottom: 6 }}>{c.icon}</Text>
              <Text style={s.contactLabel}>{c.label}</Text>
              <Text style={s.contactSub}>{c.sub}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[s.cardTitle, { marginBottom: 10 }]}>FAQs</Text>
        {FAQS.map((faq, i) => (
          <TouchableOpacity
            key={i}
            style={s.faqCard}
            activeOpacity={0.8}
            onPress={() => setExpanded(expanded === i ? null : i)}
          >
            <View style={s.faqRow}>
              <Text style={s.faqQ}>{faq.q}</Text>
              <Text style={{ fontSize: 18, color: Colors.text3 }}>{expanded === i ? '∧' : '›'}</Text>
            </View>
            {expanded === i && <Text style={s.faqA}>{faq.a}</Text>}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: '#E8F5F5' },
  scroll:       { padding: 16, paddingBottom: 40 },
  contactRow:   { flexDirection: 'row', gap: 12, marginBottom: 20 },
  contactCard:  { flex: 1, backgroundColor: '#FFF', borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#D0EEEE', gap: 8 },
  contactLabel: { fontSize: 13, fontWeight: '700', color: '#1A2E2E', textAlign: 'center' },
  contactSub:   { fontSize: 11, color: '#7A9E9E', textAlign: 'center' },
  cardTitle:    { fontSize: 14, fontWeight: '800', color: '#1A2E2E', marginBottom: 10 },
  faqCard:      { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 8, borderWidth: 1, borderColor: '#D0EEEE' },
  faqRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  faqQ:         { fontSize: 13, fontWeight: '700', color: '#1A2E2E', flex: 1 },
  faqA:         { fontSize: 13, color: '#3D6E6E', marginTop: 10, lineHeight: 20 },
  text3:        { color: '#7A9E9E' },
});
