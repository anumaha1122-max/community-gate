import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  SafeAreaView, StatusBar, Alert,
} from 'react-native';
import { useAuthStore } from '../../../store/AuthStore';
import useAdminStore from '../../../store/adminStore';
import PendingVerificationBanner from '../../../components/common/PendingVerificationBanner';

const P = {
  teal:'#1A7A7A', tealDeep:'#1A7A7A', tealSoft:'#E8F5F5', tealMid:'#D0EEEE',
  tealText:'#3D6E6E', bg:'#E8F5F5', surface:'#FFFFFF', text:'#1A2E2E',
  textMuted:'#7A9E9E', border:'#D0EEEE',
  danger:'#C62828', dangerBg:'#FEE2E2', warning:'#E65100',
};

function MenuRow({ icon, label, sub, onPress, color, badge }) {
  return (
    <TouchableOpacity style={s.menuRow} onPress={onPress} activeOpacity={0.8}>
      <View style={[s.menuIcon, { backgroundColor: (color || P.teal) + '18' }]}>
        <Text style={{ fontSize: 20 }}>{icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.menuLabel}>{label}</Text>
        {sub && <Text style={s.menuSub}>{sub}</Text>}
      </View>
      {badge != null && (
        <View style={s.badge}><Text style={s.badgeText}>{badge}</Text></View>
      )}
      <Text style={s.arrow}>›</Text>
    </TouchableOpacity>
  );
}

function SectionLabel({ title }) {
  return <Text style={s.sectionLabel}>{title.toUpperCase()}</Text>;
}

