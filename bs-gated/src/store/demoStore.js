/**
 * demoStore.js
 *
 * Lightweight store that holds an optional "demo resident" context.
 * When demoResident is set, P2P Marketplace and Real Estate screens
 * use this identity instead of the logged-in user for the viewer's
 * perspective (to simulate a second resident's view).
 *
 * This does NOT affect authentication — only P2P/RE listing visibility
 * and "my listings" filtering in those two screens.
 *
 * Usage:
 *   const { demoResident, setDemoResident, clearDemoResident } = useDemoStore();
 *   const activeUser = demoResident || user;   // in P2P/RE screens
 */

import { create } from 'zustand';

export const useDemoStore = create((set) => ({
  demoResident: null,   // null | { id, name, unit, phone, ... }

  setDemoResident: (resident) => set({ demoResident: resident }),

  clearDemoResident: () => set({ demoResident: null }),
}));

export default useDemoStore;
