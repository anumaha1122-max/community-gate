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

export default function PaymentReceivedScreen({ navigation, route }) {
  const theme = useTheme();
  const { jobId } = route?.params || {};
  const requests         = useSharedStore(s => s.maintenanceRequests);
  const vendorRequestPayment = useSharedStore(s => s.vendorRequestPayment);
  const job = requests.find(r => r.id === jobId) || {};

  const handleRequestPayment = () => {
    if (job.id && job.status === 'work_completed') {
      vendorRequestPayment(job.id);
    }
    navigation.navigate('JobCompleted', { jobId: job.id });
  };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle={theme.mode === 'light' ? 'dark-content' : 'light-content'} backgroundColor={theme.header} />
      <AppHeader title="Payment Received" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        <View style={s.heroCenter}>
          <View style={s.payIcon}><Text style={{ fontSize: 52 }}>💰</Text></View>
          <Text style={s.payTitle}>Payment Received!</Text>
          <Text style={s.paySub}>Thank you for your service.</Text>
          <Text style={s.payAmount}>{job.quote ? ('₹' + job.quote.amount) : '—'}</Text>
          <Text style={s.payMeta}>Paid today · UPI</Text>
        </View>

        <Card>
          <Text style={s.sectionLabel}>Transaction Details</Text>
          {[
            ['Service',        job.category || 'Service'],
            ['Customer',       job.residentName || '—'],
            ['Service Amount', job.quote ? ('₹' + job.quote.amount) : '—'],
            ['Payment Method', 'UPI'],
          ].map(([k, v], i) => (
            <View key={i} style={[s.row, i < 3 && s.rowBorder]}>
              <Text style={s.rowKey}>{k}</Text>
              <Text style={[s.rowVal, k === 'Service Amount' && { color: Colors.green }]}>{v}</Text>
            </View>
          ))}
        </Card>

        <View style={{ gap: 10 }}>
          <PrimaryButton title="✅  Request Payment from Admin" onPress={handleRequestPayment} color={Colors.green} />
          <PrimaryButton title="View Job Details" onPress={() => navigation.navigate('JobCompleted', { jobId: job.id })} outline color={Colors.purple} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
