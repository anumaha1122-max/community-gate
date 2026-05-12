

import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import { useAppContext } from "../superadmin/SocietyContext";

const NAVY = "#1A7A7A";
const NAVY_2 = "#1A7A7A";
const GOLD = "#ffffff";
const BG = "#E8F5F5";
const WHITE = "#FFFFFF";
const MUTED = "#64748B";
const BORDER = "#E2E8F0";
const INFO = "#3B82F6";
const SUCCESS = "#10B981";
const WARNING = "#F59E0B";
const DANGER = "#EF4444";

// ─── Category config ──────────────────────────────────────────────────────────
const CATEGORIES = [
  { key: "all",          label: "All",          icon: "🔔" },
  { key: "registration", label: "Registration",  icon: "🏗️" },
  { key: "project",      label: "Projects",      icon: "🏢" },
  { key: "visit",        label: "Visits",        icon: "📅" },
  { key: "booking",      label: "Bookings",      icon: "🏠" },
];

// ─── Type → color map ─────────────────────────────────────────────────────────
const typeColor = (type) => {
  if (type === "success") return SUCCESS;
  if (type === "warning") return WARNING;
  if (type === "danger")  return DANGER;
  return INFO;
};

// ─── Category → icon ─────────────────────────────────────────────────────────
const categoryIcon = (category) => {
  if (category === "registration") return "🏗️";
  if (category === "project")      return "🏢";
  if (category === "visit")        return "📅";
  if (category === "booking")      return "🏠";
  return "🔔";
};

