import { apiClient } from "./api";
import type {
  FundingSettings,
  ChangeFundingPasswordRequest,
  ChangePasswordResponse,
} from "../types/fundingSettings";

const BASE = "/funding-settings";

export const fundingSettingsService = {
  // GET /api/funding-settings
  getSettings: async (): Promise<FundingSettings> => {
    return apiClient.get<FundingSettings>(BASE);
  },

  // PUT /api/funding-settings
  updateSettings: async (data: FundingSettings): Promise<FundingSettings> => {
    return apiClient.put<FundingSettings>(BASE, data);
  },

  // POST /api/funding-settings/change-password
  changePassword: async (data: ChangeFundingPasswordRequest): Promise<ChangePasswordResponse> => {
    return apiClient.post<ChangePasswordResponse>(`${BASE}/change-password`, data);
  },
};

export default fundingSettingsService;
