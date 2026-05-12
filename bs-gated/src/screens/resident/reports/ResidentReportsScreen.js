/**
 * ResidentReportsScreen.js — Module 13: Reports & Analytics
 *
 * Resident's personal reports dashboard.
 * Sections:
 *  1. Security — visitor log, delivery log, entry history
 *  2. Billing  — payment history, outstanding dues, collection efficiency
 *  3. Amenities — bookings, usage, no-shows
 *  4. Maintenance — open vs closed, avg resolution time
 *  5. GPS — maid tracking summary
 *
 * All data from existing stores — no new backend needed.
 * Share/export via text for each section.
 * Theme: VisitorListScreen tokens.
 */

import React, { useState, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar,
  ScrollView, Alert, Share,
} from 'react-native';
import { useAuthStore }     from '../../../store/AuthStore';
import { useSecurityStore } from '../../../store/securityStore';
import useResidentStore     from '../../../store/residentStore';
import useAppStore          from '../../../store/appStore';

const V = {
  header:'#1A7A7A', headerDark:'#0D6E6E',
  bg:'#E8F5F5', surface:'#FFFFFF',
  border:'#D0EEEE', divider:'#E8F5F5',
  text:'#1A2E2E', textSub:'#3D6E6E', textMuted:'#7A9E9E',
  primary:'#1A7A7A', chip:'#E8F5F5',
  danger:'#C62828', dangerBg:'#FEE2E2',
  warning:'#E65100', warningBg:'#FEF3C7',
  successBg:'#CCFBF1',
};

function fmt(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'});
}
function fmtTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-IN',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'});
}
function avgDays(items, startField, endField) {
  const completed = items.filter(i => i[startField] && i[endField]);
  if (!completed.length) return null;
  const avg = completed.reduce((s,i) => s + (new Date(i[endField]) - new Date(i[startField])),0) / completed.length;
  return Math.round(avg / 86400000);
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ emoji, value, label, color, sub }) {
  return (
    <View style={[sc.card, { borderLeftColor: color || V.primary }]}>
      <Text style={sc.emoji}>{emoji}</Text>
      <Text style={[sc.value, { color: color || V.primary }]}>{value}</Text>
      <Text style={sc.label}>{label}</Text>
      {sub ? <Text style={sc.sub}>{sub}</Text> : null}
    </View>
  );
}
const sc = StyleSheet.create({
  card:  { flex:1, backgroundColor:V.surface, borderRadius:12, padding:12, borderWidth:1, borderColor:V.border, borderLeftWidth:4, alignItems:'center', minWidth:'45%' },
  emoji: { fontSize:22, marginBottom:4 },
  value: { fontSize:22, fontWeight:'900' },
  label: { fontSize:11, fontWeight:'700', color:V.textMuted, marginTop:2, textAlign:'center' },
  sub:   { fontSize:10, color:V.textMuted, marginTop:2, textAlign:'center' },
});

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({ title, emoji, onExport, children }) {
  const [open, setOpen] = useState(true);
  return (
    <View style={s.section}>
      <TouchableOpacity style={s.sectionHeader} onPress={() => setOpen(x => !x)} activeOpacity={0.8}>
        <Text style={s.sectionTitle}>{emoji} {title}</Text>
        <View style={{flexDirection:'row', gap:10, alignItems:'center'}}>
          {onExport && open && (
            <TouchableOpacity style={s.exportBtn} onPress={onExport} hitSlop={{top:8,bottom:8,left:8,right:8}}>
              <Text style={s.exportText}>📤 Export</Text>
            </TouchableOpacity>
          )}
          <Text style={[s.chevron, {transform:[{rotate: open?'90deg':'0deg'}]}]}>›</Text>
        </View>
      </TouchableOpacity>
      {open && <View style={s.sectionBody}>{children}</View>}
    </View>
  );
}

