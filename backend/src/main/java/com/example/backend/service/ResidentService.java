package com.example.backend.service;

import com.example.backend.dto.ResidentRegistrationDTO;
import com.example.backend.model.Resident;
import com.example.backend.repository.ResidentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ResidentService {

    private final ResidentRepository residentRepository;

    public List<Resident> getAllResidents() {
        return residentRepository.findAll();
    }

    public Resident getResidentById(Long id) {
        return residentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resident not found with id: " + id));
    }

    @Transactional
    public Resident registerResident(ResidentRegistrationDTO dto) {
        Resident resident = Resident.builder()
                .name(dto.getName())
                .unit(dto.getUnit())
                .phone(dto.getPhone())
                .email(dto.getEmail())
                .aadhaarUrl(dto.getAadhaarUrl())
                .panUrl(dto.getPanUrl())
                .active(false)
                .joinedAt(LocalDate.now())
                .kycStatus("pending")
                .role(dto.getRole() != null ? dto.getRole() : "resident")
                .build();
        return residentRepository.save(resident);
    }

    @Transactional
    public Resident toggleActiveStatus(Long id) {
        Resident resident = getResidentById(id);
        resident.setActive(!resident.isActive());
        return residentRepository.save(resident);
    }

    @Transactional
    public Resident updateKycStatus(Long id, String status) {
        if (!status.equals("pending") && !status.equals("approved") && !status.equals("rejected")) {
            throw new IllegalArgumentException("Invalid KYC status");
        }
        Resident resident = getResidentById(id);
        resident.setKycStatus(status);
        return residentRepository.save(resident);
    }

    public List<Resident> getPendingResidents() {
        return residentRepository.findByKycStatus("pending");
    }

    @Transactional
    public Resident approveResident(Long id) {
        Resident resident = getResidentById(id);
        resident.setKycStatus("approved");
        resident.setActive(true);
        return residentRepository.save(resident);
    }

    @Transactional
    public Resident rejectResident(Long id) {
        Resident resident = getResidentById(id);
        resident.setKycStatus("rejected");
        resident.setActive(false);
        return residentRepository.save(resident);
    }
}
