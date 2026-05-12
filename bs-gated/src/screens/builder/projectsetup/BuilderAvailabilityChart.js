

import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
  StyleSheet,
  Modal,
  Image,
  Platform,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BuilderBottomNav from "../BuilderBottomNav";
import { useBuilder } from "../BuilderContext";

const COLORS = {
  navy: "#1A7A7A",
  navy2: "#1A7A7A",
  white: "#FFFFFF",
  bg: "#E8F5F5",
  card: "#FFFFFF",
  text: "#111827",
  sub: "#64748B",
  border: "#E5E7EB",
  gold: "#C9A84C",
  goldSoft: "#FFF7D6",
  green: "#15803D",
  greenSoft: "#DCFCE7",
  red: "#B91C1C",
  redSoft: "#FEE2E2",
  blue: "#2563EB",
  blueSoft: "#DBEAFE",
  orange: "#C2410C",
  orangeSoft: "#FFEDD5",
};

const FILTERS = ["All", "Pending Approval", "Approved", "Rejected"];

const formatMoney = (value) => {
  const amount = Number(value || 0);
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  return `₹${amount.toLocaleString("en-IN")}`;
};

const getBookingAmount = (booking) =>
  booking?.bookingAmount || booking?.amount || booking?.paidAmount || 0;

const getDocs = (booking) => {
  if (!Array.isArray(booking?.documents)) return [];
  return booking.documents.filter(Boolean);
};

const isImageDoc = (doc) => {
  const type = String(doc?.type || doc?.mimeType || "").toLowerCase();
  const uri = String(doc?.uri || doc?.url || "").toLowerCase();
  const name = String(doc?.name || doc?.fileName || "").toLowerCase();

  return (
    type.startsWith("image") ||
    uri.endsWith(".jpg") ||
    uri.endsWith(".jpeg") ||
    uri.endsWith(".png") ||
    uri.endsWith(".webp") ||
    name.endsWith(".jpg") ||
    name.endsWith(".jpeg") ||
    name.endsWith(".png") ||
    name.endsWith(".webp")
  );
};

const getDocUri = (doc) => doc?.uri || doc?.url || doc?.fileUri || "";

const statusConfig = (status) => {
  if (status === "Approved" || status === "Confirmed") {
    return { bg: COLORS.greenSoft, color: COLORS.green };
  }
  if (status === "Rejected") {
    return { bg: COLORS.redSoft, color: COLORS.red };
  }
  if (status === "Pending Approval" || status === "Builder Approval Pending") {
    return { bg: COLORS.orangeSoft, color: COLORS.orange };
  }
  return { bg: COLORS.blueSoft, color: COLORS.blue };
};

function Header({ navigation, unreadCount }) {
  return (
    <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: 8 }}>
          <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 16, fontWeight: '600' }}>‹ Back</Text>
        </TouchableOpacity>
      <StatusBar backgroundColor={COLORS.navy} barStyle="light-content" />

      <View style={styles.headerTop}>
        <TouchableOpacity
          style={styles.backBtn}
          activeOpacity={0.85}
          onPress={() => navigation.navigate("BuilderDashboard")}
        >
          <Ionicons name="chevron-back" size={22} color={COLORS.white} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Guest Bookings</Text>
          <Text style={styles.headerSub}>Verify documents, payment and approvals</Text>
        </View>

        <TouchableOpacity
          style={styles.notificationBtn}
          activeOpacity={0.85}
          onPress={() => navigation.navigate("BuilderNotificationScreen")}
        >
          <Ionicons name="notifications-outline" size={21} color={COLORS.white} />
          {unreadCount > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {unreadCount > 9 ? "9+" : unreadCount}
              </Text>
            </View>
          ) : null}
        </TouchableOpacity>
      </View>
    </View>
  );
}

function StatCard({ title, value, icon, color, bg, active, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.statCard, active && styles.statCardActive]}
      activeOpacity={0.9}
      onPress={onPress}
    >
      <View style={[styles.statIcon, { backgroundColor: bg }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </TouchableOpacity>
  );
}

