/**
 * AuthStore.js
 *
 * NEW WORKFLOW:
 * 1. registerUser() → saves user, auto-logs in (isLoggedIn=true), kycStatus='not_submitted'
 *    → goes straight to role dashboard
 * 2. loginUser() (returning user):
 *    - not_submitted / pending → returns status, LoginScreen shows WaitingApproval
 *    - approved               → isLoggedIn=true → dashboard
 *    - any credentials work (demo — backend later)
 * 3. Inside dashboard, Profile > Verify → VerificationScreen → submitVerification → pending
 * 4. Admin/SuperAdmin approves → kycStatus='approved' → all tabs unlock
 * 5. Demo login() → always straight to dashboard (bypasses all checks)
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const DEMO_PENDING_USERS = [
  { id: 'demo-res-001', name: 'Priya Sharma', phone: '9876500001', password: 'pass123', role: 'resident', flat: 'B-204', block: 'B', status: 'active', approvalStatus: 'not_submitted', kycStatus: 'not_submitted', docsSubmitted: false, createdAt: new Date(Date.now() - 2 * 3600000).toISOString() },
  { id: 'demo-ven-001', name: 'Raju Electricals', phone: '9876500002', password: 'pass123', role: 'vendor', vendorType: 'business', businessName: 'Raju Electricals', status: 'active', approvalStatus: 'not_submitted', kycStatus: 'not_submitted', docsSubmitted: false, createdAt: new Date(Date.now() - 5 * 3600000).toISOString() },
  { id: 'demo-ven-002', name: 'Fresh Mart Store', phone: '9876500006', password: 'pass123', role: 'vendor', vendorType: 'marketplace', businessName: 'Fresh Mart Store', status: 'active', approvalStatus: 'not_submitted', kycStatus: 'not_submitted', docsSubmitted: false, createdAt: new Date(Date.now() - 6 * 3600000).toISOString() },
  { id: 'demo-sec-001', name: 'Mohan Singh', phone: '9876500003', password: 'pass123', role: 'security', gate: 'Main Gate', status: 'active', approvalStatus: 'not_submitted', kycStatus: 'not_submitted', docsSubmitted: false, createdAt: new Date(Date.now() - 24 * 3600000).toISOString() },
  { id: 'demo-adm-001', name: 'Kavita Reddy', phone: '9876500004', password: 'pass123', role: 'admin', status: 'active', approvalStatus: 'not_submitted', kycStatus: 'not_submitted', docsSubmitted: false, createdAt: new Date(Date.now() - 3 * 3600000).toISOString() },
  { id: 'demo-bld-001', name: 'Suresh Constructions', phone: '9876500005', password: 'pass123', role: 'builder', company: 'Suresh Constructions Pvt Ltd', status: 'active', approvalStatus: 'not_submitted', kycStatus: 'not_submitted', docsSubmitted: false, createdAt: new Date(Date.now() - 4 * 3600000).toISOString() },
];

// Demo seed users — always approved, always go straight to dashboard
const SEED_USERS = {
  resident: { id: 1, name: 'John Resident', phone: '9876543210', role: 'resident', approvalStatus: 'approved', kycStatus: 'approved', token: 'token-resident-demo' },
  admin: { id: 3, name: 'Admin User', phone: '9000000001', role: 'admin', approvalStatus: 'approved', kycStatus: 'approved', token: 'token-admin-demo' },
  superadmin: { id: 4, name: 'Super Admin', phone: '9000000000', role: 'superadmin', approvalStatus: 'approved', kycStatus: 'approved', token: 'token-superadmin-demo' },
  vendor: { id: 2, name: 'Bob Vendor', phone: '8765432100', role: 'vendor', approvalStatus: 'approved', kycStatus: 'approved', token: 'token-vendor-demo', company: 'Fix-It Pro' },
  security: { id: 5, name: 'Sam Security', phone: '7654321000', role: 'security', approvalStatus: 'approved', kycStatus: 'approved', token: 'token-security-demo' },
  builder: { id: 6, name: 'Builder Corp', phone: '9988776655', role: 'builder', approvalStatus: 'approved', kycStatus: 'approved', token: null },
  customer: { id: 7, name: 'Demo Customer', phone: '9000001111', role: 'customer', approvalStatus: 'approved', kycStatus: 'approved', verified: true, token: 'token-customer-demo' },
};

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      role: null,
      approvalStatus: null,
      isLoggedIn: false,
      builderRegistration: null,
      registeredUsers: DEMO_PENDING_USERS,

      // ── Helpers ──────────────────────────────────────────────────────────
      isApproved: () => get().approvalStatus === 'approved',
      isAdmin: () => get().role === 'admin',
      isResident: () => get().role === 'resident',
      isVendor: () => get().role === 'vendor',
      isSecurity: () => get().role === 'security',
      isSuperAdmin: () => get().role === 'superadmin',
      isBuilder: () => get().role === 'builder',
      isCustomer: () => get().role === 'customer',

      // ── Demo login — bypasses all checks, goes straight to dashboard ─────
      login: (roleOrUser, tokenOverride) => {
        if (typeof roleOrUser === 'string' && SEED_USERS[roleOrUser]) {
          const u = SEED_USERS[roleOrUser];
          set({ user: u, token: tokenOverride ?? u.token, role: u.role, approvalStatus: u.approvalStatus, isLoggedIn: true });
          return;
        }
        if (typeof roleOrUser === 'object' && roleOrUser !== null) {
          const u = roleOrUser;
          set({ user: u, token: tokenOverride ?? u.token ?? null, role: u.role, approvalStatus: u.approvalStatus ?? 'approved', isLoggedIn: true });
        }
      },

      setUser: (fields) =>
        set((s) => ({
          user: s.user ? { ...s.user, ...fields } : fields,
          ...(fields.role ? { role: fields.role } : {}),
          ...(fields.approvalStatus ? { approvalStatus: fields.approvalStatus } : {}),
          ...(fields.token ? { token: fields.token } : {}),
        })),

      setRole: (role) => set((s) => ({ role, user: s.user ? { ...s.user, role } : { role } })),
      setApprovalStatus: (kycStatus) => set((s) => ({ kycStatus, user: s.user ? { ...s.user, kycStatus } : { kycStatus } })),
      setToken: (token) => set({ token }),

      // ── Register — saves user AND auto-logs in → goes to dashboard ────────
      // kycStatus starts as 'not_submitted'
      // Dashboard tabs are locked until approved (handled in each dashboard)
      registerUser: (userData) => {
        const users = get().registeredUsers;
        // Demo: any phone is accepted (no duplicate check in demo mode)
        const newUser = {
          id: `usr-${Date.now()}`,
          ...userData,
          kycStatus: 'not_submitted',
          status: 'registered',
          docsSubmitted: false,
          createdAt: new Date().toISOString(),
        };
        set({
          registeredUsers: [...users, newUser],
          // Auto-login straight to dashboard
          user: newUser,
          token: `token-${newUser.id}`,
          role: newUser.role,
          kycStatus: 'not_submitted',
          isLoggedIn: true,
        });
        return { success: true, user: newUser };
      },
 
      // ── Admin Register — just saves, no login ──────────────────────────────
      registerNewUser: async (userData) => {
        try {
          const { AuthApi } = require('../services/authApi');
          
          // 1. Register
          const regData = {
            ...userData,
            unit: userData.unit || 'V-000', // Vendors might not have units
            role: userData.role || 'vendor'
          };
          const savedUser = await AuthApi.registerResident(regData);
          
          if (savedUser && savedUser.id) {
            // 2. Auto-approve since Admin is adding
            await AuthApi.approveResident(savedUser.id);
            
            // 3. Refresh list
            await get().fetchUsers();
            return { success: true, user: savedUser };
          }
          return { success: false, message: 'Failed to save user' };
        } catch (error) {
          console.error('Register New User Error:', error);
          return { success: false, message: error.message };
        }
      },
 
      fetchUsers: async () => {
        try {
          const { MaintenanceApi } = require('../services/maintenanceApi');
          const [residents, vendors] = await Promise.all([
            MaintenanceApi.getAllResidents(),
            MaintenanceApi.getAllVendors()
          ]);
          
          // Deduplicate by ID
          const userMap = new Map();
          [...(residents || []), ...(vendors || [])].forEach(u => {
            if (u && u.id) userMap.set(u.id, u);
          });
          
          set({ registeredUsers: Array.from(userMap.values()) });
        } catch (error) {
          console.error('Fetch Users Error:', error);
        }
      },

      // ── Normal login (returning user) ─────────────────────────────────────
      // not_submitted → LoginScreen shows WaitingApproval (no login)
      // pending       → LoginScreen shows WaitingApproval (no login)
      // approved      → isLoggedIn=true → dashboard
      // Any credentials accepted (demo — real auth done on backend later)
      loginUser: (phone, password) => {
        // Demo mode: credentials are NOT verified.
        // Only phone number is used to find the user.
        // Password field is ignored — backend will handle real auth later.
        const users = get().registeredUsers;
        const clean = (phone || '').toString().trim().replace(/\s+/g, '');

        // Match by phone (exact, or last 10 digits)
        const found = users.find(u => {
          const uPhone = (u.phone || '').toString().trim().replace(/\s+/g, '');
          return uPhone === clean || uPhone.slice(-10) === clean.slice(-10);
        });

        if (!found) {
          return { success: false, status: 'not_found', message: 'No account found with this mobile number. Please register first.' };
        }

        // No password check — demo mode. Real auth on backend later.
        const vs = found.kycStatus || 'not_submitted';

        // Only set isLoggedIn=true for approved users
        // pending / not_submitted → LoginScreen shows WaitingApproval
        if (vs === 'approved') {
          set({
            user: found,
            token: found.token ?? `token-${found.id}`,
            role: found.role,
            approvalStatus: found.approvalStatus ?? 'approved',
            isLoggedIn: true,
          });
        }

        return {
          success: true,
          verificationStatus: vs,
          user: found,
        };
      },

      markDocsSubmitted: () => {
        const user = get().user;
        if (!user) return;
        set(s => ({
          user: { ...s.user, docsSubmitted: true },
          registeredUsers: s.registeredUsers.map(u =>
            u.id === user.id ? { ...u, docsSubmitted: true } : u
          ),
        }));
      },

      // Called from VerificationScreen inside dashboard Profile
      // Does NOT change isLoggedIn — user stays in dashboard, tabs stay locked
      submitVerification: (userId) => {
        const uid = userId || get().user?.id;
        if (!uid) return;
        set(s => ({
          registeredUsers: s.registeredUsers.map(u =>
            u.id === uid
              ? { ...u, verificationStatus: 'pending', status: 'pending_approval', docsSubmitted: true }
              : u
          ),
          ...(s.user?.id === uid
            ? { user: { ...s.user, verificationStatus: 'pending', status: 'pending_approval', docsSubmitted: true } }
            : {}),
        }));
      },

      // Called from Admin / SuperAdmin approval screens
      approveVerification: (userId, approve = true) => {
        const newStatus = approve ? 'approved' : 'rejected';
        const currentUser = get().user;
        set(s => ({
          registeredUsers: s.registeredUsers.map(u =>
            u.id === userId
              ? { ...u, verificationStatus: newStatus, approvalStatus: newStatus, status: newStatus }
              : u
          ),
          ...(currentUser?.id === userId ? {
            approvalStatus: newStatus,
            user: { ...currentUser, verificationStatus: newStatus, approvalStatus: newStatus, status: newStatus },
          } : {}),
        }));
      },

      ensureSeedUsers: () => {
        const existing = get().registeredUsers;
        const existingIds = existing.map(u => u.id);
        const missing = DEMO_PENDING_USERS.filter(u => !existingIds.includes(u.id));
        if (missing.length > 0) {
          set({ registeredUsers: [...existing, ...missing] });
        }
      },

      // backward compat
      approveUser: (userId, approve = true) => {
        const currentUser = get().user;
        const newStatus = approve ? 'approved' : 'rejected';
        set(s => ({
          registeredUsers: s.registeredUsers.map(u =>
            u.id === userId
              ? { ...u, status: newStatus, approvalStatus: newStatus, verificationStatus: newStatus }
              : u
          ),
          ...(currentUser?.id === userId ? {
            approvalStatus: newStatus,
            user: { ...currentUser, approvalStatus: newStatus, status: newStatus, verificationStatus: newStatus },
          } : {}),
        }));
      },

      getUsersByRole: (role) => get().registeredUsers.filter(u => u.role === role),
      getPendingUsers: () => get().registeredUsers.filter(u => u.verificationStatus === 'pending'),

      setVendorType: (vendorType) => {
        set(s => ({
          user: s.user ? { ...s.user, vendorType } : { vendorType },
          registeredUsers: s.registeredUsers.map(u =>
            u.id === s.user?.id ? { ...u, vendorType } : u
          ),
        }));
      },

      logout: () => set({ user: null, token: null, role: null, approvalStatus: null, isLoggedIn: false }),

      setBuilderRegistration: (email, reqId) => set({ builderRegistration: { email, reqId } }),
      clearBuilderRegistration: () => set({ builderRegistration: null }),

      loginAsCustomer: (customerData) =>
        set({
          user: { ...customerData, role: 'customer', approvalStatus: 'approved', verificationStatus: 'approved' },
          token: customerData.token ?? `token-cust-${Date.now()}`,
          role: 'customer', approvalStatus: 'approved', isLoggedIn: true,
        }),

      loginAsBuilder: (builderRequest) =>
        set({
          builderRegistration: null,
          user: {
            id: builderRequest.id, name: builderRequest.companyName,
            email: builderRequest.email, phone: builderRequest.phone,
            city: builderRequest.city, reraNumber: builderRequest.reraNumber,
            role: 'builder', approvalStatus: 'approved', verificationStatus: 'approved',
          },
          token: builderRequest.token ?? null,
          role: 'builder', approvalStatus: 'approved', isLoggedIn: true,
        }),
    }),
    {
      name: 'bs-auth-v6',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        role: state.role,
        approvalStatus: state.approvalStatus,
        isLoggedIn: state.isLoggedIn,
        builderRegistration: state.builderRegistration,
        registeredUsers: state.registeredUsers,
      }),
    }
  )
);

export default useAuthStore;
