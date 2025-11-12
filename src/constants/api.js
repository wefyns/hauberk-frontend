/**
 * API endpoints
 */
export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: "/api/v1/login",
  WHOAMI: "/api/v1/users/whoami",
  REFRESH: "/api/v1/refresh-token",

  // User endpoints
  LICENSE_AGREEMENT_VIEW: "/api/v1/users/license-agreement/view",
  LICENSE_AGREEMENT_ACCEPT: "/api/v1/users/license-agreement/accept",
  SET_EMAIL_PASSWORD_START: "/api/v1/users/set-email-and-password/start",
  SET_EMAIL_PASSWORD_FINISH: "/api/v1/users/set-email-and-password/finish",
  RESET_PASSWORD_START: "/api/v1/users/reset-password/start",
  RESET_PASSWORD_FINISH: "/api/v1/users/reset-password/finish",

  // Organization endpoints
  ORGANIZATIONS: "/api/v1/organizations",
  ORGANIZATION_SECRETS: (orgId) => `/api/v1/organizations/${orgId}/secrets`,
  ORGANIZATION_SECRET: (orgId, secretId) => `/api/v1/organizations/${orgId}/secrets/${secretId}`,
  ORGANIZATION_AGENTS: (orgId) => `/api/v1/organizations/${orgId}/agents`,
  ORGANIZATION_AGENT: (orgId, agentId) => `/api/v1/organizations/${orgId}/agents/${agentId}`,
  ORGANIZATION_BY_ID: (orgId) => `/api/v1/organizations/${orgId}`,

  // List By Current User
  AGENTS: "/api/v1/agents",
  SECRETS: "/api/v1/secrets",
  PEERS: "/api/v1/peers",
  ORDERERS: "/api/v1/orderers",
  CAS: "/api/v1/ca",

  // Agent endpoints
  AGENT_CA_ENROLL: (orgId, agentId) =>
    `/api/v1/organizations/${orgId}/agents/${agentId}/ca/enroll`,
  AGENT_CA_ENROLL_WITH_ID: (orgId, agentId, caId) =>
    `/api/v1/organizations/${orgId}/agents/${agentId}/ca/${caId}/enroll`,
  AGENT_ORDERER: (orgId, agentId, ordererId) =>
    `/api/v1/organizations/${orgId}/agents/${agentId}/orderer/${ordererId}`,
  AGENT_ORDERER_ENROLL: (orgId, agentId) =>
    `/api/v1/organizations/${orgId}/agents/${agentId}/orderer/enroll`,
  AGENT_ORDERER_ENROLL_WITH_ID: (orgId, agentId, ordererId) =>
    `/api/v1/organizations/${orgId}/agents/${agentId}/orderer/${ordererId}/enroll`,
  AGENT_ORDERER_ENROLL_WITH_ID_STOP: (orgId, agentId, ordererId) =>
    `/api/v1/organizations/${orgId}/agents/${agentId}/orderer/${ordererId}/stop`,
  AGENT_ORDERER_ENROLL_WITH_ID_RESTART: (orgId, agentId, ordererId) =>
    `/api/v1/organizations/${orgId}/agents/${agentId}/orderer/${ordererId}/restart`,
  AGENT_PEER_ENROLL: (orgId, agentId) =>
    `/api/v1/organizations/${orgId}/agents/${agentId}/peer/enroll`,
  AGENT_PEER_ENROLL_WITH_ID: (orgId, agentId, peerId) =>
    `/api/v1/organizations/${orgId}/agents/${agentId}/peer/${peerId}/enroll`,
  AGENT_CREATE_CONNECTION_DOC: (orgId, agentId) =>
    `/api/v1/organizations/${orgId}/agents/${agentId}/network/create-connection-document`,
  AGENT_CONNECT: (orgId, agentId) =>
    `/api/v1/organizations/${orgId}/agents/${agentId}/network/connect`,

  // Journal endpoints
  JOURNAL: (orgId, agentId, journalId) =>
    `/api/v1/organizations/${orgId}/agents/${agentId}/journal/${journalId}`,

  // Peers
  AGENT_PEERS: (orgId, agentId) => `/api/v1/organizations/${orgId}/agents/${agentId}/peer`,
  AGENT_PEER: (orgId, agentId, peerId) => `/api/v1/organizations/${orgId}/agents/${agentId}/peer/${peerId}`,
  AGENT_PEER_STOP: (orgId, agentId, peerId) => `/api/v1/organizations/${orgId}/agents/${agentId}/peer/${peerId}/stop`,
  AGENT_PEER_RESTART: (orgId, agentId, peerId) => `/api/v1/organizations/${orgId}/agents/${agentId}/peer/${peerId}/restart`,
  AGENT_PEER_DROP: (orgId, agentId, peerId) => `/api/v1/organizations/${orgId}/agents/${agentId}/peer/${peerId}/drop`,
  
  // Fabric CA
  FABRIC_CA: (orgId, agentId) => `/api/v1/organizations/${orgId}/agents/${agentId}/ca`,
  FABRIC_CA_WITH_ID: (orgId, agentId, caId) => `/api/v1/organizations/${orgId}/agents/${agentId}/ca/${caId}`,
  FABRIC_CA_WITH_ID_STOP: (orgId, agentId, caId) => `/api/v1/organizations/${orgId}/agents/${agentId}/ca/${caId}/stop`,
  FABRIC_CA_WITH_ID_RESTART: (orgId, agentId, caId) => `/api/v1/organizations/${orgId}/agents/${agentId}/ca/${caId}/restart`,
  FABRIC_CA_WITH_ID_DROP: (orgId, agentId, caId) => `/api/v1/organizations/${orgId}/agents/${agentId}/ca/${caId}/drop`,
  
  // Orderer
  AGENT_ORDERER_DROP: (orgId, agentId, ordererId) => `/api/v1/organizations/${orgId}/agents/${agentId}/orderer/${ordererId}/drop`,

  // DB INFO
  DB_INFO: "/api/v1/db-info",
};

