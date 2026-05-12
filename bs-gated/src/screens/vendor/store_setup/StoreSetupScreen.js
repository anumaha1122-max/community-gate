import React, { useState } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, StatusBar, Switch,
} from 'react-native';
import { Colors, Fonts, Radius, Shadows } from '../../../vendor/theme';
import { AppHeader, Card, PrimaryButton, Divider, Badge, SectionTitle } from '../../../vendor/components';
import { MarketplaceTabBar } from '../../../vendor/components/TabBars';
import { useTheme } from '../../../hooks/useTheme';

// ─── StoreSetupScreen ─────────────────────────────────────────────────────────

export default function StoreSetupScreen({ navigation }) {
  const theme = useTheme();
  const [selfDelivery, setSelfDelivery] = useState(true);
  const [storeName,    setStoreName]    = useState('Fresh Mart');
  const [category,     setCategory]     = useState('Grocery');
  const [address,      setAddress]      = useState('Shop No. 5, Sunrise Market, Sector 15, Noida');
  const [pincode,      setPincode]      = useState('201301');

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle={theme.mode === 'light' ? 'dark-content' : 'light-content'} backgroundColor={theme.header} />
      <AppHeader title="Create Your Store" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Store Logo */}
        <TouchableOpacity style={s.logoBox} activeOpacity={0.75}>
          <Text style={{ fontSize: 40 }}>🏪</Text>
          <Text style={s.logoText}>Tap to add store logo</Text>
        </TouchableOpacity>

        {[
          { label: 'Store Name *',     value: storeName, set: setStoreName, type: 'default' },
          { label: 'Store Category *', value: category,  set: setCategory,  type: 'default' },
          { label: 'Store Address *',  value: address,   set: setAddress,   type: 'default' },
          { label: 'Pincode *',        value: pincode,   set: setPincode,   type: 'numeric' },
        ].map((f, i) => (
          <Card key={i}>
            <Text style={s.label}>{f.label}</Text>
            <TextInput
              value={f.value}
              onChangeText={f.set}
              keyboardType={f.type}
              style={s.input}
              placeholderTextColor={Colors.text3}
            />
          </Card>
        ))}

        {/* Delivery Mode */}
        <Card>
          <Text style={s.label}>Delivery Mode</Text>
          {[['Self Delivery', true], ['Third Party Delivery', false]].map(([l, v]) => (
            <TouchableOpacity
              key={l}
              onPress={() => setSelfDelivery(v)}
              style={s.radioRow}
              activeOpacity={0.7}
            >
              <View style={[s.radioOuter, { borderColor: selfDelivery === v ? Colors.teal : Colors.border }]}>
                {selfDelivery === v && <View style={[s.radioInner, { backgroundColor: Colors.teal }]} />}
              </View>
              <Text style={s.radioLabel}>{l}</Text>
            </TouchableOpacity>
          ))}
        </Card>

        {/* Documents */}
        <Card>
          <Text style={s.label}>Store Documents</Text>
          {['GSTIN Certificate', 'Bank Details', 'Store Images'].map((d, i) => (
            <View key={i} style={[s.docRow, i < 2 && s.docBorder]}>
              <Text style={{ fontSize: 18 }}>📄</Text>
              <Text style={s.docName}>{d}</Text>
              <TouchableOpacity style={s.uploadBtn} activeOpacity={0.75}>
                <Text style={s.uploadBtnText}>Upload</Text>
              </TouchableOpacity>
            </View>
          ))}
        </Card>

        {/* Store Timings */}
        <Card>
          <Text style={s.label}>Store Timings</Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {[['Opening', '8:00 AM'], ['Closing', '10:00 PM']].map(([l, v], i) => (
              <View key={i} style={{ flex: 1 }}>
                <Text style={[s.label, { marginBottom: 4 }]}>{l}</Text>
                <TextInput value={v} style={s.input} placeholderTextColor={Colors.text3} />
              </View>
            ))}
          </View>
        </Card>

      </ScrollView>

      <View style={s.footer}>
        <PrimaryButton title="Submit & Create Store" onPress={() => navigation.navigate('StoreVerified')} color={Colors.teal} />
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: Colors.bg },
  scroll: { padding: 16, paddingBottom: 90 },
  footer: { padding: 16, backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.border },

  logoBox:  { alignItems: 'center', borderWidth: 2, borderStyle: 'dashed', borderColor: Colors.border, borderRadius: Radius.lg, paddingVertical: 24, marginBottom: 12, gap: 8 },
  logoText: { fontSize: 13, color: Colors.text3 },

  label: { fontSize: 12, fontWeight: Fonts.semiBold, color: Colors.text2, marginBottom: 6 },
  input: { borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.md, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: Colors.text },

  radioRow:   { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  radioOuter: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  radioInner: { width: 10, height: 10, borderRadius: 5 },
  radioLabel: { fontSize: 14, color: Colors.text },

  docRow:    { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10 },
  docBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  docName:   { flex: 1, fontSize: 13, color: Colors.text },
  uploadBtn: { paddingHorizontal: 14, paddingVertical: 7, backgroundColor: Colors.tealLight, borderRadius: Radius.md },
  uploadBtnText: { fontSize: 12, fontWeight: Fonts.bold, color: Colors.teal },

  verifiedWrapper: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  verifiedIcon: { width: 110, height: 110, borderRadius: 55, backgroundColor: Colors.greenLight, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  verifiedTitle:{ fontSize: 24, fontWeight: Fonts.extraBold, color: Colors.text, textAlign: 'center', lineHeight: 30 },
  verifiedSub:  { fontSize: 14, color: Colors.text2, textAlign: 'center', marginTop: 8, marginBottom: 24 },
  verifiedCard: { width: '100%', marginBottom: 24 },
  checkRow:  { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  checkCircle:{ width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.greenLight, alignItems: 'center', justifyContent: 'center' },
  checkText: { fontSize: 14, color: Colors.text },

  mktHero: { backgroundColor: Colors.teal, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 20, overflow: 'hidden', position: 'relative' },
  mktHeroCircle: { position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.08)' },
  mktHeroTop:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  mktGreet:    { fontSize: 14, color: 'rgba(255,255,255,0.75)' },
  mktName:     { fontSize: 20, fontWeight: Fonts.extraBold, color: '#fff' },
  mktBell:     { width: 42, height: 42, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  bellDot:     { position: 'absolute', top: 7, right: 7, width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF4757' },
  mktSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 14 },
  statsRow:    { flexDirection: 'row', gap: 8 },
  statBox:     { flex: 1, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 6, alignItems: 'center' },
  statValue:   { fontSize: 18, fontWeight: Fonts.extraBold, color: '#fff' },
  statLabel:   { fontSize: 10, color: 'rgba(255,255,255,0.7)', marginTop: 3, lineHeight: 13, textAlign: 'center' },

  gridRow:    { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 },
  actionCard: { width: '48%', borderRadius: Radius.lg, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  actionIconBox: { width: 38, height: 38, borderRadius: Radius.md, backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  actionLabel:{ fontSize: 13, fontWeight: Fonts.bold, flex: 1 },

  jobCard: { backgroundColor: Colors.white, borderRadius: Radius.lg, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: Colors.border, ...Shadows.card },
  jobIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  jobRow:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 },
  jobId:   { fontSize: 14, fontWeight: Fonts.extraBold, color: Colors.text, flex: 1, marginRight: 8 },
  jobName: { fontSize: 12, color: Colors.text2 },

  heroBackBtn:   { position: 'absolute', top: 48, left: 16, width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', zIndex: 10 },
  heroBackArrow: { fontSize: 22, color: '#fff', fontWeight: '700', marginTop: -2 },
  topBackBtn:    { position: 'absolute', top: 48, left: 16, width: 36, height: 36, borderRadius: 12, backgroundColor: Colors.bg, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center', zIndex: 10 },
  topBackArrow:  { fontSize: 22, color: Colors.text, fontWeight: '700', marginTop: -2 },
});