function FilterChip({ label, active, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.filterChip, active && styles.filterChipActive]}
      activeOpacity={0.85}
      onPress={onPress}
    >
      <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function BookingCard({ booking, onPress }) {
  const cfg = statusConfig(booking?.status);
  const docs = getDocs(booking);

  return (
    <TouchableOpacity style={styles.bookingCard} activeOpacity={0.9} onPress={onPress}>
      <View style={styles.bookingTop}>
        <View style={styles.bookingIcon}>
          <Ionicons name="document-text-outline" size={22} color={COLORS.navy} />
        </View>

        <View style={styles.bookingMain}>
          <Text style={styles.bookingTitle}>{booking?.guestName || "Customer"}</Text>
          <Text style={styles.bookingSub}>
            {booking?.projectName || "Project"} • {booking?.unitNo || "Unit"} •{" "}
            {booking?.unitType || "Flat"}
          </Text>
        </View>

        <View style={[styles.statusPill, { backgroundColor: cfg.bg }]}>
          <Text style={[styles.statusText, { color: cfg.color }]}>
            {booking?.status || "Pending Approval"}
          </Text>
        </View>
      </View>

      <View style={styles.bookingInfoGrid}>
        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Booking</Text>
          <Text style={styles.infoValue}>{formatMoney(getBookingAmount(booking))}</Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Payment</Text>
          <Text style={styles.infoValue}>{booking?.paymentStatus || "Pending"}</Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Documents</Text>
          <Text style={styles.infoValue}>
            {docs.length ? `${docs.length} Uploaded` : "No Docs"}
          </Text>
        </View>
      </View>

      <View style={styles.bookingFooter}>
        <View style={styles.footerItem}>
          <Ionicons name="call-outline" size={15} color={COLORS.sub} />
          <Text style={styles.footerText}>{booking?.phone || "No phone"}</Text>
        </View>

        <View style={styles.footerItem}>
          <Ionicons name="time-outline" size={15} color={COLORS.sub} />
          <Text style={styles.footerText}>{booking?.createdAt || "Recently"}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function DetailRow({ label, value }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value || "-"}</Text>
    </View>
  );
}

function DocumentCard({ doc, index }) {
  const uri = getDocUri(doc);
  const title = doc?.name || doc?.fileName || doc?.title || `Document ${index + 1}`;

  const openDocument = async () => {
    if (!uri) return;

    const canOpen = await Linking.canOpenURL(uri);
    if (canOpen) {
      Linking.openURL(uri);
    }
  };

  if (isImageDoc(doc) && uri) {
    return (
      <TouchableOpacity style={styles.docImageWrap} activeOpacity={0.9} onPress={openDocument}>
        <Image source={{ uri }} style={styles.docImage} resizeMode="cover" />
        <Text numberOfLines={1} style={styles.docName}>
          {title}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.fileBox} activeOpacity={0.85} onPress={openDocument}>
      <Ionicons name="document-attach-outline" size={30} color={COLORS.blue} />
      <Text numberOfLines={2} style={styles.fileName}>
        {title}
      </Text>
      <Text style={styles.fileHint}>{uri ? "Tap to open" : "No file URI"}</Text>
    </TouchableOpacity>
  );
}

