


import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

import { useAppContext } from "../superadmin/SocietyContext";
import BuilderBottomNav from "./BuilderBottomNav";

const COLORS = {
  navy: "#1A7A7A",
  navy2: "#1A7A7A",
  white: "#FFFFFF",
  bg: "#E8F5F5",
  gold: "#f9b6b6",
  blue: "#2563EB",
  green: "#16A34A",
  orange: "#F59E0B",
  purple: "#7C3AED",
  red: "#DC2626",
  sub: "#64748B",
  text: "#111827",
};

const formatMoney = (amount) => {
  const value = Number(amount || 0);
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  return `₹${value.toLocaleString("en-IN")}`;
};

function Header({ navigation, unreadCount, builderId }) {
  return (
    <View style={styles.header}>
      <StatusBar backgroundColor={COLORS.navy} barStyle="light-content" />

      <View style={styles.headerTop}>
        <MaterialCommunityIcons
          name="office-building"
          size={26}
          color={COLORS.gold}
        />

        <View style={{ flex: 1, marginLeft: 8 }}>
          <Text style={styles.headerTitle}>Builder Console</Text>
          <Text style={styles.headerSub}>
            Projects, customers, bookings & payments
          </Text>
        </View>

        <TouchableOpacity
          style={styles.headerIcon}
          activeOpacity={0.85}
          onPress={() =>
            navigation.navigate("BuilderNotificationScreen", {
              builderId,
            })
          }
        >
          <Ionicons name="notifications-outline" size={22} color={COLORS.white} />

          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {unreadCount > 9 ? "9+" : unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

function StatCard({ icon, label, value, color, onPress }) {
  return (
    <TouchableOpacity style={styles.statCard} activeOpacity={0.9} onPress={onPress}>
      <View style={[styles.statIcon, { backgroundColor: color + "22" }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>

      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function QuickAction({ icon, title, subtitle, color, onPress }) {
  return (
    <TouchableOpacity style={styles.actionCard} activeOpacity={0.9} onPress={onPress}>
      <View style={[styles.actionIcon, { backgroundColor: color + "22" }]}>
        <Ionicons name={icon} size={21} color={color} />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionSub}>{subtitle}</Text>
      </View>

      <Ionicons name="chevron-forward" size={18} color={COLORS.sub} />
    </TouchableOpacity>
  );
}

export default function BuilderDashboard({ navigation, route }) {
  const {
    builderProjects = [],
    visitRequests = [],
    flatBookingRequests = [],
    getUnreadNotificationCount,
    getBookingTotalAmount,
  } = useAppContext();

  const builderId =
    route?.params?.builderId ||
    route?.params?.builder?.id ||
    "BLD-001";

  const builderProjectsOnly = useMemo(() => {
    const filtered = builderProjects.filter(
      (project) => !project.builderId || project.builderId === builderId
    );

    return filtered.length > 0 ? filtered : builderProjects;
  }, [builderProjects, builderId]);

  const fallbackProject = {
    id: "demo-project",
    builderId,
    name: "Bliss Heights",
    projectName: "Bliss Heights",
    location: "Hyderabad",
    units: [
      { id: "u1", flatNo: "A-101" },
      { id: "u2", flatNo: "A-102" },
      { id: "u3", flatNo: "B-201" },
      { id: "u4", flatNo: "B-202" },
    ],
  };

  const allProjects =
    builderProjectsOnly.length > 0 ? builderProjectsOnly : [fallbackProject];

  const [selectedProjectId, setSelectedProjectId] = useState(allProjects[0]?.id);

  const selectedProject = useMemo(
    () => allProjects.find((p) => p.id === selectedProjectId) || allProjects[0],
    [allProjects, selectedProjectId]
  );

  const unreadCount = getUnreadNotificationCount
    ? getUnreadNotificationCount(builderId)
    : 0;

  const stats = useMemo(() => {
    const projectVisits = visitRequests.filter(
      (v) =>
        v.projectId === selectedProject?.id &&
        (!v.builderId || v.builderId === builderId)
    );

    const projectBookings = flatBookingRequests.filter(
      (b) =>
        b.projectId === selectedProject?.id &&
        (!b.builderId || b.builderId === builderId)
    );

    const collected = projectBookings.reduce(
      (sum, item) => sum + Number(item.paidAmount || 0),
      0
    );

    const totalValue = projectBookings.reduce((sum, item) => {
      if (typeof getBookingTotalAmount === "function") {
        return sum + getBookingTotalAmount(item);
      }

      return sum + Number(item.totalAmount || item.bookingAmount || 0);
    }, 0);

    const pending = Math.max(totalValue - collected, 0);

    const pendingCustomerRequests = projectBookings.filter(
      (item) => item.status === "Pending Approval"
    ).length;

    return {
      totalUnits: selectedProject?.units?.length || 0,
      visits: projectVisits.length,
      bookings: projectBookings.length,
      customerRequests: pendingCustomerRequests,
      collected,
      pending,
    };
  }, [
    selectedProject,
    visitRequests,
    flatBookingRequests,
    builderId,
    getBookingTotalAmount,
  ]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.screen}>
        <Header
          navigation={navigation}
          unreadCount={unreadCount}
          builderId={builderId}
        />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.heroCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroLabel}>Active Project</Text>
              <Text style={styles.heroTitle}>
                {selectedProject?.name ||
                  selectedProject?.projectName ||
                  "No Project"}
              </Text>
              <Text style={styles.heroSub}>
                {selectedProject?.location || "Add your first project"}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.heroBtn}
              activeOpacity={0.85}
              onPress={() =>
                navigation.navigate("BuilderProjectSetup", {
                  project: selectedProject,
                  builderId,
                })
              }
            >
              <Text style={styles.heroBtnText}>Manage</Text>
            </TouchableOpacity>
          </View>

          {allProjects.length > 1 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.projectScroll}
            >
              {allProjects.map((project) => (
                <TouchableOpacity
                  key={project.id}
                  style={[
                    styles.projectPill,
                    selectedProject?.id === project.id &&
                      styles.projectPillActive,
                  ]}
                  activeOpacity={0.85}
                  onPress={() => setSelectedProjectId(project.id)}
                >
                  <Text
                    style={[
                      styles.projectPillText,
                      selectedProject?.id === project.id &&
                        styles.projectPillTextActive,
                    ]}
                  >
                    {project.name || project.projectName}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          <View style={styles.statsGrid}>
            <StatCard
              icon="grid-outline"
              label="Total Units"
              value={stats.totalUnits}
              color={COLORS.blue}
              onPress={() =>
                navigation.navigate("BuilderUnitInventory", {
                  project: selectedProject,
                  builderId,
                })
              }
            />

            <StatCard
              icon="calendar-outline"
              label="Visits"
              value={stats.visits}
              color={COLORS.orange}
              onPress={() =>
                navigation.navigate("BuilderVisitBooking", {
                  project: selectedProject,
                  builderId,
                })
              }
            />

            <StatCard
              icon="receipt-outline"
              label="Bookings"
              value={stats.bookings}
              color={COLORS.gold}
              onPress={() =>
                navigation.navigate("BuilderUnitBooking", {
                  project: selectedProject,
                  builderId,
                })
              }
            />

            <StatCard
              icon="wallet-outline"
              label="Collected"
              value={formatMoney(stats.collected)}
              color={COLORS.green}
              onPress={() =>
                navigation.navigate("BuilderPaymentSchedule", {
                  project: selectedProject,
                  builderId,
                })
              }
            />

            <StatCard
              icon="time-outline"
              label="Pending"
              value={formatMoney(stats.pending)}
              color={COLORS.red}
              onPress={() =>
                navigation.navigate("BuilderPaymentSchedule", {
                  project: selectedProject,
                  builderId,
                })
              }
            />
            
          </View>

          <Text style={styles.sectionTitle}>Quick Actions</Text>

          <QuickAction
            icon="business-outline"
            title="Project Setup"
            subtitle="Manage projects, units and availability"
            color={COLORS.blue}
            onPress={() =>
              navigation.navigate("BuilderProjectSetup", {
                project: selectedProject,
                builderId,
              })
            }
          />

          <QuickAction
            icon="calendar-outline"
            title="Guest Visits"
            subtitle="Manage site and virtual visits"
            color={COLORS.orange}
            onPress={() =>
              navigation.navigate("BuilderVisitBooking", {
                project: selectedProject,
                builderId,
              })
            }
          />

          <QuickAction
            icon="document-text-outline"
            title="Guest Bookings"
            subtitle="Approve and verify bookings"
            color={COLORS.gold}
            onPress={() =>
              navigation.navigate("BuilderUnitBooking", {
                project: selectedProject,
                builderId,
              })
            }
          />

          <QuickAction
            icon="card-outline"
            title="Payments"
            subtitle="Track collections and receipts"
            color={COLORS.green}
            onPress={() =>
              navigation.navigate("BuilderPaymentSchedule", {
                project: selectedProject,
                builderId,
              })
            }
          />

          <QuickAction
            icon="shield-checkmark-outline"
            title="Compliance Documents"
            subtitle="Upload RERA, NOCs and legal documents"
            color={COLORS.red}
            onPress={() =>
              navigation.navigate("BuilderComplianceTracking", {
                project: selectedProject,
                builderId,
              })
            }
          />

          <QuickAction
            icon="cube-outline"
            title="Material Management"
            subtitle="Track cement, steel and construction materials"
            color={COLORS.orange}
            onPress={() => navigation.navigate("MaterialManagement")}
          />
        </ScrollView>

        <BuilderBottomNav
          navigation={navigation}
          activeRoute="BuilderDashboard"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.navy },
  screen: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    backgroundColor: COLORS.navy,
    paddingTop: Platform.OS === "android" ? 14 : 4,
    paddingHorizontal: 16,
    paddingBottom: 18,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
  },
  headerTop: {
    marginTop: 30,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerTitle: { color: COLORS.white, fontSize: 20, fontWeight: "900" },
  headerSub: {
    color: "#CBD5E1",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },
  headerIcon: {
    width: 42,
    height: 42,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: 6,
    right: 6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.red,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: { color: COLORS.white, fontSize: 9, fontWeight: "900" },
  scroll: { flex: 1 },
  heroCard: {
    backgroundColor: COLORS.navy2,
    borderRadius: 40,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  heroLabel: {
    color: COLORS.gold,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  heroTitle: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: "900",
    marginTop: 4,
  },
  heroSub: {
    color: "#CBD5E1",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },
  heroBtn: {
    backgroundColor: COLORS.gold,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 16,
    marginLeft: 12,
  },
  heroBtnText: { color: COLORS.navy, fontWeight: "900", fontSize: 12 },
  projectScroll: {
    gap: 10,
    paddingTop: 14,
  },
  projectPill: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 999,
  },
  projectPillActive: {
    backgroundColor: COLORS.navy,
  },
  projectPillText: {
    color: COLORS.sub,
    fontSize: 12,
    fontWeight: "800",
  },
  projectPillTextActive: {
    color: COLORS.white,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 16,
    justifyContent: "space-between",
    rowGap: 10,
  },
  statCard: {
    width: "48%",
    backgroundColor: COLORS.white,
    borderRadius: 22,
    padding: 14,
  },
  statIcon: {
    width: 38,
    height: 38,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  statValue: { color: COLORS.text, fontSize: 21, fontWeight: "900" },
  statLabel: {
    color: COLORS.sub,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 3,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "900",
    marginTop: 20,
    marginBottom: 4,
  },
  actionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 10,
  },
  actionIcon: {
    width: 42,
    height: 42,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  actionTitle: { color: COLORS.text, fontSize: 14, fontWeight: "900" },
  actionSub: {
    color: COLORS.sub,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 3,
  },
});   








































// import React, { useMemo, useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   TouchableOpacity,
//   SafeAreaView,
//   StatusBar,
//   Platform,
// } from "react-native";
// import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

// import { useAppContext } from "../superadmin/SocietyContext";
// import BuilderBottomNav from "./BuilderBottomNav";

// const COLORS = {
//   navy: "#0F172A",
//   navy2: "#1E293B",
//   white: "#FFFFFF",
//   bg: "#F3F4F6",
//   gold: "#C9A84C",
//   blue: "#2563EB",
//   green: "#16A34A",
//   orange: "#F59E0B",
//   purple: "#7C3AED",
//   red: "#DC2626",
//   sub: "#64748B",
//   text: "#111827",
// };

// const formatMoney = (amount) => {
//   const value = Number(amount || 0);
//   if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
//   if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
//   return `₹${value.toLocaleString("en-IN")}`;
// };

// function Header({ navigation, unreadCount, builderId, builderName }) {
//   return (
//     <View style={styles.header}>
//       <StatusBar backgroundColor={COLORS.navy} barStyle="light-content" />

//       <View style={styles.headerTop}>
//         <MaterialCommunityIcons name="office-building" size={26} color={COLORS.gold} />

//         <View style={{ flex: 1, marginLeft: 8 }}>
//           <Text style={styles.headerTitle}>Builder Console</Text>
//           <Text style={styles.headerSub}>
//             {builderName || "Projects, customers, bookings & payments"}
//           </Text>
//         </View>

//         <TouchableOpacity
//           style={styles.headerIcon}
//           activeOpacity={0.85}
//           onPress={() =>
//             navigation.navigate("BuilderNotificationScreen", {
//               builderId,
//             })
//           }
//         >
//           <Ionicons name="notifications-outline" size={22} color={COLORS.white} />

//           {unreadCount > 0 && (
//             <View style={styles.badge}>
//               <Text style={styles.badgeText}>
//                 {unreadCount > 9 ? "9+" : unreadCount}
//               </Text>
//             </View>
//           )}
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// }

// function StatCard({ icon, label, value, color, onPress }) {
//   return (
//     <TouchableOpacity style={styles.statCard} activeOpacity={0.9} onPress={onPress}>
//       <View style={[styles.statIcon, { backgroundColor: color + "22" }]}>
//         <Ionicons name={icon} size={20} color={color} />
//       </View>

//       <Text style={styles.statValue}>{value}</Text>
//       <Text style={styles.statLabel}>{label}</Text>
//     </TouchableOpacity>
//   );
// }

// function QuickAction({ icon, title, subtitle, color, onPress }) {
//   return (
//     <TouchableOpacity style={styles.actionCard} activeOpacity={0.9} onPress={onPress}>
//       <View style={[styles.actionIcon, { backgroundColor: color + "22" }]}>
//         <Ionicons name={icon} size={21} color={color} />
//       </View>

//       <View style={{ flex: 1 }}>
//         <Text style={styles.actionTitle}>{title}</Text>
//         <Text style={styles.actionSub}>{subtitle}</Text>
//       </View>

//       <Ionicons name="chevron-forward" size={18} color={COLORS.sub} />
//     </TouchableOpacity>
//   );
// }

// export default function BuilderDashboard({ navigation, route }) {
//   const {
//     builderProjects = [],
//     visitRequests = [],
//     flatBookingRequests = [],
//     getUnreadNotificationCount,
//     getBookingTotalAmount,
//   } = useAppContext();

//   const currentBuilder = route?.params?.builder || null;

//   const builderId =
//     route?.params?.builderId ||
//     currentBuilder?.id ||
//     "BLD-001";

//   const builderName =
//     currentBuilder?.companyName ||
//     currentBuilder?.name ||
//     "Builder Dashboard";

//   const builderProjectsOnly = useMemo(() => {
//     return builderProjects.filter((project) => project.builderId === builderId);
//   }, [builderProjects, builderId]);

//   const fallbackProject = {
//     id: "demo-project",
//     builderId,
//     name: "No Project Yet",
//     projectName: "No Project Yet",
//     location: "Create or wait for Super Admin project approval",
//     units: [],
//   };

//   const allProjects =
//     builderProjectsOnly.length > 0 ? builderProjectsOnly : [fallbackProject];

//   const [selectedProjectId, setSelectedProjectId] = useState(allProjects[0]?.id);

//   useEffect(() => {
//     if (!allProjects.some((p) => p.id === selectedProjectId)) {
//       setSelectedProjectId(allProjects[0]?.id);
//     }
//   }, [allProjects, selectedProjectId]);

//   const selectedProject = useMemo(
//     () => allProjects.find((p) => p.id === selectedProjectId) || allProjects[0],
//     [allProjects, selectedProjectId]
//   );

//   const unreadCount =
//     typeof getUnreadNotificationCount === "function"
//       ? getUnreadNotificationCount(builderId)
//       : 0;

//   const stats = useMemo(() => {
//     const projectVisits = visitRequests.filter(
//       (v) => v.projectId === selectedProject?.id && v.builderId === builderId
//     );

//     const projectBookings = flatBookingRequests.filter(
//       (b) => b.projectId === selectedProject?.id && b.builderId === builderId
//     );

//     const collected = projectBookings.reduce(
//       (sum, item) => sum + Number(item.paidAmount || 0),
//       0
//     );

//     const totalValue = projectBookings.reduce((sum, item) => {
//       if (typeof getBookingTotalAmount === "function") {
//         return sum + getBookingTotalAmount(item);
//       }

//       return sum + Number(item.totalAmount || item.bookingAmount || 0);
//     }, 0);

//     const pending = Math.max(totalValue - collected, 0);

//     const pendingCustomerRequests = projectBookings.filter(
//       (item) => item.status === "Pending Approval"
//     ).length;

//     return {
//       totalUnits: selectedProject?.units?.length || 0,
//       visits: projectVisits.length,
//       bookings: projectBookings.length,
//       customerRequests: pendingCustomerRequests,
//       collected,
//       pending,
//     };
//   }, [
//     selectedProject,
//     visitRequests,
//     flatBookingRequests,
//     builderId,
//     getBookingTotalAmount,
//   ]);

//   const goTo = (screen, extra = {}) => {
//     navigation.navigate(screen, {
//       project: selectedProject,
//       builderId,
//       builder: currentBuilder,
//       ...extra,
//     });
//   };

//   return (
//     <SafeAreaView style={styles.safe}>
//       <View style={styles.screen}>
//         <Header
//           navigation={navigation}
//           unreadCount={unreadCount}
//           builderId={builderId}
//           builderName={builderName}
//         />

//         <ScrollView
//           style={styles.scroll}
//           contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
//           showsVerticalScrollIndicator={false}
//         >
//           <View style={styles.heroCard}>
//             <View style={{ flex: 1 }}>
//               <Text style={styles.heroLabel}>Active Project</Text>
//               <Text style={styles.heroTitle}>
//                 {selectedProject?.name || selectedProject?.projectName || "No Project"}
//               </Text>
//               <Text style={styles.heroSub}>
//                 {selectedProject?.location || "Add your first project"}
//               </Text>
//             </View>

//             <TouchableOpacity
//               style={styles.heroBtn}
//               activeOpacity={0.85}
//               onPress={() => goTo("BuilderProjectSetup")}
//             >
//               <Text style={styles.heroBtnText}>Manage</Text>
//             </TouchableOpacity>
//           </View>

//           {allProjects.length > 1 && (
//             <ScrollView
//               horizontal
//               showsHorizontalScrollIndicator={false}
//               contentContainerStyle={styles.projectScroll}
//             >
//               {allProjects.map((project) => (
//                 <TouchableOpacity
//                   key={project.id}
//                   style={[
//                     styles.projectPill,
//                     selectedProject?.id === project.id && styles.projectPillActive,
//                   ]}
//                   activeOpacity={0.85}
//                   onPress={() => setSelectedProjectId(project.id)}
//                 >
//                   <Text
//                     style={[
//                       styles.projectPillText,
//                       selectedProject?.id === project.id && styles.projectPillTextActive,
//                     ]}
//                   >
//                     {project.name || project.projectName}
//                   </Text>
//                 </TouchableOpacity>
//               ))}
//             </ScrollView>
//           )}

//           <View style={styles.statsGrid}>
//             <StatCard
//               icon="grid-outline"
//               label="Total Units"
//               value={stats.totalUnits}
//               color={COLORS.blue}
//               onPress={() => goTo("BuilderUnitInventory")}
//             />

//             <StatCard
//               icon="calendar-outline"
//               label="Visits"
//               value={stats.visits}
//               color={COLORS.orange}
//               onPress={() => goTo("BuilderVisitBooking")}
//             />

//             <StatCard
//               icon="receipt-outline"
//               label="Bookings"
//               value={stats.bookings}
//               color={COLORS.gold}
//               onPress={() => goTo("BuilderUnitBooking")}
//             />

//             <StatCard
//               icon="wallet-outline"
//               label="Collected"
//               value={formatMoney(stats.collected)}
//               color={COLORS.green}
//               onPress={() => goTo("BuilderPaymentSchedule")}
//             />

//             <StatCard
//               icon="time-outline"
//               label="Pending"
//               value={formatMoney(stats.pending)}
//               color={COLORS.red}
//               onPress={() => goTo("BuilderPaymentSchedule")}
//             />

//             <StatCard
//               icon="people-outline"
//               label="Requests"
//               value={stats.customerRequests}
//               color={COLORS.purple}
//               onPress={() => goTo("BuilderUnitBooking")}
//             />
//           </View>

//           <Text style={styles.sectionTitle}>Quick Actions</Text>

//           <QuickAction
//             icon="business-outline"
//             title="Project Setup"
//             subtitle="Manage projects, units and availability"
//             color={COLORS.blue}
//             onPress={() => goTo("BuilderProjectSetup")}
//           />

//           <QuickAction
//             icon="calendar-outline"
//             title="Guest Visits"
//             subtitle="Manage site and virtual visits"
//             color={COLORS.orange}
//             onPress={() => goTo("BuilderVisitBooking")}
//           />

//           <QuickAction
//             icon="document-text-outline"
//             title="Guest Bookings"
//             subtitle="Approve and verify bookings"
//             color={COLORS.gold}
//             onPress={() => goTo("BuilderUnitBooking")}
//           />

//           <QuickAction
//             icon="card-outline"
//             title="Payments"
//             subtitle="Track collections and receipts"
//             color={COLORS.green}
//             onPress={() => goTo("BuilderPaymentSchedule")}
//           />

//           <QuickAction
//             icon="shield-checkmark-outline"
//             title="Compliance Documents"
//             subtitle="Upload RERA, NOCs and legal documents"
//             color={COLORS.red}
//             onPress={() => goTo("BuilderComplianceTracking")}
//           />
//         </ScrollView>

//         <BuilderBottomNav
//           navigation={navigation}
//           activeRoute="BuilderDashboard"
//         />
//       </View>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safe: { flex: 1, backgroundColor: COLORS.navy },
//   screen: { flex: 1, backgroundColor: COLORS.bg },
//   header: {
//     backgroundColor: COLORS.navy,
//     paddingTop: Platform.OS === "android" ? 14 : 4,
//     paddingHorizontal: 16,
//     paddingBottom: 18,
//     borderBottomLeftRadius: 26,
//     borderBottomRightRadius: 26,
//   },
//   headerTop: {
//     marginTop: 30,
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 12,
//   },
//   headerTitle: { color: COLORS.white, fontSize: 20, fontWeight: "900" },
//   headerSub: {
//     color: "#CBD5E1",
//     fontSize: 12,
//     fontWeight: "600",
//     marginTop: 2,
//   },
//   headerIcon: {
//     width: 42,
//     height: 42,
//     borderRadius: 16,
//     backgroundColor: "rgba(255,255,255,0.12)",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   badge: {
//     position: "absolute",
//     top: 6,
//     right: 6,
//     minWidth: 16,
//     height: 16,
//     borderRadius: 8,
//     backgroundColor: COLORS.red,
//     alignItems: "center",
//     justifyContent: "center",
//     paddingHorizontal: 4,
//   },
//   badgeText: { color: COLORS.white, fontSize: 9, fontWeight: "900" },
//   scroll: { flex: 1 },
//   heroCard: {
//     backgroundColor: COLORS.navy2,
//     borderRadius: 24,
//     padding: 18,
//     flexDirection: "row",
//     alignItems: "center",
//     marginTop: 8,
//   },
//   heroLabel: {
//     color: COLORS.gold,
//     fontSize: 12,
//     fontWeight: "900",
//     textTransform: "uppercase",
//     letterSpacing: 0.5,
//   },
//   heroTitle: {
//     color: COLORS.white,
//     fontSize: 22,
//     fontWeight: "900",
//     marginTop: 4,
//   },
//   heroSub: {
//     color: "#CBD5E1",
//     fontSize: 12,
//     fontWeight: "600",
//     marginTop: 4,
//   },
//   heroBtn: {
//     backgroundColor: COLORS.gold,
//     paddingHorizontal: 16,
//     paddingVertical: 11,
//     borderRadius: 16,
//     marginLeft: 12,
//   },
//   heroBtnText: { color: COLORS.navy, fontWeight: "900", fontSize: 12 },
//   projectScroll: {
//     gap: 10,
//     paddingTop: 14,
//   },
//   projectPill: {
//     backgroundColor: COLORS.white,
//     paddingHorizontal: 13,
//     paddingVertical: 9,
//     borderRadius: 999,
//   },
//   projectPillActive: {
//     backgroundColor: COLORS.navy,
//   },
//   projectPillText: {
//     color: COLORS.sub,
//     fontSize: 12,
//     fontWeight: "800",
//   },
//   projectPillTextActive: {
//     color: COLORS.white,
//   },
//   statsGrid: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     marginTop: 16,
//     justifyContent: "space-between",
//     rowGap: 10,
//   },
//   statCard: {
//     width: "48%",
//     backgroundColor: COLORS.white,
//     borderRadius: 22,
//     padding: 14,
//   },
//   statIcon: {
//     width: 38,
//     height: 38,
//     borderRadius: 15,
//     alignItems: "center",
//     justifyContent: "center",
//     marginBottom: 12,
//   },
//   statValue: { color: COLORS.text, fontSize: 21, fontWeight: "900" },
//   statLabel: {
//     color: COLORS.sub,
//     fontSize: 12,
//     fontWeight: "700",
//     marginTop: 3,
//   },
//   sectionTitle: {
//     color: COLORS.text,
//     fontSize: 18,
//     fontWeight: "900",
//     marginTop: 20,
//     marginBottom: 4,
//   },
//   actionCard: {
//     backgroundColor: COLORS.white,
//     borderRadius: 20,
//     padding: 14,
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 12,
//     marginTop: 10,
//   },
//   actionIcon: {
//     width: 42,
//     height: 42,
//     borderRadius: 16,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   actionTitle: { color: COLORS.text, fontSize: 14, fontWeight: "900" },
//   actionSub: {
//     color: COLORS.sub,
//     fontSize: 12,
//     fontWeight: "600",
//     marginTop: 3,
//   },
// });