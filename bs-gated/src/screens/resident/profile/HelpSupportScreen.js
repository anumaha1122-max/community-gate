/**
 * HelpSupportScreen.js
 *
 * Real-world help & support screen.
 * Theme: Identical to VisitorListScreen.
 *
 * Features:
 *  - Emergency contacts (management, security, fire, ambulance)
 *  - FAQ accordion (most common resident questions)
 *  - Raise a support ticket (goes to admin as maintenance request)
 *  - App version / society info
 */

import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar,
  ScrollView, Alert, Linking, TextInput, Modal, KeyboardAvoidingView, Platform,
} from 'react-native';
import useResidentStore from '../../../store/residentStore';
import { useAuthStore }  from '../../../store/AuthStore';

const V = {
  header: '#1A7A7A', headerDark: '#0D6E6E',
  bg: '#E8F5F5', surface: '#FFFFFF',
  border: '#D0EEEE', divider: '#E8F5F5',
  text: '#1A2E2E', textSub: '#3D6E6E', textMuted: '#7A9E9E',
  primary: '#1A7A7A', chip: '#E8F5F5',
  danger: '#C62828', dangerBg: '#FEE2E2',
  warning: '#E65100', warningBg: '#FEF3C7',
  successBg: '#CCFBF1',
};

const EMERGENCY_CONTACTS = [
  { emoji: '🏢', label: 'Management Office', number: '+91 99999 00000', color: V.primary, bg: V.successBg },
  { emoji: '💂', label: 'Security Control Room', number: '+91 99999 11111', color: '#0369A1', bg: '#E0F2FE' },
  { emoji: '🔥', label: 'Fire Brigade', number: '101', color: V.danger, bg: V.dangerBg },
  { emoji: '🚑', label: 'Ambulance', number: '108', color: '#7C3AED', bg: '#F5F3FF' },
  { emoji: '🚓', label: 'Police Control Room', number: '100', color: '#1D4ED8', bg: '#DBEAFE' },
];

const FAQS = [
  { q: 'How do I add a visitor pass?', a: 'Go to Dashboard → Visitors → tap "+ Add". Enter visitor name, phone, purpose and date. The visitor gets an OTP and QR pass which they show at the gate.' },
  { q: 'How do I pay my maintenance bill?', a: 'Go to Dashboard → Bills. Tap on the pending invoice and choose UPI / Card / Net Banking. You\'ll receive a receipt on your registered email.' },
  { q: 'How do I raise a maintenance request?', a: 'Dashboard → Maintenance → tap "+ New Request". Select category, describe the issue, add photos, and choose a preferred time slot. The admin assigns a vendor.' },
  { q: 'How do I book an amenity?', a: 'Dashboard → Amenities → select the facility → pick a date and slot → confirm. An OTP is generated which you show the guard for entry.' },
  { q: 'How do I track my maid?', a: 'Dashboard → GPS Track → tap "+ Add". Enter the maid\'s name and phone. They receive an invite on their app. Once accepted, their live location is visible to you.' },
  { q: 'How do I raise an SOS alert?', a: 'Dashboard → tap the red SOS button, or go to My SOS → tap "+ SOS". All security guards and admin are notified immediately.' },
  { q: 'How do I book an EV charging slot?', a: 'Dashboard → EV Charging → tap on an available slot → select time → pay deposit → confirm. Show the OTP to the guard on arrival.' },
  { q: 'How do I request guest parking?', a: 'Dashboard → Guest Parking → enter your guest\'s vehicle number and expected arrival. Admin approves and assigns a slot. Your guest gets a confirmation SMS.' },
  { q: 'How do I update my profile?', a: 'Profile → Personal Information → tap "Edit Personal Details". Changes to name and phone are updated everywhere in the app immediately.' },
];