function BookingModal({
  visible,
  booking,
  onClose,
  onApprove,
  onReject,
  onVerifyDocs,
  onPaymentReceived,
}) {
  if (!booking) return null;

  const docs = getDocs(booking);
  const isClosed = booking?.status === "Approved" || booking?.status === "Rejected";
  const docsVerified = booking?.documentStatus === "Verified";
  const paymentReceived = booking?.paymentStatus === "Received";

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <View style={styles.modalTitleBox}>
              <Text style={styles.modalTitle}>Booking Details</Text>
              <Text style={styles.modalSub}>{booking?.id || "Booking Request"}</Text>
            </View>

            <TouchableOpacity style={styles.modalClose} onPress={onClose}>
              <Ionicons name="close" size={20} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.customerBox}>
              <View style={styles.customerIcon}>
                <Ionicons name="person-outline" size={23} color={COLORS.navy} />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.customerName}>{booking?.guestName || "Customer"}</Text>
                <Text style={styles.customerSub}>
                  {booking?.projectName || "Project"} • {booking?.unitNo || "Unit"}
                </Text>
              </View>

              <View style={[styles.statusPill, { backgroundColor: statusConfig(booking?.status).bg }]}>
                <Text style={[styles.statusText, { color: statusConfig(booking?.status).color }]}>
                  {booking?.status || "Pending"}
                </Text>
              </View>
            </View>

            <View style={styles.detailBox}>
              <DetailRow label="Phone" value={booking?.phone} />
              <DetailRow label="Email" value={booking?.email} />
              <DetailRow label="Unit Type" value={booking?.unitType} />
              <DetailRow label="Booking Amount" value={formatMoney(getBookingAmount(booking))} />
              <DetailRow label="Payment Status" value={booking?.paymentStatus || "Pending"} />
              <DetailRow label="Document Status" value={booking?.documentStatus || "Pending"} />
              <DetailRow label="Stage" value={booking?.stage || "Builder Verification"} />
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Uploaded Documents</Text>
              <Text style={styles.sectionSub}>
                Images show as thumbnails. PDF/Word files can be opened by tapping.
              </Text>
            </View>

            {docs.length ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.docsScroll}
              >
                {docs.map((doc, index) => (
                  <DocumentCard key={`${doc?.uri || doc?.name || index}`} doc={doc} index={index} />
                ))}
              </ScrollView>
            ) : (
              <View style={styles.noDocsBox}>
                <Ionicons name="folder-open-outline" size={30} color={COLORS.sub} />
                <Text style={styles.noDocsTitle}>No documents uploaded</Text>
              </View>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.softBtn, (docsVerified || isClosed) && styles.disabledBtn]}
                disabled={docsVerified || isClosed}
                onPress={onVerifyDocs}
              >
                <Ionicons name="shield-checkmark-outline" size={18} color={COLORS.navy} />
                <Text style={styles.softBtnText}>
                  {docsVerified ? "Docs Verified" : "Verify Docs"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.softBtn, (paymentReceived || isClosed) && styles.disabledBtn]}
                disabled={paymentReceived || isClosed}
                onPress={onPaymentReceived}
              >
                <Ionicons name="wallet-outline" size={18} color={COLORS.navy} />
                <Text style={styles.softBtnText}>
                  {paymentReceived ? "Payment Received" : "Mark Payment"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.approveBtn, isClosed && styles.disabledBtn]}
                disabled={isClosed}
                onPress={onApprove}
              >
                <Ionicons name="checkmark-circle-outline" size={18} color={COLORS.white} />
                <Text style={styles.approveBtnText}>Approve Booking</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.rejectBtn, isClosed && styles.disabledBtn]}
                disabled={isClosed}
                onPress={onReject}
              >
                <Ionicons name="close-circle-outline" size={18} color={COLORS.white} />
                <Text style={styles.rejectBtnText}>Reject Booking</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

