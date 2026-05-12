



import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Switch,
  Alert,
  Image,
  Platform,
  SafeAreaView,
  StatusBar,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import BuilderBottomNav from "./BuilderBottomNav";
import { useAuthStore} from '../../store/AuthStore';
import PendingVerificationBanner from '../../components/common/PendingVerificationBanner';

const NAVY   = "#1A7A7A";
const NAVY2  = "#1A7A7A";
const GOLD   = "#FFFFFF";
const WHITE  = "#FFFFFF";
const BG     = "#E8F5F5";
const MUTED  = "#64748B";
const BORDER = "#E2E8F0";
const GREEN  = "#10B981";
const RED    = "#EF4444";

// ─── Initial Data ──────────────────────────────────────────────────────────────
const INITIAL = {
  name: "Suresh Enterprises Pvt Ltd",
  initials: "SE",
  email: "admin@sureshenterprises.com",
  mobile: "+91 98765 43210",
  gstin: "36AABCS1234F1Z5",
  rera: "A12345/2023",
  address: "Hitech City, Madhapur, Hyderabad – 500081",
  website: "www.sureshenterprises.com",
  about: "Leading builder focused on premium residential communities and timely delivery.",
  profileImage: null,
};

// ─── Small reusable components ─────────────────────────────────────────────────
function InfoRow({ icon, label, value, last }) {
  return (
    <View style={[styles.infoRow, !last && styles.infoRowBorder]}>
      <View style={styles.infoIconBox}>
        <Ionicons name={icon} size={16} color={GOLD} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value || "—"}</Text>
      </View>
    </View>
  );
}

function Field({ label, value, onChangeText, multiline, secureTextEntry, keyboardType }) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.fieldInput, multiline && styles.fieldTextArea]}
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType || "default"}
        placeholderTextColor={MUTED}
        autoCapitalize="none"
      />
    </View>
  );
}

