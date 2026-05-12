import React, { useState } from 'react';
import {
  View, Text, ScrollView, FlatList, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, StatusBar, Alert,
} from 'react-native';
import { Colors, Fonts, Radius, Shadows } from '../../../vendor/theme';
import { AppHeader, Card, PrimaryButton, Divider, Badge, Avatar, SectionTitle, TabChip } from '../../../vendor/components';
import { MarketplaceTabBar } from '../../../vendor/components/TabBars';
import useAppStore from '../../../store/appStore';
import { useTheme } from '../../../hooks/useTheme';

const EMOJIS = ['🍚','🫙','🫘','🌾','🍬','🧂','🧈','🥛','🥚','🧅','🍅','🥦','🧃','🍫','🫐','📦'];

// ─── ProductListScreen ────────────────────────────────────────────────────────

export default function DeliveryTrackingScreen({ navigation, route }) {
  const theme = useTheme();
  const [currentStage, setCurrentStage] = useState(3);
  const order = route?.params?.order || { id: '#ORD12345' };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle={theme.mode === 'light' ? 'dark-content' : 'light-content'} backgroundColor={theme.header} />
      <AppHeader
        title="Track Order"
        subtitle={order.id}
        onBack={() => navigation.goBack()}
        rightComponent={<Badge label="Out for Delivery" color={Colors.blue} bg={Colors.blueLight} />}
      />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Delivery Partner */}
        <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={[s.itemEmoji, { backgroundColor: Colors.tealLight, width: 50, height: 50, borderRadius: 16 }]}>
            <Text style={{ fontSize: 26 }}>🏍️</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.customerName}>Rajesh Kumar</Text>
            <Text style={s.customerLoc}>UP16 AB 1234 · Self Delivery</Text>
          </View>
          <TouchableOpacity style={[s.callBtn, { backgroundColor: Colors.greenLight }]} activeOpacity={0.8}>
            <Text style={{ fontSize: 18 }}>📞</Text>
          </TouchableOpacity>
        </Card>

        {/* Track Stages */}
        <Card>
          <Text style={s.sectionLabel}>Delivery Progress</Text>
          {DELIVERY_STAGES.map((stage, i) => {
            const done   = i < currentStage;
            const active = i === currentStage;
            return (
              <View key={i} style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ alignItems: 'center' }}>
                  <View style={[s.trackCircle, done || active ? { backgroundColor: Colors.teal, borderColor: Colors.teal } : { backgroundColor: Colors.bg, borderColor: Colors.border }]}>
                    {done
                      ? <Text style={{ color: theme.card, fontSize: 11, fontWeight: Fonts.bold }}>✓</Text>
                      : active
                        ? <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: theme.card }} />
                        : null}
                  </View>
                  {i < DELIVERY_STAGES.length - 1 && (
                    <View style={[s.trackLine, { backgroundColor: done ? Colors.teal : Colors.border }]} />
                  )}
                </View>
                <View style={{ paddingTop: 3, paddingBottom: 16, flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: done || active ? Fonts.bold : Fonts.medium, color: done || active ? Colors.teal : Colors.text2 }}>{stage}</Text>
                  <Text style={{ fontSize: 11, color: Colors.text3, marginTop: 2 }}>
                    {done ? `Today, ${DELIVERY_TIMES[i]}` : active ? 'In progress...' : 'Pending'}
                  </Text>
                </View>
              </View>
            );
          })}
        </Card>

        {currentStage < DELIVERY_STAGES.length - 1 && (
          <PrimaryButton
            title={`Mark as "${DELIVERY_STAGES[currentStage + 1]}"`}
            onPress={() => setCurrentStage(p => Math.min(p + 1, 5))}
            color={Colors.teal}
          />
        )}
        {currentStage === DELIVERY_STAGES.length - 1 && (
          <Card style={{ backgroundColor: Colors.greenLight, alignItems: 'center', paddingVertical: 20 }}>
            <Text style={{ fontSize: 40, marginBottom: 8 }}>🎉</Text>
            <Text style={{ fontSize: 16, fontWeight: Fonts.bold, color: Colors.green }}>Order Delivered Successfully!</Text>
          </Card>
        )}

        <TouchableOpacity style={[s.mapBtn]} activeOpacity={0.8}>
          <Text style={{ fontSize: 16 }}>🗺️</Text>
          <Text style={s.mapBtnText}>View on Map</Text>
        </TouchableOpacity>

      </ScrollView>
      <View style={s.footer}>
        <PrimaryButton title="Contact Customer" onPress={() => {}} outline color={Colors.teal} />
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
