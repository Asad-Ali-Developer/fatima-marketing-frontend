import { baseUrl } from "@/config";
import { InvoiceFormData } from "@/types";
import { getAuthToken } from "@/utils";
import axios from "axios";
import { toast } from "react-toastify";

class InvoiceService {
  constructor() {}

  async createInvoice(data: InvoiceFormData) {
    try {
      const token = getAuthToken();
      const response = await axios.post(`${baseUrl}/invoices`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      toast.success("Invoice created successfully!");
      return response.data;
    } catch (error: any) {
      console.error("Error creating invoice:", error);

      // Default fallback message
      let errorMessage = "❌ Failed to create invoice. Please try again.";

      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const responseData = error.response?.data;

        if (status === 400 && responseData?.message) {
          // Handle validation errors from NestJS (class-validator)
          const messages = Array.isArray(responseData.message)
            ? responseData.message
            : [responseData.message];

          // Map known field errors to user-friendly toasts
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
              // Generic validation message
              fieldMessages.push(`• ${msg}`);
            }
          }

          if (fieldMessages.length > 0) {
            errorMessage =
              "⚠️ Please fix the following:\n" + fieldMessages.join("\n");
            toast.error(errorMessage, {
              style: { whiteSpace: "pre-line" }, // Preserves line breaks
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
          // Other client/server errors
          toast.error(errorMessage);
        }
      } else {
        // Non-Axios errors (network, etc.)
        if (error.message?.includes("Network Error")) {
          toast.error("🌐 Network error. Please check your connection.");
        } else {
          toast.error(errorMessage);
        }
      }

      throw error; // Re-throw for upstream handling if needed
    }
  }
  
  async getInvoices(
    page: number = 1,
    limit: number = 10,
    filters: {
      searchTerm?: string;
      status?: string;
      date?: string; // YYYY-MM-DD
    } = {},
  ) {
    try {
      const token = getAuthToken();
      const params: Record<string, string | number> = {
        page,
        limit,
        ...(filters.searchTerm && { searchTerm: filters.searchTerm }),
        ...(filters.status && { status: filters.status }),
        ...(filters.date && { date: filters.date }),
      };

      const response = await axios.get(`${baseUrl}/invoices`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
        params,
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching invoices:", error);
      throw error;
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
      const token = getAuthToken();
      const params: Record<string, string | number> = {
        page,
        limit,
        ...(filters.searchTerm && { searchTerm: filters.searchTerm }),
        ...(filters.status && { status: filters.status }),
        ...(filters.date && { date: filters.date }),
      };

      const response = await axios.get(`${baseUrl}/invoices/reported-to-me`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
        params,
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching invoices reported to admin:", error);
      throw error;
    }
  }

  async updateInvoiceApprovalStatus(
    invoiceId: string,
    data: { admin_approval_status: string },
  ) {
    const token = getAuthToken();
    const response = await axios.patch(
      `${baseUrl}/invoices/${invoiceId}/approval-status`,
      data,
      {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      },
    );
    return response.data;
  }

  async getInvoiceById(id: string) {
    try {
      const token = getAuthToken();
      const response = await axios.get(`${baseUrl}/invoices/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching invoice by ID:", error);
      throw error;
    }
  }

  async updateInvoice(id: string, data: any) {
    try {
      const token = getAuthToken();
      const response = await axios.put(`${baseUrl}/invoices/${id}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      toast.success("Invoice updated successfully!");
      return response.data;
    } catch (error) {
      console.error("Error updating invoice:", error);
      throw error;
    }
  }

  async deleteInvoice(id: string) {
    try {
      const token = getAuthToken();
      const response = await axios.delete(`${baseUrl}/invoices/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      toast.success("Invoice deleted successfully!");
      return response.data;
    } catch (error) {
      console.error("Error deleting invoice:", error);
      throw error;
    }
  }

  async updateInvoiceRemarks(invoiceId: string, remarks: string | null) {
    try {
      const token = getAuthToken();
      const response = await axios.patch(
        `${baseUrl}/invoices/${invoiceId}/remarks`,
        { remarks },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        },
      );
      toast.success("Remarks updated successfully!");
      return response.data;
    } catch (error) {
      console.error("Error updating remarks:", error);
      // Optional: show error toast
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        if (status === 401) {
          toast.error("🔒 Your session has expired. Please log in again.");
        } else if (status === 403 || status === 404) {
          toast.error("🚫 You're not authorized to update this invoice.");
        } else {
          toast.error("❌ Failed to update remarks. Please try again.");
        }
      } else {
        toast.error(
          "❌ Failed to update remarks. Please check your connection.",
        );
      }
      throw error;
    }
  }
}

export default InvoiceService;
