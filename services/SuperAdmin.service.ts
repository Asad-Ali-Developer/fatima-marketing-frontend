import { apiClient } from "@/config";

class SuperAdminService {
  constructor() {}

  async getAllAdminsMadeBySuperAdmin(page: number, limit: number) {
    try {
      const response = await apiClient.get(
        "/super-admin/admins/created-by-super-admin",
        {
          params: { page, limit },
        },
      );
      return response;
    } catch (error) {
      console.log("Error: ", error);
    }
  }
}

export default SuperAdminService;
