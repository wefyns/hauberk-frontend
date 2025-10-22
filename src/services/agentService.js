import { API_URLS } from "../constants/api";
import { apiRequest } from "./apiUtils";

/**
 * Service for agent-related API calls
 */
export const agentService = {
  getAgentPeers: async (orgId, agentId) => {
    const url = API_URLS.AGENT_PEERS(orgId, agentId);
    const options = { method: "GET" };
    return apiRequest(url, options);
  },

  getPeer: async (orgId, agentId, peerId) => {
    const url = API_URLS.AGENT_PEER(orgId, agentId, peerId);
    const options = { method: "GET" };
    return apiRequest(url, options);
  },

  getAllPeersInOrg: async (orgId) => {
    const orgIdNum = typeof orgId === "string" ? parseInt(orgId, 10) : orgId;

    const agentsResp = await agentService.getAgents(orgIdNum);

    const agentsList = Array.isArray(agentsResp)
      ? agentsResp
      : (agentsResp && Array.isArray(agentsResp.agents) ? agentsResp.agents : []);

    if (!agentsList || agentsList.length === 0) {
      console.debug("[agentService.getAllPeersInOrg] no agents found for orgId:", orgIdNum, "raw response:", agentsResp);
      return [];
    }

    const results = await Promise.allSettled(
      agentsList.map(async (a) => {
        try {
          const res = await agentService.getAgentPeers(orgIdNum, a.id);

          const peersRaw = Array.isArray(res) ? res : (res?.peers ?? []);

          const normalized = peersRaw.map((p) => {
            const nameFromPeer = p.peer ?? p.name ?? p.id ?? null;
            return {
              id: p.id ?? nameFromPeer,
              name: p.name ?? p.peer ?? p.id ?? null,
              ...p,
            };
          });

          return { agent: a, peers: normalized };
        } catch (err) {
          console.warn("[agentService.getAllPeersInOrg] getAgentPeers error for agent", a?.id, err);
          return { agent: a, peers: [] };
        }
      })
    );

    const items = [];
    results.forEach((r) => {
      if (r.status === "fulfilled" && r.value && Array.isArray(r.value.peers)) {
        r.value.peers.forEach((peer) => items.push({ peer, agent: r.value.agent }));
      }
    });

    return items;
  },


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
   * @param {string|number} [ordererId]
   * @returns {Promise} - Resolves with enrollment data
   */
  enrollOrderer: async (orgId, agentId, ordererId) => {
    let url;
    if (typeof ordererId !== "undefined" && ordererId !== null) {
      url = API_URLS.AGENT_ORDERER_ENROLL_WITH_ID(orgId, agentId, ordererId);
    } else {
      url = API_URLS.AGENT_ORDERER_ENROLL(orgId, agentId);
    }

    const options = {
      method: "POST",
    };

    return apiRequest(url, options);
  },

  /**
   * Enroll a peer for an organization's agent
   * @param {number} orgId - Organization ID
   * @param {number} agentId - Agent ID
   * @param {string|number} [peerId]
   * @param {number} peerNumber - Peer number
   * @returns {Promise} - Resolves with enrollment data
   */
  enrollPeer: async (orgId, agentId, peerId, peerNumber) => {
    let url;

    if (typeof peerId !== "undefined" && peerId !== null) {
      url = API_URLS.AGENT_PEER_ENROLL_WITH_ID(orgId, agentId, peerId);
    } else {
      url = API_URLS.AGENT_PEER_ENROLL(orgId, agentId);
    }

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
