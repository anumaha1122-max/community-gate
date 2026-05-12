import { create } from 'zustand';

const useVendorStore = create((set, get) => ({
  // ─── Notifications ─────────────────────────────────────────
  notifications: [],

  addNotification: (data) => {
    const notif = {
      id: `vn-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      ...data,
      createdAt: new Date().toISOString(),
      read: false,
    };
    set(s => ({ notifications: [notif, ...s.notifications] }));
  },

  markNotificationRead: (id) =>
    set(s => ({
      notifications: s.notifications.map(n => n.id === id ? { ...n, read: true } : n),
    })),

  markAllNotificationsRead: () =>
    set(s => ({
      notifications: s.notifications.map(n => ({ ...n, read: true })),
    })),
}));

export default useVendorStore;
