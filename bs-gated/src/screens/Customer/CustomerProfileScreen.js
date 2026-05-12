
// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   ScrollView,
//   Alert,
//   TextInput,
// } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import * as Print from "expo-print";
// import * as Sharing from "expo-sharing";
// import { useAppContext } from "../superadmin/SocietyContext";

// export default function CustomerProfileScreen({ navigation }) {
//   const {
//     visitRequests = [],
//     flatBookingRequests = [],
//     addCustomerPayment,
//     getPaymentPercentage,
//     getBookingTotalAmount,
//   } = useAppContext();

//   const [paymentInputs, setPaymentInputs] = useState({});

//   const logout = () => {
//     navigation.reset({
//       index: 0,
//       routes: [{ name: "AuthScreen" }],
//     });
//   };

//   const formatMoney = (amount) => {
//     const value = Number(amount || 0);
//     return `₹${value.toLocaleString("en-IN")}`;
//   };

//   const statusStyle = (status) => {
//     if (status === "Approved") {
//       return { bg: "#DCFCE7", color: "#15803D", icon: "checkmark-circle" };
//     }
//     if (status === "Rejected") {
//       return { bg: "#FEE2E2", color: "#B91C1C", icon: "close-circle" };
//     }
//     return { bg: "#FEF3C7", color: "#B45309", icon: "time" };
//   };

//   const renderStatusBadge = (status) => {
//     const s = statusStyle(status);

//     return (
//       <View style={[styles.badge, { backgroundColor: s.bg }]}>
//         <Ionicons name={s.icon} size={14} color={s.color} />
//         <Text style={[styles.badgeText, { color: s.color }]}>
//           {status}
//         </Text>
//       </View>
//     );
//   };

//   const payCustomAmount = (booking) => {
//     const amount = Number(paymentInputs[booking.id] || 0);
//     const total = getBookingTotalAmount(booking);
//     const paid = Number(booking.paidAmount || 0);
//     const remaining = Math.max(total - paid, 0);

//     if (!amount || amount <= 0) {
//       Alert.alert("Invalid Amount", "Please enter a valid payment amount.");
//       return;
//     }

//     if (amount > remaining) {
//       Alert.alert(
//         "Amount Too High",
//         `You can pay only up to remaining amount: ${formatMoney(remaining)}`
//       );
//       return;
//     }

//     addCustomerPayment(booking.id, amount, "Customer Payment");

//     Alert.alert(
//       "Payment Successful",
//       `You paid ${formatMoney(amount)} for ${booking.projectName}.`
//     );

//     setPaymentInputs((prev) => ({ ...prev, [booking.id]: "" }));
//   };

//   const downloadPossessionCertificate = async (booking) => {
//     const percent = getPaymentPercentage(booking);

//     if (percent < 90) {
//       Alert.alert("Locked", "Certificate unlocks after 90% payment.");
//       return;
//     }

//     const certificateNo = `PC-${booking.id}`;
//     const today = new Date().toLocaleDateString("en-IN", {
//       day: "2-digit",
//       month: "long",
//       year: "numeric",
//     });

//     const html = `
//       <html>
//         <head>
//           <meta name="viewport" content="width=device-width, initial-scale=1.0" />
//           <style>
//             body {
//               font-family: Arial, sans-serif;
//               padding: 36px;
//               color: #0F172A;
//             }
//             .certificate {
//               border: 4px solid #0F172A;
//               padding: 32px;
//               border-radius: 18px;
//             }
//             .title {
//               text-align: center;
//               font-size: 28px;
//               font-weight: 900;
//               color: #0F172A;
//               margin-bottom: 8px;
//               text-transform: uppercase;
//             }
//             .subtitle {
//               text-align: center;
//               color: #64748B;
//               font-size: 14px;
//               margin-bottom: 28px;
//             }
//             .section {
//               margin-top: 22px;
//               font-size: 15px;
//               line-height: 1.7;
//             }
//             .row {
//               margin: 10px 0;
//               font-size: 15px;
//             }
//             .label {
//               font-weight: 700;
//               color: #334155;
//             }
//             .approval {
//               background: #DCFCE7;
//               color: #15803D;
//               padding: 14px;
//               border-radius: 12px;
//               margin-top: 24px;
//               font-weight: 700;
//               line-height: 1.6;
//             }
//             .footer {
//               margin-top: 46px;
//               display: flex;
//               flex-direction: row;
//               justify-content: space-between;
//               align-items: flex-end;
//             }
//             .sign {
//               text-align: center;
//               width: 220px;
//               border-top: 1px solid #0F172A;
//               padding-top: 8px;
//               font-weight: 700;
//             }
//             .note {
//               margin-top: 30px;
//               font-size: 12px;
//               color: #64748B;
//               line-height: 1.5;
//             }
//           </style>
//         </head>
//         <body>
//           <div class="certificate">
//             <div class="title">Possession Certificate</div>
//             <div class="subtitle">Certificate No: ${certificateNo}</div>

