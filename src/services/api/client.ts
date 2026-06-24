/**
 * API Client
 * Axios instance with interceptors and error handling
 */

import axios, { AxiosError, AxiosInstance } from 'axios';
import { API_CONFIG } from './config';

class ApiClient {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.instance.interceptors.request.use(
      (config) => {
        // Add auth token if needed
        // const token = getAuthToken();
        // if (token) {
        //   config.headers.Authorization = `Bearer ${token}`;
        // }
        
        if (__DEV__) {
          console.log('API Request:', config.method?.toUpperCase(), config.url);
        }
        
        return config;
      },
      (error) => {
        console.error('Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.instance.interceptors.response.use(
      (response) => {
        if (__DEV__) {
          console.log('API Response:', response.status, response.config.url);
        }
        return response;
      },
      (error: AxiosError) => {
        if (__DEV__) {
          console.error('API Error:', {
            baseURL: error.config?.baseURL,
            status: error.response?.status,
            url: error.config?.url,
            message: error.message,
          });
        }

        // Handle specific error cases
        if (error.response) {
          const status = error.response.status;
          const url = error.config?.url ?? '';
          const isExpectedMissingVideo =
            status === 404 && url.includes('/api/videos/at');

          if (!isExpectedMissingVideo && __DEV__) {
            switch (status) {
              case 401:
                break;
              case 404:
                console.error('Resource not found');
                break;
              case 500:
                console.error('Server error');
                break;
            }
          }
        } else if (error.request) {
          // Request made but no response received
          console.error(
            'Network error - no response received. Is the API running?',
            `Expected at ${error.config?.baseURL ?? API_CONFIG.BASE_URL}`
          );
        }

        return Promise.reject(error);
      }
    );
  }

  public getInstance(): AxiosInstance {
    return this.instance;
  }
}

// Export singleton instance
export const apiClient = new ApiClient().getInstance();
