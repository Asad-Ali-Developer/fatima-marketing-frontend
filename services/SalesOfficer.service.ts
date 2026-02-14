import { apiClient } from "@/config";

class SalesOfficerService {
  constructor() {}

  async getAllSalesOfficerMadeByAdmin(page: number, limit: number) {
    try {
      const response = await apiClient.get(
        "/sales-officer/sales-officers/created-by-admin",
        {
          params: { page, limit },
        },
      );
      return response;
    } catch (error) {
      console.log("Error: ", error);
    }
  }

  // ─── NEW: Get Leads for Sales Officer (Dashboard) ─────────────────────
  async getLeadsForSO({
    page = 1,
    limit = 100,
    searchTerm,
    status,
    date,
  }: {
    page?: number;
    limit?: number;
    searchTerm?: string;
    status?: string;
    date?: string;
  }) {
    try {
      const params: Record<string, string | number> = {
        page,
        limit,
        ...(searchTerm !== undefined && { searchTerm }),
        ...(status !== undefined && { status }),
        ...(date !== undefined && { date }),
      };

      const response = await apiClient.get("/sales-officer/leads", { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching leads:", error);
    }
  }

  // ─── NEW: Get Invoices for Sales Officer (Dashboard) ──────────────────
  async getInvoicesForSO({
    page = 1,
    limit = 100,
    searchTerm,
    status,
    date,
  }: {
    page?: number;
    limit?: number;
    searchTerm?: string;
    status?: string;
    date?: string;
  }) {
    try {
      const params: Record<string, string | number> = {
        page,
        limit,
        ...(searchTerm !== undefined && { searchTerm }),
        ...(status !== undefined && { status }),
        ...(date !== undefined && { date }),
      };

      const response = await apiClient.get("/sales-officer/invoices", {
        params,
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching invoices:", error);
    }
  }

  // ─── NEW: Get Dashboard Summary Stats ────────────────────────────────
  async getDashboardStats() {
    try {
      const response = await apiClient.get("/sales-officer/dashboard-stats");
      return response.data;
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    }
  }
}

export default SalesOfficerService;
