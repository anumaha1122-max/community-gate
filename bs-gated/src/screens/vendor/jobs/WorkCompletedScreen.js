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

export default function WorkCompletedScreen({ navigation, route }) {
  const theme = useTheme();
  const { jobId } = route?.params || {};
  const requests           = useSharedStore(s => s.maintenanceRequests);
  const vendorRequestPayment = useSharedStore(s => s.vendorRequestPayment);

  const job = requests.find(r => r.id === jobId) || {};

  return (
    <SafeAreaView style={[styles.safe, {backgroundColor: theme.background}]}>
      <StatusBar barStyle={theme.mode === 'light' ? 'dark-content' : 'light-content'} backgroundColor={theme.header} />
      <AppHeader title="Work Completed" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.statusBox}>
          <View style={[styles.statusIcon, { backgroundColor: Colors.greenLight }]}>
            <Text style={{ fontSize: 52 }}>🏁</Text>
          </View>
          <Text style={styles.statusTitle}>Work Completed!</Text>
          <Text style={styles.statusSub}>Request payment from admin to proceed</Text>
        </View>

        <Card>
          {[
            ['Resident',  job.residentName || '—'],
            ['Category',  job.category     || '—'],
            ['Job ID',    job.id           || '—'],
            ['Quote',     job.quote ? ('₹' + job.quote.amount) : '—'],
          ].map(([k, v], i) => (
            <View key={i} style={[styles.detailRow, i > 0 && { borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 8 }]}>
              <Text style={styles.detailLabel}>{k}</Text>
              <Text style={styles.detailValue}>{v}</Text>
            </View>
          ))}
        </Card>

        {job.status === 'work_completed' && (
          <PrimaryButton
            title="💰 Request Payment from Admin"
            onPress={() => {
              vendorRequestPayment(job.id);
              Alert.alert('Done', 'Payment request sent to admin.', [
                { text: 'OK', onPress: () => navigation.navigate('BusinessHome') },
              ]);
            }}
            color={Colors.green}
          />
        )}

        {job.status !== 'work_completed' && (
          <PrimaryButton
            title="🏠 Back to Home"
            onPress={() => navigation.navigate('BusinessHome')}
            color={Colors.purple}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
