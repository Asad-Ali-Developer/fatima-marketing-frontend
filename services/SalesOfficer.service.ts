import { baseUrl } from "@/config";
import { getAuthToken } from "@/utils";
import axios from "axios";

class SalesOfficerService {
  constructor() {}

  async getAllSalesOfficerMadeByAdmin(page: number, limit: number) {
    try {
      const token = getAuthToken();
      const response = await axios.get(
        `${baseUrl}/sales-officer/sales-officers/created-by-admin`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
          params: { page, limit },
        },
      );
      return response;
    } catch (error) {
      console.log("Error: ", error);
      throw error;
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
      const token = getAuthToken();
      const response = await axios.get(`${baseUrl}/sales-officer/leads`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
        params: {
          page,
          limit,
          ...(searchTerm !== undefined && { searchTerm }),
          ...(status !== undefined && { status }),
          ...(date !== undefined && { date }),
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching leads:", error);
      throw error;
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
      const token = getAuthToken();
      const response = await axios.get(`${baseUrl}/sales-officer/invoices`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
        params: {
          page,
          limit,
          ...(searchTerm !== undefined && { searchTerm }),
          ...(status !== undefined && { status }),
          ...(date !== undefined && { date }),
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching invoices:", error);
      throw error;
    }
  }

  // ─── NEW: Get Dashboard Summary Stats ────────────────────────────────
  async getDashboardStats() {
    try {
      const token = getAuthToken();
      const response = await axios.get(
        `${baseUrl}/sales-officer/dashboard-stats`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        },
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      throw error;
    }
  }
}

export default SalesOfficerService;
