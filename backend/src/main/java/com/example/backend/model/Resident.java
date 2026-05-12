package com.example.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "residents")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Resident {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String unit;

    @Column(nullable = false)
    private String phone;

    private String email;
    private String aadhaarUrl;
    private String panUrl;

    @Column(nullable = false)
    private boolean active;

    @Column(nullable = false)
    private LocalDate joinedAt;

    @Column(nullable = false)
    private String kycStatus; // pending, verified, rejected

    @Column(nullable = false)
    private String role; // resident, admin, etc.
}
