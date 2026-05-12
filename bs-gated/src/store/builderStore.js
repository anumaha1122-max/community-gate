/**
 * builderStore.js — Builder-specific state
 *
 * Owns:
 *   - builderProjects        (projects created/submitted by builder)
 *   - visitRequests          (site visit requests from customers)
 *   - flatBookingRequests    (flat booking requests from customers)
 *   - builderNotifications   (builder-scoped notifications)
 *   - whiteLabelConfig       (builder branding config)
 *
 * NOTE: SocietyContext (React context) also manages this data for
 * screens that were built around it. This store provides the same
 * data as a persisted Zustand alternative that superadmin screens can
 * also access without prop-drilling.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const now = () => new Date().toISOString();
const uid = (prefix) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

const DEFAULT_PROJECT_IMAGE =
  'https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1200&q=80';

// ─── Seed: Builder Projects ───────────────────────────────────────────────────
const SEED_BUILDER_PROJECTS = [
  {
    id: 'BPJ-DEMO-001',
    builderId: 'BLD-DEMO-001',
    builderName: 'Sunrise Developers',
    projectName: 'Sunrise Heights',
    name: 'Sunrise Heights',
    location: 'Gachibowli, Hyderabad',
    reraNumber: 'AP/PRJ/2023/0042',
    description: 'Premium residential towers with world-class amenities.',
    totalUnits: '120',
    towerCount: '2',
    availableUnits: '84',
    priceRange: '₹65L - ₹1.35Cr',
    completionDate: '2026-12-31',
    coverImage: DEFAULT_PROJECT_IMAGE,
    approvalStatus: 'Approved',
    sharedToCustomers: true,
    customerVisible: true,
    requestedAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    reviewedAt: new Date(Date.now() - 25 * 86400000).toISOString(),
    reviewMessage: 'Project approved. All documents verified.',
    units: [],
    complianceDocuments: [],
  },
];

// ─── Seed: Visit Requests ─────────────────────────────────────────────────────
const SEED_VISIT_REQUESTS = [
  {
    id: 'VR-DEMO-001',
    builderId: 'BLD-DEMO-001',
    projectId: 'BPJ-DEMO-001',
    projectName: 'Sunrise Heights',
    customerName: 'Arjun Mehta',
    customerPhone: '9876541230',
    preferredDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
    preferredTime: '11:00 AM',
    message: 'Interested in 3BHK. Please confirm slot.',
    status: 'Pending',
    submittedAt: new Date(Date.now() - 86400000).toISOString(),
    reviewedAt: null,
    builderMessage: '',
  },
];

// ─── Seed: Flat Booking Requests ──────────────────────────────────────────────
const SEED_FLAT_BOOKING_REQUESTS = [];

// ─── Seed: White Label Config ─────────────────────────────────────────────────
const DEFAULT_WHITE_LABEL = {
  appName: 'BuilderSphere',
  primaryColor: '#1A7A7A',
  logoText: 'BS',
  supportEmail: 'support@buildersphere.in',
};

// ─── Store ────────────────────────────────────────────────────────────────────
const useBuilderStore = create(
  persist(
    (set, get) => ({
      // ── State ───────────────────────────────────────────────────────────────
      builderProjects: SEED_BUILDER_PROJECTS,
      visitRequests: SEED_VISIT_REQUESTS,
      flatBookingRequests: SEED_FLAT_BOOKING_REQUESTS,
      builderNotifications: [],
      whiteLabelConfig: DEFAULT_WHITE_LABEL,

      // ── Project Actions ─────────────────────────────────────────────────────
      addBuilderProject: (projectData) => {
        const project = {
          id: uid('BPJ'),
          ...projectData,
          approvalStatus: 'Pending',
          sharedToCustomers: false,
          customerVisible: false,
          requestedAt: now(),
          reviewedAt: null,
          reviewMessage: '',
          units: projectData.units || [],
          complianceDocuments: [],
        };
        set((s) => ({ builderProjects: [project, ...s.builderProjects] }));
        return project;
      },

      addProjectRequest: (projectData) => get().addBuilderProject(projectData),

      updateBuilderProject: (projectId, updates) =>
        set((s) => ({
          builderProjects: s.builderProjects.map((p) =>
            p.id === projectId ? { ...p, ...updates } : p
          ),
        })),

      approveBuilderProject: (projectId, message = 'Approved') =>
        set((s) => ({
          builderProjects: s.builderProjects.map((p) =>
            p.id === projectId
              ? { ...p, approvalStatus: 'Approved', reviewedAt: now(), reviewMessage: message }
              : p
          ),
        })),

      rejectBuilderProject: (projectId, message = 'Rejected') =>
        set((s) => ({
          builderProjects: s.builderProjects.map((p) =>
            p.id === projectId
              ? { ...p, approvalStatus: 'Rejected', reviewedAt: now(), reviewMessage: message }
              : p
          ),
        })),

      shareProjectToCustomers: (projectId) =>
        set((s) => ({
          builderProjects: s.builderProjects.map((p) =>
            p.id === projectId
              ? { ...p, sharedToCustomers: true, customerVisible: true }
              : p
          ),
        })),

      addUnitToProject: (projectId, unit) =>
        set((s) => ({
          builderProjects: s.builderProjects.map((p) =>
            p.id === projectId
              ? { ...p, units: [...(p.units || []), { id: uid('UNIT'), ...unit }] }
              : p
          ),
        })),

      updateProjectUnit: (projectId, unitId, updates) =>
        set((s) => ({
          builderProjects: s.builderProjects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  units: (p.units || []).map((u) =>
                    u.id === unitId ? { ...u, ...updates } : u
                  ),
                }
              : p
          ),
        })),

      // ── Visit Request Actions ────────────────────────────────────────────────
      addVisitRequest: (requestData) => {
        const req = {
          id: uid('VR'),
          ...requestData,
          status: 'Pending',
          submittedAt: now(),
          reviewedAt: null,
          builderMessage: '',
        };
        set((s) => ({ visitRequests: [req, ...s.visitRequests] }));
        // Push notification to builder
        get().addBuilderNotification({
          type: 'visit_request',
          title: '📅 New Site Visit Request',
          body: `${requestData.customerName} wants to visit ${requestData.projectName} on ${requestData.preferredDate}`,
          requestId: req.id,
          builderId: requestData.builderId,
        });
        return req;
      },

      approveVisitRequest: (requestId, builderMessage = 'Your slot booking is approved.') => {
        const req = get().visitRequests.find((v) => v.id === requestId);
        set((s) => ({
          visitRequests: s.visitRequests.map((v) =>
            v.id === requestId
              ? { ...v, status: 'Approved', reviewedAt: now(), builderMessage }
              : v
          ),
        }));
        return req;
      },

      rejectVisitRequest: (requestId, builderMessage = 'Your slot booking was rejected.') => {
        set((s) => ({
          visitRequests: s.visitRequests.map((v) =>
            v.id === requestId
              ? { ...v, status: 'Rejected', reviewedAt: now(), builderMessage }
              : v
          ),
        }));
      },

      // ── Flat Booking Actions ─────────────────────────────────────────────────
      addFlatBookingRequest: (requestData) => {
        const booking = {
          id: uid('FBR'),
          ...requestData,
          status: 'Pending Approval',
          submittedAt: now(),
          reviewedAt: null,
          builderMessage: '',
          documentsVerified: false,
          paidAmount: 0,
          paymentHistory: [],
        };
        set((s) => ({ flatBookingRequests: [booking, ...s.flatBookingRequests] }));
        get().addBuilderNotification({
          type: 'booking_request',
          title: '🏠 New Flat Booking Request',
          body: `${requestData.customerName} wants to book ${requestData.unitNumber || 'a unit'} in ${requestData.projectName}`,
          requestId: booking.id,
          builderId: requestData.builderId,
        });
        return booking;
      },

      approveFlatBookingRequest: (requestId, builderMessage = 'Your flat booking is approved.') => {
        set((s) => ({
          flatBookingRequests: s.flatBookingRequests.map((b) =>
            b.id === requestId
              ? { ...b, status: 'Approved', reviewedAt: now(), builderMessage }
              : b
          ),
        }));
      },

      rejectFlatBookingRequest: (requestId, builderMessage = 'Your flat booking was rejected.') => {
        set((s) => ({
          flatBookingRequests: s.flatBookingRequests.map((b) =>
            b.id === requestId
              ? { ...b, status: 'Rejected', reviewedAt: now(), builderMessage }
              : b
          ),
        }));
      },

      verifyFlatBookingDocuments: (requestId) => {
        set((s) => ({
          flatBookingRequests: s.flatBookingRequests.map((b) =>
            b.id === requestId ? { ...b, documentsVerified: true } : b
          ),
        }));
      },

      markFlatBookingPaymentReceived: (requestId) => {
        set((s) => ({
          flatBookingRequests: s.flatBookingRequests.map((b) =>
            b.id === requestId
              ? { ...b, status: 'Payment Received', paymentReceivedAt: now() }
              : b
          ),
        }));
      },

      addCustomerPayment: (bookingId, amount) => {
        set((s) => ({
          flatBookingRequests: s.flatBookingRequests.map((b) => {
            if (b.id !== bookingId) return b;
            const newPaid = Number(b.paidAmount || 0) + Number(amount);
            const totalAmount = get().getBookingTotalAmount(b);
            return {
              ...b,
              paidAmount: newPaid,
              paymentHistory: [
                ...(b.paymentHistory || []),
                { amount, paidAt: now(), id: uid('PMT') },
              ],
              status: newPaid >= totalAmount ? 'Fully Paid' : b.status,
            };
          }),
        }));
      },

      // ── Payment Helpers ──────────────────────────────────────────────────────
      getBookingTotalAmount: (booking) => {
        if (!booking) return 0;
        if (booking.totalAmount) return Number(booking.totalAmount);
        const priceStr = String(booking.unitPrice || booking.price || '0').replace(/[₹,]/g, '');
        const base = parseFloat(priceStr) || 0;
        if (priceStr.toLowerCase().includes('cr')) return base * 10000000;
        if (priceStr.toLowerCase().includes('l')) return base * 100000;
        return base;
      },

      getPaymentPercentage: (booking) => {
        if (!booking) return 0;
        const total = get().getBookingTotalAmount(booking);
        if (!total) return 0;
        return Math.min(100, Math.round((Number(booking.paidAmount || 0) / total) * 100));
      },

      // ── Notifications ────────────────────────────────────────────────────────
      addBuilderNotification: (notif) => {
        const n = { id: uid('BNOTIF'), ...notif, read: false, createdAt: now() };
        set((s) => ({ builderNotifications: [n, ...s.builderNotifications] }));
      },

      markBuilderNotificationRead: (notifId) =>
        set((s) => ({
          builderNotifications: s.builderNotifications.map((n) =>
            n.id === notifId ? { ...n, read: true } : n
          ),
        })),

      getUnreadNotificationCount: (builderId) => {
        const notifs = get().builderNotifications;
        if (!builderId) return notifs.filter((n) => !n.read).length;
        return notifs.filter((n) => !n.read && (!n.builderId || n.builderId === builderId)).length;
      },

      // ── White Label Config ───────────────────────────────────────────────────
      updateWhiteLabelConfig: (updates) =>
        set((s) => ({ whiteLabelConfig: { ...s.whiteLabelConfig, ...updates } })),
    }),

    {
      name: 'bs-builder-storage',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
    }
  )
);

export default useBuilderStore;
