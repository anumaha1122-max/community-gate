

// import React from 'react';
// import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// import { LinearGradient } from 'expo-linear-gradient';

// import ScreenWrapper from '../../components/SAScreenWrapper';
// import AppHeader from '../../components/SAAppHeader';
// import SectionHeader from '../../components/SASectionHeader';
// import StatCard from '../../components/SAStatCard';
// import ActionTile from '../../components/SAActionTile';
// import ListCard from '../../components/SAListCard';

// import COLORS from '../../theme/SAcolors';
// import SPACING from '../../theme/spacing';

// import {
//   dashboardStats,
//   quickActions,
//   activityFeed,
// } from '../../data/superAdminData';

// import { useAppContext } from '../superadmin/SocietyContext';

// export default function DashboardScreen({ navigation }) {
//   const {
//     societies = [],
//     builders = [],
//     adminRequests = [],
//     societyRequests = [],
//     projectRequests = [],
//   } = useAppContext();

//   const activeBuildersCount = builders.filter(
//     (builder) => builder.status === 'Approved'
//   ).length;

//   const notificationCount =
//     builders.filter((builder) => builder.status === 'Pending').length +
//     adminRequests.filter((request) => request.status === 'Pending').length +
//     societyRequests.filter((request) => request.status === 'Pending').length +
//     projectRequests.filter((request) => request.status === 'Pending').length;

//   const openRoute = (routeName, params = {}) => {
//     const parentNav = navigation.getParent();

//     if (parentNav) {
//       parentNav.navigate(routeName, params);
//     } else {
//       navigation.navigate(routeName, params);
//     }
//   };

//   return (
//     <ScreenWrapper>
//       <ScrollView showsVerticalScrollIndicator={false}>
//         <AppHeader
//           title="Hii, SuperAdmin!"
//           subtitle="Platform owner · Super Admin"
//           showNotification={true}
//           notificationCount={notificationCount}
//           onNotificationPress={() => openRoute('SuperAdminNotifications')}
//         />

//         <View style={styles.heroWrap}>
//           <LinearGradient
//             colors={[COLORS.navyStart, COLORS.primaryNavy, COLORS.navyEnd]}
//             style={styles.heroCard}
//           >
//             <View style={{ flex: 1 }}>
//               <Text style={styles.heroTitle}>Master Platform Control</Text>

//               <Text style={styles.heroSubtitle}>
//                 Monitor societies, approve builders, manage subscriptions and
//                 track platform performance.
//               </Text>

//               <TouchableOpacity
//                 style={styles.heroBtn}
//                 activeOpacity={0.85}
//                 onPress={() => navigation.navigate('Societies')}
//               >
//                 <Text style={styles.heroBtnText}>Review Society Requests</Text>
//               </TouchableOpacity>
//             </View>
//           </LinearGradient>
//         </View>

//         <SectionHeader title="Today's Overview" />

//         <View style={styles.statsWrap}>
//           {dashboardStats.map((item) => (
//             <StatCard
//               key={item.id}
//               title={item.title}
//               value={
//                 item.title === 'Total Societies'
//                   ? societies.length
//                   : item.title === 'Active Builders'
//                   ? activeBuildersCount
//                   : item.value
//               }
//               change={item.change}
//               onPress={() => {
//                 if (item.title === 'Total Societies') {
//                   openRoute('TotalSocietiesDetails');
//                 } else if (item.title === 'Active Builders') {
//                   openRoute('Builders');
//                 } else if (item.title === 'Revenue') {
//                   openRoute('RevenueDetails');
//                 } else if (item.title === 'Active Issues') {
//                   openRoute('ActiveIssuesDetails');
//                 }
//               }}
//             />
//           ))}
//         </View>

//         <SectionHeader title="Quick Actions" />

//         {quickActions.map((item) => (
//           <ActionTile
//             key={item.id}
//             title={item.title}
//             subtitle={item.subtitle}
//             icon={item.icon}
//             onPress={() => {
//               switch (item.route) {
//                 case 'Societies':
//                   navigation.navigate('Societies');
//                   break;

//                 case 'AnalyticsTab':
//                   navigation.navigate('AnalyticsTab');
//                   break;

//                 case 'Builders':
//                   openRoute('Builders');
//                   break;

//                 case 'SubscriptionPlans':
//                   openRoute('SubscriptionPlans');
//                   break;

//                 case 'SystemHealth':
//                   openRoute('SystemHealth');
//                   break;

//                 case 'WhiteLabel':
//                   openRoute('WhiteLabel');
//                   break;

//                 case 'NewAdminRequest':
//                   openRoute('NewAdminRequest');
//                   break;

//                 default:
//                   break;
//               }
//             }}
//           />
//         ))}

//         <SectionHeader title="Recent Activity" actionText="Platform Feed" />

//         {activityFeed.map((item) => (
//           <ListCard
//             key={item.id}
//             title={item.title}
//             subtitle={item.time}
//             metaLeft="Live update"
//             metaRight="Super Admin"
//           />
//         ))}
//       </ScrollView>
//     </ScreenWrapper>
//   );
// }

// const styles = StyleSheet.create({
//   heroWrap: {
//     paddingHorizontal: SPACING.lg,
//     marginTop: SPACING.sm,
//   },

//   heroCard: {
//     borderRadius: SPACING.radiusLg,
//     padding: SPACING.lg,
//     minHeight: 180,
//     overflow: 'hidden',
//   },

//   heroTitle: {
//     color: COLORS.white,
//     fontSize: 24,
//     fontWeight: '800',
//   },