/**
 * Base API URL
 * Uses environment variables or defaults to localhost:8080
 */
const PROTOCOL = import.meta.env.VITE_API_PROTOCOL || "https";
const HOST = import.meta.env.VITE_API_HOST || "localhost";
export const API_BASE_URL = `${PROTOCOL}://${HOST}:8080`;

/**
 * Full API URLs
 */
export const API_URLS = {
  // Auth endpoints
  WHOAMI: `${API_BASE_URL}${API_ENDPOINTS.WHOAMI}`,
  LOGIN: `${API_BASE_URL}${API_ENDPOINTS.LOGIN}`,
  REFRESH: `${API_BASE_URL}${API_ENDPOINTS.REFRESH}`,

  // User endpoints
  LICENSE_AGREEMENT_VIEW: `${API_BASE_URL}${API_ENDPOINTS.LICENSE_AGREEMENT_VIEW}`,
  LICENSE_AGREEMENT_ACCEPT: `${API_BASE_URL}${API_ENDPOINTS.LICENSE_AGREEMENT_ACCEPT}`,
  SET_EMAIL_PASSWORD_START: `${API_BASE_URL}${API_ENDPOINTS.SET_EMAIL_PASSWORD_START}`,
  SET_EMAIL_PASSWORD_FINISH: `${API_BASE_URL}${API_ENDPOINTS.SET_EMAIL_PASSWORD_FINISH}`,
  RESET_PASSWORD_START: `${API_BASE_URL}${API_ENDPOINTS.RESET_PASSWORD_START}`,
  RESET_PASSWORD_FINISH: `${API_BASE_URL}${API_ENDPOINTS.RESET_PASSWORD_FINISH}`,

  // Organization endpoints
  ORGANIZATIONS: `${API_BASE_URL}${API_ENDPOINTS.ORGANIZATIONS}`,
  ORGANIZATION_SECRETS: (orgId) =>
    `${API_BASE_URL}${API_ENDPOINTS.ORGANIZATION_SECRETS(orgId)}`,
  ORGANIZATION_SECRET: (orgId, secretId) =>
    `${API_BASE_URL}${API_ENDPOINTS.ORGANIZATION_SECRET(orgId, secretId)}`,
  ORGANIZATION_AGENTS: (orgId) =>
    `${API_BASE_URL}${API_ENDPOINTS.ORGANIZATION_AGENTS(orgId)}`,
  ORGANIZATION_AGENT: (orgId, agentId) =>
    `${API_BASE_URL}${API_ENDPOINTS.ORGANIZATION_AGENT(orgId, agentId)}`,
  ORGANIZATION_BY_ID: (orgId) =>
    `${API_BASE_URL}${API_ENDPOINTS.ORGANIZATION_BY_ID(orgId)}`,

  // List By Current User
  AGENTS: `${API_BASE_URL}${API_ENDPOINTS.AGENTS}`,
  SECRETS: `${API_BASE_URL}${API_ENDPOINTS.SECRETS}`,
  PEERS: `${API_BASE_URL}${API_ENDPOINTS.PEERS}`,
  ORDERERS: `${API_BASE_URL}${API_ENDPOINTS.ORDERERS}`,
  CAS: `${API_BASE_URL}${API_ENDPOINTS.CAS}`,

  // Agent endpoints
  AGENT_CA_ENROLL: (orgId, agentId) =>
    `${API_BASE_URL}${API_ENDPOINTS.AGENT_CA_ENROLL(orgId, agentId)}`,
  AGENT_CA_ENROLL_WITH_ID: (orgId, agentId, caId) =>
    `${API_BASE_URL}${API_ENDPOINTS.AGENT_CA_ENROLL_WITH_ID(orgId, agentId, caId)}`,
  AGENT_ORDERER: (orgId, agentId, ordererId) =>
    `${API_BASE_URL}${API_ENDPOINTS.AGENT_ORDERER(orgId, agentId, ordererId)}`,
  AGENT_ORDERER_ENROLL: (orgId, agentId) =>
    `${API_BASE_URL}${API_ENDPOINTS.AGENT_ORDERER_ENROLL(orgId, agentId)}`,
  AGENT_ORDERER_ENROLL_WITH_ID: (orgId, agentId, ordererId) =>
    `${API_BASE_URL}${API_ENDPOINTS.AGENT_ORDERER_ENROLL_WITH_ID(orgId, agentId, ordererId)}`,
  AGENT_ORDERER_ENROLL_WITH_ID_STOP: (orgId, agentId, ordererId) =>
    `${API_BASE_URL}${API_ENDPOINTS.AGENT_ORDERER_ENROLL_WITH_ID_STOP(orgId, agentId, ordererId)}`,
  AGENT_ORDERER_ENROLL_WITH_ID_RESTART: (orgId, agentId, ordererId) =>
    `${API_BASE_URL}${API_ENDPOINTS.AGENT_ORDERER_ENROLL_WITH_ID_RESTART(orgId, agentId, ordererId)}`,
  AGENT_PEER_ENROLL: (orgId, agentId) =>
    `${API_BASE_URL}${API_ENDPOINTS.AGENT_PEER_ENROLL(orgId, agentId)}`,
  AGENT_PEER_ENROLL_WITH_ID: (orgId, agentId, peerId) =>
    `${API_BASE_URL}${API_ENDPOINTS.AGENT_PEER_ENROLL_WITH_ID(orgId, agentId, peerId)}`,
  AGENT_CREATE_CONNECTION_DOC: (orgId, agentId) =>
    `${API_BASE_URL}${API_ENDPOINTS.AGENT_CREATE_CONNECTION_DOC(
      orgId,
      agentId
    )}`,
  AGENT_CONNECT: (orgId, agentId, docId) =>
    `${API_BASE_URL}${API_ENDPOINTS.AGENT_CONNECT(orgId, agentId)}/${docId}`,

  // Journal endpoints

  JOURNAL: (orgId, agentId, journalId) =>
    `${API_BASE_URL}${API_ENDPOINTS.JOURNAL(orgId, agentId, journalId)}`,

  // Peers
  AGENT_PEERS: (orgId, agentId) => `${API_BASE_URL}${API_ENDPOINTS.AGENT_PEERS(orgId, agentId)}`,
  AGENT_PEER: (orgId, agentId, peerId) => `${API_BASE_URL}${API_ENDPOINTS.AGENT_PEER(orgId, agentId, peerId)}`,
  AGENT_PEER_STOP: (orgId, agentId, peerId) => `${API_BASE_URL}${API_ENDPOINTS.AGENT_PEER_STOP(orgId, agentId, peerId)}`,
  AGENT_PEER_RESTART: (orgId, agentId, peerId) => `${API_BASE_URL}${API_ENDPOINTS.AGENT_PEER_RESTART(orgId, agentId, peerId)}`,
  AGENT_PEER_DROP: (orgId, agentId, peerId) => `${API_BASE_URL}${API_ENDPOINTS.AGENT_PEER_DROP(orgId, agentId, peerId)}`,

  // Fabric CA
  FABRIC_CA: (orgId, agentId) => `${API_BASE_URL}${API_ENDPOINTS.FABRIC_CA(orgId, agentId)}`,
  FABRIC_CA_WITH_ID: (orgId, agentId, caId) => `${API_BASE_URL}${API_ENDPOINTS.FABRIC_CA_WITH_ID(orgId, agentId, caId)}`,
  FABRIC_CA_WITH_ID_STOP: (orgId, agentId, caId) => `${API_BASE_URL}${API_ENDPOINTS.FABRIC_CA_WITH_ID_STOP(orgId, agentId, caId)}`,
  FABRIC_CA_WITH_ID_RESTART: (orgId, agentId, caId) => `${API_BASE_URL}${API_ENDPOINTS.FABRIC_CA_WITH_ID_RESTART(orgId, agentId, caId)}`,
  FABRIC_CA_WITH_ID_DROP: (orgId, agentId, caId) => `${API_BASE_URL}${API_ENDPOINTS.FABRIC_CA_WITH_ID_DROP(orgId, agentId, caId)}`,
  
  // Orderer
  AGENT_ORDERER_DROP: (orgId, agentId, ordererId) => `${API_BASE_URL}${API_ENDPOINTS.AGENT_ORDERER_DROP(orgId, agentId, ordererId)}`,

  // DB INFO
  DB_INFO: `${API_BASE_URL}${API_ENDPOINTS.DB_INFO}`,
};
