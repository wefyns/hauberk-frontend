import { API_URLS } from "../constants/api";
import { apiRequest } from "./apiUtils";

/**
 * Service for agent-related API calls
 */
export const agentService = {
  /**
   * Get all agents for an organization
   * @param {number} orgId - Organization ID
   * @returns {Promise} - Resolves with the list of agents
   */
  getAgents: async (orgId) => {
    const url = API_URLS.ORGANIZATION_AGENTS(orgId);
    const options = {
      method: "GET",
    };

    return apiRequest(url, options);
  },
  
  /**
   * Add a new agent to an organization
   * @param {number} orgId - Organization ID
   * @param {Object} agentData - Agent data
   * @param {string} agentData.uuid - Agent UUID
   * @param {number} agentData.secret_id - Secret ID
   * @param {string} agentData.protocol - Agent protocol
   * @param {string} agentData.host - Agent host
   * @param {number} agentData.port - Agent port
   * @returns {Promise} - Resolves with the created agent data
   */
  addAgent: async (orgId, agentData) => {
    const url = API_URLS.ORGANIZATION_AGENTS(orgId);
    const options = {
      method: "POST",
      body: JSON.stringify(agentData),
    };

    return apiRequest(url, options);
  },

  /**
   * Enroll a CA for an organization's agent
   * @param {number} orgId - Organization ID
   * @param {number} agentId - Agent ID
   * @returns {Promise} - Resolves with enrollment data
   */
  enrollCA: async (orgId, agentId) => {
    const url = API_URLS.AGENT_CA_ENROLL(orgId, agentId);
    const options = {
      method: "POST",
    };

    return apiRequest(url, options);
  },

  /**
   * Enroll an orderer for an organization's agent
   * @param {number} orgId - Organization ID
   * @param {number} agentId - Agent ID
   * @returns {Promise} - Resolves with enrollment data
   */
  enrollOrderer: async (orgId, agentId) => {
    const url = API_URLS.AGENT_ORDERER_ENROLL(orgId, agentId);
    const options = {
      method: "POST",
    };

    return apiRequest(url, options);
  },

  /**
   * Enroll a peer for an organization's agent
   * @param {number} orgId - Organization ID
   * @param {number} agentId - Agent ID
   * @param {number} peerNumber - Peer number
   * @returns {Promise} - Resolves with enrollment data
   */
  enrollPeer: async (orgId, agentId, peerNumber) => {
    const url = API_URLS.AGENT_PEER_ENROLL(orgId, agentId);
    const options = {
      method: "POST",
      body: JSON.stringify({
        peer_number: peerNumber,
      }),
    };

    return apiRequest(url, options);
  },

  /**
   * Create a connection document for an organization's agent
   * @param {number} orgId - Organization ID
   * @param {number} agentId - Agent ID
   * @param {File} configFile - Configuration file
   * @returns {Promise} - Resolves with document data
   */
  createConnectionDocument: async (orgId, agentId, configFile) => {
    const url = API_URLS.AGENT_CREATE_CONNECTION_DOC(orgId, agentId);

    const formData = new FormData();
    formData.append("config_file", configFile);

    const options = {
      method: "POST",
      body: formData,
    };

    return apiRequest(url, options);
  },

  /**
   * Connect to a network using a connection document
   * @param {number} orgId - Organization ID
   * @param {number} agentId - Agent ID
   * @param {string} docId - Document ID
   * @returns {Promise} - Resolves with connection data
   */
  connectWithDocument: async (orgId, agentId, docId) => {
    const url = API_URLS.AGENT_CONNECT(orgId, agentId, docId);
    const options = {
      method: "POST",
    };

    return apiRequest(url, options);
  },
};
