/**
 * AdminNavigator.js — Role: admin
 * All paths point to new feature-folder structure.
 */
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import RoleGuard from '../guards/RoleGuard';

// Dashboard
import AdminDashboardScreen from '../screens/admin/dashboard/AdminDashboardScreen';
import AdminHomeScreen      from '../screens/admin/dashboard/AdminHomeScreen';
import AdminMoreScreen      from '../screens/admin/dashboard/AdminMoreScreen';
// Residents
import ResidentListScreen   from '../screens/admin/residents/ResidentListScreen';
import ResidentDetailScreen from '../screens/admin/residents/ResidentDetailScreen';
import AddResidentScreen    from '../screens/admin/residents/AddResidentScreen';
// Maintenance
import AdminMaintenance        from '../screens/admin/maintenance/AdminMaintenance';
import MaintenanceDetailScreen from '../screens/admin/maintenance/MaintenanceDetailScreen';
// Billing
import BillingDashboardScreen from '../screens/admin/billing/BillingDashboardScreen';
import GenerateInvoiceScreen  from '../screens/admin/billing/GenerateInvoiceScreen';
import ExpenseScreen          from '../screens/admin/billing/ExpenseScreen';
import LegalNoticeScreen      from '../screens/admin/billing/LegalNoticeScreen';
import ExpenseApprovalScreen  from '../screens/admin/billing/ExpenseApprovalScreen';
// Amenities
import AmenitiesAdminScreen from '../screens/admin/amenities/AmenitiesAdminScreen';
import AddAmenityScreen     from '../screens/admin/amenities/AddAmenityScreen';
// Visitors / Blacklist
import VisitorLogsScreen    from '../screens/admin/visitors/VisitorLogsScreen';
import BlacklistScreen      from '../screens/admin/visitors/BlacklistScreen';
// Notices
import AdminNoticeBoardScreen from '../screens/admin/notices/AdminNoticeBoardScreen';
import AnnouncementsScreen    from '../screens/admin/notices/AnnouncementsScreen';
// Staff / AMC
import GuardManagementScreen  from '../screens/admin/staff/GuardManagementScreen';
import StaffManagementScreen  from '../screens/admin/staff/StaffManagementScreen';
import AMCScreen              from '../screens/admin/staff/AMCScreen';
// Reports
import ReportsScreen          from '../screens/admin/reports/ReportsScreen';
import AdminPlatformActivity  from '../screens/admin/reports/AdminPlatformActivity';
// Users / Approval
import UserApprovalScreen     from '../screens/admin/users/UserApprovalScreen';
// P2P / Real Estate
import P2PApprovalScreen         from '../screens/admin/p2p/P2PApprovalScreen';
import RealEstateAdminScreen     from '../screens/admin/p2p/RealEstateAdminScreen';
import VisitorParkingAdminScreen from '../screens/admin/p2p/VisitorParkingAdminScreen';
// Notifications
import AdminNotificationScreen from '../screens/admin/notifications/AdminNotificationScreen';
// Settings
import SocietyConfigScreen    from '../screens/admin/settings/SocietyConfigScreen';
import BillingConfigScreen    from '../screens/admin/settings/BillingConfigScreen';
import VendorManagementScreen from '../screens/admin/settings/VendorManagementScreen';
import AMCContractsAdminScreen from '../screens/admin/settings/AMCContractsAdminScreen';
import AuditLogsScreen        from '../screens/admin/settings/AuditLogsScreen';
import ModuleToggleScreen     from '../screens/admin/settings/ModuleToggleScreen';
// Verification
import VerificationScreen from '../screens/auth/VerificationScreen';
// Profile
import AdminProfileScreen from '../screens/admin/profile/AdminProfileScreen';

const Stack = createNativeStackNavigator();

function AdminStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      {/* Dashboard */}
      <Stack.Screen name="AdminDashboard"    component={AdminDashboardScreen} />
      <Stack.Screen name="AdminHome"         component={AdminHomeScreen} />
      <Stack.Screen name="AdminMore"         component={AdminMoreScreen} />
      {/* Residents */}
      <Stack.Screen name="ResidentList"      component={ResidentListScreen} />
      <Stack.Screen name="ResidentDetail"    component={ResidentDetailScreen} />
      <Stack.Screen name="AddResident"       component={AddResidentScreen} />
      {/* Maintenance — all navigate() calls use 'AdminMaintenanceTab' */}
      <Stack.Screen name="AdminMaintenanceTab" component={AdminMaintenance} />
      <Stack.Screen name="MaintenanceDetail"   component={MaintenanceDetailScreen} />
      {/* Billing */}
      <Stack.Screen name="BillingDashboard"  component={BillingDashboardScreen} />
      <Stack.Screen name="GenerateInvoice"   component={GenerateInvoiceScreen} />
      <Stack.Screen name="AdminExpenses"     component={ExpenseScreen} />
      <Stack.Screen name="LegalNotices"      component={LegalNoticeScreen} />
      <Stack.Screen name="ExpenseApprovals"  component={ExpenseApprovalScreen} />
      {/* Amenities */}
      <Stack.Screen name="AmenitiesAdmin"    component={AmenitiesAdminScreen} />
      <Stack.Screen name="AddAmenity"        component={AddAmenityScreen} />
      {/* Visitors / Blacklist */}
      <Stack.Screen name="VisitorLogs"       component={VisitorLogsScreen} />
      <Stack.Screen name="AdminBlacklist"    component={BlacklistScreen} />
      {/* Notices */}
      <Stack.Screen name="AdminNoticeBoard"  component={AdminNoticeBoardScreen} />
      <Stack.Screen name="Announcements"     component={AnnouncementsScreen} />
      {/* Staff / AMC */}
      <Stack.Screen name="GuardManagement"   component={GuardManagementScreen} />
      <Stack.Screen name="StaffManagement"   component={StaffManagementScreen} />
      <Stack.Screen name="AMC"               component={AMCScreen} />
      {/* Reports */}
      <Stack.Screen name="Reports"               component={ReportsScreen} />
      <Stack.Screen name="AdminPlatformActivity" component={AdminPlatformActivity} />
      {/* Users / Approval */}
      <Stack.Screen name="UserApprovals"     component={UserApprovalScreen} />
      {/* P2P / Real Estate */}
      <Stack.Screen name="P2PApproval"              component={P2PApprovalScreen} />
      <Stack.Screen name="RealEstateAdmin"          component={RealEstateAdminScreen} />
      <Stack.Screen name="VisitorParkingAdmin"      component={VisitorParkingAdminScreen} />
      {/* Notifications */}
      <Stack.Screen name="AdminNotifications"   component={AdminNotificationScreen} />
      {/* Settings */}
      <Stack.Screen name="SocietyConfig"        component={SocietyConfigScreen} />
      <Stack.Screen name="BillingConfig"        component={BillingConfigScreen} />
      <Stack.Screen name="VendorManagement"     component={VendorManagementScreen} />
      <Stack.Screen name="AMCContracts"         component={AMCContractsAdminScreen} />
      <Stack.Screen name="AuditLogs"            component={AuditLogsScreen} />
      <Stack.Screen name="ModuleToggles"        component={ModuleToggleScreen} />
      {/* Verification */}
      <Stack.Screen name="Verification"         component={VerificationScreen} />
      {/* Profile */}
      <Stack.Screen name="AdminProfile"         component={AdminProfileScreen} />
    </Stack.Navigator>
  );
}

export default function AdminNavigator() {
  return (
    <RoleGuard allowed={['admin']}>
      <AdminStack />
    </RoleGuard>
  );
}