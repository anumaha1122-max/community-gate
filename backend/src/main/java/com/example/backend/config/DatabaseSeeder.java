package com.example.backend.config;

import com.example.backend.model.Resident;
import com.example.backend.repository.ResidentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Configuration
@RequiredArgsConstructor
public class DatabaseSeeder implements CommandLineRunner {

    private final ResidentRepository residentRepository;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // Seed resident with ID 1
        if (residentRepository.count() == 0) {
            Resident r = Resident.builder()
                    .name("John Resident")
                    .unit("A-101")
                    .phone("9876543210")
                    .email("john@example.com")
                    .active(true)
                    .joinedAt(LocalDate.now())
                    .kycStatus("verified")
                    .role("resident")
                    .build();
            residentRepository.save(r);

            // Seed vendor as a Resident with role 'vendor' (ID will be 2)
            Resident v = Resident.builder()
                    .name("Bob Vendor")
                    .unit("Vendor Unit")
                    .phone("8765432100")
                    .email("bob@fixit.com")
                    .active(true)
                    .joinedAt(LocalDate.now())
                    .kycStatus("verified")
                    .role("vendor")
                    .build();
            residentRepository.save(v);
        }
    }
}
