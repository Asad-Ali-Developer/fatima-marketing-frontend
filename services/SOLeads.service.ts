import { apiClient } from "@/config";
import { LeadFormData } from "@/types/Leads";
import { toast } from "react-toastify";

class SOLeadsService {
  constructor() {}

  async createLead(data: Omit<LeadFormData, "_id" | "createdAt">) {
    try {
      const response = await apiClient.post("/so-leads", data);
      toast.success("Lead created successfully!");
      return response.data;
    } catch (error: any) {
      console.error("Error creating lead:", error);

      let errorMessage = "Failed to create lead. Please try again.";

      if (error.response) {
        const status = error.response.status;
        const responseData = error.response.data;

        if (status === 400 && responseData?.message) {
          const messages = Array.isArray(responseData.message)
            ? responseData.message
            : [responseData.message];

          const fieldMessages: string[] = [];

          for (const msg of messages) {
            if (msg.includes("userName")) {
              fieldMessages.push("• User name is required.");
            } else if (msg.includes("location")) {
              fieldMessages.push("• Location is invalid or too long.");
            } else if (msg.includes("time")) {
              fieldMessages.push(
                "• Lead time is required and must be a valid date.",
              );
            } else if (msg.includes("status")) {
              fieldMessages.push(
                "• Status must be one of: pending, in_progress, or completed.",
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
          toast.error("🚫 You don't have permission to create leads.");
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

      throw error;
    }
  }

  async getLeads(
    page: number = 1,
    limit: number = 10,
    filters: {
      searchTerm?: string;
      status?: string;
      date?: string; // YYYY-MM-DD
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

      const response = await apiClient.get("/so-leads", { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching leads:", error);
    }
  }

  // In your frontend service
  async getLeadsReportedToAdmin(
    page: number = 1,
    limit: number = 10,
    filters: {
      searchTerm?: string;
      status?: string;
      date?: string;
      dateFrom?: string;
      dateTo?: string;
    } = {},
  ) {
    const params: any = { page, limit, ...filters };
    const response = await apiClient.get("/so-leads/so-leads-reported-to-me", {
      params,
    });
    return response.data;
  }

  async updateLead(id: string, data: Partial<LeadFormData>) {
    try {
      const response = await apiClient.put(`/so-leads/${id}`, data);
      toast.success("Lead updated successfully!");
      return response.data;
    } catch (error: any) {
      console.error("Error updating lead:", error);

      if (error.response) {
        const status = error.response.status;
        if (status === 401) {
          toast.error("🔒 Session expired. Please log in again.");
        } else if (status === 403 || status === 404) {
          toast.error("🚫 You're not authorized to update this lead.");
        } else if (status === 400) {
          toast.error("⚠️ Invalid data. Please check your inputs.");
        } else {
          toast.error("Failed to update lead. Please try again.");
        }
      } else {
        toast.error("Failed to update lead. Check your connection.");
      }

      throw error;
    }
  }

  async deleteLead(id: string) {
    try {
      const response = await apiClient.delete(`/so-leads/${id}`);
      toast.success("Lead deleted successfully!");
      return response.data;
    } catch (error: any) {
      console.error("Error deleting lead:", error);

      if (error.response) {
        const status = error.response.status;
        if (status === 401) {
          toast.error("🔒 Session expired. Please log in again.");
        } else if (status === 403 || status === 404) {
          toast.error("🚫 You cannot delete this lead.");
        } else {
          toast.error("Failed to delete lead. Please try again.");
        }
      } else {
        toast.error("Network error. Could not delete lead.");
      }

      throw error;
    }
  }

  async updateLeadRemarks(leadId: string, remarks: string | null) {
    try {
      const response = await apiClient.patch(`/so-leads/${leadId}/remarks`, {
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
          toast.error("🚫 You're not authorized to update this lead.");
        } else {
          toast.error("Failed to update remarks. Please try again.");
        }
      } else {
        toast.error("Failed to update remarks. Check your connection.");
      }

      throw error;
    }
  }

  async updateLeadStatus(
    leadId: string,
    status: "pending" | "in_progress" | "completed",
  ) {
    try {
      const response = await apiClient.patch(`/so-leads/${leadId}/status`, {
        status,
      });
      toast.success("Status updated successfully!");
      return response.data;
    } catch (error: any) {
      console.error("Error updating status:", error);
      if (error.response) {
        const status = error.response.status;
        if (status === 401) {
          toast.error("🔒 Your session has expired. Please log in again.");
        } else if (status === 403 || status === 404) {
          toast.error("🚫 You're not authorized to update this lead.");
        } else {
          toast.error("Failed to update status. Please try again.");
        }
      } else {
        toast.error("Failed to update status. Check your connection.");
      }
      throw error;
    }
  }

  async getLeadsBySalesOfficer(
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
        `/so-leads/sales-officer/${salesOfficerId}`,
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
      console.error("Error fetching sales officer leads:", error);
      throw error;
    }
  }
}

export default SOLeadsService;
