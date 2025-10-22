import { API_URLS } from "../constants/api";
import { apiRequest } from "./apiUtils";

export const journalService = {
  getJournal: async (orgId, agentId, journalId) => {
    const url = API_URLS.JOURNAL(orgId, agentId, journalId);
    const options = {
      method: "GET",
    };

    return apiRequest(url, options);
  },
};
