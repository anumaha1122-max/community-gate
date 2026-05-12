/**
 * RoleGuard.js — FIXED white screen on registration
 *
 * Root cause of white screen:
 * Zustand persist has a hydration delay. For a brief moment after
 * registration/login, role is null. The old guard returned null/AccessDenied
 * during that window → white screen.
 *
 * Fix: if role is null (still hydrating), render nothing (null) and wait.
 * The store will update in milliseconds and re-render with the correct role.
 */

import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { useAuthStore } from '../store/AuthStore';

function AccessDenied({ requiredRoles, currentRole, onBack }) {
  return (
    <View style={styles.center}>
      <Text style={styles.icon}>🚫</Text>
      <Text style={styles.title}>Access Denied</Text>
      <Text style={styles.subtitle}>
        This section requires:{' '}
        <Text style={styles.bold}>{requiredRoles.join(' or ')}</Text>
      </Text>
      {currentRole && (
        <Text style={styles.current}>Your role: {currentRole}</Text>
      )}
      {onBack && (
        <TouchableOpacity style={styles.btn} onPress={onBack}>
          <Text style={styles.btnText}>Go Back</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function RoleGuard({ allowed, children, fallback, onDenied }) {
  const role       = useAuthStore((state) => state.role);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  const allowedRoles = Array.isArray(allowed) ? allowed : [allowed];

  // Not logged in — render nothing, RootNavigator handles redirect
  if (!isLoggedIn) return null;

  // FIX: role is null means Zustand is still hydrating from AsyncStorage.
  // Return null and wait — store will update and trigger a re-render.
  if (!role) return null;

  if (!allowedRoles.includes(role)) {
    if (onDenied) onDenied(role, allowedRoles);
    if (fallback !== undefined) return fallback;
    return (
      <AccessDenied
        requiredRoles={allowedRoles}
        currentRole={role}
      />
    );
  }

  return children;
}

export function withRoleGuard(WrappedComponent, allowed) {
  const allowedRoles = Array.isArray(allowed) ? allowed : [allowed];

  return function RoleGuardedScreen(props) {
    const role       = useAuthStore((state) => state.role);
    const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

    if (!isLoggedIn) {
      return (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#4F8EF7" />
        </View>
      );
    }

    // FIX: wait for role to hydrate
    if (!role) {
      return (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#4F8EF7" />
        </View>
      );
    }

    if (!allowedRoles.includes(role)) {
      return (
        <AccessDenied
          requiredRoles={allowedRoles}
          currentRole={role}
          onBack={() => props.navigation?.goBack?.()}
        />
      );
    }

    return <WrappedComponent {...props} />;
  };
}

export function useRoleGuard(allowed) {
  const role = useAuthStore((state) => state.role);
  const allowedRoles = Array.isArray(allowed) ? allowed : [allowed];
  const hasRole = allowedRoles.includes(role);
  return { hasRole, currentRole: role, allowedRoles };
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    padding: 32,
  },
  icon:     { fontSize: 48, marginBottom: 16 },
  title:    { fontSize: 22, fontWeight: '700', color: '#F1F5F9', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#94A3B8', textAlign: 'center', marginBottom: 6 },
  bold:     { color: '#4F8EF7', fontWeight: '700' },
  current:  { fontSize: 13, color: '#64748B', marginBottom: 24 },
  btn:      { backgroundColor: '#4F8EF7', paddingVertical: 12, paddingHorizontal: 32, borderRadius: 10 },
  btnText:  { color: '#FFF', fontWeight: '700', fontSize: 15 },
});
