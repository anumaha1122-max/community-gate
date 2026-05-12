/**
 * authApi.js
 * 
 * Authentication and registration API calls.
 */

import { fetchApi } from './api';

export const AuthApi = {
  /**
   * Register a new resident
   * @param {Object} data - { name, phone, password, role, ... }
   */
  registerResident: (data) => fetchApi('/residents', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  /**
   * Login user
   * @param {string} phone 
   * @param {string} password 
   */
  login: (phone, password) => fetchApi('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ phone, password }),
  }),
  
  /**
   * Update KYC status (pending/verified/rejected)
   */
  updateKycStatus: (id, status) => fetchApi(`/residents/${id}/kyc?status=${status}`, {
    method: 'PUT',
  }),

  /**
   * Get current user profile
   */
  getProfile: () => fetchApi('/auth/profile'),

  /**
   * Admin: Get all residents
   */
  getAllResidents: () => fetchApi('/residents'),

  /**
   * Admin: Approve a resident
   */
  approveResident: (id) => fetchApi(`/residents/${id}/approve`, {
    method: 'PUT',
  }),

  /**
   * Admin: Reject a resident
   */
  rejectResident: (id) => fetchApi(`/residents/${id}/reject`, {
    method: 'PUT',
  }),
};
