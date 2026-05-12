

import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Image,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { useAppContext } from "../../superadmin/SocietyContext";
import BuilderBottomNav from "../BuilderBottomNav";

const COLORS = {
  navy: "#1A7A7A",
  white: "#FFFFFF",
  bg: "#E8F5F5",
  card: "#FFFFFF",
  text: "#111827",
  sub: "#6B7280",
  border: "#E5E7EB",
  blue: "#2563EB",
  green: "#15803D",
  greenSoft: "#DCFCE7",
  orange: "#C2410C",
  orangeSoft: "#FFEDD5",
  red: "#B91C1C",
  redSoft: "#FEE2E2",
  gold: "#C9A84C",
  goldSoft: "#FFF7D6",
  purple: "#7C3AED",
  purpleSoft: "#F3E8FF",
};

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1200&q=80";

function formatDate(date) {
  if (!date) return "";
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = d.toLocaleString("en-US", { month: "short" });
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

function StatusBadge({ status }) {
  const isApproved = status === "Approved";
  const isRejected = status === "Rejected";
  const isPending = status === "Pending";

  let bg = COLORS.orangeSoft;
  let color = COLORS.orange;

  if (isApproved) { bg = COLORS.greenSoft; color = COLORS.green; }
  if (isRejected) { bg = COLORS.redSoft; color = COLORS.red; }

  return (
    <View style={[styles.statusBadge, { backgroundColor: bg }]}>
      <Text style={[styles.statusText, { color }]}>{status || "Pending"}</Text>
    </View>
  );
}

// ─── Approval Info Banner shown on each project card ───────────────────────
function ApprovalBanner({ status }) {
  if (!status) return null;

  if (status === "Approved") {
    return (
      <View style={[styles.infoBanner, styles.infoBannerGreen]}>
        <Ionicons name="checkmark-circle-outline" size={16} color={COLORS.green} />
        <Text style={[styles.infoBannerText, { color: COLORS.green }]}>
          Approved — Units can now be added via Unit Inventory
        </Text>
      </View>
    );
  }

  if (status === "Rejected") {
    return (
      <View style={[styles.infoBanner, styles.infoBannerRed]}>
        <Ionicons name="close-circle-outline" size={16} color={COLORS.red} />
        <Text style={[styles.infoBannerText, { color: COLORS.red }]}>
          Rejected by Super Admin. Please review and resubmit.
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.infoBanner, styles.infoBannerOrange]}>
      <Ionicons name="time-outline" size={16} color={COLORS.orange} />
      <Text style={[styles.infoBannerText, { color: COLORS.orange }]}>
        Awaiting Super Admin approval before units can be added.
      </Text>
    </View>
  );
}

