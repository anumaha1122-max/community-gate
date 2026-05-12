import { create } from 'zustand';

const SEED_RESIDENTS = [
  { id: 'res1', name: 'John Resident',  unit: 'A-101', email: 'john@bs.com',  phone: '9876543210', kycStatus: 'verified',   active: true,  joinedAt: '2024-01-15' },
  { id: 'res2', name: 'Jane Resident',  unit: 'B-202', email: 'jane@bs.com',  phone: '9876543211', kycStatus: 'verified',   active: true,  joinedAt: '2024-02-20' },
  { id: 'res3', name: 'Ravi Kumar',     unit: 'C-303', email: 'ravi@bs.com',  phone: '9876543212', kycStatus: 'pending',    active: true,  joinedAt: '2024-03-10' },
  { id: 'res4', name: 'Priya Sharma',   unit: 'A-102', email: 'priya@bs.com', phone: '9876543213', kycStatus: 'rejected',   active: false, joinedAt: '2024-04-05' },
];

const SEED_VENDORS = [
  { id: 2, name: 'Bob Vendor',   company: 'Fix-It Pro',     category: 'Plumbing',   phone: '8765432100', rating: 4.5, active: true },
  { id: 101, name: 'Alice Vendor', company: 'Quick Repairs',  category: 'Electrical', phone: '8765432101', rating: 4.2, active: true },
  { id: 102, name: 'Suresh Works', company: 'Paint Masters',  category: 'Painting',   phone: '8765432102', rating: 3.9, active: true },
];

const SEED_AMC_CONTRACTS = [
  {
    id: 'AMC-001',
    vendorId: 2, vendorName: 'Bob Vendor', vendorCompany: 'Fix-It Pro',
    type: 'AMC', category: 'Plumbing',
    title: 'Plumbing Annual Maintenance Contract',
    scope: 'Monthly inspection of all plumbing lines, emergency call-out within 4 hours, replacement of minor parts included.',
    startDate: '2025-01-01', endDate: '2025-12-31',
    amount: 36000, paymentSchedule: 'quarterly',
    paidInstallments: 1, totalInstallments: 4,
    status: 'active',
    proposedAt: '2024-12-15T10:00:00.000Z', approvedAt: '2024-12-20T14:00:00.000Z',
    adminRemark: 'Approved. Please start from 1st Jan.',
    renewalReminderSent: false,
    timeline: [
      { action: 'Contract Proposed by Vendor', at: '2024-12-15T10:00:00.000Z' },
      { action: 'Admin Approved', at: '2024-12-20T14:00:00.000Z' },
      { action: 'Contract Active', at: '2025-01-01T00:00:00.000Z' },
    ],
  },
  {
    id: 'AMC-002',
    vendorId: 'ven2', vendorName: 'Alice Vendor', vendorCompany: 'Quick Repairs',
    type: 'AMC', category: 'Electrical',
    title: 'Electrical Systems AMC',
    scope: 'Bi-monthly inspection of electrical panels, wiring checks, UPS/inverter maintenance.',
    startDate: '2025-03-01', endDate: '2026-02-28',
    amount: 48000, paymentSchedule: 'monthly',
    paidInstallments: 0, totalInstallments: 12,
    status: 'proposed',
    proposedAt: new Date(Date.now() - 2 * 86400000).toISOString(), approvedAt: null,
    adminRemark: '',
    renewalReminderSent: false,
    timeline: [
      { action: 'Contract Proposed by Vendor', at: new Date(Date.now() - 2 * 86400000).toISOString() },
    ],
  },
  {
    id: 'AMC-003',
    vendorId: 'ven1', vendorName: 'Bob Vendor', vendorCompany: 'Fix-It Pro',
    type: 'project', category: 'Plumbing',
    title: 'Overhead Tank Cleaning Project',
    scope: 'Complete cleaning and disinfection of all 4 overhead tanks. Includes water quality report.',
    startDate: '2025-05-10', endDate: '2025-05-15',
    amount: 8500, paymentSchedule: 'one-time',
    paidInstallments: 0, totalInstallments: 1,
    status: 'negotiation',
    proposedAt: new Date(Date.now() - 86400000).toISOString(), approvedAt: null,
    adminRemark: 'Price seems high. Can you reduce to ₹7,000?',
    vendorCounter: 'Best we can do is ₹8,000. Includes disinfection chemicals.',
    renewalReminderSent: false,
    timeline: [
      { action: 'Project Proposed by Vendor', at: new Date(Date.now() - 86400000).toISOString() },
      { action: 'Admin sent for negotiation', at: new Date(Date.now() - 43200000).toISOString() },
    ],
  },
];