// ─── Mini table row ───────────────────────────────────────────────────────────
function Row({ label, value, valueColor, last }) {
  return (
    <View style={[s.row, !last && s.rowBorder]}>
      <Text style={s.rowLabel}>{label}</Text>
      <Text style={[s.rowValue, valueColor && {color:valueColor}]}>{value}</Text>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function ResidentReportsScreen({ navigation }) {
  const user     = useAuthStore(s => s.user);
  const myId     = user?.id || 'res1';
  const myUnit   = user?.unit || 'A-101';
  const society  = useResidentStore(s => s.society);

  // Data sources
  const visitors      = useSecurityStore(s => s.visitors).filter(v => v.hostResidentId===myId);
  const deliveries    = useSecurityStore(s => s.deliveries).filter(d => d.hostResidentId===myId);
  const sosAlerts     = useSecurityStore(s => s.sosAlerts).filter(a => a.residentId===myId);
  const bills         = useResidentStore(s => s.bills).filter(b => b.residentId===myId);
  const amenityBks    = useResidentStore(s => s.amenityBookings).filter(b => b.residentId===myId);
  const evBks         = useResidentStore(s => s.evBookings).filter(b => b.residentId===myId);
  const maintenance   = useAppStore(s => s.maintenanceRequests).filter(r => r.residentId===myId);

  // ── Security stats ──────────────────────────────────────────────────────────
  const secStats = useMemo(() => ({
    totalVisitors:    visitors.length,
    activeVisitors:   visitors.filter(v => v.status==='CHECKED_IN').length,
    deniedVisitors:   visitors.filter(v => v.status==='DENIED').length,
    totalDeliveries:  deliveries.length,
    pendingDeliveries:deliveries.filter(d => d.status==='PENDING').length,
    deliveredCount:   deliveries.filter(d => d.status==='DELIVERED').length,
    sosCount:         sosAlerts.length,
    resolvedSOS:      sosAlerts.filter(a => a.status==='RESOLVED').length,
  }), [visitors, deliveries, sosAlerts]);

  // ── Billing stats ───────────────────────────────────────────────────────────
  const billStats = useMemo(() => {
    const paid   = bills.filter(b => b.status==='paid');
    const unpaid = bills.filter(b => b.status==='unpaid');
    const overdue= unpaid.filter(b => new Date(b.dueDate) < new Date());
    return {
      totalBills:  bills.length,
      paidCount:   paid.length,
      unpaidCount: unpaid.length,
      overdueCount:overdue.length,
      totalPaid:   paid.reduce((s,b) => s+(b.total||0),0),
      totalDue:    unpaid.reduce((s,b) => s+(b.total||0),0),
      collectionRate: bills.length ? Math.round(paid.length/bills.length*100) : 100,
    };
  }, [bills]);

  // ── Amenity stats ───────────────────────────────────────────────────────────
  const amenityStats = useMemo(() => {
    const confirmed = amenityBks.filter(b => b.status==='confirmed');
    const cancelled = amenityBks.filter(b => b.status==='cancelled');
    const noshow    = amenityBks.filter(b => b.status==='no_show');
    const paidAmt   = amenityBks.filter(b => b.paymentStatus==='paid').reduce((s,b)=>s+(b.amount||0),0);
    return { total:amenityBks.length, confirmed:confirmed.length, cancelled:cancelled.length, noshow:noshow.length, spent:paidAmt };
  }, [amenityBks]);

  // ── Maintenance stats ────────────────────────────────────────────────────────
  const maintStats = useMemo(() => {
    const open   = maintenance.filter(r => !['paid_to_vendor','quote_rejected'].includes(r.status));
    const closed = maintenance.filter(r => ['paid_to_vendor'].includes(r.status));
    const avg    = avgDays(closed, 'createdAt', 'paidAt');
    return { total:maintenance.length, open:open.length, closed:closed.length, avgDays:avg };
  }, [maintenance]);

  // ── Export helpers ───────────────────────────────────────────────────────────
  const exportSecurity = async () => {
    const lines = [
      `SECURITY REPORT — Unit ${myUnit}`,
      `Generated: ${new Date().toLocaleDateString('en-IN')}`,
      `Society: ${society?.name || 'BS Gated Community'}`,
      `─────────────────────────────`,
      `VISITORS`,
      `Total: ${secStats.totalVisitors}`,
      `Currently Inside: ${secStats.activeVisitors}`,
      `Denied Entry: ${secStats.deniedVisitors}`,
      ``,
      `DELIVERIES`,
      `Total Passes: ${secStats.totalDeliveries}`,
      `Pending: ${secStats.pendingDeliveries}`,
      `Delivered: ${secStats.deliveredCount}`,
      ``,
      `VISITOR LOG (Last 5)`,
      ...visitors.slice(0,5).map(v => `${v.name} · ${v.purpose} · ${v.status} · ${fmt(v.createdAt)}`),
    ];
    try { await Share.share({ message: lines.join('\n'), title: 'Security Report' }); }
    catch(e) { Alert.alert('Export failed'); }
  };

  const exportBilling = async () => {
    const lines = [
      `BILLING REPORT — Unit ${myUnit}`,
      `Generated: ${new Date().toLocaleDateString('en-IN')}`,
      `─────────────────────────────`,
      `Total Bills: ${billStats.totalBills}`,
      `Paid: ${billStats.paidCount} (₹${billStats.totalPaid.toLocaleString('en-IN')})`,
      `Unpaid: ${billStats.unpaidCount} (₹${billStats.totalDue.toLocaleString('en-IN')})`,
      `Overdue: ${billStats.overdueCount}`,
      `Collection Rate: ${billStats.collectionRate}%`,
      ``,
      `PAYMENT HISTORY (Last 5)`,
      ...bills.filter(b=>b.status==='paid').slice(0,5).map(b => `${b.month||b.id} · ₹${b.total||0} · Paid ${fmt(b.paidAt)}`),
    ];
    try { await Share.share({ message: lines.join('\n'), title: 'Billing Report' }); }
    catch(e) { Alert.alert('Export failed'); }
  };

  const exportAmenities = async () => {
    const lines = [
      `AMENITY REPORT — Unit ${myUnit}`,
      `Generated: ${new Date().toLocaleDateString('en-IN')}`,
      `─────────────────────────────`,
      `Total Bookings: ${amenityStats.total}`,
      `Confirmed: ${amenityStats.confirmed}`,
      `Cancelled: ${amenityStats.cancelled}`,
      `No-shows: ${amenityStats.noshow}`,
      `Total Spent: ₹${amenityStats.spent.toLocaleString('en-IN')}`,
      ``,
      `BOOKING HISTORY (Last 5)`,
      ...amenityBks.slice(0,5).map(b => `${b.amenityName} · ${b.date} · ${b.slot} · ${b.status}`),
    ];
    try { await Share.share({ message: lines.join('\n'), title: 'Amenity Report' }); }
    catch(e) { Alert.alert('Export failed'); }
  };

  const exportMaintenance = async () => {
    const lines = [
      `MAINTENANCE REPORT — Unit ${myUnit}`,
      `Generated: ${new Date().toLocaleDateString('en-IN')}`,
      `─────────────────────────────`,
      `Total Requests: ${maintStats.total}`,
      `Open: ${maintStats.open}`,
      `Closed/Paid: ${maintStats.closed}`,
      `Avg Resolution: ${maintStats.avgDays !== null ? `${maintStats.avgDays} days` : 'N/A'}`,
      ``,
      `REQUEST LOG`,
      ...maintenance.slice(0,5).map(r => `${r.title||r.category} · ${r.status} · ${fmt(r.createdAt)}`),
    ];
    try { await Share.share({ message: lines.join('\n'), title: 'Maintenance Report' }); }
    catch(e) { Alert.alert('Export failed'); }
  };

  return (
    <SafeAreaView style={s.screen}>
      <StatusBar barStyle="light-content" backgroundColor={V.headerDark}/>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()} style={s.backBtn}>
          <Text style={s.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={s.headerRow}>
          <View style={{flex:1}}>
            <Text style={s.headerTitle}>My Reports</Text>
            <Text style={s.headerSub}>Unit {myUnit} · {society?.name || 'BS Gated Community'}</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.body} showsVerticalScrollIndicator={false}>

        {/* ── SECURITY ── */}
        <Section title="Security" emoji="🛡️" onExport={exportSecurity}>
          <View style={s.statGrid}>
            <StatCard emoji="👥" value={secStats.totalVisitors} label="Total Visitors" color={V.primary}/>
            <StatCard emoji="🚶" value={secStats.activeVisitors} label="Currently Inside" color="#1565C0"/>
          </View>
          <View style={[s.statGrid,{marginTop:10}]}>
            <StatCard emoji="📦" value={secStats.totalDeliveries} label="Deliveries" color="#F57F17"/>
            <StatCard emoji="🚨" value={secStats.sosCount} label="SOS Alerts" color={V.danger} sub={`${secStats.resolvedSOS} resolved`}/>
          </View>
          <Text style={s.subLabel}>RECENT VISITORS</Text>
          <View style={s.tableCard}>
            {visitors.length === 0 ? (
              <Text style={s.emptyRow}>No visitors yet</Text>
            ) : visitors.slice(0,5).map((v,i) => (
              <Row key={v.id} label={v.name} value={v.status} last={i===Math.min(visitors.length,5)-1}
                valueColor={v.status==='CHECKED_IN'?V.primary:v.status==='DENIED'?V.danger:V.textMuted}/>
            ))}
          </View>
        </Section>

        {/* ── BILLING ── */}
        <Section title="Billing" emoji="💳" onExport={exportBilling}>
          <View style={s.statGrid}>
            <StatCard emoji="✅" value={`${billStats.collectionRate}%`} label="Collection Rate" color={V.primary}/>
            <StatCard emoji="⚠️" value={`₹${(billStats.totalDue/1000).toFixed(0)}K`} label="Outstanding" color={V.danger} sub={`${billStats.unpaidCount} bills`}/>
          </View>
          <View style={[s.statGrid,{marginTop:10}]}>
            <StatCard emoji="💰" value={`₹${(billStats.totalPaid/1000).toFixed(0)}K`} label="Total Paid" color="#2E7D32"/>
            <StatCard emoji="🔴" value={billStats.overdueCount} label="Overdue Bills" color={V.warning}/>
          </View>
          <Text style={s.subLabel}>PAYMENT HISTORY</Text>
          <View style={s.tableCard}>
            {bills.filter(b=>b.status==='paid').length === 0 ? (
              <Text style={s.emptyRow}>No payments yet</Text>
            ) : bills.filter(b=>b.status==='paid').slice(0,5).map((b,i,arr) => (
              <Row key={b.id} label={b.month||`Invoice ${b.id}`}
                value={`₹${(b.total||0).toLocaleString('en-IN')}`}
                valueColor={V.primary} last={i===arr.length-1}/>
            ))}
          </View>
        </Section>

        {/* ── AMENITIES ── */}
        <Section title="Amenities" emoji="🏊" onExport={exportAmenities}>
          <View style={s.statGrid}>
            <StatCard emoji="📅" value={amenityStats.total} label="Total Bookings" color={V.primary}/>
            <StatCard emoji="✅" value={amenityStats.confirmed} label="Confirmed" color="#2E7D32"/>
          </View>
          <View style={[s.statGrid,{marginTop:10}]}>
            <StatCard emoji="❌" value={amenityStats.cancelled} label="Cancelled" color={V.warning}/>
            <StatCard emoji="💸" value={`₹${amenityStats.spent.toLocaleString('en-IN')}`} label="Total Spent" color={V.primary}/>
          </View>
          <Text style={s.subLabel}>RECENT BOOKINGS</Text>
          <View style={s.tableCard}>
            {amenityBks.length === 0 ? (
              <Text style={s.emptyRow}>No bookings yet</Text>
            ) : amenityBks.slice(0,5).map((b,i,arr) => (
              <Row key={b.id} label={`${b.amenityEmoji||'🏛️'} ${b.amenityName}`}
                value={b.status} last={i===arr.length-1}
                valueColor={b.status==='confirmed'?V.primary:b.status==='cancelled'?V.danger:V.textMuted}/>
            ))}
          </View>
        </Section>

        {/* ── MAINTENANCE ── */}
        <Section title="Maintenance" emoji="🔧" onExport={exportMaintenance}>
          <View style={s.statGrid}>
            <StatCard emoji="📋" value={maintStats.total} label="Total Requests" color={V.primary}/>
            <StatCard emoji="🔄" value={maintStats.open} label="Open" color={V.warning}/>
          </View>
          <View style={[s.statGrid,{marginTop:10}]}>
            <StatCard emoji="✅" value={maintStats.closed} label="Resolved" color="#2E7D32"/>
            <StatCard emoji="⏱️" value={maintStats.avgDays!==null?`${maintStats.avgDays}d`:'—'} label="Avg Resolution" color={V.textSub}/>
          </View>
          <Text style={s.subLabel}>OPEN REQUESTS</Text>
          <View style={s.tableCard}>
            {maintenance.filter(r=>!['paid_to_vendor'].includes(r.status)).length === 0 ? (
              <Text style={s.emptyRow}>No open requests</Text>
            ) : maintenance.filter(r=>!['paid_to_vendor'].includes(r.status)).slice(0,5).map((r,i,arr) => (
              <Row key={r.id} label={r.title||r.category||'Request'}
                value={r.status?.replace(/_/g,' ')} last={i===arr.length-1}
                valueColor={V.warning}/>
            ))}
          </View>
        </Section>

        {/* Quick links */}
        <Text style={s.sectionLabelOuter}>DETAILED REPORTS</Text>
        <View style={s.quickGrid}>
          {[
            {label:'Activity Log',   emoji:'📋', route:'ResidentActivitySpending'},
            {label:'Spending',       emoji:'💰', route:'ResidentSpendings'},
            {label:'Visitor History',emoji:'👥', route:'VisitorList'},
            {label:'Bill History',   emoji:'💳', route:'BillingList'},
          ].map(l => (
            <TouchableOpacity key={l.label} style={s.quickBtn}
              onPress={() => navigation?.navigate(l.route)}>
              <Text style={{fontSize:24}}>{l.emoji}</Text>
              <Text style={s.quickText}>{l.label}</Text>
              <Text style={{fontSize:12,color:V.textMuted}}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{height:40}}/>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen:{ flex:1, backgroundColor:V.bg },
  header:{ backgroundColor:V.header, paddingTop:40, paddingBottom:16, paddingHorizontal:20 },
  backText:{ color:'rgba(255,255,255,0.85)', fontSize:14, fontWeight:'600', marginBottom:8 },
  headerRow:{ flexDirection:'row', alignItems:'center' },
  headerTitle:{ fontSize:22, fontWeight:'800', color:'#FFF' },
  headerSub:{ fontSize:12, color:'rgba(255,255,255,0.7)', marginTop:2 },
  body:{ padding:16 },
  section:{ backgroundColor:V.surface, borderRadius:16, borderWidth:1, borderColor:V.border, marginBottom:12, overflow:'hidden' },
  sectionHeader:{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', padding:16, borderBottomWidth:1, borderBottomColor:V.divider },
  sectionTitle:{ fontSize:15, fontWeight:'800', color:V.text },
  chevron:{ fontSize:20, color:V.textMuted },
  exportBtn:{ backgroundColor:V.chip, paddingHorizontal:12, paddingVertical:5, borderRadius:20, borderWidth:1, borderColor:V.border },
  exportText:{ fontSize:12, fontWeight:'700', color:V.primary },
  sectionBody:{ padding:14 },
  statGrid:{ flexDirection:'row', gap:10 },
  subLabel:{ fontSize:10, fontWeight:'800', color:V.textMuted, letterSpacing:1, marginTop:14, marginBottom:8 },
  tableCard:{ backgroundColor:V.chip, borderRadius:12, borderWidth:1, borderColor:V.border, overflow:'hidden' },
  row:{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingVertical:10, paddingHorizontal:12 },
  rowBorder:{ borderBottomWidth:1, borderBottomColor:V.divider },
  rowLabel:{ fontSize:13, color:V.text, fontWeight:'600', flex:1 },
  rowValue:{ fontSize:13, fontWeight:'700', color:V.textMuted, textAlign:'right' },
  emptyRow:{ padding:16, textAlign:'center', color:V.textMuted, fontSize:13 },
  sectionLabelOuter:{ fontSize:11, fontWeight:'800', color:V.textMuted, letterSpacing:1, marginBottom:10, marginTop:4 },
  quickGrid:{ flexDirection:'row', flexWrap:'wrap', gap:10 },
  quickBtn:{ width:'47%', backgroundColor:V.surface, borderRadius:14, padding:14, flexDirection:'row', alignItems:'center', gap:10, borderWidth:1, borderColor:V.border },
  quickText:{ flex:1, fontSize:13, fontWeight:'700', color:V.text },
});