//             <div class="section">
//               This is to certify that <b>${
//                 booking.customerName || booking.guestName || "Customer"
//               }</b>
//               has paid <b>${percent}%</b> of the flat booking amount and is eligible for limited possession access.
//             </div>

//             <div class="section">
//               <div class="row"><span class="label">Project:</span> ${
//                 booking.projectName || "-"
//               }</div>
//               <div class="row"><span class="label">Unit:</span> ${
//                 booking.unitNo || booking.unitNumber || "-"
//               }</div>
//               <div class="row"><span class="label">Unit Type:</span> ${
//                 booking.unitType || "Flat"
//               }</div>
//               <div class="row"><span class="label">Customer Phone:</span> ${
//                 booking.phone || booking.customerPhone || "-"
//               }</div>
//               <div class="row"><span class="label">Total Amount:</span> ${formatMoney(
//                 getBookingTotalAmount(booking)
//               )}</div>
//               <div class="row"><span class="label">Paid Amount:</span> ${formatMoney(
//                 booking.paidAmount || 0
//               )}</div>
//               <div class="row"><span class="label">Payment Completion:</span> ${percent}%</div>
//               <div class="row"><span class="label">Issued Date:</span> ${today}</div>
//             </div>

//             <div class="approval">
//               The customer is permitted to start internal modification works such as minor repairs,
//               interior planning, measurements, furniture work, and finishing-related preparation,
//               subject to builder/society safety rules and approval conditions.
//             </div>

//             <div class="footer">
//               <div>
//                 <b>Status:</b> Possession Access Granted<br />
//                 <b>Generated By:</b> Builder Management System
//               </div>
//               <div class="sign">Authorized Signature</div>
//             </div>

//             <div class="note">
//               Note: This certificate is system generated. It does not replace final sale deed,
//               registration, or legal handover documents.
//             </div>
//           </div>
//         </body>
//       </html>
//     `;

//     try {
//       const file = await Print.printToFileAsync({ html });

//       if (await Sharing.isAvailableAsync()) {
//         await Sharing.shareAsync(file.uri);
//       } else {
//         Alert.alert("Certificate Generated", file.uri);
//       }
//     } catch (error) {
//       Alert.alert("Error", "Unable to generate certificate.");
//     }
//   };

//   return (
//     <ScrollView style={styles.container} contentContainerStyle={styles.content}>
//       <View style={styles.profileCard}>
//         <View style={styles.avatar}>
//           <Ionicons name="person" size={34} color="#FFFFFF" />
//         </View>
//         <Text style={styles.name}>Customer User</Text>
//       </View>

//       <Text style={styles.sectionTitle}>Visit Notifications</Text>

//       {visitRequests.length === 0 ? (
//         <Text style={styles.emptyText}>No visit requests yet.</Text>
//       ) : (
//         visitRequests.map((visit) => (
//           <View key={visit.id} style={styles.itemCard}>
//             <View style={styles.rowBetween}>
//               <Text style={styles.itemTitle}>{visit.projectName}</Text>
//               {renderStatusBadge(visit.status)}
//             </View>

//             <Text style={styles.itemSub}>
//               Unit: {visit.unitNumber} • {visit.unitType || "Flat"}
//             </Text>
//             <Text style={styles.itemSub}>
//               Date: {visit.visitDate} • Time: {visit.visitTime}
//             </Text>

//             {visit.status === "Approved" && (
//               <View style={styles.successBox}>
//                 <Ionicons name="notifications-outline" size={18} color="#15803D" />
//                 <Text style={styles.successText}>
//                   Your slot booking is approved by builder.
//                 </Text>
//               </View>
//             )}

//             {!!visit.builderMessage && (
//               <Text style={styles.messageText}>{visit.builderMessage}</Text>
//             )}
//           </View>
//         ))
//       )}

//       <Text style={styles.sectionTitle}>Flat Booking & Payments</Text>

//       {flatBookingRequests.length === 0 ? (
//         <Text style={styles.emptyText}>No flat booking requests yet.</Text>
//       ) : (
//         flatBookingRequests.map((booking) => {
//           const percent = getPaymentPercentage(booking);
//           const total = getBookingTotalAmount(booking);
//           const paid = Number(booking.paidAmount || 0);
//           const remaining = Math.max(total - paid, 0);
//           const certificateUnlocked = percent >= 90;

