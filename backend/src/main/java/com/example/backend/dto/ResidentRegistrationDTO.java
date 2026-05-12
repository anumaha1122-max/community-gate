package com.example.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ResidentRegistrationDTO {
    
    @NotBlank(message = "Name is required")
    private String name;
    
    @NotBlank(message = "Unit is required")
    private String unit;
    
    private String phone;
    
    private String email;
    private String role;
    private String aadhaarUrl;
    private String panUrl;
}