export default function BuilderUnitBooking({ navigation }) {
  const {
    bookings = [],
    notifications = [],
    approveBooking,
    rejectBooking,
    verifyBookingDocuments,
    markBookingPaymentReceived,
  } = useBuilder();

  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const unreadCount = notifications.filter((item) => !item?.read).length;

  const stats = useMemo(() => {
    return {
      total: bookings.length,
      pending: bookings.filter((b) => b?.status === "Pending Approval").length,
      approved: bookings.filter((b) => b?.status === "Approved").length,
      rejected: bookings.filter((b) => b?.status === "Rejected").length,
    };
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    const q = search.trim().toLowerCase();

    return bookings
      .filter((b) => filter === "All" || b?.status === filter)
      .filter((b) => {
        if (!q) return true;
        return `${b?.guestName || ""} ${b?.projectName || ""} ${b?.unitNo || ""} ${
          b?.phone || ""
        } ${b?.email || ""}`
          .toLowerCase()
          .includes(q);
      });
  }, [bookings, filter, search]);

  const openBooking = (booking) => {
    setSelectedBooking(booking);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const handleVerifyDocs = () => {
    if (!selectedBooking?.id) return;
    if (typeof verifyBookingDocuments === "function") {
      verifyBookingDocuments(selectedBooking.id);
    }
    setSelectedBooking((prev) =>
      prev ? { ...prev, documentStatus: "Verified" } : prev
    );
  };

  const handlePaymentReceived = () => {
    if (!selectedBooking?.id) return;
    if (typeof markBookingPaymentReceived === "function") {
      markBookingPaymentReceived(selectedBooking.id, getBookingAmount(selectedBooking));
    }
    setSelectedBooking((prev) =>
      prev ? { ...prev, paymentStatus: "Received" } : prev
    );
  };

  const handleApprove = () => {
    if (!selectedBooking?.id) return;
    if (typeof approveBooking === "function") {
      approveBooking(selectedBooking.id);
    }
    setModalVisible(false);
  };

  const handleReject = () => {
    if (!selectedBooking?.id) return;
    if (typeof rejectBooking === "function") {
      rejectBooking(selectedBooking.id);
    }
    setModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.screen}>
        <Header navigation={navigation} unreadCount={unreadCount} />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.statsRow}>
            <StatCard
              title="Total"
              value={stats.total}
              icon="documents-outline"
              color={COLORS.blue}
              bg={COLORS.blueSoft}
              active={filter === "All"}
              onPress={() => setFilter("All")}
            />
            <StatCard
              title="Pending"
              value={stats.pending}
              icon="time-outline"
              color={COLORS.orange}
              bg={COLORS.orangeSoft}
              active={filter === "Pending Approval"}
              onPress={() => setFilter("Pending Approval")}
            />
            <StatCard
              title="Approved"
              value={stats.approved}
              icon="checkmark-done-outline"
              color={COLORS.green}
              bg={COLORS.greenSoft}
              active={filter === "Approved"}
              onPress={() => setFilter("Approved")}
            />
            <StatCard
              title="Rejected"
              value={stats.rejected}
              icon="close-circle-outline"
              color={COLORS.red}
              bg={COLORS.redSoft}
              active={filter === "Rejected"}
              onPress={() => setFilter("Rejected")}
            />
          </View>

          <View style={styles.searchCard}>
            <Ionicons name="search-outline" size={19} color={COLORS.sub} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search guest, phone, unit..."
              placeholderTextColor="#94A3B8"
              style={styles.searchInput}
            />
            {search ? (
              <TouchableOpacity onPress={() => setSearch("")}>
                <Ionicons name="close-circle" size={19} color={COLORS.sub} />
              </TouchableOpacity>
            ) : null}
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >
            {FILTERS.map((item) => (
              <FilterChip
                key={item}
                label={item}
                active={filter === item}
                onPress={() => setFilter(item)}
              />
            ))}
          </ScrollView>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Booking Requests</Text>
            <Text style={styles.sectionSub}>
              Tap any booking to view customer details and uploaded documents.
            </Text>
          </View>

          <View style={styles.bookingList}>
            {filteredBookings.length ? (
              filteredBookings.map((booking) => (
                <BookingCard
                  key={booking?.id || `${booking?.guestName}-${booking?.unitNo}`}
                  booking={booking}
                  onPress={() => openBooking(booking)}
                />
              ))
            ) : (
              <View style={styles.emptyBox}>
                <Ionicons name="folder-open-outline" size={34} color={COLORS.sub} />
                <Text style={styles.emptyTitle}>No bookings found</Text>
                <Text style={styles.emptySub}>
                  Customer booking requests will appear here.
                </Text>
              </View>
            )}
          </View>
        </ScrollView>

        <BuilderBottomNav navigation={navigation} activeRoute="BuilderUnitBooking" />

        <BookingModal
          visible={modalVisible}
          booking={selectedBooking}
          onClose={closeModal}
          onVerifyDocs={handleVerifyDocs}
          onPaymentReceived={handlePaymentReceived}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.navy,
  },
  screen: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    backgroundColor: COLORS.navy,
    paddingTop: Platform.OS === "android" ? 18 : 4,
    paddingHorizontal: 16,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
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
    borderRadius: 13,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    flex: 1,
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: "900",
  },
  headerSub: {
    color: "#CBD5E1",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },
  notificationBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: 5,
    right: 5,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.red,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: "900",
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 118,
  },
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 14,
  },
  statCard: {
    width: "48.5%",
    backgroundColor: COLORS.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 13,
  },
  statCardActive: {
    backgroundColor: COLORS.goldSoft,
    borderColor: COLORS.gold,
  },
  statIcon: {
    width: 34,
    height: 34,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  statValue: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: "900",
  },
  statTitle: {
    color: COLORS.sub,
    fontSize: 12,
    fontWeight: "800",
    marginTop: 2,
  },
  searchCard: {
    height: 52,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  searchInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "700",
  },
  filterScroll: {
    gap: 8,
    paddingTop: 14,
    paddingBottom: 3,
  },
  filterChip: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  filterChipActive: {
    backgroundColor: COLORS.navy,
    borderColor: COLORS.navy,
  },
  filterChipText: {
    color: COLORS.sub,
    fontSize: 12,
    fontWeight: "800",
  },
  filterChipTextActive: {
    color: COLORS.white,
  },
  sectionHeader: {
    marginTop: 16,
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
  bookingList: {
    gap: 10,
  },
  bookingCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
  },
  bookingTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },
  bookingIcon: {
    width: 43,
    height: 43,
    borderRadius: 15,
    backgroundColor: COLORS.goldSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  bookingMain: {
    flex: 1,
  },
  bookingTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "900",
  },
  bookingSub: {
    color: COLORS.sub,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 3,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "900",
  },
  bookingInfoGrid: {
    flexDirection: "row",
    gap: 8,
    marginTop: 13,
  },
  infoBox: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 10,
  },
  infoLabel: {
    color: COLORS.sub,
    fontSize: 10,
    fontWeight: "800",
  },
  infoValue: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "900",
    marginTop: 4,
  },
  bookingFooter: {
    marginTop: 12,
    paddingTop: 11,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 6,
  },
  footerItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  footerText: {
    color: COLORS.sub,
    fontSize: 12,
    fontWeight: "700",
  },
  emptyBox: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
  },
  emptyTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "900",
    marginTop: 8,
  },
  emptySub: {
    color: COLORS.sub,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.58)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 16,
    maxHeight: "92%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  modalTitleBox: {
    flex: 1,
  },
  modalTitle: {
    color: COLORS.text,
    fontSize: 19,
    fontWeight: "900",
  },
  modalSub: {
    color: COLORS.sub,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 2,
  },
  modalClose: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: COLORS.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  customerBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    marginBottom: 14,
  },
  customerIcon: {
    width: 43,
    height: 43,
    borderRadius: 16,
    backgroundColor: COLORS.goldSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  customerName: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "900",
  },
  customerSub: {
    color: COLORS.sub,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 3,
  },
  detailBox: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
    backgroundColor: COLORS.white,
  },
  detailRow: {
    minHeight: 46,
    paddingHorizontal: 13,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  detailLabel: {
    color: COLORS.sub,
    fontSize: 12,
    fontWeight: "800",
  },
  detailValue: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "900",
    maxWidth: "58%",
    textAlign: "right",
  },
  docsScroll: {
    gap: 10,
    paddingBottom: 4,
  },
  docImageWrap: {
    width: 105,
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
  },
  docImage: {
    width: "100%",
    height: 86,
    backgroundColor: COLORS.bg,
  },
  docName: {
    color: COLORS.text,
    fontSize: 11,
    fontWeight: "800",
    paddingHorizontal: 8,
    paddingVertical: 7,
  },
  fileBox: {
    width: 105,
    height: 126,
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
  },
  fileName: {
    color: COLORS.text,
    fontSize: 11,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 6,
  },
  fileHint: {
    color: COLORS.sub,
    fontSize: 9,
    fontWeight: "700",
    marginTop: 3,
  },
  noDocsBox: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
    padding: 18,
    alignItems: "center",
  },
  noDocsTitle: {
    color: COLORS.sub,
    fontSize: 13,
    fontWeight: "800",
    marginTop: 7,
  },
  modalActions: {
    gap: 10,
    marginTop: 16,
    marginBottom: 10,
  },
  softBtn: {
    minHeight: 49,
    borderRadius: 15,
    backgroundColor: COLORS.goldSoft,
    borderWidth: 1,
    borderColor: "#F1D27A",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 7,
  },
  softBtnText: {
    color: COLORS.navy,
    fontSize: 13,
    fontWeight: "900",
  },
  approveBtn: {
    minHeight: 50,
    borderRadius: 15,
    backgroundColor: COLORS.green,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 7,
  },
  approveBtnText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "900",
  },
  rejectBtn: {
    minHeight: 50,
    borderRadius: 15,
    backgroundColor: COLORS.red,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 7,
  },
  rejectBtnText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "900",
  },
  disabledBtn: {
    opacity: 0.5,
  },
});