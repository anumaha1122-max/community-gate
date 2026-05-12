/**
 * RootNavigator.js
 *
 * Simple routing — only two states:
 *   isLoggedIn=false → AuthNavigator
 *     (Login → Register → Verification → WaitingApproval all live here)
 *   isLoggedIn=true  → RoleNavigator (Dashboard)
 *     (Only approved users ever reach isLoggedIn=true)
 *
 * loginUser() in AuthStore only sets isLoggedIn=true for approved users.
 * All other status routing (not_submitted, pending, rejected) is handled
 * inside LoginScreen using navigation.navigate() within AuthNavigator.
 */

import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';

import { useAuthStore } from '../store/AuthStore';
import AuthNavigator from './AuthNavigator';
import AdminNavigator from './AdminNavigator';
import ResidentNavigator from './ResidentNavigator';
import VendorNavigator from './VendorNavigator';
import GuardNavigator from './GuardNavigator';
import SuperAdminNavigator from './SuperAdminNavigator';
import BuilderNavigator from './BuilderNavigator';
import CustomerNavigator from './CustomerNavigator';

function RoleNavigator({ role }) {
  switch (role) {
    case 'admin': return <AdminNavigator />;
    case 'resident': return <ResidentNavigator />;
    case 'vendor': return <VendorNavigator />;
    case 'security': return <GuardNavigator />;
    case 'superadmin': return <SuperAdminNavigator />;
    case 'builder': return <BuilderNavigator />;
    case 'customer': return <CustomerNavigator />;
    default: return <AuthNavigator />;
  }
}

export default function RootNavigator() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const role = useAuthStore((s) => s.role);

  console.log('[RootNavigator] State:', { isLoggedIn, role });

  console.log('[RootNavigator] State:', { isLoggedIn, role });

  // Zustand persist hydration delay guard — prevents white screen
  if (isLoggedIn && !role) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#E8F5F5' }}>
        <ActivityIndicator size="large" color="#1A7A7A" />
      </View>
    );
  }

  return (
    <NavigationContainer key={isLoggedIn ? 'authed' : 'unauthed'}>
      {!isLoggedIn
        ? <AuthNavigator />
        : <RoleNavigator role={role} />
      }
    </NavigationContainer>
  );
}
