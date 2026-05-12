package com.example.backend.repository;

import com.example.backend.model.MaintenanceQuote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MaintenanceQuoteRepository extends JpaRepository<MaintenanceQuote, Long> {
    Optional<MaintenanceQuote> findByRequestId(Long requestId);
}
