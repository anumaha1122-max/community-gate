/**
 * PendingVerificationBanner.js — FIXED
 * Reads verificationStatus (not approvalStatus/docsSubmitted)
 */
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useAuthStore } from '../../store/AuthStore';

export default function PendingVerificationBanner({ navigation }) {
  const userId = useAuthStore(s => s.user?.id);
  const role   = useAuthStore(s => s.user?.role);

  const verificationStatus = useAuthStore(s => {
    const live = s.registeredUsers.find(u => u.id === s.user?.id);
    return live?.verificationStatus || s.user?.verificationStatus || 'not_submitted';
  });

  // Customer and SuperAdmin don't need verification
  if (role === 'customer' || role === 'superadmin') return null;

  // Approved — no banner
  if (verificationStatus === 'approved') return null;

  // Pending — waiting for admin
  if (verificationStatus === 'pending') {
    return (
      <View style={{
        backgroundColor: '#EFF6FF', borderColor: '#BFDBFE', borderWidth: 1,
        borderRadius: 14, padding: 16, marginHorizontal: 16, marginTop: 12,
        flexDirection: 'row', alignItems: 'center', gap: 12,
      }}>
        <Text style={{ fontSize: 24 }}>⏳</Text>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 14, fontWeight: '800', color: '#1D4ED8', marginBottom: 2 }}>
            Verification Pending
          </Text>
          <Text style={{ fontSize: 12, color: '#1D4ED8', lineHeight: 18 }}>
            Your documents are under review. You'll be notified once approved.
          </Text>
        </View>
      </View>
    );
  }

  // Rejected — needs resubmission
  if (verificationStatus === 'rejected') {
    return (
      <TouchableOpacity
        style={{
          backgroundColor: '#FEE2E2', borderColor: '#FECACA', borderWidth: 1,
          borderRadius: 14, padding: 16, marginHorizontal: 16, marginTop: 12,
          flexDirection: 'row', alignItems: 'center', gap: 12,
        }}
        onPress={() => navigation.navigate('Verification')}
        activeOpacity={0.85}
      >
        <Text style={{ fontSize: 26 }}>❌</Text>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 14, fontWeight: '800', color: '#C62828', marginBottom: 2 }}>
            Verification Rejected
          </Text>
          <Text style={{ fontSize: 12, color: '#C62828', lineHeight: 18 }}>
            Tap here to review and resubmit your documents
          </Text>
        </View>
        <Text style={{ fontSize: 20, color: '#C62828' }}>›</Text>
      </TouchableOpacity>
    );
  }

  // Not submitted — prompt to verify
  return (
    <TouchableOpacity
      style={{
        backgroundColor: '#FEF3C7', borderColor: '#FDE68A', borderWidth: 1,
        borderRadius: 14, padding: 16, marginHorizontal: 16, marginTop: 12,
        flexDirection: 'row', alignItems: 'center', gap: 12,
      }}
      onPress={() => navigation.navigate('Verification')}
      activeOpacity={0.85}
    >
      <Text style={{ fontSize: 26 }}>📋</Text>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, fontWeight: '800', color: '#92400E', marginBottom: 2 }}>
          Complete Profile Verification
        </Text>
        <Text style={{ fontSize: 12, color: '#92400E', lineHeight: 18 }}>
          Tap here to upload your documents and get approved
        </Text>
      </View>
      <Text style={{ fontSize: 20, color: '#92400E' }}>›</Text>
    </TouchableOpacity>
  );
}
