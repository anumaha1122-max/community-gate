/**
 * App.js — ENTRY POINT
 *
 * Responsibilities:
 *   • Provide any top-level context providers (gesture handler, safe area)
 *   • Render RootNavigator which owns ALL navigation decisions
 *   • NOTHING else — no inline routing, no hardcoded role checks here
 *
 * All navigation logic lives in RootNavigator.js.
 * All auth/role state lives in AuthStore.js.
 */

import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider }       from 'react-native-safe-area-context';
import { StyleSheet }             from 'react-native';

import RootNavigator from './src/navigation/RootNavigator';
import { SocietyProvider } from './src/screens/superadmin/SocietyContext';

export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <SocietyProvider>
        <RootNavigator />
        </SocietyProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