export default function HelpSupportScreen({ navigation }) {
  const user    = useAuthStore(s => s.user);
  const society = useResidentStore(s => s.society);

  const [openFaq,     setOpenFaq]     = useState(null);
  const [showTicket,  setShowTicket]  = useState(false);
  const [ticketTitle, setTicketTitle] = useState('');
  const [ticketDesc,  setTicketDesc]  = useState('');
  const [ticketCat,   setTicketCat]   = useState('App Issue');

  const TICKET_CATS = ['App Issue', 'Billing Query', 'Amenity Problem', 'Maintenance Delay', 'Security Concern', 'Other'];

  const call = (num) => {
    Linking.openURL(`tel:${num}`).catch(() =>
      Alert.alert('Cannot Call', 'Unable to open the phone dialler on this device.')
    );
  };

  const submitTicket = () => {
    if (!ticketTitle.trim()) return Alert.alert('Required', 'Please enter a subject.');
    if (!ticketDesc.trim())  return Alert.alert('Required', 'Please describe your issue.');
    // In production: POST to API. Here we simulate with Alert.
    setShowTicket(false);
    setTicketTitle(''); setTicketDesc(''); setTicketCat('App Issue');
    Alert.alert(
      '✅ Ticket Raised',
      `Your support ticket has been submitted.\n\nTicket ID: TKT-${Date.now().toString().slice(-6)}\n\nOur team will respond within 24 hours via your registered email and phone.`,
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={s.screen}>
      <StatusBar barStyle="light-content" backgroundColor={V.headerDark} />
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()} style={s.backBtn}>
          <Text style={s.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={s.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={s.headerTitle}>Help & Support</Text>
            <Text style={s.headerSub}>{society?.name || 'BS Gated Community'}</Text>
          </View>
          <TouchableOpacity style={s.ticketBtn} onPress={() => setShowTicket(true)}>
            <Text style={s.ticketBtnText}>+ Ticket</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.body} showsVerticalScrollIndicator={false}>

        {/* Emergency contacts */}
        <Text style={s.sectionLabel}>🚨 EMERGENCY CONTACTS</Text>
        {EMERGENCY_CONTACTS.map(c => (
          <TouchableOpacity key={c.label} style={s.contactCard} onPress={() => call(c.number)} activeOpacity={0.8}>
            <View style={[s.contactIcon, { backgroundColor: c.bg }]}>
              <Text style={{ fontSize: 22 }}>{c.emoji}</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={s.contactLabel}>{c.label}</Text>
              <Text style={[s.contactNum, { color: c.color }]}>{c.number}</Text>
            </View>
            <View style={[s.callBtn, { backgroundColor: c.bg }]}>
              <Text style={[s.callBtnText, { color: c.color }]}>📞 Call</Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* Raise ticket */}
        <Text style={[s.sectionLabel, { marginTop: 20 }]}>🎫 SUPPORT TICKET</Text>
        <TouchableOpacity style={s.raiseCard} onPress={() => setShowTicket(true)} activeOpacity={0.85}>
          <Text style={{ fontSize: 28, marginBottom: 8 }}>📝</Text>
          <Text style={s.raiseTitle}>Raise a Support Ticket</Text>
          <Text style={s.raiseSub}>For app issues, billing queries, or any other concerns — our team responds within 24 hours.</Text>
          <View style={s.raiseBtnInline}>
            <Text style={s.raiseBtnText}>+ Raise Ticket</Text>
          </View>
        </TouchableOpacity>

        {/* FAQ */}
        <Text style={[s.sectionLabel, { marginTop: 20 }]}>❓ FREQUENTLY ASKED QUESTIONS</Text>
        {FAQS.map((faq, i) => (
          <TouchableOpacity
            key={i}
            style={[s.faqCard, openFaq === i && s.faqCardOpen]}
            onPress={() => setOpenFaq(openFaq === i ? null : i)}
            activeOpacity={0.8}
          >
            <View style={s.faqHeader}>
              <Text style={s.faqQ} numberOfLines={openFaq === i ? undefined : 2}>{faq.q}</Text>
              <Text style={s.faqChevron}>{openFaq === i ? '▲' : '▼'}</Text>
            </View>
            {openFaq === i && (
              <View style={s.faqBody}>
                <View style={s.faqDivider} />
                <Text style={s.faqA}>{faq.a}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}

        {/* App info */}
        <Text style={[s.sectionLabel, { marginTop: 20 }]}>ℹ️ APP INFORMATION</Text>
        <View style={s.card}>
          {[
            { label: 'Society', value: society?.name || 'BS Gated Community' },
            { label: 'Resident', value: user?.name || '—' },
            { label: 'Unit', value: user?.unit || '—' },
            { label: 'App Version', value: '2.1.0' },
            { label: 'Support Email', value: 'support@goldenrich.in' },
          ].map((r, i, arr) => (
            <View key={r.label} style={[s.infoRow, i < arr.length - 1 && s.infoRowBorder]}>
              <Text style={s.infoLabel}>{r.label}</Text>
              <Text style={s.infoValue}>{r.value}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Support Ticket Modal */}
      <Modal visible={showTicket} transparent animationType="slide" onRequestClose={() => setShowTicket(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <View style={m.overlay}>
            <View style={m.sheet}>
              <View style={m.handle} />
              <View style={m.headerRow}>
                <View>
                  <Text style={m.title}>Raise Support Ticket</Text>
                  <Text style={m.subtitle}>We respond within 24 hours</Text>
                </View>
                <TouchableOpacity style={m.closeBtn} onPress={() => setShowTicket(false)}>
                  <Text style={m.closeX}>✕</Text>
                </TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <Text style={m.fieldLabel}>CATEGORY *</Text>
                <View style={m.chipRow}>
                  {TICKET_CATS.map(c => (
                    <TouchableOpacity key={c} style={[m.chip, ticketCat === c && m.chipActive]} onPress={() => setTicketCat(c)}>
                      <Text style={[m.chipText, ticketCat === c && { color: '#FFF' }]}>{c}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={m.fieldLabel}>SUBJECT *</Text>
                <TextInput style={m.input} value={ticketTitle} onChangeText={setTicketTitle}
                  placeholder="Brief description of your issue" placeholderTextColor={V.textMuted} />
                <Text style={m.fieldLabel}>DESCRIPTION *</Text>
                <TextInput style={[m.input, { minHeight: 100, textAlignVertical: 'top' }]}
                  value={ticketDesc} onChangeText={setTicketDesc} multiline numberOfLines={4}
                  placeholder="Describe your issue in detail..." placeholderTextColor={V.textMuted} />
                <TouchableOpacity style={m.saveBtn} onPress={submitTicket}>
                  <Text style={m.saveBtnText}>📤  Submit Ticket</Text>
                </TouchableOpacity>
                <TouchableOpacity style={m.cancelBtn} onPress={() => setShowTicket(false)}>
                  <Text style={m.cancelText}>Cancel</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: V.bg },
  header: { backgroundColor: V.header, paddingTop: 40, paddingHorizontal: 20, paddingBottom: 16 },
  backBtn: { marginBottom: 10 },
  backText: { color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: '600', marginBottom: 8 },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#FFF' },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  ticketBtn: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  ticketBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  body: { padding: 16, paddingTop: 20 },
  sectionLabel: { fontSize: 11, fontWeight: '800', color: V.textMuted, letterSpacing: 1, marginBottom: 10 },
  contactCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: V.surface, borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: V.border },
  contactIcon: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  contactLabel: { fontSize: 14, fontWeight: '700', color: V.text },
  contactNum: { fontSize: 13, fontWeight: '800', marginTop: 2 },
  callBtn: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20 },
  callBtnText: { fontSize: 12, fontWeight: '800' },
  raiseCard: { backgroundColor: V.surface, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: V.border, alignItems: 'center', marginBottom: 4 },
  raiseTitle: { fontSize: 16, fontWeight: '800', color: V.text, marginBottom: 6 },
  raiseSub: { fontSize: 13, color: V.textMuted, textAlign: 'center', lineHeight: 20, marginBottom: 14 },
  raiseBtnInline: { backgroundColor: V.primary, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 20 },
  raiseBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  faqCard: { backgroundColor: V.surface, borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: V.border },
  faqCardOpen: { borderColor: V.primary },
  faqHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  faqQ: { flex: 1, fontSize: 13, fontWeight: '700', color: V.text, lineHeight: 20 },
  faqChevron: { fontSize: 11, color: V.textMuted, marginTop: 2 },
  faqBody: {},
  faqDivider: { height: 1, backgroundColor: V.divider, marginVertical: 10 },
  faqA: { fontSize: 13, color: V.textSub, lineHeight: 20 },
  card: { backgroundColor: V.surface, borderRadius: 14, borderWidth: 1, borderColor: V.border, overflow: 'hidden' },
  infoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 14 },
  infoRowBorder: { borderBottomWidth: 1, borderBottomColor: V.divider },
  infoLabel: { fontSize: 13, color: V.textMuted, fontWeight: '600' },
  infoValue: { fontSize: 13, fontWeight: '700', color: V.text },
});

const m = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: V.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 22, paddingBottom: 40, maxHeight: '85%' },
  handle: { width: 40, height: 4, backgroundColor: V.border, borderRadius: 2, alignSelf: 'center', marginBottom: 18 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  title: { fontSize: 19, fontWeight: '800', color: V.text },
  subtitle: { fontSize: 12, color: V.textMuted, marginTop: 2 },
  closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  closeX: { fontSize: 13, fontWeight: '700', color: '#64748B' },
  fieldLabel: { fontSize: 11, fontWeight: '800', color: V.textSub, letterSpacing: 0.5, marginBottom: 8 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: V.chip, borderWidth: 1, borderColor: V.border },
  chipActive: { backgroundColor: V.primary, borderColor: V.primary },
  chipText: { fontSize: 12, fontWeight: '700', color: V.textSub },
  input: { backgroundColor: '#F5FAFA', borderWidth: 1.5, borderColor: V.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: V.text, marginBottom: 14 },
  saveBtn: { backgroundColor: V.primary, borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginTop: 4 },
  saveBtnText: { color: '#FFF', fontSize: 15, fontWeight: '800' },
  cancelBtn: { paddingVertical: 14, alignItems: 'center' },
  cancelText: { fontSize: 14, fontWeight: '600', color: V.textMuted },
});
