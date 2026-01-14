// services/SuperAdminService.ts
import { baseUrl } from "@/config";
import { getAuthToken } from "@/utils";
import axios from "axios";

class SuperAdminService {
  constructor() {}

  async getAllAdminsMadeBySuperAdmin(page: number, limit: number) {
    try {
      const token = getAuthToken();
      const response = await axios.get(
        `${baseUrl}/super-admin/admins/created-by-super-admin`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
          params: { page, limit }, // 👈 Proper query params
        }
      );
      return response;
    } catch (error) {
      console.log("Error: ", error);
      throw error; // Re-throw for proper error handling
    }
  }
}

export default SuperAdminService;
