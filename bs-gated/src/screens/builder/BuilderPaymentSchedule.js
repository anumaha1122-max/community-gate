
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
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Alert,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

import { useAppContext } from "../superadmin/SocietyContext";
import BuilderBottomNav from "./BuilderBottomNav";

const COLORS = {
  navy: "#1A7A7A",
  navy2: "#1A7A7A",
  white: "#FFFFFF",
  bg: "#E8F5F5",
  text: "#1F2937",
  sub: "#64748B",
  border: "#E5E7EB",
  gold: "#ffffff",
  goldSoft: "#FFF7D6",
  green: "#16A34A",
  greenSoft: "#DCFCE7",
  red: "#DC2626",
  redSoft: "#FEE2E2",
  blue: "#2563EB",
  blueSoft: "#DBEAFE",
  orange: "#F59E0B",
  orangeSoft: "#FEF3C7",
};

const PAYMENT_METHODS = ["UPI", "Card", "Bank Transfer", "Cash", "Cheque"];
const STATUS_TABS = ["All", "Pending", "Paid", "Possession"];

const money = (v) => `₹${Number(v || 0).toLocaleString("en-IN")}`;

const shortMoney = (v) => {
  const n = Number(v || 0);
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  return money(n);
};

const pct = (paid, total) =>
  !total ? 0 : Math.min(100, Math.round((paid / total) * 100));

const today = () =>
  new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const initials = (name = "") =>
  name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

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
          activeOpacity={0.85}
          onPress={() => navigation.navigate("BuilderDashboard")}
        >
          <Ionicons name="chevron-back" size={22} color={COLORS.white} />
        </TouchableOpacity>

        <View style={styles.headerIcon}>
          <MaterialCommunityIcons
            name="cash-multiple"
            size={23}
            color={COLORS.navy}
          />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Payments</Text>
          <Text style={styles.headerSub}>Collections · Receipts · Possession</Text>
        </View>
      </View>
    </View>
  );
}

