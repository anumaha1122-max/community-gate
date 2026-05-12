/**
 * securityStore.js — SINGLE SOURCE OF TRUTH for all security-related state
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const now = () => new Date().toISOString();
const uid = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
const genOTP = () => Math.floor(100000 + Math.random() * 900000).toString();
const genQR  = (id) => `VISITOR|${id}|${genOTP()}`;

// ─── Seed Data ────────────────────────────────────────────────────────────────
const SEED_VISITORS = [
  {
    id: 'VIS-001',
    name: 'Ravi Kumar',
    phone: '9876543210',
    purpose: 'Personal Visit',
    vehicleNumber: 'TS09AB1234',
    photo: null,
    hostUnit: 'A-101',
    hostResidentId: 'res1',
    hostResidentName: 'John Resident',
    status: 'CHECKED_IN',
    otp: '482910',
    qrCode: 'VISITOR|VIS-001|482910',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    approvedAt: new Date(Date.now() - 2 * 86400000 + 300000).toISOString(),
    checkedInAt: new Date(Date.now() - 2 * 86400000 + 600000).toISOString(),
    checkedOutAt: null,
    entryGate: 'Main Gate',
    verifiedBy: 'sec1',
    timeline: [
      { action: 'Visitor Created',   by: 'res1',  at: new Date(Date.now() - 2 * 86400000).toISOString() },
      { action: 'Approved by Resident', by: 'res1', at: new Date(Date.now() - 2 * 86400000 + 300000).toISOString() },
      { action: 'Checked In at Main Gate', by: 'sec1', at: new Date(Date.now() - 2 * 86400000 + 600000).toISOString() },
    ],
  },
  {
    id: 'VIS-002',
    name: 'Swathi Reddy',
    phone: '9123456780',
    purpose: 'Guest',
    vehicleNumber: '',
    photo: null,
    hostUnit: 'A-101',
    hostResidentId: 'res1',
    hostResidentName: 'John Resident',
    status: 'APPROVED',
    otp: '739204',
    qrCode: 'VISITOR|VIS-002|739204',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    approvedAt: new Date(Date.now() - 3400000).toISOString(),
    checkedInAt: null,
    checkedOutAt: null,
    entryGate: null,
    verifiedBy: null,
    timeline: [
      { action: 'Visitor Created',      by: 'res1', at: new Date(Date.now() - 3600000).toISOString() },
      { action: 'Approved by Resident', by: 'res1', at: new Date(Date.now() - 3400000).toISOString() },
    ],
  },
  {
    id: 'VIS-003',
    name: 'Kiran Shah',
    phone: '9000099001',
    purpose: 'Delivery',
    vehicleNumber: '',
    photo: null,
    hostUnit: 'B-202',
    hostResidentId: 'res2',
    hostResidentName: 'Jane Resident',
    status: 'CREATED',
    otp: '561832',
    qrCode: 'VISITOR|VIS-003|561832',
    createdAt: new Date(Date.now() - 900000).toISOString(),
    approvedAt: null,
    checkedInAt: null,
    checkedOutAt: null,
    entryGate: null,
    verifiedBy: null,
    timeline: [
      { action: 'Visitor Created', by: 'res2', at: new Date(Date.now() - 900000).toISOString() },
    ],
  },
];

const SEED_DELIVERIES = [
  {
    id: 'DEL-001',
    provider: 'Amazon',
    deliveryPersonName: 'Arun Singh',
    deliveryPersonPhone: '9000011111',
    hostUnit: 'A-101',
    hostResidentId: 'res1',
    hostResidentName: 'John Resident',
    otp: '483920',
    qrCode: 'DELIVERY|DEL-001|483920',
    status: 'OTP_VERIFIED',
    otpVerifiedAt: new Date(Date.now() - 1800000).toISOString(),
    checkedInAt: new Date(Date.now() - 1800000).toISOString(),
    deliveredAt: null,
    checkedOutAt: null,
    verifiedBy: 'sec1',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    timeline: [
      { action: 'Delivery Pass Created', by: 'res1', at: new Date(Date.now() - 7200000).toISOString() },
      { action: 'OTP Verified by Guard', by: 'sec1', at: new Date(Date.now() - 1800000).toISOString() },
    ],
  },
  {
    id: 'DEL-002',
    provider: 'Swiggy',
    deliveryPersonName: 'Mohan Rao',
    deliveryPersonPhone: '9000022222',
    hostUnit: 'B-202',
    hostResidentId: 'res2',
    hostResidentName: 'Jane Resident',
    otp: '920384',
    qrCode: 'DELIVERY|DEL-002|920384',
    status: 'PENDING',
    otpVerifiedAt: null,
    checkedInAt: null,
    deliveredAt: null,
    checkedOutAt: null,
    verifiedBy: null,
    createdAt: new Date(Date.now() - 600000).toISOString(),
    timeline: [
      { action: 'Delivery Pass Created', by: 'res2', at: new Date(Date.now() - 600000).toISOString() },
    ],
  },
];

const SEED_VENDORS = [
  {
    id: 'VEN-001',
    vendorId: 'ven1',
    vendorName: 'Bob Vendor',
    vendorPhone: '8765432100',
    company: 'Fix-It Pro',
    linkedJobId: 'MR-002',
    linkedJobTitle: 'Ceiling fan not working',
    hostUnit: 'B-202',
    status: 'APPROVED',
    checkedInAt: null,
    checkedOutAt: null,
    verifiedBy: null,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    timeline: [
      { action: 'Vendor Entry Linked to Job MR-002', by: 'admin1', at: new Date(Date.now() - 86400000).toISOString() },
    ],
  },
];

const SEED_BLACKLIST = [
  {
    id: 'BL-001',
    name: 'Unknown Person',
    phone: '9999900001',
    idProof: 'Aadhaar',
    reason: 'Suspicious activity — unauthorized entry attempt',
    photo: null,
    addedBy: 'admin1',
    addedByName: 'Admin User',
    addedAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    active: true,
  },
  {
    id: 'BL-002',
    name: 'Rakesh Mehta',
    phone: '8888888888',
    idProof: 'Driving License',
    reason: 'Repeated aggressive behaviour at gate',
    photo: null,
    addedBy: 'admin1',
    addedByName: 'Admin User',
    addedAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    active: true,
  },
];

const SEED_SOS = [
  {
    id: 'SOS-001',
    residentId: 'res2',
    residentName: 'Jane Resident',
    unit: 'B-202',
    type: 'Medical',
    location: 'Tower B - Floor 2',
    description: 'Need immediate medical help',
    status: 'ACKNOWLEDGED',
    triggeredAt: new Date(Date.now() - 1800000).toISOString(),
    acknowledgedAt: new Date(Date.now() - 1700000).toISOString(),
    acknowledgedBy: 'sec1',
    acknowledgedByName: 'Sam Security',
    resolvedAt: null,
    resolvedBy: null,
    timeline: [
      { action: 'SOS TRIGGERED',         by: 'res2', byName: 'Jane Resident', at: new Date(Date.now() - 1800000).toISOString() },
      { action: 'Acknowledged by Guard', by: 'sec1', byName: 'Sam Security',  at: new Date(Date.now() - 1700000).toISOString() },
    ],
  },
];

const SEED_ENTRY_LOGS = [
  { id: 'LOG-001', type: 'VISITOR',  entityId: 'VIS-001', name: 'Ravi Kumar', unit: 'A-101', action: 'CHECK_IN', gate: 'Main Gate', guardId: 'sec1', at: new Date(Date.now() - 2 * 86400000 + 600000).toISOString() },
  { id: 'LOG-002', type: 'DELIVERY', entityId: 'DEL-001', name: 'Arun Singh', unit: 'A-101', action: 'CHECK_IN', gate: 'Main Gate', guardId: 'sec1', at: new Date(Date.now() - 1800000).toISOString() },
];

const SEED_LIVE_QUEUE = [
  {
    id: 'LQ-001',
    name: 'Priya Nair',
    phone: '9876500001',
    purpose: 'Guest',
    hostUnit: 'C-303',
    hostResidentId: 'res3',
    hostResidentName: 'Ravi Kumar',
    arrivalTime: new Date(Date.now() - 600000).toISOString(),
    status: 'WAITING',
    callAttempts: 1,
    guardId: 'sec1',
  },
];

const SEED_GUEST_PARKING = [
  {
    id: 'GP-001',
    residentId: 'res1',
    residentName: 'John Resident',
    unit: 'A-101',
    guestName: 'Suresh Nair',
    guestPhone: '9000033333',
    vehicleNumber: 'MH12AB5678',
    vehicleType: 'Car',
    slotNumber: 'P-12',
    requestedAt: new Date(Date.now() - 3600000).toISOString(),
    approvedAt: new Date(Date.now() - 3000000).toISOString(),
    status: 'ACTIVE',
    startTime: new Date(Date.now() - 1800000).toISOString(),
    endTime: new Date(Date.now() + 2 * 3600000).toISOString(),
    overstayAlertSent: false,
  },
];

const SEED_EV_CHARGING = [
  {
    id: 'EV-001',
    residentId: 'res1',
    residentName: 'John Resident',
    unit: 'A-101',
    vehicleNumber: 'TS09EV1001',
    slot: 'EV-03',
    startTime: new Date(Date.now() - 3600000).toISOString(),
    endTime: new Date(Date.now() + 3600000).toISOString(),
    status: 'CHARGING',
    unitsConsumed: 8.4,
    ratePerUnit: 12,
    totalBill: null,
    paidAt: null,
  },
];

// ─── Store ────────────────────────────────────────────────────────────────────
export const useSecurityStore = create(
  persist(
    (set, get) => ({

      // ── State ──────────────────────────────────────────────────────────────
      visitors:          SEED_VISITORS,
      deliveries:        SEED_DELIVERIES,
      vendors:           SEED_VENDORS,
      blacklist:         SEED_BLACKLIST,
      sosAlerts:         SEED_SOS,
      entryLogs:         SEED_ENTRY_LOGS,
      liveQueue:         SEED_LIVE_QUEUE,
      guestParking:      SEED_GUEST_PARKING,
      evCharging:        SEED_EV_CHARGING,
      guardNotifications: [],
      handoverLogs: [
        {
          id: 'SH001',
          outgoingGuard: 'Ramesh Singh',
          incomingGuard: 'Suresh Kumar',
          shiftTime: '08:00 AM - 08:00 PM',
          pendingVisitors: '2 visitor approvals pending',
          vehicleUpdates: '3 vehicles parked in visitor zone',
          sosUpdates: '1 medical alert resolved',
          incidentNotes: 'No major incident',
          generalRemarks: 'All normal, keys handed',
          submittedAt: new Date(Date.now() - 86400000).toISOString(),
          gate: 'Main Gate',
        },
      ],

      // ── VISITOR ACTIONS ────────────────────────────────────────────────────

      addVisitor: (data) => {
        const id = uid('VIS');
        const otp = genOTP();
        const visitor = {
          id,
          ...data,
          status: 'CREATED',
          otp,
          qrCode: genQR(id),
          createdAt: now(),
          approvedAt: null,
          checkedInAt: null,
          checkedOutAt: null,
          entryGate: null,
          verifiedBy: null,
          timeline: [{ action: 'Visitor Pass Created', by: data.hostResidentId, at: now() }],
        };
        set(s => ({ visitors: [visitor, ...s.visitors] }));
        return visitor;
      },

      approveVisitor: (id, residentId) =>
        set(s => ({
          visitors: s.visitors.map(v =>
            v.id === id
              ? { ...v, status: 'APPROVED', approvedAt: now(),
                  timeline: [...v.timeline, { action: 'Approved by Resident', by: residentId, at: now() }] }
              : v
          ),
        })),

      denyVisitor: (id, residentId) =>
        set(s => ({
          visitors: s.visitors.map(v =>
            v.id === id
              ? { ...v, status: 'DENIED',
                  timeline: [...v.timeline, { action: 'Denied by Resident', by: residentId, at: now() }] }
              : v
          ),
        })),

      checkInVisitor: (id, guardId, guardName = 'Guard', gate = 'Main Gate', photo = null, vehicleNote = '') => {
        const entry = {
          id: uid('LOG'), type: 'VISITOR', entityId: id,
          name: '', unit: '', action: 'CHECK_IN',
          gate, guardId, guardName, photo, vehicleNote, at: now(),
        };
        let residentId = null;
        let residentVisitorName = '';
        set(s => {
          const visitor = s.visitors.find(v => v.id === id);
          if (visitor) {
            entry.name = visitor.name;
            entry.unit = visitor.hostUnit;
            residentId = visitor.hostResidentId;
            residentVisitorName = visitor.name;
          }
          return {
            visitors: s.visitors.map(v =>
              v.id === id
                ? { ...v, status: 'CHECKED_IN', checkedInAt: now(), entryGate: gate,
                    verifiedBy: guardId, verifiedByName: guardName, photo,
                    guardVehicleNote: vehicleNote || v.vehicleNumber,
                    timeline: [...v.timeline, { action: `Checked In at ${gate} by ${guardName}`, by: guardId, byName: guardName, at: now() }] }
                : v
            ),
            entryLogs: [entry, ...s.entryLogs],
          };
        });
        try {
          if (residentId) {
            const residentStore = require('./residentStore').default;
            residentStore.getState().addNotification({
              type: 'visitor',
              title: '🚶 Visitor Checked In',
              body: `${residentVisitorName} has entered at ${gate}. Guard: ${guardName}.${vehicleNote ? ' Vehicle: ' + vehicleNote : ''}`,
              visitorId: id,
            });
          }
        } catch (e) { /* ignore */ }
      },

      checkOutVisitor: (id, guardId) => {
        const entry = {
          id: uid('LOG'), type: 'VISITOR', entityId: id,
          name: '', unit: '', action: 'CHECK_OUT', gate: 'Main Gate', guardId, at: now(),
        };
        set(s => {
          const visitor = s.visitors.find(v => v.id === id);
          if (visitor) { entry.name = visitor.name; entry.unit = visitor.hostUnit; }
          return {
            visitors: s.visitors.map(v =>
              v.id === id
                ? { ...v, status: 'CHECKED_OUT', checkedOutAt: now(),
                    timeline: [...v.timeline, { action: 'Checked Out', by: guardId, at: now() }] }
                : v
            ),
            entryLogs: [entry, ...s.entryLogs],
          };
        });
      },

      verifyVisitorOTP: (otp) => {
        const { visitors } = get();
        const visitor = visitors.find(v => v.otp === otp && v.status === 'APPROVED');
        return { ok: !!visitor, visitor: visitor || null };
      },

      verifyVisitorQR: (qrData) => {
        const { visitors } = get();
        const visitor = visitors.find(v => v.qrCode === qrData && v.status === 'APPROVED');
        return { ok: !!visitor, visitor: visitor || null };
      },

      // ── DELIVERY ACTIONS ───────────────────────────────────────────────────

      addDelivery: (data) => {
        const id = uid('DEL');
        const otp = genOTP();
        const delivery = {
          id, ...data, otp,
          qrCode: `DELIVERY|${id}|${otp}`,
          status: 'PENDING',
          otpVerifiedAt: null, checkedInAt: null, deliveredAt: null,
          checkedOutAt: null, verifiedBy: null,
          createdAt: now(),
          timeline: [{ action: 'Delivery Pass Created', by: data.hostResidentId, at: now() }],
        };
        set(s => ({ deliveries: [delivery, ...s.deliveries] }));
        return delivery;
      },

      verifyDeliveryOTP: (otp, guardId) => {
        const { deliveries } = get();
        const delivery = deliveries.find(d => d.otp === otp && d.status === 'PENDING');
        if (!delivery) return { ok: false, delivery: null };
        const logEntry = {
          id: uid('LOG'), type: 'DELIVERY', entityId: delivery.id,
          name: delivery.deliveryPersonName, unit: delivery.hostUnit,
          action: 'OTP_VERIFIED', gate: 'Main Gate', guardId, at: now(),
        };
        set(s => ({
          deliveries: s.deliveries.map(d =>
            d.id === delivery.id
              ? { ...d, status: 'OTP_VERIFIED', otpVerifiedAt: now(), checkedInAt: now(), verifiedBy: guardId,
                  timeline: [...d.timeline, { action: 'OTP Verified — Entry Allowed', by: guardId, at: now() }] }
              : d
          ),
          entryLogs: [logEntry, ...s.entryLogs],
        }));
        return { ok: true, delivery };
      },

      verifyDeliveryQR: (qrData, guardId) => {
        const { deliveries } = get();
        const parts = qrData.split('|');
        if (parts[0] !== 'DELIVERY') return { ok: false, delivery: null };
        const delivery = deliveries.find(d => d.id === parts[1] && d.otp === parts[2] && d.status === 'PENDING');
        if (!delivery) return { ok: false, delivery: null };
        set(s => ({
          deliveries: s.deliveries.map(d =>
            d.id === delivery.id
              ? { ...d, status: 'OTP_VERIFIED', otpVerifiedAt: now(), checkedInAt: now(), verifiedBy: guardId,
                  timeline: [...d.timeline, { action: 'QR Verified — Entry Allowed', by: guardId, at: now() }] }
              : d
          ),
          entryLogs: [{
            id: uid('LOG'), type: 'DELIVERY', entityId: delivery.id,
            name: delivery.deliveryPersonName, unit: delivery.hostUnit,
            action: 'QR_VERIFIED', gate: 'Main Gate', guardId, at: now(),
          }, ...s.entryLogs],
        }));
        return { ok: true, delivery };
      },

      markDelivered: (id, guardId) =>
        set(s => ({
          deliveries: s.deliveries.map(d =>
            d.id === id
              ? { ...d, status: 'DELIVERED', deliveredAt: now(), checkedOutAt: now(),
                  timeline: [...d.timeline, { action: 'Marked Delivered + Checked Out', by: guardId, at: now() }] }
              : d
          ),
          entryLogs: [{
            id: uid('LOG'), type: 'DELIVERY', entityId: id,
            name: '', unit: '', action: 'CHECK_OUT', gate: 'Main Gate', guardId, at: now(),
          }, ...s.entryLogs],
        })),

      // ── VENDOR ACTIONS ─────────────────────────────────────────────────────

      verifyVendor: (vendorEntryId, guardId) => {
        const { vendors } = get();
        const vendor = vendors.find(v => v.id === vendorEntryId && v.status === 'APPROVED');
        if (!vendor) return { ok: false };
        set(s => ({
          vendors: s.vendors.map(v =>
            v.id === vendorEntryId
              ? { ...v, status: 'CHECKED_IN', checkedInAt: now(), verifiedBy: guardId,
                  timeline: [...v.timeline, { action: 'Vendor Verified + Checked In', by: guardId, at: now() }] }
              : v
          ),
          entryLogs: [{
            id: uid('LOG'), type: 'VENDOR', entityId: vendorEntryId,
            name: vendor.vendorName, unit: vendor.hostUnit,
            action: 'CHECK_IN', gate: 'Main Gate', guardId, at: now(),
          }, ...s.entryLogs],
        }));
        return { ok: true, vendor };
      },

      checkOutVendor: (id, guardId) =>
        set(s => ({
          vendors: s.vendors.map(v =>
            v.id === id
              ? { ...v, status: 'CHECKED_OUT', checkedOutAt: now(),
                  timeline: [...v.timeline, { action: 'Vendor Checked Out', by: guardId, at: now() }] }
              : v
          ),
        })),
 
      validateMaintenanceOtp: async (otp, guardId, guardName) => {
        try {
          const { MaintenanceApi } = require('../services/maintenanceApi');
          const res = await MaintenanceApi.validateGateOtpByCode(otp);
          if (res) {
            const entry = {
              id: uid('LOG'),
              type: 'VENDOR',
              entityId: res.id,
              name: res.assignedVendorName || 'Vendor',
              unit: res.unit || '—',
              action: 'CHECK_IN',
              gate: 'Main Gate',
              guardId,
              guardName,
              at: now(),
            };
            set(s => ({ entryLogs: [entry, ...s.entryLogs] }));
            return { ok: true, request: res };
          }
          return { ok: false };
        } catch (error) {
          console.error('Validate Maintenance OTP Error:', error);
          return { ok: false, error };
        }
      },

      // ── BLACKLIST ACTIONS ──────────────────────────────────────────────────

      addToBlacklist: (data, adminId, adminName) => {
        const entry = { id: uid('BL'), ...data, addedBy: adminId, addedByName: adminName, addedAt: now(), active: true };
        set(s => ({ blacklist: [entry, ...s.blacklist] }));
        return entry;
      },

      removeFromBlacklist: (id, adminId) =>
        set(s => ({
          blacklist: s.blacklist.map(b =>
            b.id === id ? { ...b, active: false, removedBy: adminId, removedAt: now() } : b
          ),
        })),

      checkBlacklist: (name, phone) => {
        const { blacklist } = get();
        return blacklist.find(b =>
          b.active && (
            (phone && b.phone === phone) ||
            (name && b.name.toLowerCase() === name.toLowerCase())
          )
        ) || null;
      },

      // ── SOS ACTIONS ────────────────────────────────────────────────────────

      triggerSOS: (residentId, residentName, unit, type = 'Emergency', description = '') => {
        const alert = {
          id: uid('SOS'), residentId, residentName, unit, type, description,
          location: `Unit ${unit}`, status: 'TRIGGERED',
          triggeredAt: now(), acknowledgedAt: null, acknowledgedBy: null,
          acknowledgedByName: null, inProgressAt: null, resolvedAt: null,
          resolvedBy: null, resolvedByName: null, resolution: null,
          timeline: [{ action: '🚨 SOS TRIGGERED', by: residentId, byName: residentName, at: now() }],
        };
        set(s => ({ sosAlerts: [alert, ...s.sosAlerts] }));
        try {
          const adminStore = require('./adminStore').default;
          adminStore.getState().addNotification({
            type: 'sos',
            title: `🚨 SOS ALERT — ${type}`,
            body: `${residentName} (Unit ${unit}) triggered a ${type} SOS alert.${description ? ' Details: ' + description : ''} Respond immediately via SOS screen!`,
            sosId: alert.id,
          });
        } catch (e) { /* ignore */ }
        return alert;
      },

      addHandoverLog: (log) => {
        const entry = {
          id: `SH${Date.now()}`,
          ...log,
          submittedAt: new Date().toISOString(),
        };
        set(s => ({ handoverLogs: [entry, ...s.handoverLogs] }));
        return entry;
      },

      // ── Incidents ──────────────────────────────────────────────────────────
      incidents: [
        {
          id: 'INC001', title: 'Unauthorized Entry Attempt', type: 'Security Breach',
          guardId: 'g1', guardName: 'Sam Security', location: 'Main Gate',
          description: 'Unknown person tried to enter without approval.',
          actionTaken: 'Stopped at gate and added to watch list.',
          status: 'open', severity: 'high',
          reportedAt: new Date(Date.now() - 3 * 3600000).toISOString(),
          closedAt: null, adminAck: false,
        },
        {
          id: 'INC002', title: 'Parking Dispute', type: 'Resident Issue',
          guardId: 'g2', guardName: 'Raj Guard', location: 'Basement Parking',
          description: 'Argument between two residents over visitor parking.',
          actionTaken: 'Issue settled and slots reassigned.',
          status: 'closed', severity: 'low',
          reportedAt: new Date(Date.now() - 86400000).toISOString(),
          closedAt: new Date(Date.now() - 82800000).toISOString(),
          adminAck: true,
        },
      ],

      addIncident: (data) => {
        const entry = {
          id: `INC${Date.now()}`,
          ...data,
          status: 'open',
          adminAck: false,
          reportedAt: now(),
          closedAt: null,
        };
        set(s => ({ incidents: [entry, ...(s.incidents || [])] }));
        return entry;
      },

      closeIncident: (id, resolution) =>
        set(s => ({
          incidents: (s.incidents || []).map(inc =>
            inc.id === id ? { ...inc, status: 'closed', actionTaken: resolution, closedAt: now() } : inc
          ),
        })),

      // ── Patrol Logs ────────────────────────────────────────────────────────
      patrolLogs: [
        {
          id: 'PAT001', guardId: 'g1', guardName: 'Sam Security',
          route: 'Main Gate → Block A → Block B → Parking → Back', gate: 'Main Gate',
          startedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
          completedAt: new Date(Date.now() - 90 * 60000).toISOString(),
          checkpoints: [
            { name: 'Main Gate',      checkedAt: new Date(Date.now() - 2 * 3600000).toISOString(), ok: true },
            { name: 'Block A Lobby',  checkedAt: new Date(Date.now() - 105 * 60000).toISOString(), ok: true },
            { name: 'Block B Lobby',  checkedAt: new Date(Date.now() - 100 * 60000).toISOString(), ok: true },
            { name: 'Parking Area',   checkedAt: new Date(Date.now() - 95 * 60000).toISOString(),  ok: true },
          ],
          remarks: 'All clear', status: 'completed',
        },
      ],

      addPatrolLog: (data) => {
        const entry = {
          id: `PAT${Date.now()}`,
          ...data,
          startedAt: now(),
          completedAt: null,
          status: 'in_progress',
          checkpoints: (data.checkpoints || []).map(c => ({ ...c, checkedAt: null, ok: false })),
        };
        set(s => ({ patrolLogs: [entry, ...(s.patrolLogs || [])] }));
        return entry;
      },

      completePatrol: (id, remarks) =>
        set(s => ({
          patrolLogs: (s.patrolLogs || []).map(p =>
            p.id === id ? { ...p, status: 'completed', completedAt: now(), remarks } : p
          ),
        })),

      checkPatrolPoint: (patrolId, checkpointName) =>
        set(s => ({
          patrolLogs: (s.patrolLogs || []).map(p => {
            if (p.id !== patrolId) return p;
            return {
              ...p,
              checkpoints: p.checkpoints.map(c =>
                c.name === checkpointName ? { ...c, checkedAt: now(), ok: true } : c
              ),
            };
          }),
        })),

      // ── Guard Shifts ───────────────────────────────────────────────────────
      guardShifts: [
        {
          id: 'GS001', guardId: 'g1', guardName: 'Sam Security',
          gate: 'Main Gate', shiftType: 'Morning',
          startTime: '06:00', endTime: '14:00',
          startedAt: new Date(new Date().setHours(6, 0, 0, 0)).toISOString(),
          endedAt: null, status: 'active',
          visitorsHandled: 8, deliveriesHandled: 3, incidentsReported: 1,
        },
      ],

      startGuardShift: (data) => {
        const entry = {
          id: `GS${Date.now()}`,
          ...data,
          startedAt: now(),
          endedAt: null,
          status: 'active',
          visitorsHandled: 0,
          deliveriesHandled: 0,
          incidentsReported: 0,
        };
        set(s => ({ guardShifts: [entry, ...(s.guardShifts || [])] }));
        return entry;
      },

      endGuardShift: (id) =>
        set(s => ({
          guardShifts: (s.guardShifts || []).map(gs =>
            gs.id === id ? { ...gs, status: 'completed', endedAt: now() } : gs
          ),
        })),

      acknowledgeSOS: (id, guardId, guardName) => {
        set(s => ({
          sosAlerts: s.sosAlerts.map(a =>
            a.id === id && a.status === 'TRIGGERED'
              ? { ...a, status: 'ACKNOWLEDGED', acknowledgedAt: now(),
                  acknowledgedBy: guardId, acknowledgedByName: guardName,
                  timeline: [...a.timeline, { action: `Acknowledged by ${guardName}`, by: guardId, byName: guardName, at: now() }] }
              : a
          ),
        }));
        try {
          const residentStore = require('./residentStore').default;
          residentStore.getState().addNotification({
            type: 'sos',
            title: '👮 SOS Acknowledged',
            body: `${guardName} has acknowledged your emergency alert and is responding. Stay calm.`,
            sosId: id,
          });
        } catch (e) { /* ignore */ }
      },

      respondSOS: (id, guardId, guardName) =>
        set(s => ({
          sosAlerts: s.sosAlerts.map(a =>
            a.id === id && ['TRIGGERED', 'ACKNOWLEDGED'].includes(a.status)
              ? { ...a, status: 'IN_PROGRESS', inProgressAt: now(),
                  timeline: [...a.timeline, { action: `Response in progress — ${guardName}`, by: guardId, byName: guardName, at: now() }] }
              : a
          ),
        })),

      resolveSOS: (id, guardId, guardName, resolution = '') => {
        set(s => ({
          sosAlerts: s.sosAlerts.map(a =>
            a.id === id && a.status !== 'RESOLVED'
              ? { ...a, status: 'RESOLVED', resolvedAt: now(), resolvedBy: guardId,
                  resolvedByName: guardName, resolution,
                  timeline: [...a.timeline, { action: `✅ Resolved by ${guardName}${resolution ? ': ' + resolution : ''}`, by: guardId, byName: guardName, at: now() }] }
              : a
          ),
        }));
        try {
          const residentStore = require('./residentStore').default;
          residentStore.getState().addNotification({
            type: 'sos',
            title: '✅ SOS Resolved',
            body: `Your emergency alert has been resolved by ${guardName}.${resolution ? ' Note: ' + resolution : ''} Check your SOS history for details.`,
            sosId: id,
          });
        } catch (e) { /* ignore */ }
      },

      // ── LIVE QUEUE (WALK-IN) ACTIONS ───────────────────────────────────────

      /** Guard adds a walk-in visitor to the queue AND notifies the resident */
      addToQueue: (data, guardId) => {
        const entry = {
          id: uid('LQ'),
          ...data,
          arrivalTime: now(),
          status: 'WAITING',
          callAttempts: 0,
          guardId,
        };
        set(s => ({ liveQueue: [entry, ...s.liveQueue] }));

        // 🔔 Always notify resident — no hostResidentId gate (walk-in form never sets it)
        try {
          const residentStore = require('./residentStore').default;
          residentStore.getState().addNotification({
            type: 'walkin',
            title: '🚶 Visitor at Gate — Action Required',
            body: `${data.name || 'Someone'} has arrived at the gate${data.purpose ? ' for ' + data.purpose : ''}${data.hostUnit ? ' (Unit ' + data.hostUnit + ')' : ''}. Please approve or deny entry.`,
            queueId: entry.id,
            visitorName: data.name || '',
            visitorPhone: data.phone || '',
            purpose: data.purpose || '',
            hostUnit: data.hostUnit || '',
          });
        } catch (e) { /* ignore */ }

        return entry;
      },

      callResident: (id) => {
        let entry = null;
        set(s => {
          entry = s.liveQueue.find(q => q.id === id);
          return {
            liveQueue: s.liveQueue.map(q =>
              q.id === id
                ? { ...q, status: 'RESIDENT_CALLED', callAttempts: (q.callAttempts || 0) + 1, lastCalledAt: now() }
                : q
            ),
          };
        });
        // Re-send notification to resident as a reminder
        if (entry) {
          try {
            const residentStore = require('./residentStore').default;
            residentStore.getState().addNotification({
              type: 'walkin',
              title: '🔔 Reminder — Visitor Waiting at Gate',
              body: `${entry.name || 'A visitor'} is still waiting at the gate${entry.purpose ? ' for ' + entry.purpose : ''}${entry.hostUnit ? ' (Unit ' + entry.hostUnit + ')' : ''}. Please approve or deny entry.`,
              queueId: entry.id,
              visitorName: entry.name || '',
              visitorPhone: entry.phone || '',
              purpose: entry.purpose || '',
              hostUnit: entry.hostUnit || '',
            });
          } catch (e) { /* ignore */ }
        }
      },

      /** Resident approves walk-in — notifies guard */
      approveQueueEntry: (id, residentId) => {
        let entry = null;
        set(s => {
          entry = s.liveQueue.find(q => q.id === id);
          return {
            liveQueue: s.liveQueue.map(q =>
              q.id === id
                ? { ...q, status: 'APPROVED', approvedBy: residentId, approvedAt: now() }
                : q
            ),
          };
        });
        // 🔔 Notify guard that resident approved
        if (entry) {
          get().addGuardNotification({
            type: 'walkin_approved',
            title: '✅ Entry Approved by Resident',
            body: `Resident approved entry for ${entry.name || 'visitor'}${entry.hostUnit ? ' visiting Unit ' + entry.hostUnit : ''}. Please let them in.`,
            queueId: id,
            visitorName: entry.name || '',
            visitorPhone: entry.phone || '',
            hostUnit: entry.hostUnit || '',
            purpose: entry.purpose || '',
            guardId: entry.guardId || '',
            status: 'APPROVED',
          });
        }
      },

      /** Resident denies walk-in — notifies guard */
      denyQueueEntry: (id, residentId) => {
        let entry = null;
        set(s => {
          entry = s.liveQueue.find(q => q.id === id);
          return {
            liveQueue: s.liveQueue.map(q =>
              q.id === id
                ? { ...q, status: 'DENIED', deniedBy: residentId, deniedAt: now() }
                : q
            ),
          };
        });
        // 🔔 Notify guard that resident denied
        if (entry) {
          get().addGuardNotification({
            type: 'walkin_denied',
            title: '🚫 Entry Denied by Resident',
            body: `Resident denied entry for ${entry.name || 'visitor'}${entry.hostUnit ? ' visiting Unit ' + entry.hostUnit : ''}. Please turn them away.`,
            queueId: id,
            visitorName: entry.name || '',
            visitorPhone: entry.phone || '',
            hostUnit: entry.hostUnit || '',
            purpose: entry.purpose || '',
            guardId: entry.guardId || '',
            status: 'DENIED',
          });
        }
      },

      removeFromQueue: (id) =>
        set(s => ({ liveQueue: s.liveQueue.filter(q => q.id !== id) })),

      // ── GUARD NOTIFICATIONS ────────────────────────────────────────────────

      addGuardNotification: (data) => {
        const n = { id: uid('GN'), ...data, read: false, createdAt: now() };
        set(s => ({ guardNotifications: [n, ...s.guardNotifications] }));
      },

      markGuardNotificationRead: (id) =>
        set(s => ({
          guardNotifications: s.guardNotifications.map(n =>
            n.id === id ? { ...n, read: true } : n
          ),
        })),

      markAllGuardNotificationsRead: () =>
        set(s => ({
          guardNotifications: s.guardNotifications.map(n => ({ ...n, read: true })),
        })),

      // ── LOG ACTION ─────────────────────────────────────────────────────────

      logEntry: (type, entityId, name, unit, action, gate, guardId) => {
        const entry = { id: uid('LOG'), type, entityId, name, unit, action, gate, guardId, at: now() };
        set(s => ({ entryLogs: [entry, ...s.entryLogs] }));
      },

      // ── AMENITY VERIFICATION ───────────────────────────────────────────────

      verifyAmenityOTP: (otp, guardId, guardName = 'Guard') => {
        // Look up booking from residentStore
        try {
          const residentStore = require('./residentStore').default;
          const bookings = residentStore.getState().amenityBookings;
          const today = new Date().toISOString().split('T')[0];
          const booking = bookings.find(b =>
            b.otp === otp && b.status === 'confirmed' && !b.checkedIn
          );
          if (!booking) return { ok: false, reason: 'Invalid OTP or already used' };

          // Mark checked-in in residentStore
          residentStore.getState().markAmenityCheckedIn(booking.id, guardId, guardName);

          // Log to adminStore
          const logEntry = {
            id: uid('AL'), bookingId: booking.id,
            amenityName: booking.amenityName,
            residentName: booking.residentName, unit: booking.unit,
            action: 'CHECK_IN', verifiedBy: guardId, verifiedByName: guardName,
            otp, at: now(),
          };
          try {
            const adminStore = require('./adminStore').default;
            adminStore.getState().logAmenityEntry(logEntry);
          } catch (e) {}

          return { ok: true, booking };
        } catch (e) { return { ok: false, reason: 'Verification error' }; }
      },

      verifyAmenityQR: (qrData, guardId, guardName = 'Guard') => {
        const parts = qrData.split('|');
        if (parts[0] !== 'AMENITY' || parts.length < 3) return { ok: false, reason: 'Invalid QR code' };
        return get().verifyAmenityOTP(parts[2], guardId, guardName);
      },

      verifyEVOTP: (otp, guardId, guardName = 'Guard') => {
        try {
          const residentStore = require('./residentStore').default;
          const bookings = residentStore.getState().evBookings;
          const booking = bookings.find(b => b.otp === otp && b.paymentStatus === 'paid' && !b.checkedIn);
          if (!booking) return { ok: false, reason: 'Invalid OTP or already used' };

          // Mark checked-in in residentStore
          residentStore.getState().markEVCheckedIn(booking.id);

          // Log to securityStore entryLogs
          const logEntry = {
            id: uid('LOG'), type: 'EV', entityId: booking.id,
            name: booking.residentName, unit: booking.unit,
            action: 'EV_CHECKIN', gate: 'EV Charging Area',
            guardId, guardName, at: now(),
          };
          set(s => ({ entryLogs: [logEntry, ...s.entryLogs] }));

          // Log to adminStore EV logs + update booking
          const evLog = {
            id: uid('EL'), bookingId: booking.id,
            slot: booking.slot, vehicleNumber: booking.vehicleNumber,
            residentName: booking.residentName, unit: booking.unit,
            action: 'CHECK_IN', verifiedBy: guardId, verifiedByName: guardName,
            otp, at: now(),
          };
          try {
            const adminStore = require('./adminStore').default;
            adminStore.getState().logEVEntry(evLog);
          } catch (e) {}

          // Notify resident
          try {
            residentStore.getState().addNotification({
              type: 'ev',
              title: '⚡ EV Charging Started',
              body: `Entry verified by ${guardName} at Slot ${booking.slot}. Have a great charge!`,
              bookingId: booking.id,
            });
          } catch (e) {}

          return { ok: true, booking };
        } catch (e) { return { ok: false, reason: 'Verification error' }; }
      },

      verifyEVQR: (qrData, guardId, guardName = 'Guard') => {
        const parts = qrData.split('|');
        if (parts[0] !== 'EV' || parts.length < 3) return { ok: false, reason: 'Invalid QR code' };
        return get().verifyEVOTP(parts[2], guardId, guardName);
      },


      // ── GUEST PARKING ──────────────────────────────────────────────────────

      requestGuestParking: (data) => {
        const req = { id: uid('GP'), ...data, requestedAt: now(), status: 'PENDING', approvedAt: null, startTime: null, endTime: null, overstayAlertSent: false };
        set(s => ({ guestParking: [req, ...s.guestParking] }));
        return req;
      },

      approveGuestParking: (id, slotNumber, adminId = 'admin1', adminName = 'Admin') => {
        let parkingReq = null;
        set(s => {
          parkingReq = s.guestParking.find(p => p.id === id);
          return {
            guestParking: s.guestParking.map(p =>
              p.id === id
                ? { ...p, status: 'APPROVED', slotNumber, approvedAt: now(), approvedBy: adminId, approvedByName: adminName }
                : p
            ),
          };
        });
        try {
          if (parkingReq?.residentId) {
            const residentStore = require('./residentStore').default;
            residentStore.getState().addNotification({
              type: 'visitor',
              title: '🚗 Visitor Parking Approved!',
              body: `Parking slot ${slotNumber} has been assigned for ${parkingReq.guestName || 'your guest'}. Vehicle: ${parkingReq.vehicleNumber}.`,
              parkingId: id,
            });
          }
        } catch (e) { /* ignore */ }
      },

      rejectGuestParking: (id, reason = '', adminId = 'admin1', adminName = 'Admin') => {
        let parkingReq = null;
        set(s => {
          parkingReq = s.guestParking.find(p => p.id === id);
          return {
            guestParking: s.guestParking.map(p =>
              p.id === id
                ? { ...p, status: 'REJECTED', rejectedAt: now(), rejectedBy: adminId, rejectionReason: reason }
                : p
            ),
          };
        });
        try {
          if (parkingReq?.residentId) {
            const residentStore = require('./residentStore').default;
            residentStore.getState().addNotification({
              type: 'visitor',
              title: '🚗 Visitor Parking Rejected',
              body: `Your parking request for ${parkingReq.guestName || 'guest'} was rejected.${reason ? ' Reason: ' + reason : ''}`,
              parkingId: id,
            });
          }
        } catch (e) { /* ignore */ }
      },

      activateGuestParking: (id) => {
        const endTime = new Date(Date.now() + 4 * 3600000).toISOString();
        set(s => ({
          guestParking: s.guestParking.map(p =>
            p.id === id ? { ...p, status: 'ACTIVE', startTime: now(), endTime } : p
          ),
        }));
      },

      expireGuestParking: (id) =>
        set(s => ({
          guestParking: s.guestParking.map(p => p.id === id ? { ...p, status: 'EXPIRED' } : p),
        })),

      flagOverstay: (id) =>
        set(s => ({
          guestParking: s.guestParking.map(p => p.id === id ? { ...p, status: 'OVERSTAY', overstayAlertSent: true } : p),
        })),

      // ── EV CHARGING ────────────────────────────────────────────────────────

      bookEVSlot: (data) => {
        const booking = { id: uid('EV'), ...data, status: 'BOOKED', unitsConsumed: 0, totalBill: null, paidAt: null, bookedAt: now() };
        set(s => ({ evCharging: [booking, ...s.evCharging] }));
        return booking;
      },

      startCharging: (id) =>
        set(s => ({
          evCharging: s.evCharging.map(e => e.id === id ? { ...e, status: 'CHARGING', startTime: now() } : e),
        })),

      completeCharging: (id, unitsConsumed, ratePerUnit = 12) => {
        const totalBill = Math.round(unitsConsumed * ratePerUnit);
        set(s => ({
          evCharging: s.evCharging.map(e =>
            e.id === id ? { ...e, status: 'COMPLETED', unitsConsumed, totalBill, completedAt: now() } : e
          ),
        }));
      },

      payEVBill: (id) =>
        set(s => ({
          evCharging: s.evCharging.map(e => e.id === id ? { ...e, status: 'BILLED', paidAt: now() } : e),
        })),

      // ── DERIVED SELECTORS ──────────────────────────────────────────────────

      getActiveSOS:        () => get().sosAlerts.filter(a => a.status !== 'RESOLVED'),
      getPendingQueue:     () => get().liveQueue.filter(q => q.status === 'WAITING' || q.status === 'RESIDENT_CALLED'),
      getInsideVisitors:   () => get().visitors.filter(v => v.status === 'CHECKED_IN'),
      getPendingDeliveries:() => get().deliveries.filter(d => d.status === 'PENDING'),
      getActiveBlacklist:  () => get().blacklist.filter(b => b.active),
    }),

    {
      name: 'bs-security-storage-v2',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useSecurityStore;