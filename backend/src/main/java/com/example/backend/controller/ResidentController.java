package com.example.backend.controller;

import com.example.backend.dto.ResidentRegistrationDTO;
import com.example.backend.model.Resident;
import com.example.backend.service.ResidentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/residents")
@RequiredArgsConstructor
public class ResidentController {

    private final ResidentService residentService;

    @GetMapping
    public ResponseEntity<List<Resident>> getAllResidents() {
        return ResponseEntity.ok(residentService.getAllResidents());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Resident> getResidentById(@PathVariable Long id) {
        return ResponseEntity.ok(residentService.getResidentById(id));
    }

    @PostMapping
    public ResponseEntity<Resident> registerResident(@Valid @RequestBody ResidentRegistrationDTO dto) {
        Resident resident = residentService.registerResident(dto);
        return new ResponseEntity<>(resident, HttpStatus.CREATED);
    }

    @PutMapping("/{id}/active")
    public ResponseEntity<Resident> toggleActiveStatus(@PathVariable Long id) {
        return ResponseEntity.ok(residentService.toggleActiveStatus(id));
    }

    @PutMapping("/{id}/kyc")
    public ResponseEntity<Resident> updateKycStatus(@PathVariable Long id, @RequestParam String status) {
        return ResponseEntity.ok(residentService.updateKycStatus(id, status));
    }

    @GetMapping("/pending")
    public ResponseEntity<List<Resident>> getPendingResidents() {
        return ResponseEntity.ok(residentService.getPendingResidents());
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<Resident> approveResident(@PathVariable Long id) {
        return ResponseEntity.ok(residentService.approveResident(id));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<Resident> rejectResident(@PathVariable Long id) {
        return ResponseEntity.ok(residentService.rejectResident(id));
    }
}
