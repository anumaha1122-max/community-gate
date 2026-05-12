/**
 * AuthGuard.js
 *
 * Blocks unauthenticated users from accessing protected screens.
 *
 * Usage (wrap any navigator or screen):
 *   <AuthGuard>
 *     <MyProtectedNavigator />
 *   </AuthGuard>
 *
 * If the user is not logged in, renders a redirect screen that sends them
 * to the Auth stack. Since navigation lives at the RootNavigator level,
 * the guard simply returns null (the RootNavigator already re-renders the
 * correct tree based on isLoggedIn). The guard is also exported as a HOC
 * for individual screen protection.
 */

import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuthStore } from '../store/AuthStore';

// ─── Component guard (wraps a navigator or screen) ──────────────────────────
export default function AuthGuard({ children, fallback = null }) {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  if (!isLoggedIn) {
    // Returning fallback (or null) lets RootNavigator show the Auth stack.
    return fallback;
  }

  return children;
}

// ─── HOC guard (wraps individual screen components) ──────────────────────────
/**
 * withAuthGuard(ScreenComponent)
 *
 * Returns a new component that checks auth before rendering.
 * If not logged in, shows a loading spinner briefly then the parent
 * RootNavigator redirects automatically because isLoggedIn is false.
 */
export function withAuthGuard(WrappedComponent) {
  return function AuthGuardedScreen(props) {
    const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

    if (!isLoggedIn) {
      // Short spinner while RootNavigator catches up
      return (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#4F8EF7" />
        </View>
      );
    }

    return <WrappedComponent {...props} />;
  };
}

// ─── Hook guard (use inside functional screens) ───────────────────────────────
/**
 * useAuthGuard()
 *
 * Call at the top of any screen. Returns { isLoggedIn }.
 * If not logged in, returns false — the parent RootNavigator will redirect.
 *
 * Example:
 *   const { isLoggedIn } = useAuthGuard();
 *   if (!isLoggedIn) return null;
 */
export function useAuthGuard() {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  return { isLoggedIn };
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F172A',
  },
});
