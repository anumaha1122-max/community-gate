package com.example.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "maintenance_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaintenanceRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Resident Info
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resident_id", nullable = false)
    @JsonIgnoreProperties({ "maintenanceRequests" })
    private Resident resident;

    // Request Details
    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(nullable = false)
    private String category; // Plumbing, Electrical, HVAC, etc.

    @Column(nullable = false)
    private String priority; // Low, Medium, High, Urgent

    private String preferredSlot; // Morning, Afternoon, Evening, Flexible
    private String contactPref; // Call, WhatsApp, In-App

    // Workflow Status — 14-stage lifecycle
    @Column(nullable = false)
    private String status; // submitted, quote_requested, quoted, quote_sent_to_resident,
                           // quote_accepted, quote_rejected, approved_to_start,
                           // work_in_progress, work_completed,
                           // payment_requested_to_admin, payment_requested_to_resident,
                           // payment_received, paid_to_vendor

    // Vendor Assignment
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "registered_vendor_id")
    @JsonIgnoreProperties({ "maintenanceRequests" })
    private Resident assignedVendor;

    // Gate OTP generated when admin approves work start
    private String vendorGateOtp;

    // Work stage tracking (0–11) — 12 internal stages during work_in_progress
    @Column(nullable = false)
    @Builder.Default
    private int workStep = 0;

    @Column(nullable = false)
    @Builder.Default
    private boolean pendingStepApproval = false;

    // Timestamps
    @Column(nullable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
    private LocalDateTime workCompletedAt;

    // Quote attached to this request (from vendor)
    @OneToOne(mappedBy = "request", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnoreProperties({ "request" })
    private MaintenanceQuote quote;

    // Timeline audit log
    @OneToMany(mappedBy = "request", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    @Builder.Default
    @JsonIgnoreProperties({ "request" })
    private List<MaintenanceTimeline> timeline = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
