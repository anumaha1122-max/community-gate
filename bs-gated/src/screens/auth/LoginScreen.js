/**
 * LoginScreen.js
 *
 * Updated UI:
 * - Full background image: assets/bg.jpg
 * - Top hero card image: assets/card.jpg
 * - Glass login card
 * - Keeps existing login/register/waiting approval/customer OTP logic
 */

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
  Dimensions,
  Animated,
} from "react-native";

import {
  SafeAreaView,
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";

import { useAuthStore } from "../../store/AuthStore";
import useAppStore from "../../store/appStore";

const { width, height } = Dimensions.get("window");

const ROLE_KEYS = {
  Resident: "resident",
  Builder: "builder",
  Vendor: "vendor",
  Guard: "security",
  Admin: "admin",
  "Super Admin": "superadmin",
  Customer: "customer",
};

const MOCK_OTP = "123456";

function LoginContent({ navigation }) {
  const insets = useSafeAreaInsets();

  const login = useAuthStore((s) => s.login);
  const loginUser = useAuthStore((s) => s.loginUser);
  const loginAsCustomer = useAuthStore((s) => s.loginAsCustomer);

  const registerCustomer = useAppStore((s) => s.registerCustomer);
  const getCustomerByPhone = useAppStore((s) => s.getCustomerByPhone);

  const glowAnim = useState(new Animated.Value(0))[0];

  const [topTab, setTopTab] = useState("staff");

  const [loginPhone, setLoginPhone] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loginRole, setLoginRole] = useState("Resident");

  const [custStep, setCustStep] = useState(1);
  const [custPhone, setCustPhone] = useState("");
  const [custOtp, setCustOtp] = useState("");
  const [custName, setCustName] = useState("");
  const [custEmail, setCustEmail] = useState("");

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [glowAnim]);

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.1, 0.3],
  });

  const cleanPhone = (value) => value.replace(/[^0-9]/g, "");

  const handleLogin = () => {
    if (!loginPhone.trim()) {
      Alert.alert("Missing Details", "Enter your registered mobile number.");
      return;
    }

    if (loginPhone.trim().length !== 10) {
      Alert.alert("Invalid Mobile", "Enter a valid 10-digit mobile number.");
      return;
    }

    const result = loginUser(loginPhone.trim(), loginPassword.trim());

    if (!result.success && result.status === "not_found") {
      Alert.alert(
        "Not Registered",
        "No account found with this mobile number.\n\nPlease register first.",
        [
          {
            text: "Register Now",
            onPress: () => navigation.navigate("Register"),
          },
          { text: "OK", style: "cancel" },
        ]
      );
      return;
    }

    if (!result.success) {
      Alert.alert("Login Failed", result.message || "Please try again.");
      return;
    }

    const vs = result.verificationStatus || "not_submitted";

    if (vs === "not_submitted" || vs === "pending" || vs === "pending_approval") {
      navigation.navigate("WaitingApproval", {
        name: result.user?.name,
        role: result.user?.role,
        verificationStatus: vs,
      });
      return;
    }

    if (vs === "rejected") {
      Alert.alert(
        "Verification Rejected",
        "Your verification was rejected.\n\nPlease register again and re-submit your documents.",
        [
          {
            text: "Register Again",
            onPress: () => navigation.navigate("Register"),
          },
          { text: "OK", style: "cancel" },
        ]
      );
      return;
    }

    // If approved, loginUser already sets isLoggedIn=true
  };

  const handleCustSendOtp = () => {
    if (!custPhone.trim() || custPhone.trim().length !== 10) {
      Alert.alert("Invalid", "Enter a valid 10-digit mobile.");
      return;
    }

    const existing = getCustomerByPhone(custPhone.trim());

    if (existing) {
      setCustName(existing.name || "");
      setCustEmail(existing.email || "");
    }

    setCustStep(2);
    Alert.alert("OTP Sent", `Demo OTP: ${MOCK_OTP}`);
  };

  const handleCustVerifyOtp = () => {
    if (custOtp.trim() !== MOCK_OTP) {
      Alert.alert("Invalid OTP", `Demo OTP is ${MOCK_OTP}`);
      return;
    }

    const existing = getCustomerByPhone(custPhone.trim());

    if (existing) {
      loginAsCustomer(existing);
    } else {
      setCustStep(3);
    }
  };

  const handleCustCreateProfile = () => {
    if (!custName.trim()) {
      Alert.alert("Required", "Enter your name.");
      return;
    }

    const customer = registerCustomer({
      name: custName.trim(),
      phone: custPhone.trim(),
      email: custEmail.trim() || null,
    });

    loginAsCustomer(customer);
  };

  return (
    <SafeAreaView style={s.safeArea}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <ImageBackground
        source={require("../../../assets/bg.jpg")}
        style={s.bgImage}
        resizeMode="cover"
      >
        <LinearGradient
          colors={[
            "rgba(0,0,0,0.05)",
            "rgba(0,0,0,0.18)",
            "rgba(0,0,0,0.55)",
          ]}
          style={s.overlay}
        />

        <Animated.View style={[s.topGlow, { opacity: glowOpacity }]} />
        <Animated.View style={[s.bottomGlow, { opacity: glowOpacity }]} />

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={[
              s.scroll,
              {
                paddingTop: insets.top + 18,
                paddingBottom: insets.bottom + 28,
              },
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* HERO IMAGE CARD */}
            <View style={s.heroCard}>
              <ImageBackground
                source={require("../../../assets/card.jpg")}
                style={s.heroImage}
                imageStyle={{ borderRadius: 24 }}
                resizeMode="cover"
              >
                <LinearGradient
                  colors={[
                    "rgba(0,0,0,0.02)",
                    "rgba(0,0,0,0.20)",
                    "rgba(0,0,0,0.55)",
                  ]}
                  style={s.heroOverlay}
                />

                <Text style={s.heroTitle}>BS Gated</Text>
                <Text style={s.heroCaption}>
                  Smart Living. Stronger Together.
                </Text>
              </ImageBackground>
            </View>

            {/* TOP TABS */}
            <View style={s.topTabRow}>
              <TouchableOpacity
                activeOpacity={0.85}
                style={[s.topTab, topTab === "staff" && s.topTabActive]}
                onPress={() => setTopTab("staff")}
              >
                <Text
                  style={[
                    s.topTabText,
                    topTab === "staff" && s.topTabTextActive,
                  ]}
                >
                  Staff / Resident
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                style={[s.topTab, topTab === "customer" && s.topTabGold]}
                onPress={() => {
                  setTopTab("customer");
                  setCustStep(1);
                }}
              >
                <Text
                  style={[
                    s.topTabText,
                    topTab === "customer" && s.topTabTextGold,
                  ]}
                >
                  Property Buyer
                </Text>
              </TouchableOpacity>
            </View>

            {/* GLASS CARD */}
            <BlurView intensity={22} tint="dark" style={s.card}>
              <LinearGradient
                colors={[
                  "rgba(255,255,255,0.13)",
                  "rgba(255,255,255,0.03)",
                  "rgba(0,229,229,0.08)",
                ]}
                style={s.cardGlassLayer}
              />

              {topTab === "staff" && (
                <>
                  <Text style={s.cardTitle}>Welcome Back</Text>
                  <Text style={s.cardSub}>Sign in to your community account</Text>

                  <Text style={s.label}>Login as</Text>

                  <View style={s.roleGrid}>
                    {["Resident", "Vendor", "Guard", "Admin", "Builder"].map(
                      (role) => (
                        <TouchableOpacity
                          key={role}
                          activeOpacity={0.85}
                          style={[
                            s.roleChip,
                            loginRole === role && s.roleChipActive,
                          ]}
                          onPress={() => setLoginRole(role)}
                        >
                          <Text
                            style={[
                              s.roleChipText,
                              loginRole === role && s.roleChipTextActive,
                            ]}
                          >
                            {role}
                          </Text>
                        </TouchableOpacity>
                      )
                    )}
                  </View>

                  <View style={s.form}>
                    <Text style={s.label}>Mobile Number</Text>
                    <TextInput
                      style={s.input}
                      placeholder="Enter registered mobile number"
                      placeholderTextColor="#F8FFFF"
                      value={loginPhone}
                      onChangeText={(text) => setLoginPhone(cleanPhone(text))}
                      keyboardType="number-pad"
                      maxLength={10}
                      autoCapitalize="none"
                      selectionColor="#FFD700"
                      cursorColor="#FFD700"
                    />

                    <Text style={s.label}>Password</Text>
                    <View style={s.pwRow}>
                      <TextInput
                        style={[s.input, { flex: 1, marginBottom: 0 }]}
                        placeholder="Enter your password"
                        placeholderTextColor="#F8FFFF"
                        value={loginPassword}
                        onChangeText={setLoginPassword}
                        secureTextEntry={!showPw}
                        autoCapitalize="none"
                        selectionColor="#FFD700"
                        cursorColor="#FFD700"
                      />

                      <TouchableOpacity
                        activeOpacity={0.85}
                        style={s.eyeBtn}
                        onPress={() => setShowPw(!showPw)}
                      >
                        <Text style={s.eyeText}>{showPw ? "🙈" : "👁️"}</Text>
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                      activeOpacity={0.88}
                      style={s.goldBtn}
                      onPress={handleLogin}
                    >
                      <Text style={s.btnText}>Login</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() => navigation.navigate("Register")}
                    >
                      <Text style={s.link}>
                        New here? Create an account
                      </Text>
                    </TouchableOpacity>

                    <View style={s.demoSection}>
                      <Text style={s.demoLabel}>Quick Demo Login</Text>

                      <View style={s.demoGrid}>
                        {Object.keys(ROLE_KEYS).map((role) => (
                          <TouchableOpacity
                            key={role}
                            activeOpacity={0.85}
                            style={s.demoChip}
                            onPress={() => login(ROLE_KEYS[role])}
                          >
                            <Text style={s.demoChipText}>{role}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  </View>
                </>
              )}

              {topTab === "customer" && (
                <View style={s.form}>
                  <View style={s.stepRow}>
                    {["Phone", "OTP", "Profile"].map((label, index) => {
                      const stepNumber = index + 1;
                      const active = custStep === stepNumber;
                      const done = custStep > stepNumber;

                      return (
                        <View key={label} style={s.stepItem}>
                          <View
                            style={[
                              s.stepCircle,
                              active && s.stepCircleActive,
                              done && s.stepCircleDone,
                            ]}
                          >
                            <Text
                              style={[
                                s.stepNumber,
                                active && s.stepNumberActive,
                                done && s.stepNumberDone,
                              ]}
                            >
                              {done ? "✓" : stepNumber}
                            </Text>
                          </View>

                          <Text
                            style={[
                              s.stepLabel,
                              active && s.stepLabelActive,
                              done && s.stepLabelDone,
                            ]}
                          >
                            {label}
                          </Text>
                        </View>
                      );
                    })}
                  </View>

                  {custStep === 1 && (
                    <>
                      <Text style={s.custHeading}>Enter Mobile Number</Text>
                      <Text style={s.custSub}>
                        We will send an OTP to verify your number
                      </Text>

                      <TextInput
                        style={s.input}
                        placeholder="10-digit mobile number"
                        placeholderTextColor="#F8FFFF"
                        value={custPhone}
                        onChangeText={(text) => setCustPhone(cleanPhone(text))}
                        keyboardType="number-pad"
                        maxLength={10}
                        selectionColor="#FFD700"
                        cursorColor="#FFD700"
                      />

                      <TouchableOpacity
                        activeOpacity={0.88}
                        style={s.goldBtn}
                        onPress={handleCustSendOtp}
                      >
                        <Text style={s.btnText}>Send OTP</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        activeOpacity={0.85}
                        style={s.demoBtn}
                        onPress={() =>
                          loginAsCustomer({
                            id: "cust-demo",
                            name: "Demo Customer",
                            phone: "9000001111",
                            verified: true,
                          })
                        }
                      >
                        <Text style={s.demoBtnText}>
                          Demo: Skip to Dashboard
                        </Text>
                      </TouchableOpacity>
                    </>
                  )}

                  {custStep === 2 && (
                    <>
                      <Text style={s.custHeading}>Enter OTP</Text>
                      <Text style={s.custSub}>
                        Sent to +91 {custPhone} • Demo OTP: {MOCK_OTP}
                      </Text>

                      <TextInput
                        style={[s.input, s.otpInput]}
                        placeholder="••••••"
                        placeholderTextColor="#F8FFFF"
                        value={custOtp}
                        onChangeText={(text) => setCustOtp(cleanPhone(text))}
                        keyboardType="number-pad"
                        maxLength={6}
                        selectionColor="#FFD700"
                        cursorColor="#FFD700"
                      />

                      <TouchableOpacity
                        activeOpacity={0.88}
                        style={s.goldBtn}
                        onPress={handleCustVerifyOtp}
                      >
                        <Text style={s.btnText}>Verify OTP</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={() => setCustStep(1)}
                      >
                        <Text style={s.link}>Change Number</Text>
                      </TouchableOpacity>
                    </>
                  )}

                  {custStep === 3 && (
                    <>
                      <Text style={s.custHeading}>Create Your Profile</Text>
                      <Text style={s.custSub}>Phone verified successfully</Text>

                      <TextInput
                        style={s.input}
                        placeholder="Full Name"
                        placeholderTextColor="#F8FFFF"
                        value={custName}
                        onChangeText={setCustName}
                        selectionColor="#FFD700"
                        cursorColor="#FFD700"
                      />

                      <TextInput
                        style={s.input}
                        placeholder="Email optional"
                        placeholderTextColor="#F8FFFF"
                        value={custEmail}
                        onChangeText={setCustEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        selectionColor="#FFD700"
                        cursorColor="#FFD700"
                      />

                      <TouchableOpacity
                        activeOpacity={0.88}
                        style={s.goldBtn}
                        onPress={handleCustCreateProfile}
                      >
                        <Text style={s.btnText}>Create Profile & Enter</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              )}
            </BlurView>
          </ScrollView>
        </KeyboardAvoidingView>
      </ImageBackground>
    </SafeAreaView>
  );
}

export default function LoginScreen(props) {
  return (
    <SafeAreaProvider>
      <LoginContent {...props} />
    </SafeAreaProvider>
  );
}

const s = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#050505",
  },

  bgImage: {
    flex: 1,
    width,
    minHeight: height,
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
  },

  topGlow: {
    position: "absolute",
    top: -70,
    alignSelf: "center",
    width: width * 1.18,
    height: 210,
    backgroundColor: "#00E5E5",
    borderBottomLeftRadius: 180,
    borderBottomRightRadius: 180,
  },

  bottomGlow: {
    position: "absolute",
    bottom: -85,
    alignSelf: "center",
    width: width * 1.25,
    height: 230,
    backgroundColor: "#00D6D6",
    borderTopLeftRadius: 190,
    borderTopRightRadius: 190,
  },

  scroll: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },

  heroCard: {
    height: height * 0.22,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.30)",
    elevation: 12,
    shadowColor: "#000",
    shadowOpacity: 0.28,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    marginBottom: 16,
  },

  heroImage: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
  },

  heroTitle: {
    fontSize: 32,
    color: "#FFFFFF",
    fontWeight: "900",
    letterSpacing: 2,
    textTransform: "uppercase",
    textShadowColor: "#FFD700",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 14,
  },

  heroCaption: {
    marginTop: 8,
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "800",
    letterSpacing: 0.5,
    textShadowColor: "rgba(0,0,0,0.95)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },

  topTabRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },

  topTab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 18,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1.2,
    borderColor: "rgba(255,255,255,0.35)",
  },

  topTabActive: {
    backgroundColor: "rgba(0,150,136,0.78)",
    borderColor: "#00FFFF",
  },

  topTabGold: {
    backgroundColor: "rgba(255,215,0,0.18)",
    borderColor: "#FFD700",
  },

  topTabText: {
    color: "#EAFBFB",
    fontWeight: "800",
    fontSize: 12,
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },

  topTabTextActive: {
    color: "#FFFFFF",
  },

  topTabTextGold: {
    color: "#FFE36E",
  },

  card: {
    position: "relative",
    paddingHorizontal: 22,
    paddingVertical: 24,
    borderRadius: 28,
    overflow: "hidden",
    borderWidth: 1.2,
    borderColor: "rgba(255,255,255,0.42)",
    backgroundColor: "rgba(255,255,255,0.015)",
    shadowColor: "#00E5E5",
    shadowOpacity: 0.28,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },

  cardGlassLayer: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 28,
  },

  cardTitle: {
    fontSize: 25,
    fontWeight: "900",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 5,
    textShadowColor: "rgba(0,0,0,0.98)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },

  cardSub: {
    fontSize: 13,
    color: "#F4FFFF",
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 18,
    textShadowColor: "rgba(0,0,0,0.98)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },

  form: {
    gap: 10,
  },

  label: {
    fontSize: 12,
    fontWeight: "900",
    color: "#FFFFFF",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 2,
    textShadowColor: "rgba(0,0,0,0.98)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },

  roleGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 10,
  },

  roleChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.2,
    borderColor: "rgba(255,255,255,0.58)",
    backgroundColor: "rgba(255,255,255,0.08)",
  },

  roleChipActive: {
    backgroundColor: "rgba(0,150,136,0.78)",
    borderColor: "#00FFFF",
  },

  roleChipText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#FFFFFF",
    textShadowColor: "rgba(0,0,0,0.9)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },

  roleChipTextActive: {
    color: "#FFFFFF",
    fontWeight: "900",
  },

  input: {
    height: 54,
    borderRadius: 16,
    borderWidth: 1.3,
    borderColor: "rgba(255,255,255,0.76)",
    backgroundColor: "rgba(0,0,0,0.20)",
    paddingHorizontal: 16,
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 4,
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },

  pwRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },

  eyeBtn: {
    height: 54,
    width: 54,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.3,
    borderColor: "rgba(255,255,255,0.76)",
    backgroundColor: "rgba(0,0,0,0.20)",
  },

  eyeText: {
    fontSize: 19,
  },

  goldBtn: {
    alignSelf: "center",
    minWidth: 150,
    paddingHorizontal: 30,
    paddingVertical: 11,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: "#FFD700",
    backgroundColor: "rgba(255,215,0,0.20)",
    shadowColor: "#FFD700",
    shadowOpacity: 0.9,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    elevation: 12,
    marginTop: 8,
  },

  btnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.95)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },

  link: {
    color: "#FFE36E",
    marginTop: 10,
    textAlign: "center",
    fontWeight: "900",
    fontSize: 14,
    textShadowColor: "rgba(0,0,0,0.98)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },

  demoSection: {
    marginTop: 14,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.25)",
    paddingTop: 16,
  },

  demoLabel: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 1,
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.95)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },

  demoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
  },

  demoChip: {
    backgroundColor: "rgba(0,0,0,0.20)",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.46)",
  },

  demoChipText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },

  stepRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 18,
    marginBottom: 16,
  },

  stepItem: {
    alignItems: "center",
  },

  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.42)",
    backgroundColor: "rgba(0,0,0,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },

  stepCircleActive: {
    borderColor: "#FFD700",
    backgroundColor: "rgba(255,215,0,0.18)",
  },

  stepCircleDone: {
    borderColor: "#22C55E",
    backgroundColor: "rgba(34,197,94,0.20)",
  },

  stepNumber: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },

  stepNumberActive: {
    color: "#FFE36E",
  },

  stepNumberDone: {
    color: "#22C55E",
  },

  stepLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#FFFFFF",
    marginTop: 4,
  },

  stepLabelActive: {
    color: "#FFE36E",
  },

  stepLabelDone: {
    color: "#22C55E",
  },

  custHeading: {
    fontSize: 20,
    fontWeight: "900",
    color: "#FFFFFF",
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.95)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },

  custSub: {
    fontSize: 12,
    color: "#F8FFFF",
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 8,
    fontWeight: "700",
    textShadowColor: "rgba(0,0,0,0.95)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },

  otpInput: {
    textAlign: "center",
    fontSize: 24,
    letterSpacing: 8,
    fontWeight: "900",
  },

  demoBtn: {
    alignItems: "center",
    paddingVertical: 11,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,215,0,0.45)",
    backgroundColor: "rgba(255,215,0,0.10)",
    marginTop: 4,
  },

  demoBtnText: {
    color: "#FFE36E",
    fontSize: 13,
    fontWeight: "900",
    textShadowColor: "rgba(0,0,0,0.95)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});