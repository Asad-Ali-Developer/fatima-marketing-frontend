import { apiClient } from "@/config";

class HealthService {
  constructor() {}

  async check() {
    try {
      const result = await apiClient.get("/health");
      return result.data;
    } catch (error) {
      console.log("Error fetching System Health: ", error);
    }
  }
}

export default HealthService;
