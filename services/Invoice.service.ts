import { apiClient } from "@/config";
import { InvoiceFormData } from "@/types";
import { toast } from "react-toastify";

class InvoiceService {
  async createInvoice(data: InvoiceFormData) {
    try {
      const response = await apiClient.post("/invoices", data);
      return response.data;
    } catch (error: any) {
      console.error("Error creating invoice:", error);

      let errorMessage = "Failed to create invoice. Please try again.";

      if (error.response) {
        const status = error.response.status;
        const responseData = error.response.data;

        if (status === 400 && responseData?.message) {
          const messages = Array.isArray(responseData.message)
            ? responseData.message
            : [responseData.message];

          const fieldMessages: string[] = [];

          for (const msg of messages) {
            if (msg.includes("customerName")) {
              fieldMessages.push("• Customer name is required.");
            } else if (msg.includes("phoneNumber")) {
              fieldMessages.push(
                "• Please enter a valid phone number starting with 03 (e.g., 03001234567).",
              );
            } else if (msg.includes("amount")) {
              fieldMessages.push(
                "• Amount must be a valid number greater than or equal to 0.",
              );
            } else if (msg.includes("date")) {
              fieldMessages.push(
                "• Invoice date is required and must be valid.",
              );
            } else if (msg.includes("status")) {
              fieldMessages.push(
                "• Status must be one of: Pending, Received (SO), or Cancelled.",
              );
            } else {
              fieldMessages.push(`• ${msg}`);
            }
          }

          if (fieldMessages.length > 0) {
            errorMessage =
              "⚠️ Please fix the following:\n" + fieldMessages.join("\n");
            toast.error(errorMessage, {
              style: { whiteSpace: "pre-line" },
            });
          } else {
            toast.error("⚠️ Invalid form data. Please check all fields.");
          }
        } else if (status === 401) {
          toast.error("🔒 Your session has expired. Please log in again.");
        } else if (status === 403) {
          toast.error("🚫 You don't have permission to create invoices.");
        } else if (status === 500) {
          toast.error(
            "💥 Something went wrong on our end. Please try again later.",
          );
        } else {
          toast.error(errorMessage);
        }
      } else {
        if (error.message?.includes("Network Error")) {
          toast.error("🌐 Network error. Please check your connection.");
        } else {
          toast.error(errorMessage);
        }
      }
    }
  }

  async getInvoices(
    page: number = 1,
    limit: number = 10,
    filters: {
      searchTerm?: string;
      status?: string;
      date?: string;
    } = {},
  ) {
    try {
      const params: Record<string, string | number> = {
        page,
        limit,
        ...(filters.searchTerm && { searchTerm: filters.searchTerm }),
        ...(filters.status && { status: filters.status }),
        ...(filters.date && { date: filters.date }),
      };

      const response = await apiClient.get("/invoices", { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching invoices:", error);
    }
  }

  async getSalesOfficerInvoicesForSuperAdmin(
    filters: {
      searchTerm?: string;
      status?: string;
      timeRange?: "lastWeek" | "lastMonth" | "last6Months" | "lastYear";
      from?: string;
      to?: string;
      salesOfficerId?: string;
    } = {},
  ) {
    try {
      const params: Record<string, string> = {};
      if (filters.searchTerm) params.searchTerm = filters.searchTerm;
      if (filters.status) params.status = filters.status;
      if (filters.salesOfficerId)
        params.salesOfficerId = filters.salesOfficerId;
      if (filters.timeRange) params.timeRange = filters.timeRange;
      if (filters.from) params.from = filters.from;
      if (filters.to) params.to = filters.to;

      const response = await apiClient.get(
        "/invoices/sales-officers-invoices",
        {
          params,
        },
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching invoices:", error);
    }
  }

  async getInvoicesReportedToMe(
    page: number = 1,
    limit: number = 10,
    filters: {
      searchTerm?: string;
      status?: string;
      date?: string;
    } = {},
  ) {
    try {
      const params: Record<string, string | number> = {
        page,
        limit,
        ...(filters.searchTerm && { searchTerm: filters.searchTerm }),
        ...(filters.status && { status: filters.status }),
        ...(filters.date && { date: filters.date }),
      };

      const response = await apiClient.get("/invoices/reported-to-me", {
        params,
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching invoices reported to admin:", error);
    }
  }

  async getInvoicesBySalesOfficer(
    salesOfficerId: string,
    page: number,
    itemsPerPage: number,
    filters: {
      searchTerm?: string;
      status?: string;
      dateFrom?: string;
      dateTo?: string;
    },
  ) {
    try {
      const response = await apiClient.get(
        `/invoices/sales-officer/${salesOfficerId}`,
        {
          params: {
            page,
            limit: itemsPerPage,
            searchTerm: filters.searchTerm,
            status: filters.status,
            dateFrom: filters.dateFrom,
            dateTo: filters.dateTo,
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching sales officer invoices:", error);
      throw error;
    }
  }

  async updateInvoiceApprovalStatus(
    invoiceId: string,
    data: { admin_approval_status: string },
  ) {
    const response = await apiClient.patch(
      `/invoices/${invoiceId}/approval-status`,
      data,
    );
    return response.data;
  }

  async getInvoiceById(id: string) {
    try {
      const response = await apiClient.get(`/invoices/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching invoice by ID:", error);
    }
  }

  async updateInvoice(id: string, data: any) {
    try {
      const response = await apiClient.put(`/invoices/${id}`, data);
      toast.success("Invoice updated successfully!");
      return response.data;
    } catch (error) {
      console.error("Error updating invoice:", error);
    }
  }

  async deleteInvoice(id: string) {
    try {
      const response = await apiClient.delete(`/invoices/${id}`);
      toast.success("Invoice deleted successfully!");
      return response.data;
    } catch (error) {
      console.error("Error deleting invoice:", error);
    }
  }

  async updateInvoiceRemarks(invoiceId: string, remarks: string | null) {
    try {
      const response = await apiClient.patch(`/invoices/${invoiceId}/remarks`, {
        remarks,
      });
      toast.success("Remarks updated successfully!");
      return response.data;
    } catch (error: any) {
      console.error("Error updating remarks:", error);
      if (error.response) {
        const status = error.response.status;
        if (status === 401) {
          toast.error("🔒 Your session has expired. Please log in again.");
        } else if (status === 403 || status === 404) {
          toast.error("🚫 You're not authorized to update this invoice.");
        } else {
          toast.error("Failed to update remarks. Please try again.");
        }
      } else {
        toast.error("Failed to update remarks. Please check your connection.");
      }
    }
  }
}

export default InvoiceService;
