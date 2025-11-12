import { API_URLS } from "../constants/api";
import { apiRequest } from "./apiUtils";

/**
 * Service for organization-related API calls
 */
export const organizationService = {
  /**
   * Get all organizations
   * @returns {Promise} - Resolves with the list of organizations
   */
  getOrganizations: async () => {
    const url = API_URLS.ORGANIZATIONS;
    const options = {
      method: "GET",
    };

    return apiRequest(url, options);
  },

  /**
   * Create a new organization
   * @param {Object} organizationData - Organization data
   * @param {string} organizationData.name - Organization name
   * @param {string} organizationData.name_lat - Organization latinized name
   * @param {string} organizationData.country - Organization country
   * @param {string} organizationData.country_code - Organization country code
   * @param {string} organizationData.region - Organization region
   * @param {string} organizationData.domain - Organization domain
   * @param {string} organizationData.settlement - Organization settlement
   * @param {string} organizationData.ogrn - Organization OGRN
   * @returns {Promise} - Resolves with the created organization data
   */
  createOrganization: async (organizationData) => {
    const url = API_URLS.ORGANIZATIONS;
    const options = {
      method: "POST",
      body: JSON.stringify(organizationData),
    };

    return apiRequest(url, options);
  },

  updateOrganization: async (orgId, organizationData) => {
    const url = API_URLS.ORGANIZATION_BY_ID(orgId);
    const options = {
      method: "PATCH",
      body: JSON.stringify(organizationData),
    };

    return apiRequest(url, options);
  },

  deleteOrganization: async (orgId) => {
    const url = API_URLS.ORGANIZATION_BY_ID(orgId);
    const options = {
      method: "DELETE",
    };

    return apiRequest(url, options);
  },

  /**
   * Add secrets to an organization
   * @param {number} orgId - Organization ID
   * @param {Array} secrets - Array of secret objects
   * @returns {Promise} - Resolves with the created secrets data
   */
  addOrganizationSecrets: async (orgId, secrets) => {
    const url = API_URLS.ORGANIZATION_SECRETS(orgId);
    const options = {
      method: "POST",
      body: JSON.stringify({ secrets }),
    };

    return apiRequest(url, options);
  },

  /**
   * Add an agent to an organization
   * @param {number} orgId - Organization ID
   * @param {Object} agentData - Agent data
   * @param {string} agentData.uuid - Agent UUID
   * @param {number} agentData.secret_id - Secret ID
   * @param {string} agentData.protocol - Agent protocol
   * @param {string} agentData.host - Agent host
   * @param {number} agentData.port - Agent port
   * @returns {Promise} - Resolves with the created agent data
   */
  addOrganizationAgent: async (orgId, agentData) => {
    const url = API_URLS.ORGANIZATION_AGENTS(orgId);
    const options = {
      method: "POST",
      body: JSON.stringify(agentData),
    };

    return apiRequest(url, options);
  },
};
