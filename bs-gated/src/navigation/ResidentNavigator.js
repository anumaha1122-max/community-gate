/**
 * ResidentNavigator.js — Role: resident
 * All paths point to new feature-folder structure.
 */
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import RoleGuard from '../guards/RoleGuard';

// Dashboard
import ResidentDashboard    from '../screens/resident/dashboard/ResidentDashboard';
// Visitors
import VisitorListScreen    from '../screens/resident/visitors/VisitorListScreen';
import AddVisitorScreen     from '../screens/resident/visitors/AddVisitorScreen';
import VisitorQRCodeScreen  from '../screens/resident/visitors/VisitorQRCodeScreen';
// Billing
import BillingListScreen    from '../screens/resident/billing/BillingListScreen';
import InvoiceDetailScreen  from '../screens/resident/billing/InvoiceDetailScreen';
import PaymentScreen        from '../screens/resident/billing/PaymentScreen';
// Maintenance
import ResidentMaintenanceScreen from '../screens/resident/maintenance/ResidentMaintenanceScreen';
// Amenities
import AmenitiesScreen           from '../screens/resident/amenities/AmenitiesScreen';
import BookingScreen             from '../screens/resident/amenities/BookingScreen';
import AmenityPaymentScreen      from '../screens/resident/amenities/AmenityPaymentScreen';
import AmenityConfirmationScreen from '../screens/resident/amenities/AmenityConfirmationScreen';
// EV Charging
import EVListScreen         from '../screens/resident/ev/EVListScreen';
import EVBookSlotScreen     from '../screens/resident/ev/EVBookSlotScreen';
import EVPaymentScreen      from '../screens/resident/ev/EVPaymentScreen';
import EVConfirmationScreen from '../screens/resident/ev/EVConfirmationScreen';
// Marketplace
import MarketHomeScreen    from '../screens/resident/marketplace/MarketHomeScreen';
import ProductDetailScreen from '../screens/resident/marketplace/ProductDetailScreen';
import CartScreen          from '../screens/resident/marketplace/CartScreen';
import OrderTrackingScreen  from '../screens/resident/marketplace/OrderTrackingScreen';
import OrderHistoryScreen   from '../screens/resident/marketplace/OrderHistoryScreen';
// Buy/Sell (P2P — separate from Shop)
import BuySellScreen       from '../screens/resident/marketplace/BuySellScreen';
// Wishlist
import WishlistScreen      from '../screens/resident/marketplace/WishlistScreen';
// Rate Vendor
import RateVendorScreen    from '../screens/resident/maintenance/RateVendorScreen';
// Parking / GPS / Real Estate / SOS
import GuestParkingScreen     from '../screens/resident/parking/GuestParkingScreen';
import ParkingSlotPassScreen  from '../screens/resident/parking/ParkingSlotPassScreen';
import GPSDashboard           from '../screens/resident/gps/GPSDashboard';
import RealEstateScreen       from '../screens/resident/real_estate/RealEstateScreen';
import SOSTrackingScreen      from '../screens/resident/sos/SOSTrackingScreen';
// Notifications
import NotificationScreen  from '../screens/resident/notifications/NotificationScreen';
import NoticeBoardScreen   from '../screens/resident/notifications/NoticeBoardScreen';
// Security additions
import DeliveryPassScreen    from '../screens/resident/visitors/DeliveryPassScreen';
import BlacklistViewScreen   from '../screens/resident/visitors/BlacklistViewScreen';
// Vehicle management
import VehicleManagementScreen from '../screens/resident/parking/VehicleManagementScreen';
// Amenity waitlist
import AmenityWaitlistScreen from '../screens/resident/amenities/AmenityWaitlistScreen';
// Reports
import ResidentReportsScreen from '../screens/resident/reports/ResidentReportsScreen';
// Profile sub-screens
import PersonalInfoScreen        from '../screens/resident/profile/PersonalInfoScreen';
import UnitDetailsScreen         from '../screens/resident/profile/UnitDetailsScreen';
import NotificationSettingsScreen from '../screens/resident/profile/NotificationSettingsScreen';
import HelpSupportScreen         from '../screens/resident/profile/HelpSupportScreen';
import TermsPrivacyScreen        from '../screens/resident/profile/TermsPrivacyScreen';
import ResidentActivitySpending from '../screens/resident/profile/ResidentActivitySpending';
import { MySpendingsScreen }    from '../screens/resident/profile/ResidentActivitySpending';
import ResidentChatScreen       from '../screens/resident/profile/ResidentChat';
import ResidentProfileScreen    from '../screens/resident/profile/ResidentProfileScreen';
// Verification
import VerificationScreen        from '../screens/auth/VerificationScreen';

const Stack = createNativeStackNavigator();

function ResidentStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      {/* Dashboard */}
      <Stack.Screen name="ResidentDashboard" component={ResidentDashboard} />
      {/* Visitors */}
      <Stack.Screen name="VisitorList"       component={VisitorListScreen} />
      <Stack.Screen name="ResidentVisitors"  component={VisitorListScreen} />
      <Stack.Screen name="AddVisitor"        component={AddVisitorScreen} />
      <Stack.Screen name="VisitorQRCode"     component={VisitorQRCodeScreen} />
      {/* Billing */}
      <Stack.Screen name="BillingList"       component={BillingListScreen} />
      <Stack.Screen name="ResidentBilling"   component={BillingListScreen} />
      <Stack.Screen name="InvoiceDetail"     component={InvoiceDetailScreen} />
      <Stack.Screen name="Payment"           component={PaymentScreen} />
      {/* Maintenance */}
      <Stack.Screen name="ResidentMaintenance"    component={ResidentMaintenanceScreen} />
      <Stack.Screen name="ResidentMaintenanceTab" component={ResidentMaintenanceScreen} />
      {/* Amenities */}
      <Stack.Screen name="Amenities"              component={AmenitiesScreen} />
      <Stack.Screen name="AmenityBooking"         component={BookingScreen} />
      <Stack.Screen name="AmenityPayment"         component={AmenityPaymentScreen} />
      <Stack.Screen name="AmenityConfirmation"    component={AmenityConfirmationScreen} />
      {/* EV Charging */}
      <Stack.Screen name="EVCharging"        component={EVListScreen} />
      <Stack.Screen name="EVList"            component={EVListScreen} />
      <Stack.Screen name="EVBookSlot"        component={EVBookSlotScreen} />
      <Stack.Screen name="EVPayment"         component={EVPaymentScreen} />
      <Stack.Screen name="EVConfirmation"    component={EVConfirmationScreen} />
      {/* Shop (Vendor Grocery Marketplace) */}
      <Stack.Screen name="MarketHome"             component={MarketHomeScreen} />
      <Stack.Screen name="ResidentMarketHome"     component={MarketHomeScreen} />
      <Stack.Screen name="ProductDetail"          component={ProductDetailScreen} />
      <Stack.Screen name="ResidentProductDetail"  component={ProductDetailScreen} />
      <Stack.Screen name="ResidentCart"           component={CartScreen} />
      <Stack.Screen name="ResidentOrderTracking"  component={OrderTrackingScreen} />
      <Stack.Screen name="OrderHistory"              component={OrderHistoryScreen} />
      {/* Buy/Sell (P2P — resident-to-resident listings) */}
      <Stack.Screen name="BuySell"                component={BuySellScreen} />
      {/* Wishlist */}
      <Stack.Screen name="Wishlist"               component={WishlistScreen} />
      {/* Rate Vendor */}
      <Stack.Screen name="RateVendor"             component={RateVendorScreen} />
      {/* Parking */}
      <Stack.Screen name="GuestParking"      component={GuestParkingScreen} />
      <Stack.Screen name="ParkingSlotPass"   component={ParkingSlotPassScreen} />
      {/* GPS / RealEstate / SOS */}
      <Stack.Screen name="GPSDashboard"      component={GPSDashboard} />
      <Stack.Screen name="ResidentGPS"       component={GPSDashboard} />
      <Stack.Screen name="RealEstate"        component={RealEstateScreen} />
      <Stack.Screen name="SOSTracking"       component={SOSTrackingScreen} />
      {/* Notifications */}
      <Stack.Screen name="Notifications"         component={NotificationScreen} />
      <Stack.Screen name="ResidentNotifications" component={NotificationScreen} />
      <Stack.Screen name="NoticeBoard"           component={NoticeBoardScreen} />
      {/* Security — new screens */}
      <Stack.Screen name="DeliveryPass"      component={DeliveryPassScreen} />
      <Stack.Screen name="BlacklistView"     component={BlacklistViewScreen} />
      {/* Vehicle management */}
      <Stack.Screen name="VehicleManagement" component={VehicleManagementScreen} />
      {/* Amenity waitlist */}
      <Stack.Screen name="AmenityWaitlist"   component={AmenityWaitlistScreen} />
      {/* Reports */}
      <Stack.Screen name="ResidentReports"   component={ResidentReportsScreen} />
      {/* Profile sub-screens */}
      <Stack.Screen name="PersonalInfo"              component={PersonalInfoScreen} />
      <Stack.Screen name="UnitDetails"               component={UnitDetailsScreen} />
      <Stack.Screen name="NotificationSettings"      component={NotificationSettingsScreen} />
      <Stack.Screen name="HelpSupport"               component={HelpSupportScreen} />
      <Stack.Screen name="TermsPrivacy"              component={TermsPrivacyScreen} />
      <Stack.Screen name="Profile"                   component={ResidentProfileScreen} />
      <Stack.Screen name="ResidentProfile"           component={ResidentProfileScreen} />
      <Stack.Screen name="ResidentActivitySpending"  component={ResidentActivitySpending} />
      <Stack.Screen name="ResidentSpendings"         component={MySpendingsScreen} />
      <Stack.Screen name="ResidentChat"              component={ResidentChatScreen} />
      {/* Verification */}
      <Stack.Screen name="Verification"              component={VerificationScreen} />
    </Stack.Navigator>
  );
}

export default function ResidentNavigator() {
  return (
    <RoleGuard allowed={['resident']}>
      <ResidentStack />
    </RoleGuard>
  );
}