export default function BuilderNotificationScreen({ navigation, route }) {
  const { notifications, setNotifications } = useAppContext();

  const builderId = route?.params?.builderId || null;
  const [activeCategory, setActiveCategory] = useState("all");

  // 1️⃣  Filter by builderId first (builder sees only their notifications;
  //      super admin passes null and sees everything)
  const builderNotifications = useMemo(() => {
    if (!builderId) return notifications || [];
    return (notifications || []).filter(
      (item) => item.builderId === builderId || item.builderId === null
    );
  }, [notifications, builderId]);

  // 2️⃣  Then filter by active category tab
  const filteredNotifications = useMemo(() => {
    if (activeCategory === "all") return builderNotifications;
    return builderNotifications.filter((item) => item.category === activeCategory);
  }, [builderNotifications, activeCategory]);

  // 3️⃣  Unread count for current category
  const unreadCount = useMemo(
    () => filteredNotifications.filter((item) => !item?.read).length,
    [filteredNotifications]
  );

  // ─── Actions ──────────────────────────────────────────────────────────────
  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((item) => {
        const belongsToBuilder =
          !builderId || item.builderId === builderId || item.builderId === null;
        const inCategory =
          activeCategory === "all" || item.category === activeCategory;
        return belongsToBuilder && inCategory ? { ...item, read: true } : item;
      })
    );
    Alert.alert("Done", "All visible notifications marked as read.");
  };

  const markSingleAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: true } : item))
    );
  };

  const openNotification = (item) => {
    markSingleAsRead(item.id);
    Alert.alert(
      item?.title || "Notification",
      `${item?.message || "No message available"}\n\n🕐 ${item?.time || ""}`
    );
  };

  // ─── Category tab counts ──────────────────────────────────────────────────
  const countForCategory = (key) => {
    const base = builderId
      ? (notifications || []).filter(
          (n) => n.builderId === builderId || n.builderId === null
        )
      : notifications || [];
    if (key === "all") return base.filter((n) => !n.read).length;
    return base.filter((n) => n.category === key && !n.read).length;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>

        {/* ── Top Header ── */}
        <View style={styles.topHeader}>
          <TouchableOpacity
            style={styles.headerIconButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.85}
          >
            <Text style={styles.headerIconText}>‹</Text>
          </TouchableOpacity>

          <View style={styles.headerTitleWrap}>
            <Text style={styles.topHeaderTitle}>Notifications</Text>
            <Text style={styles.topHeaderSubTitle}>
              {unreadCount} unread {activeCategory !== "all" ? `in ${activeCategory}` : ""}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.markBtn}
            onPress={markAllAsRead}
            activeOpacity={0.85}
          >
            <Text style={styles.markBtnText}>Read All</Text>
          </TouchableOpacity>
        </View>

        {/* ── Category Tabs ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabScroll}
          contentContainerStyle={styles.tabContent}
        >
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.key;
            const unread = countForCategory(cat.key);
            return (
              <TouchableOpacity
                key={cat.key}
                style={[styles.tabBtn, isActive && styles.tabBtnActive]}
                onPress={() => setActiveCategory(cat.key)}
                activeOpacity={0.8}
              >
                <Text style={styles.tabIcon}>{cat.icon}</Text>
                <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                  {cat.label}
                </Text>
                {unread > 0 && (
                  <View style={styles.tabBadge}>
                    <Text style={styles.tabBadgeText}>{unread}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ── Notification List ── */}
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {filteredNotifications.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>
                {CATEGORIES.find((c) => c.key === activeCategory)?.icon || "🔔"}
              </Text>
              <Text style={styles.emptyTitle}>No Notifications</Text>
              <Text style={styles.emptyText}>
                {activeCategory === "all"
                  ? "Visit requests, bookings, and registration updates will appear here."
                  : `No ${activeCategory} notifications yet.`}
              </Text>
            </View>
          ) : (
            filteredNotifications.map((item, index) => {
              const color = typeColor(item?.type);
              return (
                <TouchableOpacity
                  key={item?.id || index}
                  style={[styles.notificationCard, !item?.read && styles.unreadCard]}
                  onPress={() => openNotification(item)}
                  activeOpacity={0.9}
                >
                  {/* Left color stripe */}
                  <View style={[styles.notificationStripe, { backgroundColor: color }]} />

                  {/* Category icon pill */}
                  <View style={[styles.categoryIconWrap, { backgroundColor: color + "22" }]}>
                    <Text style={styles.categoryIconText}>
                      {categoryIcon(item?.category)}
                    </Text>
                  </View>

                  <View style={styles.notificationContent}>
                    <View style={styles.notificationTopRow}>
                      <Text style={styles.notificationTitle} numberOfLines={1}>
                        {item?.title || "Notification"}
                      </Text>
                      {!item?.read && <View style={styles.unreadDot} />}
                    </View>

                    <Text style={styles.notificationMessage} numberOfLines={3}>
                      {item?.message || "No message available"}
                    </Text>

                    <View style={styles.notificationFooter}>
                      <Text style={styles.notificationTime}>{item?.time || "Now"}</Text>

                      <View style={styles.footerRight}>
                        {/* Category badge */}
                        <View style={[styles.catBadge, { backgroundColor: color + "22" }]}>
                          <Text style={[styles.catBadgeText, { color }]}>
                            {item?.category || "general"}
                          </Text>
                        </View>

                        {/* Read/Unread badge */}
                        <View
                          style={[
                            styles.statusBadge,
                            !item?.read ? styles.statusUnreadBadge : styles.statusReadBadge,
                          ]}
                        >
                          <Text
                            style={[
                              styles.statusBadgeText,
                              !item?.read ? styles.statusUnreadText : styles.statusReadText,
                            ]}
                          >
                            {!item?.read ? "Unread" : "Read"}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BG },
  screen: { flex: 1, backgroundColor: BG },

  // ── Header ──────────────────────────────────────────────────────────────
  topHeader: {
    minHeight: 92,
    backgroundColor: NAVY,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "android" ? 10 : 6,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  headerIconButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: NAVY_2,
    alignItems: "center",
    justifyContent: "center",
  },
  headerIconText: { color: WHITE, fontSize: 28, fontWeight: "800", marginTop: -2 },
  headerTitleWrap: { flex: 1, marginLeft: 12, marginRight: 12 },
  topHeaderTitle: { color: WHITE, fontSize: 20, fontWeight: "800" },
  topHeaderSubTitle: { color: "#CBD5E1", fontSize: 12, marginTop: 2 },
  markBtn: {
    backgroundColor: GOLD,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  markBtnText: { color: NAVY, fontWeight: "800", fontSize: 12 },

  // ── Category Tabs ────────────────────────────────────────────────────────
  tabScroll: {
    backgroundColor: WHITE,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    maxHeight: 60,
  },
  tabContent: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  tabBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: BG,
    borderWidth: 1,
    borderColor: BORDER,
    gap: 5,
  },
  tabBtnActive: {
    backgroundColor: NAVY,
    borderColor: NAVY,
  },
  tabIcon: { fontSize: 13 },
  tabLabel: { fontSize: 12, fontWeight: "700", color: MUTED },
  tabLabelActive: { color: WHITE },
  tabBadge: {
    backgroundColor: DANGER,
    borderRadius: 999,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  tabBadgeText: { color: WHITE, fontSize: 10, fontWeight: "900" },

  // ── Notification List ────────────────────────────────────────────────────
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },

  emptyCard: {
    backgroundColor: WHITE,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 28,
    alignItems: "center",
    marginTop: 20,
  },
  emptyIcon: { fontSize: 44, marginBottom: 12 },
  emptyTitle: { color: NAVY, fontSize: 20, fontWeight: "800", marginBottom: 8 },
  emptyText: { color: MUTED, fontSize: 14, textAlign: "center", lineHeight: 22 },

  notificationCard: {
    flexDirection: "row",
    backgroundColor: WHITE,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 12,
    overflow: "hidden",
    alignItems: "stretch",
  },
  unreadCard: { borderColor: "#BFDBFE", backgroundColor: "#F8FBFF" },

  notificationStripe: { width: 5 },

  categoryIconWrap: {
    width: 44,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
  },
  categoryIconText: { fontSize: 20 },

  notificationContent: { flex: 1, padding: 12 },

  notificationTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  notificationTitle: {
    flex: 1,
    color: NAVY,
    fontSize: 15,
    fontWeight: "800",
    marginRight: 8,
  },
  unreadDot: {
    width: 9,
    height: 9,
    borderRadius: 999,
    backgroundColor: INFO,
  },

  notificationMessage: {
    color: "#475569",
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 10,
  },

  notificationFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  notificationTime: { color: MUTED, fontSize: 11, fontWeight: "600" },

  footerRight: { flexDirection: "row", alignItems: "center", gap: 6 },

  catBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  catBadgeText: { fontSize: 10, fontWeight: "800", textTransform: "capitalize" },

  statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  statusUnreadBadge: { backgroundColor: "#DBEAFE" },
  statusReadBadge: { backgroundColor: "#E2E8F0" },
  statusBadgeText: { fontSize: 10, fontWeight: "800" },
  statusUnreadText: { color: "#1D4ED8" },
  statusReadText: { color: "#475569" },
});