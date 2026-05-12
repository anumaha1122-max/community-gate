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

export default function ApprovalStatusScreen({ navigation, route }) {
  const theme = useTheme();
  const { requestId } = route?.params || {};
  const requests = useSharedStore(s => s.maintenanceRequests);
  const item = requests.find(r => r.id === requestId);

  // Map shared statuses to display states
  const resolvedStatus = !item ? 'pending'
    : item.status === 'quoted'                 ? 'pending'
    : item.status === 'quote_sent_to_resident' ? 'forwarded'
    : item.status === 'quote_accepted'         ? 'approved'
    : item.status === 'quote_rejected'         ? 'rejected'
    : 'pending';

  const STATUS_CONFIG = {
    pending: {
      icon: '🕐', iconBg: Colors.amberLight,
      title: 'Quote Submitted!', sub: 'Waiting for admin to review and forward to resident',
      badgeLabel: 'Pending Admin Review', badgeColor: Colors.amber, badgeBg: Colors.amberLight,
    },
    forwarded: {
      icon: '📨', iconBg: Colors.tealLight,
      title: 'Quote Forwarded!', sub: 'Admin has sent the quote to the resident',
      badgeLabel: 'Awaiting Resident', badgeColor: Colors.teal, badgeBg: Colors.tealLight,
    },
    approved: {
      icon: '✅', iconBg: Colors.greenLight,
      title: 'Quote Accepted!', sub: 'The resident has accepted your quote',
      badgeLabel: 'Approved ✓', badgeColor: Colors.green, badgeBg: Colors.greenLight,
    },
    rejected: {
      icon: '❌', iconBg: '#FFF1F1',
      title: 'Quote Rejected', sub: 'The resident declined your quote',
      badgeLabel: 'Rejected', badgeColor: '#E53E3E', badgeBg: '#FFF1F1',
    },
  };

  const cfg = STATUS_CONFIG[resolvedStatus];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.mode === 'light' ? 'dark-content' : 'light-content'} backgroundColor={theme.header} />
      <AppHeader title="Quote Status" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <View style={styles.statusBox}>
          <View style={[styles.statusIcon, { backgroundColor: cfg.iconBg }]}>
            <Text style={{ fontSize: 52 }}>{cfg.icon}</Text>
          </View>
          <Text style={styles.statusTitle}>{cfg.title}</Text>
          <Text style={styles.statusSub}>{cfg.sub}</Text>
        </View>

        {item && (
          <View style={styles.jobCard}>
            <View style={styles.jobCardInner}>
              <Text style={styles.jobCardTag}>{item.category} · {item.id}</Text>
              <Text style={styles.jobCardName}>{item.residentName}</Text>
              <Text style={styles.jobCardLoc}>Unit {item.unit}</Text>
              <Divider style={{ backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: 10 }} />
              <View style={styles.jobCardStats}>
                <View>
                  <Text style={styles.jobCardStatLabel}>Quote Amount</Text>
                  <Text style={styles.jobCardStatValue}>
                    {item.quote ? ('₹' + item.quote.amount) : '—'}
                  </Text>
                </View>
                <View style={styles.jobCardDivider} />
                <View>
                  <Text style={styles.jobCardStatLabel}>Est. Days</Text>
                  <Text style={styles.jobCardStatValue}>
                    {item.quote ? (item.quote.estimatedDays + ' days') : '—'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        <Card>
          <Text style={styles.detailLabel}>Current Status</Text>
          <View style={[styles.statusBadgeRow, { backgroundColor: cfg.badgeBg, borderRadius: Radius.md, padding: 12 }]}>
            <Text style={[styles.statusBadgeText, { color: cfg.badgeColor }]}>{cfg.badgeLabel}</Text>
          </View>

          {resolvedStatus === 'rejected' && (
            <View style={styles.rejectedNote}>
              <Text style={styles.rejectedNoteText}>
                💡 You can go back to the request and send a revised quote.
              </Text>
            </View>
          )}
        </Card>

        {resolvedStatus === 'approved' && (
          <PrimaryButton
            title="🚀 Go to Jobs — Start Work"
            onPress={() => navigation.navigate('JobsList')}
            color={Colors.green}
          />
        )}

        {(resolvedStatus === 'pending' || resolvedStatus === 'forwarded') && (
          <PrimaryButton
            title="← Back to Requests"
            onPress={() => navigation.navigate('RequestList')}
            color={Colors.purple}
            outline
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: Colors.bg },
  scroll: { padding: 16, paddingBottom: 100 },

  // Status hero box
  statusBox:   { alignItems: 'center', paddingVertical: 32, gap: 10 },
  statusIcon:  { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  statusTitle: { fontSize: 22, fontWeight: Fonts.extraBold, color: Colors.text, textAlign: 'center' },
  statusSub:   { fontSize: 14, color: Colors.text2, textAlign: 'center', lineHeight: 20 },

  // Job card (coloured summary)
  jobCard:          { marginBottom: 12 },
  jobCardInner:     { backgroundColor: Colors.teal, borderRadius: Radius.lg, padding: 18 },
  jobCardTag:       { fontSize: 11, color: 'rgba(255,255,255,0.65)', fontWeight: Fonts.semiBold, marginBottom: 4 },
  jobCardName:      { fontSize: 17, fontWeight: Fonts.extraBold, color: '#FFF' },
  jobCardLoc:       { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  jobCardStats:     { flexDirection: 'row', alignItems: 'center', gap: 16 },
  jobCardStatLabel: { fontSize: 11, color: 'rgba(255,255,255,0.65)', marginBottom: 2 },
  jobCardStatValue: { fontSize: 16, fontWeight: Fonts.bold, color: '#FFF' },
  jobCardDivider:   { width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.2)' },

  // Status badge row
  statusBadgeRow:  { flexDirection: 'row', alignItems: 'center' },
  statusBadgeText: { fontSize: 14, fontWeight: Fonts.bold },

  // Detail label
  detailLabel: { fontSize: 12, fontWeight: Fonts.semiBold, color: Colors.text2, marginBottom: 5 },

  // Rejected note
  rejectedNote:     { marginTop: 12, backgroundColor: '#FFF8E1', borderRadius: Radius.sm, padding: 10 },
  rejectedNoteText: { fontSize: 13, color: '#B45309', lineHeight: 18 },
});