// @/services/DashboardService.ts
import { baseUrl } from "@/config";
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
import { getAuthToken } from "@/utils";
import axios from "axios";
import { toast } from "react-toastify";

class DashboardService {
  private getAuthHeaders() {
    const token = getAuthToken();
    return {
      Authorization: `Bearer ${token}`,
    };
  }

  async getDashboardStats() {
    try {
      const response = await axios.get<{ data: DashboardStats }>(
        `${baseUrl}/dashboard/stats`,
        {
          headers: this.getAuthHeaders(),
          withCredentials: true,
        }
      );
      return response.data.data;
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      toast.error("❌ Failed to load dashboard statistics.");
      throw error;
    }
  }

  async getExpenseSummary() {
    try {
      const response = await axios.get<{ data: ExpenseSummary }>(
        `${baseUrl}/dashboard/expenses/summary`,
        {
          headers: this.getAuthHeaders(),
          withCredentials: true,
        }
      );
      return response.data.data;
    } catch (error) {
      console.error("Error fetching expense summary:", error);
      toast.error("❌ Failed to load expense summary.");
      throw error;
    }
  }

  async getExpenseTrends() {
    try {
      const response = await axios.get<{ data: ExpenseTrend }>(
        `${baseUrl}/dashboard/expenses/trends`,
        {
          headers: this.getAuthHeaders(),
          withCredentials: true,
        }
      );
      return response.data.data;
    } catch (error) {
      console.error("Error fetching expense trends:", error);
      toast.error("❌ Failed to load expense trends.");
      throw error;
    }
  }

  async getOfficersPerformance() {
    try {
      const response = await axios.get<{ data: OfficerPerformance[] }>(
        `${baseUrl}/dashboard/officers/performance`,
        {
          headers: this.getAuthHeaders(),
          withCredentials: true,
        }
      );
      return response.data.data;
    } catch (error) {
      console.error("Error fetching officer performance:", error);
      toast.error("❌ Failed to load sales officer performance.");
      throw error;
    }
  }

  async getInvoiceStats() {
    try {
      const response = await axios.get<{ data: InvoiceStats }>(
        `${baseUrl}/dashboard/invoices/stats`,
        {
          headers: this.getAuthHeaders(),
          withCredentials: true,
        }
      );
      return response.data.data;
    } catch (error) {
      console.error("Error fetching invoice stats:", error);
      toast.error("❌ Failed to load invoice statistics.");
      throw error;
    }
  }

  async getRecentActivities(limit: number = 10) {
    try {
      const response = await axios.get<{ data: RecentActivity[] }>(
        `${baseUrl}/dashboard/activities/recent`,
        {
          headers: this.getAuthHeaders(),
          withCredentials: true,
          params: { limit },
        }
      );
      return response.data.data;
    } catch (error) {
      console.error("Error fetching recent activities:", error);
      toast.error("❌ Failed to load recent activities.");
      throw error;
    }
  }

  async getLeadStatusDistribution() {
    try {
      const response = await axios.get<{ data: LeadStatusDistribution }>(
        `${baseUrl}/dashboard/leads/distribution`,
        {
          headers: this.getAuthHeaders(),
          withCredentials: true,
        }
      );
      return response.data.data;
    } catch (error) {
      console.error("Error fetching lead distribution:", error);
      toast.error("❌ Failed to load lead status distribution.");
      throw error;
    }
  }

  async getInventorySummary() {
    try {
      const response = await axios.get<{ data: InventorySummary }>(
        `${baseUrl}/dashboard/inventory/summary`,
        {
          headers: this.getAuthHeaders(),
          withCredentials: true,
        }
      );
      return response.data.data;
    } catch (error) {
      console.error("Error fetching inventory summary:", error);
      toast.error("❌ Failed to load inventory summary.");
      throw error;
    }
  }

  async getCompleteDashboardData() {
    try {
      const response = await axios.get<{ data: CompleteDashboardData }>(
        `${baseUrl}/dashboard/complete`,
        {
          headers: this.getAuthHeaders(),
          withCredentials: true,
        }
      );
      return response.data.data;
    } catch (error) {
      console.error("Error fetching complete dashboard data:", error);
      toast.error("❌ Failed to load complete dashboard data.");
      throw error;
    }
  }

  async getExpenseReportData(startDate: string, endDate: string) {
    try {
      const response = await axios.get(
        `${baseUrl}/dashboard/expenses/report`,
        {
          headers: this.getAuthHeaders(),
          withCredentials: true,
          params: { startDate, endDate },
        }
      );
      return response.data.data;
    } catch (error) {
      console.error("Error fetching expense report:", error);
      toast.error("❌ Failed to generate expense report.");
      throw error;
    }
  }

  async getQuickStats() {
    try {
      const response = await axios.get(`${baseUrl}/dashboard/quick-stats`, {
        headers: this.getAuthHeaders(),
        withCredentials: true,
      });
      return response.data.data;
    } catch (error) {
      console.error("Error fetching quick stats:", error);
      toast.error("❌ Failed to load quick stats.");
      throw error;
    }
  }
}

export default new DashboardService();