import { API_URLS } from "../constants/api";
import { apiRequest } from "./apiUtils";

/**
 * Service for user-related API calls
 */
export const userService = {
  /**
   * Get the license agreement content
   * @returns {Promise} - Resolves with license agreement data
   */
  getLicenseAgreement: async () => {
    const url = API_URLS.LICENSE_AGREEMENT_VIEW;
    const options = {
      method: "GET",
      headers: {
        Accept: "application/pdf",
      },
    };

    return apiRequest(url, options);
  },

  /**
   * Accept the license agreement
   * @returns {Promise} - Resolves with acceptance confirmation
   */
  acceptLicenseAgreement: async () => {
    const url = API_URLS.LICENSE_AGREEMENT_ACCEPT;
    const options = {
      method: "POST",
    };

    return apiRequest(url, options);
  },

  /**
   * Start the process of setting a new email and password
   * @param {string} email - The new email address
   * @param {string} oldPassword - The current password
   * @returns {Promise} - Resolves with confirmation data
   */
  startSetEmailAndPassword: async (email, oldPassword) => {
    const url = API_URLS.SET_EMAIL_PASSWORD_START;
    const options = {
      method: "POST",
      body: JSON.stringify({
        email,
        old_password: oldPassword,
      }),
    };

    return apiRequest(url, options);
  },

  /**
   * Complete the process of setting a new email and password
   * @param {string} newPassword - The new password
   * @param {string} resetCode - The verification code received
   * @returns {Promise} - Resolves with completion confirmation
   */
  finishSetEmailAndPassword: async (newPassword, resetCode) => {
    const url = API_URLS.SET_EMAIL_PASSWORD_FINISH;
    const options = {
      method: "POST",
      body: JSON.stringify({
        new_password: newPassword,
        reset_code: resetCode,
      }),
    };

    return apiRequest(url, options);
  },

  whoami: async () => {
    const url = API_URLS.WHOAMI;
    const options = {
      method: "GET",
    };

    return apiRequest(url, options);
  }
};
