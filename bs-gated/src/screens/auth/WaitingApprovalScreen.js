/**
 * WaitingApprovalScreen.js
 *
 * Shown when a returning user tries to login and:
 *   - verificationStatus = 'not_submitted' (registered but never verified in profile)
 *   - verificationStatus = 'pending'       (docs submitted, waiting for admin)
 *
 * "Back to Login" navigates back to Login screen.
 */

import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, ScrollView,
} from 'react-native';
import { useAuthStore } from '../../store/AuthStore';

export default function WaitingApprovalScreen({ navigation, route }) {
  const logout = useAuthStore((s) => s.logout);

  const name               = route?.params?.name || 'User';
  const role               = route?.params?.role || 'user';
  const verificationStatus = route?.params?.verificationStatus || 'not_submitted';

  const isPending      = verificationStatus === 'pending' || verificationStatus === 'pending_approval';
  const isNotSubmitted = verificationStatus === 'not_submitted';

  const APPROVER_MAP = {
    admin: 'Super Admin', builder: 'Super Admin',
    resident: 'Admin', vendor: 'Admin', security: 'Admin', guard: 'Admin',
  };
  const approver = APPROVER_MAP[role?.toLowerCase()] || 'Admin';
  const roleLabel = role ? role.charAt(0).toUpperCase() + role.slice(1) : 'User';

  const handleBackToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#E8F5F5" />
      <ScrollView contentContainerStyle={s.container} showsVerticalScrollIndicator={false}>

        <Text style={s.icon}>{isPending ? '⏳' : '📋'}</Text>

        <Text style={s.title}>
          {isPending ? 'Waiting for Approval' : 'Verification Needed'}
        </Text>

        <Text style={s.sub}>
          Hi <Text style={s.name}>{name}</Text>!{' '}
          {isPending
            ? `Your ${roleLabel} account is pending approval.`
            : `Your ${roleLabel} account is registered but not yet verified.`
          }
        </Text>

        <View style={s.card}>
          {isPending ? (
            <>
              <Text style={s.cardTitle}>What happens next?</Text>
              {[
                { icon: '📋', text: `Your documents are under review by the ${approver}.` },
                { icon: '✅', text: 'Once approved, you can log in and access all features.' },
                { icon: '📲', text: 'You will be notified when your account is approved.' },
              ].map((item, i) => (
                <View key={i} style={s.stepRow}>
                  <Text style={s.stepIcon}>{item.icon}</Text>
                  <Text style={s.stepText}>{item.text}</Text>
                </View>
              ))}
            </>
          ) : (
            <>
              <Text style={s.cardTitle}>How to get started?</Text>
              {[
                { icon: '1️⃣', text: 'Go back to Login and sign in with your credentials.' },
                { icon: '2️⃣', text: 'Open the app → go to your Profile tab.' },
                { icon: '3️⃣', text: 'Tap "Verify Account" and upload your documents.' },
                { icon: '4️⃣', text: `The ${approver} will review and approve your account.` },
                { icon: '5️⃣', text: 'Once approved, all app features will unlock!' },
              ].map((item, i) => (
                <View key={i} style={s.stepRow}>
                  <Text style={s.stepIcon}>{item.icon}</Text>
                  <Text style={s.stepText}>{item.text}</Text>
                </View>
              ))}
            </>
          )}
        </View>

        {isPending && (
          <View style={s.pendingBadge}>
            <Text style={s.pendingBadgeText}>⏳ Under Review by {approver}</Text>
          </View>
        )}

        <TouchableOpacity style={s.btn} onPress={handleBackToLogin}>
          <Text style={s.btnText}>← Back to Login</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: '#E8F5F5' },
  container: { flexGrow: 1, alignItems: 'center', padding: 24, paddingTop: 48 },
  icon:      { fontSize: 64, marginBottom: 16 },
  title:     { fontSize: 26, fontWeight: '900', color: '#1A2E2E', marginBottom: 8, textAlign: 'center' },
  sub:       { fontSize: 15, textAlign: 'center', marginBottom: 24, lineHeight: 22, color: '#3D6E6E' },
  name:      { color: '#1A7A7A', fontWeight: '800' },

  card:      { width: '100%', borderRadius: 20, padding: 20, borderWidth: 1, marginBottom: 20, backgroundColor: '#FFFFFF', borderColor: '#D0EEEE' },
  cardTitle: { fontSize: 16, fontWeight: '800', marginBottom: 16, color: '#1A2E2E' },
  stepRow:   { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14 },
  stepIcon:  { fontSize: 18, marginRight: 12, marginTop: 1 },
  stepText:  { flex: 1, fontSize: 14, lineHeight: 21, color: '#3D6E6E' },

  pendingBadge:     { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE', borderWidth: 1, borderRadius: 20, paddingHorizontal: 20, paddingVertical: 10, marginBottom: 20 },
  pendingBadgeText: { color: '#1D4ED8', fontWeight: '800', fontSize: 14 },

  btn:     { width: '100%', paddingVertical: 15, borderRadius: 14, alignItems: 'center', backgroundColor: '#1A7A7A' },
  btnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 },
});
