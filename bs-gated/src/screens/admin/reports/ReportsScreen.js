import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar,
} from 'react-native';
import useAdminStore from '../../../store/adminStore';
import useAppStore from '../../../store/appStore';
import { useSecurityStore } from '../../../store/securityStore';
import { COLORS, globalStyles } from '../../../components/common/theme';
import { useTheme } from '../../../hooks/useTheme';

const ProgressBar = ({ value, max, color }) => {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <View style={styles.barTrack}>
      <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: color }]} />
    </View>
  );
};

const StatRow = ({ label, value, color }) => (
  <View style={styles.statRow}>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
  </View>
);

export default function ReportsScreen({ navigation }) {
  const theme = useTheme();
  // Theme tokens
  const _bg = theme.background; // ensures theme reactive
  const [period, setPeriod] = useState('month');

  const residents       = useAdminStore((s) => s.residents);
  const billing         = useAdminStore((s) => s.billing);
  const expenses        = useAdminStore((s) => s.expenses);
  const amenityBookings = useAdminStore((s) => s.amenityBookings);
  const visitors        = useAdminStore((s) => s.visitors);
  const maintenanceRequests = useAppStore((s) => s.maintenanceRequests);
  const handoverLogs = useSecurityStore((s) => s.handoverLogs);

  // Collection stats
  const collected  = billing.filter(b => b.status === 'paid').reduce((s, b) => s + b.amount, 0);
  const dues       = billing.filter(b => b.status !== 'paid').reduce((s, b) => s + b.amount, 0);
  const totalBill  = collected + dues;
  const collectionPct = totalBill > 0 ? Math.round((collected / totalBill) * 100) : 0;
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const netSurplus = collected - totalExpenses;

  // Maintenance stats
  const totalMaint    = maintenanceRequests.length;
  const resolvedMaint = maintenanceRequests.filter(m => ['work_completed','paid_to_vendor'].includes(m.status)).length;
  const pendingMaint  = maintenanceRequests.filter(m => m.status === 'submitted').length;
  const categories    = maintenanceRequests.reduce((acc, m) => { acc[m.category] = (acc[m.category] || 0) + 1; return acc; }, {});

  // Visitor stats
  const totalVisitors = visitors.length;
  const insideNow     = visitors.filter(v => v.status === 'inside').length;

  // Amenity stats
  const confirmedBookings = amenityBookings.filter(b => b.status === 'confirmed').length;
  const pendingBookings   = amenityBookings.filter(b => b.status === 'pending').length;

  // Resident stats
  const activeRes  = residents.filter(r => r.active).length;
  const kycVerified = residents.filter(r => r.kycStatus === 'verified').length;

  return (
    <SafeAreaView style={globalStyles.screen}>
      <StatusBar barStyle="light-content" backgroundColor="#1A7A7A" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>📊 Reports</Text>
        <Text style={styles.headerSub}>Society analytics & exports</Text>
      </View>


      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Collection Report */}
        <View style={[globalStyles.card, styles.reportCard]}>
          <Text style={styles.reportTitle}>💰 Collection Report</Text>
          <View style={styles.bigStatRow}>
            <View style={styles.bigStat}>
              <Text style={[styles.bigStatVal, { color: COLORS.success }]}>₹{collected.toLocaleString()}</Text>
              <Text style={styles.bigStatLabel}>Collected</Text>
            </View>
            <View style={styles.bigStat}>
              <Text style={[styles.bigStatVal, { color: COLORS.danger }]}>₹{dues.toLocaleString()}</Text>
              <Text style={styles.bigStatLabel}>Pending</Text>
            </View>
            <View style={styles.bigStat}>
              <Text style={[styles.bigStatVal, { color: netSurplus >= 0 ? COLORS.success : COLORS.danger }]}>
                ₹{Math.abs(netSurplus).toLocaleString()}
              </Text>
              <Text style={styles.bigStatLabel}>{netSurplus >= 0 ? 'Net Surplus' : 'Net Deficit'}</Text>
            </View>
          </View>
          <View style={styles.collectionRate}>
            <Text style={styles.collectionLabel}>Collection Rate</Text>
            <Text style={[styles.collectionPct, { color: collectionPct >= 70 ? COLORS.success : COLORS.danger }]}>{collectionPct}%</Text>
          </View>
          <ProgressBar value={collected} max={totalBill} color={COLORS.success} />
          <StatRow label="Total Expenses" value={`₹${totalExpenses.toLocaleString()}`} color={COLORS.warning} />
        </View>

        {/* Maintenance Report */}
        <View style={[globalStyles.card, styles.reportCard]}>
          <Text style={styles.reportTitle}>🔧 Maintenance Report</Text>
          <View style={styles.bigStatRow}>
            <View style={styles.bigStat}>
              <Text style={[styles.bigStatVal, { color: COLORS.primary }]}>{totalMaint}</Text>
              <Text style={styles.bigStatLabel}>Total</Text>
            </View>
            <View style={styles.bigStat}>
              <Text style={[styles.bigStatVal, { color: COLORS.success }]}>{resolvedMaint}</Text>
              <Text style={styles.bigStatLabel}>Resolved</Text>
            </View>
            <View style={styles.bigStat}>
              <Text style={[styles.bigStatVal, { color: COLORS.danger }]}>{pendingMaint}</Text>
              <Text style={styles.bigStatLabel}>Pending</Text>
            </View>
          </View>
          <ProgressBar value={resolvedMaint} max={totalMaint} color={COLORS.success} />
          <Text style={styles.subTitle}>By Category</Text>
          {Object.entries(categories).map(([cat, count]) => (
            <View key={cat} style={styles.catRow}>
              <Text style={styles.catLabel}>{cat}</Text>
              <View style={styles.catBarRow}>
                <ProgressBar value={count} max={totalMaint} color={COLORS.primary} />
                <Text style={styles.catCount}>{count}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Resident Report */}
        <View style={[globalStyles.card, styles.reportCard]}>
          <Text style={styles.reportTitle}>👥 Resident Report</Text>
          <View style={styles.bigStatRow}>
            <View style={styles.bigStat}>
              <Text style={[styles.bigStatVal, { color: COLORS.primary }]}>{residents.length}</Text>
              <Text style={styles.bigStatLabel}>Total</Text>
            </View>
            <View style={styles.bigStat}>
              <Text style={[styles.bigStatVal, { color: COLORS.success }]}>{activeRes}</Text>
              <Text style={styles.bigStatLabel}>Active</Text>
            </View>
            <View style={styles.bigStat}>
              <Text style={[styles.bigStatVal, { color: COLORS.success }]}>{kycVerified}</Text>
              <Text style={styles.bigStatLabel}>KYC Verified</Text>
            </View>
          </View>
        </View>

        {/* Visitor Report */}
        <View style={[globalStyles.card, styles.reportCard]}>
          <Text style={styles.reportTitle}>🚶 Visitor Report</Text>
          <StatRow label="Total Visitors" value={totalVisitors}  color={COLORS.primary} />
          <StatRow label="Currently Inside" value={insideNow}   color={COLORS.success} />
          <StatRow label="Checked Out"  value={totalVisitors - insideNow} color={COLORS.textMuted} />
        </View>

        {/* Amenity Report */}
        <View style={[globalStyles.card, styles.reportCard]}>
          <Text style={styles.reportTitle}>🏊 Amenity Report</Text>
          <StatRow label="Total Bookings"  value={amenityBookings.length} color={COLORS.primary} />
          <StatRow label="Confirmed"       value={confirmedBookings}       color={COLORS.success} />
          <StatRow label="Pending Approval" value={pendingBookings}        color={COLORS.warning} />
        </View>

        {/* Guard Shift Handover Report */}
        <View style={[globalStyles.card, styles.reportCard]}>
          <Text style={styles.reportTitle}>🛡️ Guard Shift Handovers</Text>
          <View style={styles.bigStatRow}>
            <View style={styles.bigStat}>
              <Text style={[styles.bigStatVal, { color: COLORS.primary }]}>{handoverLogs.length}</Text>
              <Text style={styles.bigStatLabel}>Total</Text>
            </View>
            <View style={styles.bigStat}>
              <Text style={[styles.bigStatVal, { color: COLORS.success }]}>
                {handoverLogs.filter(h => {
                  const d = new Date(h.submittedAt || Date.now());
                  return d.toDateString() === new Date().toDateString();
                }).length}
              </Text>
              <Text style={styles.bigStatLabel}>Today</Text>
            </View>
          </View>
          {handoverLogs.slice(0, 3).map((h, i) => (
            <View key={h.id || i} style={[styles.statRow, { flexDirection: 'column', alignItems: 'flex-start', paddingVertical: 8 }]}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: COLORS.text, marginBottom: 2 }}>
                {h.outgoingGuard} → {h.incomingGuard} · {h.shiftTime}
              </Text>
              <Text style={{ fontSize: 12, color: COLORS.textMuted }}>
                {typeof h.submittedAt === 'string' && h.submittedAt.includes('T')
                  ? new Date(h.submittedAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
                  : h.submittedAt}
              </Text>
              {h.incidentNotes && h.incidentNotes !== 'No incident notes' && (
                <Text style={{ fontSize: 11, color: COLORS.warning, marginTop: 2 }}>⚠️ {h.incidentNotes}</Text>
              )}
            </View>
          ))}
          {handoverLogs.length === 0 && <Text style={{ color: COLORS.textMuted, fontSize: 13 }}>No handover logs yet.</Text>}
        </View>

        <View style={{ height: 16 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 16 },
  reportCard: { marginBottom: 14 },
  reportTitle: { fontSize: 16, fontWeight: '800', color: COLORS.text, marginBottom: 14 },
  bigStatRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 12 },
  bigStat: { alignItems: 'center' },
  bigStatVal: { fontSize: 22, fontWeight: '800' },
  bigStatLabel: { fontSize: 11, color: COLORS.textMuted, marginTop: 2, fontWeight: '600' },
  collectionRate: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  collectionLabel: { fontSize: 13, color: COLORS.textLight, fontWeight: '600' },
  collectionPct: { fontSize: 20, fontWeight: '800' },
  barTrack: { height: 8, backgroundColor: COLORS.border, borderRadius: 4, marginBottom: 12, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  statLabel: { fontSize: 13, color: COLORS.textMuted, fontWeight: '600' },
  statValue: { fontSize: 14, fontWeight: '800' },
  subTitle: { fontSize: 13, fontWeight: '700', color: COLORS.textLight, marginBottom: 8 },
  catRow: { marginBottom: 6 },
  catLabel: { fontSize: 12, color: COLORS.text, fontWeight: '600', marginBottom: 3 },
  catBarRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  catCount: { fontSize: 12, color: COLORS.textMuted, fontWeight: '700', width: 20 },
  header:      { backgroundColor: '#1A7A7A', paddingTop: 40, paddingBottom: 16, paddingHorizontal: 20 },
  backText:    { color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: '600', marginBottom: 8 },
  headerTitle: { fontSize: 22, fontWeight: '900', color: '#FFF', marginBottom: 2 },
  headerSub:   { fontSize: 12, color: 'rgba(255,255,255,0.72)', marginTop: 1 },
});
