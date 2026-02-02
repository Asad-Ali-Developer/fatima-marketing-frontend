import { baseUrl } from "@/config";
import { LoginData, RegisterData, UpdateUserData, User } from "@/types";
import { getAuthToken } from "@/utils";
import axios from "axios";
import { toast } from "react-toastify";

interface UserProfile {
  message: string;
  data: User;
}

// Add this to your types file
export interface UpdateUser {
  profileImage?: string; // pure Base64 string (without data:image/... prefix)
}

class AuthService {
  constructor() {}

  async register(data: RegisterData) {
    const { full_name, email, password, role } = data;

    try {
      const response = await axios.post(`${baseUrl}/auth/register`, {
        full_name,
        email,
        password,
        role,
      });
      return response;
    } catch (error) {
      console.log("Error: ", error);
    }
  }

  async registerAdmin(data: RegisterData) {
    const { full_name, email, showPassword, role, status } = data;

    const payload = {
      full_name,
      email,
      ...(showPassword && { showPassword }), // only include if truthy
      role,
      status,
    };

    try {
      const token = getAuthToken();

      if (!token) {
        throw new Error("No access token found");
      }

      const response = await axios.post(
        `${baseUrl}/auth/register-admin`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        },
      );
      return response;
    } catch (error) {
      console.log("Error: ", error);
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
    } = data;

    const payload = {
      full_name,
      email,
      ...(showPassword && { showPassword }), // only include if truthy
      role,
      status,
      commissionedBy,
      gender,
    };

    try {
      const token = getAuthToken();

      if (!token) {
        throw new Error("No access token found");
      }

      const response = await axios.post(
        `${baseUrl}/auth/register-sales-officer`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        },
      );
      return response;
    } catch (error) {
      console.log("Error: ", error);
    }
  }

  async login(data: LoginData) {
    const { email, password, rememberMe } = data;
    try {
      const response = await axios.post(`${baseUrl}/auth/login`, {
        email,
        password,
        rememberMe,
      });

      console.log("Responed: ", response);
      return response;
    } catch (error) {
      console.log("Error: ", error);
    }
  }

  // ✅ NEW: Fetch user profile
  async getProfile(accessToken: string) {
    try {
      const response = await axios.get<UserProfile>(`${baseUrl}/auth/profile`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        withCredentials: true,
      });
      return response.data; // Return just the data part
    } catch (error) {
      console.error("Profile fetch error:", error);
      throw error;
    }
  }

  async logout() {
    try {
      const token = getAuthToken();
      const response = await axios.get(`${baseUrl}/auth/logout`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      return response;
    } catch (error) {
      console.log("Error: ", error);
    }
  }

  async updateProfileImage(updateData: {
    profileImage?: string;
    email?: string;
  }): Promise<UserProfile> {
    const token = getAuthToken();
    if (!token) {
      throw new Error("No access token found. Please log in.");
    }

    try {
      const response = await axios.patch<UserProfile>(
        `${baseUrl}/auth/profile-image`,
        updateData, // 👈 Send full DTO object
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        },
      );
      return response.data;
    } catch (error: any) {
      console.error("Profile update error:", error);
      if (error.response?.status === 409) {
        throw new Error("Email is already in use.");
      }
      if (error.response?.status === 400) {
        throw new Error(
          error.response.data.message || "Invalid image format or size.",
        );
      }
      throw new Error("Failed to update profile. Please try again.");
    }
  }

  async updateProfile(updateData: UpdateUserData): Promise<UserProfile> {
    const token = getAuthToken();
    if (!token) {
      throw new Error("No access token found. Please log in.");
    }

    try {
      const response = await axios.patch<UserProfile>(
        `${baseUrl}/auth/profile`, // 👈 Self-update endpoint
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        },
      );
      return response.data;
    } catch (error: any) {
      console.error("Profile update error:", error);
      if (error.response?.status === 409) {
        throw new Error("Email is already in use.");
      }
      if (error.response?.status === 400) {
        throw new Error(error.response.data.message || "Invalid input data.");
      }
      if (error.response?.status === 403) {
        throw new Error("You are not authorized to update this field.");
      }
      throw new Error("Failed to update profile. Please try again.");
    }
  }

  async deleteSalesOfficer(soId: string) {
    const token = getAuthToken();
    const response = await axios.delete(`${baseUrl}/auth/users/${soId}`, {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true,
    });

    if (response.status) {
      toast.success("Sales Officer deleted successfully!");
    }
  }
}

export default AuthService;
