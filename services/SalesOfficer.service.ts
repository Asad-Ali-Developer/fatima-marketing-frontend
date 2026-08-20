import { apiClient } from "@/config";

export interface DashboardStatsResponse {
  totalLeads: number;
  pendingLeads: number;
  inProgressLeads: number;
  completedLeads: number;
  conversionRate: string;
  last7Days: {
    date: string;
    total: number;
    pending: number;
    in_progress: number;
    completed: number;
  }[];
}
 
export interface DayReportResponse {
  date: string;
  total: number;
  pending: number;
  in_progress: number;
  completed: number;
}

class SalesOfficerService {
  constructor() {}

  async getAllSalesOfficerMadeByAdmin(page: number, limit: number) {
    try {
      const response = await apiClient.get(
        "/sales-officers/created-by-admin",
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

  // ─── NEW: Get Assigned Leads for Sales Officer (Dashboard) ─────────────────────
  async getAssignedLeadsForSO({
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

      const response = await apiClient.get("/sales-officer/assigned-leads", {
        params,
      });
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

  // ─── NEW: Lightweight lead stats (status counts + 7-day trend) ───────
  // Backed by an aggregation query, so this never pulls full lead docs —
  // just the small pre-computed numbers used by the dashboard cards/charts.
  async getLeadStats() {
    try {
      const response = await apiClient.get("/sales-officer/stats");
      return response.data;
    } catch (error) {
      console.error("Error fetching lead stats:", error);
    }
  }

  // ─── NEW: Today's assigned leads only ─────────────────────────────────
  async getTodayLeadsForSO({
    page = 1,
    limit = 50,
  }: {
    page?: number;
    limit?: number;
  } = {}) {
    try {
      const response = await apiClient.get("/sales-officer/today", {
        params: { page, limit },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching today's leads:", error);
    }
  }

  // ─── NEW: Per-day counts for the weekly calendar report ───────────────
  async getLeadsCalendarForSO({
    startDate,
    endDate,
    status,
  }: {
    startDate: string;
    endDate: string;
    status?: string;
  }) {
    try {
      const params: Record<string, string> = {
        startDate,
        endDate,
        ...(status !== undefined && { status }),
      };

      const response = await apiClient.get("/sales-officer/calendar", {
        params,
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching leads calendar:", error);
    }
  }

  // ─── NEW: Needs-Attention leads (server-computed staleness) ───────────
  async getNeedsAttentionLeadsForSO({
    date,
    range,
    limit,
  }: {
    date?: string;
    range?: "today" | "7d" | "30d";
    limit?: number;
  } = {}) {
    try {
      const params: Record<string, string | number> = {
        ...(date !== undefined && { date }),
        ...(range !== undefined && { range }),
        ...(limit !== undefined && { limit }),
      };

      const response = await apiClient.get(
        "/sales-officer/needs-attention",
        { params },
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching needs-attention leads:", error);
    }
  }
  
}

export default SalesOfficerService;