//           return (
//             <View key={booking.id} style={styles.itemCard}>
//               <View style={styles.rowBetween}>
//                 <Text style={styles.itemTitle}>{booking.projectName}</Text>
//                 {renderStatusBadge(booking.status)}
//               </View>

//               <Text style={styles.itemSub}>
//                 Unit: {booking.unitNo || booking.unitNumber} •{" "}
//                 {booking.unitType || "Flat"}
//               </Text>

//               <Text style={styles.itemSub}>
//                 Phone: {booking.phone || booking.customerPhone}
//               </Text>

//               <Text style={styles.price}>Total: {formatMoney(total)}</Text>

//               <Text style={styles.itemSub}>
//                 Paid: {formatMoney(paid)} • Remaining: {formatMoney(remaining)}
//               </Text>

//               <View style={styles.progressBar}>
//                 <View style={[styles.progressFill, { width: `${percent}%` }]} />
//               </View>

//               <Text style={styles.percentText}>{percent}% Payment Completed</Text>

//               {booking.status === "Approved" && percent < 100 && (
//                 <View style={styles.paymentBox}>
//                   <Text style={styles.inputLabel}>Enter Payment Amount</Text>

//                   <TextInput
//                     style={styles.input}
//                     placeholder="Enter amount"
//                     placeholderTextColor="#94A3B8"
//                     keyboardType="numeric"
//                     value={paymentInputs[booking.id] || ""}
//                     onChangeText={(text) =>
//                       setPaymentInputs((prev) => ({
//                         ...prev,
//                         [booking.id]: text.replace(/[^0-9]/g, ""),
//                       }))
//                     }
//                   />

//                   <TouchableOpacity
//                     style={styles.payBtn}
//                     onPress={() => payCustomAmount(booking)}
//                   >
//                     <Ionicons name="card-outline" size={18} color="#FFFFFF" />
//                     <Text style={styles.payText}>Pay Now</Text>
//                   </TouchableOpacity>
//                 </View>
//               )}

//               {certificateUnlocked ? (
//                 <View style={styles.certificateBox}>
//                   <View style={{ flex: 1 }}>
//                     <Text style={styles.certificateTitle}>
//                       Possession Certificate Unlocked
//                     </Text>
//                     <Text style={styles.certificateText}>
//                       You can download certificate and start approved flat modification work.
//                     </Text>
//                   </View>
//                   <Ionicons name="document-text-outline" size={26} color="#15803D" />
//                 </View>
//               ) : (
//                 <View style={styles.lockedBox}>
//                   <Ionicons name="lock-closed-outline" size={18} color="#B45309" />
//                   <Text style={styles.lockedText}>
//                     Pay at least 90% to unlock possession certificate.
//                   </Text>
//                 </View>
//               )}

//               {certificateUnlocked && (
//                 <TouchableOpacity
//                   style={styles.downloadBtn}
//                   onPress={() => downloadPossessionCertificate(booking)}
//                 >
//                   <Ionicons name="download-outline" size={18} color="#FFFFFF" />
//                   <Text style={styles.downloadText}>Download Certificate</Text>
//                 </TouchableOpacity>
//               )}

//               {booking.status === "Approved" && (
//                 <View style={styles.successBox}>
//                   <Ionicons name="home-outline" size={18} color="#15803D" />
//                   <Text style={styles.successText}>
//                     Your flat booking is approved by builder.
//                   </Text>
//                 </View>
//               )}

//               {!!booking.builderMessage && (
//                 <Text style={styles.messageText}>{booking.builderMessage}</Text>
//               )}
//             </View>
//           );
//         })
//       )}

//       <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
//         <Ionicons name="log-out-outline" size={18} color="#FFFFFF" />
//         <Text style={styles.logoutText}>Logout</Text>
//       </TouchableOpacity>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#F3F4F6" },
//   content: { padding: 16, paddingBottom: 30 },

//   profileCard: {
//     backgroundColor: "#0F172A",
//     borderRadius: 24,
//     padding: 22,
//     alignItems: "center",
//   },
//   avatar: {
//     width: 74,
//     height: 74,
//     borderRadius: 24,
//     backgroundColor: "#2563EB",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   name: { color: "#FFFFFF", fontSize: 22, fontWeight: "900", marginTop: 12 },

//   sectionTitle: {
//     color: "#0F172A",
//     fontSize: 17,
//     fontWeight: "900",
//     marginTop: 22,
//     marginBottom: 10,
//   },
//   emptyText: {
//     color: "#64748B",
//     backgroundColor: "#FFFFFF",
//     padding: 14,
//     borderRadius: 14,
//   },

