package com.example.backend.controller;

import com.example.backend.model.Resident;
import com.example.backend.repository.VendorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vendors")
@RequiredArgsConstructor
public class VendorController {

    private final VendorRepository vendorRepository;

    @GetMapping
    public ResponseEntity<List<Resident>> getAllVendors() {
        return ResponseEntity.ok(vendorRepository.findByRoleAndActiveTrue("vendor"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Resident> getVendorById(@PathVariable Long id) {
        return ResponseEntity.ok(vendorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vendor not found: " + id)));
    }
}
