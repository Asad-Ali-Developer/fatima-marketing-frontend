import { apiClient } from "@/config";
import {
  DashboardStats,
  ExpenseSummary,
  ExpenseTrend,
  OfficerPerformance,
  InvoiceStats,
  RecentActivity,
  LeadStatusDistribution,
  InventorySummary,
  CompleteDashboardData,
} from "@/types";
import { toast } from "react-toastify";

class DashboardService {
  async getDashboardStats() {
    try {
      const response = await apiClient.get<{ data: DashboardStats }>(
        "/dashboard/stats",
      );
      return response.data.data;
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      throw error;
    }
  }

  async getExpenseSummary() {
    try {
      const response = await apiClient.get<{ data: ExpenseSummary }>(
        "/dashboard/expenses/summary",
      );
      return response.data.data;
    } catch (error) {
      console.error("Error fetching expense summary:", error);
      throw error;
    }
  }

  async getExpenseTrends() {
    try {
      const response = await apiClient.get<{ data: ExpenseTrend }>(
        "/dashboard/expenses/trends",
      );
      return response.data.data;
    } catch (error) {
      console.error("Error fetching expense trends:", error);
      throw error;
    }
  }

  async getOfficersPerformance() {
    try {
      const response = await apiClient.get<{ data: OfficerPerformance[] }>(
        "/dashboard/officers/performance",
      );
      return response.data.data;
    } catch (error) {
      console.error("Error fetching officer performance:", error);
      throw error;
    }
  }

  async getInvoiceStats() {
    try {
      const response = await apiClient.get<{ data: InvoiceStats }>(
        "/dashboard/invoices/stats",
      );
      return response.data.data;
    } catch (error) {
      console.error("Error fetching invoice stats:", error);
      throw error;
    }
  }

  async getRecentActivities(limit: number = 10) {
    try {
      const response = await apiClient.get<{ data: RecentActivity[] }>(
        "/dashboard/activities/recent",
        {
          params: { limit },
        },
      );
      return response.data.data;
    } catch (error) {
      console.error("Error fetching recent activities:", error);
      throw error;
    }
  }

  async getLeadStatusDistribution() {
    try {
      const response = await apiClient.get<{ data: LeadStatusDistribution }>(
        "/dashboard/leads/distribution",
      );
      return response.data.data;
    } catch (error) {
      console.error("Error fetching lead distribution:", error);
      throw error;
    }
  }

  async getInventorySummary() {
    try {
      const response = await apiClient.get<{ data: InventorySummary }>(
        "/dashboard/inventory/summary",
      );
      return response.data.data;
    } catch (error) {
      console.error("Error fetching inventory summary:", error);
      throw error;
    }
  }

  async getCompleteDashboardData() {
    try {
      const response = await apiClient.get<{ data: CompleteDashboardData }>(
        "/dashboard/complete",
      );
      return response.data.data;
    } catch (error) {
      console.error("Error fetching complete dashboard data:", error);
      throw error;
    }
  }

  async getExpenseReportData(startDate: string, endDate: string) {
    try {
      const response = await apiClient.get("/dashboard/expenses/report", {
        params: { startDate, endDate },
      });
      return response.data.data;
    } catch (error) {
      console.error("Error fetching expense report:", error);
      throw error;
    }
  }

  async getQuickStats() {
    try {
      const response = await apiClient.get("/dashboard/quick-stats");
      return response.data.data;
    } catch (error) {
      console.error("Error fetching quick stats:", error);
      throw error;
    }
  }
}

export default DashboardService; // Singleton instance
