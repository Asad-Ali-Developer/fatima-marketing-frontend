// src/services/AdminService.ts

import { baseUrl } from "@/config";
import { getAuthToken } from "@/utils";
import axios from "axios";

class AdminService {
  constructor() {}

  async getAllSalesOfficerMadeByAdmin(page: number, limit: number) {
    try {
      const token = getAuthToken();
      const response = await axios.get(
        `${baseUrl}/admin/sales-officers/created-by-admin`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
          params: { page, limit },
        },
      );
      return response.data;
    } catch (error) {
      console.log("Error fetching sales officers:", error);
      throw error;
    }
  }

  // ✅ NEW: Search sales officers by name/email
  async searchSalesOfficers(searchTerm: string) {
    if (!searchTerm.trim()) return { data: [], status: true };
    const token = getAuthToken();
    const response = await axios.get(`${baseUrl}/admin/sales-officers/search`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { q: searchTerm.trim() },
    });
    return response.data;
  }

  // ✅ NEW: Get specific sales officer by ID
  async getSalesOfficerById(id: string) {
    const token = getAuthToken();
    const response = await axios.get(`${baseUrl}/admin/sales-officers/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  }

  // ✅ NEW: Get invoices created by a specific SO (reported to this admin)
//   async getInvoicesBySalesOfficerId(
//     salesOfficerId: string,
//     page: number = 1,
//     limit: number = 10,
//     filters: {
//       searchTerm?: string;
//       status?: string;
//       date?: string; // YYYY-MM-DD
//     } = {},
//   ) {
//     const token = getAuthToken();
//     const params = {
//       page,
//       limit,
//       ...(filters.searchTerm && { searchTerm: filters.searchTerm }),
//       ...(filters.status && { status: filters.status }),
//       ...(filters.date && { date: filters.date }),
//     };

//     const response = await axios.get(
//       `${baseUrl}/admin/sales-officers/${salesOfficerId}/invoices`,
//       {
//         headers: { Authorization: `Bearer ${token}` },
//         params,
//       },
//     );
//     return response.data;
//   }

  // Dashboard Stats
  async getAdminDashboardStats() {
    const token = getAuthToken();
    const res = await axios.get(`${baseUrl}/admin/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  }

  async getDailyInvoiceTrend(days = 30) {
    const token = getAuthToken();
    const res = await axios.get(`${baseUrl}/admin/trend/daily?days=${days}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  }

  async getInvoicesBySalesOfficer(limit = 5) {
    const token = getAuthToken();
    const res = await axios.get(
      `${baseUrl}/admin/invoices/by-sales-officer?limit=${limit}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return res.data;
  }
  
  async getInvoicesBySalesOfficerId(
    salesOfficerId: string,
    page: number = 1,
    limit: number = 10,
    filters: { searchTerm?: string; status?: string; date?: string } = {},
  ) {
    const token = getAuthToken();
    const params = {
      page,
      limit,
      ...(filters.searchTerm && { searchTerm: filters.searchTerm }),
      ...(filters.status && { status: filters.status }),
      ...(filters.date && { date: filters.date }),
    };
    const res = await axios.get(
      `${baseUrl}/admin/sales-officers/${salesOfficerId}/invoices`,
      {
        headers: { Authorization: `Bearer ${token}` },
        params,
      },
    );
    return res.data;
  }
}

export default AdminService;
