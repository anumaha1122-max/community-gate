import React from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  SafeAreaView, StatusBar, TouchableOpacity,
  Modal, FlatList,
} from 'react-native';
import { Colors, Fonts, Radius, Shadows } from '../../../vendor/theme';
import { AppHeader, Card, PrimaryButton, Divider, Badge, SectionTitle } from '../../../vendor/components';
import { BusinessTabBar } from '../../../vendor/components/TabBars';
import { ProgressStep, TabChip } from '../../../vendor/components';
import { useState } from 'react';
import useSharedStore from '../../../store/appStore';
import { useAuthStore } from '../../../store/AuthStore';
import { useTheme } from '../../../hooks/useTheme';

// Map shared store statuses to legacy STATUS constants for this file
const STATUS = {
  APPROVED:    'quote_accepted',
  IN_PROGRESS: 'work_in_progress',
  COMPLETED:   'work_completed',
  CLOSED:      'paid_to_vendor',
};

// ─── PaymentReceivedScreen ────────────────────────────────────────────────────

export default function JobCompletedScreen({ navigation, route }) {
  const theme = useTheme();
  const { jobId } = route?.params || {};
  const requests = useSharedStore(s => s.maintenanceRequests);
  const job = requests.find(r => r.id === jobId) || {};

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle={theme.mode === 'light' ? 'dark-content' : 'light-content'} backgroundColor={theme.header} />
      <View style={s.jobHero}>
        <View style={s.jobHeroCircle} />
        <View style={s.jobHeroTopRow}>
          <TouchableOpacity style={s.heroBackBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Text style={s.heroBackArrow}>‹</Text>
          </TouchableOpacity>
        </View>
        <Text style={{ fontSize: 64, marginBottom: 12 }}>🎉</Text>
        <Text style={s.jobHeroTitle}>Job Completed!</Text>
        <Text style={s.jobHeroSub}>Thank you for your excellent service</Text>
        <Text style={s.jobHeroAmt}>{job.quote ? ('₹' + job.quote.amount) : '—'}</Text>
        <Text style={s.jobHeroAmtLabel}>Total Earned</Text>
      </View>
      <ScrollView contentContainerStyle={[s.scroll, { paddingTop: 16 }]} showsVerticalScrollIndicator={false}>
        {[
          ['Customer',     job.residentName || '—'],
          ['Service',      job.category     || '—'],
          ['Job ID',       job.id           || '—'],
          ['Completed On', job.workCompletedAt ? new Date(job.workCompletedAt).toLocaleDateString() : '—'],
          ['Earnings',     job.quote ? ('₹' + job.quote.amount + ' — Pending') : '—'],
        ].map(([k, v], i) => (
          <Card key={i} style={{ marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14 }}>
            <Text style={s.rowKey}>{k}</Text>
            <Text style={s.rowVal}>{v}</Text>
          </Card>
        ))}
        <PrimaryButton title="🏠  Back to Home" onPress={() => navigation.navigate('BusinessHome')} color={Colors.purple} />
      </ScrollView>
    </SafeAreaView>
  );
}
