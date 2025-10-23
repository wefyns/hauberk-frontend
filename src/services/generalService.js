import { API_URLS } from "../constants/api";
import { apiRequest } from "./apiUtils";

export const generalService = {
  getDbInfo: async () => {
    const url = API_URLS.DB_INFO;
    const options = {
      method: "GET",
    };

    return apiRequest(url, options);
  },
}