const SEED_GUARDS = [
  { id: 'g1', name: 'Sam Security', phone: '7654321000', shift: 'Morning', gate: 'Main Gate', active: true },
  { id: 'g2', name: 'Raj Guard',    phone: '7654321001', shift: 'Evening', gate: 'Side Gate', active: true },
  { id: 'g3', name: 'Vikram Singh', phone: '7654321002', shift: 'Night',   gate: 'Main Gate', active: false },
];

const SEED_VISITORS = [
  { id: 'v1', name: 'Arun Delivery', purpose: 'Delivery',  unit: 'A-101', phone: '6543210001', checkIn: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), checkOut: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), status: 'checked_out' },
  { id: 'v2', name: 'Dr. Meera',     purpose: 'Medical',   unit: 'B-202', phone: '6543210002', checkIn: new Date(Date.now() - 30 * 60 * 1000).toISOString(), checkOut: null, status: 'inside' },
  { id: 'v3', name: 'Kavitha Guest', purpose: 'Personal',  unit: 'C-303', phone: '6543210003', checkIn: new Date(Date.now() - 60 * 60 * 1000).toISOString(), checkOut: null, status: 'inside' },
];

const SEED_BLACKLIST = [
  { id: 'bl1', name: 'Unknown Person', phone: '9999900001', reason: 'Suspicious activity', addedAt: '2024-03-01', addedBy: 'Admin' },
];

const SEED_AMENITIES = [
  { id: 'am1', name: 'Swimming Pool', icon: '🏊', maxSlots: 20, slots: ['06:00-07:00','07:00-08:00','17:00-18:00','18:00-19:00'], pricePerSlot: 0, active: true },
  { id: 'am2', name: 'Gym',           icon: '💪', maxSlots: 15, slots: ['05:00-06:00','06:00-07:00','18:00-19:00','19:00-20:00'], pricePerSlot: 0, active: true },
  { id: 'am3', name: 'Club House',    icon: '🏛️', maxSlots: 50, slots: ['10:00-13:00','14:00-17:00','18:00-21:00'], pricePerSlot: 500, active: true },
  { id: 'am4', name: 'Tennis Court',  icon: '🎾', maxSlots: 4,  slots: ['06:00-07:00','07:00-08:00','17:00-18:00'], pricePerSlot: 200, active: false },
];

