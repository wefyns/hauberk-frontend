import { API_URLS } from "../constants/api";
import { apiRequest } from "./apiUtils";

/**
 * Service for secrets-related API calls
 */
export const secretService = {
  getSecrets: async () => {
    const url = API_URLS.SECRETS;
    const options = {
      method: "GET",
    };

    return apiRequest(url, options);
  },

  /**
   * Add a new secret to an organization
   * @param {number} orgId - Organization ID
   * @param {Object} secretData - Secret data
   * @returns {Promise} - Resolves with the created secret data
   */
  addSecret: async (orgId, secretData) => {
    const url = API_URLS.ORGANIZATION_SECRETS(orgId);
    const options = {
      method: "POST",
      body: JSON.stringify({ secrets: [secretData] }),
    };

    return apiRequest(url, options);
  }
};