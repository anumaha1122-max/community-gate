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

export default function ActiveWorkScreen({ navigation, route }) {
  const theme = useTheme();
  const { jobId } = route?.params || {};
  const requests = useSharedStore(s => s.maintenanceRequests);
  const vendorRequestStepApproval = useSharedStore(s => s.vendorRequestStepApproval);
  const vendorRequestPayment = useSharedStore(s => s.vendorRequestPayment);

  // Always read fresh from store (not stale closure)
  const job = requests.find(r => r.id === jobId);

  if (!job) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
        <AppHeader title="Active Work" onBack={() => navigation.goBack()} />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: Colors.text2 }}>Job not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  // _workStep = number of stages APPROVED so far (0 = none yet, 12 = all done)
  const completedSteps = job._workStep || 0;
  const progress = Math.round((completedSteps / 12) * 100);
  const pendingApproval = job.pendingStepApproval === true;
  const pendingStepNum = job.pendingStep ?? completedSteps;
  const isWorkCompleted = job.status === 'work_completed';
  const isInProgress = job.status === 'work_in_progress';
  const currentStageName = WORK_STAGES[completedSteps] || `Stage ${completedSteps + 1}`;
  const pendingStageName = WORK_STAGES[pendingStepNum] || `Stage ${pendingStepNum + 1}`;

  const handleSubmitStage = () => {
    if (pendingApproval) return;
    Alert.alert(
      `Submit Stage ${completedSteps + 1} for Approval`,
      `Mark "${currentStageName}" as complete?\n\nAdmin and resident will be notified to approve before you can continue.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit for Approval',
          onPress: () => {
            vendorRequestStepApproval(jobId);
            Alert.alert('✅ Submitted!', `Stage ${completedSteps + 1} "${currentStageName}" submitted.\n\nWaiting for admin or resident to approve.`);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle={theme.mode === 'light' ? 'dark-content' : 'light-content'} backgroundColor={theme.header} />
      <View style={styles.activeHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.activeTitle}>Active Work</Text>
          <Text style={styles.activeSub}>{job.id} · {job.category}</Text>
        </View>
        <Badge label="In Progress" color={Colors.amber} bg={Colors.amberLight} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Job summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryCardInner}>
            <View style={{ flex: 1 }}>
              <Text style={styles.scName}>{job.residentName}</Text>
              <Text style={styles.scLoc}>Unit {job.unit}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.scAmtLabel}>Quote Amount</Text>
              <Text style={styles.scAmt}>{job.quote ? ('₹' + job.quote.amount) : '—'}</Text>
            </View>
          </View>
        </View>

        {/* Pending approval banner */}
        {pendingApproval && (
          <View style={styles.pendingBanner}>
            <Text style={styles.pendingIcon}>⏳</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.pendingTitle}>Waiting for Approval — Stage {pendingStepNum + 1}/12</Text>
              <Text style={styles.pendingSub}>"{pendingStageName}" submitted — admin or resident must approve before you can continue.</Text>
            </View>
          </View>
        )}

        {/* Ready to submit banner */}
        {isInProgress && !pendingApproval && completedSteps < 12 && (
          <View style={[styles.pendingBanner, { borderLeftColor: Colors.teal, backgroundColor: theme.surface }]}>
            <Text style={styles.pendingIcon}>🔧</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.pendingTitle, { color: Colors.purple }]}>
                {completedSteps === 0 ? 'Work Started — Submit Stage 1' : `Stage ${completedSteps} Approved — Submit Stage ${completedSteps + 1}`}
              </Text>
              <Text style={[styles.pendingSub, { color: Colors.purple }]}>
                Currently working on: "{currentStageName}" — tap Submit below when done.
              </Text>
            </View>
          </View>
        )}

        {/* Progress steps */}
        <Card>
          <View style={styles.progressHeaderRow}>
            <Text style={styles.progressTitle}>Work Progress</Text>
            <Text style={styles.progressCount}>{completedSteps}/12 stages</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: (progress + '%') }]} />
          </View>
          <View style={{ marginTop: 16 }}>
            {WORK_STAGES.map((stage, i) => (
              <ProgressStep
                key={i}
                number={i + 1}
                label={stage}
                status={
                  i < completedSteps ? 'done'
                    : pendingApproval && i === pendingStepNum ? 'active'
                      : i === completedSteps && !pendingApproval ? 'active'
                        : 'pending'
                }
                isLast={i === WORK_STAGES.length - 1}
              />
            ))}
          </View>
        </Card>

        {/* Action: submit current stage for approval */}
        {isInProgress && !pendingApproval && completedSteps < 12 && (
          <PrimaryButton
            title={`📋 Submit Stage ${completedSteps + 1} for Approval`}
            onPress={handleSubmitStage}
            color={Colors.purple}
          />
        )}

        {/* Waiting state */}
        {isInProgress && pendingApproval && (
          <View style={styles.waitingBtn}>
            <Text style={styles.waitingBtnText}>⏳ Awaiting Approval — Stage {pendingStepNum + 1} "{pendingStageName}"</Text>
          </View>
        )}

        {/* All 12 done — request payment */}
        {isWorkCompleted && (
          <PrimaryButton
            title="💰 Request Payment from Admin"
            onPress={() => {
              vendorRequestPayment(jobId);
              Alert.alert('✅ Requested!', 'Payment request sent to admin. They will collect from the resident and pay you.', [
                { text: 'OK', onPress: () => navigation.navigate('JobsList') },
              ]);
            }}
            color={Colors.green}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: { padding: 16, paddingBottom: 100 },

  // Active header
  activeHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#1A7A7A', paddingTop: 20, paddingBottom: 20, paddingHorizontal: 16,
  },
  backBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  backArrow: { fontSize: 22, color: '#FFF', marginTop: -2 },
  activeTitle: { fontSize: 18, fontWeight: Fonts.extraBold, color: '#FFF' },
  activeSub: { fontSize: 12, color: 'rgba(255,255,255,0.72)', marginTop: 2 },

  // Summary card
  summaryCard: { backgroundColor: Colors.tealLight, borderRadius: Radius.lg, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: Colors.teal + '30' },
  summaryCardInner: { flexDirection: 'row', alignItems: 'center' },
  scName: { fontSize: 16, fontWeight: Fonts.bold, color: Colors.text },
  scLoc: { fontSize: 13, color: Colors.text2, marginTop: 2 },
  scAmtLabel: { fontSize: 11, color: Colors.text2, marginBottom: 2 },
  scAmt: { fontSize: 18, fontWeight: Fonts.extraBold, color: Colors.purple },

  // Pending / ready banner
  pendingBanner: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: Colors.amberLight, borderRadius: Radius.md, padding: 14,
    marginBottom: 12, borderLeftWidth: 4, borderLeftColor: Colors.amber,
  },
  pendingIcon: { fontSize: 22 },
  pendingTitle: { fontSize: 13, fontWeight: Fonts.bold, color: Colors.amber, marginBottom: 2 },
  pendingSub: { fontSize: 12, color: Colors.text2, lineHeight: 18 },

  // Progress
  progressHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  progressTitle: { fontSize: 14, fontWeight: Fonts.bold, color: Colors.text },
  progressCount: { fontSize: 12, color: Colors.text2 },
  progressBarBg: { height: 8, backgroundColor: Colors.bg, borderRadius: 99, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: Colors.teal, borderRadius: 99 },

  // Waiting button placeholder
  waitingBtn: { margin: 16, padding: 16, borderRadius: Radius.md, backgroundColor: Colors.amberLight, alignItems: 'center' },
  waitingBtnText: { fontSize: 14, fontWeight: Fonts.bold, color: Colors.amber, textAlign: 'center' },
});