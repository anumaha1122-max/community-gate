
import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Modal,
  Platform,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useAppContext } from "../superadmin/SocietyContext";

const C = {
  navy: "#1A7A7A",
  navyMid: "#1A7A7A",
  white: "#FFFFFF",
  offWhite: "#F7F8FA",
  border: "#E8ECF0",
  text: "#0B1628",
  textMid: "#4B5563",
  textSoft: "#94A3B8",
  gold: "#C9943A",
  goldLight: "#FDF3E3",
  green: "#059669",
  greenLight: "#D1FAE5",
  orange: "#D97706",
  orangeLight: "#FEF3C7",
  red: "#DC2626",
  redLight: "#FEE2E2",
  blue: "#1D4ED8",
  blueLight: "#DBEAFE",
  purple: "#7C3AED",
  purpleLight: "#EDE9FE",
};

const VISIT_TABS = ["All", "Pending", "Approved", "Rejected"];

const statusConfig = {
  Pending: { label: "Pending", color: C.orange, bg: C.orangeLight },
  Approved: { label: "Approved", color: C.green, bg: C.greenLight },
  Rejected: { label: "Rejected", color: C.red, bg: C.redLight },
};

function initials(name = "Customer") {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function Avatar({ name, size = 44 }) {
  return (
    <View style={[sc.avatar, { width: size, height: size, borderRadius: 14 }]}>
      <Text style={[sc.avatarText, { fontSize: size * 0.34 }]}>
        {initials(name)}
      </Text>
    </View>
  );
}

function StatusBadge({ status }) {
  const cfg = statusConfig[status] || statusConfig.Pending;

  return (
    <View style={[sc.badge, { backgroundColor: cfg.bg }]}>
      <View style={[sc.badgeDot, { backgroundColor: cfg.color }]} />
      <Text style={[sc.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
    </View>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <View style={sc.infoRow}>
      <Text style={sc.infoIcon}>{icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={sc.infoLabel}>{label}</Text>
        <Text style={sc.infoValue}>{value || "N/A"}</Text>
      </View>
    </View>
  );
}

function BottomTab({ icon, label, active, onPress }) {
  return (
    <TouchableOpacity style={sc.navItem} onPress={onPress} activeOpacity={0.8}>
      <Text style={[sc.navIcon, active && sc.navActive]}>{icon}</Text>
      <Text style={[sc.navLabel, active && sc.navActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

function VisitCard({ visit, onView, onApprove, onReject }) {
  return (
    <View style={sc.card}>
      <View style={sc.cardTop}>
        <Avatar name={visit.customerName} />

        <View style={{ flex: 1 }}>
          <Text style={sc.cardName}>{visit.customerName || "Customer"}</Text>
          <Text style={sc.cardSub}>{visit.customerPhone || "No phone"}</Text>
          <Text style={sc.cardSub}>{visit.projectName}</Text>
        </View>

        <StatusBadge status={visit.status} />
      </View>

      <View style={sc.chipRow}>
        <View style={sc.chip}>
          <Text style={sc.chipText}>📅 {visit.visitDate}</Text>
        </View>
        <View style={sc.chip}>
          <Text style={sc.chipText}>🕐 {visit.visitTime}</Text>
        </View>
        <View style={sc.chip}>
          <Text style={sc.chipText}>🏠 {visit.unitNumber}</Text>
        </View>
        <View style={[sc.chip, { backgroundColor: C.purpleLight }]}>
          <Text style={[sc.chipText, { color: C.purple }]}>
            {visit.unitType || "Unit"}
          </Text>
        </View>
      </View>

      {!!visit.message && (
        <View style={sc.messageBox}>
          <Text style={sc.messageLabel}>Customer Message</Text>
          <Text style={sc.messageText}>{visit.message}</Text>
        </View>
      )}

      <View style={sc.cardDivider} />

      <View style={sc.cardFooter}>
        <Text style={sc.cardFooterText}>ID: {visit.id}</Text>

        <TouchableOpacity style={sc.viewBtn} onPress={() => onView(visit)}>
          <Text style={sc.viewBtnText}>Details</Text>
          <Ionicons name="chevron-forward" size={12} color={C.gold} />
        </TouchableOpacity>
      </View>

      {visit.status === "Pending" && (
        <View style={sc.actionRow}>
          <TouchableOpacity
            style={[sc.actionBtn, { borderColor: C.green }]}
            onPress={() => onApprove(visit.id)}
          >
            <Ionicons name="checkmark-circle-outline" size={15} color={C.green} />
            <Text style={[sc.actionBtnText, { color: C.green }]}>Approve</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[sc.actionBtn, { borderColor: C.red }]}
            onPress={() => onReject(visit.id)}
          >
            <Ionicons name="close-circle-outline" size={15} color={C.red} />
            <Text style={[sc.actionBtnText, { color: C.red }]}>Reject</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

export default function BuilderVisitBooking({ navigation, route }) {
  const {
    visitRequests = [],
    approveVisitRequest,
    rejectVisitRequest,
  } = useAppContext();

  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState(null);

  const currentRoute = route?.name || "BuilderVisitBooking";

  const stats = useMemo(
    () => ({
      total: visitRequests.length,
      pending: visitRequests.filter((v) => v.status === "Pending").length,
      approved: visitRequests.filter((v) => v.status === "Approved").length,
      rejected: visitRequests.filter((v) => v.status === "Rejected").length,
    }),
    [visitRequests]
  );

  const filteredVisits = useMemo(() => {
    let list = [...visitRequests];

    if (activeTab !== "All") {
      list = list.filter((v) => v.status === activeTab);
    }

    if (search.trim()) {
      const q = search.toLowerCase();

      list = list.filter((v) =>
        `${v.customerName} ${v.customerPhone} ${v.projectName} ${v.unitNumber} ${v.id}`
          .toLowerCase()
          .includes(q)
      );
    }

    return list;
  }, [visitRequests, activeTab, search]);

  const nav = (screen) => {
    if (currentRoute !== screen) navigation?.navigate?.(screen);
  };

  const handleApprove = (id) => {
    approveVisitRequest(
      id,
      "Your slot booking is approved by builder. Please visit at your selected date and time."
    );
  };

  const handleReject = (id) => {
    rejectVisitRequest(
      id,
      "Your slot booking was rejected by builder. Please choose another slot."
    );
  };

  return (
    <SafeAreaView style={sc.safe}>
      <StatusBar backgroundColor={C.navy} barStyle="light-content" />

      <View style={sc.root}>
        <View style={sc.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: 8 }}>
          <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 16, fontWeight: '600' }}>‹ Back</Text>
        </TouchableOpacity>
          <TouchableOpacity style={sc.backBtn} onPress={() => nav("BuilderDashboard")}>
            <Ionicons name="chevron-back" size={20} color={C.white} />
          </TouchableOpacity>

          <View style={sc.headerIcon}>
            <MaterialCommunityIcons name="calendar-account" size={21} color={C.navy} />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={sc.headerTitle}>Visit Bookings</Text>
            <Text style={sc.headerSub}>Customer slot requests · Approvals</Text>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={sc.scroll}>
          <View style={sc.statsRow}>
            {[
              { label: "Total", value: stats.total, color: C.blue, icon: "👥" },
              { label: "Pending", value: stats.pending, color: C.orange, icon: "⏳" },
              { label: "Approved", value: stats.approved, color: C.green, icon: "✅" },
              { label: "Rejected", value: stats.rejected, color: C.red, icon: "❌" },
            ].map((s) => (
              <View key={s.label} style={[sc.statCard, { borderTopColor: s.color }]}>
                <Text style={sc.statEmoji}>{s.icon}</Text>
                <Text style={[sc.statValue, { color: s.color }]}>{s.value}</Text>
                <Text style={sc.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>

          <View style={sc.banner}>
            <View style={{ flex: 1 }}>
              <Text style={sc.bannerTitle}>Customer Visit Requests</Text>
              <Text style={sc.bannerSub}>
                Approve or reject customer slot bookings here.
              </Text>
            </View>

            <View style={sc.bannerIconWrap}>
              <Ionicons name="calendar-outline" size={26} color={C.navy} />
            </View>
          </View>

          <View style={sc.searchWrap}>
            <Ionicons name="search-outline" size={17} color={C.textSoft} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search customer, project, unit..."
              placeholderTextColor={C.textSoft}
              style={sc.searchInput}
            />

            {!!search && (
              <TouchableOpacity onPress={() => setSearch("")}>
                <Ionicons name="close-circle" size={18} color={C.textSoft} />
              </TouchableOpacity>
            )}
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={sc.tabRow}
          >
            {VISIT_TABS.map((t) => (
              <TouchableOpacity
                key={t}
                style={[sc.tab, activeTab === t && sc.tabActive]}
                onPress={() => setActiveTab(t)}
                activeOpacity={0.8}
              >
                <Text style={[sc.tabText, activeTab === t && sc.tabTextActive]}>
                  {t}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={sc.sectionHead}>
            <Text style={sc.sectionTitle}>Visit Records</Text>
            <Text style={sc.sectionCount}>
              {filteredVisits.length} request{filteredVisits.length !== 1 ? "s" : ""}
            </Text>
          </View>

          {filteredVisits.map((visit) => (
            <VisitCard
              key={visit.id}
              visit={visit}
              onView={(v) => {
                setSelectedVisit(v);
                setShowDetailModal(true);
              }}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          ))}

          {filteredVisits.length === 0 && (
            <View style={sc.empty}>
              <Text style={sc.emptyIcon}>📭</Text>
              <Text style={sc.emptyTitle}>No visit requests found</Text>
              <Text style={sc.emptySub}>
                Customer slot bookings will appear here.
              </Text>
            </View>
          )}
        </ScrollView>

        {/* <View style={sc.navBar}>
          <BottomTab
            icon="🏠"
            label="Dashboard"
            active={currentRoute === "BuilderDashboard"}
            onPress={() => nav("BuilderDashboard")}
          />
          <BottomTab
            icon="🏢"
            label="Projects"
            active={currentRoute === "BuilderProjectSetup"}
            onPress={() => nav("BuilderProjectSetup")}
          />
          <BottomTab icon="📅" label="Visits" active onPress={() => {}} />
          <BottomTab
            icon="💳"
            label="Payments"
            active={currentRoute === "BuilderPaymentSchedule"}
            onPress={() => nav("BuilderPaymentSchedule")}
          />
        </View> */}

        <Modal
          visible={showDetailModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowDetailModal(false)}
        >
          <View style={sc.centreOverlay}>
            <View style={sc.detailSheet}>
              <View style={sc.modalHead}>
                <Text style={sc.modalTitle}>Visit Details</Text>

                <TouchableOpacity
                  style={sc.closeBtn}
                  onPress={() => setShowDetailModal(false)}
                >
                  <Ionicons name="close" size={18} color={C.textMid} />
                </TouchableOpacity>
              </View>

              {selectedVisit && (
                <ScrollView showsVerticalScrollIndicator={false}>
                  <View style={sc.detailTop}>
                    <Avatar name={selectedVisit.customerName} size={52} />

                    <View style={{ flex: 1 }}>
                      <Text style={sc.detailName}>
                        {selectedVisit.customerName || "Customer"}
                      </Text>
                      <Text style={sc.detailSub}>
                        {selectedVisit.customerPhone || "No phone"}
                      </Text>
                    </View>

                    <StatusBadge status={selectedVisit.status} />
                  </View>

                  <View style={sc.detailCardGrid}>
                    <InfoRow icon="🏢" label="Project" value={selectedVisit.projectName} />
                    <InfoRow icon="🏠" label="Unit" value={selectedVisit.unitNumber} />
                    <InfoRow icon="📅" label="Date" value={selectedVisit.visitDate} />
                    <InfoRow icon="🕐" label="Time" value={selectedVisit.visitTime} />
                    <InfoRow icon="👤" label="Customer" value={selectedVisit.customerName} />
                    <InfoRow icon="📞" label="Phone" value={selectedVisit.customerPhone} />
                    <InfoRow icon="🆔" label="Request ID" value={selectedVisit.id} />
                  </View>

                  {!!selectedVisit.message && (
                    <View style={sc.detailNotesBox}>
                      <Text style={sc.detailNotesLabel}>Customer Message</Text>
                      <Text style={sc.detailNotesText}>{selectedVisit.message}</Text>
                    </View>
                  )}

                  {!!selectedVisit.builderMessage && (
                    <View style={sc.detailNotesBox}>
                      <Text style={sc.detailNotesLabel}>Builder Message</Text>
                      <Text style={sc.detailNotesText}>
                        {selectedVisit.builderMessage}
                      </Text>
                    </View>
                  )}

                  {selectedVisit.status === "Pending" && (
                    <View style={sc.actionRow}>
                      <TouchableOpacity
                        style={[sc.actionBtn, { borderColor: C.green }]}
                        onPress={() => {
                          handleApprove(selectedVisit.id);
                          setShowDetailModal(false);
                        }}
                      >
                        <Ionicons
                          name="checkmark-circle-outline"
                          size={15}
                          color={C.green}
                        />
                        <Text style={[sc.actionBtnText, { color: C.green }]}>
                          Approve
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[sc.actionBtn, { borderColor: C.red }]}
                        onPress={() => {
                          handleReject(selectedVisit.id);
                          setShowDetailModal(false);
                        }}
                      >
                        <Ionicons
                          name="close-circle-outline"
                          size={15}
                          color={C.red}
                        />
                        <Text style={[sc.actionBtnText, { color: C.red }]}>
                          Reject
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  <TouchableOpacity
                    style={sc.primaryBtn}
                    onPress={() => setShowDetailModal(false)}
                  >
                    <Text style={sc.primaryBtnText}>Close</Text>
                  </TouchableOpacity>
                </ScrollView>
              )}
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const sc = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.navy },
  root: { flex: 1, backgroundColor: C.offWhite },

  header: {
    backgroundColor: C.navy,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingTop: Platform.OS === "android" ? 14 : 6,
    paddingBottom: 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: "rgba(255,255,255,0.10)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: C.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { color: C.white, fontSize: 18, fontWeight: "800" },
  headerSub: {
    color: "#94A3B8",
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },

  scroll: { padding: 16, paddingBottom: 120 },

  statsRow: { flexDirection: "row", gap: 10, marginBottom: 14 },
  statCard: {
    flex: 1,
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: C.border,
    borderTopWidth: 4,
    alignItems: "center",
  },
  statEmoji: { fontSize: 16, marginBottom: 4 },
  statValue: { fontSize: 18, fontWeight: "900" },
  statLabel: {
    color: C.textSoft,
    fontSize: 10,
    fontWeight: "700",
    marginTop: 2,
  },

  banner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.navy,
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
  },
  bannerTitle: { color: C.white, fontSize: 16, fontWeight: "900" },
  bannerSub: {
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },
  bannerIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: C.gold,
    alignItems: "center",
    justifyContent: "center",
  },

  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: C.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 13,
    height: 48,
    marginBottom: 4,
  },
  searchInput: {
    flex: 1,
    color: C.text,
    fontSize: 14,
    fontWeight: "600",
  },

  tabRow: { gap: 8, paddingVertical: 12 },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
  },
  tabActive: { backgroundColor: C.navy, borderColor: C.navy },
  tabText: { color: C.textMid, fontWeight: "700", fontSize: 13 },
  tabTextActive: { color: C.white },

  sectionHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: { color: C.text, fontSize: 17, fontWeight: "900" },
  sectionCount: { color: C.textSoft, fontSize: 12, fontWeight: "700" },

  card: {
    backgroundColor: C.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
    marginBottom: 14,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 12,
  },
  cardName: { color: C.text, fontSize: 16, fontWeight: "900" },
  cardSub: {
    color: C.textMid,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
    marginBottom: 12,
  },
  chip: {
    backgroundColor: C.offWhite,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: C.border,
  },
  chipText: { color: C.textMid, fontSize: 11, fontWeight: "700" },
  cardDivider: { height: 1, backgroundColor: C.border, marginBottom: 10 },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardFooterText: { color: C.textSoft, fontSize: 11, fontWeight: "700" },
  viewBtn: { flexDirection: "row", alignItems: "center", gap: 2 },
  viewBtnText: { color: C.gold, fontSize: 12, fontWeight: "800" },

  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  badgeDot: { width: 6, height: 6, borderRadius: 3 },
  badgeText: { fontSize: 11, fontWeight: "800" },

  avatar: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.goldLight,
  },
  avatarText: { color: C.navy, fontWeight: "900" },

  messageBox: {
    backgroundColor: C.goldLight,
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  },
  messageLabel: {
    color: C.gold,
    fontSize: 11,
    fontWeight: "900",
    marginBottom: 4,
  },
  messageText: {
    color: C.text,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 19,
  },

  actionRow: { flexDirection: "row", gap: 10, marginTop: 12 },
  actionBtn: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    borderWidth: 1.5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  actionBtnText: { fontSize: 13, fontWeight: "800" },

  empty: {
    backgroundColor: C.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.border,
    padding: 36,
    alignItems: "center",
  },
  emptyIcon: { fontSize: 38, marginBottom: 10 },
  emptyTitle: { color: C.text, fontSize: 16, fontWeight: "900" },
  emptySub: {
    color: C.textSoft,
    fontSize: 13,
    fontWeight: "600",
    marginTop: 4,
    textAlign: "center",
  },

  navBar: {
    position: "absolute",
    left: 14,
    right: 14,
    bottom: 16,
    height: 72,
    backgroundColor: C.navy,
    borderRadius: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    elevation: 12,
  },
  navItem: { flex: 1, alignItems: "center", justifyContent: "center" },
  navIcon: { fontSize: 18, color: "#64748B" },
  navLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#64748B",
    marginTop: 4,
  },
  navActive: { color: C.gold },

  centreOverlay: {
    flex: 1,
    backgroundColor: "rgba(11,22,40,0.65)",
    justifyContent: "center",
    padding: 18,
  },
  detailSheet: {
    backgroundColor: C.white,
    borderRadius: 24,
    padding: 20,
    maxHeight: "88%",
  },
  modalHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  modalTitle: { color: C.text, fontSize: 17, fontWeight: "900" },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: C.offWhite,
    alignItems: "center",
    justifyContent: "center",
  },
  detailTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  detailName: { color: C.text, fontSize: 17, fontWeight: "900" },
  detailSub: {
    color: C.textMid,
    fontSize: 13,
    fontWeight: "600",
    marginTop: 2,
  },
  detailCardGrid: {
    backgroundColor: C.offWhite,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    padding: 4,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  infoIcon: { fontSize: 14, marginTop: 2 },
  infoLabel: { color: C.textSoft, fontSize: 11, fontWeight: "700" },
  infoValue: {
    color: C.text,
    fontSize: 13,
    fontWeight: "800",
    marginTop: 2,
  },
  detailNotesBox: {
    backgroundColor: C.orangeLight,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  detailNotesLabel: {
    color: C.orange,
    fontSize: 11,
    fontWeight: "800",
    marginBottom: 4,
  },
  detailNotesText: {
    color: C.text,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 20,
  },
  primaryBtn: {
    height: 52,
    backgroundColor: C.gold,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
  },
  primaryBtnText: {
    color: C.navy,
    fontSize: 15,
    fontWeight: "900",
  },
});