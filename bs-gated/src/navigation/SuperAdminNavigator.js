/**
 * SuperAdminNavigator.js — Role: superadmin
 */
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator }   from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import RoleGuard from '../guards/RoleGuard';
import COLORS    from '../theme/SAcolors';

// --- TAB SCREENS ---
import DashboardScreen from '../screens/superadmin/DashboardScreen';
import SocietiesScreen from '../screens/superadmin/SocietiesScreen';
import AnalyticsScreen from '../screens/superadmin/AnalyticsScreen';
import SettingsScreen  from '../screens/superadmin/SettingsScreen';

// --- STACK SCREENS ---
import SocietyDetailsScreen        from '../screens/superadmin/SocietyDetailsScreen';
import BuildersScreen              from '../screens/superadmin/BuildersScreen';
import SubscriptionPlansScreen     from '../screens/superadmin/SubscriptionPlansScreen';
import SystemHealthScreen          from '../screens/superadmin/SystemHealthScreen';
import WhiteLabelScreen            from '../screens/superadmin/WhiteLabelScreen';
import FranchiseManagementScreen   from '../screens/superadmin/FranchiseManagementScreen';
import BuilderDetailsScreen        from '../screens/superadmin/BuilderDetailsScreen';
import CreateSocietyScreen         from '../screens/superadmin/CreateSocietyScreen';
import TotalSocietiesDetails       from '../screens/superadmin/TotalSocietyDetails';
import RevenueDetailsScreen        from '../screens/superadmin/RevenueDetailsScreen';
import ActiveIssuesDetailsScreen   from '../screens/superadmin/ActiveIssuesDetailsScreen';
import SuperAdminNotificationsScreen from '../screens/superadmin/SuperAdminNotificationScreen';
import BuilderRequestDetails       from '../screens/superadmin/BuilderRequestDetails';
import ProjectRequestDetails       from '../screens/superadmin/ProjectRequestDetails';
import NewAdminRequestsScreen      from '../screens/superadmin/NewAdminRequestsScreen';
import UserApprovalScreen          from '../screens/admin/users/UserApprovalScreen';

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();

// ---------- TABS ----------
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor:   COLORS.primaryNavy,
        tabBarInactiveTintColor: COLORS.tabInactive,
        tabBarStyle: {
          height: 72,
          paddingTop: 8,
          paddingBottom: 8,
          backgroundColor: COLORS.white,
          borderTopColor:  COLORS.border,
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '700' },
        tabBarIcon: ({ color, size }) => {
          let iconName = 'home-outline';
          if (route.name === 'DashboardTab') iconName = 'grid-outline';
          if (route.name === 'Societies')    iconName = 'business-outline';
          if (route.name === 'AnalyticsTab') iconName = 'stats-chart-outline';
          if (route.name === 'SettingsTab')  iconName = 'settings-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="DashboardTab" component={DashboardScreen} options={{ title: 'Dashboard' }} />
      <Tab.Screen name="Societies"    component={SocietiesScreen} />
      <Tab.Screen name="AnalyticsTab" component={AnalyticsScreen} options={{ title: 'Analytics' }} />
      <Tab.Screen name="SettingsTab"  component={SettingsScreen}  options={{ title: 'Settings' }} />
    </Tab.Navigator>
  );
}

// ---------- MAIN STACK ----------
function SuperAdminStack() {
  return (
    <Stack.Navigator
      initialRouteName="MainTabs"
      screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
    >
      {/* Tabs */}
      <Stack.Screen name="MainTabs" component={MainTabs} />

      {/* Stack Screens */}
      <Stack.Screen name="SocietyDetails"          component={SocietyDetailsScreen} />
      <Stack.Screen name="Builders"                component={BuildersScreen} />
      <Stack.Screen name="SubscriptionPlans"       component={SubscriptionPlansScreen} />
      <Stack.Screen name="SystemHealth"            component={SystemHealthScreen} />
      <Stack.Screen name="WhiteLabel"              component={WhiteLabelScreen} />
      <Stack.Screen name="FranchiseManagement"     component={FranchiseManagementScreen} />
      <Stack.Screen name="BuilderDetails"          component={BuilderDetailsScreen} />
      <Stack.Screen name="CreateSocietyScreen"     component={CreateSocietyScreen} />
      <Stack.Screen name="TotalSocietiesDetails"   component={TotalSocietiesDetails} />
      <Stack.Screen name="RevenueDetails"          component={RevenueDetailsScreen} />
      <Stack.Screen name="ActiveIssuesDetails"     component={ActiveIssuesDetailsScreen} />
      <Stack.Screen name="SuperAdminNotifications" component={SuperAdminNotificationsScreen} />
      <Stack.Screen name="BuilderRequestDetails"   component={BuilderRequestDetails} />
      <Stack.Screen name="ProjectRequestDetails"   component={ProjectRequestDetails} />
      <Stack.Screen name="UserApprovals"           component={UserApprovalScreen} />
      <Stack.Screen name="NewAdminRequest"         component={NewAdminRequestsScreen} />
    </Stack.Navigator>
  );
}

// ---------- ROOT EXPORT ----------
export default function SuperAdminNavigator() {
  return (
    <RoleGuard allowed={['superadmin']}>
      <SuperAdminStack />
    </RoleGuard>
  );
}