const SEED_AMENITY_BOOKINGS = [
  {
    id: 'BK-001', amenityId: 'AMN-001', amenityName: 'Swimming Pool', amenityEmoji: '🏊',
    residentId: 'res1', residentName: 'John Resident', unit: 'A-101',
    slot: '06:00-07:00', date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    members: 1, amount: 0, status: 'confirmed', paymentStatus: 'paid',
    otp: '482910', qrCode: 'AMENITY|BK-001|482910',
    checkedIn: false, checkedInAt: null,
    bookedAt: new Date(Date.now() - 3600000).toISOString(), paidAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'BK-002', amenityId: 'am3', amenityName: 'Club House', amenityEmoji: '🏙️',
    residentId: 'res2', residentName: 'Jane Resident', unit: 'B-202',
    slot: '18:00-21:00', date: new Date().toISOString().split('T')[0],
    members: 4, amount: 500, status: 'confirmed', paymentStatus: 'paid',
    otp: '293847', qrCode: 'AMENITY|BK-002|293847',
    checkedIn: true, checkedInAt: new Date(Date.now() - 7200000).toISOString(),
    bookedAt: new Date(Date.now() - 86400000).toISOString(), paidAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

const SEED_EV_BOOKINGS = [
  {
    id: 'EV-001', slot: 'EV-03', date: new Date().toISOString().split('T')[0],
    startTime: '10:00', endTime: '12:00',
    residentId: 'res1', residentName: 'John Resident', unit: 'A-101',
    vehicleNumber: 'TS09EV1001', vehicleType: 'Car',
    depositAmount: 200, ratePerUnit: 12, unitsConsumed: null, totalBill: null,
    status: 'active', paymentStatus: 'paid',
    otp: '739210', qrCode: 'EV|EV-001|739210',
    checkedIn: true, checkedInAt: new Date(Date.now() - 3600000).toISOString(),
    bookedAt: new Date(Date.now() - 7200000).toISOString(), paidAt: new Date(Date.now() - 7200000).toISOString(),
  },
];

const SEED_EV_LOGS = [
  {
    id: 'EL-001', bookingId: 'EV-001', slot: 'EV-03',
    vehicleNumber: 'TS09EV1001',
    residentName: 'John Resident', unit: 'A-101',
    action: 'CHECK_IN', verifiedBy: 'sec1', verifiedByName: 'Sam Security',
    at: new Date(Date.now() - 3600000).toISOString(),
  },
];

const SEED_AMENITY_LOGS = [
  {
    id: 'AL-001', bookingId: 'BK-002', amenityName: 'Club House',
    residentName: 'Jane Resident', unit: 'B-202',
    action: 'CHECK_IN', verifiedBy: 'sec1', verifiedByName: 'Sam Security',
    at: new Date(Date.now() - 7200000).toISOString(),
  },
];

const SEED_BILLING = [
  { id: 'inv1', residentId: 'res1', residentName: 'John Resident', unit: 'A-101', month: 'April 2025',   amount: 3500, type: 'Maintenance', status: 'paid',    dueDate: '2025-04-10', paidAt: '2025-04-08' },
  { id: 'inv2', residentId: 'res2', residentName: 'Jane Resident', unit: 'B-202', month: 'April 2025',   amount: 3500, type: 'Maintenance', status: 'pending', dueDate: '2025-04-10', paidAt: null },
  { id: 'inv3', residentId: 'res3', residentName: 'Ravi Kumar',    unit: 'C-303', month: 'April 2025',   amount: 3500, type: 'Maintenance', status: 'overdue', dueDate: '2025-04-10', paidAt: null },
  { id: 'inv4', residentId: 'res1', residentName: 'John Resident', unit: 'A-101', month: 'March 2025',   amount: 3500, type: 'Maintenance', status: 'paid',    dueDate: '2025-03-10', paidAt: '2025-03-09' },
];

const SEED_EXPENSES = [
  { id: 'exp1', title: 'Elevator AMC',       category: 'Maintenance', amount: 12000, date: '2025-04-02', addedBy: 'Admin' },
  { id: 'exp2', title: 'Security Salary',    category: 'Salary',      amount: 25000, date: '2025-04-01', addedBy: 'Admin' },
  { id: 'exp3', title: 'Garden Maintenance', category: 'Maintenance', amount: 5000,  date: '2025-04-05', addedBy: 'Admin' },
];

const SEED_NOTIFICATIONS = [
  { id: 'n1', title: 'New Maintenance Request', body: 'A-101: Leaking pipe reported',   type: 'maintenance', createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), read: false },
  { id: 'n2', title: 'Overdue Invoice',         body: 'C-303 maintenance dues overdue', type: 'billing',     createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), read: false },
  { id: 'n3', title: 'Visitor Alert',           body: 'Dr. Meera entered B-202',        type: 'visitor',     createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(), read: true  },
];

