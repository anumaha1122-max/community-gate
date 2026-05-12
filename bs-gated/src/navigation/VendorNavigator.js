/**
 * VendorNavigator.js — Role: vendor
 * All paths point to new feature-folder structure.
 */
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import RoleGuard from '../guards/RoleGuard';

// Dashboard
import VendorHomeScreen    from '../screens/vendor/dashboard/VendorHomeScreen';
import BusinessHomeScreen  from '../screens/vendor/dashboard/BusinessHomeScreen';
// Auth
import ChooseTypeScreen    from '../screens/vendor/auth/ChooseTypeScreen';
// Jobs
import RequestListScreen    from '../screens/vendor/jobs/RequestListScreen';
import RequestDetailsScreen from '../screens/vendor/jobs/RequestDetailsScreen';
import SendQuoteScreen      from '../screens/vendor/jobs/SendQuoteScreen';
import ApprovalStatusScreen from '../screens/vendor/jobs/ApprovalStatusScreen';
import ActiveWorkScreen     from '../screens/vendor/jobs/ActiveWorkScreen';
import WorkCompletedScreen  from '../screens/vendor/jobs/WorkCompletedScreen';
import UserReviewScreen     from '../screens/vendor/jobs/UserReviewScreen';
// Payments
import PaymentReceivedScreen from '../screens/vendor/payments/PaymentReceivedScreen';
import JobCompletedScreen    from '../screens/vendor/payments/JobCompletedScreen';
import EarningsScreen        from '../screens/vendor/payments/EarningsScreen';
import AMCContractsScreen    from '../screens/vendor/payments/AMCContractsScreen';
import JobsListScreen        from '../screens/vendor/payments/JobsListScreen';
// Profile
import ProfileScreen              from '../screens/vendor/profile/ProfileScreen';
import EditProfileScreen          from '../screens/vendor/profile/EditProfileScreen';
import VendorRatingsScreen        from '../screens/vendor/profile/VendorRatingsScreen';
import ServicesOfferedScreen      from '../screens/vendor/profile/ServicesOfferedScreen';
import BankDetailsScreen          from '../screens/vendor/profile/BankDetailsScreen';
import DocumentsKYCScreen         from '../screens/vendor/profile/DocumentsKYCScreen';
import NotificationSettingsScreen from '../screens/vendor/profile/NotificationSettingsScreen';
import PrivacySecurityScreen      from '../screens/vendor/profile/PrivacySecurityScreen';
import HelpSupportScreen          from '../screens/vendor/profile/HelpSupportScreen';
// Marketplace
import OrdersListScreen         from '../screens/vendor/marketplace/OrdersListScreen';
import MarketplaceHomeScreen    from '../screens/vendor/marketplace/MarketplaceHomeScreen';
import ProductListScreen        from '../screens/vendor/marketplace/ProductListScreen';
import AddProductScreen         from '../screens/vendor/marketplace/AddProductScreen';
import OrderDetailsScreen       from '../screens/vendor/marketplace/OrderDetailsScreen';
import DeliveryTrackingScreen   from '../screens/vendor/marketplace/DeliveryTrackingScreen';
import ManageStoreScreen        from '../screens/vendor/marketplace/ManageStoreScreen';
import MarketplaceEarningsScreen from '../screens/vendor/marketplace/MarketplaceEarningsScreen';
import MarketplaceProfileScreen from '../screens/vendor/marketplace/MarketplaceProfileScreen';
// Store Setup
import StoreSetupScreen       from '../screens/vendor/store_setup/StoreSetupScreen';
import StoreVerifiedScreen    from '../screens/vendor/store_setup/StoreVerifiedScreen';
import StoreProfileScreen     from '../screens/vendor/store_setup/StoreProfileScreen';
import DeliverySettingsScreen from '../screens/vendor/store_setup/DeliverySettingsScreen';
import PaymentBankScreen      from '../screens/vendor/store_setup/PaymentBankScreen';
import StoreTimingsScreen     from '../screens/vendor/store_setup/StoreTimingsScreen';
import OffersDiscountsScreen  from '../screens/vendor/store_setup/OffersDiscountsScreen';
import ReportsAnalyticsScreen from '../screens/vendor/store_setup/ReportsAnalyticsScreen';
import VerificationScreen     from '../screens/auth/VerificationScreen';
// Delivery
import VendorOrdersScreen         from '../screens/vendor/delivery/VendorOrdersScreen';
import VendorAssignDeliveryScreen from '../screens/vendor/delivery/VendorAssignDeliveryScreen';
import VendorDeliveryStatusScreen from '../screens/vendor/delivery/VendorDeliveryStatusScreen';
// Notifications
import NotificationsScreen from '../screens/vendor/notifications/NotificationsScreen';

import { useAuthStore } from '../store/AuthStore';

