/**
 * CustomerNavigator.js — Role: customer
 */
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import RoleGuard from '../guards/RoleGuard';

import CustomerHomeScreen         from '../screens/Customer/CustomerHomeScreen';
import CustomerProfileScreen      from '../screens/Customer/CustomerProfileScreen';
import CustomerRegistrationScreen from '../screens/Customer/CustomerRegistrationScreen';

const Stack = createNativeStackNavigator();

function CustomerStack() {
  return (
    <Stack.Navigator
      initialRouteName="CustomerHomeScreen"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#F3F4F6' },
      }}
    >
      <Stack.Screen name="CustomerRegistration" component={CustomerRegistrationScreen} />
      <Stack.Screen name="CustomerHomeScreen"   component={CustomerHomeScreen} />
      <Stack.Screen name="CustomerProfileScreen" component={CustomerProfileScreen} />
    </Stack.Navigator>
  );
}

export default function CustomerNavigator() {
  return (
    <RoleGuard allowed={['customer']}>
      <CustomerStack />
    </RoleGuard>
  );
}