function StatCard({ label, value, icon, color, softColor }) {
  return (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={[styles.statIconWrap, { backgroundColor: softColor }]}>
        <Ionicons name={icon} size={17} color={color} />
      </View>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function TabChip({ label, active, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.tab, active && styles.tabActive]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

function Avatar({ name }) {
  return (
    <View style={styles.avatar}>
      <Text style={styles.avatarText}>{initials(name || "Customer")}</Text>
    </View>
  );
}

function AmountBox({ label, value, color }) {
  return (
    <View style={{ flex: 1, alignItems: "center" }}>
      <Text style={styles.amountLabel}>{label}</Text>
      <Text style={[styles.amountValue, { color }]}>{value}</Text>
    </View>
  );
}

function ActionBtn({ icon, label, onPress, primary, disabled }) {
  return (
    <TouchableOpacity
      style={[
        styles.actionBtn,
        primary && styles.actionBtnPrimary,
        disabled && styles.actionBtnDisabled,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}
    >
      <Ionicons
        name={icon}
        size={15}
        color={primary ? COLORS.navy : COLORS.navy2}
      />
      <Text style={[styles.actionBtnText, primary && styles.actionBtnTextPrimary]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function PaymentCard({
  booking,
  total,
  paid,
  pending,
  percent,
  onCollect,
  onReceipt,
  onFinalReceipt,
}) {
  const isPaid = pending === 0;
  const possessionEligible = percent >= 90;

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <Avatar name={booking.customerName || booking.guestName} />

        <View style={{ flex: 1 }}>
          <Text style={styles.cardName}>
            {booking.customerName || booking.guestName || "Customer"}
          </Text>
          <Text style={styles.cardSub}>
            {booking.projectName} · Unit {booking.unitNo || booking.unitNumber}
          </Text>
          <Text style={styles.cardPhone}>
            {booking.phone || booking.customerPhone || "No phone"}
          </Text>
        </View>

        <View
          style={[
            styles.statusBadge,
            isPaid ? styles.badgePaid : styles.badgePending,
          ]}
        >
          <Text
            style={[
              styles.statusText,
              { color: isPaid ? COLORS.green : COLORS.orange },
            ]}
          >
            {isPaid ? "Fully Paid" : "Pending"}
          </Text>
        </View>
      </View>

      <View style={styles.amountRow}>
        <AmountBox label="Total" value={shortMoney(total)} color={COLORS.text} />
        <View style={styles.amountDivider} />
        <AmountBox label="Customer Paid" value={shortMoney(paid)} color={COLORS.green} />
        <View style={styles.amountDivider} />
        <AmountBox label="Balance" value={shortMoney(pending)} color={COLORS.orange} />
      </View>

      <View style={styles.progressRow}>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${percent}%`,
                backgroundColor: possessionEligible ? COLORS.green : COLORS.gold,
              },
            ]}
          />
        </View>
        <Text
          style={[
            styles.progressPct,
            { color: possessionEligible ? COLORS.green : COLORS.gold },
          ]}
        >
          {percent}%
        </Text>
      </View>

      <View
        style={[
          styles.milestoneRow,
          possessionEligible && { backgroundColor: COLORS.greenSoft },
        ]}
      >
        <View style={{ flex: 1 }}>
          <Text
            style={[
              styles.milestoneLabel,
              possessionEligible && { color: COLORS.green },
            ]}
          >
            Possession Certificate
          </Text>
          <Text style={styles.milestoneValue}>
            {possessionEligible
              ? "Eligible after 90% payment"
              : "Locked until 90% payment"}
          </Text>
        </View>

        <Ionicons
          name={possessionEligible ? "document-text-outline" : "lock-closed-outline"}
          size={24}
          color={possessionEligible ? COLORS.green : COLORS.orange}
        />
      </View>

      {booking.paymentHistory?.length > 0 && (
        <View style={styles.historyBox}>
          <Text style={styles.historyTitle}>Customer Payment History</Text>
          {booking.paymentHistory.map((pay) => (
            <View key={pay.id} style={styles.historyRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.historyText}>{pay.id}</Text>
                <Text style={styles.historySub}>
                  {pay.method || "Customer Payment"} ·{" "}
                  {new Date(pay.paidAt).toLocaleString("en-IN")}
                </Text>
              </View>
              <Text style={styles.historyAmount}>{money(pay.amount)}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.actionRow}>
        <ActionBtn
          icon="receipt-outline"
          label="View Receipt"
          onPress={() => onReceipt(booking)}
        />

        {!isPaid ? (
          <ActionBtn
            icon="wallet-outline"
            label="Collect"
            primary
            onPress={() => onCollect(booking)}
          />
        ) : (
          <ActionBtn
            icon="send-outline"
            label="Final Receipt"
            primary
            onPress={() => onFinalReceipt(booking)}
          />
        )}
      </View>
    </View>
  );
}

function CollectModal({ visible, booking, pending, onClose, onSubmit }) {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("UPI");
  const [errMsg, setErrMsg] = useState("");

  const reset = () => {
    setAmount("");
    setMethod("UPI");
    setErrMsg("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = () => {
    const n = Number(amount);

    if (!n || n <= 0) {
      setErrMsg("Enter a valid amount.");
      return;
    }

    if (n > pending) {
      setErrMsg("Cannot exceed pending balance.");
      return;
    }

    onSubmit({ amount: n, method });
    reset();
  };

  if (!booking) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.modalSheet}>
          <View style={styles.sheetHandle} />

          <View style={styles.modalHead}>
            <Text style={styles.modalTitle}>Collect Manual Payment</Text>
            <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
              <Ionicons name="close" size={20} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalInfoCard}>
            <Avatar name={booking.customerName || booking.guestName} />
            <View style={{ flex: 1 }}>
              <Text style={styles.modalCustName}>
                {booking.customerName || booking.guestName}
              </Text>
              <Text style={styles.modalCustSub}>
                {booking.projectName} · Unit {booking.unitNo || booking.unitNumber}
              </Text>
              <Text
                style={[
                  styles.modalCustSub,
                  { color: COLORS.orange, fontWeight: "700", marginTop: 4 },
                ]}
              >
                Balance: {money(pending)}
              </Text>
            </View>
          </View>

          {errMsg ? (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle-outline" size={16} color={COLORS.red} />
              <Text style={styles.errorText}>{errMsg}</Text>
            </View>
          ) : null}

          <Text style={styles.inputLabel}>Amount (₹)</Text>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={(t) => {
              setAmount(t.replace(/[^0-9]/g, ""));
              setErrMsg("");
            }}
            placeholder="Enter amount"
            placeholderTextColor="#94A3B8"
            keyboardType="number-pad"
          />

          <Text style={styles.inputLabel}>Payment Method</Text>
          <View style={styles.methodRow}>
            {PAYMENT_METHODS.map((m) => (
              <TouchableOpacity
                key={m}
                style={[styles.methodChip, method === m && styles.methodChipActive]}
                onPress={() => setMethod(m)}
                activeOpacity={0.85}
              >
                <Text
                  style={[styles.methodText, method === m && styles.methodTextActive]}
                >
                  {m}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.primaryBtn} onPress={handleSubmit}>
            <Ionicons name="checkmark-circle-outline" size={19} color={COLORS.navy} />
            <Text style={styles.primaryBtnText}>Record Payment</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function ReceiptModal({ visible, booking, total, paid, pending, percent, onClose }) {
  if (!booking) return null;

  const latest = booking.paymentHistory?.[booking.paymentHistory.length - 1];

  const rows = [
    ["Customer", booking.customerName || booking.guestName],
    ["Phone", booking.phone || booking.customerPhone],
    ["Project", booking.projectName],
    ["Unit", booking.unitNo || booking.unitNumber],
    ["Latest Receipt", latest?.id || "No receipt yet"],
    ["Latest Amount", latest ? money(latest.amount) : "No payment yet"],
    ["Amount Paid", money(paid)],
    ["Balance Due", money(pending)],
    ["Completion", `${percent}%`],
    ["Possession", percent >= 90 ? "Certificate Eligible" : "Locked"],
  ];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.centreOverlay}>
        <View style={styles.receiptCard}>
          <View style={styles.receiptHeader}>
            <View>
              <Text style={styles.receiptBrandLabel}>PAYMENT RECEIPT</Text>
              <Text style={styles.receiptNo}>{latest?.id || "No Receipt"}</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={20} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.receiptDivider} />

          {rows.map(([label, val]) => (
            <View key={label} style={styles.receiptRow}>
              <Text style={styles.rcLabel}>{label}</Text>
              <Text style={styles.rcValue}>{val || "—"}</Text>
            </View>
          ))}

          <View style={styles.receiptDivider} />

          <View style={styles.receiptTotalRow}>
            <Text style={styles.rcTotalLabel}>Total Agreement Value</Text>
            <Text style={styles.rcTotalValue}>{money(total)}</Text>
          </View>

          <TouchableOpacity style={styles.primaryBtn} onPress={onClose}>
            <Text style={styles.primaryBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

export default function BuilderPaymentSchedule({ navigation }) {
  const {
    flatBookingRequests = [],
    addCustomerPayment,
    getPaymentPercentage,
    getBookingTotalAmount,
  } = useAppContext();

  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [selBooking, setSelBooking] = useState(null);
  const [showCollect, setShowCollect] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);

  const approvedBookings = useMemo(
    () => flatBookingRequests.filter((b) => b.status === "Approved"),
    [flatBookingRequests]
  );

  const getPaid = (b) => Number(b.paidAmount || 0);
  const getTotal = (b) => getBookingTotalAmount(b);
  const getPending = (b) => Math.max(getTotal(b) - getPaid(b), 0);

  const globalStats = useMemo(() => {
    const collected = approvedBookings.reduce((s, b) => s + getPaid(b), 0);
    const total = approvedBookings.reduce((s, b) => s + getTotal(b), 0);
    const pending = Math.max(total - collected, 0);
    const possession = approvedBookings.filter((b) => getPaymentPercentage(b) >= 90).length;

    return {
      collected,
      pending,
      total,
      possession,
      paidUnits: approvedBookings.filter((b) => getPending(b) === 0).length,
    };
  }, [approvedBookings]);

  const completion = pct(globalStats.collected, globalStats.total);

  const filteredList = useMemo(() => {
    let list = [...approvedBookings];

    if (activeTab === "Pending") list = list.filter((b) => getPending(b) > 0);
    if (activeTab === "Paid") list = list.filter((b) => getPending(b) === 0);
    if (activeTab === "Possession")
      list = list.filter((b) => getPaymentPercentage(b) >= 90);

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((b) =>
        `${b.customerName || b.guestName || ""} ${b.phone || b.customerPhone || ""} ${
          b.projectName || ""
        } ${b.unitNo || b.unitNumber || ""}`.toLowerCase().includes(q)
      );
    }

    return list;
  }, [approvedBookings, activeTab, search]);

  const openCollect = (booking) => {
    setSelBooking(booking);
    setShowCollect(true);
  };

  const openReceipt = (booking) => {
    setSelBooking(booking);
    setShowReceipt(true);
  };

  const submitPayment = ({ amount, method }) => {
    if (!selBooking) return;

    addCustomerPayment(selBooking.id, amount, method);

    Alert.alert(
      "Payment Recorded",
      `${money(amount)} recorded for ${selBooking.customerName || selBooking.guestName}.`
    );

    setShowCollect(false);
  };

  const sendFinalReceipt = async (booking) => {
    const total = getTotal(booking);
    const paid = getPaid(booking);
    const pending = getPending(booking);
    const percent = getPaymentPercentage(booking);

    if (percent < 100 || pending > 0) {
      Alert.alert("Not Eligible", "Final receipt can be sent only after 100% payment.");
      return;
    }

    const receiptNo = `FINAL-${booking.id}`;
    const issueDate = today();

    const html = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 34px; color: #0F172A; }
            .box { border: 4px solid #0F172A; border-radius: 18px; padding: 30px; }
            .title { text-align: center; font-size: 28px; font-weight: 900; text-transform: uppercase; }
            .sub { text-align: center; color: #64748B; margin-top: 6px; margin-bottom: 26px; }
            .row { display: flex; justify-content: space-between; border-bottom: 1px solid #E5E7EB; padding: 10px 0; font-size: 15px; }
            .label { font-weight: 700; color: #475569; }
            .value { font-weight: 800; text-align: right; }
            .paid { margin-top: 24px; background: #DCFCE7; color: #15803D; padding: 16px; border-radius: 12px; font-weight: 900; text-align: center; }
            .footer { margin-top: 44px; display: flex; justify-content: space-between; align-items: flex-end; }
            .sign { width: 220px; text-align: center; border-top: 1px solid #0F172A; padding-top: 8px; font-weight: 700; }
            .note { margin-top: 24px; color: #64748B; font-size: 12px; line-height: 1.5; }
          </style>
        </head>
        <body>
          <div class="box">
            <div class="title">Final Payment Receipt</div>
            <div class="sub">Receipt No: ${receiptNo}</div>

            <div class="row"><span class="label">Customer</span><span class="value">${booking.customerName || booking.guestName || "-"}</span></div>
            <div class="row"><span class="label">Phone</span><span class="value">${booking.phone || booking.customerPhone || "-"}</span></div>
            <div class="row"><span class="label">Project</span><span class="value">${booking.projectName || "-"}</span></div>
            <div class="row"><span class="label">Unit</span><span class="value">${booking.unitNo || booking.unitNumber || "-"}</span></div>
            <div class="row"><span class="label">Unit Type</span><span class="value">${booking.unitType || "Flat"}</span></div>
            <div class="row"><span class="label">Total Agreement Value</span><span class="value">${money(total)}</span></div>
            <div class="row"><span class="label">Total Paid</span><span class="value">${money(paid)}</span></div>
            <div class="row"><span class="label">Balance</span><span class="value">${money(pending)}</span></div>
            <div class="row"><span class="label">Payment Completion</span><span class="value">${percent}%</span></div>
            <div class="row"><span class="label">Issued Date</span><span class="value">${issueDate}</span></div>

            <div class="paid">FULL PAYMENT COMPLETED</div>

            <div class="footer">
              <div>
                <b>Status:</b> Final receipt issued<br/>
                <b>Generated By:</b> Builder Management System
              </div>
              <div class="sign">Authorized Signature</div>
            </div>

            <div class="note">
              This receipt confirms payment completion in the application records. It does not replace registered legal documents.
            </div>
          </div>
        </body>
      </html>
    `;

    try {
      const file = await Print.printToFileAsync({ html });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.uri);
      } else {
        Alert.alert("Final Receipt Generated", file.uri);
      }
    } catch {
      Alert.alert("Error", "Unable to generate final receipt.");
    }
  };

  const selectedTotal = selBooking ? getTotal(selBooking) : 0;
  const selectedPaid = selBooking ? getPaid(selBooking) : 0;
  const selectedPending = selBooking ? getPending(selBooking) : 0;
  const selectedPercent = selBooking ? getPaymentPercentage(selBooking) : 0;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.screen}>
        <Header navigation={navigation} />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.heroCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroLabel}>Payment Dashboard</Text>
              <Text style={styles.heroTitle}>Approved Flat Bookings</Text>
              <Text style={styles.heroSub}>
                Customer-paid amount · Receipts · 90% possession
              </Text>
              <View style={styles.heroProgressRow}>
                <View style={styles.heroProgressTrack}>
                  <View style={[styles.heroProgressFill, { width: `${completion}%` }]} />
                </View>
                <Text style={styles.heroProgressPct}>{completion}%</Text>
              </View>
            </View>
          </View>

          <View style={styles.statsRow}>
            <StatCard
              label="Collected"
              value={shortMoney(globalStats.collected)}
              color={COLORS.green}
              softColor={COLORS.greenSoft}
              icon="cash-outline"
            />
            <StatCard
              label="Pending"
              value={shortMoney(globalStats.pending)}
              color={COLORS.orange}
              softColor={COLORS.orangeSoft}
              icon="time-outline"
            />
            <StatCard
              label="Total Value"
              value={shortMoney(globalStats.total)}
              color={COLORS.blue}
              softColor={COLORS.blueSoft}
              icon="home-outline"
            />
            <StatCard
              label="Possession"
              value={`${globalStats.possession}`}
              color={COLORS.gold}
              softColor={COLORS.goldSoft}
              icon="document-text-outline"
            />
          </View>

          <View style={styles.searchCard}>
            <Ionicons name="search-outline" size={19} color={COLORS.sub} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search customer, unit, phone..."
              placeholderTextColor="#94A3B8"
              style={styles.searchInput}
            />
            {!!search && (
              <TouchableOpacity onPress={() => setSearch("")}>
                <Ionicons name="close-circle" size={19} color={COLORS.sub} />
              </TouchableOpacity>
            )}
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabRow}
          >
            {STATUS_TABS.map((t) => (
              <TabChip
                key={t}
                label={t}
                active={activeTab === t}
                onPress={() => setActiveTab(t)}
              />
            ))}
          </ScrollView>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Payment Records</Text>
            <Text style={styles.sectionSub}>
              {filteredList.length} customer{filteredList.length !== 1 ? "s" : ""}
            </Text>
          </View>

          <View style={styles.listWrap}>
            {filteredList.length > 0 ? (
              filteredList.map((booking) => (
                <PaymentCard
                  key={booking.id}
                  booking={booking}
                  total={getTotal(booking)}
                  paid={getPaid(booking)}
                  pending={getPending(booking)}
                  percent={getPaymentPercentage(booking)}
                  onCollect={openCollect}
                  onReceipt={openReceipt}
                  onFinalReceipt={sendFinalReceipt}
                />
              ))
            ) : (
              <View style={styles.emptyBox}>
                <Ionicons name="wallet-outline" size={36} color={COLORS.sub} />
                <Text style={styles.emptyTitle}>No payment records found</Text>
                <Text style={styles.emptySub}>
                  Approved customer flat bookings will appear here.
                </Text>
              </View>
            )}
          </View>
        </ScrollView>

        <BuilderBottomNav navigation={navigation} activeRoute="BuilderPaymentSchedule" />

        <CollectModal
          visible={showCollect}
          booking={selBooking}
          pending={selectedPending}
          onClose={() => setShowCollect(false)}
          onSubmit={submitPayment}
        />

        <ReceiptModal
          visible={showReceipt}
          booking={selBooking}
          total={selectedTotal}
          paid={selectedPaid}
          pending={selectedPending}
          percent={selectedPercent}
          onClose={() => setShowReceipt(false)}
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
  headerTop: { marginTop: 30, flexDirection: "row", alignItems: "center", gap: 12 },
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
  headerSub: { color: "#CBD5E1", fontSize: 12, fontWeight: "600", marginTop: 2 },

  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 110 },

  heroCard: {
    backgroundColor: COLORS.navy2,
    borderRadius: 24,
    padding: 18,
    marginBottom: 14,
    elevation: 5,
  },
  heroLabel: {
    color: COLORS.gold,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  heroTitle: { color: COLORS.white, fontSize: 22, fontWeight: "900", marginTop: 4 },
  heroSub: { color: "#CBD5E1", fontSize: 12, fontWeight: "600", marginTop: 4 },
  heroProgressRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 14 },
  heroProgressTrack: {
    flex: 1,
    height: 8,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.16)",
    overflow: "hidden",
  },
  heroProgressFill: { height: "100%", backgroundColor: COLORS.gold, borderRadius: 8 },
  heroProgressPct: { color: COLORS.white, fontSize: 12, fontWeight: "900" },

  statsRow: { flexDirection: "row", gap: 10, marginBottom: 14 },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 11,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderLeftWidth: 4,
  },
  statIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 7,
  },
  statValue: { fontSize: 14, fontWeight: "900" },
  statLabel: { color: COLORS.sub, fontSize: 10, fontWeight: "700", marginTop: 2 },

  searchCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 13,
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  searchInput: { flex: 1, color: COLORS.text, fontSize: 13, fontWeight: "700" },

  tabRow: { gap: 8, paddingVertical: 12 },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tabActive: { backgroundColor: COLORS.navy, borderColor: COLORS.navy },
  tabText: { color: COLORS.sub, fontWeight: "700", fontSize: 13 },
  tabTextActive: { color: COLORS.white },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: { color: COLORS.text, fontSize: 18, fontWeight: "900" },
  sectionSub: { color: COLORS.sub, fontSize: 12, fontWeight: "700" },

  listWrap: { gap: 12 },

  card: {
    backgroundColor: COLORS.white,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 15,
  },
  cardTop: { flexDirection: "row", alignItems: "flex-start", gap: 11, marginBottom: 13 },
  cardName: { color: COLORS.text, fontSize: 16, fontWeight: "900" },
  cardSub: { color: COLORS.sub, fontSize: 12, fontWeight: "600", marginTop: 2 },
  cardPhone: { color: "#94A3B8", fontSize: 12, fontWeight: "600", marginTop: 1 },

  avatar: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.goldSoft,
  },
  avatarText: { color: COLORS.navy2, fontSize: 17, fontWeight: "900" },

  statusBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  badgePaid: { backgroundColor: COLORS.greenSoft },
  badgePending: { backgroundColor: COLORS.orangeSoft },
  statusText: { fontSize: 11, fontWeight: "900" },

  amountRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 11,
    marginBottom: 12,
  },
  amountDivider: { width: 1, height: 30, backgroundColor: COLORS.border },
  amountLabel: { color: COLORS.sub, fontSize: 10, fontWeight: "700", marginBottom: 4 },
  amountValue: { fontSize: 12, fontWeight: "900" },

  progressRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  progressTrack: {
    flex: 1,
    height: 7,
    borderRadius: 999,
    backgroundColor: "#E2E8F0",
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: 999 },
  progressPct: { fontSize: 12, fontWeight: "900", width: 40, textAlign: "right" },

  milestoneRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.blueSoft,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  milestoneLabel: { color: COLORS.blue, fontSize: 11, fontWeight: "700" },
  milestoneValue: { color: COLORS.navy, fontSize: 13, fontWeight: "900", marginTop: 2 },

  historyBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  historyTitle: { color: COLORS.text, fontSize: 13, fontWeight: "900", marginBottom: 8 },
  historyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  historyText: { color: COLORS.text, fontSize: 12, fontWeight: "900" },
  historySub: { color: COLORS.sub, fontSize: 10, fontWeight: "700", marginTop: 2 },
  historyAmount: { color: COLORS.green, fontSize: 12, fontWeight: "900" },

  actionRow: { flexDirection: "row", gap: 10 },
  actionBtn: {
    flex: 1,
    height: 42,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  actionBtnPrimary: { backgroundColor: COLORS.goldSoft, borderColor: COLORS.gold },
  actionBtnDisabled: { opacity: 0.5 },
  actionBtnText: { color: COLORS.navy2, fontSize: 13, fontWeight: "800" },
  actionBtnTextPrimary: { color: COLORS.navy },

  emptyBox: {
    backgroundColor: COLORS.white,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 32,
    alignItems: "center",
  },
  emptyTitle: { color: COLORS.text, fontSize: 15, fontWeight: "900", marginTop: 10 },
  emptySub: {
    color: COLORS.sub,
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 5,
    lineHeight: 18,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.55)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 36 : 24,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    alignSelf: "center",
    marginBottom: 16,
  },
  modalHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: { color: COLORS.text, fontSize: 18, fontWeight: "900" },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: COLORS.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  modalInfoCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 13,
    marginBottom: 14,
  },
  modalCustName: { color: COLORS.text, fontSize: 15, fontWeight: "900" },
  modalCustSub: { color: COLORS.sub, fontSize: 12, fontWeight: "600", marginTop: 2 },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: COLORS.redSoft,
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
  },
  errorText: { color: COLORS.red, fontWeight: "700", fontSize: 13, flex: 1 },
  inputLabel: { color: COLORS.text, fontSize: 13, fontWeight: "800", marginBottom: 8 },
  input: {
    height: 50,
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    color: COLORS.text,
    fontWeight: "700",
    fontSize: 15,
    marginBottom: 14,
  },
  methodRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 18 },
  methodChip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  methodChipActive: { backgroundColor: COLORS.navy, borderColor: COLORS.navy },
  methodText: { color: COLORS.sub, fontSize: 12, fontWeight: "800" },
  methodTextActive: { color: COLORS.white },
  primaryBtn: {
    height: 52,
    backgroundColor: COLORS.gold,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  primaryBtnText: { color: COLORS.navy, fontSize: 15, fontWeight: "900" },

  centreOverlay: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.55)",
    justifyContent: "center",
    padding: 18,
  },
  receiptCard: { backgroundColor: COLORS.white, borderRadius: 24, padding: 20 },
  receiptHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  receiptBrandLabel: {
    color: COLORS.sub,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 2,
  },
  receiptNo: { color: COLORS.navy, fontSize: 20, fontWeight: "900", marginTop: 2 },
  receiptDivider: { height: 1, backgroundColor: COLORS.border, marginVertical: 10 },
  receiptRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  rcLabel: { color: COLORS.sub, fontSize: 12, fontWeight: "700" },
  rcValue: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "800",
    maxWidth: "55%",
    textAlign: "right",
  },
  receiptTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  rcTotalLabel: { color: COLORS.text, fontSize: 14, fontWeight: "900" },
  rcTotalValue: { color: COLORS.gold, fontSize: 18, fontWeight: "900" },
});