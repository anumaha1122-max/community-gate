import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../../store/AuthStore';
import useAdminStore    from '../../../store/adminStore';

const P = {
  teal:'#1A7A7A', tealDark:'#0D6E6E', bg:'#E8F5F5',
  surface:'#FFF', text:'#1A2E2E', sub:'#3D6E6E', muted:'#7A9E9E',
  border:'#D0EEEE', danger:'#DC2626', dangerBg:'#FEE2E2',
};

const MENU = [
  { section:'⚙️ Settings', items:[
    { icon:'business-outline',     label:'Society Configuration', sub:'Name, address, rules',           screen:'SocietyConfig'   },
    { icon:'card-outline',         label:'Billing Configuration', sub:'Rates, late fees, invoice cycle',screen:'BillingConfig'   },
    { icon:'toggle-outline',       label:'Module Toggles',        sub:'Enable/disable features',        screen:'ModuleToggles'   },
    { icon:'people-outline',       label:'Vendor Management',     sub:'Approved vendor directory',      screen:'VendorManagement'},
    { icon:'document-text-outline',label:'AMC / Contracts',       sub:'Review vendor proposals',        screen:'AMCContracts'    },
  ]},
  { section:'🛡️ Security', items:[
    { icon:'shield-outline',       label:'Audit Logs',            sub:'All admin actions log',          screen:'AuditLogs'       },
    { icon:'person-add-outline',   label:'User Approvals',        sub:'Pending registrations',          screen:'UserApprovals'   },
  ]},
  { section:'📋 Society', items:[
    { icon:'people-circle-outline',label:'Residents',             sub:'Manage resident profiles',       screen:'ResidentList'    },
    { icon:'shield-checkmark-outline',label:'Guards',             sub:'Guard roster & attendance',      screen:'GuardManagement' },
    { icon:'people-outline',       label:'Staff Management',      sub:'Office & maintenance staff',     screen:'StaffManagement' },
  ]},
];

export default function AdminProfileScreen({ navigation }) {
  const user   = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);
  const societyConfig = useAdminStore(s => s.societyConfig);

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={P.tealDark} />
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#FFF" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Admin Profile</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={s.profileCard}>
          <View style={s.avatar}>
            <Text style={s.avatarText}>{(user?.name || 'A').charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={s.name}>{user?.name || 'Society Admin'}</Text>
          <View style={s.rolePill}><Text style={s.roleText}>🛡️ Society Administrator</Text></View>
          {user?.phone ? <Text style={s.detail}>📞 {user.phone}</Text> : null}
          {user?.email ? <Text style={s.detail}>✉️ {user.email}</Text> : null}
          {societyConfig?.name ? (
            <View style={s.societyBadge}>
              <Ionicons name="business-outline" size={14} color={P.teal} />
              <Text style={s.societyText}>{societyConfig.name}</Text>
            </View>
          ) : null}
        </View>

        {MENU.map(section => (
          <View key={section.section} style={s.menuSection}>
            <Text style={s.sectionTitle}>{section.section}</Text>
            <View style={s.menuCard}>
              {section.items.map((item, i) => (
                <TouchableOpacity key={item.screen}
                  style={[s.menuRow, i < section.items.length - 1 && s.menuBorder]}
                  onPress={() => navigation.navigate(item.screen)} activeOpacity={0.8}>
                  <View style={s.menuIcon}>
                    <Ionicons name={item.icon} size={20} color={P.teal} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.menuLabel}>{item.label}</Text>
                    <Text style={s.menuSub}>{item.sub}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={P.muted} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <TouchableOpacity style={s.logoutBtn}
          onPress={() => {
            const logoutNow = () => logout();
            Alert.alert('Logout', 'Log out?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Logout', style: 'destructive', onPress: logoutNow },
            ]);
            // Fallback for Web if Alert is silent
            if (Platform.OS === 'web') {
              if (confirm('Log out?')) logoutNow();
            }
          }}>
          <Ionicons name="log-out-outline" size={20} color={P.danger} />
          <Text style={s.logoutText}>Logout</Text>
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root:        { flex:1, backgroundColor:P.bg },
  header:      { backgroundColor:P.tealDark, paddingTop:16, paddingBottom:20, paddingHorizontal:20, flexDirection:'row', alignItems:'center', gap:14 },
  backBtn:     { width:38, height:38, borderRadius:19, backgroundColor:'rgba(255,255,255,0.15)', alignItems:'center', justifyContent:'center' },
  headerTitle: { color:'#FFF', fontSize:18, fontWeight:'900' },
  profileCard: { backgroundColor:P.surface, margin:16, borderRadius:18, padding:24, alignItems:'center', borderWidth:1, borderColor:P.border, elevation:2 },
  avatar:      { width:76, height:76, borderRadius:38, backgroundColor:P.teal, alignItems:'center', justifyContent:'center', marginBottom:12 },
  avatarText:  { fontSize:30, fontWeight:'900', color:'#FFF' },
  name:        { fontSize:20, fontWeight:'900', color:P.text, marginBottom:8 },
  rolePill:    { backgroundColor:P.bg, borderRadius:20, paddingHorizontal:14, paddingVertical:6, borderWidth:1, borderColor:P.border, marginBottom:8 },
  roleText:    { fontSize:13, fontWeight:'700', color:P.teal },
  detail:      { fontSize:13, color:P.muted, marginBottom:4 },
  societyBadge:{ flexDirection:'row', alignItems:'center', gap:6, marginTop:8, backgroundColor:P.bg, borderRadius:20, paddingHorizontal:14, paddingVertical:6 },
  societyText: { fontSize:13, color:P.teal, fontWeight:'700' },
  menuSection: { paddingHorizontal:16, marginBottom:12 },
  sectionTitle:{ fontSize:12, fontWeight:'800', color:P.muted, marginBottom:8, textTransform:'uppercase', letterSpacing:0.8 },
  menuCard:    { backgroundColor:P.surface, borderRadius:16, borderWidth:1, borderColor:P.border, overflow:'hidden' },
  menuRow:     { flexDirection:'row', alignItems:'center', padding:16, gap:12 },
  menuBorder:  { borderBottomWidth:1, borderBottomColor:P.border },
  menuIcon:    { width:38, height:38, borderRadius:10, backgroundColor:P.bg, alignItems:'center', justifyContent:'center' },
  menuLabel:   { fontSize:14, fontWeight:'700', color:P.text },
  menuSub:     { fontSize:12, color:P.muted, marginTop:2 },
  logoutBtn:   { flexDirection:'row', alignItems:'center', justifyContent:'center', gap:10, marginHorizontal:16, backgroundColor:P.dangerBg, borderRadius:14, padding:16, borderWidth:1, borderColor:P.danger+'30', marginTop:4 },
  logoutText:  { fontSize:15, fontWeight:'800', color:P.danger },
});
