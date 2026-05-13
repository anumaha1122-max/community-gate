/**
 * appStore.js — REPLACES useStore.js
 *
 * ❌ REMOVED from useStore.js:
 *   - Auth/login/logout/users (→ AuthStore.js)
 *   - visitors (→ securityStore.js)
 *   - builderRequests (→ stays in useStore shim during migration, then here)
 *
 * ✅ OWNS:
 *   - maintenanceRequests    (full 12-state lifecycle)
 *   - marketplaceProducts    (vendor e-commerce)
 *   - marketplaceOrders      (vendor e-commerce orders)
 *   - cart                   (resident shopping cart)
 *   - p2pListings            (resident P2P sell/buy used items)
 *   - p2pMessages            (basic chat per listing)
 *   - realEstateListings     (flats for sale/rent)
 *   - builderRequests        (super admin approval flow)
 *   - announcements          (admin notices)
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Lazy imports to avoid circular deps — called only at runtime
const getResidentStore = () => require('./residentStore').default;
const getAdminStore = () => require('./adminStore').default;
const getVendorStore = () => require('./vendorStore').default;
const getSecurityStore = () => require('./securityStore').default;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const now = () => new Date().toISOString();
const uid = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
const mapMaintenance = (r) => ({
  ...r,
  residentId: r.resident?.id,
  residentName: r.resident?.name,
  unit: r.resident?.unit,
  assignedVendorId: r.assignedVendor?.id,
  assignedVendorName: r.assignedVendor?.name,
  _workStep: r.workStep,
  quote: r.quote ? {
    id: r.quote.id,
    amount: r.quote.amount,
    description: r.quote.description,
    eta: r.quote.eta,
    estimatedDays: r.quote.estimatedDays
  } : null
});

// ─── Seed: Marketplace Products ───────────────────────────────────────────────
const SEED_PRODUCTS = [
  { id: 'p1', name: 'Basmati Rice 1kg', price: 120, stock: 330, emoji: '🍚', active: true, category: 'Rice & Grains', desc: 'Premium long grain Basmati rice, aged 2 years.' },
  { id: 'p2', name: 'Sunflower Oil 1L', price: 150, stock: 250, emoji: '🫙', active: true, category: 'Oils & Ghee', desc: 'Cold-pressed sunflower oil, 100% pure.' },
  { id: 'p3', name: 'Toor Dal 1kg', price: 110, stock: 3, emoji: '🫘', active: true, category: 'Lentils & Pulses', desc: 'High-protein split pigeon peas.' },
  { id: 'p4', name: 'Wheat Flour 1kg', price: 40, stock: 180, emoji: '🌾', active: true, category: 'Flour & Atta', desc: 'Whole wheat atta, freshly milled.' },
  { id: 'p5', name: 'Sugar 1kg', price: 45, stock: 0, emoji: '🍬', active: false, category: 'Sugar & Salt', desc: 'Fine white sugar.' },
  { id: 'p6', name: 'Salt 1kg', price: 20, stock: 220, emoji: '🧂', active: true, category: 'Sugar & Salt', desc: 'Iodized table salt.' },
  { id: 'p7', name: 'Amul Butter 500g', price: 290, stock: 80, emoji: '🧈', active: true, category: 'Dairy', desc: 'Fresh pasteurized butter.' },
  { id: 'p8', name: 'Full Cream Milk 1L', price: 68, stock: 150, emoji: '🥛', active: true, category: 'Dairy', desc: 'Fresh full cream milk, homogenized.' },
];

// ─── Seed: Marketplace Orders ─────────────────────────────────────────────────
const SEED_ORDERS = [
  {
    id: 'ORD12342',
    residentId: 'res1',
    residentName: 'John Resident',
    unit: 'A-101',
    items: [
      { productId: 'p1', name: 'Basmati Rice 1kg', price: 120, qty: 2, emoji: '🍚' },
      { productId: 'p4', name: 'Wheat Flour 1kg', price: 40, qty: 1, emoji: '🌾' },
    ],
    subtotal: 280, deliveryCharge: 20, total: 300,
    status: 'delivered',
    otp: null, otpVerified: true,
    placedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    deliveredAt: new Date(Date.now() - 86400000).toISOString(),
    deliveryPartnerId: 'dp1', deliveryPartnerName: 'Rajesh Kumar',
    timeline: [
      { action: 'Order Placed', at: new Date(Date.now() - 2 * 86400000).toISOString() },
      { action: 'Order Confirmed', at: new Date(Date.now() - 2 * 86400000 + 300000).toISOString() },
      { action: 'Out for Delivery', at: new Date(Date.now() - 86400000).toISOString() },
      { action: 'Delivered', at: new Date(Date.now() - 86400000 + 1800000).toISOString() },
    ],
  },
  {
    // 🔴 DEMO: Delivery partner at gate — guard must verify OTP '482916' to allow entry
    id: 'ORD99901',
    residentId: 'res2',
    residentName: 'Jane Resident',
    unit: 'B-202',
    items: [
      { productId: 'p7', name: 'Amul Butter 500g', price: 290, qty: 1, emoji: '🧈' },
      { productId: 'p8', name: 'Full Cream Milk 1L', price: 68, qty: 2, emoji: '🥛' },
    ],
    subtotal: 426, deliveryCharge: 20, total: 446,
    status: 'assigned_delivery',          // ← guard must verify OTP to let partner in
    otp: '482916', otpVerified: false,
    placedAt: new Date(Date.now() - 3600000).toISOString(),
    deliveredAt: null,
    deliveryPartnerId: 'dp2', deliveryPartnerName: 'Suresh Singh',
    timeline: [
      { action: 'Order Placed', at: new Date(Date.now() - 3600000).toISOString() },
      { action: 'Order Confirmed by Vendor', at: new Date(Date.now() - 3000000).toISOString() },
      { action: 'Delivery assigned to Suresh Singh', at: new Date(Date.now() - 1800000).toISOString() },
    ],
  },
];

// ─── Seed: Users ─────────────────────────────────────────────────────────────
const SEED_USERS = [
  { id: 'res1', name: 'John Resident', role: 'resident', unit: 'A-101', phone: '9876543210', approvalStatus: 'approved' },
  { id: 'res2', name: 'Jane Resident', role: 'resident', unit: 'B-202', phone: '9876543211', approvalStatus: 'approved' },
  { id: 'res3', name: 'Ravi Kumar', role: 'resident', unit: 'C-303', phone: '9876543212', approvalStatus: 'approved' },
  { id: 'admin1', name: 'Admin User', role: 'admin', phone: '9000000001', approvalStatus: 'approved' },
  { id: 'ven1', name: 'Bob Vendor', role: 'vendor', phone: '8765432100', company: 'Fix-It Pro', approvalStatus: 'approved' },
  { id: 'sec1', name: 'Sam Security', role: 'security', phone: '7654321000', approvalStatus: 'approved' },
  { id: 'superadmin1', name: 'Super Admin', role: 'superadmin', phone: '9000000000', approvalStatus: 'approved' },
];

// ─── Seed: Maintenance ────────────────────────────────────────────────────────
const SEED_MAINTENANCE = [
  {
    id: 'MR-001',
    residentId: 'res1', residentName: 'John Resident', unit: 'A-101',
    category: 'Plumbing', title: 'Leaking pipe under kitchen sink',
    description: 'Water is dripping from the joint under the kitchen sink. Needs urgent repair.',
    priority: 'High',
    status: 'submitted',
    assignedVendorId: null, assignedVendorName: null,
    invitedVendorIds: [],
    quote: null,
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    timeline: [
      { action: 'Request Submitted by Resident', by: 'John Resident', at: new Date(Date.now() - 2 * 86400000).toISOString() },
    ],
  },
  {
    id: 'MR-002',
    residentId: 'res2', residentName: 'Jane Resident', unit: 'B-202',
    category: 'Electrical', title: 'Ceiling fan not working in bedroom',
    description: 'Bedroom ceiling fan stopped working suddenly.',
    priority: 'Medium', status: 'work_in_progress',
    assignedVendorId: 'ven1', assignedVendorName: 'Bob Vendor',
    quote: { amount: 1800, description: 'Fan motor replacement + wiring check', estimatedDays: 1 },
    _workStep: 3,
    pendingStepApproval: true,   // ← Stage 3 submitted by vendor, needs admin/resident approval
    pendingStep: 3,
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    timeline: [
      { action: 'Request Submitted by Resident', by: 'Jane Resident', at: new Date(Date.now() - 5 * 86400000).toISOString() },
      { action: 'Quote request sent to: Bob Vendor', by: 'Admin', at: new Date(Date.now() - 4 * 86400000).toISOString() },
      { action: 'Quote ₹1800 submitted by vendor', by: 'Bob Vendor', at: new Date(Date.now() - 3 * 86400000).toISOString() },
      { action: 'Quote Forwarded to Resident by Admin', by: 'Admin', at: new Date(Date.now() - 3 * 86400000 + 3600000).toISOString() },
      { action: 'Quote Accepted by Resident', by: 'Jane Resident', at: new Date(Date.now() - 2 * 86400000).toISOString() },
      { action: 'Work Start Approved by Admin — Gate OTP Generated', by: 'Admin', at: new Date(Date.now() - 86400000).toISOString() },
      { action: 'Gate OTP Verified — Vendor Entered', by: 'Guard', at: new Date(Date.now() - 86400000 + 3600000).toISOString() },
      { action: 'Stage 1: Work Initiated', by: 'Bob Vendor', at: new Date(Date.now() - 86400000 + 7200000).toISOString() },
      { action: 'Stage 1 approved by Admin', by: 'Admin', at: new Date(Date.now() - 86400000 + 9000000).toISOString() },
      { action: 'Stage 2: Site Visit Done', by: 'Bob Vendor', at: new Date(Date.now() - 86400000 + 10800000).toISOString() },
      { action: 'Stage 2 approved by Admin', by: 'Admin', at: new Date(Date.now() - 86400000 + 12600000).toISOString() },
      { action: 'Stage 3: Material Planning', by: 'Bob Vendor', at: new Date(Date.now() - 3600000).toISOString() },
      { action: 'Stage 4 "Material Approved" submitted for approval', by: 'Bob Vendor', at: new Date(Date.now() - 1800000).toISOString() },
    ],
  },
  {
    id: 'MR-003',
    residentId: 'res1', residentName: 'John Resident', unit: 'A-101',
    category: 'Painting', title: 'Living room wall painting — full coat',
    description: 'Full living room repaint needed. Two coats required.',
    priority: 'Low',
    status: 'submitted',
    assignedVendorId: null, assignedVendorName: null,
    invitedVendorIds: [],
    quote: null,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    timeline: [{ action: 'Request Submitted by Resident', by: 'John Resident', at: new Date(Date.now() - 86400000).toISOString() }],
  },
  {
    id: 'MR-004',
    residentId: 'res3', residentName: 'Ravi Kumar', unit: 'C-303',
    category: 'HVAC', title: 'AC not cooling — full service',
    description: 'Air conditioner making noise and not cooling. Full service needed.',
    priority: 'High', status: 'payment_requested_to_admin',
    assignedVendorId: 'ven1', assignedVendorName: 'Bob Vendor',
    quote: { amount: 3500, description: 'Full AC service + gas refill', estimatedDays: 2 },
    _workStep: 12,
    workCompletedAt: new Date(Date.now() - 3600000).toISOString(),
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    timeline: [
      { action: 'Request Submitted by Resident', by: 'Ravi Kumar', at: new Date(Date.now() - 7 * 86400000).toISOString() },
      { action: 'Quote request sent to: Bob Vendor', by: 'Admin', at: new Date(Date.now() - 6 * 86400000).toISOString() },
      { action: 'Quote ₹3500 submitted by vendor', by: 'Bob Vendor', at: new Date(Date.now() - 5 * 86400000).toISOString() },
      { action: 'Quote Forwarded to Resident by Admin', by: 'Admin', at: new Date(Date.now() - 5 * 86400000 + 3600000).toISOString() },
      { action: 'Quote Accepted by Resident', by: 'Ravi Kumar', at: new Date(Date.now() - 4 * 86400000).toISOString() },
      { action: 'Work Start Approved by Admin — Gate OTP Generated', by: 'Admin', at: new Date(Date.now() - 3 * 86400000).toISOString() },
      { action: 'Gate OTP Verified — Vendor Entered', by: 'Guard', at: new Date(Date.now() - 3 * 86400000 + 3600000).toISOString() },
      { action: 'All 12 Stages Complete — Work Done', by: 'Vendor', at: new Date(Date.now() - 86400000).toISOString() },
      { action: 'Payment Requested to Admin', by: 'Vendor', at: new Date(Date.now() - 3600000).toISOString() },
    ],
  },
];

// ─── Seed: P2P Listings ───────────────────────────────────────────────────────
const SEED_P2P = [
  {
    id: 'P2P-001',
    sellerId: 'res2', sellerName: 'Jane Resident', sellerUnit: 'B-202',
    title: 'Samsung 32" LED TV', category: 'Electronics',
    description: 'Good condition, 2 years old. No issues. Remote included.',
    price: 8500, negotiable: true,
    images: [],
    status: 'ACTIVE',             // PENDING_APPROVAL|ACTIVE|SOLD|EXPIRED|REJECTED
    adminApprovedAt: new Date(Date.now() - 86400000).toISOString(),
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    expiresAt: new Date(Date.now() + 28 * 86400000).toISOString(),
    interestedCount: 2,
  },
  {
    id: 'P2P-002',
    sellerId: 'res1', sellerName: 'John Resident', sellerUnit: 'A-101',
    title: 'Wooden Study Table', category: 'Furniture',
    description: 'Sturdy wooden table with drawer. 3 years old.',
    price: 3200, negotiable: false,
    images: [],
    status: 'PENDING_APPROVAL',
    adminApprovedAt: null,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    expiresAt: null,
    interestedCount: 0,
  },
];

// ─── Seed: P2P Messages ───────────────────────────────────────────────────────
const SEED_P2P_MESSAGES = [
  {
    id: 'MSG-001',
    listingId: 'P2P-001',
    senderId: 'res3', senderName: 'Ravi Kumar',
    message: 'Is the TV still available? Can I come see it?',
    sentAt: new Date(Date.now() - 3600000).toISOString(),
  },
];

// ─── Seed: Real Estate ────────────────────────────────────────────────────────
const SEED_REAL_ESTATE = [
  {
    id: 'RE-001',
    type: 'SALE',                  // SALE|RENT
    ownerId: 'res1', ownerName: 'John Resident', ownerPhone: '9876543210',
    unit: 'A-203',
    title: '2BHK Flat for Sale in Tower A',
    description: 'Well-maintained 2BHK on 3rd floor. East-facing. Two parking slots.',
    price: 7500000, priceLabel: '₹75 Lakhs',
    area: 1100, areaUnit: 'sqft',
    bedrooms: 2, bathrooms: 2,
    furnished: 'Semi-furnished',
    availability: 'Immediate',
    images: [],
    amenities: ['Gym', 'Swimming Pool', 'Covered Parking'],
    status: 'ACTIVE',              // PENDING_APPROVAL|ACTIVE|UNDER_NEGOTIATION|SOLD|RENTED|EXPIRED
    adminApprovedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    views: 18,
    inquiryCount: 3,
  },
  {
    id: 'RE-002',
    type: 'RENT',
    ownerId: 'res2', ownerName: 'Jane Resident', ownerPhone: '9876543211',
    unit: 'B-104',
    title: '1BHK for Rent — Available Immediately',
    description: 'Fully furnished 1BHK. Ideal for working professionals.',
    price: 18000, priceLabel: '₹18,000/month',
    area: 650, areaUnit: 'sqft',
    bedrooms: 1, bathrooms: 1,
    furnished: 'Fully-furnished',
    availability: 'Immediate',
    images: [],
    amenities: ['Gym', 'Security'],
    status: 'PENDING_APPROVAL',
    adminApprovedAt: null,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    views: 0,
    inquiryCount: 0,
  },
];

// ─── Seed: Announcements ──────────────────────────────────────────────────────
const SEED_ANNOUNCEMENTS = [
  {
    id: 'ANN-001',
    title: 'Water Supply Interruption',
    body: 'Water supply will be interrupted on Sunday 10am–2pm for tank cleaning.',
    type: 'notice',               // notice|payment_reminder|emergency|event
    targetRole: 'all',            // all|resident|vendor|guard
    postedBy: 'admin1',
    postedByName: 'Admin User',
    postedAt: new Date(Date.now() - 86400000).toISOString(),
    expiresAt: new Date(Date.now() + 3 * 86400000).toISOString(),
    pinned: true,
  },
  {
    id: 'ANN-002',
    title: 'April Maintenance Due',
    body: 'April 2025 maintenance charges are due by April 30th. Please pay online.',
    type: 'payment_reminder',
    targetRole: 'resident',
    postedBy: 'admin1',
    postedByName: 'Admin User',
    postedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
    pinned: false,
  },
  {
    id: 'ANN-003',
    title: 'Diwali Community Celebration 🎇',
    body: 'Join us for a grand Diwali celebration at the clubhouse! Rangoli competition, cultural performances, and dinner for all residents.',
    type: 'event',
    targetRole: 'all',
    postedBy: 'admin1',
    postedByName: 'Admin User',
    postedAt: new Date(Date.now() - 86400000).toISOString(),
    expiresAt: new Date(Date.now() + 14 * 86400000).toISOString(),
    pinned: true,
    eventDate: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
    eventTime: '6:00 PM',
    eventVenue: 'Clubhouse & Community Garden',
    rsvpEnabled: true,
    rsvpCount: 42,
  },
  {
    id: 'ANN-004',
    title: 'Gym Closed for Maintenance',
    body: 'The gymnasium will be closed on this Saturday 9am-5pm for annual equipment servicing. We apologize for the inconvenience.',
    type: 'notice',
    targetRole: 'resident',
    postedBy: 'admin1',
    postedByName: 'Admin User',
    postedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    expiresAt: new Date(Date.now() + 5 * 86400000).toISOString(),
    pinned: false,
  },
];

// ─── Seed: Builder Requests ───────────────────────────────────────────────────
const SEED_BUILDER_REQUESTS = [
  {
    id: 'BLD-DEMO-001',
    companyName: 'Sunrise Developers',
    reraNumber: 'AP/2023/0042',
    gst: '36AADCS1234B1ZX',
    email: 'sunrise@dev.com',
    phone: '9988001122',
    city: 'Hyderabad',
    status: 'pending',
    submittedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    reviewedAt: null,
    remark: null,
    documents: { incorporation: 'incorporation.pdf', bank: 'bank.pdf', reraLetter: 'rera.pdf', directorId: 'id.pdf' },
  },
];

// ─── Seed: Admin Requests ─────────────────────────────────────────────────────
const SEED_ADMIN_REQUESTS = [
  {
    id: 'ADM-DEMO-001',
    name: 'Priya Sharma',
    email: 'priya@society.com',
    phone: '9876500001',
    society: 'Green Valley Phase 2',
    status: 'pending',
    submittedAt: new Date(Date.now() - 86400000).toISOString(),
    reviewedAt: null,
    remark: null,
  },
];

// ─── Seed: Customers ──────────────────────────────────────────────────────────
const SEED_CUSTOMERS = [];

// ─── Seed: Projects ───────────────────────────────────────────────────────────
const SEED_PROJECTS = [
  {
    id: 'PRJ-DEMO-001',
    builderId: 'BLD-DEMO-001',
    builderName: 'Sunrise Developers',
    name: 'Sunrise Heights',
    location: 'Gachibowli, Hyderabad',
    reraNumber: 'AP/PRJ/2023/0042',
    description: 'Premium residential towers with world-class amenities.',
    totalUnits: 120,
    towers: [
      { id: 'T1', name: 'Tower A', floors: 12, unitsPerFloor: 5 },
      { id: 'T2', name: 'Tower B', floors: 12, unitsPerFloor: 5 },
    ],
    amenities: ['Swimming Pool', 'Gymnasium', 'Clubhouse', 'Children Play Area'],
    possessionDate: '2026-12-31',
    status: 'active',
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    constructionProgress: 35,
    milestones: [
      { id: 'M1', title: 'Foundation Complete', targetDate: '2024-06-01', completedAt: '2024-06-15', status: 'completed', progressPct: 10 },
      { id: 'M2', title: 'Plinth Level', targetDate: '2024-09-01', completedAt: '2024-09-20', status: 'completed', progressPct: 20 },
      { id: 'M3', title: 'Slab Work — Floor 1–4', targetDate: '2025-01-01', completedAt: '2025-02-01', status: 'completed', progressPct: 35 },
      { id: 'M4', title: 'Slab Work — Floor 5–8', targetDate: '2025-06-01', completedAt: null, status: 'in_progress', progressPct: 55 },
      { id: 'M5', title: 'Finishing & Interiors', targetDate: '2026-06-01', completedAt: null, status: 'pending', progressPct: 80 },
      { id: 'M6', title: 'Handover Ready', targetDate: '2026-12-01', completedAt: null, status: 'pending', progressPct: 100 },
    ],
  },
];

// ─── Seed: Units ──────────────────────────────────────────────────────────────
const SEED_UNITS = (() => {
  const units = [];
  const configs = [
    { bhk: '2BHK', size: 1050, basePrice: 6500000 },
    { bhk: '3BHK', size: 1450, basePrice: 8900000 },
    { bhk: '4BHK', size: 2100, basePrice: 13500000 },
  ];
  const facings = ['East', 'West', 'North', 'South'];
  ['T1', 'T2'].forEach((towerId, ti) => {
    for (let floor = 1; floor <= 12; floor++) {
      for (let pos = 1; pos <= 5; pos++) {
        const cfg = configs[(pos - 1) % configs.length];
        units.push({
          id: `U-${towerId}-${floor}-${pos}`,
          projectId: 'PRJ-DEMO-001',
          towerId,
          towerName: towerId === 'T1' ? 'Tower A' : 'Tower B',
          floor,
          unitNumber: `${towerId === 'T1' ? 'A' : 'B'}-${floor}0${pos}`,
          bhk: cfg.bhk,
          size: cfg.size,
          facing: facings[(pos + floor) % 4],
          price: cfg.basePrice + floor * 50000,
          status: (ti === 0 && floor <= 3 && pos <= 2) ? 'booked' : 'available',
          bookingId: null,
        });
      }
    }
  });
  return units;
})();

// ─── Seed: Bookings ───────────────────────────────────────────────────────────
const SEED_BOOKINGS = [];

// ─── Seed: Franchises ─────────────────────────────────────────────────────────
const SEED_FRANCHISES = [];

// ─── Store ────────────────────────────────────────────────────────────────────
const useAppStore = create(
  persist(
    (set, get) => ({

      // ── Users (read-only seed; auth is in AuthStore) ────────────────────────
      users: SEED_USERS,

      // ── Maintenance ────────────────────────────────────────────────────────
      // Status flow: submitted → assigned → quoted → quote_sent_to_resident
      //   → quote_accepted → work_in_progress → work_completed
      //   → payment_requested_to_admin → payment_requested_to_resident
      //   → payment_received → paid_to_vendor
      maintenanceRequests: SEED_MAINTENANCE,

      fetchMaintenance: async (role, id) => {
        try {
          const { MaintenanceApi } = require('../services/maintenanceApi');
          let data = [];
          if (role === 'resident') data = await MaintenanceApi.getRequestsByResident(id);
          else if (role === 'vendor') data = await MaintenanceApi.getRequestsByVendor(id);
          else data = await MaintenanceApi.getAllRequests();

          if (data && Array.isArray(data)) {
            const mapped = data.map(mapMaintenance);
            set({ maintenanceRequests: mapped });
          }
        } catch (error) { console.error('Fetch Maintenance Error:', error); }
      },

      addMaintenanceRequest: async (data) => {
        try {
          const { MaintenanceApi } = require('../services/maintenanceApi');
          const savedReq = await MaintenanceApi.submitRequest({
            residentId: data.residentId,
            title: data.title,
            description: data.description,
            category: data.category,
            priority: data.priority,
            preferredSlot: data.preferredSlot,
            contactPref: data.contactPref
          });
          if (savedReq && savedReq.id) {
            set(s => ({
              maintenanceRequests: [mapMaintenance(savedReq), ...s.maintenanceRequests]
            }));
            return savedReq;
          }
        } catch (error) {
          console.error('Submit Request Error:', error);
          const req = { id: uid('MR'), ...data, status: 'submitted', createdAt: now() };
          set(s => ({ maintenanceRequests: [req, ...s.maintenanceRequests] }));
          return req;
        }
      },

      updateMaintenanceStatus: (id, status, extra = {}) =>
        set(s => ({
          maintenanceRequests: s.maintenanceRequests.map(r =>
            r.id === id
              ? {
                ...r, status, ...extra,
                timeline: [...r.timeline, { action: `Status → ${status}`, by: extra.by || 'System', at: now() }],
              }
              : r
          ),
        })),

      assignMaintenanceVendor: (requestId, vendorId, vendorName) =>
        set(s => ({
          maintenanceRequests: s.maintenanceRequests.map(r =>
            r.id === requestId
              ? {
                ...r,
                status: 'assigned',
                assignedVendorId: vendorId,
                assignedVendorName: vendorName,
                timeline: [...r.timeline, { action: `Assigned to ${vendorName}`, by: 'Admin', at: now() }],
              }
              : r
          ),
        })),

      // Alias used by AdminMaintenance.js
      assignVendorToRequest: async (requestId, vendorId, vendorName) => {
        try {
          const { MaintenanceApi } = require('../services/maintenanceApi');
          const updatedReq = await MaintenanceApi.assignVendor(requestId, vendorId);
          if (updatedReq) {
            set(s => ({
              maintenanceRequests: s.maintenanceRequests.map(r => r.id === requestId ? mapMaintenance(updatedReq) : r),
            }));

            // 🔔 Notify vendor
            try {
              getVendorStore().getState().addNotification({
                type: 'new_request',
                title: '📋 New Maintenance Request Assigned',
                body: `You have been assigned a ${updatedReq.priority || ''} priority ${updatedReq.category || ''} job for Unit ${updatedReq.resident?.unit || ''}. Please review and send a quote.`,
                requestId,
              });
            } catch (e) { /* ignore */ }
          }
        } catch (error) {
          console.error('Assign Vendor Error:', error);
        }
      },

      // Admin sends quote request to multiple vendors — they each see it and can bid
      adminSendQuoteRequest: (requestId, vendorList) => {
        // vendorList = [{ id, name }, ...]
        const req = get().maintenanceRequests.find(r => r.id === requestId);
        set(s => ({
          maintenanceRequests: s.maintenanceRequests.map(r =>
            r.id === requestId
              ? {
                ...r,
                status: 'quote_requested',
                invitedVendorIds: vendorList.map(v => v.id),
                timeline: [
                  ...r.timeline,
                  { action: `Quote request sent to: ${vendorList.map(v => v.name).join(', ')}`, by: 'Admin', at: now() },
                ],
              }
              : r
          ),
        }));
        // 🔔 Notify every selected vendor
        vendorList.forEach(v => {
          try {
            getVendorStore().getState().addNotification({
              type: 'new_request',
              title: '📋 Quote Request — Please Bid',
              body: `Admin is requesting a quote for a ${req?.priority || ''} priority ${req?.category || ''} job at Unit ${req?.unit || ''}: "${req?.title || ''}". Submit your quote ASAP.`,
              requestId,
            });
          } catch (e) { /* ignore */ }
        });
      },

      submitVendorQuote: (requestId, quote, vendorId) =>
        set(s => ({
          maintenanceRequests: s.maintenanceRequests.map(r =>
            r.id === requestId
              ? {
                ...r,
                status: 'quote_sent_to_resident',
                quote,
                timeline: [...r.timeline, { action: `Quote ₹${quote.amount} submitted`, by: vendorId, at: now() }],
              }
              : r
          ),
        })),

      // Alias used by vendor SendQuoteScreen — sets status to 'quoted' (admin must then forward)
      submitQuote: async (requestId, quote) => {
        try {
          const { MaintenanceApi } = require('../services/maintenanceApi');
          const authUser = require('./AuthStore').useAuthStore.getState().user;

          const updatedReq = await MaintenanceApi.submitQuote(requestId, {
            ...quote,
            vendorId: authUser?.id
          });

          if (updatedReq) {
            set(s => ({
              maintenanceRequests: s.maintenanceRequests.map(r => r.id === requestId ? mapMaintenance(updatedReq) : r),
            }));

            // 🔔 Notify admin — quote is waiting for review
            try {
              getAdminStore().getState().addNotification({
                type: 'maintenance',
                title: '💰 Vendor Quote Received',
                body: `${updatedReq.assignedVendor?.name || 'Vendor'} submitted a ₹${quote.amount} quote for Unit ${updatedReq.resident?.unit || ''} (${updatedReq.category || ''}). Please review and forward to resident.`,
                requestId,
              });
            } catch (e) { /* ignore */ }
          }
        } catch (error) {
          console.error('Submit Quote Error:', error);
        }
      },

      // Vendor marks work as completed → status: work_completed
      vendorMarkWorkComplete: async (requestId) => {
        try {
          const { MaintenanceApi } = require('../services/maintenanceApi');
          // Move directly to completed
          const updatedReq = await MaintenanceApi.vendorCompleteStep(requestId, 12);
          if (updatedReq) {
            set(s => ({
              maintenanceRequests: s.maintenanceRequests.map(r => r.id === requestId ? mapMaintenance(updatedReq) : r),
            }));

            // 🔔 Notify admin
            try {
              getAdminStore().getState().addNotification({
                type: 'maintenance',
                title: '🏁 Work Completed!',
                body: `${updatedReq.assignedVendor?.name || 'Vendor'} has completed work at Unit ${updatedReq.resident?.unit || ''} (${updatedReq.category || ''}). Vendor will request payment soon.`,
                requestId,
              });
            } catch (e) { /* ignore */ }
            // 🔔 Notify resident
            try {
              getResidentStore().getState().addNotification({
                type: 'maintenance',
                title: '🏁 Maintenance Work Completed!',
                body: `All ${updatedReq.category || ''} work at your unit (${updatedReq.resident?.unit || ''}) has been completed by ${updatedReq.assignedVendor?.name || 'vendor'}. Payment will be requested shortly.`,
                requestId,
              });
            } catch (e) { /* ignore */ }
          }
        } catch (error) {
          console.error('Vendor Mark Complete Error:', error);
        }
      },

      // Simplified aliases for UI compatibility — now just marks work as complete
      vendorAdvanceWorkStep: async (requestId) => get().vendorMarkWorkComplete(requestId),
      vendorAdvanceStep:     async (requestId) => get().vendorMarkWorkComplete(requestId),
      vendorRequestStepApproval: async (requestId) => get().vendorMarkWorkComplete(requestId),

      // Admin OR resident approves work → vendor notified
      approveWorkStep: async (requestId, approved, approvedBy = 'Resident') => {
        try {
          const { MaintenanceApi } = require('../services/maintenanceApi');
          const updatedReq = await MaintenanceApi.approveWorkStep(requestId, approved, approvedBy);
          if (updatedReq) {
            set(s => ({
              maintenanceRequests: s.maintenanceRequests.map(r => r.id === requestId ? mapMaintenance(updatedReq) : r),
            }));

            // 🔔 Notify vendor
            try {
              if (approved) {
                getVendorStore().getState().addNotification({
                  type: 'approved',
                  title: `🟢 Work Approved!`,
                  body: `${approvedBy} approved the work. You can now request payment. 🎉`,
                  requestId,
                });
              } else {
                getVendorStore().getState().addNotification({
                  type: 'rejected',
                  title: `🔴 Work Feedback`,
                  body: `${approvedBy} (Unit ${updatedReq.resident?.unit || ''}) has sent feedback on the work. Please review.`,
                  requestId,
                });
              }
            } catch (e) { /* ignore */ }
          }
        } catch (error) {
          console.error('Approve Work Error:', error);
        }
      },

      // Vendor requests payment from admin → status: payment_requested_to_admin
      vendorRequestPayment: async (requestId) => {
        try {
          const { MaintenanceApi } = require('../services/maintenanceApi');
          const updatedReq = await MaintenanceApi.vendorRequestPayment(requestId);
          if (updatedReq) {
            set(s => ({
              maintenanceRequests: s.maintenanceRequests.map(r => r.id === requestId ? {
                ...updatedReq,
                residentId: updatedReq.resident?.id,
                residentName: updatedReq.resident?.name,
                assignedVendorId: updatedReq.assignedVendor?.id,
                assignedVendorName: updatedReq.assignedVendor?.name
              } : r),
            }));

            // 🔔 Notify admin
            try {
              getAdminStore().getState().addNotification({
                type: 'maintenance',
                title: '💰 Vendor Requesting Payment',
                body: `Work completed for ${updatedReq.resident?.name || ''} (Unit ${updatedReq.resident?.unit || ''}). Please collect ₹${updatedReq.quote?.amount || '?'} from resident and pay the vendor.`,
                requestId,
              });
            } catch (e) { /* ignore */ }
          }
        } catch (error) {
          console.error('Vendor Request Payment Error:', error);
        }
      },

      // Admin requests payment from resident → status: payment_requested_to_resident
      adminRequestPaymentFromResident: async (requestId) => {
        try {
          const { MaintenanceApi } = require('../services/maintenanceApi');
          const updatedReq = await MaintenanceApi.adminRequestPaymentFromResident(requestId);
          if (updatedReq) {
            set(s => ({
              maintenanceRequests: s.maintenanceRequests.map(r => r.id === requestId ? mapMaintenance(updatedReq) : r),
            }));

            // 🔔 Notify resident
            try {
              getResidentStore().getState().addNotification({
                type: 'maintenance',
                title: '💳 Payment Due for Maintenance',
                body: `Please pay ₹${updatedReq.quote?.amount?.toLocaleString() || '?'} for completed ${updatedReq.category || ''} work at Unit ${updatedReq.resident?.unit || ''}. Tap to pay now.`,
                requestId,
                actionType: 'payment_due',
              });
            } catch (e) { /* ignore */ }

            // 💳 Inject a bill into resident's Bills screen
            try {
              const amount = updatedReq.quote?.amount || 0;
              const dueDate = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
              getResidentStore().getState().addBill({
                id: `BILL-${requestId}`,
                residentId: updatedReq.resident?.id || 'res1',
                unit: updatedReq.resident?.unit || '',
                month: `${updatedReq.category || 'Maintenance'} Work — ${requestId}`,
                dueDate,
                items: [
                  { label: `${updatedReq.category || 'Maintenance'} Service`, amount },
                  { label: `Vendor: ${updatedReq.assignedVendor?.name || 'Vendor'}`, amount: 0 },
                ],
                total: amount,
                status: 'unpaid',
                type: 'maintenance',
                maintenanceRequestId: requestId,
                paidAt: null,
                transactionId: null,
              });
            } catch (e) { /* ignore */ }
          }
        } catch (error) {
          console.error('Admin Request Payment Error:', error);
        }
      },


      // Resident pays admin → status: payment_received
      residentPay: async (requestId) => {
        try {
          const { MaintenanceApi } = require('../services/maintenanceApi');
          const updatedReq = await MaintenanceApi.residentPay(requestId);
          if (updatedReq) {
            set(s => ({
              maintenanceRequests: s.maintenanceRequests.map(r => r.id === requestId ? {
                ...updatedReq,
                residentId: updatedReq.resident?.id,
                residentName: updatedReq.resident?.name,
                unit: updatedReq.resident?.unit,
                assignedVendorId: updatedReq.assignedVendor?.id,
                assignedVendorName: updatedReq.assignedVendor?.name
              } : r),
            }));

            // Sync with local billing stores
            try {
              getAdminStore().getState().markInvoicePaid(`BILL-${requestId}`);
              getResidentStore().getState().markMaintenanceBillPaid(requestId);
            } catch (e) { /* ignore */ }
          }
        } catch (error) { console.error('Resident Pay Error:', error); }
      },


      // Admin pays vendor → status: paid_to_vendor + reflect in earnings
      adminPayVendor: async (requestId) => {
        try {
          const { MaintenanceApi } = require('../services/maintenanceApi');
          const updatedReq = await MaintenanceApi.adminPayVendor(requestId);
          if (updatedReq) {
            set(s => ({
              maintenanceRequests: s.maintenanceRequests.map(r => r.id === requestId ? {
                ...updatedReq,
                residentId: updatedReq.resident?.id,
                residentName: updatedReq.resident?.name,
                unit: updatedReq.resident?.unit,
                assignedVendorId: updatedReq.assignedVendor?.id,
                assignedVendorName: updatedReq.assignedVendor?.name
              } : r),
            }));

            // 🔔 Notify vendor with earnings confirmation
            try {
              getVendorStore().getState().addNotification({
                type: 'payment',
                title: '💰 Payment Received!',
                body: `₹${updatedReq.quote?.amount || '?'} has been credited for ${updatedReq.category || ''} work at Unit ${updatedReq.resident?.unit || ''}. Check your Earnings.`,
                requestId,
              });
            } catch (e) { /* ignore */ }
          }
        } catch (error) {
          console.error('Admin Pay Vendor Error:', error);
        }
      },

      // Admin approves work start → generates gate OTP for vendor entry
      adminConfirmWorkStart: async (requestId) => {
        try {
          const { MaintenanceApi } = require('../services/maintenanceApi');
          const updatedReq = await MaintenanceApi.adminApproveWorkStart(requestId);
          if (updatedReq) {
            set(s => ({
              maintenanceRequests: s.maintenanceRequests.map(r => r.id === requestId ? {
                ...updatedReq,
                residentId: updatedReq.resident?.id,
                residentName: updatedReq.resident?.name,
                unit: updatedReq.resident?.unit,
                assignedVendorId: updatedReq.assignedVendor?.id,
                assignedVendorName: updatedReq.assignedVendor?.name
              } : r),
            }));
            // 🔔 Notify vendor with gate OTP
            try {
              getVendorStore().getState().addNotification({
                type: 'approved',
                title: '🚀 Work Start Approved!',
                body: `You are approved to start work at Unit ${updatedReq.resident?.unit || ''}. Show OTP ${updatedReq.vendorGateOtp} to the security guard at the gate to enter.`,
                requestId,
              });
            } catch (e) { /* ignore */ }

            // 🔔 Notify resident — vendor is coming
            try {
              getResidentStore().getState().addNotification({
                type: 'maintenance',
                title: '🔧 Vendor Approved to Visit',
                body: `Your ${updatedReq.category || ''} maintenance vendor (${updatedReq.assignedVendor?.name || 'Vendor'}) has been approved and will arrive soon at Unit ${updatedReq.resident?.unit || ''}.`,
                requestId,
              });
            } catch (e) { /* ignore */ }
          }
        } catch (error) {
          console.error('Admin Confirm Work Start Error:', error);
        }
      },
 
      // Guard validates vendor's gate OTP
      guardValidateMaintenanceOTP: async (requestId, otp) => {
        try {
          const { MaintenanceApi } = require('../services/maintenanceApi');
          const updatedReq = await MaintenanceApi.validateGateOtp(requestId, otp);
 
          if (updatedReq) {
            set(s => ({
              maintenanceRequests: s.maintenanceRequests.map(r => r.id === requestId ? mapMaintenance(updatedReq) : r),
            }));
            return { ok: true };
          }
          return { ok: false };
        } catch (error) {
          console.error('Guard Validate OTP Error:', error);
          return { ok: false };
        }
      },

      residentRespondToQuote: async (requestId, accepted) => {
        try {
          const { MaintenanceApi } = require('../services/maintenanceApi');
          const updatedReq = await MaintenanceApi.residentRespondToQuote(requestId, accepted);
          if (updatedReq) {
            set(s => ({
              maintenanceRequests: s.maintenanceRequests.map(r => r.id === requestId ? {
                ...updatedReq,
                residentId: updatedReq.resident?.id,
                residentName: updatedReq.resident?.name,
                assignedVendorId: updatedReq.assignedVendor?.id,
                assignedVendorName: updatedReq.assignedVendor?.name
              } : r),
            }));
          }
        } catch (error) {
          console.error('Resident Respond To Quote Error:', error);
        }
      },

      // Alias used by AdminMaintenance.js — forwards quote to resident
      adminApproveQuote: async (requestId) => {
        try {
          const { MaintenanceApi } = require('../services/maintenanceApi');
          const updatedReq = await MaintenanceApi.adminApproveQuote(requestId);
          if (updatedReq) {
            set(s => ({
              maintenanceRequests: s.maintenanceRequests.map(r => r.id === requestId ? mapMaintenance(updatedReq) : r),
            }));

            // 🔔 Notify resident
            try {
              getResidentStore().getState().addNotification({
                type: 'maintenance',
                title: '💰 Maintenance Quote Ready!',
                body: `Your ${updatedReq.category || ''} request has a quote of ₹${updatedReq.quote?.amount || '—'}. Tap to accept or reject.`,
                requestId,
                actionType: 'quote_pending',
              });
            } catch (e) { /* ignore */ }
          }
        } catch (error) {
          console.error('Admin Approve Quote Error:', error);
        }
      },

      // Alias used by ResidentMaintenance.js — resident accepts/rejects quote
      residentRespondToQuote: async (requestId, accepted) => {
        try {
          const { MaintenanceApi } = require('../services/maintenanceApi');
          const updatedReq = await MaintenanceApi.residentRespondToQuote(requestId, accepted);
          if (updatedReq) {
            set(s => ({
              maintenanceRequests: s.maintenanceRequests.map(r => r.id === requestId ? {
                ...updatedReq,
                residentId: updatedReq.resident?.id,
                residentName: updatedReq.resident?.name,
                unit: updatedReq.resident?.unit,
                assignedVendorId: updatedReq.assignedVendor?.id,
                assignedVendorName: updatedReq.assignedVendor?.name
              } : r),
            }));

            // 🔔 Notify admin
            try {
              getAdminStore().getState().addNotification({
                type: 'maintenance',
                title: accepted ? '✅ Quote Accepted by Resident' : '❌ Quote Rejected by Resident',
                body: `${updatedReq.resident?.name || 'Resident'} (Unit ${updatedReq.resident?.unit || ''}) ${accepted ? 'accepted' : 'rejected'} the ₹${updatedReq.quote?.amount || ''} quote for ${updatedReq.category || ''}.${accepted ? ' Please approve work start.' : ' Vendor may revise the quote.'}`,
                requestId,
              });
            } catch (e) { /* ignore */ }

            // 🔔 Notify vendor
            try {
              getVendorStore().getState().addNotification({
                type: accepted ? 'approved' : 'rejected',
                title: accepted ? '🎉 Quote Accepted!' : '❌ Quote Rejected',
                body: `${updatedReq.resident?.name || 'Resident'} (Unit ${updatedReq.resident?.unit || ''}) has ${accepted ? 'accepted' : 'rejected'} your ₹${updatedReq.quote?.amount || ''} quote for ${updatedReq.category || ''}.${accepted ? ' Admin will approve your work start shortly.' : ' You may revise and resubmit.'}`,
                requestId,
              });
            } catch (e) { /* ignore */ }
          }
        } catch (error) {
          console.error('Resident Respond To Quote Error:', error);
        }
      },

      // ── Marketplace (Vendor E-Commerce) ────────────────────────────────────
      marketplaceProducts: SEED_PRODUCTS,
      marketplaceOrders: SEED_ORDERS,
      cart: [],

      addProduct: (data) => {
        const p = { id: uid('prod'), ...data, active: true, createdAt: now() };
        set(s => ({ marketplaceProducts: [...s.marketplaceProducts, p] }));
        return p;
      },

      updateProduct: (id, updates) =>
        set(s => ({
          marketplaceProducts: s.marketplaceProducts.map(p => p.id === id ? { ...p, ...updates } : p),
        })),

      // Delete product — removed from store AND resident carts instantly
      deleteProduct: (id) =>
        set(s => ({
          marketplaceProducts: s.marketplaceProducts.filter(p => p.id !== id),
          cart: s.cart.filter(i => i.productId !== id),
        })),

      // ── Resident-to-Resident Chat (P2P & Real Estate) ─────────────────────
      // residentChats: { [chatId]: { id, buyerId, buyerName, buyerUnit, sellerId, sellerName, sellerUnit, context, contextId, messages[], unreadBuyer, unreadSeller, lastAt } }
      residentChats: {},

      sendResidentChatMessage: ({ buyerId, buyerName, buyerUnit, sellerId, sellerName, sellerUnit, context, contextId, text, fromId }) => {
        const chatId = `RCHAT-${contextId}-${[buyerId, sellerId].sort().join('-')}`;
        const msg = { id: uid('rmsg'), fromId, text, sentAt: now() };
        set(s => {
          const existing = s.residentChats[chatId] || {
            id: chatId, buyerId, buyerName, buyerUnit, sellerId, sellerName, sellerUnit,
            context, contextId, messages: [], unreadBuyer: 0, unreadSeller: 0,
          };
          return {
            residentChats: {
              ...s.residentChats,
              [chatId]: {
                ...existing,
                messages: [...existing.messages, msg],
                lastAt: now(),
                lastText: text,
                unreadBuyer: fromId === sellerId ? (existing.unreadBuyer || 0) + 1 : existing.unreadBuyer || 0,
                unreadSeller: fromId === buyerId ? (existing.unreadSeller || 0) + 1 : existing.unreadSeller || 0,
              },
            },
          };
        });
        return { chatId, msg };
      },

      markResidentChatRead: (chatId, role) =>
        set(s => {
          const chat = s.residentChats[chatId];
          if (!chat) return {};
          return {
            residentChats: {
              ...s.residentChats,
              [chatId]: {
                ...chat,
                unreadBuyer: role === 'buyer' ? 0 : chat.unreadBuyer,
                unreadSeller: role === 'seller' ? 0 : chat.unreadSeller,
              },
            },
          };
        }),

      getResidentChatsFor: (userId) => {
        const chats = get().residentChats;
        return Object.values(chats).filter(c => c.buyerId === userId || c.sellerId === userId);
      },

      getResidentChatById: (chatId) => get().residentChats[chatId] || null,

      getChatIdForListing: (contextId, buyerId, sellerId) =>
        `RCHAT-${contextId}-${[buyerId, sellerId].sort().join('-')}`,

      // ── Maid / Worker GPS Tracking ────────────────────────────────────────
      // trackedWorkers: { [workerId]: { id, name, phone, addedBy, addedAt, lastLocation, locationHistory[], status, permissionGranted } }
      trackedWorkers: {},

      addTrackedWorker: (residentId, workerData) => {
        const w = {
          id: uid('WRK'),
          ...workerData,
          addedBy: residentId,
          addedAt: now(),
          lastLocation: null,
          locationHistory: [],
          status: 'pending',        // pending | active | offline
          permissionGranted: false,
        };
        set(s => ({ trackedWorkers: { ...s.trackedWorkers, [w.id]: w } }));
        return w;
      },

      removeTrackedWorker: (workerId) =>
        set(s => {
          const updated = { ...s.trackedWorkers };
          delete updated[workerId];
          return { trackedWorkers: updated };
        }),

      updateWorkerLocation: (workerId, location) =>
        set(s => {
          const w = s.trackedWorkers[workerId];
          if (!w) return {};
          const entry = { ...location, recordedAt: now() };
          return {
            trackedWorkers: {
              ...s.trackedWorkers,
              [workerId]: {
                ...w,
                lastLocation: entry,
                status: 'active',
                permissionGranted: true,
                locationHistory: [...(w.locationHistory || []).slice(-99), entry],
              },
            },
          };
        }),

      setWorkerPermissionGranted: (workerId, granted) =>
        set(s => {
          const w = s.trackedWorkers[workerId];
          if (!w) return {};
          return {
            trackedWorkers: {
              ...s.trackedWorkers,
              [workerId]: { ...w, permissionGranted: granted, status: granted ? 'active' : 'pending' },
            },
          };
        }),

      setWorkerOffline: (workerId) =>
        set(s => {
          const w = s.trackedWorkers[workerId];
          if (!w) return {};
          return { trackedWorkers: { ...s.trackedWorkers, [workerId]: { ...w, status: 'offline' } } };
        }),

      getWorkersForResident: (residentId) =>
        Object.values(get().trackedWorkers).filter(w => w.addedBy === residentId),

      placeOrder: (residentId, residentName, unit, cartItems) => {
        const subtotal = cartItems.reduce((sum, i) => sum + i.price * i.qty, 0);
        const deliveryCharge = 20;
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const order = {
          id: uid('ORD'),
          residentId, residentName, unit,
          items: cartItems,
          subtotal, deliveryCharge, total: subtotal + deliveryCharge,
          status: 'pending',
          otp, otpVerified: false,
          placedAt: now(), deliveredAt: null,
          timeline: [{ action: 'Order Placed', at: now() }],
        };
        set(s => ({
          marketplaceOrders: [order, ...s.marketplaceOrders],
          cart: [],
          marketplaceProducts: s.marketplaceProducts.map(p => {
            const cartItem = cartItems.find(i => i.productId === p.id);
            return cartItem ? { ...p, stock: Math.max(0, p.stock - cartItem.qty) } : p;
          }),
        }));
        return order;
      },

      updateOrderStatus: (orderId, status) =>
        set(s => ({
          marketplaceOrders: s.marketplaceOrders.map(o =>
            o.id === orderId
              ? { ...o, status, timeline: [...o.timeline, { action: `Status → ${status}`, at: now() }] }
              : o
          ),
        })),

      verifyOrderOTP: (orderId, otp) => {
        const { marketplaceOrders } = get();
        const order = marketplaceOrders.find(o => o.id === orderId);
        if (!order || order.otp !== otp) return { ok: false };
        set(s => ({
          marketplaceOrders: s.marketplaceOrders.map(o =>
            o.id === orderId
              ? { ...o, otpVerified: true, status: 'out_for_delivery', timeline: [...o.timeline, { action: 'OTP Verified — Entry Allowed', at: now() }] }
              : o
          ),
        }));
        // Push a live notification to the resident
        try {
          const residentStore = getResidentStore();
          residentStore.getState().addNotification({
            type: 'order',
            title: '📦 Delivery Partner Has Arrived!',
            body: `Your order #${orderId} delivery partner${order.deliveryPartnerName ? ' ' + order.deliveryPartnerName : ''} has been verified at the gate and is on the way. Please confirm receipt.`,
            orderId,
            actionType: 'delivery_arrived',
          });
        } catch (e) { /* silently ignore if residentStore not available */ }
        // 📋 Log to guard's entry logs
        try {
          getSecurityStore().getState().logEntry(
            'DELIVERY',
            orderId,
            order.deliveryPartnerName || 'Delivery Partner',
            order.unit,
            'OTP_VERIFIED',
            'Main Gate',
            'guard'
          );
        } catch (e) { /* ignore */ }
        return { ok: true, order };
      },

      // Resident confirms delivery received → status: 'delivered'
      residentConfirmDelivery: (orderId) =>
        set(s => ({
          marketplaceOrders: s.marketplaceOrders.map(o =>
            o.id === orderId
              ? { ...o, status: 'delivered', deliveredAt: now(), timeline: [...o.timeline, { action: 'Delivery Confirmed by Resident', at: now() }] }
              : o
          ),
        })),

      // Resident rejects delivery (wrong order / damaged)
      residentRejectDelivery: (orderId) =>
        set(s => ({
          marketplaceOrders: s.marketplaceOrders.map(o =>
            o.id === orderId
              ? { ...o, status: 'rejected', timeline: [...o.timeline, { action: 'Delivery Rejected by Resident', at: now() }] }
              : o
          ),
        })),

      // ── Return Workflow ────────────────────────────────────────────────────
      // Resident → requests return (7-day window after delivery)
      residentRequestReturn: (orderId) => {
        const order = get().marketplaceOrders.find(o => o.id === orderId);
        set(s => ({
          marketplaceOrders: s.marketplaceOrders.map(o =>
            o.id === orderId
              ? {
                ...o, status: 'return_requested', returnRequestedAt: now(),
                timeline: [...o.timeline, { action: 'Return Requested by Resident', at: now() }]
              }
              : o
          ),
        }));
        // Notify vendor
        try {
          getVendorStore().getState().addNotification({
            type: 'return',
            title: '↩️ Return Request',
            body: `${order?.residentName || 'Resident'} (Unit ${order?.unit}) has requested a return for Order #${orderId}.`,
            orderId,
          });
        } catch (e) { /* ignore */ }
      },

      // Vendor → accepts return (will arrange pickup)
      vendorAcceptReturn: (orderId) =>
        set(s => ({
          marketplaceOrders: s.marketplaceOrders.map(o =>
            o.id === orderId
              ? {
                ...o, status: 'return_accepted', returnAcceptedAt: now(),
                timeline: [...o.timeline, { action: 'Return Accepted by Vendor — Pickup will be arranged', at: now() }]
              }
              : o
          ),
        })),

      // Vendor → marks item picked up from resident
      vendorPickedUpReturn: (orderId) =>
        set(s => ({
          marketplaceOrders: s.marketplaceOrders.map(o =>
            o.id === orderId
              ? {
                ...o, status: 'return_picked_up', returnPickedUpAt: now(),
                timeline: [...o.timeline, { action: 'Item Picked Up by Vendor', at: now() }]
              }
              : o
          ),
        })),

      // Vendor → completes return, triggers refund to resident
      vendorCompleteReturn: (orderId) => {
        const order = get().marketplaceOrders.find(o => o.id === orderId);
        set(s => ({
          marketplaceOrders: s.marketplaceOrders.map(o =>
            o.id === orderId
              ? {
                ...o, status: 'returned', returnCompletedAt: now(),
                timeline: [...o.timeline, { action: `Refund ₹${o.total} Processed to Resident`, at: now() }]
              }
              : o
          ),
        }));
        // Notify resident about refund
        try {
          getResidentStore().getState().addNotification({
            type: 'order',
            title: '💰 Refund Processed',
            body: `Your refund of ₹${order?.total || '?'} for Order #${orderId} has been processed. It will reflect in 3-5 business days.`,
            orderId,
          });
        } catch (e) { /* ignore */ }
      },

      // Vendor → rejects return request
      vendorRejectReturn: (orderId, reason = '') =>
        set(s => ({
          marketplaceOrders: s.marketplaceOrders.map(o =>
            o.id === orderId
              ? {
                ...o, status: 'return_rejected', returnRejectedAt: now(),
                returnRejectionReason: reason,
                timeline: [...o.timeline, { action: `Return Request Rejected${reason ? ': ' + reason : ''}`, at: now() }]
              }
              : o
          ),
        })),

      // Vendor accepts a pending order → status: 'accepted'
      vendorAcceptOrder: (orderId) =>
        set(s => ({
          marketplaceOrders: s.marketplaceOrders.map(o =>
            o.id === orderId
              ? { ...o, status: 'accepted', timeline: [...o.timeline, { action: 'Order Confirmed by Vendor', at: now() }] }
              : o
          ),
        })),

      // Vendor rejects a pending order → status: 'rejected'
      vendorRejectOrder: (orderId) =>
        set(s => ({
          marketplaceOrders: s.marketplaceOrders.map(o =>
            o.id === orderId
              ? { ...o, status: 'rejected', timeline: [...o.timeline, { action: 'Order Rejected by Vendor', at: now() }] }
              : o
          ),
        })),

      // Vendor assigns a delivery partner → status: 'assigned_delivery'
      assignDeliveryPartner: (orderId, partnerId, partnerName) =>
        set(s => ({
          marketplaceOrders: s.marketplaceOrders.map(o =>
            o.id === orderId
              ? {
                ...o,
                status: 'assigned_delivery',
                deliveryPartnerId: partnerId,
                deliveryPartnerName: partnerName,
                timeline: [...o.timeline, { action: `Delivery assigned to ${partnerName}`, at: now() }],
              }
              : o
          ),
        })),

      // Vendor marks order as delivered → status: 'delivered'
      markOrderDelivered: (orderId) =>
        set(s => ({
          marketplaceOrders: s.marketplaceOrders.map(o =>
            o.id === orderId
              ? { ...o, status: 'delivered', deliveredAt: now(), timeline: [...o.timeline, { action: 'Order Delivered', at: now() }] }
              : o
          ),
        })),

      // Cart
      addToCart: (product, qty = 1) =>
        set(s => {
          const existing = s.cart.find(i => i.productId === product.id);
          return existing
            ? { cart: s.cart.map(i => i.productId === product.id ? { ...i, qty: i.qty + qty } : i) }
            : { cart: [...s.cart, { productId: product.id, name: product.name, price: product.price, emoji: product.emoji, qty }] };
        }),

      updateCartQty: (productId, qty) =>
        set(s => ({ cart: s.cart.map(i => i.productId === productId ? { ...i, qty } : i) })),

      removeFromCart: (productId) =>
        set(s => ({ cart: s.cart.filter(i => i.productId !== productId) })),

      clearCart: () => set({ cart: [] }),

      // ── P2P Marketplace ────────────────────────────────────────────────────
      p2pListings: SEED_P2P,
      p2pMessages: SEED_P2P_MESSAGES,

      createP2PListing: (data) => {
        // First-ever listing from this seller → PENDING_APPROVAL (admin must verify)
        // Subsequent listings → ACTIVE immediately (seller is already verified)
        const existingByThisSeller = get().p2pListings.filter(
          l => l.sellerId === data.sellerId && l.status !== 'REJECTED'
        );
        const hasBeenApprovedBefore = existingByThisSeller.some(
          l => l.adminApprovedAt !== null
        );
        const isFirstListing = existingByThisSeller.length === 0 || !hasBeenApprovedBefore;

        const listing = {
          id: uid('P2P'),
          ...data,
          status: isFirstListing ? 'PENDING_APPROVAL' : 'ACTIVE',
          adminApprovedAt: isFirstListing ? null : now(),
          createdAt: now(),
          expiresAt: isFirstListing
            ? null
            : new Date(Date.now() + 30 * 86400000).toISOString(),
          interestedCount: 0,
          isFirstListing,  // for alert message in UI
        };
        set(s => ({ p2pListings: [listing, ...s.p2pListings] }));
        return listing;
      },

      approveP2PListing: (id) =>
        set(s => ({
          p2pListings: s.p2pListings.map(l =>
            l.id === id
              ? {
                ...l,
                status: 'ACTIVE',
                adminApprovedAt: now(),
                expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
              }
              : l
          ),
        })),

      rejectP2PListing: (id, reason = '') =>
        set(s => ({
          p2pListings: s.p2pListings.map(l =>
            l.id === id ? { ...l, status: 'REJECTED', rejectedReason: reason } : l
          ),
        })),

      markP2PSold: (id) =>
        set(s => ({
          p2pListings: s.p2pListings.map(l => l.id === id ? { ...l, status: 'SOLD', soldAt: now() } : l),
        })),

      sendP2PMessage: (listingId, senderId, senderName, message) => {
        const msg = { id: uid('MSG'), listingId, senderId, senderName, message, sentAt: now() };
        set(s => ({
          p2pMessages: [...s.p2pMessages, msg],
          p2pListings: s.p2pListings.map(l =>
            l.id === listingId ? { ...l, interestedCount: l.interestedCount + 1 } : l
          ),
        }));
        return msg;
      },

      getListingMessages: (listingId) =>
        get().p2pMessages.filter(m => m.listingId === listingId),

      // ── Real Estate ────────────────────────────────────────────────────────
      realEstateListings: SEED_REAL_ESTATE,

      createRealEstateListing: (data) => {
        // First-ever listing from this owner → PENDING_APPROVAL
        // Subsequent listings → ACTIVE immediately (owner already verified by admin)
        const existingByThisOwner = get().realEstateListings.filter(
          l => l.ownerId === data.ownerId && l.status !== 'REJECTED'
        );
        const hasBeenApprovedBefore = existingByThisOwner.some(
          l => l.adminApprovedAt !== null
        );
        const isFirstListing = existingByThisOwner.length === 0 || !hasBeenApprovedBefore;

        const listing = {
          id: uid('RE'),
          ...data,
          status: isFirstListing ? 'PENDING_APPROVAL' : 'ACTIVE',
          adminApprovedAt: isFirstListing ? null : now(),
          createdAt: now(),
          views: 0,
          inquiryCount: 0,
          isFirstListing,
        };
        set(s => ({ realEstateListings: [listing, ...s.realEstateListings] }));
        return listing;
      },

      approveRealEstateListing: (id) =>
        set(s => ({
          realEstateListings: s.realEstateListings.map(l =>
            l.id === id ? { ...l, status: 'ACTIVE', adminApprovedAt: now() } : l
          ),
        })),

      rejectRealEstateListing: (id, reason = '') =>
        set(s => ({
          realEstateListings: s.realEstateListings.map(l =>
            l.id === id ? { ...l, status: 'REJECTED', rejectedReason: reason } : l
          ),
        })),

      updateRealEstateStatus: (id, status) =>
        set(s => ({
          realEstateListings: s.realEstateListings.map(l => l.id === id ? { ...l, status } : l),
        })),

      incrementRealEstateViews: (id) =>
        set(s => ({
          realEstateListings: s.realEstateListings.map(l =>
            l.id === id ? { ...l, views: l.views + 1 } : l
          ),
        })),

      // ── Announcements ──────────────────────────────────────────────────────
      announcements: SEED_ANNOUNCEMENTS,

      addAnnouncement: (data, adminId, adminName) => {
        const ann = {
          id: uid('ANN'),
          ...data,
          postedBy: adminId,
          postedByName: adminName,
          postedAt: now(),
        };
        set(s => ({ announcements: [ann, ...s.announcements] }));
        return ann;
      },

      deleteAnnouncement: (id) =>
        set(s => ({ announcements: s.announcements.filter(a => a.id !== id) })),

      // Toggle RSVP — adds/removes userId from rsvpList and updates rsvpCount
      rsvpAnnouncement: (announcementId, userId) =>
        set(s => ({
          announcements: s.announcements.map(a => {
            if (a.id !== announcementId) return a;
            const list = a.rsvpList || [];
            const hasIt = list.includes(userId);
            const newList = hasIt ? list.filter(id => id !== userId) : [...list, userId];
            return { ...a, rsvpList: newList, rsvpCount: newList.length };
          }),
        })),

      // ── Builder Requests ───────────────────────────────────────────────────
      builderRequests: SEED_BUILDER_REQUESTS,

      addBuilderRequest: (data) => {
        const req = {
          id: uid('BLD'),
          ...data,
          status: 'pending',
          submittedAt: now(),
          reviewedAt: null,
          remark: null,
        };
        set(s => ({ builderRequests: [...s.builderRequests, req] }));
        return req;
      },

      approveBuilderRequest: (id) =>
        set(s => ({
          builderRequests: s.builderRequests.map(r =>
            r.id === id ? { ...r, status: 'approved', reviewedAt: now() } : r
          ),
        })),

      rejectBuilderRequest: (id, remark = '') =>
        set(s => ({
          builderRequests: s.builderRequests.map(r =>
            r.id === id ? { ...r, status: 'rejected', reviewedAt: now(), remark } : r
          ),
        })),

      getApprovedBuilder: (email) =>
        get().builderRequests.find(r => r.email === email && r.status === 'approved') || null,

      // ── Admin Requests ─────────────────────────────────────────────────────
      adminRequests: SEED_ADMIN_REQUESTS,

      addAdminRequest: (data) => {
        const req = {
          id: uid('ADM'),
          ...data,
          status: 'pending',
          submittedAt: now(),
          reviewedAt: null,
          remark: null,
        };
        set(s => ({ adminRequests: [...s.adminRequests, req] }));
        return req;
      },

      approveAdminRequest: (id) =>
        set(s => ({
          adminRequests: s.adminRequests.map(r =>
            r.id === id ? { ...r, status: 'approved', reviewedAt: now() } : r
          ),
        })),

      rejectAdminRequest: (id, remark = '') =>
        set(s => ({
          adminRequests: s.adminRequests.map(r =>
            r.id === id ? { ...r, status: 'rejected', reviewedAt: now(), remark } : r
          ),
        })),

      // ── Theme ─────────────────────────────────────────────────────────────
      // 'light' | 'dark' | 'custom'
      theme: 'light',
      setTheme: (mode) => set({ theme: mode }),

      // ── Customers ──────────────────────────────────────────────────────────
      customers: SEED_CUSTOMERS,

      registerCustomer: (data) => {
        const customer = {
          id: uid('CUST'),
          ...data,
          verified: true,
          role: 'customer',
          createdAt: now(),
        };
        set(s => ({ customers: [...s.customers, customer] }));
        return customer;
      },

      getCustomerByPhone: (phone) =>
        get().customers.find(c => c.phone === phone) || null,

      // ── Projects ───────────────────────────────────────────────────────────
      projects: SEED_PROJECTS,

      addProject: (data) => {
        const project = {
          id: uid('PRJ'),
          ...data,
          status: 'active',
          constructionProgress: 0,
          milestones: [],
          createdAt: now(),
        };
        set(s => ({ projects: [project, ...s.projects] }));
        return project;
      },

      updateProject: (id, updates) =>
        set(s => ({
          projects: s.projects.map(p => p.id === id ? { ...p, ...updates } : p),
        })),

      addMilestone: (projectId, milestone) =>
        set(s => ({
          projects: s.projects.map(p =>
            p.id === projectId
              ? { ...p, milestones: [...(p.milestones || []), { id: uid('MS'), ...milestone }] }
              : p
          ),
        })),

      updateMilestone: (projectId, milestoneId, updates) =>
        set(s => ({
          projects: s.projects.map(p =>
            p.id === projectId
              ? {
                ...p,
                milestones: p.milestones.map(m =>
                  m.id === milestoneId ? { ...m, ...updates } : m
                ),
              }
              : p
          ),
        })),

      updateConstructionProgress: (projectId, pct) =>
        set(s => ({
          projects: s.projects.map(p =>
            p.id === projectId ? { ...p, constructionProgress: pct } : p
          ),
        })),

      // ── Units ──────────────────────────────────────────────────────────────
      units: SEED_UNITS,

      addUnit: (data) => {
        const unit = { id: uid('U'), ...data, status: 'available', bookingId: null };
        set(s => ({ units: [unit, ...s.units] }));
        return unit;
      },

      addUnitsForTower: (projectId, towerId, towerName, floors, unitsPerFloor, unitConfigs) => {
        const newUnits = [];
        for (let floor = 1; floor <= floors; floor++) {
          for (let pos = 1; pos <= unitsPerFloor; pos++) {
            const cfg = unitConfigs[(pos - 1) % unitConfigs.length];
            newUnits.push({
              id: uid('U'),
              projectId,
              towerId,
              towerName,
              floor,
              unitNumber: `${towerName.replace(/\s/g, '')}-${floor}0${pos}`,
              bhk: cfg.bhk,
              size: cfg.size,
              facing: cfg.facing || 'East',
              price: cfg.price,
              status: 'available',
              bookingId: null,
            });
          }
        }
        set(s => ({ units: [...s.units, ...newUnits] }));
        return newUnits;
      },

      updateUnitStatus: (unitId, status, bookingId = null) =>
        set(s => ({
          units: s.units.map(u =>
            u.id === unitId ? { ...u, status, bookingId } : u
          ),
        })),

      getProjectUnits: (projectId) =>
        get().units.filter(u => u.projectId === projectId),

      // ── Bookings ───────────────────────────────────────────────────────────
      bookings: SEED_BOOKINGS,

      createBooking: (data) => {
        const booking = {
          id: uid('BKG'),
          ...data,
          status: 'pending',
          createdAt: now(),
          kycDocuments: data.kycDocuments || [],
          paymentSchedule: [],
        };
        get().updateUnitStatus(data.unitId, 'booked', booking.id);
        const total = data.totalPrice || 0;
        booking.paymentSchedule = [
          { id: uid('PAY'), label: 'Booking Amount (10%)', amount: Math.round(total * 0.10), dueDate: now(), status: 'pending' },
          { id: uid('PAY'), label: '1st Installment (30%)', amount: Math.round(total * 0.30), dueDate: new Date(Date.now() + 60 * 86400000).toISOString(), status: 'pending' },
          { id: uid('PAY'), label: '2nd Installment (30%)', amount: Math.round(total * 0.30), dueDate: new Date(Date.now() + 120 * 86400000).toISOString(), status: 'pending' },
          { id: uid('PAY'), label: 'Final Payment (30%)', amount: Math.round(total * 0.30), dueDate: new Date(Date.now() + 180 * 86400000).toISOString(), status: 'pending' },
        ];
        set(s => ({ bookings: [booking, ...s.bookings] }));
        return booking;
      },

      updateBookingStatus: (bookingId, status) =>
        set(s => ({
          bookings: s.bookings.map(b => b.id === bookingId ? { ...b, status } : b),
        })),

      addKycDocument: (bookingId, doc) =>
        set(s => ({
          bookings: s.bookings.map(b =>
            b.id === bookingId
              ? { ...b, kycDocuments: [...(b.kycDocuments || []), doc] }
              : b
          ),
        })),

      markInstallmentPaid: (bookingId, installmentId) => {
        set(s => ({
          bookings: s.bookings.map(b => {
            if (b.id !== bookingId) return b;
            const updated = b.paymentSchedule.map(p =>
              p.id === installmentId ? { ...p, status: 'paid', paidAt: now() } : p
            );
            const totalPaid = updated.filter(p => p.status === 'paid').reduce((acc, p) => acc + p.amount, 0);
            const totalAmt = updated.reduce((acc, p) => acc + p.amount, 0);
            const paidPct = totalAmt > 0 ? (totalPaid / totalAmt) * 100 : 0;
            return {
              ...b,
              paymentSchedule: updated,
              paidAmount: totalPaid,
              paidPercentage: paidPct,
              softPossessionEligible: paidPct >= 80,
            };
          }),
        }));
      },

      getCustomerBookings: (customerId) =>
        get().bookings.filter(b => b.customerId === customerId),

      getProjectBookings: (projectId) =>
        get().bookings.filter(b => b.projectId === projectId),

      // ── Franchises ─────────────────────────────────────────────────────────
      franchises: SEED_FRANCHISES,

      createFranchise: (data) => {
        const franchise = {
          id: uid('FRN'),
          ...data,
          assignedBuilders: [],
          assignedAdmins: [],
          status: 'active',
          createdAt: now(),
        };
        set(s => ({ franchises: [franchise, ...s.franchises] }));
        return franchise;
      },

      assignToFranchise: (franchiseId, entityId, entityType) =>
        set(s => ({
          franchises: s.franchises.map(f => {
            if (f.id !== franchiseId) return f;
            const key = entityType === 'builder' ? 'assignedBuilders' : 'assignedAdmins';
            if (f[key].includes(entityId)) return f;
            return { ...f, [key]: [...f[key], entityId] };
          }),
        })),

      // ── Wishlist (resident product saves) ──────────────────────────────────
      // wishlists: { [residentId]: [productId, ...] }
      wishlists: {},

      toggleWishlist: (residentId, productId) =>
        set(s => {
          const current = s.wishlists[residentId] || [];
          const has = current.includes(productId);
          return {
            wishlists: {
              ...s.wishlists,
              [residentId]: has
                ? current.filter(id => id !== productId)
                : [...current, productId],
            },
          };
        }),

      getWishlist: (residentId) => {
        const ids = get().wishlists[residentId] || [];
        return get().marketplaceProducts.filter(p => ids.includes(p.id));
      },

      isWishlisted: (residentId, productId) =>
        (get().wishlists[residentId] || []).includes(productId),

      // ── Legal Notices (admin → overdue residents) ──────────────────────────
      legalNotices: [],

      sendLegalNotice: (data) => {
        const notice = {
          id: uid('LN'),
          ...data,                        // residentId, residentName, unit, amount, type
          sentAt: now(),
          status: 'sent',                 // sent | acknowledged | resolved
          acknowledgedAt: null,
        };
        set(s => ({ legalNotices: [notice, ...s.legalNotices] }));
        return notice;
      },

      acknowledgeNotice: (id) =>
        set(s => ({
          legalNotices: s.legalNotices.map(n =>
            n.id === id ? { ...n, status: 'acknowledged', acknowledgedAt: now() } : n
          ),
        })),

      resolveNotice: (id) =>
        set(s => ({
          legalNotices: s.legalNotices.map(n =>
            n.id === id ? { ...n, status: 'resolved' } : n
          ),
        })),

      getNoticesForResident: (residentId) =>
        get().legalNotices.filter(n => n.residentId === residentId),

      // ── Expense Approval Workflow ──────────────────────────────────────────
      // threshold: <5K → auto, 5K-25K → treasurer, 25K-1L → chairman+treasurer, >1L → committee
      expenseApprovals: [],

      submitExpenseForApproval: (expenseData) => {
        const amount = Number(expenseData.amount || 0);
        const level =
          amount < 5000 ? 'auto' :
            amount < 25000 ? 'treasurer' :
              amount < 100000 ? 'chairman' : 'committee';

        const approval = {
          id: uid('EXPA'),
          ...expenseData,
          amount,
          approvalLevel: level,
          status: level === 'auto' ? 'approved' : 'pending',
          submittedAt: now(),
          reviewedAt: level === 'auto' ? now() : null,
          reviewedBy: level === 'auto' ? 'System (auto-approved)' : null,
          remark: '',
          votes: [],         // for committee level
        };
        set(s => ({ expenseApprovals: [approval, ...s.expenseApprovals] }));
        // notify admin
        try {
          const getAdminStore = () => require('./adminStore').default;
          getAdminStore().getState().addNotification({
            type: 'expense',
            title: `💰 Expense Approval Required`,
            body: `₹${amount.toLocaleString('en-IN')} expense "${expenseData.title || expenseData.category}" needs ${level} approval.`,
          });
        } catch (e) { }
        return approval;
      },

      approveExpense: (id, approvedBy, remark = '') =>
        set(s => ({
          expenseApprovals: s.expenseApprovals.map(e =>
            e.id === id
              ? { ...e, status: 'approved', reviewedAt: now(), reviewedBy: approvedBy, remark }
              : e
          ),
        })),

      rejectExpense: (id, rejectedBy, remark = '') =>
        set(s => ({
          expenseApprovals: s.expenseApprovals.map(e =>
            e.id === id
              ? { ...e, status: 'rejected', reviewedAt: now(), reviewedBy: rejectedBy, remark }
              : e
          ),
        })),

      castCommitteeVote: (id, memberId, memberName, vote) =>
        set(s => ({
          expenseApprovals: s.expenseApprovals.map(e => {
            if (e.id !== id) return e;
            const votes = [...(e.votes || []).filter(v => v.memberId !== memberId), { memberId, memberName, vote, at: now() }];
            const approved = votes.filter(v => v.vote === 'yes').length;
            const rejected = votes.filter(v => v.vote === 'no').length;
            const status = approved >= 3 ? 'approved' : rejected >= 3 ? 'rejected' : 'pending';
            return { ...e, votes, status, reviewedAt: status !== 'pending' ? now() : e.reviewedAt };
          }),
        })),

      // ── Vendor Ratings & Reviews ──────────────────────────────────────────
      vendorRatings: [
        {
          id: 'VR-001', vendorId: 'ven1', vendorName: 'Bob Vendor',
          residentId: 'res2', residentName: 'Jane Resident', requestId: 'MR-002',
          rating: 4, review: 'Good work, minor delay but quality was fine.',
          category: 'Electrical', createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ],

      submitVendorRating: (data) => {
        const rating = { id: uid('VR'), ...data, createdAt: now() };
        set(s => ({ vendorRatings: [rating, ...s.vendorRatings] }));
        return rating;
      },

      getVendorRatings: (vendorId) =>
        get().vendorRatings.filter(r => r.vendorId === vendorId),

      getVendorAvgRating: (vendorId) => {
        const ratings = get().vendorRatings.filter(r => r.vendorId === vendorId);
        if (!ratings.length) return null;
        return (ratings.reduce((s, r) => s + r.rating, 0) / ratings.length).toFixed(1);
      },

      // ── Material Management (builder/vendor scope) ─────────────────────────
      materialRequests: [],

      addMaterialRequest: (data) => {
        const req = {
          id: uid('MAT'),
          ...data,
          status: 'requested',  // requested → approved → ordered → delivered
          requestedAt: now(),
          approvedAt: null,
          deliveredAt: null,
          timeline: [{ action: 'Material Requested', by: data.requestedBy || 'Builder', at: now() }],
        };
        set(s => ({ materialRequests: [req, ...s.materialRequests] }));
        return req;
      },

      approveMaterialRequest: (id, approvedBy) =>
        set(s => ({
          materialRequests: s.materialRequests.map(r =>
            r.id === id
              ? {
                ...r, status: 'approved', approvedAt: now(),
                timeline: [...r.timeline, { action: 'Approved', by: approvedBy, at: now() }]
              }
              : r
          ),
        })),

      markMaterialOrdered: (id) =>
        set(s => ({
          materialRequests: s.materialRequests.map(r =>
            r.id === id
              ? {
                ...r, status: 'ordered',
                timeline: [...r.timeline, { action: 'Order Placed', by: 'System', at: now() }]
              }
              : r
          ),
        })),

      markMaterialDelivered: (id) =>
        set(s => ({
          materialRequests: s.materialRequests.map(r =>
            r.id === id
              ? {
                ...r, status: 'delivered', deliveredAt: now(),
                timeline: [...r.timeline, { action: 'Delivered to Site', by: 'System', at: now() }]
              }
              : r
          ),
        })),

    }),

    {
      name: 'bs-app-storage',
      storage: createJSONStorage(() => AsyncStorage),
      version: 7,
      migrate: (persistedState, version) => {
        return {
          ...persistedState,
          marketplaceOrders: SEED_ORDERS,
          maintenanceRequests: SEED_MAINTENANCE,
          adminRequests: persistedState.adminRequests || SEED_ADMIN_REQUESTS,
          customers: persistedState.customers || SEED_CUSTOMERS,
          projects: persistedState.projects || SEED_PROJECTS,
          units: persistedState.units || SEED_UNITS,
          bookings: persistedState.bookings || SEED_BOOKINGS,
          franchises: persistedState.franchises || SEED_FRANCHISES,
          wishlists: persistedState.wishlists || {},
          legalNotices: persistedState.legalNotices || [],
          expenseApprovals: persistedState.expenseApprovals || [],
          vendorRatings: persistedState.vendorRatings || [],
          materialRequests: persistedState.materialRequests || [],
          theme: persistedState.theme || 'light',
        };
      },
    }
  )
);

export default useAppStore;