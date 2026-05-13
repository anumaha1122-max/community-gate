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
  const isWorkCompleted = job.status === 'work_completed';
  const isInProgress = job.status === 'work_in_progress';
  const isAwaitingArrival = isInProgress && pendingApproval && (job._workStep === 0 || !job._workStep);
  const isAwaitingCompletion = isInProgress && pendingApproval && job._workStep === 12;
  const isWorking = isInProgress && !pendingApproval;
  const currentStageName = isWorkCompleted ? 'Work Completed' : (isAwaitingArrival ? 'Arrival Pending' : 'In Progress');

  const handleMarkComplete = () => {
    Alert.alert(
      'Mark Work as Completed',
      'Are you sure you have finished all work for this request?\n\nThe resident and admin will be notified for final approval and payment.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Completed',
          onPress: async () => {
            await vendorMarkWorkComplete(jobId);
            Alert.alert('✅ Done!', 'Work marked as completed. Waiting for final approval.');
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
          <Text style={styles.activeTitle}>Maintenance Work</Text>
          <Text style={styles.activeSub}>{job.id} · {job.category}</Text>
        </View>
        <Badge 
          label={isWorkCompleted ? 'Completed' : 'In Progress'} 
          color={isWorkCompleted ? Colors.green : Colors.amber} 
          bg={isWorkCompleted ? Colors.greenLight : Colors.amberLight} 
        />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Job summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryCardInner}>
            <View style={{ flex: 1 }}>
              <Text style={styles.scName}>{job.residentName}</Text>
              <Text style={styles.scLoc}>Unit {job.unit}</Text>
              <Text style={[styles.scLoc, { marginTop: 4, color: Colors.text }]}>{job.title}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.scAmtLabel}>Quote Amount</Text>
              <Text style={styles.scAmt}>{job.quote ? ('₹' + job.quote.amount) : '—'}</Text>
            </View>
          </View>
        </View>

        {/* Status Section */}
        <Card>
          <Text style={styles.progressTitle}>Work Status</Text>
          <Divider marginVertical={12} />
          
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, { backgroundColor: isInProgress ? Colors.amber : Colors.green }]} />
            <Text style={styles.statusText}>
              {isInProgress ? 'Vendor is currently performing the requested maintenance.' : 'Maintenance work has been completed.'}
            </Text>
          </View>

          {!isWorkCompleted && !pendingApproval && (
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                💡 Once you finish the work, tap the button below to notify the resident and admin.
              </Text>
            </View>
          )}

          {/* Pending start approval (Arrival) */}
          {isAwaitingArrival && (
            <View style={[styles.infoBox, { backgroundColor: Colors.amberLight, borderColor: Colors.amber, borderWidth: 1 }]}>
              <Text style={[styles.infoText, { color: Colors.amber, fontWeight: '700' }]}>
                ⏳ Waiting for Resident to confirm your arrival...
              </Text>
              <Text style={[styles.infoText, { marginTop: 4 }]}>
                You have entered the gate. Please wait for the resident to acknowledge you are at their unit before starting work.
              </Text>
            </View>
          )}

          {/* Pending work completion approval */}
          {isAwaitingCompletion && (
            <View style={[styles.infoBox, { backgroundColor: Colors.amberLight, borderColor: Colors.amber, borderWidth: 1 }]}>
              <Text style={[styles.infoText, { color: Colors.amber, fontWeight: '700' }]}>
                ⏳ Waiting for Final Approval...
              </Text>
              <Text style={[styles.infoText, { marginTop: 4 }]}>
                You have marked the work as finished. The resident and admin are reviewing it. Once approved, the job will be marked as completed.
              </Text>
            </View>
          )}
        </Card>

        {/* Action: Mark as completed */}
        {isWorking && (
          <PrimaryButton
            title="🏁 Mark Work as Completed"
            onPress={handleMarkComplete}
            color={Colors.teal}
            style={{ marginTop: 24 }}
          />
        )}

        {/* All done — request payment */}
        {isWorkCompleted && !pendingApproval && (
          <View style={{ marginTop: 10 }}>
            <View style={styles.successBox}>
              <Text style={styles.successText}>✅ Work Completed!</Text>
              <Text style={styles.successSub}>Now you can request the final payment from the admin.</Text>
            </View>
            <PrimaryButton
              title="💰 Request Payment"
              onPress={() => {
                vendorRequestPayment(jobId);
                Alert.alert('✅ Requested!', 'Payment request sent to admin.', [
                  { text: 'OK', onPress: () => navigation.navigate('JobsList') },
                ]);
              }}
              color={Colors.green}
            />
          </View>
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

  progressTitle: { fontSize: 15, fontWeight: Fonts.bold, color: Colors.text },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  statusText: { flex: 1, fontSize: 14, color: Colors.text, lineHeight: 20 },
  
  infoBox: { backgroundColor: Colors.bg, padding: 12, borderRadius: Radius.md, marginTop: 16 },
  infoText: { fontSize: 13, color: Colors.text2, fontStyle: 'italic' },
  
  successBox: { backgroundColor: Colors.greenLight, padding: 16, borderRadius: Radius.lg, marginBottom: 16, alignItems: 'center', borderWidth: 1, borderColor: Colors.green + '20' },
  successText: { fontSize: 16, fontWeight: Fonts.extraBold, color: Colors.green },
  successSub: { fontSize: 13, color: Colors.green, textAlign: 'center', marginTop: 4 },
});