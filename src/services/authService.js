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

  refreshTokens: async (refreshToken) => {
    const url = API_URLS.REFRESH;
    const options = {
      method: "POST",
      body: JSON.stringify({ refresh_token: refreshToken })
    }

    return apiRequest(url, options);
  },

  parseJwt: (token) => {
    if (!token) return null;

    try {
      const parts = token.split(".");
      if (parts.length < 2) return null;
      const payload = parts[1];
      const json = JSON.parse(decodeURIComponent(
        atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
          .split("")
          .map(function (c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join("")
      ));
      return json;
    } catch {
      // ignore
      try {
        return JSON.parse(atob(token.split(".")[1]));
      } catch {
        return null;
      }
    }
  },

  _refreshPromise: null,

  _refreshIfNeeded: async () => {
    if (authService._refreshPromise) return authService._refreshPromise;

    const { refresh_token } = authService.getTokens();
    if (!refresh_token) {
      throw new Error("No refresh token available");
    }

    authService._refreshPromise = (async () => {
      try {
        const newTokens = await authService.refreshTokens(refresh_token);
        authService.setTokens(newTokens);
        return newTokens;
      } catch (err) {
        authService.removeTokens();
        throw err;
      } finally {
        authService._refreshPromise = null;
      }
    })();

    return authService._refreshPromise;
  },

  getAccessTokenExpirySeconds: () => {
    const { access_token } = authService.getTokens();
    if (!access_token) return null;
    const payload = authService.parseJwt(access_token);
    if (!payload?.exp) return null;
    const now = Math.floor(Date.now() / 1000);
    return payload.exp - now;
  }
};
