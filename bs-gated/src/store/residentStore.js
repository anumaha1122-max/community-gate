import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const genOTP = () => Math.floor(100000 + Math.random() * 900000).toString();
const genQR  = (type, id, otp) => `${type}|${id}|${otp}`;
const uid    = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2,6).toUpperCase()}`;
const now    = () => new Date().toISOString();

const SEED_VISITORS = [
  {
    id: 'VIS-001',
    name: 'Ravi Kumar',
    phone: '9876543210',
    purpose: 'Personal Visit',
    vehicleNumber: 'TS09AB1234',
    hostUnit: 'A-101',
    hostResidentId: 'res1',
    status: 'approved',
    qrCode: 'QR-VIS-001-ABCDEF',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    checkedInAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 3600000).toISOString(),
  },
  {
    id: 'VIS-002',
    name: 'Swathi Reddy',
    phone: '9123456780',
    purpose: 'Delivery',
    vehicleNumber: '',
    hostUnit: 'A-101',
    hostResidentId: 'res1',
    status: 'pending',
    qrCode: 'QR-VIS-002-XYZPQR',
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    checkedInAt: null,
  },
];

const SEED_BILLING = [
  {
    id: 'INV-001',
    residentId: 'res1',
    unit: 'A-101',
    month: 'April 2025',
    dueDate: '2025-04-30',
    items: [
      { label: 'Maintenance Charge', amount: 2000 },
      { label: 'Water Charges', amount: 300 },
      { label: 'Sinking Fund', amount: 500 },
    ],
    total: 2800,
    status: 'unpaid',
    paidAt: null,
    transactionId: null,
  },
  {
    id: 'INV-002',
    residentId: 'res1',
    unit: 'A-101',
    month: 'March 2025',
    dueDate: '2025-03-31',
    items: [
      { label: 'Maintenance Charge', amount: 2000 },
      { label: 'Water Charges', amount: 280 },
      { label: 'Sinking Fund', amount: 500 },
    ],
    total: 2780,
    status: 'paid',
    paidAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
    transactionId: 'TXN-20250328-001',
  },
];

const SEED_AMENITIES = [
  { id: 'AMN-001', name: 'Swimming Pool',  emoji: '🏊',  available: true,  pricePerSlot: 0,   slots: ['06:00-07:00', '07:00-08:00', '17:00-18:00', '18:00-19:00'] },
  { id: 'AMN-002', name: 'Clubhouse',      emoji: '🏛️', available: true,  pricePerSlot: 500, slots: ['09:00-11:00', '11:00-13:00', '14:00-16:00', '16:00-18:00'] },
  { id: 'AMN-003', name: 'Gym',            emoji: '🏋️', available: true,  pricePerSlot: 0,   slots: ['05:00-06:00', '06:00-07:00', '18:00-19:00', '19:00-20:00'] },
  { id: 'AMN-004', name: 'Tennis Court',   emoji: '🎾',  available: true,  pricePerSlot: 200, slots: ['06:00-07:00', '07:00-08:00', '17:00-18:00'] },
  { id: 'AMN-005', name: 'Kids Play Area', emoji: '🛝',  available: true,  pricePerSlot: 0,   slots: ['08:00-10:00', '16:00-18:00', '18:00-20:00'] },
  { id: 'AMN-006', name: 'Party Hall',     emoji: '🎉',  available: true,  pricePerSlot: 800, slots: ['10:00-14:00', '15:00-20:00'] },
];

const SEED_BOOKINGS = [
  {
    id: 'BK-001',
    residentId: 'res1',
    residentName: 'John Resident',
    unit: 'A-101',
    amenityId: 'AMN-001',
    amenityName: 'Swimming Pool',
    amenityEmoji: '🏊',
    slot: '06:00-07:00',
    date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    members: 1,
    amount: 0,
    status: 'confirmed',
    paymentStatus: 'paid',
    otp: '482910',
    qrCode: 'AMENITY|BK-001|482910',
    checkedIn: false,
    checkedInAt: null,
    bookedAt: new Date(Date.now() - 3600000).toISOString(),
    paidAt: new Date(Date.now() - 3600000).toISOString(),
  },
];

const SEED_EV_BOOKINGS = [
  {
    id: 'EV-001',
    residentId: 'res1',
    residentName: 'John Resident',
    unit: 'A-101',
    vehicleNumber: 'TS09EV1001',
    vehicleType: 'Car',
    slot: 'EV-03',
    date: new Date().toISOString().split('T')[0],
    startTime: '10:00',
    endTime: '12:00',
    depositAmount: 200,
    ratePerUnit: 12,
    unitsConsumed: null,
    totalBill: null,
    status: 'active',
    paymentStatus: 'paid',
    otp: '739210',
    qrCode: 'EV|EV-001|739210',
    checkedIn: true,
    checkedInAt: new Date(Date.now() - 3600000).toISOString(),
    bookedAt: new Date(Date.now() - 7200000).toISOString(),
    paidAt: new Date(Date.now() - 7200000).toISOString(),
  },
];

const SEED_NOTIFICATIONS = [
  { id: 'NTF-001', title: 'Visitor Arrived',       body: 'Ravi Kumar has arrived at Gate 1.',                               type: 'visitor',      read: false, createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString() },
  { id: 'NTF-002', title: 'Maintenance Update',    body: 'Your request MR-001 has been assigned to Bob Vendor.',           type: 'maintenance',  read: false, createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
  { id: 'NTF-003', title: 'Invoice Generated',     body: 'Your April 2025 maintenance invoice is ready.',                  type: 'billing',      read: true,  createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
  { id: 'NTF-004', title: 'Community Announcement',body: 'Water supply interrupted Sunday 10am-2pm for tank cleaning.',   type: 'announcement', read: true,  createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString() },
];

const useResidentStore = create(
  persist(
    (set, get) => ({

      refreshFlags: {
        visitor: false,
        maintenance: false,
        billing: false,
        orders: false,
        amenities: false,
        notifications: false,
      },

      triggerRefresh: (module) => {
        set(state => ({
          refreshFlags: {
            ...state.refreshFlags,
            [module]: !state.refreshFlags[module],
          },
        }));
      },

      // ─── VISITORS ────────────────────────────────────────────────────────
      visitors: SEED_VISITORS,

      addVisitor: (data) => {
        const v = {
          id: `VIS-${Date.now()}`,
          ...data,
          status: 'pending',
          qrCode: `QR-${Date.now()}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
          createdAt: new Date().toISOString(),
          checkedInAt: null,
        };
        set(state => ({ visitors: [...state.visitors, v] }));
        get().triggerRefresh('visitor');
        return v;
      },

      approveVisitor: (id) => {
        set(state => ({
          visitors: state.visitors.map(v => v.id === id ? { ...v, status: 'approved' } : v),
        }));
        get().triggerRefresh('visitor');
      },

      denyVisitor: (id) => {
        set(state => ({
          visitors: state.visitors.map(v => v.id === id ? { ...v, status: 'denied' } : v),
        }));
        get().triggerRefresh('visitor');
      },

      // ─── BILLING ─────────────────────────────────────────────────────────
      bills: SEED_BILLING,

      payBill: (id) => {
        const txnId = `TXN-${Date.now()}`;
        const bill = get().bills.find(b => b.id === id);
        set(state => ({
          bills: state.bills.map(b =>
            b.id === id
              ? { ...b, status: 'paid', paidAt: new Date().toISOString(), transactionId: txnId }
              : b
          ),
        }));
        get().triggerRefresh('billing');
        if (bill?.type === 'maintenance' && bill?.maintenanceRequestId) {
          try {
            const appStore = require('./appStore').default;
            appStore.getState().residentPay(bill.maintenanceRequestId);
          } catch (e) { /* ignore */ }
        }
        return txnId;
      },

      addBill: (bill) => {
        set(state => ({
          bills: state.bills.some(b => b.id === bill.id)
            ? state.bills.map(b => b.id === bill.id ? { ...b, ...bill } : b)
            : [bill, ...state.bills],
        }));
        get().triggerRefresh('billing');
      },

      markMaintenanceBillPaid: (maintenanceRequestId) => {
        const txnId = `TXN-MNT-${Date.now()}`;
        set(state => ({
          bills: state.bills.map(b =>
            b.maintenanceRequestId === maintenanceRequestId && b.status === 'unpaid'
              ? { ...b, status: 'paid', paidAt: new Date().toISOString(), transactionId: txnId }
              : b
          ),
        }));
        get().triggerRefresh('billing');
        return txnId;
      },

      // ─── AMENITIES ───────────────────────────────────────────────────────
      amenities: SEED_AMENITIES,
      amenityBookings: SEED_BOOKINGS,
      evBookings: SEED_EV_BOOKINGS,

      /** Step 1: Create booking in payment_pending state — returns booking for payment screen */
      createAmenityBooking: (data) => {
        const otp = genOTP();
        const id  = uid('BK');
        const booking = {
          id,
          ...data,
          otp,
          qrCode: genQR('AMENITY', id, otp),
          status: data.amount > 0 ? 'payment_pending' : 'confirmed',
          paymentStatus: data.amount > 0 ? 'unpaid' : 'paid',
          checkedIn: false,
          checkedInAt: null,
          bookedAt: now(),
          paidAt: data.amount > 0 ? null : now(),
        };
        set(state => ({ amenityBookings: [booking, ...state.amenityBookings] }));
        // Push to admin store (free bookings are instantly confirmed)
        if (data.amount === 0) {
          try {
            const adminStore = require('./adminStore').default;
            adminStore.getState().addAmenityBooking(booking);
          } catch (e) {}
        }
        get().triggerRefresh('amenities');
        return booking;
      },

      /** Step 2: Resident pays for booking — marks confirmed, sends OTP notification */
      payAmenityBooking: (bookingId) => {
        let booking = null;
        set(state => {
          booking = state.amenityBookings.find(b => b.id === bookingId);
          return {
            amenityBookings: state.amenityBookings.map(b =>
              b.id === bookingId
                ? { ...b, status: 'confirmed', paymentStatus: 'paid', paidAt: now() }
                : b
            ),
          };
        });
        if (booking) {
          const paid = { ...booking, status: 'confirmed', paymentStatus: 'paid', paidAt: now() };
          // Push confirmed booking to admin
          try {
            const adminStore = require('./adminStore').default;
            adminStore.getState().addAmenityBooking(paid);
          } catch (e) {}
          // Notify resident
          get().addNotification({
            type: 'amenity',
            title: '✅ Amenity Booking Confirmed',
            body: `${booking.amenityName} on ${booking.date} at ${booking.slot} is confirmed. OTP: ${booking.otp}`,
            bookingId,
          });
        }
        get().triggerRefresh('amenities');
        return booking;
      },

      cancelBooking: (id) => {
        let booking = null;
        set(state => {
          booking = state.amenityBookings.find(b => b.id === id);
          return {
            amenityBookings: state.amenityBookings.map(b =>
              b.id === id ? { ...b, status: 'cancelled' } : b
            ),
          };
        });
        if (booking) {
          try {
            const adminStore = require('./adminStore').default;
            adminStore.getState().updateAmenityBookingStatus(id, 'cancelled');
          } catch (e) {}
        }
        get().triggerRefresh('amenities');
      },

      // ─── EV CHARGING ─────────────────────────────────────────────────────
      createEVBooking: (data) => {
        const otp = genOTP();
        const id  = uid('EV');
        const booking = {
          id,
          ...data,
          otp,
          qrCode: genQR('EV', id, otp),
          status: 'payment_pending',
          paymentStatus: 'unpaid',
          unitsConsumed: null,
          totalBill: null,
          checkedIn: false,
          checkedInAt: null,
          completedAt: null,
          bookedAt: now(),
          paidAt: null,
        };
        set(state => ({ evBookings: [booking, ...state.evBookings] }));
        get().triggerRefresh('amenities');
        return booking;
      },

      payEVBooking: (bookingId) => {
        let booking = null;
        set(state => {
          booking = state.evBookings.find(b => b.id === bookingId);
          return {
            evBookings: state.evBookings.map(b =>
              b.id === bookingId
                ? { ...b, status: 'booked', paymentStatus: 'paid', paidAt: now() }
                : b
            ),
          };
        });
        if (booking) {
          try {
            const adminStore = require('./adminStore').default;
            adminStore.getState().addEVBooking({ ...booking, status: 'booked', paymentStatus: 'paid', paidAt: now() });
          } catch (e) {}
          get().addNotification({
            type: 'ev',
            title: '⚡ EV Slot Booked',
            body: `Slot ${booking.slot} on ${booking.date} confirmed. OTP: ${booking.otp}`,
            bookingId,
          });
        }
        get().triggerRefresh('amenities');
        return booking;
      },

      // Called by securityStore when guard checks in at EV charger
      markEVCheckedIn: (bookingId) => {
        set(state => ({
          evBookings: state.evBookings.map(b =>
            b.id === bookingId ? { ...b, status: 'active', checkedIn: true, checkedInAt: now() } : b
          ),
        }));
        get().triggerRefresh('amenities');
      },

      // Called by securityStore when guard verifies amenity OTP/QR
      markAmenityCheckedIn: (bookingId, guardId, guardName) => {
        set(state => ({
          amenityBookings: state.amenityBookings.map(b =>
            b.id === bookingId ? { ...b, checkedIn: true, checkedInAt: now(), verifiedBy: guardId, verifiedByName: guardName } : b
          ),
        }));
        get().triggerRefresh('amenities');
      },


      // ─── NOTIFICATIONS ───────────────────────────────────────────────────
      notifications: SEED_NOTIFICATIONS,

      addNotification: (data) => {
        const n = {
          id: `NTF-${Date.now()}`,
          ...data,
          read: false,
          createdAt: new Date().toISOString(),
        };
        set(state => ({ notifications: [n, ...state.notifications] }));
        get().triggerRefresh('notifications');
      },

      markNotificationRead: (id) => {
        set(state => ({
          notifications: state.notifications.map(n =>
            n.id === id ? { ...n, read: true } : n
          ),
        }));
      },

      markAllNotificationsRead: () => {
        set(state => ({
          notifications: state.notifications.map(n => ({ ...n, read: true })),
        }));
      },

      /** Merge arbitrary fields into a notification (used to persist walkin decision) */
      updateNotification: (id, fields) => {
        set(state => ({
          notifications: state.notifications.map(n =>
            n.id === id ? { ...n, ...fields } : n
          ),
        }));
      },

      // ─── GPS DATA ────────────────────────────────────────────────────────
      gpsData: {
        societyName: 'BS Gated Community',
        location: { lat: 17.385, lng: 78.4867 },
        gates: [
          { id: 'G1', name: 'Main Gate', status: 'open',   guards: 2 },
          { id: 'G2', name: 'Side Gate', status: 'closed', guards: 1 },
        ],
        lastUpdated: new Date().toISOString(),
      },

      society: {
        name: 'BS Gated Community',
        address: 'Hyderabad, Telangana',
        totalUnits: 120,
        totalBlocks: 4,
        amenitiesCount: 6,
        managementContact: '+91 99999 00000',
      },

      // ─── PROFILE DATA ─────────────────────────────────────────────────────
      profileData: {
        dob:'', gender:'', emergencyName:'', emergencyPhone:'',
        family:[],
        vehicles:[{ id:'VEH-001', number:'TS09AB1234', type:'Car', model:'Maruti Swift', colour:'White', rfidStatus:'assigned', insuranceExpiry:'', pucExpiry:'' }],
        pets:[],
      },
      updateProfile: (fields) => set(s => ({ profileData:{ ...s.profileData, ...fields } })),

      addFamilyMember: (data) => set(s => ({ profileData:{ ...s.profileData, family:[...s.profileData.family, { id:`FAM-${Date.now()}`, ...data, addedAt:new Date().toISOString() }] } })),
      updateFamilyMember: (id, data) => set(s => ({ profileData:{ ...s.profileData, family:s.profileData.family.map(m => m.id===id?{...m,...data}:m) } })),
      deleteFamilyMember: (id) => set(s => ({ profileData:{ ...s.profileData, family:s.profileData.family.filter(m => m.id!==id) } })),

      addVehicle: (data) => set(s => ({ profileData:{ ...s.profileData, vehicles:[...s.profileData.vehicles, { id:`VEH-${Date.now()}`, rfidStatus:'pending', ...data, addedAt:new Date().toISOString() }] } })),
      updateVehicle: (id, data) => set(s => ({ profileData:{ ...s.profileData, vehicles:s.profileData.vehicles.map(v => v.id===id?{...v,...data}:v) } })),
      deleteVehicle: (id) => set(s => ({ profileData:{ ...s.profileData, vehicles:s.profileData.vehicles.filter(v => v.id!==id) } })),

      addPet: (data) => set(s => ({ profileData:{ ...s.profileData, pets:[...s.profileData.pets, { id:`PET-${Date.now()}`, ...data, addedAt:new Date().toISOString() }] } })),
      updatePet: (id, data) => set(s => ({ profileData:{ ...s.profileData, pets:s.profileData.pets.map(p => p.id===id?{...p,...data}:p) } })),
      deletePet: (id) => set(s => ({ profileData:{ ...s.profileData, pets:s.profileData.pets.filter(p => p.id!==id) } })),

      // ─── UNIT DATA ────────────────────────────────────────────────────────
      unitData: { block:'Tower A', floor:'1', bhk:'2 BHK', sqft:'1100', facing:'East', parkingSlot:'P-12', ownershipType:'Owner', ownershipDate:'15 Jan 2020', landlordName:'', landlordPhone:'', leaseStart:'', leaseEnd:'', aadhaarVerified:true, panVerified:false },
      updateUnit: (fields) => set(s => ({ unitData:{ ...s.unitData, ...fields } })),

      // ─── NOTIFICATION PREFERENCES ─────────────────────────────────────────
      notifPrefs: {
        masterMute:false, dndEnabled:false, dndFrom:'22:00', dndTo:'07:00',
        categories:{ visitors:{enabled:true,push:true,sms:false,email:false}, bills:{enabled:true,push:true,sms:true,email:false}, maintenance:{enabled:true,push:true,sms:false,email:false}, sos:{enabled:true,push:true,sms:true,email:false}, amenities:{enabled:true,push:true,sms:false,email:false}, marketplace:{enabled:true,push:true,sms:false,email:false}, announcements:{enabled:true,push:true,sms:false,email:false}, parking:{enabled:true,push:true,sms:false,email:false}, walkin:{enabled:true,push:true,sms:false,email:false} },
      },
      updateNotifPrefs: (prefs) => set(() => ({ notifPrefs:prefs })),

      // ─── WAITLIST ─────────────────────────────────────────────────────────
      waitlistEntries: [],
      joinWaitlist: (data) => {
        const entry = { id:`WL-${Date.now()}`, ...data, status:'waiting', queuePosition:1, joinedAt:new Date().toISOString() };
        set(s => ({ waitlistEntries:[...s.waitlistEntries, entry] }));
        return entry;
      },
      leaveWaitlist: (id) => set(s => ({ waitlistEntries:s.waitlistEntries.filter(e => e.id!==id) })),
      notifyWaitlist: (id) => set(s => ({ waitlistEntries:s.waitlistEntries.map(e => e.id===id?{...e, status:'notified', minutesLeft:30, notifiedAt:new Date().toISOString()}:e) })),
      confirmWaitlist: (id) => set(s => ({ waitlistEntries:s.waitlistEntries.map(e => e.id===id?{...e, status:'confirmed'}:e) })),

      // ─── ADVANCE CREDIT ───────────────────────────────────────────────────
      advanceCredit: 0,
      addAdvanceCredit: (amount) => set(s => ({ advanceCredit: s.advanceCredit + amount })),
      useAdvanceCredit: (amount) => set(s => ({ advanceCredit: Math.max(0, s.advanceCredit - amount) })),
    }),
    {
      name: 'bs-resident-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useResidentStore;