/**
 * AuthNavigator.js
 *
 * Screens available BEFORE login (isLoggedIn=false):
 *   Login           → main login screen
 *   Register        → full registration + doc upload (all in one page)
 *   WaitingApproval → shown when verificationStatus=pending at login
 *
 * FLOW:
 *   Login → (new user) → Register → (submit docs) → Login → WaitingApproval
 *   Login → (approved) → RootNavigator switches to role Dashboard
 */
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen           from '../screens/auth/LoginScreen';
import RegisterScreen        from '../screens/auth/RegisterScreen';
import WaitingApprovalScreen from '../screens/auth/WaitingApprovalScreen';

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login"           component={LoginScreen} />
      <Stack.Screen name="Register"        component={RegisterScreen} />
      <Stack.Screen name="WaitingApproval" component={WaitingApprovalScreen} />
    </Stack.Navigator>
  );
}
