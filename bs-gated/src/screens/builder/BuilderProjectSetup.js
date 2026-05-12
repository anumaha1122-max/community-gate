

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
  text: "#1A7A7A",
  sub: "#64748B",
  border: "#E5E7EB",
  gold: "#fffff",
  goldSoft: "#FFF7D6",
  blue: "#2563EB",
  blueSoft: "#DBEAFE",
  purple: "#7C3AED",
  purpleSoft: "#F3E8FF",
  orange: "#Ffffff",
  orangeSoft: "#FEF3C7",
  green: "#16A34A",
  greenSoft: "#DCFCE7",
  red: "#DC2626",
  redSoft: "#FEE2E2",
  cyan: "#0891B2",
  cyanSoft: "#ECFEFF",
};

function Header({ navigation }) {
  return (
    <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: 8 }}>
          <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 16, fontWeight: '600' }}>‹ Back</Text>
        </TouchableOpacity>
      <StatusBar backgroundColor={COLORS.navy} barStyle="light-content" />

      <View style={styles.headerTop}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.navigate("BuilderDashboard")}
        >
          <Ionicons name="chevron-back" size={22} color={COLORS.white} />
        </TouchableOpacity>

        <View style={styles.headerIcon}>
          <MaterialCommunityIcons
            name="office-building-cog"
            size={23}
            color={COLORS.navy}
          />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Project Setup</Text>
          <Text style={styles.headerSub}>Approved projects and unit setup</Text>
        </View>

        <TouchableOpacity
          style={styles.notificationBtn}
          onPress={() => navigation.navigate("BuilderNotificationScreen")}
        >
          <Ionicons name="notifications-outline" size={21} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function ApprovalStatusBanner({ project }) {
  if (!project) return null;

  const status = project.approvalStatus || "Pending";

  let bg = COLORS.orangeSoft;
  let border = "#FCD34D";
  let textColor = "#B45309";
  let icon = "time-outline";
  let title = "Pending Admin Approval";
  let sub = "This project is waiting for Super Admin approval.";

  if (status === "Approved") {
    bg = COLORS.greenSoft;
    border = "#86EFAC";
    textColor = COLORS.green;
    icon = "checkmark-circle-outline";
    title = "Project Approved";
    sub = "You can now add units and manage this project.";
  }

  if (status === "Rejected") {
    bg = COLORS.redSoft;
    border = "#FCA5A5";
    textColor = COLORS.red;
    icon = "close-circle-outline";
    title = "Project Rejected";
    sub = "Please review the project and resubmit.";
  }

  return (
    <View style={[styles.approvalBanner, { backgroundColor: bg, borderColor: border }]}>
      <Ionicons name={icon} size={22} color={textColor} />
      <View style={{ flex: 1, marginLeft: 10 }}>
        <Text style={[styles.approvalBannerTitle, { color: textColor }]}>
          {title}
        </Text>
        <Text style={[styles.approvalBannerSub, { color: textColor }]}>
          {sub}
        </Text>
      </View>
    </View>
  );
}

function StepCard({
  number,
  icon,
  title,
  description,
  completed,
  locked,
  lockReason,
  color,
  softColor,
  onPress,
}) {
  return (
    <TouchableOpacity
      style={[styles.stepCard, locked && styles.stepCardLocked]}
      onPress={locked ? null : onPress}
      activeOpacity={locked ? 1 : 0.75}
    >
      <View style={styles.stepLeft}>
        <View
          style={[
            styles.stepNumber,
            completed && styles.stepNumberDone,
            locked && styles.stepNumberLocked,
          ]}
        >
          <Text
            style={[
              styles.stepNumberText,
              completed && styles.stepNumberTextDone,
            ]}
          >
            {completed ? "✓" : locked ? "🔒" : number}
          </Text>
        </View>

        <View
          style={[
            styles.stepIcon,
            { backgroundColor: locked ? "#F1F5F9" : softColor },
          ]}
        >
          <Ionicons name={icon} size={20} color={locked ? COLORS.sub : color} />
        </View>
      </View>

      <View style={{ flex: 1 }}>
        <View style={styles.stepTitleRow}>
          <Text style={[styles.stepTitle, locked && { color: COLORS.sub }]}>
            {title}
          </Text>

          {locked && (
            <View style={styles.lockedBadge}>
              <Text style={styles.lockedBadgeText}>Locked</Text>
            </View>
          )}
        </View>

        <Text style={styles.stepDescription}>
          {locked ? lockReason : description}
        </Text>
      </View>

      {!locked && <Ionicons name="chevron-forward" size={19} color={COLORS.sub} />}
    </TouchableOpacity>
  );
}