export default function ProjectCreation({ navigation, route }) {
  const {
    addProjectRequest,
    builderProjects = [],
    addBuilderProject,
    shareProjectToCustomers,
  } = useAppContext();

  const loggedInBuilder = route?.params?.builder || null;

  const [activeTab, setActiveTab] = useState("create");

  const [projectName, setProjectName] = useState("");
  const [builderName, setBuilderName] = useState(loggedInBuilder?.name || "");
  const [location, setLocation] = useState("");
  const [reraNumber, setReraNumber] = useState("");
  const [towerCount, setTowerCount] = useState("");
  const [totalUnits, setTotalUnits] = useState("");
  const [availableUnits, setAvailableUnits] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState(DEFAULT_IMAGE);
  const [completionDate, setCompletionDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info"); // info | success | error

  const pendingProjects = builderProjects.filter(
    (item) => item.approvalStatus === "Pending"
  );

  const approvedProjects = builderProjects.filter(
    (item) => item.approvalStatus === "Approved"
  );

  const showMessage = (text, type = "info") => {
    setMessage(text);
    setMessageType(type);
  };

  const resetForm = () => {
    setProjectName("");
    setBuilderName(loggedInBuilder?.name || "");
    setLocation("");
    setReraNumber("");
    setTowerCount("");
    setTotalUnits("");
    setAvailableUnits("");
    setPriceRange("");
    setDescription("");
    setCoverImage(DEFAULT_IMAGE);
    setCompletionDate(null);
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      showMessage("Photo permission is required.", "error");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [16, 10],
      quality: 0.9,
    });
    if (!result.canceled && result.assets?.length > 0) {
      setCoverImage(result.assets[0].uri);
    }
  };

  const createProject = () => {
    if (
      !projectName.trim() ||
      !location.trim() ||
      !reraNumber.trim() ||
      !towerCount.trim() ||
      !totalUnits.trim() ||
      !availableUnits.trim() ||
      !priceRange.trim() ||
      !completionDate
    ) {
      showMessage("Please fill all required fields.", "error");
      return;
    }

    const payload = {
      id: `PRJ-${Date.now()}`,
      projectName: projectName.trim(),
      // also set `name` so BuilderProjectSetup and UnitInventory can use it
      name: projectName.trim(),
      builderId: loggedInBuilder?.id || "",
      builderName: loggedInBuilder?.name || builderName.trim() || "Builder",
      builderEmail: loggedInBuilder?.email || "",
      location: location.trim(),
      reraNumber: reraNumber.trim(),
      towerCount,
      totalUnits,
      availableUnits,
      priceRange: priceRange.trim(),
      description: description.trim(),
      completionDate: formatDate(completionDate),
      coverImage,
      approvalStatus: "Pending",
      sharedToCustomers: false,
      customerVisible: false,
      createdAt: new Date().toISOString(),
      // units array — will be populated from UnitInventory after approval
      units: [],
    };

    addBuilderProject(payload);
    addProjectRequest(payload);

    showMessage(
      "✅ Project submitted to Super Admin for approval. You'll be able to add units once approved.",
      "success"
    );
    setActiveTab("pending");
    resetForm();
  };

  // Navigate to UnitInventory for this approved project
  const goToAddUnits = (project) => {
    navigation.navigate("BuilderUnitInventory", { project });
  };

  const renderProjectCard = (item, showActions = false) => (
    <View key={item.id} style={styles.projectCard}>
      <Image
        source={{ uri: item.coverImage || DEFAULT_IMAGE }}
        style={styles.projectImage}
      />

      <View style={styles.projectBody}>
        <View style={styles.projectTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.projectName}>{item.projectName}</Text>
            <Text style={styles.projectLocation}>{item.location}</Text>
          </View>
          <StatusBadge status={item.approvalStatus} />
        </View>

        <Text style={styles.projectMeta}>
          {item.towerCount} Towers • {item.totalUnits} Flats •{" "}
          {item.availableUnits} Available
        </Text>
        <Text style={styles.projectPrice}>{item.priceRange}</Text>
        <Text style={styles.projectMeta}>RERA: {item.reraNumber}</Text>
        <Text style={styles.projectMeta}>Completion: {item.completionDate}</Text>

        {!!item.description && (
          <Text style={styles.description}>{item.description}</Text>
        )}

        {/* Approval Status Banner on every card */}
        <ApprovalBanner status={item.approvalStatus} />

        {/* Actions for approved projects */}
        {showActions && item.approvalStatus === "Approved" ? (
          <View style={styles.approvedActionsRow}>
            {/* Add Units Button */}
            <TouchableOpacity
              style={styles.addUnitsBtn}
              onPress={() => goToAddUnits(item)}
            >
              <Ionicons name="grid-outline" size={17} color={COLORS.white} />
              <Text style={styles.addUnitsBtnText}>Add Units</Text>
            </TouchableOpacity>

          </View>
        ) : null}

        {/* Pending card: show waiting state */}
        {!showActions && item.approvalStatus === "Pending" ? (
          <View style={styles.pendingBox}>
            <Ionicons name="time-outline" size={17} color={COLORS.orange} />
            <Text style={styles.pendingText}>
              Waiting for Super Admin approval
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );

  // Message banner color
  const msgBg =
    messageType === "success"
      ? "#ECFDF5"
      : messageType === "error"
      ? "#FEF2F2"
      : "#EFF6FF";
  const msgBorder =
    messageType === "success"
      ? "#A7F3D0"
      : messageType === "error"
      ? "#FECACA"
      : "#BFDBFE";
  const msgColor =
    messageType === "success"
      ? COLORS.green
      : messageType === "error"
      ? COLORS.red
      : COLORS.blue;
  const msgIcon =
    messageType === "success"
      ? "checkmark-circle-outline"
      : messageType === "error"
      ? "alert-circle-outline"
      : "information-circle-outline";

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.navy} />

      <View style={styles.header}>
        <SafeAreaView>
          <View style={styles.headerRow}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="chevron-back" size={22} color={COLORS.white} />
            </TouchableOpacity>
            <View>
              <Text style={styles.headerTitle}>Project Management</Text>
              <Text style={styles.headerSub}>
                Create, approve and share projects
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === "create" && styles.activeTab]}
          onPress={() => setActiveTab("create")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "create" && styles.activeTabText,
            ]}
          >
            New Project
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === "pending" && styles.activeTab]}
          onPress={() => setActiveTab("pending")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "pending" && styles.activeTabText,
            ]}
          >
            Pending{pendingProjects.length > 0 ? ` (${pendingProjects.length})` : ""}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === "approved" && styles.activeTab]}
          onPress={() => setActiveTab("approved")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "approved" && styles.activeTabText,
            ]}
          >
            Approved{approvedProjects.length > 0 ? ` (${approvedProjects.length})` : ""}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Message Box */}
        {message ? (
          <View
            style={[
              styles.messageBox,
              { backgroundColor: msgBg, borderColor: msgBorder },
            ]}
          >
            <Ionicons name={msgIcon} size={18} color={msgColor} />
            <Text style={[styles.messageText, { color: msgColor }]}>
              {message}
            </Text>
            <TouchableOpacity onPress={() => setMessage("")}>
              <Ionicons name="close" size={18} color={msgColor} />
            </TouchableOpacity>
          </View>
        ) : null}

        {/* ── CREATE TAB ── */}
        {activeTab === "create" ? (
          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>Create New Project</Text>
            <Text style={styles.sectionSub}>
              Fill in project details and send for Super Admin approval. Once approved,
              you can add units to the project.
            </Text>

            {/* Workflow info strip */}
            <View style={styles.workflowStrip}>
              <View style={styles.workflowStep}>
                <View style={[styles.workflowDot, { backgroundColor: COLORS.blue }]} />
                <Text style={styles.workflowStepText}>Create Project</Text>
              </View>
              <View style={styles.workflowLine} />
              <View style={styles.workflowStep}>
                <View style={[styles.workflowDot, { backgroundColor: COLORS.orange }]} />
                <Text style={styles.workflowStepText}>Admin Approves</Text>
              </View>
              <View style={styles.workflowLine} />
              <View style={styles.workflowStep}>
                <View style={[styles.workflowDot, { backgroundColor: COLORS.green }]} />
                <Text style={styles.workflowStepText}>Add Units</Text>
              </View>
              <View style={styles.workflowLine} />
              <View style={styles.workflowStep}>
                <View style={[styles.workflowDot, { backgroundColor: COLORS.purple }]} />
                <Text style={styles.workflowStepText}>Customers See</Text>
              </View>
            </View>

            <View style={styles.imageBox}>
              <Image source={{ uri: coverImage }} style={styles.coverImage} />
              <TouchableOpacity style={styles.imageBtn} onPress={pickImage}>
                <Ionicons name="camera-outline" size={18} color={COLORS.white} />
                <Text style={styles.imageBtnText}>Add Photo</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Project Name *"
              placeholderTextColor={COLORS.sub}
              value={projectName}
              onChangeText={setProjectName}
            />
            <TextInput
              style={styles.input}
              placeholder="Builder Name"
              placeholderTextColor={COLORS.sub}
              value={builderName}
              onChangeText={setBuilderName}
            />
            <TextInput
              style={styles.input}
              placeholder="Project Location *"
              placeholderTextColor={COLORS.sub}
              value={location}
              onChangeText={setLocation}
            />
            <TextInput
              style={styles.input}
              placeholder="RERA Number *"
              placeholderTextColor={COLORS.sub}
              value={reraNumber}
              onChangeText={setReraNumber}
            />

            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.half]}
                placeholder="Towers *"
                placeholderTextColor={COLORS.sub}
                value={towerCount}
                onChangeText={setTowerCount}
                keyboardType="numeric"
              />
              <TextInput
                style={[styles.input, styles.half]}
                placeholder="Total Flats *"
                placeholderTextColor={COLORS.sub}
                value={totalUnits}
                onChangeText={setTotalUnits}
                keyboardType="numeric"
              />
            </View>

            <TextInput
              style={styles.input}
              placeholder="Available Flats *"
              placeholderTextColor={COLORS.sub}
              value={availableUnits}
              onChangeText={setAvailableUnits}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="Price Range e.g: ₹65L - ₹1.5Cr *"
              placeholderTextColor={COLORS.sub}
              value={priceRange}
              onChangeText={setPriceRange}
            />

            <TouchableOpacity
              style={styles.dateBox}
              onPress={() => setShowDatePicker(true)}
            >
              <Text
                style={[styles.dateText, !completionDate && { color: COLORS.sub }]}
              >
                {completionDate
                  ? formatDate(completionDate)
                  : "Select Completion Date *"}
              </Text>
              <Ionicons name="calendar-outline" size={18} color={COLORS.sub} />
            </TouchableOpacity>

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Project Description"
              placeholderTextColor={COLORS.sub}
              value={description}
              onChangeText={setDescription}
              multiline
            />

            <TouchableOpacity style={styles.createBtn} onPress={createProject}>
              <Ionicons name="send-outline" size={18} color={COLORS.white} />
              <Text style={styles.createBtnText}>Submit for Admin Approval</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* ── PENDING TAB ── */}
        {activeTab === "pending" ? (
          <>
            <Text style={styles.sectionTitle}>Pending Approval</Text>
            <Text style={styles.sectionSub}>
              These projects are awaiting Super Admin approval. Units can be added
              only after approval.
            </Text>

            {pendingProjects.length === 0 ? (
              <View style={styles.emptyCard}>
                <Ionicons name="time-outline" size={28} color={COLORS.sub} />
                <Text style={styles.emptyTitle}>No pending projects</Text>
                <Text style={styles.emptySub}>
                  Submit a new project and it will appear here.
                </Text>
              </View>
            ) : (
              pendingProjects.map((item) => renderProjectCard(item, false))
            )}
          </>
        ) : null}

        {/* ── APPROVED TAB ── */}
        {activeTab === "approved" ? (
          <>
            <Text style={styles.sectionTitle}>Approved Projects</Text>
            <Text style={styles.sectionSub}>
              These projects are approved. Add units and share to customers.
            </Text>

            {approvedProjects.length === 0 ? (
              <View style={styles.emptyCard}>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={28}
                  color={COLORS.sub}
                />
                <Text style={styles.emptyTitle}>No approved projects yet</Text>
                <Text style={styles.emptySub}>
                  Once Super Admin approves your project, it will appear here.
                </Text>
              </View>
            ) : (
              approvedProjects.map((item) => renderProjectCard(item, true))
            )}
          </>
        ) : null}
      </ScrollView>

      {showDatePicker ? (
        <DateTimePicker
          value={completionDate || new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(_, selectedDate) => {
            if (Platform.OS !== "ios") setShowDatePicker(false);
            if (selectedDate) setCompletionDate(selectedDate);
          }}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    backgroundColor: COLORS.navy,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingBottom: 16,
  },
  headerRow: {
    paddingHorizontal: 16,
    paddingTop: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  headerTitle: { color: COLORS.white, fontSize: 22, fontWeight: "900" },
  headerSub: { color: "rgba(255,255,255,0.75)", marginTop: 3, fontSize: 12 },

  tabRow: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    margin: 16,
    borderRadius: 16,
    padding: 5,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
  },
  activeTab: { backgroundColor: COLORS.navy },
  tabText: {
    color: COLORS.sub,
    fontSize: 11,
    fontWeight: "800",
    textAlign: "center",
  },
  activeTabText: { color: COLORS.white },

  content: { paddingHorizontal: 16, paddingBottom: 48 },

  messageBox: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 14,
    gap: 8,
  },
  messageText: { fontWeight: "700", flex: 1, lineHeight: 18 },

  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: 22,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 19,
    fontWeight: "900",
    marginBottom: 4,
  },
  sectionSub: {
    color: COLORS.sub,
    marginTop: 4,
    marginBottom: 14,
    lineHeight: 20,
    fontSize: 13,
  },

  // Workflow strip
  workflowStrip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  workflowStep: { alignItems: "center", flex: 1 },
  workflowDot: { width: 10, height: 10, borderRadius: 5, marginBottom: 5 },
  workflowStepText: {
    fontSize: 9,
    fontWeight: "800",
    color: COLORS.sub,
    textAlign: "center",
  },
  workflowLine: { width: 20, height: 1.5, backgroundColor: COLORS.border, marginBottom: 14 },

  imageBox: {
    height: 180,
    borderRadius: 18,
    overflow: "hidden",
    marginBottom: 14,
    backgroundColor: "#E5E7EB",
  },
  coverImage: { width: "100%", height: "100%" },
  imageBtn: {
    position: "absolute",
    right: 12,
    bottom: 12,
    backgroundColor: COLORS.navy,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  imageBtnText: { color: COLORS.white, fontWeight: "900", marginLeft: 7 },

  input: {
    minHeight: 52,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 14,
    marginBottom: 12,
    color: COLORS.text,
    fontWeight: "600",
  },
  textArea: { height: 100, paddingTop: 14, textAlignVertical: "top" },
  row: { flexDirection: "row", gap: 12 },
  half: { flex: 1 },
  dateBox: {
    height: 52,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 14,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dateText: { color: COLORS.text, fontWeight: "700" },
  createBtn: {
    height: 54,
    backgroundColor: COLORS.navy,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginTop: 4,
    gap: 8,
  },
  createBtnText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "900",
  },

  emptyCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 28,
    alignItems: "center",
    gap: 8,
  },
  emptyTitle: { color: COLORS.text, fontWeight: "900", fontSize: 15 },
  emptySub: { color: COLORS.sub, fontSize: 12, textAlign: "center", lineHeight: 18 },

  projectCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 14,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  projectImage: { width: "100%", height: 160 },
  projectBody: { padding: 14 },
  projectTop: { flexDirection: "row", alignItems: "flex-start", marginBottom: 4 },
  projectName: { color: COLORS.text, fontSize: 18, fontWeight: "900" },
  projectLocation: { color: COLORS.sub, marginTop: 4, fontSize: 13 },
  projectMeta: { color: COLORS.sub, fontSize: 13, fontWeight: "700", marginTop: 8 },
  projectPrice: { color: COLORS.green, fontSize: 17, fontWeight: "900", marginTop: 8 },
  description: { color: COLORS.text, fontSize: 13, lineHeight: 20, marginTop: 10 },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
  },
  statusText: { fontSize: 11, fontWeight: "900" },

  // Approval info banners on cards
  infoBanner: {
    borderRadius: 12,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    gap: 8,
  },
  infoBannerGreen: { backgroundColor: COLORS.greenSoft },
  infoBannerOrange: { backgroundColor: COLORS.orangeSoft },
  infoBannerRed: { backgroundColor: COLORS.redSoft },
  infoBannerText: { fontWeight: "700", fontSize: 12, flex: 1, lineHeight: 17 },

  // Approved project action buttons
  approvedActionsRow: { marginTop: 12, gap: 10 },
  addUnitsBtn: {
    height: 48,
    borderRadius: 14,
    backgroundColor: COLORS.navy,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  addUnitsBtnText: { color: COLORS.white, fontWeight: "900", fontSize: 14 },
  shareBtn: {
    height: 48,
    borderRadius: 14,
    backgroundColor: COLORS.green,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  shareBtnText: { color: COLORS.white, fontWeight: "900" },
  sharedBox: {
    backgroundColor: COLORS.greenSoft,
    borderRadius: 12,
    padding: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sharedText: { color: COLORS.green, fontWeight: "900" },

  pendingBox: {
    backgroundColor: COLORS.orangeSoft,
    borderRadius: 12,
    padding: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
  },
  pendingText: { color: COLORS.orange, fontSize: 12, fontWeight: "800" },
});