export default function AdminMoreScreen({ navigation }) {
  const logout       = useAuthStore(st => st.logout);
  const user         = useAuthStore(st => st.user);
  const blacklist    = useAdminStore(st => st.blacklist);
  const guards       = useAdminStore(st => st.guards);
  const notifications = useAdminStore(st => st.notifications);
  const unread       = notifications.filter(n => !n.read).length;

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <View style={s.root}>
      <SafeAreaView style={s.safeTop} />
      <StatusBar barStyle="light-content" backgroundColor={P.tealDeep} />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Text style={s.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>More</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView style={s.body} contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false}>

        {/* Profile card */}
        <View style={s.profileCard}>
          <View style={s.profileAvatar}>
            <Text style={s.profileAvatarText}>{user?.name?.charAt(0) || 'A'}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.profileName}>{user?.name || 'Admin'}</Text>
            <Text style={s.profileRole}>🛡️ Society Administrator</Text>
          </View>
          <View style={s.adminBadge}>
            <Text style={s.adminBadgeText}>Admin</Text>
          </View>
        </View>

        {/* Visitor & Security */}
        <SectionLabel title="Visitor & Security" />
        <View style={s.card}>
          <PendingVerificationBanner navigation={navigation} />

          <MenuRow icon="🪪" label="Profile Verification" sub="Upload docs for SuperAdmin approval" color="#1A7A7A" onPress={() => navigation.navigate('Verification')} />

          <MenuRow icon="📋" label="Visitor Logs"    sub="All entry/exit records"         color={P.teal}    onPress={() => navigation.navigate('VisitorLogs')} />
          <View style={s.divider} />
          <MenuRow icon="🚫" label="Blacklist"       sub={`${blacklist.length} persons`}   color={P.danger}  onPress={() => navigation.navigate('AdminBlacklist')} badge={blacklist.length > 0 ? blacklist.length : undefined} />
          <View style={s.divider} />
          <MenuRow icon="🛡️" label="Guard Management" sub={`${guards.length} guards assigned`} color={P.warning} onPress={() => navigation.navigate('GuardManagement')} />
          <View style={s.divider} />
          <MenuRow icon="👔" label="Staff Management" sub="All society staff"            color="#6A1B9A"   onPress={() => navigation.navigate('StaffManagement')} />
        </View>

        {/* Operations */}
        <SectionLabel title="Operations" />
        <View style={s.card}>
          <MenuRow icon="📢" label="Announcements"    sub="Post notices & events"          color={P.teal}    onPress={() => navigation.navigate('Announcements')} />
          <View style={s.divider} />
          <MenuRow icon="📋" label="Notice Board"     sub="Manage notices"                 color={P.teal}    onPress={() => navigation.navigate('AdminNoticeBoard')} />
          <View style={s.divider} />
          <MenuRow icon="🔩" label="AMC"              sub="Annual Maintenance Contracts"   color="#0D9488"   onPress={() => navigation.navigate('AMC')} />
          <View style={s.divider} />
          <MenuRow icon="✅" label="User Approvals"   sub="Pending registrations"          color={P.warning} onPress={() => navigation.navigate('UserApprovals')} />
        </View>

        {/* P2P / Real Estate */}
        <SectionLabel title="Marketplace" />
        <View style={s.card}>
          <MenuRow icon="♻️" label="P2P Approvals"    sub="Approve or reject listings"     color="#7C3AED"   onPress={() => navigation.navigate('P2PApproval')} />
          <View style={s.divider} />
          <MenuRow icon="🏠" label="Real Estate"      sub="Property listings admin"        color="#1565C0"   onPress={() => navigation.navigate('RealEstateAdmin')} />
          <View style={s.divider} />
          <MenuRow icon="🅿️" label="Visitor Parking"  sub="Parking admin panel"            color={P.teal}    onPress={() => navigation.navigate('VisitorParkingAdmin')} />
        </View>

        {/* Finance */}
        <SectionLabel title="Finance" />
        <View style={s.card}>
          <MenuRow icon="💸" label="Expenses"         sub="Track society expenses"         color={P.warning} onPress={() => navigation.navigate('AdminExpenses')} />
          <View style={s.divider} />
          <MenuRow icon="🧾" label="Generate Invoice" sub="Bulk invoice generation"        color={P.teal}    onPress={() => navigation.navigate('GenerateInvoice')} />
          <View style={s.divider} />
          <MenuRow icon="⚖️" label="Legal Notices"    sub="Day 11 · 30 · 45 overdue flow"  color="#D97706"   onPress={() => navigation.navigate('LegalNotices')} />
          <View style={s.divider} />
          <MenuRow icon="✅" label="Expense Approvals" sub="Tiered approval workflow"       color="#7C3AED"   onPress={() => navigation.navigate('ExpenseApprovals')} />
        </View>

        {/* Communication */}
        <SectionLabel title="Communication" />
        <View style={s.card}>
          <MenuRow icon="🔔" label="Notifications"   sub={unread > 0 ? `${unread} unread` : 'All caught up'} color="#0369A1" onPress={() => navigation.navigate('AdminNotifications')} badge={unread > 0 ? unread : undefined} />
        </View>

        {/* Analytics */}
        <SectionLabel title="Analytics" />
        <View style={s.card}>
          <MenuRow icon="📊" label="Reports & Analytics" sub="Collection, maintenance & usage" color="#00838F" onPress={() => navigation.navigate('Reports')} />
          <View style={s.divider} />
          <MenuRow icon="📈" label="Platform Activity"   sub="Admin actions & audit log"       color="#0D9488" onPress={() => navigation.navigate('AdminPlatformActivity')} />
        </View>

        {/* Settings */}
        <SectionLabel title="Settings & Configuration" />
        <View style={s.card}>
          <MenuRow icon="🏢" label="Society Configuration" sub="Name, contacts, GST, operating hours" color="#1A7A7A" onPress={() => navigation.navigate('SocietyConfig')} />
          <View style={s.divider} />
          <MenuRow icon="💳" label="Billing Configuration"  sub="Flat rates, late fees, billing cycle"  color="#1565C0" onPress={() => navigation.navigate('BillingConfig')} />
          <View style={s.divider} />
          <MenuRow icon="🔧" label="Vendor Management"      sub="Approved vendor directory & performance" color="#E8A020" onPress={() => navigation.navigate('VendorManagement')} />
          <View style={s.divider} />
          <MenuRow icon="📋" label="AMC / Contracts"         sub="Review & approve vendor AMC proposals"   color={P.teal}  onPress={() => navigation.navigate('AMCContracts')} />
          <View style={s.divider} />
          <MenuRow icon="⚙️" label="Module Toggles"         sub="Enable/disable app features"           color="#7C3AED" onPress={() => navigation.navigate('ModuleToggles')} />
          <View style={s.divider} />
          <MenuRow icon="📋" label="Audit Logs"             sub="All admin actions & activity log"       color="#0369A1" onPress={() => navigation.navigate('AuditLogs')} />
        </View>

        {/* Society info */}
        <SectionLabel title="Society" />
        <View style={s.card}>
          {[
            ['Society Name', 'BS Gated Community'],
            ['Registration No.', 'SOC-2024-001'],
            ['Total Flats', '120'],
            ['Admin Email', user?.email || 'admin@bs.com'],
          ].map(([label, value], i, arr) => (
            <View key={label}>
              <View style={s.infoRow}>
                <Text style={s.infoLabel}>{label}</Text>
                <Text style={s.infoValue}>{value}</Text>
              </View>
              {i < arr.length - 1 && <View style={s.divider} />}
            </View>
          ))}
        </View>

        {/* Profile */}
        <SectionLabel title="My Account" />
        <View style={s.card}>
          <MenuRow icon="👤" label="My Profile"   sub="Edit profile, settings, logout" color={P.teal} onPress={() => navigation.navigate('AdminProfile')} />
        </View>

        {/* Logout */}
        <TouchableOpacity style={s.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
          <Text style={s.logoutText}>🚪 Logout</Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:        { flex: 1, backgroundColor: P.tealDeep },
  safeTop:     { backgroundColor: P.tealDeep },
  header:      { backgroundColor: '#1A7A7A', paddingTop: 40, paddingBottom: 16, paddingHorizontal: 20 },
  backBtn:     { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  backText:    { color: '#FFF', fontSize: 28, fontWeight: '300', lineHeight: 32 },
  headerTitle: { flex: 1, color: '#FFF', fontSize: 17, fontWeight: '800', textAlign: 'center' },

  body:        { flex: 1, backgroundColor: P.bg },

  profileCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: P.surface, borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: P.border },
  profileAvatar:    { width: 54, height: 54, borderRadius: 27, backgroundColor: P.teal, alignItems: 'center', justifyContent: 'center' },
  profileAvatarText:{ fontSize: 24, fontWeight: '800', color: '#FFF' },
  profileName: { fontSize: 17, fontWeight: '800', color: P.text },
  profileRole: { fontSize: 13, color: P.textMuted, marginTop: 2 },
  adminBadge:  { backgroundColor: P.tealSoft, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  adminBadgeText: { color: P.teal, fontSize: 11, fontWeight: '700' },

  sectionLabel:{ fontSize: 11, fontWeight: '800', color: P.textMuted, marginBottom: 8, marginTop: 4, letterSpacing: 1 },
  card:        { backgroundColor: P.surface, borderRadius: 16, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: P.border },
  menuRow:     { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 11 },
  menuIcon:    { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  menuLabel:   { fontSize: 14, fontWeight: '700', color: P.text },
  menuSub:     { fontSize: 12, color: P.textMuted, marginTop: 1 },
  badge:       { backgroundColor: P.danger, borderRadius: 10, minWidth: 20, height: 20, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 },
  badgeText:   { color: '#FFF', fontSize: 11, fontWeight: '700' },
  arrow:       { fontSize: 20, color: P.tealMid, fontWeight: '300' },
  divider:     { height: 1, backgroundColor: P.border, marginLeft: 54 },

  infoRow:     { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 },
  infoLabel:   { fontSize: 13, color: P.textMuted, fontWeight: '600' },
  infoValue:   { fontSize: 13, color: P.text, fontWeight: '700' },

  logoutBtn:   { backgroundColor: P.dangerBg, borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 4, borderWidth: 1, borderColor: P.danger + '40' },
  logoutText:  { color: P.danger, fontSize: 15, fontWeight: '800' },
});