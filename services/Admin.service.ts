import { apiClient } from "@/config";

class AdminService {
  async getAllSalesOfficerMadeByAdmin(page: number, limit: number) {
    try {
      const response = await apiClient.get(
        "/admin/sales-officers/created-by-admin",
        {
          params: { page, limit },
        },
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching sales officers:", error);
      throw error;
    }
  }

  async searchSalesOfficers(searchTerm: string) {
    if (!searchTerm.trim()) {
      return { data: [], status: true };
    }
    const response = await apiClient.get("/admin/sales-officers/search", {
      params: { q: searchTerm.trim() },
    });
    return response.data;
  }

  async getSalesOfficerById(id: string) {
    const response = await apiClient.get(`/admin/sales-officers/${id}`);
    return response.data;
  }

  async getInvoicesBySalesOfficerId(
    salesOfficerId: string,
    page: number = 1,
    limit: number = 10,
    filters: { searchTerm?: string; status?: string; date?: string } = {},
  ) {
    const params = {
      page,
      limit,
      ...(filters.searchTerm && { searchTerm: filters.searchTerm }),
      ...(filters.status && { status: filters.status }),
      ...(filters.date && { date: filters.date }),
    };

    const response = await apiClient.get(
      `/admin/sales-officers/${salesOfficerId}/invoices`,
      { params },
    );
    return response.data;
  }

  // Dashboard Stats
  async getAdminDashboardStats() {
    const response = await apiClient.get("/admin/stats");
    return response.data;
  }

  async getDailyInvoiceTrend(days = 30) {
    const response = await apiClient.get("/admin/trend/daily", {
      params: { days },
    });
    return response.data;
  }

  async getInvoicesBySalesOfficer(limit = 5) {
    const response = await apiClient.get("/admin/invoices/by-sales-officer", {
      params: { limit },
    });
    return response.data;
  }

  // 👇 New: Sales officers lead-status performance, filterable by period
  async getSalesOfficersPerformance(filters: {
    period: "daily" | "weekly" | "monthly" | "custom";
    from?: string; // yyyy-MM-dd, required when period === "custom"
    to?: string; // yyyy-MM-dd, required when period === "custom"
  }) {
    const params: Record<string, string> = { period: filters.period };
    if (filters.period === "custom") {
      if (filters.from) params.from = filters.from;
      if (filters.to) params.to = filters.to;
    }
    const response = await apiClient.get("/admin/sales-officers/performance", {
      params,
    });
    return response.data;
  }
}

export default AdminService; // Singleton instance
