package com.example.backend.repository;

import com.example.backend.model.MaintenanceRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaintenanceRepository extends JpaRepository<MaintenanceRequest, Long> {
    List<MaintenanceRequest> findByResidentIdOrderByCreatedAtDesc(Long residentId);
    List<MaintenanceRequest> findByStatusOrderByCreatedAtDesc(String status);
    List<MaintenanceRequest> findByAssignedVendorIdOrderByCreatedAtDesc(Long vendorId);
    List<MaintenanceRequest> findAllByOrderByCreatedAtDesc();
    java.util.Optional<MaintenanceRequest> findByVendorGateOtp(String vendorGateOtp);
}