//   heroSubtitle: {
//     color: '#DDE5F0',
//     fontSize: 13,
//     lineHeight: 20,
//     marginTop: 10,
//     marginRight: 20,
//   },

//   heroBtn: {
//     marginTop: 18,
//     alignSelf: 'flex-start',
//     backgroundColor: COLORS.gold,
//     borderRadius: 14,
//     paddingVertical: 12,
//     paddingHorizontal: 18,
//   },

//   heroBtnText: {
//     color: COLORS.primaryNavy,
//     fontWeight: '800',
//     fontSize: 13,
//   },

//   statsWrap: {
//     paddingHorizontal: SPACING.lg,
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     justifyContent: 'space-between',
//   },
// });





























import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import ScreenWrapper from '../../components/SAScreenWrapper';
import AppHeader from '../../components/SAAppHeader';
import SectionHeader from '../../components/SASectionHeader';
import StatCard from '../../components/SAStatCard';
import ActionTile from '../../components/SAActionTile';
import ListCard from '../../components/SAListCard';

import COLORS from '../../theme/SAcolors';
import SPACING from '../../theme/spacing';

import {
  dashboardStats,
  quickActions,
  activityFeed,
} from '../../data/superAdminData';

import { useAppContext } from '../superadmin/SocietyContext';

export default function DashboardScreen({ navigation }) {
  const {
    societies = [],
    builders = [],
    adminRequests = [],
    societyRequests = [],
    projectRequests = [],
  } = useAppContext();

  const activeBuildersCount = builders.filter(
    (builder) => builder.status === 'Approved'
  ).length;

  const notificationCount =
    builders.filter((builder) => builder.status === 'Pending').length +
    adminRequests.filter((request) => request.status === 'Pending').length +
    societyRequests.filter((request) => request.status === 'Pending').length +
    projectRequests.filter((request) => request.status === 'Pending').length;

  const openRoute = (routeName, params = {}) => {
    const parentNav = navigation.getParent();

    if (parentNav) {
      parentNav.navigate(routeName, params);
    } else {
      navigation.navigate(routeName, params);
    }
  };

  return (
    <ScreenWrapper>
      <ScrollView showsVerticalScrollIndicator={false}>
        <AppHeader
          title="Hii, SuperAdmin!"
          subtitle="Platform owner · Super Admin"
          showNotification={true}
          notificationCount={notificationCount}
          onNotificationPress={() => openRoute('SuperAdminNotifications')}
        />

        <View style={styles.heroWrap}>
          <LinearGradient
            colors={[COLORS.navyStart, COLORS.primaryNavy, COLORS.navyEnd]}
            style={styles.heroCard}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.heroTitle}>Master Platform Control</Text>

              <Text style={styles.heroSubtitle}>
                Monitor societies, approve builders, manage subscriptions and
                track platform performance.
              </Text>

              <TouchableOpacity
                style={styles.heroBtn}
                activeOpacity={0.85}
                onPress={() => navigation.navigate('Societies')}
              >
                <Text style={styles.heroBtnText}>Review Society Requests</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>

        <SectionHeader title="Today's Overview" />

        <View style={styles.statsWrap}>
          {dashboardStats.map((item) => (
            <StatCard
              key={item.id}
              title={item.title}
              value={
                item.title === 'Total Societies'
                  ? societies.length
                  : item.title === 'Active Builders'
                  ? activeBuildersCount
                  : item.value
              }
              change={item.change}
              onPress={() => {
                if (item.title === 'Total Societies') {
                  openRoute('TotalSocietiesDetails');
                } else if (item.title === 'Active Builders') {
                  openRoute('Builders');
                } else if (item.title === 'Revenue') {
                  openRoute('RevenueDetails');
                } else if (item.title === 'Active Issues') {
                  openRoute('ActiveIssuesDetails');
                }
              }}
            />
          ))}
        </View>

        <SectionHeader title="Quick Actions" />

        {quickActions.map((item) => (
          <ActionTile
            key={item.id}
            title={item.title}
            subtitle={item.subtitle}
            icon={item.icon}
            onPress={() => {
              switch (item.route) {
                case 'Societies':
                  navigation.navigate('Societies');
                  break;

                case 'AnalyticsTab':
                  navigation.navigate('AnalyticsTab');
                  break;

                case 'Builders':
                  openRoute('Builders');
                  break;

                case 'SubscriptionPlans':
                  openRoute('SubscriptionPlans');
                  break;

                case 'SystemHealth':
                  openRoute('SystemHealth');
                  break;

                case 'WhiteLabel':
                  openRoute('WhiteLabel');
                  break;

                case 'NewAdminRequest':
                  openRoute('NewAdminRequest');
                  break;

                default:
                  break;
              }
            }}
          />
        ))}

        <SectionHeader title="Recent Activity" actionText="Platform Feed" />

        {activityFeed.map((item) => (
          <ListCard
            key={item.id}
            title={item.title}
            subtitle={item.time}
            metaLeft="Live update"
            metaRight="Super Admin"
          />
        ))}
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  heroWrap: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.sm,
  },

  heroCard: {
    borderRadius: SPACING.radiusLg,
    padding: SPACING.lg,
    minHeight: 180,
    overflow: 'hidden',
  },

  heroTitle: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: '800',
  },

  heroSubtitle: {
    color: '#DDE5F0',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 10,
    marginRight: 20,
  },

  heroBtn: {
    marginTop: 18,
    alignSelf: 'flex-start',
    backgroundColor: COLORS.gold,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 18,
  },

  heroBtnText: {
    color: COLORS.primaryNavy,
    fontWeight: '800',
    fontSize: 13,
  },

  statsWrap: {
    paddingHorizontal: SPACING.lg,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});