//   itemCard: {
//     backgroundColor: "#FFFFFF",
//     borderRadius: 18,
//     padding: 15,
//     marginBottom: 12,
//     elevation: 2,
//   },
//   rowBetween: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     gap: 10,
//   },
//   itemTitle: { color: "#0F172A", fontSize: 16, fontWeight: "900", flex: 1 },
//   itemSub: { color: "#64748B", marginTop: 6, fontWeight: "700" },
//   price: { color: "#16A34A", fontWeight: "900", marginTop: 8 },

//   badge: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 4,
//     paddingHorizontal: 9,
//     paddingVertical: 5,
//     borderRadius: 999,
//   },
//   badgeText: { fontSize: 11, fontWeight: "900" },

//   successBox: {
//     backgroundColor: "#DCFCE7",
//     borderRadius: 14,
//     padding: 11,
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 8,
//     marginTop: 12,
//   },
//   successText: { color: "#15803D", fontWeight: "900", flex: 1 },

//   messageText: {
//     color: "#0F172A",
//     backgroundColor: "#F8FAFC",
//     borderRadius: 12,
//     padding: 10,
//     marginTop: 10,
//     fontWeight: "700",
//     lineHeight: 18,
//   },

//   progressBar: {
//     height: 9,
//     backgroundColor: "#E5E7EB",
//     borderRadius: 20,
//     marginTop: 12,
//     overflow: "hidden",
//   },
//   progressFill: {
//     height: "100%",
//     backgroundColor: "#2563EB",
//     borderRadius: 20,
//   },
//   percentText: {
//     color: "#2563EB",
//     fontWeight: "900",
//     marginTop: 7,
//   },

//   paymentBox: {
//     marginTop: 12,
//     backgroundColor: "#F8FAFC",
//     borderRadius: 14,
//     padding: 12,
//     borderWidth: 1,
//     borderColor: "#E5E7EB",
//   },
//   inputLabel: {
//     fontSize: 12,
//     fontWeight: "900",
//     color: "#64748B",
//     marginBottom: 7,
//   },
//   input: {
//     height: 46,
//     borderRadius: 12,
//     backgroundColor: "#FFFFFF",
//     borderWidth: 1,
//     borderColor: "#E5E7EB",
//     paddingHorizontal: 12,
//     color: "#0F172A",
//     fontWeight: "800",
//     marginBottom: 10,
//   },

//   payBtn: {
//     height: 46,
//     backgroundColor: "#2563EB",
//     borderRadius: 14,
//     alignItems: "center",
//     justifyContent: "center",
//     flexDirection: "row",
//     gap: 8,
//   },
//   payText: {
//     color: "#FFFFFF",
//     fontWeight: "900",
//   },

//   certificateBox: {
//     backgroundColor: "#DCFCE7",
//     borderRadius: 14,
//     padding: 12,
//     flexDirection: "row",
//     alignItems: "center",
//     marginTop: 12,
//     gap: 10,
//   },
//   certificateTitle: {
//     color: "#15803D",
//     fontWeight: "900",
//     fontSize: 14,
//   },
//   certificateText: {
//     color: "#15803D",
//     fontWeight: "700",
//     fontSize: 12,
//     marginTop: 3,
//     lineHeight: 17,
//   },

//   lockedBox: {
//     backgroundColor: "#FEF3C7",
//     borderRadius: 14,
//     padding: 11,
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 8,
//     marginTop: 12,
//   },
//   lockedText: {
//     color: "#B45309",
//     fontWeight: "800",
//     flex: 1,
//     fontSize: 12,
//   },

//   downloadBtn: {
//     height: 46,
//     backgroundColor: "#15803D",
//     borderRadius: 14,
//     alignItems: "center",
//     justifyContent: "center",
//     flexDirection: "row",
//     gap: 8,
//     marginTop: 12,
//   },
//   downloadText: {
//     color: "#FFFFFF",
//     fontWeight: "900",
//   },

//   logoutBtn: {
//     height: 52,
//     borderRadius: 16,
//     backgroundColor: "#DC2626",
//     alignItems: "center",
//     justifyContent: "center",
//     flexDirection: "row",
//     gap: 8,
//     marginTop: 18,
//   },
//   logoutText: { color: "#FFFFFF", fontSize: 16, fontWeight: "900" },
// });


























import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  StatusBar,
  Platform,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { useAppContext } from "../superadmin/SocietyContext";
import { useAuthStore } from '../../store/AuthStore';