// ─── Main Screen ───────────────────────────────────────────────────────────────
export default function BuilderProfileScreen({ navigation, route }) {
    const logoutUser = useAuthStore((state) => state.logout);
  const [profile, setProfile]       = useState(INITIAL);
  const [screen, setScreen]         = useState("home"); // home | edit | password | notifications
  const [notifOn, setNotifOn]       = useState(true);
  const [saveMsg, setSaveMsg]       = useState("");

  const [editForm, setEditForm] = useState({ ...INITIAL });

  const [pwForm, setPwForm] = useState({
    current: "",
    next: "",
    confirm: "",
  });

  const open  = (s) => { setSaveMsg(""); setScreen(s); };
  const goHome = () => { setSaveMsg(""); setScreen("home"); };

  // ── Logout ────────────────────────────────────────────────────────────────
  // const logout = () => {
  //   navigation.reset({ index: 0, routes: [{ name: "AuthScreen" }] });
  // };  



const logout = () => {
  Alert.alert("Logout", "Are you sure you want to logout?", [
    { text: "Cancel", style: "cancel" },
    {
      text: "Logout",
      style: "destructive",
      onPress: () => {
        logoutUser(); // ✅ enough
      },
    },
  ]);
};
  // ── Pick profile image ────────────────────────────────────────────────────
  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission Required", "Allow gallery access to upload photo.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (!result.canceled && result.assets?.length > 0) {
      setEditForm((prev) => ({ ...prev, profileImage: result.assets[0].uri }));
    }
  };

  // ── Save profile ──────────────────────────────────────────────────────────
  const saveProfile = () => {
    if (!editForm.name.trim() || !editForm.email.trim()) {
      setSaveMsg("Name and email are required.");
      return;
    }
    const initials = (editForm.name || "BU")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join("");
    setProfile({ ...editForm, initials: initials || profile.initials });
    setSaveMsg("Profile saved successfully.");
    goHome();
  };

  // ── Save password ─────────────────────────────────────────────────────────
  const savePassword = () => {
    if (!pwForm.current || !pwForm.next || !pwForm.confirm) {
      setSaveMsg("Please fill all password fields.");
      return;
    }
    if (pwForm.next !== pwForm.confirm) {
      setSaveMsg("New passwords do not match.");
      return;
    }
    if (pwForm.next.length < 6) {
      setSaveMsg("Password must be at least 6 characters.");
      return;
    }
    setPwForm({ current: "", next: "", confirm: "" });
    setSaveMsg("Password updated.");
    goHome();
  };

  // ── Avatar ────────────────────────────────────────────────────────────────
  const Avatar = ({ uri, initials, size = 72 }) => (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
      {uri ? (
        <Image source={{ uri }} style={styles.avatarImage} />
      ) : (
        <Text style={[styles.avatarText, { fontSize: size * 0.32 }]}>{initials}</Text>
      )}
    </View>
  );

  // ── Header ────────────────────────────────────────────────────────────────
  const titles = {
    home: "My Profile",
    edit: "Edit Profile",
    password: "Change Password",
    notifications: "Notifications",
  };

  const Header = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.headerBack}
        onPress={screen === "home" ? () => navigation.goBack() : goHome}
        activeOpacity={0.8}
      >
        <Ionicons name="chevron-back" size={22} color={WHITE} />
      </TouchableOpacity>

      <Text style={styles.headerTitle}>{titles[screen] || "Profile"}</Text>

      {screen === "home" ? (
        <TouchableOpacity style={styles.headerAction} onPress={() => { setEditForm({ ...profile }); open("edit"); }} activeOpacity={0.8}>
          <Text style={styles.headerActionText}>Edit</Text>
        </TouchableOpacity>
      ) : (
        <View style={{ width: 60 }} />
      )}
    </View>
  );

  // ── Save banner ───────────────────────────────────────────────────────────
  const Banner = () =>
    saveMsg ? (
      <View style={styles.banner}>
        <Ionicons name="checkmark-circle-outline" size={16} color="#166534" />
        <Text style={styles.bannerText}>{saveMsg}</Text>
      </View>
    ) : null;

  // ════════════════════════════════════════════════════════════════════════════
  // HOME SCREEN
  // ════════════════════════════════════════════════════════════════════════════
  const HomeScreen = () => (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Banner />

      {/* Profile Card */}
      <PendingVerificationBanner navigation={navigation} />
      <View style={styles.profileCard}>
        <Avatar uri={profile.profileImage} initials={profile.initials} size={80} />
        <View style={styles.profileCardInfo}>
          <Text style={styles.profileName}>{profile.name}</Text>
          <Text style={styles.profileEmail}>{profile.email}</Text>
          <View style={styles.verifiedRow}>
            <View style={styles.verifiedBadge}>
              <Ionicons name="shield-checkmark" size={11} color="#166534" />
              <Text style={styles.verifiedText}>Verified Builder</Text>
            </View>
            <View style={styles.reraBadge}>
              <Text style={styles.reraText}>RERA Active</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Business Details */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Business Details</Text>
        <InfoRow icon="call-outline"          label="Mobile"       value={profile.mobile} />
        <InfoRow icon="mail-outline"          label="Email"        value={profile.email} />
        <InfoRow icon="document-text-outline" label="GSTIN"        value={profile.gstin} />
        <InfoRow icon="ribbon-outline"        label="RERA License" value={profile.rera} />
        <InfoRow icon="globe-outline"         label="Website"      value={profile.website} />
        <InfoRow icon="location-outline"      label="Address"      value={profile.address} last />
      </View>

      {/* About */}
      {!!profile.about && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>About</Text>
          <Text style={styles.aboutText}>{profile.about}</Text>
        </View>
      )}

      {/* Settings */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Settings</Text>

        <TouchableOpacity style={styles.menuRow} onPress={() => { setEditForm({ ...profile }); open("edit"); }} activeOpacity={0.8}>
          <View style={styles.menuIconBox}>
            <Ionicons name="person-outline" size={18} color={NAVY} />
          </View>
          <Text style={styles.menuLabel}>Edit Profile</Text>
          <Ionicons name="chevron-forward" size={18} color={MUTED} />
        </TouchableOpacity>

        <View style={styles.menuDivider} />

        <TouchableOpacity style={styles.menuRow} onPress={() => open("password")} activeOpacity={0.8}>
          <View style={styles.menuIconBox}>
            <Ionicons name="lock-closed-outline" size={18} color={NAVY} />
          </View>
          <Text style={styles.menuLabel}>Change Password</Text>
          <Ionicons name="chevron-forward" size={18} color={MUTED} />
        </TouchableOpacity>

        <View style={styles.menuDivider} />

        <TouchableOpacity style={styles.menuRow} onPress={() => open("notifications")} activeOpacity={0.8}>
          <View style={styles.menuIconBox}>
            <Ionicons name="notifications-outline" size={18} color={NAVY} />
          </View>
          <Text style={styles.menuLabel}>Notifications</Text>
          <Text style={[styles.menuValue, { color: notifOn ? GREEN : MUTED }]}>
            {notifOn ? "On" : "Off"}
          </Text>
          <Ionicons name="chevron-forward" size={18} color={MUTED} />
        </TouchableOpacity>

        <View style={styles.menuDivider} />

        <TouchableOpacity style={styles.menuRow} onPress={() => navigation.navigate('Verification')} activeOpacity={0.8}>
          <View style={styles.menuIconBox}>
            <Ionicons name="shield-checkmark-outline" size={18} color={NAVY} />
          </View>
          <Text style={styles.menuLabel}>Profile Verification</Text>
          <Ionicons name="chevron-forward" size={18} color={MUTED} />
        </TouchableOpacity>
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.85}>
        <Ionicons name="log-out-outline" size={18} color={RED} />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  // ════════════════════════════════════════════════════════════════════════════
  // EDIT PROFILE SCREEN
  // ════════════════════════════════════════════════════════════════════════════
  const EditScreen = () => (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Banner />

      {/* Avatar picker */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Profile Photo</Text>
        <View style={styles.avatarEditRow}>
          <Avatar uri={editForm.profileImage} initials={profile.initials} size={70} />
          <View style={{ flex: 1, gap: 8 }}>
            <TouchableOpacity style={styles.photoBtn} onPress={pickImage} activeOpacity={0.8}>
              <Ionicons name="camera-outline" size={16} color={NAVY} />
              <Text style={styles.photoBtnText}>Choose Photo</Text>
            </TouchableOpacity>
            {editForm.profileImage ? (
              <TouchableOpacity
                style={styles.removeBtn}
                onPress={() => setEditForm((p) => ({ ...p, profileImage: null }))}
                activeOpacity={0.8}
              >
                <Text style={styles.removeBtnText}>Remove Photo</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </View>

      {/* Fields */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Personal Info</Text>
        <Field label="Company Name"  value={editForm.name}    onChangeText={(v) => setEditForm((p) => ({ ...p, name: v }))} />
        <Field label="Email"         value={editForm.email}   onChangeText={(v) => setEditForm((p) => ({ ...p, email: v }))}   keyboardType="email-address" />
        <Field label="Mobile"        value={editForm.mobile}  onChangeText={(v) => setEditForm((p) => ({ ...p, mobile: v }))}  keyboardType="phone-pad" />
        <Field label="GSTIN"         value={editForm.gstin}   onChangeText={(v) => setEditForm((p) => ({ ...p, gstin: v }))} />
        <Field label="RERA License"  value={editForm.rera}    onChangeText={(v) => setEditForm((p) => ({ ...p, rera: v }))} />
        <Field label="Website"       value={editForm.website} onChangeText={(v) => setEditForm((p) => ({ ...p, website: v }))} />
        <Field label="Address"       value={editForm.address} onChangeText={(v) => setEditForm((p) => ({ ...p, address: v }))} multiline />
        <Field label="About"         value={editForm.about}   onChangeText={(v) => setEditForm((p) => ({ ...p, about: v }))}   multiline />
      </View>

      <TouchableOpacity style={styles.saveBtn} onPress={saveProfile} activeOpacity={0.85}>
        <Ionicons name="checkmark-circle-outline" size={18} color={NAVY} />
        <Text style={styles.saveBtnText}>Save Changes</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.cancelBtn} onPress={goHome} activeOpacity={0.85}>
        <Text style={styles.cancelBtnText}>Cancel</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  // ════════════════════════════════════════════════════════════════════════════
  // CHANGE PASSWORD SCREEN
  // ════════════════════════════════════════════════════════════════════════════
  const PasswordScreen = () => (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Banner />
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Update Password</Text>
        <Field label="Current Password" value={pwForm.current}  onChangeText={(v) => setPwForm((p) => ({ ...p, current: v }))}  secureTextEntry />
        <Field label="New Password"      value={pwForm.next}     onChangeText={(v) => setPwForm((p) => ({ ...p, next: v }))}     secureTextEntry />
        <Field label="Confirm Password"  value={pwForm.confirm}  onChangeText={(v) => setPwForm((p) => ({ ...p, confirm: v }))}  secureTextEntry />
      </View>

      <TouchableOpacity style={styles.saveBtn} onPress={savePassword} activeOpacity={0.85}>
        <Ionicons name="lock-closed-outline" size={18} color={NAVY} />
        <Text style={styles.saveBtnText}>Update Password</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.cancelBtn} onPress={goHome} activeOpacity={0.85}>
        <Text style={styles.cancelBtnText}>Cancel</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  // ════════════════════════════════════════════════════════════════════════════
  // NOTIFICATIONS SCREEN
  // ════════════════════════════════════════════════════════════════════════════
  const NotifScreen = () => (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Banner />
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Notification Preferences</Text>

        <View style={styles.toggleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.toggleLabel}>Push Notifications</Text>
            <Text style={styles.toggleSub}>Bookings, payments and project alerts</Text>
          </View>
          <Switch
            value={notifOn}
            onValueChange={(v) => {
              setNotifOn(v);
              setSaveMsg(v ? "Notifications enabled." : "Notifications disabled.");
            }}
            trackColor={{ false: BORDER, true: GOLD }}
            thumbColor={WHITE}
          />
        </View>
      </View>

      <TouchableOpacity style={styles.cancelBtn} onPress={goHome} activeOpacity={0.85}>
        <Text style={styles.cancelBtnText}>Back to Profile</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  // ════════════════════════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════════════════════════
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={NAVY} />
      <View style={styles.root}>
        <Header />

        {screen === "home"          && <HomeScreen />}
        {screen === "edit"          && <EditScreen />}
        {screen === "password"      && <PasswordScreen />}
        {screen === "notifications" && <NotifScreen />}

        <BuilderBottomNav navigation={navigation} activeRoute="BuilderProfile" />
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: NAVY },
  root: { flex: 1, backgroundColor: BG },

  // Header
  header: {
    backgroundColor: NAVY,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "android" ? 10 : 6,
    paddingBottom: 14,
    minHeight: 72,
  },
  headerBack: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    color: WHITE,
    fontSize: 20,
    fontWeight: "800",
    marginLeft: 12,
  },
  headerAction: {
    width: 60,
    height: 36,
    borderRadius: 11,
    backgroundColor: GOLD,
    alignItems: "center",
    justifyContent: "center",
  },
  headerActionText: { color: NAVY, fontWeight: "900", fontSize: 14 },

  // Scroll
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 110 },

  // Banner
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#DCFCE7",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
  },
  bannerText: { color: "#166534", fontSize: 13, fontWeight: "700", flex: 1 },

  // Profile card
  profileCard: {
    backgroundColor: NAVY,
    borderRadius: 22,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 14,
  },
  avatar: {
    backgroundColor: GOLD,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.2)",
  },
  avatarImage: { width: "100%", height: "100%", resizeMode: "cover" },
  avatarText: { color: NAVY, fontWeight: "900" },
  profileCardInfo: { flex: 1 },
  profileName: { color: WHITE, fontSize: 17, fontWeight: "900", marginBottom: 3 },
  profileEmail: { color: "#94A3B8", fontSize: 12, marginBottom: 10 },
  verifiedRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  verifiedText: { color: "#166534", fontSize: 11, fontWeight: "800" },
  reraBadge: {
    backgroundColor: "rgba(201,168,76,0.2)",
    borderWidth: 1,
    borderColor: "rgba(201,168,76,0.4)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  reraText: { color: GOLD, fontSize: 11, fontWeight: "800" },

  // Card
  card: {
    backgroundColor: WHITE,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 14,
  },
  cardTitle: { color: NAVY, fontSize: 15, fontWeight: "900", marginBottom: 14 },

  // Info row
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 11,
    gap: 12,
  },
  infoRowBorder: { borderBottomWidth: 1, borderBottomColor: BORDER },
  infoIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#a0d9d9",
    alignItems: "center",
    justifyContent: "center",
  },
  infoLabel: { color: MUTED, fontSize: 11, fontWeight: "700", marginBottom: 2 },
  infoValue: { color: NAVY, fontSize: 13, fontWeight: "700" },
  aboutText: { color: "#334155", fontSize: 14, lineHeight: 22 },

  // Menu rows
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    gap: 12,
  },
  menuDivider: { height: 1, backgroundColor: BORDER },
  menuIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: BG,
    alignItems: "center",
    justifyContent: "center",
  },
  menuLabel: { flex: 1, color: NAVY, fontSize: 14, fontWeight: "700" },
  menuValue: { fontSize: 13, fontWeight: "700", marginRight: 4 },

  // Logout
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1.5,
    borderColor: "#FECACA",
    borderRadius: 16,
    paddingVertical: 14,
    backgroundColor: "#FEF2F2",
    marginBottom: 8,
  },
  logoutText: { color: RED, fontSize: 15, fontWeight: "900" },

  // Edit — avatar row
  avatarEditRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  photoBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: "#FFF7D6",
    borderWidth: 1,
    borderColor: "#F4D76D",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  photoBtnText: { color: NAVY, fontWeight: "800", fontSize: 13 },
  removeBtn: {
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#FEF2F2",
  },
  removeBtnText: { color: RED, fontWeight: "800", fontSize: 13 },

  // Fields
  fieldWrap: { marginBottom: 14 },
  fieldLabel: { color: MUTED, fontSize: 12, fontWeight: "800", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.4 },
  fieldInput: {
    backgroundColor: BG,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 13,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: NAVY,
    fontSize: 14,
    fontWeight: "600",
  },
  fieldTextArea: { minHeight: 90, textAlignVertical: "top" },

  // Buttons
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: GOLD,
    borderRadius: 16,
    paddingVertical: 15,
    marginBottom: 10,
  },
  saveBtnText: { color: NAVY, fontSize: 15, fontWeight: "900" },
  cancelBtn: {
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 8,
  },
  cancelBtnText: { color: MUTED, fontSize: 14, fontWeight: "800" },

  // Notifications
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  toggleLabel: { color: NAVY, fontSize: 15, fontWeight: "800", marginBottom: 3 },
  toggleSub: { color: MUTED, fontSize: 12, lineHeight: 18 },
});


























