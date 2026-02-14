import { apiClient } from "@/config";
import { LoginData, RegisterData, UpdateUserData, User } from "@/types";
import { toast } from "react-toastify";

interface UserProfile {
  message: string;
  data: User;
}

class AuthService {
  async register(data: RegisterData) {
    const { full_name, email, password, role, rokra } = data;
    try {
      const response = await apiClient.post("/auth/register", {
        full_name,
        email,
        password,
        role,
        rokra,
      });
      return response;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  }

  async registerAdmin(data: RegisterData) {
    const { full_name, email, showPassword, role, status } = data;
    const payload = {
      full_name,
      email,
      ...(showPassword && { showPassword }),
      role,
      status,
    };
    try {
      const response = await apiClient.post("/auth/register-admin", payload);
      return response;
    } catch (error) {
      console.error("Admin registration error:", error);
      throw error;
    }
  }

  async registerSalesOfficer(data: RegisterData) {
    const {
      full_name,
      email,
      showPassword,
      role,
      status,
      commissionedBy,
      gender,
      rokra,
    } = data;

    const payload = {
      full_name,
      email,
      ...(showPassword && { showPassword }),
      role,
      status,
      commissionedBy,
      gender,
      rokra,
    };

    try {
      const response = await apiClient.post(
        "/auth/register-sales-officer",
        payload,
      );
      return response;
    } catch (error) {
      console.error("Sales officer registration error:", error);
      throw error;
    }
  }

  async login(data: LoginData) {
    const { email, password, rememberMe } = data;
    try {
      const response = await apiClient.post("/auth/login", {
        email,
        password,
        rememberMe,
      });
      return response;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  // ✅ No token needed — cookies handle auth
  async getProfile() {
    try {
      const response = await apiClient.get<UserProfile>("/auth/profile");
      return response.data;
    } catch (error) {
      console.error("Profile fetch error:", error);
      throw error;
    }
  }

  async logout() {
    try {
      const response = await apiClient.get("/auth/logout");
      return response;
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  }

  async updateProfileImage(updateData: {
    profileImage?: string;
    email?: string;
  }) {
    try {
      const response = await apiClient.patch<UserProfile>(
        "/auth/profile-image",
        updateData,
      );
      return response.data;
    } catch (error: any) {
      console.error("Profile image update error:", error);
      if (error.response?.status === 400) {
        throw new Error(
          error.response.data.message || "Invalid image format or size.",
        );
      }
      throw new Error("Failed to update profile image.");
    }
  }

  async updateProfile(updateData: UpdateUserData) {
    try {
      const response = await apiClient.patch<UserProfile>(
        "/auth/profile",
        updateData,
      );
      return response.data;
    } catch (error: any) {
      console.error("Profile update error:", error);
      if (error.response?.status === 400) {
        throw new Error(error.response.data.message || "Invalid input data.");
      }
      if (error.response?.status === 403) {
        throw new Error("Not authorized to update this field.");
      }
      throw new Error("Failed to update profile.");
    }
  }

  async updateSalesOfficerAsAdmin(
    id: string,
    updateData: Partial<UpdateUserData>,
  ) {
    try {
      const response = await apiClient.patch<UserProfile>(
        `/auth/sales-officer/${id}`,
        updateData,
      );
      return response.data;
    } catch (error: any) {
      console.error("Sales officer update error:", error);
      if (error.response?.status === 400) {
        throw new Error(error.response.data.message || "Invalid input data.");
      }
      if (error.response?.status === 403) {
        throw new Error("You are not authorized to update this user.");
      }
      if (error.response?.status === 404) {
        throw new Error("Sales officer not found.");
      }
      throw new Error("Failed to update sales officer.");
    }
  }

  async deleteSalesOfficer(soId: string) {
    try {
      const response = await apiClient.delete(`/auth/users/${soId}`);
      toast.success("Sales Officer deleted successfully!");
      return response;
    } catch (error) {
      console.error("Delete sales officer error:", error);
      toast.error("Failed to delete sales officer.");
      throw error;
    }
  }
}

export default AuthService; // ✅ Export singleton instance
