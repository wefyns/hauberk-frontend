/* eslint-disable no-useless-catch */
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
  const baseOptions = {
    ...options,
    headers: { ...(options && options.headers ? options.headers : {}) }
  };

  const attachAuth = () => {
    const token = authService.getTokens().access_token;
    if (token) {
      baseOptions.headers["Authorization"] = `Bearer ${token}`;
    } else {
      delete baseOptions.headers["Authorization"];
    }
  };

  const attachContentTypeIfNeeded = () => {
    if (baseOptions.body && !(baseOptions.body instanceof FormData)) {
      if (!Object.keys(baseOptions.headers).some(h => h.toLowerCase() === "content-type")) {
        baseOptions.headers["Content-Type"] = "application/json";
      }
    } else {
      Object.keys(baseOptions.headers).forEach((h) => {
        if (h.toLowerCase() === "content-type" && baseOptions.body instanceof FormData) {
          delete baseOptions.headers[h];
        }
      });
    }
  };

  const doFetch = async () => {
    attachAuth();
    attachContentTypeIfNeeded();
    return fetch(url, baseOptions);
  };

  try {
    let response = await doFetch();

    if (response.status === 401 || response.status === 403) {
      try {
        await authService._refreshIfNeeded();
        response = await doFetch();
      } catch (refreshErr) {
        throw refreshErr;
      }
    }

    return await handleResponse(response);
  } catch (error) {
    return Promise.reject(error || "API request failed");
  }
};
