/**
 * superadminStore.js — SuperAdmin-specific state
 *
 * Owns:
 *   - societies              (all registered societies)
 *   - superAdminNotifications
 *   - systemHealth           (platform-wide health metrics)
 *
 * Builder requests (approving builders) live in appStore.js (builderRequests).
 * Projects/Units/Bookings for builder approval live in builderStore.js.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const now = () => new Date().toISOString();
const uid = (prefix) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

// ─── Seed: Societies ──────────────────────────────────────────────────────────
const SEED_SOCIETIES = [
  {
    id: 'SOC-001',
    name: 'Green Valley Apartments',
    location: 'Gachibowli, Hyderabad',
    adminName: 'Kavita Reddy',
    adminPhone: '9000001234',
    totalUnits: 240,
    totalResidents: 198,
    status: 'active',
    plan: 'premium',
    joinedAt: new Date(Date.now() - 120 * 86400000).toISOString(),
    lastActivity: new Date(Date.now() - 3600000).toISOString(),
    monthlyRevenue: 48000,
  },
  {
    id: 'SOC-002',
    name: 'Sunrise Towers',
    location: 'HITEC City, Hyderabad',
    adminName: 'Rajesh Kumar',
    adminPhone: '9000002345',
    totalUnits: 180,
    totalResidents: 154,
    status: 'active',
    plan: 'standard',
    joinedAt: new Date(Date.now() - 90 * 86400000).toISOString(),
    lastActivity: new Date(Date.now() - 7200000).toISOString(),
    monthlyRevenue: 36000,
  },
  {
    id: 'SOC-003',
    name: 'Palm Grove Residency',
    location: 'Jubilee Hills, Hyderabad',
    adminName: 'Sunita Devi',
    adminPhone: '9000003456',
    totalUnits: 96,
    totalResidents: 72,
    status: 'trial',
    plan: 'basic',
    joinedAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    lastActivity: new Date(Date.now() - 86400000).toISOString(),
    monthlyRevenue: 9600,
  },
];

// ─── Seed: SuperAdmin Notifications ──────────────────────────────────────────
const SEED_SA_NOTIFICATIONS = [
  {
    id: 'SAN-001',
    type: 'builder_request',
    title: '🏗️ New Builder Registration',
    body: 'Sunrise Developers submitted a builder registration request.',
    read: false,
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'SAN-002',
    type: 'society_joined',
    title: '🏘️ New Society Onboarded',
    body: 'Palm Grove Residency has joined the platform.',
    read: false,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

// ─── Store ────────────────────────────────────────────────────────────────────
const useSuperAdminStore = create(
  persist(
    (set, get) => ({
      // ── State ───────────────────────────────────────────────────────────────
      societies: SEED_SOCIETIES,
      superAdminNotifications: SEED_SA_NOTIFICATIONS,

      // ── Society Actions ─────────────────────────────────────────────────────
      addSociety: (data) => {
        const society = {
          id: uid('SOC'),
          ...data,
          status: 'active',
          totalResidents: 0,
          joinedAt: now(),
          lastActivity: now(),
          monthlyRevenue: 0,
        };
        set((s) => ({ societies: [society, ...s.societies] }));
        return society;
      },

      updateSociety: (id, updates) =>
        set((s) => ({
          societies: s.societies.map((soc) =>
            soc.id === id ? { ...soc, ...updates } : soc
          ),
        })),

      deactivateSociety: (id) =>
        set((s) => ({
          societies: s.societies.map((soc) =>
            soc.id === id ? { ...soc, status: 'inactive' } : soc
          ),
        })),

      getSocietyStats: () => {
        const societies = get().societies;
        return {
          total: societies.length,
          active: societies.filter((s) => s.status === 'active').length,
          trial: societies.filter((s) => s.status === 'trial').length,
          inactive: societies.filter((s) => s.status === 'inactive').length,
          totalRevenue: societies.reduce((sum, s) => sum + (s.monthlyRevenue || 0), 0),
          totalResidents: societies.reduce((sum, s) => sum + (s.totalResidents || 0), 0),
        };
      },

      // ── Notification Actions ────────────────────────────────────────────────
      addSuperAdminNotification: (notif) => {
        const n = { id: uid('SAN'), ...notif, read: false, createdAt: now() };
        set((s) => ({
          superAdminNotifications: [n, ...s.superAdminNotifications],
        }));
      },

      markSANotificationRead: (notifId) =>
        set((s) => ({
          superAdminNotifications: s.superAdminNotifications.map((n) =>
            n.id === notifId ? { ...n, read: true } : n
          ),
        })),

      markAllSANotificationsRead: () =>
        set((s) => ({
          superAdminNotifications: s.superAdminNotifications.map((n) => ({
            ...n,
            read: true,
          })),
        })),

      getUnreadSANotificationCount: () =>
        get().superAdminNotifications.filter((n) => !n.read).length,
    }),

    {
      name: 'bs-superadmin-storage',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
    }
  )
);

export default useSuperAdminStore;
