/**
 * api.js
 * 
 * Central API configuration for the bs-gated frontend.
 * Points to the Spring Boot backend.
 */

import { Platform } from 'react-native';

// Use 10.0.2.2 for Android Emulator, localhost for iOS/Web
export const BASE_URL = Platform.OS === 'android' 
  ? 'http://10.0.2.2:8080/api' 
  : 'http://localhost:8080/api';

/**
 * fetchApi
 * 
 * Helper for making authenticated/standardized API calls.
 */
export async function fetchApi(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API Error: ${response.status}`);
    }

    // Some endpoints might return empty body
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    return await response.text();
  } catch (error) {
    console.error(`[API Error] ${url}:`, error);
    throw error;
  }
}
