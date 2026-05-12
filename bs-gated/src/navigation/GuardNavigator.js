/**
 * GuardNavigator.js — Role: security (guard)
 * All paths point to new feature-folder structure.
 */
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import RoleGuard from '../guards/RoleGuard';

// Dashboard
import GuardDashboard from '../screens/guard/dashboard/GuardDashboard';
// Visitors
import VisitorVerificationScreen from '../screens/guard/visitors/VisitorVerificationScreen';
import WalkInEntryScreen         from '../screens/guard/visitors/WalkInEntryScreen';
// Deliveries
import DeliveryVerificationScreen from '../screens/guard/deliveries/DeliveryVerificationScreen';
// Vehicles
import VehicleEntryScreen from '../screens/guard/vehicles/VehicleEntryScreen';
// SOS
import SOSScreen from '../screens/guard/sos/SOSScreen';
// Utilities
import VendorVerificationScreen from '../screens/guard/utilities/VendorVerificationScreen';
import BlacklistAlertScreen     from '../screens/guard/utilities/BlacklistAlertScreen';
import EntryLogsScreen          from '../screens/guard/utilities/EntryLogsScreen';
// Incidents / Shift
import SecurityIncidentScreen from '../screens/guard/incidents/SecurityIncidentScreen';
import ShiftHandoverScreen    from '../screens/guard/incidents/ShiftHandoverScreen';
import PatrolLogScreen        from '../screens/guard/incidents/PatrolLogScreen';
// Amenities
import AmenityVerificationScreen from '../screens/guard/amenities/AmenityVerificationScreen';
// Biometric
import GuardBiometricScreen from '../screens/guard/biometric/GuardBiometricScreen';
// Notifications
import GuardNotificationsScreen from '../screens/guard/notifications/GuardNotificationsScreen';
// Profile
import GuardProfileScreen from '../screens/guard/profile/GuardProfileScreen';
// Verification
import VerificationScreen from '../screens/auth/VerificationScreen';

const Stack = createNativeStackNavigator();

function GuardStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      {/* Dashboard */}
      <Stack.Screen name="GuardDashboard"       component={GuardDashboard} />
      {/* Visitors */}
      <Stack.Screen name="VisitorVerification"  component={VisitorVerificationScreen} />
      <Stack.Screen name="WalkInEntry"          component={WalkInEntryScreen} />
      {/* Deliveries */}
      <Stack.Screen name="DeliveryVerification" component={DeliveryVerificationScreen} />
      {/* Vehicles */}
      <Stack.Screen name="VehicleEntry"         component={VehicleEntryScreen} />
      {/* SOS */}
      <Stack.Screen name="GuardSOS"             component={SOSScreen} />
      {/* Utilities */}
      <Stack.Screen name="VendorVerification"   component={VendorVerificationScreen} />
      <Stack.Screen name="BlacklistAlert"       component={BlacklistAlertScreen} />
      <Stack.Screen name="EntryLogs"            component={EntryLogsScreen} />
      {/* Incidents / Shift */}
      <Stack.Screen name="SecurityIncident"     component={SecurityIncidentScreen} />
      <Stack.Screen name="ShiftHandover"        component={ShiftHandoverScreen} />
      <Stack.Screen name="PatrolLog"            component={PatrolLogScreen} />
      {/* Amenities */}
      <Stack.Screen name="AmenityVerification"  component={AmenityVerificationScreen} />
      {/* Biometric */}
      <Stack.Screen name="GuardBiometric"       component={GuardBiometricScreen} />
      {/* Notifications */}
      <Stack.Screen name="GuardNotifications"   component={GuardNotificationsScreen} />
      {/* Profile */}
      <Stack.Screen name="GuardProfile"         component={GuardProfileScreen} />
      {/* Verification */}
      <Stack.Screen name="Verification"         component={VerificationScreen} />
    </Stack.Navigator>
  );
}

export default function GuardNavigator() {
  return (
    <RoleGuard allowed={['security', 'guard']}>
      <GuardStack />
    </RoleGuard>
  );
}