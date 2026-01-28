import { baseUrl } from "@/config";
import { InventoryFormData } from "@/types";
import { getAuthToken } from "@/utils";
import axios from "axios";
import { toast } from "react-toastify";

class InventoryService {
  constructor() {}

  async createInventory(data: InventoryFormData) {
    try {
      const token = getAuthToken();
      const response = await axios.post(`${baseUrl}/inventory`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      toast.success("✅ Inventory item added successfully!");
      return response.data;
    } catch (error: any) {
      console.error("Error creating inventory item:", error);

      let errorMessage = "❌ Failed to add inventory item. Please try again.";

      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const responseData = error.response?.data;

        if (status === 400 && responseData?.message) {
          const messages = Array.isArray(responseData.message)
            ? responseData.message
            : [responseData.message];

          const fieldMessages: string[] = [];

          for (const msg of messages) {
            if (msg.includes("registrationNumber")) {
              fieldMessages.push("• Registration Number is required.");
            } else if (msg.includes("areaSize")) {
              fieldMessages.push("• Area Size must be a valid number.");
            } else if (msg.includes("areaType")) {
              fieldMessages.push(
                "• Please select a valid area type (Kanal or Marla).",
              );
            } else if (msg.includes("fileType")) {
              fieldMessages.push("• File Type is required.");
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
          toast.error("🚫 You don't have permission to manage inventory.");
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

  async getInventory(
    page: number = 1,
    limit: number = 10,
    filters: {
      searchTerm?: string;
    } = {},
  ) {
    try {
      const token = getAuthToken();
      const params: Record<string, string | number> = {
        page,
        limit,
        ...(filters.searchTerm && { searchTerm: filters.searchTerm }),
      };

      const response = await axios.get(`${baseUrl}/inventory`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
        params,
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching inventory:", error);
      toast.error("❌ Failed to load inventory items.");
      throw error;
    }
  }

  async getInventoryById(id: string) {
    try {
      const token = getAuthToken();
      const response = await axios.get(`${baseUrl}/inventory/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching inventory by ID:", error);
      toast.error("❌ Failed to load inventory details.");
      throw error;
    }
  }

  async updateInventory(id: string, data: Partial<InventoryFormData>) {
    try {
      const token = getAuthToken();
      const response = await axios.put(`${baseUrl}/inventory/${id}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      toast.success("✅ Inventory updated successfully!");
      return response.data;
    } catch (error: any) {
      console.error("Error updating inventory:", error);

      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        if (status === 400) {
          toast.error("⚠️ Invalid data. Please check your inputs.");
        } else if (status === 401) {
          toast.error("🔒 Session expired. Please log in again.");
        } else if (status === 403 || status === 404) {
          toast.error("🚫 You're not authorized to edit this item.");
        } else if (status === 500) {
          toast.error("💥 Server error. Please try again later.");
        } else {
          toast.error("❌ Failed to update inventory.");
        }
      } else {
        toast.error("❌ Update failed. Check your connection.");
      }
      throw error;
    }
  }

  async deleteInventory(id: string) {
    try {
      const token = getAuthToken();
      const response = await axios.delete(`${baseUrl}/inventory/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      toast.success("🗑️ Inventory item deleted successfully!");
      return response.data;
    } catch (error: any) {
      console.error("Error deleting inventory:", error);

      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        if (status === 401) {
          toast.error("🔒 Session expired. Please log in again.");
        } else if (status === 403 || status === 404) {
          toast.error("🚫 You cannot delete this inventory item.");
        } else if (status === 500) {
          toast.error("💥 Server error during deletion.");
        } else {
          toast.error("❌ Failed to delete inventory item.");
        }
      } else {
        toast.error("❌ Deletion failed. Check your network.");
      }
      throw error;
    }
  }
}

export default InventoryService;
