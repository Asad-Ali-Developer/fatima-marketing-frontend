import { baseUrl } from "@/config";
import { LoginData, RegisterData, User } from "@/types";
import { getAuthToken } from "@/utils";
import axios from "axios";

interface UserProfile {
  message: string;
  data: User;
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
        }
      );
      return response;
    } catch (error) {
      console.log("Error: ", error);
    }
  }

  async registerSalesOfficer(data: RegisterData) {
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
        `${baseUrl}/auth/register-sales-officer`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
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

      console.log("Responed: ", response)
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
}

export default AuthService;
