package com.example.backend.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class QuoteSubmitDTO {

    @NotNull(message = "Amount is required")
    private BigDecimal amount;

    private String description;
    private String eta;
    private Integer estimatedDays;

    // Vendor who is submitting the quote
    private Long vendorId;
}
