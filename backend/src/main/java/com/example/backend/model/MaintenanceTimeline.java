package com.example.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "maintenance_timeline")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaintenanceTimeline {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "request_id", nullable = false)
    private MaintenanceRequest request;

    @Column(nullable = false)
    private String action;   // e.g. "Quote submitted", "Work step 3 approved"

    private String actionBy; // e.g. "Admin", "Resident", "Vendor"

    @Column(nullable = false)
    private LocalDateTime actionAt;

    @Column(columnDefinition = "TEXT")
    private String note;

    @PrePersist
    protected void onCreate() {
        actionAt = LocalDateTime.now();
    }
}