const NAVY = "#0D6E6E";
const NAVY_2 = "#1A9E9E";
const WHITE = "#FFFFFF";
const BG = "#E8F5F5";
const MUTED = "#7A9E9E";
const BORDER = "#E5E7EB";
const BLUE = "#";
const GREEN = "#15803D";
const GREEN_SOFT = "#DCFCE7";
const RED = "#DC2626";
const ORANGE = "#B45309";
const ORANGE_SOFT = "#FEF3C7";

export default function CustomerProfileScreen({ navigation }) {
  const {
    visitRequests = [],
    flatBookingRequests = [],
    addCustomerPayment,
    getPaymentPercentage,
    getBookingTotalAmount,
  } = useAppContext();

  const [paymentInputs, setPaymentInputs] = useState({});
  const logout = useAuthStore((state) => state.logout);

  const formatMoney = (amount) => {
    const value = Number(amount || 0);
    return `₹${value.toLocaleString("en-IN")}`;
  };

  const statusStyle = (status) => {
    if (status === "Approved")
      return { bg: GREEN_SOFT, color: GREEN, icon: "checkmark-circle" };
    if (status === "Rejected")
      return { bg: "#FEE2E2", color: "#B91C1C", icon: "close-circle" };
    return { bg: ORANGE_SOFT, color: ORANGE, icon: "time" };
  };

  const renderStatusBadge = (status) => {
    const s = statusStyle(status);
    return (
      <View style={[styles.badge, { backgroundColor: s.bg }]}>
        <Ionicons name={s.icon} size={14} color={s.color} />
        <Text style={[styles.badgeText, { color: s.color }]}>{status}</Text>
      </View>
    );
  };

  const payCustomAmount = (booking) => {
    const amount = Number(paymentInputs[booking.id] || 0);
    const total = getBookingTotalAmount(booking);
    const paid = Number(booking.paidAmount || 0);
    const remaining = Math.max(total - paid, 0);

    if (!amount || amount <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid payment amount.");
      return;
    }
    if (amount > remaining) {
      Alert.alert(
        "Amount Too High",
        `You can pay only up to remaining amount: ${formatMoney(remaining)}`
      );
      return;
    }

    addCustomerPayment(booking.id, amount, "Customer Payment");
    Alert.alert(
      "Payment Successful",
      `You paid ${formatMoney(amount)} for ${booking.projectName}.`
    );
    setPaymentInputs((prev) => ({ ...prev, [booking.id]: "" }));
  };

  const downloadPossessionCertificate = async (booking) => {
    const percent = getPaymentPercentage(booking);

    if (percent < 90) {
      Alert.alert("Locked", "Certificate unlocks after 90% payment.");
      return;
    }

    const certificateNo = `PC-${booking.id}`;
    const today = new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    const html = `
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <style>
            body { font-family: Arial, sans-serif; padding: 36px; color: #0F172A; }
            .certificate { border: 4px solid #0F172A; padding: 32px; border-radius: 18px; }
            .title { text-align: center; font-size: 28px; font-weight: 900; color: #0F172A; margin-bottom: 8px; text-transform: uppercase; }
            .subtitle { text-align: center; color: #64748B; font-size: 14px; margin-bottom: 28px; }
            .section { margin-top: 22px; font-size: 15px; line-height: 1.7; }
            .row { margin: 10px 0; font-size: 15px; }
            .label { font-weight: 700; color: #334155; }
            .approval { background: #DCFCE7; color: #15803D; padding: 14px; border-radius: 12px; margin-top: 24px; font-weight: 700; line-height: 1.6; }
            .footer { margin-top: 46px; display: flex; flex-direction: row; justify-content: space-between; align-items: flex-end; }
            .sign { text-align: center; width: 220px; border-top: 1px solid #0F172A; padding-top: 8px; font-weight: 700; }
            .note { margin-top: 30px; font-size: 12px; color: #64748B; line-height: 1.5; }
          </style>
        </head>
        <body>
          <div class="certificate">
            <div class="title">Possession Certificate</div>
            <div class="subtitle">Certificate No: ${certificateNo}</div>
            <div class="section">
              This is to certify that <b>${booking.customerName || booking.guestName || "Customer"}</b>
              has paid <b>${percent}%</b> of the flat booking amount and is eligible for limited possession access.
            </div>
            <div class="section">
              <div class="row"><span class="label">Project:</span> ${booking.projectName || "-"}</div>
              <div class="row"><span class="label">Unit:</span> ${booking.unitNo || booking.unitNumber || "-"}</div>
              <div class="row"><span class="label">Unit Type:</span> ${booking.unitType || "Flat"}</div>
              <div class="row"><span class="label">Customer Phone:</span> ${booking.phone || booking.customerPhone || "-"}</div>
              <div class="row"><span class="label">Total Amount:</span> ${formatMoney(getBookingTotalAmount(booking))}</div>
              <div class="row"><span class="label">Paid Amount:</span> ${formatMoney(booking.paidAmount || 0)}</div>
              <div class="row"><span class="label">Payment Completion:</span> ${percent}%</div>
              <div class="row"><span class="label">Issued Date:</span> ${today}</div>
            </div>
            <div class="approval">
              The customer is permitted to start internal modification works such as minor repairs,
              interior planning, measurements, furniture work, and finishing-related preparation,
              subject to builder/society safety rules and approval conditions.
            </div>
            <div class="footer">
              <div>
                <b>Status:</b> Possession Access Granted<br />
                <b>Generated By:</b> Builder Management System
              </div>
              <div class="sign">Authorized Signature</div>
            </div>
            <div class="note">
              Note: This certificate is system generated. It does not replace final sale deed,
              registration, or legal handover documents.
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
        Alert.alert("Certificate Generated", file.uri);
      }
    } catch (error) {
      Alert.alert("Error", "Unable to generate certificate.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={NAVY} />

      {/* ── Top Header with Back Button ── */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.navigate("CustomerHomeScreen")}
          activeOpacity={0.85}
        >
          <Ionicons name="chevron-back" size={22} color={WHITE} />
        </TouchableOpacity>

        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>My Profile</Text>
          <Text style={styles.headerSub}>Visits, bookings & payments</Text>
        </View>

        <TouchableOpacity style={styles.logoutIconBtn} onPress={logout} activeOpacity={0.85}>
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>

        {/* ── Profile Card ── */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={34} color={WHITE} />
          </View>
          <Text style={styles.name}>Customer User</Text>
          <Text style={styles.nameSubtitle}>Manage your visits & flat bookings below</Text>
        </View>

        {/* ── Visit Notifications ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>📅 Visit Notifications</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{visitRequests.length}</Text>
          </View>
        </View>

        {visitRequests.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="calendar-outline" size={28} color={MUTED} />
            <Text style={styles.emptyText}>No visit requests yet.</Text>
          </View>
        ) : (
          visitRequests.map((visit) => (
            <View key={visit.id} style={styles.itemCard}>
              <View style={styles.rowBetween}>
                <Text style={styles.itemTitle} numberOfLines={1}>
                  {visit.projectName}
                </Text>
                {renderStatusBadge(visit.status)}
              </View>

              <Text style={styles.itemSub}>
                Unit: {visit.unitNumber} • {visit.unitType || "Flat"}
              </Text>
              <Text style={styles.itemSub}>
                Date: {visit.visitDate} • Time: {visit.visitTime}
              </Text>

              {visit.status === "Approved" && (
                <View style={styles.successBox}>
                  <Ionicons name="notifications-outline" size={18} color={GREEN} />
                  <Text style={styles.successText}>
                    Your slot booking is approved by builder.
                  </Text>
                </View>
              )}

              {visit.status === "Rejected" && (
                <View style={styles.rejectedBox}>
                  <Ionicons name="close-circle-outline" size={18} color="#B91C1C" />
                  <Text style={styles.rejectedText}>
                    Your slot booking was rejected by builder.
                  </Text>
                </View>
              )}

              {!!visit.builderMessage && (
                <Text style={styles.messageText}>{visit.builderMessage}</Text>
              )}
            </View>
          ))
        )}

        {/* ── Flat Booking & Payments ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🏠 Flat Booking & Payments</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{flatBookingRequests.length}</Text>
          </View>
        </View>

        {flatBookingRequests.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="home-outline" size={28} color={MUTED} />
            <Text style={styles.emptyText}>No flat booking requests yet.</Text>
          </View>
        ) : (
          flatBookingRequests.map((booking) => {
            const percent = getPaymentPercentage(booking);
            const total = getBookingTotalAmount(booking);
            const paid = Number(booking.paidAmount || 0);
            const remaining = Math.max(total - paid, 0);
            const certificateUnlocked = percent >= 90;

            return (
              <View key={booking.id} style={styles.itemCard}>
                <View style={styles.rowBetween}>
                  <Text style={styles.itemTitle} numberOfLines={1}>
                    {booking.projectName}
                  </Text>
                  {renderStatusBadge(booking.status)}
                </View>

                <Text style={styles.itemSub}>
                  Unit: {booking.unitNo || booking.unitNumber} •{" "}
                  {booking.unitType || "Flat"}
                </Text>
                <Text style={styles.itemSub}>
                  Phone: {booking.phone || booking.customerPhone}
                </Text>

                <Text style={styles.price}>Total: {formatMoney(total)}</Text>

                <View style={styles.amountRow}>
                  <View style={styles.amountBox}>
                    <Text style={styles.amountLabel}>Paid</Text>
                    <Text style={[styles.amountValue, { color: GREEN }]}>
                      {formatMoney(paid)}
                    </Text>
                  </View>
                  <View style={styles.amountDivider} />
                  <View style={styles.amountBox}>
                    <Text style={styles.amountLabel}>Remaining</Text>
                    <Text style={[styles.amountValue, { color: remaining > 0 ? "#B91C1C" : GREEN }]}>
                      {formatMoney(remaining)}
                    </Text>
                  </View>
                </View>

                {/* Progress Bar */}
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${percent}%`,
                        backgroundColor:
                          percent >= 90 ? GREEN : percent >= 50 ? BLUE : "#F59E0B",
                      },
                    ]}
                  />
                </View>
                <Text style={styles.percentText}>{percent}% Payment Completed</Text>

                {/* Payment input — only for approved bookings with remaining amount */}
                {booking.status === "Approved" && percent < 100 && (
                  <View style={styles.paymentBox}>
                    <Text style={styles.inputLabel}>Enter Payment Amount</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter amount"
                      placeholderTextColor="#94A3B8"
                      keyboardType="numeric"
                      value={paymentInputs[booking.id] || ""}
                      onChangeText={(text) =>
                        setPaymentInputs((prev) => ({
                          ...prev,
                          [booking.id]: text.replace(/[^0-9]/g, ""),
                        }))
                      }
                    />
                    <TouchableOpacity
                      style={styles.payBtn}
                      onPress={() => payCustomAmount(booking)}
                    >
                      <Ionicons name="card-outline" size={18} color={WHITE} />
                      <Text style={styles.payText}>Pay Now</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Certificate */}
                {certificateUnlocked ? (
                  <View style={styles.certificateBox}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.certificateTitle}>
                        🎉 Possession Certificate Unlocked
                      </Text>
                      <Text style={styles.certificateText}>
                        You can download certificate and start approved flat modification work.
                      </Text>
                    </View>
                    <Ionicons name="document-text-outline" size={26} color={GREEN} />
                  </View>
                ) : (
                  <View style={styles.lockedBox}>
                    <Ionicons name="lock-closed-outline" size={18} color={ORANGE} />
                    <Text style={styles.lockedText}>
                      Pay at least 90% to unlock possession certificate.
                    </Text>
                  </View>
                )}

                {certificateUnlocked && (
                  <TouchableOpacity
                    style={styles.downloadBtn}
                    onPress={() => downloadPossessionCertificate(booking)}
                  >
                    <Ionicons name="download-outline" size={18} color={WHITE} />
                    <Text style={styles.downloadText}>Download Certificate</Text>
                  </TouchableOpacity>
                )}

                {booking.status === "Approved" && (
                  <View style={styles.successBox}>
                    <Ionicons name="home-outline" size={18} color={GREEN} />
                    <Text style={styles.successText}>
                      Your flat booking is approved by builder.
                    </Text>
                  </View>
                )}

                {booking.status === "Rejected" && (
                  <View style={styles.rejectedBox}>
                    <Ionicons name="close-circle-outline" size={18} color="#B91C1C" />
                    <Text style={styles.rejectedText}>
                      Your flat booking was rejected by builder.
                    </Text>
                  </View>
                )}

                {!!booking.builderMessage && (
                  <Text style={styles.messageText}>{booking.builderMessage}</Text>
                )}
              </View>
            );
          })
        )}

        {/* ── Logout Button ── */}
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Ionicons name="log-out-outline" size={18} color={WHITE} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: NAVY },

  // ── Header ──────────────────────────────────────────────────────────────
  topHeader: {
    backgroundColor: NAVY,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "android" ? 10 : 6,
    paddingBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    minHeight: 72,
    paddingTop: 40,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitleWrap: { flex: 1, marginLeft: 12 },
  headerTitle: { color: WHITE, fontSize: 20, fontWeight: "900" },
  headerSub: { color: "rgba(255,255,255,0.6)", fontSize: 12, marginTop: 2 },
  logoutIconBtn: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "rgba(239,68,68,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },

  // ── Scroll body ──────────────────────────────────────────────────────────
  container: { flex: 1, backgroundColor: BG },
  content: { padding: 16, paddingBottom: 36 },

  // ── Profile Card ─────────────────────────────────────────────────────────
  profileCard: {
    backgroundColor: NAVY,
    borderRadius: 24,
    padding: 22,
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    width: 74,
    height: 74,
    borderRadius: 24,
    backgroundColor: BLUE,
    alignItems: "center",
    justifyContent: "center",
  },
  name: { color: WHITE, fontSize: 22, fontWeight: "900", marginTop: 12 },
  nameSubtitle: { color: "rgba(255,255,255,0.55)", fontSize: 13, marginTop: 4 },

  // ── Section Headers ───────────────────────────────────────────────────────
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    marginBottom: 10,
    gap: 8,
  },
  sectionTitle: { color: NAVY, fontSize: 17, fontWeight: "900" },
  countBadge: {
    backgroundColor: NAVY,
    borderRadius: 999,
    minWidth: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 7,
  },
  countBadgeText: { color: WHITE, fontSize: 12, fontWeight: "900" },

  // ── Empty Card ────────────────────────────────────────────────────────────
  emptyCard: {
    backgroundColor: WHITE,
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: BORDER,
  },
  emptyText: { color: MUTED, fontWeight: "700" },

  // ── Item Card ─────────────────────────────────────────────────────────────
  itemCard: {
    backgroundColor: WHITE,
    borderRadius: 18,
    padding: 15,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  itemTitle: { color: NAVY, fontSize: 16, fontWeight: "900", flex: 1 },
  itemSub: { color: MUTED, marginTop: 6, fontWeight: "700", fontSize: 13 },
  price: { color: "#16A34A", fontWeight: "900", marginTop: 8, fontSize: 15 },

  // ── Amount Row ────────────────────────────────────────────────────────────
  amountRow: {
    flexDirection: "row",
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    marginTop: 10,
    overflow: "hidden",
  },
  amountBox: { flex: 1, padding: 10, alignItems: "center" },
  amountLabel: { color: MUTED, fontSize: 11, fontWeight: "700" },
  amountValue: { fontSize: 15, fontWeight: "900", marginTop: 3 },
  amountDivider: { width: 1, backgroundColor: BORDER },

  // ── Status Badge ──────────────────────────────────────────────────────────
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
  },
  badgeText: { fontSize: 11, fontWeight: "900" },

  // ── Success / Rejected Box ────────────────────────────────────────────────
  successBox: {
    backgroundColor: GREEN_SOFT,
    borderRadius: 14,
    padding: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
  },
  successText: { color: GREEN, fontWeight: "900", flex: 1 },
  rejectedBox: {
    backgroundColor: "#FEE2E2",
    borderRadius: 14,
    padding: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
  },
  rejectedText: { color: "#B91C1C", fontWeight: "900", flex: 1 },

  messageText: {
    color: NAVY,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 10,
    marginTop: 10,
    fontWeight: "700",
    lineHeight: 18,
    fontSize: 13,
  },

  // ── Progress Bar ──────────────────────────────────────────────────────────
  progressBar: {
    height: 9,
    backgroundColor: "#E5E7EB",
    borderRadius: 20,
    marginTop: 12,
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: 20 },
  percentText: { color: BLUE, fontWeight: "900", marginTop: 7, fontSize: 13 },

  // ── Payment Box ───────────────────────────────────────────────────────────
  paymentBox: {
    marginTop: 12,
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: BORDER,
  },
  inputLabel: { fontSize: 12, fontWeight: "900", color: MUTED, marginBottom: 7 },
  input: {
    height: 46,
    borderRadius: 12,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 12,
    color: NAVY,
    fontWeight: "800",
    marginBottom: 10,
  },
  payBtn: {
    height: 46,
    backgroundColor: "#1a9e9e",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,

  },
  payText: { color: WHITE, fontWeight: "900" },

  // ── Certificate ───────────────────────────────────────────────────────────
  certificateBox: {
    backgroundColor: GREEN_SOFT,
    borderRadius: 14,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    gap: 10,
  },
  certificateTitle: { color: GREEN, fontWeight: "900", fontSize: 14 },
  certificateText: {
    color: GREEN,
    fontWeight: "700",
    fontSize: 12,
    marginTop: 3,
    lineHeight: 17,
  },
  lockedBox: {
    backgroundColor: ORANGE_SOFT,
    borderRadius: 14,
    padding: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
  },
  lockedText: { color: ORANGE, fontWeight: "800", flex: 1, fontSize: 12 },
  downloadBtn: {
    height: 46,
    backgroundColor: GREEN,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  downloadText: { color: WHITE, fontWeight: "900" },

  // ── Logout ────────────────────────────────────────────────────────────────
  logoutBtn: {
    height: 52,
    borderRadius: 16,
    backgroundColor: RED,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    marginTop: 18,
  },
  logoutText: { color: WHITE, fontSize: 16, fontWeight: "900" },
});