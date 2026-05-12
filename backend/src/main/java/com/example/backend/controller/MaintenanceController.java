package com.example.backend.controller;

import com.example.backend.dto.MaintenanceRequestDTO;
import com.example.backend.dto.QuoteSubmitDTO;
import com.example.backend.model.MaintenanceRequest;
import com.example.backend.service.MaintenanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/maintenance")
@RequiredArgsConstructor
public class MaintenanceController {

    private final MaintenanceService maintenanceService;

    // ─── READ ─────────────────────────────────────────────────────────────────

    /** Admin: Get all maintenance requests */
    @GetMapping
    public ResponseEntity<List<MaintenanceRequest>> getAllRequests() {
        return ResponseEntity.ok(maintenanceService.getAllRequests());
    }

    /** Get single request by ID */
    @GetMapping("/{id}")
    public ResponseEntity<MaintenanceRequest> getById(@PathVariable Long id) {
        return ResponseEntity.ok(maintenanceService.getById(id));
    }

    /** Resident: Get all their own requests */
    @GetMapping("/resident/{residentId}")
    public ResponseEntity<List<MaintenanceRequest>> getByResident(@PathVariable Long residentId) {
        return ResponseEntity.ok(maintenanceService.getRequestsByResident(residentId));
    }

    /** Vendor: Get all their assigned jobs */
    @GetMapping("/vendor/{vendorId}")
    public ResponseEntity<List<MaintenanceRequest>> getByVendor(@PathVariable Long vendorId) {
        return ResponseEntity.ok(maintenanceService.getRequestsByVendor(vendorId));
    }

    /** Admin: Filter by status */
    @GetMapping("/status/{status}")
    public ResponseEntity<List<MaintenanceRequest>> getByStatus(@PathVariable String status) {
        return ResponseEntity.ok(maintenanceService.getRequestsByStatus(status));
    }

    // ─── RESIDENT FLOW ────────────────────────────────────────────────────────

    /** Step 1 — Resident submits a new maintenance request */
    @PostMapping
    public ResponseEntity<MaintenanceRequest> submitRequest(
            @Valid @RequestBody MaintenanceRequestDTO dto) {
        return new ResponseEntity<>(maintenanceService.submitRequest(dto), HttpStatus.CREATED);
    }

    /** Step 9 — Resident accepts or rejects the quote forwarded by admin */
    @PutMapping("/{id}/quote/resident-reply")
    public ResponseEntity<MaintenanceRequest> residentRespondToQuote(
            @PathVariable Long id,
            @RequestParam boolean accepted) {
        return ResponseEntity.ok(maintenanceService.residentRespondToQuote(id, accepted));
    }

    /** Step 12 — Resident approves or rejects a vendor work step */
    @PutMapping("/{id}/step/approve")
    public ResponseEntity<MaintenanceRequest> approveWorkStep(
            @PathVariable Long id,
            @RequestParam boolean approved,
            @RequestParam(defaultValue = "Resident") String approvedBy) {
        return ResponseEntity.ok(maintenanceService.approveWorkStep(id, approved, approvedBy));
    }

    /** Step 14 — Resident pays for the completed work */
    @PutMapping("/{id}/pay")
    public ResponseEntity<MaintenanceRequest> residentPay(@PathVariable Long id) {
        return ResponseEntity.ok(maintenanceService.residentPay(id));
    }

    // ─── ADMIN FLOW ───────────────────────────────────────────────────────────

    /** Step 2 — Admin assigns a vendor and requests quote */
    @PutMapping("/{id}/assign")
    public ResponseEntity<MaintenanceRequest> assignVendor(
            @PathVariable Long id,
            @RequestBody Map<String, Long> body) {
        Long vendorId = body.get("vendorId");
        return ResponseEntity.ok(maintenanceService.assignVendor(id, vendorId));
    }

    /** Step 7 — Admin forwards vendor quote to resident */
    @PutMapping("/{id}/quote/admin-approve")
    public ResponseEntity<MaintenanceRequest> adminApproveQuote(@PathVariable Long id) {
        return ResponseEntity.ok(maintenanceService.adminApproveQuote(id));
    }

    /** Step 10 — Admin approves work start and generates Gate OTP */
    @PutMapping("/{id}/approve-start")
    public ResponseEntity<MaintenanceRequest> adminApproveWorkStart(@PathVariable Long id) {
        return ResponseEntity.ok(maintenanceService.adminApproveWorkStart(id));
    }

    /** Step 13a — Admin also can approve a vendor work step */
    @PutMapping("/{id}/step/admin-approve")
    public ResponseEntity<MaintenanceRequest> adminApproveWorkStep(
            @PathVariable Long id,
            @RequestParam boolean approved) {
        return ResponseEntity.ok(maintenanceService.approveWorkStep(id, approved, "Admin"));
    }

    /** Step 15 — Admin requests payment from resident after vendor billing */
    @PutMapping("/{id}/request-payment")
    public ResponseEntity<MaintenanceRequest> adminRequestPaymentFromResident(@PathVariable Long id) {
        return ResponseEntity.ok(maintenanceService.adminRequestPaymentFromResident(id));
    }

    /** Step 16 — Admin pays vendor and closes the job */
    @PutMapping("/{id}/pay-vendor")
    public ResponseEntity<MaintenanceRequest> adminPayVendor(@PathVariable Long id) {
        return ResponseEntity.ok(maintenanceService.adminPayVendor(id));
    }

    // ─── VENDOR FLOW ──────────────────────────────────────────────────────────

    /** Step 5 — Vendor submits a quote */
    @PostMapping("/{id}/quote")
    public ResponseEntity<MaintenanceRequest> submitQuote(
            @PathVariable Long id,
            @Valid @RequestBody QuoteSubmitDTO dto) {
        return ResponseEntity.ok(maintenanceService.submitQuote(id, dto));
    }

    /** Step 11 — Vendor marks a work step as complete (0-based index) */
    @PutMapping("/{id}/step")
    public ResponseEntity<MaintenanceRequest> vendorCompleteStep(
            @PathVariable Long id,
            @RequestParam int stepIndex) {
        return ResponseEntity.ok(maintenanceService.vendorCompleteStep(id, stepIndex));
    }

    /** Step 14 — Vendor requests payment from admin after work is done */
    @PutMapping("/{id}/vendor-request-payment")
    public ResponseEntity<MaintenanceRequest> vendorRequestPayment(@PathVariable Long id) {
        return ResponseEntity.ok(maintenanceService.vendorRequestPayment(id));
    }
    @PutMapping("/{id}/validate-otp")
    public ResponseEntity<MaintenanceRequest> validateGateOtpById(
            @PathVariable Long id,
            @RequestParam String otp) {
        return ResponseEntity.ok(maintenanceService.validateGateOtp(id, otp));
    }

    @PostMapping("/validate-otp")
    public ResponseEntity<MaintenanceRequest> validateGateOtp(@RequestParam String otp) {
        return ResponseEntity.ok(maintenanceService.validateGateOtp(otp));
    }
}
