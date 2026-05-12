import { fetchApi } from './api';

export const MaintenanceApi = {
  // GET all requests
  getAllRequests: () => fetchApi('/maintenance'),

  // GET by resident
  getRequestsByResident: (residentId) => fetchApi(`/maintenance/resident/${residentId}`),

  // GET by vendor
  getRequestsByVendor: (vendorId) => fetchApi(`/maintenance/vendor/${vendorId}`),

  // POST new request (Resident)
  submitRequest: (data) => fetchApi('/maintenance', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // PUT assign vendor (Admin)
  assignVendor: (id, vendorId) => fetchApi(`/maintenance/${id}/assign`, {
    method: 'PUT',
    body: JSON.stringify({ vendorId }),
  }),

  // POST submit quote (Vendor)
  submitQuote: (id, data) => fetchApi(`/maintenance/${id}/quote`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // PUT admin approve quote
  adminApproveQuote: (id) => fetchApi(`/maintenance/${id}/quote/admin-approve`, {
    method: 'PUT',
  }),

  // PUT resident reply to quote
  residentRespondToQuote: (id, accepted) => {
    const isAccepted = !!accepted && (accepted === true || accepted === 'true');
    return fetchApi(`/maintenance/${id}/quote/resident-reply?accepted=${isAccepted}`, {
      method: 'PUT',
    });
  },

  // PUT admin approve work start
  adminApproveWorkStart: (id) => fetchApi(`/maintenance/${id}/approve-start`, {
    method: 'PUT',
  }),

  // PUT guard validate gate OTP
  validateGateOtp: (id, otp) => fetchApi(`/maintenance/${id}/validate-otp?otp=${otp}`, {
    method: 'PUT',
  }),

  // PUT vendor complete step (0-based)
  vendorCompleteStep: (id, stepIndex) => fetchApi(`/maintenance/${id}/step?stepIndex=${stepIndex}`, {
    method: 'PUT',
  }),

  // PUT approve work step (Resident/Admin)
  approveWorkStep: (id, approved, approvedBy = 'Resident') => {
    const isApproved = !!approved && (approved === true || approved === 'true');
    if (approvedBy === 'Admin') {
      return fetchApi(`/maintenance/${id}/step/admin-approve?approved=${isApproved}`, { method: 'PUT' });
    }
    return fetchApi(`/maintenance/${id}/step/approve?approved=${isApproved}&approvedBy=${encodeURIComponent(approvedBy)}`, { method: 'PUT' });
  },

  // PUT vendor request payment
  vendorRequestPayment: (id) => fetchApi(`/maintenance/${id}/vendor-request-payment`, {
    method: 'PUT',
  }),

  // PUT admin request payment from resident
  adminRequestPaymentFromResident: (id) => fetchApi(`/maintenance/${id}/request-payment`, {
    method: 'PUT',
  }),

  // PUT resident pay
  residentPay: (id) => fetchApi(`/maintenance/${id}/pay`, {
    method: 'PUT',
  }),

  // PUT admin pay vendor
  adminPayVendor: (id) => fetchApi(`/maintenance/${id}/pay-vendor`, {
    method: 'PUT',
  }),
 
  // GET all vendors
  getAllVendors: () => fetchApi('/vendors'),
 
  // GET all residents
  getAllResidents: () => fetchApi('/residents'),
 
  // POST validate gate otp by only code
  validateGateOtpByCode: (otp) => fetchApi(`/maintenance/validate-otp?otp=${otp}`, {
    method: 'POST',
  }),
};
