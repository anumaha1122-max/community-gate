/**
 * ApprovalGuard.js
 *
 * UPDATED: ApprovalGuard no longer blocks access.
 * Pending users can access their dashboard freely.
 * The VerificationScreen (inside profile) handles the pending flow.
 *
 * The withApprovalGuard HOC and useApprovalGuard hook are kept for
 * any screens that need to read approvalStatus.
 */

import React from 'react';
import { useAuthStore } from '../store/AuthStore';

// ─── Component guard — just renders children (no blocking) ────────────────────
export default function ApprovalGuard({ children }) {
  return children;
}

// ─── HOC guard — just renders component (no blocking) ────────────────────────
export function withApprovalGuard(WrappedComponent) {
  return function ApprovalGuardedScreen(props) {
    return <WrappedComponent {...props} />;
  };
}

// ─── Hook — still useful for reading status in UI ────────────────────────────
export function useApprovalGuard() {
  const approvalStatus = useAuthStore((state) => state.approvalStatus);
  return {
    isApproved:    approvalStatus === 'approved',
    isPending:     approvalStatus === 'pending',
    isRejected:    approvalStatus === 'rejected',
    approvalStatus,
  };
}