const Stack = createNativeStackNavigator();

function VendorStack() {
  const vendorType = useAuthStore(s => s.user?.vendorType);
  // Only show ChooseType on first login (vendorType not set yet)
  const initialRoute = vendorType === 'business'
    ? 'BusinessHome'
    : vendorType === 'marketplace'
    ? 'MarketplaceHome'
    : 'ChooseType';

  return (
    <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      {/* Dashboard */}
      <Stack.Screen name="VendorHome"        component={VendorHomeScreen} />
      <Stack.Screen name="BusinessHome"      component={BusinessHomeScreen} />
      {/* Auth */}
      <Stack.Screen name="ChooseType"        component={ChooseTypeScreen} />
      {/* Jobs */}
      <Stack.Screen name="RequestList"       component={RequestListScreen} />
      <Stack.Screen name="RequestDetails"    component={RequestDetailsScreen} />
      <Stack.Screen name="SendQuote"         component={SendQuoteScreen} />
      <Stack.Screen name="ApprovalStatus"    component={ApprovalStatusScreen} />
      <Stack.Screen name="ActiveWork"        component={ActiveWorkScreen} />
      <Stack.Screen name="WorkCompleted"     component={WorkCompletedScreen} />
      <Stack.Screen name="UserReview"        component={UserReviewScreen} />
      {/* Payments */}
      <Stack.Screen name="PaymentReceived"   component={PaymentReceivedScreen} />
      <Stack.Screen name="JobCompleted"      component={JobCompletedScreen} />
      <Stack.Screen name="Earnings"          component={EarningsScreen} />
      <Stack.Screen name="AMCContracts"         component={AMCContractsScreen} />
      <Stack.Screen name="JobsList"          component={JobsListScreen} />
      {/* Profile */}
      <Stack.Screen name="VendorProfile"            component={ProfileScreen} />
      <Stack.Screen name="EditProfile"              component={EditProfileScreen} />
      <Stack.Screen name="VendorRatings"            component={VendorRatingsScreen} />
      <Stack.Screen name="ServicesOffered"          component={ServicesOfferedScreen} />
      <Stack.Screen name="BankDetails"              component={BankDetailsScreen} />
      <Stack.Screen name="DocumentsKYC"             component={DocumentsKYCScreen} />
      <Stack.Screen name="NotificationSettings"     component={NotificationSettingsScreen} />
      <Stack.Screen name="PrivacySecurity"          component={PrivacySecurityScreen} />
      <Stack.Screen name="HelpSupport"              component={HelpSupportScreen} />
      {/* Marketplace */}
      <Stack.Screen name="OrdersList"               component={OrdersListScreen} />
      <Stack.Screen name="MarketplaceHome"          component={MarketplaceHomeScreen} />
      <Stack.Screen name="ProductList"              component={ProductListScreen} />
      <Stack.Screen name="AddProduct"               component={AddProductScreen} />
      <Stack.Screen name="OrderDetails"             component={OrderDetailsScreen} />
      <Stack.Screen name="DeliveryTracking"         component={DeliveryTrackingScreen} />
      <Stack.Screen name="ManageStore"              component={ManageStoreScreen} />
      <Stack.Screen name="MarketplaceEarnings"      component={MarketplaceEarningsScreen} />
      <Stack.Screen name="MarketplaceProfile"       component={MarketplaceProfileScreen} />
      {/* Store Setup */}
      <Stack.Screen name="StoreSetup"               component={StoreSetupScreen} />
      <Stack.Screen name="StoreVerified"            component={StoreVerifiedScreen} />
      <Stack.Screen name="StoreProfile"             component={StoreProfileScreen} />
      <Stack.Screen name="DeliverySettings"         component={DeliverySettingsScreen} />
      <Stack.Screen name="PaymentBank"              component={PaymentBankScreen} />
      <Stack.Screen name="StoreTimings"             component={StoreTimingsScreen} />
      <Stack.Screen name="OffersDiscounts"          component={OffersDiscountsScreen} />
      <Stack.Screen name="ReportsAnalytics"         component={ReportsAnalyticsScreen} />
      {/* Delivery Workflow */}
      <Stack.Screen name="VendorOrders"             component={VendorOrdersScreen} />
      <Stack.Screen name="VendorAssignDelivery"     component={VendorAssignDeliveryScreen} />
      <Stack.Screen name="VendorDeliveryStatus"     component={VendorDeliveryStatusScreen} />
      {/* Notifications */}
      <Stack.Screen name="VendorNotifications"      component={NotificationsScreen} />
      <Stack.Screen name="Verification"             component={VerificationScreen} />
    </Stack.Navigator>
  );
}

export default function VendorNavigator() {
  return (
    <RoleGuard allowed={['vendor']}>
      <VendorStack />
    </RoleGuard>
  );
}