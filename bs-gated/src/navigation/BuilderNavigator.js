/**
 * BuilderNavigator.js — Role: builder
 */
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import RoleGuard from '../guards/RoleGuard';

// Builder Screens
import BuilderDashboard           from '../screens/builder/BuilderDashboard';
import BuilderProjectSetup        from '../screens/builder/BuilderProjectSetup';
import BuilderProjectCreation     from '../screens/builder/projectsetup/BuilderProjectCreation';
import BuilderUnitInventory       from '../screens/builder/projectsetup/BuilderUnitInventory';
import BuilderComplianceTracking  from '../screens/builder/projectsetup/BuilderComplianceTracking';
import BuilderAvailabilityChart   from '../screens/builder/projectsetup/BuilderAvailabilityChart';
import BuilderUnitBooking         from '../screens/builder/BuilderUnitBooking';
import BuilderPaymentSchedule     from '../screens/builder/BuilderPaymentSchedule';
import BuilderConstructionTracking from '../screens/builder/BuilderConstructionTracking';
import BuilderSoftPossession      from '../screens/builder/BuilderSoftPossession';
import BuilderVisitBooking        from '../screens/builder/BuilderVisitBooking';
import BuilderNotificationScreen  from '../screens/builder/BuilderNotificationScreen';
import BuilderProfileScreen       from '../screens/builder/BuilderProfileScreen';
import MaterialManagementScreen   from '../screens/builder/MaterialManagementScreen';
import VerificationScreen         from '../screens/auth/VerificationScreen';

const Stack = createNativeStackNavigator();

function BuilderStack() {
  return (
    <Stack.Navigator
      initialRouteName="BuilderDashboard"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: '#F3F4F6' },
      }}
    >
      <Stack.Screen name="BuilderDashboard"          component={BuilderDashboard} />
      <Stack.Screen name="BuilderNotificationScreen" component={BuilderNotificationScreen} />
      <Stack.Screen name="BuilderProjectSetup"       component={BuilderProjectSetup} />
      <Stack.Screen name="BuilderProjectCreation"    component={BuilderProjectCreation} />
      <Stack.Screen name="BuilderUnitInventory"      component={BuilderUnitInventory} />
      <Stack.Screen name="BuilderComplianceTracking" component={BuilderComplianceTracking} />
      <Stack.Screen name="BuilderAvailabilityChart"  component={BuilderAvailabilityChart} />
      <Stack.Screen name="BuilderUnitBooking"        component={BuilderUnitBooking} />
      <Stack.Screen name="BuilderPaymentSchedule"    component={BuilderPaymentSchedule} />
      <Stack.Screen name="BuilderConstructionTracking" component={BuilderConstructionTracking} />
      <Stack.Screen name="BuilderSoftPossession"     component={BuilderSoftPossession} />
      <Stack.Screen name="BuilderVisitBooking"       component={BuilderVisitBooking} />
      <Stack.Screen name="BuilderProfile"            component={BuilderProfileScreen} />
      <Stack.Screen name="MaterialManagement"        component={MaterialManagementScreen} />
      <Stack.Screen name="Verification"              component={VerificationScreen} />
    </Stack.Navigator>
  );
}

export default function BuilderNavigator() {
  return (
    <RoleGuard allowed={['builder']}>
      <BuilderStack />
    </RoleGuard>
  );
}