const useAdminStore = create((set, get) => ({
  // ─── Profile ──────────────────────────────────────────────
  adminProfile: { id: 'admin1', name: 'Admin User', email: 'admin@bs.com', phone: '9000000001' },
  societyDetails: { name: 'BS Gated Community', totalFlats: 120, address: 'Hyderabad, Telangana', registrationNo: 'SOC-2024-001' },

  // ─── Society Configuration (Module 14) ────────────────────
  societyConfig: {
    name: 'BS Gated Community', address: 'Hyderabad, Telangana',
    regNo: 'SOC-2024-001', totalFlats: 120,
    email: 'admin@bsgated.com', phone: '9000000001',
    emergency: '100', website: 'www.bsgated.com',
    gstEnabled: true, gstNumber: '27AAAAA0000A1Z5', gstRate: 18,
    openTime: '06:00', closeTime: '22:00',
    workDays: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
    holidays: [
      { id: 'h1', name: 'Republic Day',    date: '2025-01-26' },
      { id: 'h2', name: 'Independence Day',date: '2025-08-15' },
    ],
  },

  // ─── Billing Configuration (Module 14) ───────────────────
  billingConfig: {
    flatRates: { '1 BHK':'2500','2 BHK':'3500','3 BHK':'4500','4 BHK':'6000','Duplex':'7500','Penthouse':'10000' },
    sinkingFund: 500, waterCharges: 300, parkingCharges: 500,
    parkingEnabled: true, waterMeterBased: false,
    lateFeeEnabled: true, lateFeeRate: 2, gracePeriodDays: 10,
    billingDay: 1, dueDays: 10, autoGenerate: true,
    earlyPayDiscount: 0, seniorDiscount: 0, discountEnabled: false,
  },

  // ─── Module Toggles (Module 14) ──────────────────────────
  moduleToggles: {
    visitor_management: true, blacklist: true, biometric: false, sos: true,
    maintenance: true, amenity_booking: true, ev_charging: true,
    notice_board: true, gps_tracking: false,
    billing: true, online_payment: true, expense_management: true,
    e_commerce: true, p2p_marketplace: true, real_estate: true,
    push_notifications: true, sms_notifications: true, whatsapp: false, event_management: true,
    reports: true, audit_trail: true,
  },

  // ─── Audit Logs (Module 14) ───────────────────────────────
  auditLogs: [],

  // ─── Data ─────────────────────────────────────────────────
  residents: SEED_RESIDENTS,
  vendors: SEED_VENDORS,
  amcContracts: SEED_AMC_CONTRACTS,
  guards: SEED_GUARDS,
  visitors: SEED_VISITORS,
  blacklist: SEED_BLACKLIST,
  amenities: SEED_AMENITIES,
  amenityBookings: SEED_AMENITY_BOOKINGS,
  evBookings: SEED_EV_BOOKINGS,
  amenityLogs: SEED_AMENITY_LOGS,
  evLogs: SEED_EV_LOGS,
  billing: SEED_BILLING,
  expenses: SEED_EXPENSES,
  notifications: SEED_NOTIFICATIONS,

  // ─── Refresh flags ─────────────────────────────────────────
  refreshFlags: {
    residents: false,
    visitors: false,
    maintenance: false,
    billing: false,
    amenities: false,
    reports: false,
    notifications: false,
  },

  triggerRefresh: (module) =>
    set((state) => ({
      refreshFlags: { ...state.refreshFlags, [module]: !state.refreshFlags[module] },
    })),

  // ─── Residents ─────────────────────────────────────────────
  fetchResidents: async () => {
    try {
      const { AuthApi } = require('../services/authApi');
      const data = await AuthApi.getAllResidents();
      if (data && Array.isArray(data)) {
        set({ residents: data });
      }
    } catch (error) {
      console.error('Fetch Residents Error:', error);
    }
  },

  addResident: (data) => {
    const resident = { id: `res-${Date.now()}`, ...data, joinedAt: new Date().toISOString().split('T')[0], kycStatus: 'pending', active: true };
    set((state) => ({ residents: [...state.residents, resident] }));
    get().triggerRefresh('residents');
    return resident;
  },

  updateResident: (id, updates) => {
    set((state) => ({ residents: state.residents.map(r => r.id === id ? { ...r, ...updates } : r) }));
    get().triggerRefresh('residents');
  },

  toggleResidentActive: (id) => {
    set((state) => ({ residents: state.residents.map(r => r.id === id ? { ...r, active: !r.active } : r) }));
    get().triggerRefresh('residents');
  },

  updateKycStatus: (id, status) => {
    set((state) => ({ residents: state.residents.map(r => r.id === id ? { ...r, kycStatus: status } : r) }));
    get().triggerRefresh('residents');
  },

  // ─── Blacklist ─────────────────────────────────────────────
  addToBlacklist: (data) => {
    const entry = { id: `bl-${Date.now()}`, ...data, addedAt: new Date().toISOString().split('T')[0], addedBy: 'Admin' };
    set((state) => ({ blacklist: [...state.blacklist, entry] }));
    get().triggerRefresh('visitors');
  },

  removeFromBlacklist: (id) => {
    set((state) => ({ blacklist: state.blacklist.filter(b => b.id !== id) }));
    get().triggerRefresh('visitors');
  },

  // ─── Guards ────────────────────────────────────────────────
  addGuard: (data) => {
    const guard = { id: `g-${Date.now()}`, ...data, active: true };
    set((state) => ({ guards: [...state.guards, guard] }));
    get().triggerRefresh('visitors');
  },

  toggleGuardActive: (id) => {
    set((state) => ({ guards: state.guards.map(g => g.id === id ? { ...g, active: !g.active } : g) }));
    get().triggerRefresh('visitors');
  },

  // ─── Amenities ─────────────────────────────────────────────
  addAmenity: (data) => {
    const amenity = { id: `am-${Date.now()}`, ...data, active: true };
    set((state) => ({ amenities: [...state.amenities, amenity] }));
    get().triggerRefresh('amenities');
  },

  toggleAmenityActive: (id) => {
    set((state) => ({ amenities: state.amenities.map(a => a.id === id ? { ...a, active: !a.active } : a) }));
    get().triggerRefresh('amenities');
  },

  updateBookingStatus: (id, status) => {
    set((state) => ({ amenityBookings: state.amenityBookings.map(b => b.id === id ? { ...b, status } : b) }));
    get().triggerRefresh('amenities');
  },

  /** Called by residentStore when booking is confirmed/paid */
  addAmenityBooking: (booking) => {
    set((state) => ({
      amenityBookings: state.amenityBookings.some(b => b.id === booking.id)
        ? state.amenityBookings.map(b => b.id === booking.id ? { ...b, ...booking } : b)
        : [booking, ...state.amenityBookings],
    }));
    get().triggerRefresh('amenities');
  },

  updateAmenityBookingStatus: (id, status) => {
    set((state) => ({ amenityBookings: state.amenityBookings.map(b => b.id === id ? { ...b, status } : b) }));
    get().triggerRefresh('amenities');
  },

  /** Called by securityStore when guard verifies entry at amenity */
  logAmenityEntry: (logEntry) => {
    set((state) => ({
      amenityLogs: [logEntry, ...state.amenityLogs],
      amenityBookings: state.amenityBookings.map(b =>
        b.id === logEntry.bookingId ? { ...b, checkedIn: true, checkedInAt: logEntry.at } : b
      ),
    }));
    get().triggerRefresh('amenities');
  },

  // ─── EV Bookings ────────────────────────────────────────────
  addEVBooking: (booking) => {
    set((state) => ({
      evBookings: state.evBookings.some(b => b.id === booking.id)
        ? state.evBookings.map(b => b.id === booking.id ? { ...b, ...booking } : b)
        : [booking, ...state.evBookings],
    }));
    get().triggerRefresh('amenities');
  },

  updateEVBooking: (id, updates) => {
    set((state) => ({ evBookings: state.evBookings.map(b => b.id === id ? { ...b, ...updates } : b) }));
    get().triggerRefresh('amenities');
  },

  /** Called by securityStore when guard verifies EV OTP/QR */
  logEVEntry: (logEntry) => {
    set((state) => ({
      evLogs: [logEntry, ...state.evLogs],
      evBookings: state.evBookings.map(b =>
        b.id === logEntry.bookingId ? { ...b, checkedIn: true, checkedInAt: logEntry.at, status: 'active' } : b
      ),
    }));
    get().triggerRefresh('amenities');
  },


  // ─── Billing ───────────────────────────────────────────────
  generateInvoices: (month, amount, type) => {
    const { residents } = get();
    const newInvoices = residents.filter(r => r.active).map(r => ({
      id: `inv-${Date.now()}-${r.id}`,
      residentId: r.id,
      residentName: r.name,
      unit: r.unit,
      month,
      amount,
      type,
      status: 'pending',
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      paidAt: null,
    }));
    set((state) => ({ billing: [...state.billing, ...newInvoices] }));
    get().triggerRefresh('billing');
    return newInvoices.length;
  },

  markInvoicePaid: (id) => {
    set((state) => ({
      billing: state.billing.map(b => b.id === id ? { ...b, status: 'paid', paidAt: new Date().toISOString() } : b),
    }));
    get().triggerRefresh('billing');
  },

  // Called by appStore when admin requests payment from resident for maintenance work
  // This makes the maintenance payment appear in the admin's billing dashboard for tracking
  addMaintenancePaymentRequest: (data) => {
    set((state) => ({
      // avoid duplicates — replace if same id already exists
      billing: state.billing.some(b => b.id === data.id)
        ? state.billing.map(b => b.id === data.id ? { ...b, ...data } : b)
        : [data, ...state.billing],
    }));
    get().triggerRefresh('billing');
  },

  addExpense: (data) => {
    const expense = { id: `exp-${Date.now()}`, ...data, date: new Date().toISOString().split('T')[0], addedBy: 'Admin' };
    set((state) => ({ expenses: [...state.expenses, expense] }));
    get().triggerRefresh('billing');
  },


  // ─── Society Config ────────────────────────────────────────
  updateSocietyConfig: (updates) => {
    set(s => ({ societyConfig: { ...s.societyConfig, ...updates } }));
  },

  // ─── Billing Config ─────────────────────────────────────────
  updateBillingConfig: (updates) => {
    set(s => ({ billingConfig: { ...s.billingConfig, ...updates } }));
  },

  // ─── Module Toggles ──────────────────────────────────────────
  updateModuleToggle: (key, value) => {
    set(s => ({ moduleToggles: { ...s.moduleToggles, [key]: value } }));
  },

  // ─── Vendor actions (extended) ──────────────────────────────
  updateVendor: (id, updates) => {
    set(s => ({ vendors: (s.vendors || []).map(v => v.id === id ? { ...v, ...updates } : v) }));
  },

  addVendor: (data) => {
    const vendor = { id: `v-${Date.now()}`, ...data };
    set(s => ({ vendors: [...(s.vendors || []), vendor] }));
  },

  // ─── AMC / Contract Actions ──────────────────────────────────
  // Called from vendor side to propose a new contract
  proposeAMCContract: (data) => {
    const now = new Date().toISOString();
    const contract = {
      id: `AMC-${Date.now()}`,
      ...data,
      status: 'proposed',
      proposedAt: now,
      approvedAt: null,
      adminRemark: '',
      vendorCounter: '',
      renewalReminderSent: false,
      paidInstallments: 0,
      timeline: [{ action: `${data.type === 'AMC' ? 'AMC' : 'Project'} Proposed by Vendor`, at: now }],
    };
    set(s => ({ amcContracts: [contract, ...(s.amcContracts || [])] }));
    return contract;
  },

  // Admin → approves
  approveAMCContract: (id, remark = '') => {
    const now = new Date().toISOString();
    set(s => ({
      amcContracts: (s.amcContracts || []).map(c =>
        c.id !== id ? c : {
          ...c,
          status: 'active',
          approvedAt: now,
          adminRemark: remark,
          timeline: [...c.timeline, { action: 'Admin Approved', at: now }, { action: 'Contract Active', at: now }],
        }
      ),
    }));
  },

  // Admin → sends back for negotiation with a counter remark
  negotiateAMCContract: (id, adminRemark) => {
    const now = new Date().toISOString();
    set(s => ({
      amcContracts: (s.amcContracts || []).map(c =>
        c.id !== id ? c : {
          ...c,
          status: 'negotiation',
          adminRemark,
          timeline: [...c.timeline, { action: 'Admin sent for Negotiation', at: now }],
        }
      ),
    }));
  },

  // Admin → rejects
  rejectAMCContract: (id, remark = '') => {
    const now = new Date().toISOString();
    set(s => ({
      amcContracts: (s.amcContracts || []).map(c =>
        c.id !== id ? c : {
          ...c,
          status: 'rejected',
          adminRemark: remark,
          timeline: [...c.timeline, { action: `Admin Rejected: ${remark}`, at: now }],
        }
      ),
    }));
  },

  // Admin → marks a payment installment as received
  recordAMCPayment: (id) => {
    const now = new Date().toISOString();
    set(s => ({
      amcContracts: (s.amcContracts || []).map(c => {
        if (c.id !== id) return c;
        const paid = (c.paidInstallments || 0) + 1;
        const done = paid >= c.totalInstallments;
        return {
          ...c,
          paidInstallments: paid,
          status: done ? 'completed' : 'active',
          timeline: [...c.timeline, {
            action: done ? `Final Payment Received — Contract Completed` : `Installment ${paid}/${c.totalInstallments} Payment Received`,
            at: now,
          }],
        };
      }),
    }));
  },

  // Admin → renews an expired/completed contract
  renewAMCContract: (id, newEndDate) => {
    const now = new Date().toISOString();
    set(s => ({
      amcContracts: (s.amcContracts || []).map(c =>
        c.id !== id ? c : {
          ...c,
          status: 'active',
          startDate: c.endDate,
          endDate: newEndDate,
          paidInstallments: 0,
          renewalReminderSent: false,
          timeline: [...c.timeline, { action: `Contract Renewed until ${newEndDate}`, at: now }],
        }
      ),
    }));
  },

  // Vendor → sends a counter-proposal during negotiation
  vendorCounterAMC: (id, counterText) => {
    const now = new Date().toISOString();
    set(s => ({
      amcContracts: (s.amcContracts || []).map(c =>
        c.id !== id ? c : {
          ...c,
          vendorCounter: counterText,
          timeline: [...c.timeline, { action: `Vendor Counter: ${counterText}`, at: now }],
        }
      ),
    }));
  },

  // ─── Audit Logs ─────────────────────────────────────────────
  addAuditLog: (entry) => {
    const log = {
      id: `al-${Date.now()}`,
      userId:   entry.userId   || 'admin1',
      userName: entry.userName || 'Admin User',
      action:   entry.action   || 'VIEW',
      module:   entry.module   || 'General',
      detail:   entry.detail   || '',
      at:       new Date().toISOString(),
    };
    set(s => ({ auditLogs: [log, ...(s.auditLogs || [])].slice(0, 500) })); // keep last 500
  },

  // ─── Notifications ─────────────────────────────────────────
  markNotificationRead: (id) => {
    set((state) => ({ notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n) }));
  },

  markAllNotificationsRead: () => {
    set((state) => ({ notifications: state.notifications.map(n => ({ ...n, read: true })) }));
  },

  addNotification: (data) => {
    const notif = { id: `n-${Date.now()}`, ...data, createdAt: new Date().toISOString(), read: false };
    set((state) => ({ notifications: [notif, ...state.notifications] }));
    get().triggerRefresh('notifications');
  },
}));

export default useAdminStore;
