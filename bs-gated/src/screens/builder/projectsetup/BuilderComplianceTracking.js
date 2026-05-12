
import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
  Modal,
  TextInput,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import BuilderBottomNav from "../BuilderBottomNav";

const COLORS = {
  navy: "#1A7A7A",
  navy2: "#1A7A7A",
  white: "#FFFFFF",
  bg: "#E8F5F5",
  card: "#FFFFFF",
  border: "#E5E7EB",
  text: "#111827",
  sub: "#64748B",
  gold: "#C9A84C",
  goldSoft: "#FFF7D6",
  green: "#16A34A",
  greenSoft: "#DCFCE7",
  orange: "#F59E0B",
  orangeSoft: "#FEF3C7",
  red: "#DC2626",
  redSoft: "#FEE2E2",
  blue: "#2563EB",
  blueSoft: "#DBEAFE",
  purple: "#7C3AED",
  purpleSoft: "#F3E8FF",
};

const initialDocs = [
  {
    id: "DOC-1",
    title: "RERA Certificate",
    category: "RERA",
    required: true,
    visibleToCustomer: true,
    status: "Pending",
    file: null,
    note: "Upload official project RERA certificate.",
  },
  {
    id: "DOC-2",
    title: "Building Plan Approval",
    category: "Legal",
    required: true,
    visibleToCustomer: true,
    status: "Pending",
    file: null,
    note: "Approved building layout or sanction plan.",
  },
  {
    id: "DOC-3",
    title: "Fire NOC",
    category: "NOC",
    required: true,
    visibleToCustomer: false,
    status: "Pending",
    file: null,
    note: "Fire department no objection certificate.",
  },
  {
    id: "DOC-4",
    title: "Environmental Clearance",
    category: "NOC",
    required: false,
    visibleToCustomer: false,
    status: "Pending",
    file: null,
    note: "Environment approval if applicable.",
  },
  {
    id: "DOC-5",
    title: "Land Ownership Document",
    category: "Legal",
    required: true,
    visibleToCustomer: false,
    status: "Pending",
    file: null,
    note: "Ownership deed / land title proof.",
  },
  {
    id: "DOC-6",
    title: "Project Brochure",
    category: "Customer",
    required: false,
    visibleToCustomer: true,
    status: "Pending",
    file: null,
    note: "Customer-facing brochure, amenities and price details.",
  },
  {
    id: "DOC-7",
    title: "Agreement Draft",
    category: "Customer",
    required: false,
    visibleToCustomer: true,
    status: "Pending",
    file: null,
    note: "Sample sale agreement draft for customers.",
  },
];

const filters = ["All", "RERA", "NOC", "Legal", "Customer"];

function statusStyle(status) {
  if (status === "Verified") {
    return { bg: COLORS.greenSoft, color: COLORS.green, label: "Verified" };
  }
  if (status === "Rejected") {
    return { bg: COLORS.redSoft, color: COLORS.red, label: "Rejected" };
  }
  if (status === "Uploaded") {
    return { bg: COLORS.blueSoft, color: COLORS.blue, label: "Uploaded" };
  }
  return { bg: COLORS.orangeSoft, color: COLORS.orange, label: "Pending" };
}

