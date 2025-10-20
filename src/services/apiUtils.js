/**
 * Utility functions for API calls
 */

import { authService } from "./authService";

/**
 * Creates headers for API requests with optional authentication token
 * @param {string|null} token - JWT token for authentication
 * @returns {Object} - Headers object
 */

/**
 * Creates headers for multipart form data with optional authentication token
 * @param {string|null} token - JWT token for authentication
 * @returns {Object} - Headers object
 */
export const createFormDataHeaders = (token = null) => {
  const headers = {};

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
};

/**
 * Handles API responses, parsing JSON and handling errors
 * @param {Response} response - Fetch API response object
 * @returns {Promise} - Resolved with response data or rejected with error
 */
export const handleResponse = async (response) => {
  const contentType = response.headers.get("content-type");
  const isJson = contentType && contentType.includes("application/json");

  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    // Handle API error responses
    const error = data || response.statusText;
    return Promise.reject(error);
  }

  return data;
};

/**
 * Makes an API request
 * @param {string} url - API endpoint URL
 * @param {Object} options - Request options
 * @returns {Promise} - Resolved with response data or rejected with error
 */
export const apiRequest = async (url, options) => {
  try {
    const token = authService.getTokens().access_token;

    options.headers = {
      ...options.headers,
      ...(token && { Authorization: `Bearer ${token}` }),
      "Content-Type": "application/json",
    };

    const response = await fetch(url, options);
    return await handleResponse(response);
  } catch (error) {
    return Promise.reject(error || "API request failed");
  }
};
