import React from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  SafeAreaView, StatusBar, TouchableOpacity,
} from 'react-native';
import { Colors, Fonts, Radius, Shadows } from '../../../vendor/theme';
import { Card, SectionTitle } from '../../../vendor/components';
import { BusinessTabBar } from '../../../vendor/components/TabBars';
import useSharedStore from '../../../store/appStore';
import { useAuthStore } from '../../../store/AuthStore';
import { useTheme } from '../../../hooks/useTheme';

const MONTHS  = ['Jan','Feb','Mar','Apr','May'];
const BAR_H   = [30, 50, 45, 70, 90];

export default function EarningsScreen({ navigation }) {
  const theme      = useTheme();
  const authUser   = useAuthStore(s => s.user);
  const requests   = useSharedStore(s => s.maintenanceRequests);
  const users      = useSharedStore(s => s.users);

  const vendorUser = users.find(u => u.role === 'vendor' && u.id === authUser?.id)
    || users.find(u => u.role === 'vendor');

  const closedJobs    = requests.filter(r =>
    r.assignedVendorId === vendorUser?.id && r.status === 'paid_to_vendor'
  );
  const totalEarnings = closedJobs.reduce((sum, r) => sum + (r.quote?.amount || 0), 0);
  const completedCount = closedJobs.length;
  const avgPerJob      = completedCount > 0 ? Math.round(totalEarnings / completedCount) : 0;

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#1A7A7A" />

      {/* Hero */}
      <View style={s.hero}>
        <View style={s.heroCircle} />
        <View style={s.heroHeaderRow}>
          <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Text style={s.backArrow}>‹</Text>
          </TouchableOpacity>
          <Text style={s.heroTitle}>My Earnings</Text>
          <View style={{ width: 36 }} />
        </View>
        <Text style={s.heroSub}>Closed Jobs · Payment Received</Text>
        <Text style={s.heroAmt}>₹{totalEarnings.toLocaleString('en-IN')}</Text>
        <Text style={s.heroDelta}>{completedCount} job{completedCount !== 1 ? 's' : ''} closed</Text>

        {/* Mini bar chart */}
        <View style={s.barsRow}>
          {MONTHS.map((m, i) => (
            <View key={m} style={s.barWrapper}>
              <View style={[s.bar, { height: BAR_H[i], backgroundColor: i === MONTHS.length - 1 ? '#FFF' : 'rgba(255,255,255,0.4)' }]} />
              <Text style={s.barLabel}>{m}</Text>
            </View>
          ))}
        </View>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Stat Cards */}
        <View style={s.statsRow}>
          {[
            { label: 'Closed Jobs',  value: String(completedCount),                        color: Colors.green,  bg: Colors.greenLight  },
            { label: 'Total Earned', value: `₹${totalEarnings.toLocaleString('en-IN')}`,   color: Colors.purple, bg: Colors.purpleLight },
            { label: 'Avg Per Job',  value: `₹${avgPerJob.toLocaleString('en-IN')}`,       color: Colors.blue,   bg: Colors.blueLight   },
          ].map((sc, i) => (
            <View key={i} style={[s.statCard, { backgroundColor: sc.bg }]}>
              <Text style={[s.statVal, { color: sc.color }]}>{sc.value}</Text>
              <Text style={[s.statLabel, { color: sc.color }]}>{sc.label}</Text>
            </View>
          ))}
        </View>

        <SectionTitle title="Closed Jobs (Earnings)" />

        {closedJobs.length === 0 ? (
          <View style={s.empty}>
            <Text style={{ fontSize: 40, marginBottom: 10 }}>💰</Text>
            <Text style={s.emptyTitle}>No earnings yet</Text>
            <Text style={s.emptySub}>Complete jobs and receive payment to see earnings here.</Text>
          </View>
        ) : (
          closedJobs.map(job => (
            <Card key={job.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={s.txnIcon}>
                <Text style={{ fontSize: 20 }}>💳</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={s.txnName}>{job.category}</Text>
                  <Text style={s.txnAmt}>+₹{(job.quote?.amount || 0).toLocaleString('en-IN')}</Text>
                </View>
                <Text style={s.txnMeta}>
                  {job.residentName} · Unit {job.unit}
                </Text>
                <Text style={s.txnDate}>
                  {job.adminPaidVendorAt
                    ? new Date(job.adminPaidVendorAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                    : '—'}
                </Text>
              </View>
            </Card>
          ))
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      <BusinessTabBar
        activeTab="Earnings"
        onTabPress={(tab) => {
          if (tab === 'Home')     navigation.navigate('BusinessHome');
          if (tab === 'Requests') navigation.navigate('RequestList');
          if (tab === 'Jobs')     navigation.navigate('JobsList');
          if (tab === 'Profile')  navigation.navigate('VendorProfile');
        }}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: '#E8F5F5' },

  // Hero
  hero:          { backgroundColor: '#1A7A7A', paddingTop: 40, paddingBottom: 20, paddingHorizontal: 20, overflow: 'hidden' },
  heroCircle:    { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(255,255,255,0.06)', top: -60, right: -40 },
  heroHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  backBtn:       { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  backArrow:     { fontSize: 26, color: '#FFFFFF', fontWeight: '300', lineHeight: 30, marginTop: -2 },
  heroTitle:     { fontSize: 18, fontWeight: '800', color: '#FFF' },
  heroSub:       { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 4 },
  heroAmt:       { fontSize: 36, fontWeight: '900', color: '#FFF', letterSpacing: -1 },
  heroDelta:     { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 2, marginBottom: 16 },

  // Bar chart
  barsRow:       { flexDirection: 'row', alignItems: 'flex-end', gap: 8, height: 60 },
  barWrapper:    { flex: 1, alignItems: 'center', justifyContent: 'flex-end', gap: 4 },
  bar:           { width: '100%', borderRadius: 4 },
  barLabel:      { fontSize: 10, color: 'rgba(255,255,255,0.7)', fontWeight: '600' },

  // Content
  scroll:        { padding: 14 },
  statsRow:      { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statCard:      { flex: 1, borderRadius: 14, padding: 12, alignItems: 'center' },
  statVal:       { fontSize: 16, fontWeight: '900' },
  statLabel:     { fontSize: 10, fontWeight: '700', marginTop: 2, textAlign: 'center' },

  // Transaction rows
  txnIcon:       { width: 44, height: 44, borderRadius: 12, backgroundColor: Colors.greenLight, alignItems: 'center', justifyContent: 'center' },
  txnName:       { fontSize: 14, fontWeight: '700', color: Colors.text },
  txnAmt:        { fontSize: 14, fontWeight: '800', color: Colors.green },
  txnMeta:       { fontSize: 12, color: Colors.text2, marginTop: 2 },
  txnDate:       { fontSize: 11, color: Colors.text3, marginTop: 1 },

  // Empty
  empty:         { alignItems: 'center', paddingTop: 50, paddingHorizontal: 32 },
  emptyTitle:    { fontSize: 16, fontWeight: '800', color: Colors.text, marginBottom: 6 },
  emptySub:      { fontSize: 13, color: Colors.text2, textAlign: 'center', lineHeight: 20 },
});