function BottomNavItem({ label, icon, active, onPress }) {
  return (
    <TouchableOpacity style={styles.bottomNavItem} onPress={onPress}>
      <Text style={[styles.bottomNavIcon, active && styles.bottomNavActive]}>
        {icon}
      </Text>
      <Text style={[styles.bottomNavLabel, active && styles.bottomNavActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export default function BuilderComplianceTracking({ navigation, route }) {
  const [documents, setDocuments] = useState(initialDocs);
  const [filter, setFilter] = useState("All");
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [addVisible, setAddVisible] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState("");
  const [newDocCategory, setNewDocCategory] = useState("Legal");

  const currentRouteName = route?.name || "BuilderComplianceTracking";

  const stats = useMemo(() => {
    const total = documents.length;
    const uploaded = documents.filter((item) => item.file).length;
    const verified = documents.filter((item) => item.status === "Verified").length;
    const customerVisible = documents.filter((item) => item.visibleToCustomer).length;

    return { total, uploaded, verified, customerVisible };
  }, [documents]);

  const filteredDocs = useMemo(() => {
    if (filter === "All") return documents;
    return documents.filter((item) => item.category === filter);
  }, [documents, filter]);

  const completionPercent = useMemo(() => {
    if (!documents.length) return 0;
    return Math.round((stats.uploaded / documents.length) * 100);
  }, [documents, stats.uploaded]);

  const pickDocument = async (docId) => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["application/pdf", "image/*"],
      copyToCacheDirectory: true,
      multiple: false,
    });

    if (result.canceled) return;

    const file = result.assets?.[0];

    setDocuments((prev) =>
      prev.map((item) =>
        item.id === docId
          ? {
              ...item,
              file: {
                name: file.name,
                uri: file.uri,
                size: file.size,
                mimeType: file.mimeType,
              },
              status: "Uploaded",
              uploadedAt: new Date().toLocaleDateString("en-IN"),
            }
          : item
      )
    );
  };

  const removeDocument = (docId) => {
    setDocuments((prev) =>
      prev.map((item) =>
        item.id === docId
          ? {
              ...item,
              file: null,
              status: "Pending",
              uploadedAt: null,
            }
          : item
      )
    );
  };

  const toggleCustomerVisible = (docId) => {
    setDocuments((prev) =>
      prev.map((item) =>
        item.id === docId
          ? { ...item, visibleToCustomer: !item.visibleToCustomer }
          : item
      )
    );
  };

  const markVerified = (docId) => {
    setDocuments((prev) =>
      prev.map((item) =>
        item.id === docId && item.file ? { ...item, status: "Verified" } : item
      )
    );
  };

  const addCustomDocument = () => {
    if (!newDocTitle.trim()) return;

    const newDoc = {
      id: `DOC-${Date.now()}`,
      title: newDocTitle.trim(),
      category: newDocCategory,
      required: false,
      visibleToCustomer: newDocCategory === "Customer",
      status: "Pending",
      file: null,
      note: "Custom builder uploaded document.",
    };

    setDocuments((prev) => [newDoc, ...prev]);
    setNewDocTitle("");
    setNewDocCategory("Legal");
    setAddVisible(false);
  };

  const openPreview = (doc) => {
    setSelectedDoc(doc);
    setPreviewVisible(true);
  };

  const handleBottomNavigation = (screen) => {
    if (currentRouteName === screen) return;
    navigation?.navigate?.(screen);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar backgroundColor={COLORS.navy} barStyle="light-content" />

      <View style={styles.container}>
        <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: 8 }}>
          <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 16, fontWeight: '600' }}>‹ Back</Text>
        </TouchableOpacity>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation?.navigate?.("BuilderProjectSetup")}
          >
            <Ionicons name="chevron-back" size={22} color={COLORS.white} />
          </TouchableOpacity>

          <View style={styles.headerIcon}>
            <MaterialCommunityIcons
              name="file-document-check-outline"
              size={23}
              color={COLORS.navy}
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Compliance Documents</Text>
            <Text style={styles.headerSub}>RERA, NOCs, legal and customer docs</Text>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <View style={styles.heroCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroLabel}>Document Readiness</Text>
              <Text style={styles.heroTitle}>{completionPercent}% Completed</Text>
              <Text style={styles.heroSub}>
                Upload verified project documents. Customer-visible documents will appear
                in the customer project detail screen.
              </Text>

              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${completionPercent}%` }]} />
              </View>
            </View>

            <TouchableOpacity style={styles.addBtn} onPress={() => setAddVisible(true)}>
              <Ionicons name="add" size={18} color={COLORS.navy} />
              <Text style={styles.addBtnText}>Add</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.total}</Text>
              <Text style={styles.statLabel}>Total Docs</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: COLORS.blue }]}>
                {stats.uploaded}
              </Text>
              <Text style={styles.statLabel}>Uploaded</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: COLORS.green }]}>
                {stats.verified}
              </Text>
              <Text style={styles.statLabel}>Verified</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: COLORS.gold }]}>
                {stats.customerVisible}
              </Text>
              <Text style={styles.statLabel}>Customer View</Text>
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
          >
            {filters.map((item) => (
              <TouchableOpacity
                key={item}
                style={[styles.filterChip, filter === item && styles.filterChipActive]}
                onPress={() => setFilter(item)}
              >
                <Text
                  style={[
                    styles.filterText,
                    filter === item && styles.filterTextActive,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.sectionTitle}>Uploaded Documents</Text>

          {filteredDocs.map((doc) => {
            const status = statusStyle(doc.status);

            return (
              <View key={doc.id} style={styles.docCard}>
                <View style={styles.docTop}>
                  <View style={styles.docIcon}>
                    <Ionicons
                      name={doc.file ? "document-attach-outline" : "document-outline"}
                      size={23}
                      color={COLORS.navy}
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <View style={styles.titleRow}>
                      <Text style={styles.docTitle}>{doc.title}</Text>
                      {doc.required && <Text style={styles.required}>Required</Text>}
                    </View>

                    <Text style={styles.docSub}>{doc.note}</Text>
                    <Text style={styles.docCategory}>{doc.category}</Text>
                  </View>

                  <View style={[styles.statusPill, { backgroundColor: status.bg }]}>
                    <Text style={[styles.statusText, { color: status.color }]}>
                      {status.label}
                    </Text>
                  </View>
                </View>

                {doc.file ? (
                  <TouchableOpacity
                    style={styles.fileBox}
                    onPress={() => openPreview(doc)}
                  >
                    <Ionicons name="eye-outline" size={17} color={COLORS.blue} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.fileName}>{doc.file.name}</Text>
                      <Text style={styles.fileSub}>
                        Uploaded on {doc.uploadedAt || "Today"}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={COLORS.sub} />
                  </TouchableOpacity>
                ) : (
                  <View style={styles.emptyFileBox}>
                    <Text style={styles.emptyFileText}>No file uploaded yet</Text>
                  </View>
                )}

                <View style={styles.customerRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.customerLabel}>Visible to Customer</Text>
                    <Text style={styles.customerSub}>
                      Enable only safe public documents like RERA, brochure and agreement draft.
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.switchBtn,
                      doc.visibleToCustomer && styles.switchBtnActive,
                    ]}
                    onPress={() => toggleCustomerVisible(doc.id)}
                  >
                    <View
                      style={[
                        styles.switchDot,
                        doc.visibleToCustomer && styles.switchDotActive,
                      ]}
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={styles.uploadBtn}
                    onPress={() => pickDocument(doc.id)}
                  >
                    <Ionicons name="cloud-upload-outline" size={16} color={COLORS.navy} />
                    <Text style={styles.uploadBtnText}>
                      {doc.file ? "Replace" : "Upload"}
                    </Text>
                  </TouchableOpacity>

                  {doc.file && (
                    <>
                      <TouchableOpacity
                        style={styles.verifyBtn}
                        onPress={() => markVerified(doc.id)}
                      >
                        <Ionicons
                          name="checkmark-done-outline"
                          size={16}
                          color={COLORS.green}
                        />
                        <Text style={styles.verifyBtnText}>Verify</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.removeBtn}
                        onPress={() => removeDocument(doc.id)}
                      >
                        <Ionicons name="trash-outline" size={16} color={COLORS.red} />
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>
            );
          })}
        </ScrollView>

        <Modal visible={addVisible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.addModal}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add Custom Document</Text>
                <TouchableOpacity onPress={() => setAddVisible(false)}>
                  <Ionicons name="close" size={22} color={COLORS.text} />
                </TouchableOpacity>
              </View>

              <TextInput
                value={newDocTitle}
                onChangeText={setNewDocTitle}
                placeholder="Document title"
                placeholderTextColor="#94A3B8"
                style={styles.input}
              />

              <Text style={styles.inputLabel}>Category</Text>
              <View style={styles.categoryRow}>
                {["RERA", "NOC", "Legal", "Customer"].map((item) => (
                  <TouchableOpacity
                    key={item}
                    style={[
                      styles.categoryChip,
                      newDocCategory === item && styles.categoryChipActive,
                    ]}
                    onPress={() => setNewDocCategory(item)}
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        newDocCategory === item && styles.categoryTextActive,
                      ]}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity style={styles.submitBtn} onPress={addCustomDocument}>
                <Text style={styles.submitBtnText}>Add Document</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.navy },
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    backgroundColor: COLORS.navy,
    paddingTop: Platform.OS === "android" ? 16 : 8,
    paddingHorizontal: 16,
    paddingBottom: 38,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  backBtn: {
    marginTop:30,
    width: 40,
    height: 40,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerIcon: {
    marginTop:30,
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: COLORS.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { marginTop:30,color: COLORS.white, fontSize: 20, fontWeight: "900" },
  headerSub: { color: "#CBD5E1", fontSize: 12, fontWeight: "600", marginTop: 2 },
  content: { padding: 16, paddingBottom: 142 },
  heroCard: {
    backgroundColor: COLORS.navy2,
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  heroLabel: {
    color: COLORS.gold,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  heroTitle: { color: COLORS.white, fontSize: 22, fontWeight: "900", marginTop: 4 },
  heroSub: { color: "#CBD5E1", fontSize: 12, lineHeight: 18, marginTop: 5 },
  progressTrack: {
    height: 8,
    backgroundColor: "rgba(255,255,255,0.14)",
    borderRadius: 999,
    overflow: "hidden",
    marginTop: 14,
  },
  progressFill: { height: "100%", backgroundColor: COLORS.gold },
  addBtn: {
    backgroundColor: COLORS.gold,
    borderRadius: 16,
    paddingHorizontal: 13,
    paddingVertical: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  addBtnText: { color: COLORS.navy, fontWeight: "900", fontSize: 12 },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  statCard: {
    width: "48.5%",
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 10,
  },
  statValue: { color: COLORS.text, fontSize: 22, fontWeight: "900" },
  statLabel: { color: COLORS.sub, fontSize: 12, fontWeight: "700", marginTop: 4 },
  filterRow: { gap: 8, paddingBottom: 14 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterChipActive: { backgroundColor: COLORS.navy, borderColor: COLORS.navy },
  filterText: { color: COLORS.sub, fontSize: 12, fontWeight: "800" },
  filterTextActive: { color: COLORS.white },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 10,
  },
  docCard: {
    backgroundColor: COLORS.white,
    borderRadius: 22,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 14,
  },
  docTop: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  docIcon: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: COLORS.goldSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
  docTitle: { color: COLORS.text, fontSize: 15, fontWeight: "900" },
  required: {
    backgroundColor: COLORS.redSoft,
    color: COLORS.red,
    fontSize: 10,
    fontWeight: "900",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 999,
  },
  docSub: { color: COLORS.sub, fontSize: 12, fontWeight: "600", marginTop: 4 },
  docCategory: { color: COLORS.blue, fontSize: 11, fontWeight: "900", marginTop: 5 },
  statusPill: { paddingHorizontal: 9, paddingVertical: 6, borderRadius: 999 },
  statusText: { fontSize: 10, fontWeight: "900" },
  fileBox: {
    marginTop: 13,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  fileName: { color: COLORS.text, fontSize: 13, fontWeight: "900" },
  fileSub: { color: COLORS.sub, fontSize: 11, fontWeight: "600", marginTop: 2 },
  emptyFileBox: {
    marginTop: 13,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 13,
  },
  emptyFileText: { color: COLORS.sub, fontSize: 12, fontWeight: "700" },
  customerRow: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  customerLabel: { color: COLORS.text, fontSize: 13, fontWeight: "900" },
  customerSub: { color: COLORS.sub, fontSize: 11, lineHeight: 16, marginTop: 3 },
  switchBtn: {
    width: 48,
    height: 28,
    borderRadius: 999,
    backgroundColor: "#CBD5E1",
    padding: 3,
    justifyContent: "center",
  },
  switchBtnActive: { backgroundColor: COLORS.green },
  switchDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.white,
  },
  switchDotActive: { alignSelf: "flex-end" },
  actionRow: { flexDirection: "row", gap: 9, marginTop: 13 },
  uploadBtn: {
    flex: 1,
    minHeight: 44,
    backgroundColor: COLORS.gold,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  uploadBtnText: { color: COLORS.navy, fontSize: 12, fontWeight: "900" },
  verifyBtn: {
    flex: 1,
    minHeight: 44,
    backgroundColor: COLORS.greenSoft,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  verifyBtnText: { color: COLORS.green, fontSize: 12, fontWeight: "900" },
  removeBtn: {
    width: 46,
    minHeight: 44,
    backgroundColor: COLORS.redSoft,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.55)",
    justifyContent: "flex-end",
  },
  centerOverlay: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.55)",
    justifyContent: "center",
    padding: 18,
  },
  previewCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 18,
  },
  addModal: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 18,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  modalTitle: { color: COLORS.text, fontSize: 18, fontWeight: "900" },
  previewIcon: {
    width: 76,
    height: 76,
    borderRadius: 28,
    backgroundColor: COLORS.goldSoft,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 12,
  },
  previewTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "900",
    textAlign: "center",
  },
  previewSub: {
    color: COLORS.sub,
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 4,
    marginBottom: 16,
  },
  previewRow: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingVertical: 11,
  },
  previewLabel: { color: COLORS.sub, fontSize: 12, fontWeight: "700" },
  previewValue: { color: COLORS.text, fontSize: 14, fontWeight: "900", marginTop: 3 },
  input: {
    minHeight: 50,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    paddingHorizontal: 13,
    color: COLORS.text,
    fontWeight: "800",
    marginBottom: 12,
  },
  inputLabel: { color: COLORS.text, fontSize: 13, fontWeight: "900", marginBottom: 8 },
  categoryRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 14 },
  categoryChip: {
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryChipActive: { backgroundColor: COLORS.navy, borderColor: COLORS.navy },
  categoryText: { color: COLORS.sub, fontSize: 12, fontWeight: "800" },
  categoryTextActive: { color: COLORS.white },
  submitBtn: {
    minHeight: 52,
    backgroundColor: COLORS.gold,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },
  submitBtnText: { color: COLORS.navy, fontSize: 14, fontWeight: "900" },
  bottomNavWrap: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 18,
  },
  bottomNav: {
    height: 76,
    backgroundColor: COLORS.navy,
    borderRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    elevation: 12,
  },
  bottomNavItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  bottomNavIcon: { fontSize: 18, color: "#94A3B8" },
  bottomNavLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#94A3B8",
    marginTop: 4,
  },
  bottomNavActive: { color: COLORS.gold },
});