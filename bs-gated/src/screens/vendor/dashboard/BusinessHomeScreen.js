import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, StatusBar,
} from 'react-native';
import { Colors, Fonts, Radius, Shadows } from '../../../vendor/theme';
import { BusinessTabBar } from '../../../vendor/components/TabBars';
import { SectionTitle, Badge } from '../../../vendor/components';
import useSharedStore from '../../../store/appStore';
import { useAuthStore } from '../../../store/AuthStore';
import { useTheme } from '../../../hooks/useTheme';

const QUICK_ACTIONS = [
  { emoji: '📋', label: 'New Requests',    screen: 'RequestList',  color: Colors.teal, bg: Colors.purpleLight },
  { emoji: '🔧', label: 'My Jobs',         screen: 'JobsList',     color: Colors.green,  bg: Colors.greenLight  },
  { emoji: '🛡️', label: 'AMC / Contracts', screen: 'AMCContracts', color: Colors.teal,   bg: Colors.tealLight   },
  { emoji: '💰', label: 'My Earnings',     screen: 'Earnings',     color: Colors.amber,  bg: Colors.amberLight  },
];

export default function BusinessHomeScreen({ navigation }) {
  const theme = useTheme();
  const authUser = useAuthStore(s => s.user);
  const requests = useSharedStore(s => s.maintenanceRequests);
  const users = useSharedStore(s => s.users);

  // Find current vendor user details from shared users list
  const vendorUser = users.find(u => u.role === 'vendor' && u.id === authUser?.id) || users.find(u => u.role === 'vendor');

  // Live stats: jobs assigned to this vendor
  const myJobs = requests.filter(r => r.assignedVendorId === vendorUser?.id);
  const newRequests  = myJobs.filter(r => r.status === 'assigned').length;
  const inProgress   = myJobs.filter(r => r.status === 'work_in_progress').length;
  const completed    = myJobs.filter(r => r.status === 'paid_to_vendor').length;
  const earnings     = myJobs.filter(r => r.status === 'paid_to_vendor').reduce((s, r) => s + (r.quote?.amount || 0), 0);

  const STATS = [
    { value: String(newRequests),              label: 'New\nRequests' },
    { value: String(inProgress),               label: 'In\nProgress'  },
    { value: String(completed),                label: 'Completed'     },
    { value: `₹${earnings.toLocaleString()}`,  label: 'Earnings'      },
  ];

  // Recent jobs for the list
  const recentJobs = myJobs.slice(0, 5).map(r => ({
    id: r.id,
    name: r.title,
    loc: `${r.residentName} · ${r.unit}`,
    status: r.status === 'work_in_progress' ? 'In Progress' : r.status === 'assigned' ? 'New' : r.status === 'paid_to_vendor' ? 'Completed' : r.status,
    statusColor: r.status === 'work_in_progress' ? Colors.amber : r.status === 'paid_to_vendor' ? Colors.green : Colors.teal,
    statusBg: r.status === 'work_in_progress' ? Colors.amberLight : r.status === 'paid_to_vendor' ? Colors.greenLight : Colors.purpleLight,
    time: new Date(r.createdAt).toLocaleDateString(),
  }));

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.mode === 'light' ? 'dark-content' : 'light-content'} backgroundColor={theme.header} />

      {/* Hero header */}
      <View style={styles.hero}>
        <View style={styles.heroCircle1} />
        <View style={styles.heroCircle2} />
        <View style={styles.heroTop}>
          <View>
            <Text style={styles.heroGreeting}>Hello,</Text>
            <Text style={styles.heroName}>{vendorUser?.name || 'Vendor'} 👋</Text>
          </View>
          {/* Bell — navigates to Notifications */}
          <TouchableOpacity
            style={styles.bellBtn}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('VendorNotifications')}
          >
            <Text style={{ fontSize: 20 }}>🔔</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.heroSubtitle}>Today's Overview</Text>
        <View style={styles.statsRow}>
          {STATS.map((s, i) => (
            <View key={i} style={styles.statBox}>
              <Text style={[styles.statValue, i === 3 && { fontSize: 13 }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Quick Actions */}
        <View style={styles.gridRow}>
          {QUICK_ACTIONS.map((a, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => navigation.navigate(a.screen)}
              activeOpacity={0.78}
              style={[styles.actionCard, { backgroundColor: a.bg }]}
            >
              <View style={[styles.actionIconBox, { shadowColor: a.color }]}>
                <Text style={{ fontSize: 18 }}>{a.emoji}</Text>
              </View>
              <Text style={[styles.actionLabel, { color: a.color }]}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Jobs */}
        <SectionTitle title="Recent Jobs" onAction={() => navigation.navigate('RequestList')} />
        {recentJobs.length === 0 && (
          <View style={{ alignItems: 'center', paddingVertical: 32, opacity: 0.5 }}>
            <Text style={{ fontSize: 36, marginBottom: 8 }}>🔨</Text>
            <Text style={{ fontSize: 14, color: Colors.text2 }}>No jobs assigned yet</Text>
          </View>
        )}
        {recentJobs.map((job, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => navigation.navigate('JobsList')}
            activeOpacity={0.8}
            style={styles.jobCard}
          >
            <View style={[styles.jobIcon, { backgroundColor: job.statusBg }]}>
              <Text style={{ fontSize: 20 }}>🔧</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.jobRow}>
                <Text style={styles.jobName}>{job.name}</Text>
                <Badge label={job.status} color={job.statusColor} bg={job.statusBg} />
              </View>
              <Text style={styles.jobLoc}>{job.loc}</Text>
              <Text style={styles.jobTime}>{job.time}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <BusinessTabBar
        activeTab="Home"
        onTabPress={(tab) => {
          if (tab === 'Requests') navigation.navigate('RequestList');
          else if (tab === 'Jobs')     navigation.navigate('JobsList');
          else if (tab === 'Earnings') navigation.navigate('Earnings');
          else if (tab === 'Profile')  navigation.navigate('VendorProfile');
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },

  hero: {
    backgroundColor: '#1A7A7A',
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 20,
    overflow: 'hidden', position: 'relative',
  },
  heroCircle1: { position: 'absolute', top: -30, right: -30, width: 130, height: 130, borderRadius: 65, backgroundColor: 'rgba(255,255,255,0.08)' },
  heroCircle2: { position: 'absolute', bottom: -20, left: -20, width: 90, height: 90, borderRadius: 45, backgroundColor: 'rgba(255,255,255,0.06)' },
  heroTop:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  heroGreeting: { fontSize: 14, color: 'rgba(255,255,255,0.75)' },
  heroName:     { fontSize: 20, fontWeight: Fonts.extraBold, color: '#FFFFFF' },

  bellBtn: {
    width: 42, height: 42, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
    position: 'relative',
  },
  bellBadge: {
    position: 'absolute', top: 5, right: 5,
    backgroundColor: '#E8A020', borderRadius: 8,
    minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 3,
  },
  bellBadgeText: { fontSize: 9, fontWeight: Fonts.extraBold, color: '#FFFFFF' },

  heroSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 14 },
  statsRow:     { flexDirection: 'row', gap: 8 },
  statBox:      { flex: 1, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 6, alignItems: 'center' },
  statValue:    { fontSize: 18, fontWeight: Fonts.extraBold, color: '#FFFFFF' },
  statLabel:    { fontSize: 10, color: 'rgba(255,255,255,0.7)', marginTop: 3, lineHeight: 13, textAlign: 'center' },

  scroll: { padding: 16, paddingBottom: 90 },

  gridRow:       { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  actionCard:    { width: '48%', borderRadius: Radius.lg, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  actionIconBox: { width: 38, height: 38, borderRadius: Radius.md, backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  actionLabel:   { fontSize: 13, fontWeight: Fonts.bold, flex: 1 },

  jobCard: { backgroundColor: Colors.white, borderRadius: Radius.lg, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'flex-start', gap: 12, borderWidth: 1, borderColor: Colors.border, ...Shadows.card },
  jobIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  jobRow:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  jobName: { fontSize: 14, fontWeight: Fonts.bold, color: Colors.text, flex: 1, marginRight: 8 },
  jobLoc:  { fontSize: 12, color: Colors.text2, marginTop: 2 },
  jobTime: { fontSize: 11, color: Colors.text3, marginTop: 2 },
});