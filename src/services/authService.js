import Cookies from "js-cookie";
import { API_URLS } from "../constants/api";
import { apiRequest } from "./apiUtils";

/**
 * Service for authentication related API calls
 */
export const authService = {
  /**
   * Authenticates a user
   * @param {string} login - The user's login
   * @param {string} password - The user's password
   * @returns {Promise} - Resolves with user data or rejects with error
   */
  mockedLogin: async (username, password) => {
    // Simulate API request delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Mock authentication logic
    if (username === "admin" && password === "password") {
      return {
        success: true,
        data: {
          id: 1,
          username: "admin",
          name: "Admin User",
          token: "mock-jwt-token-xyz123",
        },
      };
    } else {
      // Simulate API error response
      throw new Error("Invalid credentials");
    }
  },

  login: async (login, password) => {
    const url = API_URLS.LOGIN;
    const options = {
      method: "POST",
      body: JSON.stringify({ login, password }),
    };

    return apiRequest(url, options);
  },

  /**
   * Saves authentication token to local storage
   * @param {string} token - JWT token
   */
  setTokens: ({ access_token, refresh_token }) => {
    Cookies.set("authToken", access_token, { expires: 7 });
    Cookies.set("refreshToken", refresh_token, { expires: 7 });
  },

  /**
   * Gets authentication token from cookies
   * @returns {string|null} - JWT token or null if not found
   */
  getTokens: () => {
    return {
      access_token: Cookies.get("authToken"),
      refresh_token: Cookies.get("refreshToken"),
    };
  },

  /**
   * Removes authentication token from cookies
   */
  removeTokens: () => {
    Cookies.remove("authToken");
    Cookies.remove("refreshToken");
  },

  /**
   * Checks if user is authenticated
   * @returns {boolean} - True if user has auth token
   */
  isAuthenticated: () => {
    return !!authService.getTokens().access_token;
  },

  /**
   * Starts the password reset process
   * @param {string} login - The user's login
   * @returns {Promise} - Resolves when reset code is sent
   */
  resetPasswordStart: async (login) => {
    const url = API_URLS.RESET_PASSWORD_START;
    const options = {
      method: "POST",
      body: JSON.stringify({ login }),
    };

    return apiRequest(url, options);
  },

  /**
   * Completes the password reset process
   * @param {string} login - The user's login
   * @param {string} resetCode - The reset code received
   * @param {string} newPassword - The new password
   * @returns {Promise} - Resolves when password is reset
   */
  resetPasswordFinish: async (login, resetCode, newPassword) => {
    const url = API_URLS.RESET_PASSWORD_FINISH;
    const options = {
      method: "POST",
      body: JSON.stringify({
        login,
        reset_code: resetCode,
        new_password: newPassword,
      }),
    };

    return apiRequest(url, options);
  },
};
