package com.example.backend.service;

import com.example.backend.dto.MaintenanceRequestDTO;
import com.example.backend.dto.QuoteSubmitDTO;
import com.example.backend.model.*;
import com.example.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class MaintenanceService {

    private final MaintenanceRepository maintenanceRepository;
    private final MaintenanceQuoteRepository quoteRepository;
    private final ResidentRepository residentRepository;

    // ─── Helper ───────────────────────────────────────────────────────────────

    private MaintenanceRequest findRequest(Long id) {
        return maintenanceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Maintenance request not found: " + id));
    }

    private void addTimeline(MaintenanceRequest req, String action, String by, String note) {
        MaintenanceTimeline entry = MaintenanceTimeline.builder()
                .request(req)
                .action(action)
                .actionBy(by)
                .actionAt(LocalDateTime.now())
                .note(note)
                .build();
        req.getTimeline().add(entry);
    }

    private String generateOtp() {
        return String.format("%06d", new Random().nextInt(999999));
    }

    // ─── RESIDENT: Submit new request ────────────────────────────────────────

    @Transactional
    public MaintenanceRequest submitRequest(MaintenanceRequestDTO dto) {
        Resident resident = residentRepository.findById(dto.getResidentId())
                .orElseThrow(() -> new RuntimeException("Resident not found: " + dto.getResidentId()));

        MaintenanceRequest req = MaintenanceRequest.builder()
                .resident(resident)
                .title(dto.getTitle())
                .description(dto.getDescription())
                .category(dto.getCategory())
                .priority(dto.getPriority())
                .preferredSlot(dto.getPreferredSlot())
                .contactPref(dto.getContactPref())
                .status("submitted")
                .workStep(0)
                .pendingStepApproval(false)
                .build();

        addTimeline(req, "Request submitted by resident", resident.getName(), null);
        return maintenanceRepository.save(req);
    }

    // ─── ADMIN: Send quote request to vendor(s) ───────────────────────────────

    @Transactional
    public MaintenanceRequest assignVendor(Long requestId, Long vendorId) {
        MaintenanceRequest req = findRequest(requestId);
        Resident vendor = residentRepository.findById(vendorId)
                .orElseThrow(() -> new RuntimeException("Vendor not found: " + vendorId));

        req.setAssignedVendor(vendor);
        req.setStatus("quote_requested");
        addTimeline(req, "Quote requested from vendor: " + vendor.getName(), "Admin", null);
        return maintenanceRepository.save(req);
    }

    // ─── VENDOR: Submit quote ─────────────────────────────────────────────────

    @Transactional
    public MaintenanceRequest submitQuote(Long requestId, QuoteSubmitDTO dto) {
        MaintenanceRequest req = findRequest(requestId);
        Resident vendor = residentRepository.findById(dto.getVendorId())
                .orElseThrow(() -> new RuntimeException("Vendor not found: " + dto.getVendorId()));

        // Handle quote relationship
        MaintenanceQuote quote = req.getQuote();
        if (quote == null) {
            quote = new MaintenanceQuote();
            quote.setRequest(req);
        }
        
        quote.setVendor(vendor);
        quote.setAmount(dto.getAmount());
        quote.setDescription(dto.getDescription());
        quote.setEta(dto.getEta());
        quote.setEstimatedDays(dto.getEstimatedDays());

        req.setQuote(quote);

        req.setStatus("quoted");
        addTimeline(req, "Quote submitted by vendor: ₹" + dto.getAmount(), vendor.getName(), dto.getDescription());
        return maintenanceRepository.save(req);
    }

    // ─── ADMIN: Forward quote to resident ────────────────────────────────────

    @Transactional
    public MaintenanceRequest adminApproveQuote(Long requestId) {
        MaintenanceRequest req = findRequest(requestId);
        req.setStatus("quote_sent_to_resident");
        addTimeline(req, "Quote forwarded to resident by Admin", "Admin", null);
        return maintenanceRepository.save(req);
    }

    // ─── RESIDENT: Accept or reject quote ────────────────────────────────────

    @Transactional
    public MaintenanceRequest residentRespondToQuote(Long requestId, boolean accepted) {
        MaintenanceRequest req = findRequest(requestId);
        String residentName = req.getResident().getName();
        if (accepted) {
            req.setStatus("quote_accepted");
            addTimeline(req, "Quote accepted by resident", residentName, null);
        } else {
            req.setStatus("quote_rejected");
            addTimeline(req, "Quote rejected by resident", residentName, null);
        }
        return maintenanceRepository.save(req);
    }

    // ─── ADMIN: Approve work start & generate Gate OTP ───────────────────────

    @Transactional
    public MaintenanceRequest adminApproveWorkStart(Long requestId) {
        MaintenanceRequest req = findRequest(requestId);
        String otp = generateOtp();
        req.setVendorGateOtp(otp);
        req.setStatus("approved_to_start");
        addTimeline(req, "Work approved to start. Gate OTP generated: " + otp, "Admin", null);
        return maintenanceRepository.save(req);
    }

    @Transactional
    public MaintenanceRequest validateGateOtp(Long id, String otp) {
        MaintenanceRequest req = findRequest(id);
        if (req.getVendorGateOtp() == null || !req.getVendorGateOtp().equals(otp)) {
            throw new RuntimeException("Invalid Gate OTP for Request ID: " + id);
        }

        req.setStatus("work_in_progress");
        req.setVendorGateOtp(null);
        addTimeline(req, "Vendor verified at gate. Work in progress.", "Security", null);
        return maintenanceRepository.save(req);
    }

    @Transactional
    public MaintenanceRequest validateGateOtp(String otp) {
        MaintenanceRequest req = maintenanceRepository.findByVendorGateOtp(otp)
                .orElseThrow(() -> new RuntimeException("Invalid Gate OTP: " + otp));
 
        req.setStatus("work_in_progress");
        req.setVendorGateOtp(null); // Clear OTP after successful entry
        addTimeline(req, "Vendor verified at gate. Work in progress.", "Security", null);
        return maintenanceRepository.save(req);
    }
 
    // ─── VENDOR: Complete a work step (0–11) ─────────────────────────────────

    @Transactional
    public MaintenanceRequest vendorCompleteStep(Long requestId, int stepIndex) {
        MaintenanceRequest req = findRequest(requestId);
        req.setStatus("work_in_progress");
        req.setWorkStep(stepIndex);
        req.setPendingStepApproval(true);

        String[] STAGES = {
                "Work Initiated", "Site Visit Done", "Material Planning", "Material Approved",
                "Material Procured", "Work in Progress", "Quality Check", "Testing",
                "Snag / Issue Fixing", "Final Inspection", "Handover to Resident", "Work Completed"
        };
        String stageName = stepIndex < STAGES.length ? STAGES[stepIndex] : "Stage " + (stepIndex + 1);
        String vendorName = req.getAssignedVendor() != null ? req.getAssignedVendor().getName() : "Vendor";
        addTimeline(req, "Work step " + (stepIndex + 1) + " completed: " + stageName, vendorName, "Awaiting approval");
        return maintenanceRepository.save(req);
    }

    // ─── RESIDENT or ADMIN: Approve or reject a work step ────────────────────

    @Transactional
    public MaintenanceRequest approveWorkStep(Long requestId, boolean approved, String approvedBy) {
        MaintenanceRequest req = findRequest(requestId);
        String[] STAGES = {
                "Work Initiated", "Site Visit Done", "Material Planning", "Material Approved",
                "Material Procured", "Work in Progress", "Quality Check", "Testing",
                "Snag / Issue Fixing", "Final Inspection", "Handover to Resident", "Work Completed"
        };
        int currentStep = req.getWorkStep();
        String stageName = currentStep < STAGES.length ? STAGES[currentStep] : "Stage " + (currentStep + 1);

        if (approved) {
            req.setPendingStepApproval(false);
            int nextStep = currentStep + 1;
            if (nextStep >= 12) {
                // All stages done — mark work complete
                req.setWorkStep(12);
                req.setStatus("work_completed");
                req.setWorkCompletedAt(LocalDateTime.now());
                addTimeline(req, "All work stages approved. Work completed!", approvedBy, null);
            } else {
                // Advance to next stage
                req.setWorkStep(nextStep);
                String nextStageName = STAGES[nextStep];
                addTimeline(req, "Stage " + (currentStep + 1) + " \"" + stageName + "\" approved by " + approvedBy + ". Proceed with Stage " + (nextStep + 1) + " \"" + nextStageName + "\".", approvedBy, null);
            }
        } else {
            req.setPendingStepApproval(false);
            // Rejected — keep workStep the same so vendor retries same stage
            addTimeline(req, "Stage " + (currentStep + 1) + " \"" + stageName + "\" rejected by " + approvedBy + " — vendor must redo.", approvedBy, null);
        }
        return maintenanceRepository.save(req);
    }

    // ─── VENDOR: Request payment from admin ──────────────────────────────────

    @Transactional
    public MaintenanceRequest vendorRequestPayment(Long requestId) {
        MaintenanceRequest req = findRequest(requestId);
        req.setStatus("payment_requested_to_admin");
        String vendorName = req.getAssignedVendor() != null ? req.getAssignedVendor().getName() : "Vendor";
        addTimeline(req, "Payment requested by vendor", vendorName, null);
        return maintenanceRepository.save(req);
    }

    // ─── ADMIN: Request payment from resident ────────────────────────────────

    @Transactional
    public MaintenanceRequest adminRequestPaymentFromResident(Long requestId) {
        MaintenanceRequest req = findRequest(requestId);
        req.setStatus("payment_requested_to_resident");
        addTimeline(req, "Payment requested from resident by Admin", "Admin", null);
        return maintenanceRepository.save(req);
    }

    // ─── RESIDENT: Pay ───────────────────────────────────────────────────────

    @Transactional
    public MaintenanceRequest residentPay(Long requestId) {
        MaintenanceRequest req = findRequest(requestId);
        req.setStatus("payment_received");
        addTimeline(req, "Payment received from resident", req.getResident().getName(), null);
        return maintenanceRepository.save(req);
    }

    // ─── ADMIN: Pay vendor & close job ───────────────────────────────────────

    @Transactional
    public MaintenanceRequest adminPayVendor(Long requestId) {
        MaintenanceRequest req = findRequest(requestId);
        req.setStatus("paid_to_vendor");
        addTimeline(req, "Vendor paid. Job closed.", "Admin", null);
        return maintenanceRepository.save(req);
    }

    // ─── READ Queries ─────────────────────────────────────────────────────────

    public List<MaintenanceRequest> getAllRequests() {
        return maintenanceRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<MaintenanceRequest> getRequestsByResident(Long residentId) {
        return maintenanceRepository.findByResidentIdOrderByCreatedAtDesc(residentId);
    }

    public List<MaintenanceRequest> getRequestsByVendor(Long vendorId) {
        return maintenanceRepository.findByAssignedVendorIdOrderByCreatedAtDesc(vendorId);
    }

    public List<MaintenanceRequest> getRequestsByStatus(String status) {
        return maintenanceRepository.findByStatusOrderByCreatedAtDesc(status);
    }

    public MaintenanceRequest getById(Long id) {
        return findRequest(id);
    }

}