function QuickCard({ icon, title, subtitle, color, softColor, locked, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.quickCard, locked && styles.quickCardLocked]}
      onPress={locked ? null : onPress}
      activeOpacity={locked ? 1 : 0.75}
    >
      <View
        style={[
          styles.quickIcon,
          { backgroundColor: locked ? "#F1F5F9" : softColor },
        ]}
      >
        <Ionicons name={icon} size={22} color={locked ? COLORS.sub : color} />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={[styles.quickTitle, locked && { color: COLORS.sub }]}>
          {title}
        </Text>
        <Text style={styles.quickSub}>
          {locked ? "Requires approved project" : subtitle}
        </Text>
      </View>

      <Ionicons
        name={locked ? "lock-closed-outline" : "chevron-forward"}
        size={18}
        color={COLORS.sub}
      />
    </TouchableOpacity>
  );
}

function UnitsPreview({ units, selectedProject, navigation }) {
  return (
    <View style={styles.unitsPreviewCard}>
      <View style={styles.unitsHeader}>
        <View>
          <Text style={styles.unitsTitle}>Project Units</Text>
          <Text style={styles.unitsSub}>
            {units.length > 0
              ? `${units.length} units added for this project`
              : "No units added yet"}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.addUnitSmallBtn}
          onPress={() =>
            navigation.navigate("BuilderUnitInventory", {
              project: selectedProject,
            })
          }
        >
          <Ionicons name="add" size={18} color={COLORS.white} />
          <Text style={styles.addUnitSmallText}>Units</Text>
        </TouchableOpacity>
      </View>

      {units.length === 0 ? (
        <View style={styles.emptyUnitsBox}>
          <Ionicons name="grid-outline" size={26} color={COLORS.sub} />
          <Text style={styles.emptyUnitsTitle}>No units yet</Text>
          <Text style={styles.emptyUnitsSub}>
            Add flats, villas, plots or commercial units from Unit Inventory.
          </Text>
        </View>
      ) : (
        units.slice(0, 4).map((unit, index) => {
          const status = unit.status || "Available";
          const isBooked = status === "Booked";

          return (
            <View key={unit.id || index} style={styles.unitRow}>
              <View style={styles.unitIcon}>
                <Ionicons name="home-outline" size={18} color={COLORS.navy} />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.unitName}>
                  {unit.unitNo ||
                    unit.flatNo ||
                    unit.name ||
                    `Unit ${index + 1}`}
                </Text>

                <Text style={styles.unitMeta}>
                  {unit.type || "Flat"} • {unit.size || unit.area || "Area not set"}
                </Text>
              </View>

              <View
                style={[
                  styles.unitStatusBadge,
                  { backgroundColor: isBooked ? COLORS.redSoft : COLORS.greenSoft },
                ]}
              >
                <Text
                  style={[
                    styles.unitStatusText,
                    { color: isBooked ? COLORS.red : COLORS.green },
                  ]}
                >
                  {status}
                </Text>
              </View>
            </View>
          );
        })
      )}

      {units.length > 4 && (
        <TouchableOpacity
          style={styles.viewAllUnitsBtn}
          onPress={() =>
            navigation.navigate("BuilderUnitInventory", {
              project: selectedProject,
            })
          }
        >
          <Text style={styles.viewAllUnitsText}>View all {units.length} units</Text>
          <Ionicons name="chevron-forward" size={16} color={COLORS.navy} />
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function BuilderProjectSetup({ navigation, route }) {
  const { builderProjects = [] } = useAppContext();

  const routeProject = route?.params?.project;

  const approvedFirstProjects = useMemo(() => {
    return [...builderProjects].sort((a, b) => {
      if (a.approvalStatus === "Approved" && b.approvalStatus !== "Approved") {
        return -1;
      }
      if (a.approvalStatus !== "Approved" && b.approvalStatus === "Approved") {
        return 1;
      }
      return 0;
    });
  }, [builderProjects]);

  const [selectedProjectId, setSelectedProjectId] = useState(
    routeProject?.id || approvedFirstProjects[0]?.id || null
  );

  const selectedProject = useMemo(() => {
    return (
      approvedFirstProjects.find((p) => p.id === selectedProjectId) ||
      approvedFirstProjects[0] ||
      null
    );
  }, [approvedFirstProjects, selectedProjectId]);

  const units = selectedProject?.units || [];
  const documents = selectedProject?.complianceDocuments || [];
  const approvedDocs = documents.filter((d) => d.status === "Approved").length;

  const isProjectApproved = selectedProject?.approvalStatus === "Approved";

  const setupProgress = useMemo(() => {
    let score = 0;

    if (selectedProject?.projectName || selectedProject?.name) score += 33;
    if (isProjectApproved && units.length > 0) score += 33;
    if (isProjectApproved && documents.length > 0) score += 34;

    return score;
  }, [selectedProject, units, documents, isProjectApproved]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.screen}>
        <Header navigation={navigation} />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {approvedFirstProjects.length === 0 ? (
            <View style={styles.noProjectCard}>
              <Ionicons name="business-outline" size={36} color={COLORS.sub} />
              <Text style={styles.noProjectTitle}>No projects found</Text>
              <Text style={styles.noProjectSub}>
                Create a project first and submit it for Super Admin approval.
              </Text>

              <TouchableOpacity
                style={styles.createProjectBtn}
                onPress={() => navigation.navigate("BuilderProjectCreation")}
              >
                <Ionicons name="add-circle-outline" size={18} color={COLORS.white} />
                <Text style={styles.createProjectBtnText}>Create Project</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.heroCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.heroLabel}>Selected Project</Text>

                  <Text style={styles.heroTitle}>
                    {selectedProject?.projectName ||
                      selectedProject?.name ||
                      "No project"}
                  </Text>

                  <Text style={styles.heroSub}>
                    {selectedProject?.location || "Project location"}
                  </Text>

                  <View style={styles.metaRow}>
                    <View style={styles.metaPill}>
                      <Text style={styles.metaPillText}>
                        {selectedProject?.towerCount || 0} Towers
                      </Text>
                    </View>

                    <View style={styles.metaPill}>
                      <Text style={styles.metaPillText}>
                        {selectedProject?.totalUnits || units.length || 0} Units
                      </Text>
                    </View>
                  </View>

                  <View style={styles.progressRow}>
                    <View style={styles.progressTrack}>
                      <View
                        style={[
                          styles.progressFill,
                          { width: `${setupProgress}%` },
                        ]}
                      />
                    </View>
                    <Text style={styles.progressText}>{setupProgress}%</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.heroBtn}
                  onPress={() =>
                    navigation.navigate("BuilderProjectCreation", {
                      project: selectedProject,
                    })
                  }
                >
                  <Text style={styles.heroBtnText}>
                    {selectedProject ? "Open" : "Create"}
                  </Text>
                </TouchableOpacity>
              </View>

              <ApprovalStatusBanner project={selectedProject} />

              {approvedFirstProjects.length > 1 && (
                <View style={{ marginBottom: 12 }}>
                  <Text style={styles.selectorLabel}>Switch Project</Text>

                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.projectScroll}
                  >
                    {approvedFirstProjects.map((p) => {
                      const active = p.id === selectedProject?.id;

                      return (
                        <TouchableOpacity
                          key={p.id}
                          style={[
                            styles.projectPill,
                            active && styles.projectPillActive,
                          ]}
                          onPress={() => setSelectedProjectId(p.id)}
                        >
                          <View
                            style={[
                              styles.projectDot,
                              active && styles.projectDotActive,
                            ]}
                          />

                          <View style={{ flex: 1 }}>
                            <Text
                              style={[
                                styles.projectName,
                                active && styles.projectNameActive,
                              ]}
                              numberOfLines={1}
                            >
                              {p.projectName || p.name}
                            </Text>

                            <Text
                              style={[
                                styles.projectLocation,
                                active && styles.projectLocationActive,
                              ]}
                              numberOfLines={1}
                            >
                              {p.approvalStatus || "Pending"} •{" "}
                              {p.location || "Location"}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              )}

              {isProjectApproved && (
                <UnitsPreview
                  units={units}
                  selectedProject={selectedProject}
                  navigation={navigation}
                />
              )}

              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Project Setup Steps</Text>
                <Text style={styles.sectionSub}>
                  Complete these steps to make your approved project ready for
                  customers.
                </Text>
              </View>

              <StepCard
                number="1"
                icon="business-outline"
                title="Create Project"
                description="Add project details and submit for approval."
                completed={!!selectedProject?.projectName || !!selectedProject?.name}
                locked={false}
                color={COLORS.blue}
                softColor={COLORS.blueSoft}
                onPress={() =>
                  navigation.navigate("BuilderProjectCreation", {
                    project: selectedProject,
                  })
                }
              />

              <StepCard
                number="2"
                icon="grid-outline"
                title="Add Units"
                description="Add flats, villas, plots or commercial units."
                completed={units.length > 0}
                locked={!isProjectApproved}
                lockReason="Project must be approved by Super Admin before adding units."
                color={COLORS.purple}
                softColor={COLORS.purpleSoft}
                onPress={() =>
                  navigation.navigate("BuilderUnitInventory", {
                    project: selectedProject,
                  })
                }
              />

              <StepCard
                number="3"
                icon="shield-checkmark-outline"
                title="Compliance Documents"
                description="Upload RERA, layout, NOCs and legal documents."
                completed={approvedDocs > 0}
                locked={!isProjectApproved}
                lockReason="Project must be approved by Super Admin before uploading documents."
                color={COLORS.cyan}
                softColor={COLORS.cyanSoft}
                onPress={() =>
                  navigation.navigate("BuilderComplianceTracking", {
                    project: selectedProject,
                  })
                }
              />

              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Quick Management</Text>
                <Text style={styles.sectionSub}>
                  Access important workflows directly.
                </Text>
              </View>

              <QuickCard
                icon="grid-outline"
                title="Manage Units"
                subtitle="Edit or update unit inventory"
                color={COLORS.purple}
                softColor={COLORS.purpleSoft}
                locked={!isProjectApproved}
                onPress={() =>
                  navigation.navigate("BuilderUnitInventory", {
                    project: selectedProject,
                  })
                }
              />

              <QuickCard
                icon="document-text-outline"
                title="Compliance Tracking"
                subtitle="Track approved and pending documents"
                color={COLORS.orange}
                softColor={COLORS.orangeSoft}
                locked={!isProjectApproved}
                onPress={() =>
                  navigation.navigate("BuilderComplianceTracking", {
                    project: selectedProject,
                  })
                }
              />

              <QuickCard
                icon="analytics-outline"
                title="Availability Chart"
                subtitle="View live unit availability"
                color={COLORS.green}
                softColor={COLORS.greenSoft}
                locked={!isProjectApproved}
                onPress={() =>
                  navigation.navigate("BuilderAvailabilityChart", {
                    project: selectedProject,
                  })
                }
              />
            </>
          )}
        </ScrollView>

        <BuilderBottomNav
          navigation={navigation}
          activeRoute="BuilderProjectSetup"
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
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerIcon: {
    width: 43,
    height: 43,
    borderRadius: 16,
    backgroundColor: COLORS.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { color: COLORS.white, fontSize: 20, fontWeight: "900" },
  headerSub: {
    color: "#CBD5E1",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },
  notificationBtn: {
    width: 42,
    height: 42,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },

  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 115 },

  noProjectCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    marginTop: 20,
  },
  noProjectTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "900",
    marginTop: 10,
  },
  noProjectSub: {
    color: COLORS.sub,
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 20,
    marginTop: 6,
  },
  createProjectBtn: {
    marginTop: 18,
    height: 48,
    paddingHorizontal: 18,
    borderRadius: 16,
    backgroundColor: COLORS.navy,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  createProjectBtnText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "900",
  },

  heroCard: {
    backgroundColor: COLORS.navy2,
    borderRadius: 24,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    elevation: 5,
    marginBottom: 14,
  },
  heroLabel: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
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
  metaRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  metaPill: {
    backgroundColor: "rgba(255,255,255,0.12)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  metaPillText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: "800",
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 14,
  },
  progressTrack: {
    flex: 1,
    height: 8,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.16)",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.gold,
    borderRadius: 8,
  },
  progressText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "900",
  },
  heroBtn: {
    backgroundColor: COLORS.gold,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 16,
    marginLeft: 12,
  },
  heroBtnText: {
    color: COLORS.navy,
    fontWeight: "900",
    fontSize: 12,
  },

  approvalBanner: {
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  approvalBannerTitle: {
    fontSize: 13,
    fontWeight: "900",
  },
  approvalBannerSub: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 3,
    lineHeight: 18,
  },

  selectorLabel: {
    color: COLORS.sub,
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 8,
    marginLeft: 2,
  },
  projectScroll: {
    gap: 10,
    paddingBottom: 4,
  },
  projectPill: {
    minWidth: 180,
    maxWidth: 210,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  projectPillActive: {
    backgroundColor: COLORS.navy,
    borderColor: COLORS.navy,
  },
  projectDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.border,
  },
  projectDotActive: {
    backgroundColor: COLORS.gold,
  },
  projectName: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "900",
  },
  projectNameActive: {
    color: COLORS.white,
  },
  projectLocation: {
    color: COLORS.sub,
    fontSize: 11,
    fontWeight: "700",
    marginTop: 2,
  },
  projectLocationActive: {
    color: "#CBD5E1",
  },

  unitsPreviewCard: {
    backgroundColor: COLORS.white,
    borderRadius: 22,
    padding: 15,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  unitsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  unitsTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: "900",
  },
  unitsSub: {
    color: COLORS.sub,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 3,
  },
  addUnitSmallBtn: {
    backgroundColor: COLORS.navy,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  addUnitSmallText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "900",
  },
  emptyUnitsBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
  },
  emptyUnitsTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "900",
    marginTop: 7,
  },
  emptyUnitsSub: {
    color: COLORS.sub,
    fontSize: 12,
    textAlign: "center",
    marginTop: 4,
    lineHeight: 18,
  },
  unitRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 12,
    marginBottom: 9,
  },
  unitIcon: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: COLORS.goldSoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  unitName: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "900",
  },
  unitMeta: {
    color: COLORS.sub,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 3,
  },
  unitStatusBadge: {
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  unitStatusText: {
    fontSize: 10,
    fontWeight: "900",
  },
  viewAllUnitsBtn: {
    marginTop: 6,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.goldSoft,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  viewAllUnitsText: {
    color: COLORS.navy,
    fontSize: 13,
    fontWeight: "900",
  },

  sectionHeader: {
    marginTop: 18,
    marginBottom: 10,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "900",
  },
  sectionSub: {
    color: COLORS.sub,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 3,
    lineHeight: 18,
  },

  stepCard: {
    backgroundColor: COLORS.white,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 10,
  },
  stepCardLocked: {
    backgroundColor: "#F8FAFC",
    borderColor: "#E2E8F0",
    opacity: 0.85,
  },
  stepLeft: {
    alignItems: "center",
    gap: 8,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumberDone: {
    backgroundColor: COLORS.green,
  },
  stepNumberLocked: {
    backgroundColor: "#E2E8F0",
  },
  stepNumberText: {
    color: COLORS.sub,
    fontSize: 12,
    fontWeight: "900",
  },
  stepNumberTextDone: {
    color: COLORS.white,
  },
  stepIcon: {
    width: 42,
    height: 42,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  stepTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepTitle: {
    flex: 1,
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "900",
  },
  stepDescription: {
    color: COLORS.sub,
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 18,
    marginTop: 5,
  },
  lockedBadge: {
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  lockedBadgeText: {
    color: COLORS.sub,
    fontSize: 10,
    fontWeight: "800",
  },

  quickCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 10,
  },
  quickCardLocked: {
    backgroundColor: "#F8FAFC",
    opacity: 0.8,
  },
  quickIcon: {
    width: 43,
    height: 43,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  quickTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "900",
  },
  quickSub: {
    color: COLORS.sub,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 3,
    lineHeight: 17,
  },
});