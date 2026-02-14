import { apiClient } from "@/config";
import { ExpenseFormData } from "@/types";
import { toast } from "react-toastify";

export interface ExpenseFilters {
  searchTerm?: string;
  dateFilter?: "today" | "yesterday" | "last7" | "last30";
  customDateRange?: { from: Date; to: Date };
}

class ExpenseService {
  async createExpense(
    data: Omit<ExpenseFormData, "amount"> & { amount: number },
  ) {
    try {
      const response = await apiClient.post("/expenses", data);
      toast.success("✅ Expense added successfully!");
      return response.data;
    } catch (error: any) {
      console.error("Error creating expense:", error);
      let errorMessage = "Failed to add expense. Please try again.";

      if (error.isAxiosError || error.response) {
        const status = error.response?.status;
        const responseData = error.response?.data;

        if (status === 400 && responseData?.message) {
          const messages = Array.isArray(responseData.message)
            ? responseData.message
            : [responseData.message];

          const fieldMessages: string[] = [];
          for (const msg of messages) {
            if (msg.includes("name")) {
              fieldMessages.push("• Expense name is required.");
            } else if (msg.includes("amount")) {
              fieldMessages.push(
                "• Amount must be a valid number greater than 0.",
              );
            } else {
              fieldMessages.push(`• ${msg}`);
            }
          }

          if (fieldMessages.length > 0) {
            errorMessage =
              "⚠️ Please fix the following:\n" + fieldMessages.join("\n");
            toast.error(errorMessage, { style: { whiteSpace: "pre-line" } });
          } else {
            toast.error("⚠️ Invalid form data. Please check all fields.");
          }
        } else if (status === 401) {
          // Handled by interceptor, but keep as fallback
          toast.error("🔒 Your session has expired. Please log in again.");
        } else if (status === 403) {
          toast.error("🚫 You don't have permission to manage expenses.");
        } else if (status === 500) {
          toast.error(
            "💥 Something went wrong on our end. Please try again later.",
          );
        } else {
          toast.error(errorMessage);
        }
      } else {
        console.log("Error Creating Expense");
      }
      throw error;
    }
  }

  async getExpenses(
    page: number = 1,
    limit: number = 10,
    filters: ExpenseFilters = {},
  ) {
    try {
      const params: Record<string, string | number> = {
        page,
        limit,
        ...(filters.searchTerm && { searchTerm: filters.searchTerm }),
        ...(filters.dateFilter && { dateFilter: filters.dateFilter }),
      };

      const response = await apiClient.get("/expenses", { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching expenses:", error);
      throw error;
    }
  }

  async getExpenseById(id: string) {
    try {
      const response = await apiClient.get(`/expenses/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching expense by ID:", error);
      throw error;
    }
  }

  async updateExpense(
    id: string,
    data: Omit<ExpenseFormData, "amount"> & { amount: number },
  ) {
    try {
      const response = await apiClient.put(`/expenses/${id}`, data);
      toast.success("✅ Expense updated successfully!");
      return response.data;
    } catch (error: any) {
      console.error("Error updating expense:", error);
      if (error.response) {
        const status = error.response.status;
        if (status === 400)
          toast.error("⚠️ Invalid data. Please check your inputs.");
        else if (status === 401)
          toast.error("🔒 Session expired. Please log in again.");
        else if (status === 403 || status === 404)
          toast.error("🚫 You're not authorized to edit this expense.");
        else if (status === 500)
          toast.error("💥 Server error. Please try again later.");
        else toast.error("Failed to update expense.");
      } else {
        toast.error("Update failed. Check your connection.");
      }
      throw error;
    }
  }

  async deleteExpense(id: string) {
    try {
      const response = await apiClient.delete(`/expenses/${id}`);
      toast.success("🗑️ Expense deleted successfully!");
      return response.data;
    } catch (error: any) {
      console.error("Error deleting expense:", error);
      if (error.response) {
        const status = error.response.status;
        if (status === 401)
          toast.error("🔒 Session expired. Please log in again.");
        else if (status === 403 || status === 404)
          toast.error("🚫 You cannot delete this expense.");
        else if (status === 500)
          toast.error("💥 Server error during deletion.");
        else toast.error("Failed to delete expense.");
      } else {
        toast.error("Deletion failed. Check your network.");
      }
      throw error;
    }
  }
}

export default ExpenseService; // Singleton instance
