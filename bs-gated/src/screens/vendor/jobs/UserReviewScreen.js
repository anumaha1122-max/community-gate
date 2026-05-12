// WorkScreens.js — wired to shared useStore
// Status flow from shared store:
//   assigned → quoted → quote_sent_to_resident → quote_accepted →
//   work_in_progress → work_completed → payment_requested_to_admin →
//   payment_requested_to_resident → payment_received → paid_to_vendor

import React from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  SafeAreaView, StatusBar, TouchableOpacity, Alert,
} from 'react-native';
import { Colors, Fonts, Radius, Shadows } from '../../../vendor/theme';
import { AppHeader, Card, PrimaryButton, Divider, Badge } from '../../../vendor/components';
import { ProgressStep } from '../../../vendor/components';
import useSharedStore from '../../../store/appStore';
import { useTheme } from '../../../hooks/useTheme';

const WORK_STAGES = [
  'Work Initiated', 'Site Visit Done', 'Material Planning', 'Material Approved',
  'Material Procured', 'Work in Progress', 'Quality Check', 'Testing',
  'Snag / Issue Fixing', 'Final Inspection', 'Handover to Resident', 'Work Completed',
];

// ─── ApprovalStatusScreen ─────────────────────────────────────────────────────
// Shows after vendor submits quote — reflects real store status

export default function UserReviewScreen({ navigation, route }) {
  const theme = useTheme();
  const { jobId } = route?.params || {};
  const requests = useSharedStore(s => s.maintenanceRequests);
  const job = requests.find(r => r.id === jobId) || {};

  return (
    <SafeAreaView style={[styles.safe, {backgroundColor: theme.background}]}>
      <StatusBar barStyle={theme.mode === 'light' ? 'dark-content' : 'light-content'} backgroundColor={theme.header} />
      <AppHeader title="Job Review" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <View style={styles.statusBox}>
          <View style={[styles.statusIcon, { backgroundColor: Colors.greenLight }]}>
            <Text style={{ fontSize: 52 }}>⭐</Text>
          </View>
          <Text style={styles.statusTitle}>
            {job.status === 'paid_to_vendor' ? 'Job Closed — Paid!' : 'Awaiting Payment'}
          </Text>
          <Text style={styles.statusSub}>
            {job.status === 'paid_to_vendor'
              ? 'This job has been completed and paid'
              : 'Waiting for payment to clear'}
          </Text>
        </View>

        <Card>
          {[
            ['Resident', job.residentName || '—'],
            ['Category', job.category     || '—'],
            ['Quote',    job.quote ? ('₹' + job.quote.amount) : '—'],
            ['Status',   job.status       || '—'],
          ].map(([k, v], i) => (
            <View key={i} style={[styles.detailRow, i > 0 && { borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 8 }]}>
              <Text style={styles.detailLabel}>{k}</Text>
              <Text style={styles.detailValue}>{v}</Text>
            </View>
          ))}
        </Card>

        <PrimaryButton
          title="🏠 Back to Home"
          onPress={() => navigation.navigate('BusinessHome')}
          color={Colors.purple}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
