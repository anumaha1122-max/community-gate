/**
 * VerifyLockScreen.js
 *
 * Full-screen overlay shown when user tries to access a locked tab
 * before their account is verified/approved.
 *
 * Usage: Wrap any screen's content with this component.
 * If verificationStatus !== 'approved', shows lock message instead.
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuthStore } from '../../store/AuthStore';

export default function VerifyLockScreen({ navigation, children }) {
  // Read live verificationStatus from registeredUsers (updates instantly on approval)
  const verificationStatus = useAuthStore(s => {
    const live = s.registeredUsers.find(u => u.id === s.user?.id);
    return live?.verificationStatus || s.user?.verificationStatus || 'not_submitted';
  });
  const role = useAuthStore(s => s.user?.role);

  // SuperAdmin and Customer never need verification
  if (role === 'superadmin' || role === 'customer') return children;

  // Approved — show normal content
  if (verificationStatus === 'approved') return children;

  const isPending = verificationStatus === 'pending' || verificationStatus === 'pending_approval';

  return (
    <View style={s.container}>
      <View style={s.card}>
        <Text style={s.icon}>{isPending ? '⏳' : '🔒'}</Text>

        <Text style={s.title}>
          {isPending ? 'Waiting for Approval' : 'Verification Required'}
        </Text>

        <Text style={s.body}>
          {isPending
            ? 'Your documents are under review by the admin.\n\nThis section will unlock once your account is approved.'
            : 'You need to verify your account to access this section.\n\nGo to your Profile and complete the verification process.'
          }
        </Text>

        {!isPending && (
          <TouchableOpacity
            style={s.btn}
            onPress={() => navigation.navigate('Profile')}
            activeOpacity={0.85}
          >
            <Text style={s.btnText}>Go to Profile → Verify</Text>
          </TouchableOpacity>
        )}

        {isPending && (
          <View style={s.pendingBadge}>
            <Text style={s.pendingBadgeText}>⏳ Under Review</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D0EEEE',
    width: '100%',
    maxWidth: 360,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  icon:  { fontSize: 56, marginBottom: 16 },
  title: { fontSize: 22, fontWeight: '900', color: '#1A2E2E', marginBottom: 12, textAlign: 'center' },
  body:  { fontSize: 14, color: '#3D6E6E', textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  btn:   { backgroundColor: '#1A7A7A', paddingVertical: 14, paddingHorizontal: 32, borderRadius: 14, width: '100%', alignItems: 'center' },
  btnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 },
  pendingBadge: { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE', borderWidth: 1, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
  pendingBadgeText: { color: '#1D4ED8', fontWeight: '700', fontSize: 14 },
});
