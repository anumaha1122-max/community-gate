import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, StatusBar,
} from 'react-native';
import { Colors, Fonts, Radius, Shadows } from '../../../vendor/theme';
import { AppHeader, Avatar, Card, PrimaryButton, Divider } from '../../../vendor/components';
import useSharedStore from '../../../store/appStore';
import { useTheme } from '../../../hooks/useTheme';

export default function RequestDetailsScreen({ navigation, route }) {
  const theme = useTheme();
  const { requestId } = route?.params || {};
  const requests = useSharedStore(s => s.maintenanceRequests);

  const request = requests.find(r => r.id === requestId);
  const vendorAdvanceStep = useSharedStore(s => s.vendorAdvanceStep);

  const WORK_STAGES = [
    'Work Initiated', 'Site Visit Done', 'Material Planning', 'Material Approved',
    'Material Procured', 'Work in Progress', 'Quality Check', 'Testing',
    'Snag / Issue Fixing', 'Final Inspection', 'Handover to Resident', 'Work Completed',
  ];

  if (!request) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
        <AppHeader title="Request Details" onBack={() => navigation.goBack()} />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: Colors.text2 }}>Request not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Map shared-store status to display info
  const STATUS_INFO = {
    quote_requested: { label: 'Quote Requested — Submit Your Bid', color: Colors.purple, bg: Colors.purpleLight, icon: '📋' },
    assigned: { label: 'Assigned — Submit Your Quote', color: Colors.purple, bg: Colors.purpleLight, icon: '📋' },
    quoted: { label: 'Quote Sent — Awaiting Admin Review', color: Colors.amber, bg: Colors.amberLight, icon: '💬' },
    quote_sent_to_resident: { label: 'Quote Forwarded to Resident', color: Colors.teal, bg: Colors.tealLight, icon: '📨' },
    quote_accepted: { label: 'Quote Accepted — Ready to Start', color: Colors.green, bg: Colors.greenLight, icon: '✅' },
    quote_rejected: { label: 'Quote Rejected', color: '#E53E3E', bg: '#FFF1F1', icon: '❌' },
    work_in_progress: { label: 'Work In Progress', color: Colors.amber, bg: Colors.amberLight, icon: '🔧' },
    work_completed: { label: 'Work Completed', color: Colors.green, bg: Colors.greenLight, icon: '🏁' },
    approved_to_start: { label: 'Approved — Head to Gate with OTP', color: Colors.green, bg: Colors.greenLight, icon: '🚀' },
  };
  const statusInfo = STATUS_INFO[request.status] || { label: request.status, color: Colors.purple, bg: Colors.purpleLight, icon: '📋' };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.mode === 'light' ? 'dark-content' : 'light-content'} backgroundColor={theme.header} />
      <AppHeader title="Request Details" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Customer Card */}
        <Card style={styles.customerCard}>
          <View style={styles.customerRow}>
            <Avatar name={request.residentName} size={50} color={Colors.purple} />
            <View style={{ flex: 1 }}>
              <Text style={styles.customerName}>{request.residentName}</Text>
              <Text style={styles.customerLoc}>Unit {request.unit}</Text>
              <Text style={styles.customerTime}>
                {new Date(request.createdAt).toLocaleDateString()} · {request.id}
              </Text>
            </View>
          </View>
        </Card>

        {/* Detail rows */}
        {[
          { label: 'Service Category', value: request.category },
          { label: 'Issue Title', value: request.title },
          { label: 'Description', value: request.description },
          { label: 'Priority', value: request.priority },
        ].map((row, i) => (
          <Card key={i}>
            <Text style={styles.detailLabel}>{row.label}</Text>
            <Text style={styles.detailValue}>{row.value}</Text>
          </Card>
        ))}

        {/* Quote details if submitted */}
        {request.quote && (
          <Card>
            <Text style={styles.detailLabel}>Your Quote</Text>
            <Text style={[styles.detailValue, { color: Colors.purple, fontSize: 18, fontWeight: Fonts.bold }]}>
              ₹{request.quote.amount?.toLocaleString()}
            </Text>
            <Text style={[styles.detailValue, { marginTop: 4 }]}>{request.quote.description}</Text>
            <Text style={[styles.detailLabel, { marginTop: 6 }]}>Estimated: {request.quote.estimatedDays} days</Text>
          </Card>
        )}

        {/* Status Card */}
        <Card>
          <Text style={styles.detailLabel}>Request Status</Text>
          <View style={[styles.statusBadgeRow, { backgroundColor: statusInfo.bg, borderRadius: 10, padding: 12 }]}>
            <Text style={{ fontSize: 18, marginRight: 8 }}>{statusInfo.icon}</Text>
            <Text style={[styles.statusBadgeText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
          </View>
        </Card>

        {/* Timeline */}
        {request.timeline && request.timeline.length > 0 && (
          <Card>
            <Text style={styles.detailLabel}>Timeline</Text>
            {request.timeline.map((t, i) => (
              <View key={i} style={styles.timelineItem}>
                <View style={[styles.timelineDot, { backgroundColor: Colors.teal }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.timelineAction}>{t.action}</Text>
                  <Text style={styles.timelineAt}>{new Date(t.at).toLocaleString()} · {t.by}</Text>
                </View>
              </View>
            ))}
          </Card>
        )}

        {/* Gate OTP — shown when approved_to_start */}
        {request.status === 'approved_to_start' && request.vendorGateOtp && (
          <Card style={{ borderColor: Colors.purple, borderWidth: 2 }}>
            <Text style={styles.detailLabel}>🔐 Gate Entry OTP</Text>
            <Text style={{ fontSize: 28, fontWeight: Fonts.extraBold, color: Colors.purple, letterSpacing: 6, marginTop: 4 }}>
              {request.vendorGateOtp}
            </Text>
            <Text style={[styles.detailLabel, { marginTop: 8 }]}>Show this OTP to the security guard to enter the community.</Text>
          </Card>
        )}

      </ScrollView>

      {/* Advance Stage footer — shown when in progress and NOT awaiting approval */}
      {request.status === 'work_in_progress' && !request.pendingStepApproval && (
        <View style={styles.footer}>
          <PrimaryButton
            title={`🏁 Mark "${WORK_STAGES[request.workStep || 0]}" Complete`}
            onPress={async () => {
              try {
                await vendorAdvanceStep(request.id);
                alert('✅ Stage marked as complete. Awaiting resident approval.');
              } catch (e) {
                console.error(e);
                alert('Error updating stage');
              }
            }}
            color={Colors.teal}
          />
        </View>
      )}

      {/* Awaiting Approval message */}
      {request.status === 'work_in_progress' && request.pendingStepApproval && (
        <View style={[styles.footer, { backgroundColor: Colors.amberLight }]}>
          <Text style={{ textAlign: 'center', color: Colors.amber, fontWeight: Fonts.bold }}>
            ⏳ Awaiting Resident Approval for Stage { (request.workStep || 0) }
          </Text>
        </View>
      )}

      {/* Send Quote footer — shown when admin has requested a quote OR legacy assigned */}
      {(request.status === 'quote_requested' || request.status === 'assigned') && (
        <View style={styles.footer}>
          <PrimaryButton
            title="📤 Submit Your Quote"
            onPress={() => navigation.navigate('SendQuote', { requestId: request.id })}
            color={Colors.purple}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: { padding: 16, paddingBottom: 100 },

  customerCard: { marginBottom: 10 },
  customerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  customerName: { fontSize: 17, fontWeight: Fonts.extraBold, color: Colors.text },
  customerLoc: { fontSize: 13, color: Colors.text2, marginTop: 2 },
  customerTime: { fontSize: 11, color: Colors.text3, marginTop: 3 },

  detailLabel: { fontSize: 12, fontWeight: Fonts.semiBold, color: Colors.text2, marginBottom: 5 },
  detailValue: { fontSize: 14, color: Colors.text, lineHeight: 20 },

  contactRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  contactBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 12, borderRadius: Radius.md },
  contactBtnText: { fontSize: 14, fontWeight: Fonts.bold },

  statusBadgeRow: { flexDirection: 'row', alignItems: 'center' },
  statusBadgeText: { fontSize: 14, fontWeight: Fonts.bold },

  timelineItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginTop: 12 },
  timelineDot: { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
  timelineAction: { fontSize: 13, fontWeight: '600', color: Colors.text },
  timelineAt: { fontSize: 11, color: Colors.text3, marginTop: 2 },

  footer: { padding: 16, backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.border },
});
