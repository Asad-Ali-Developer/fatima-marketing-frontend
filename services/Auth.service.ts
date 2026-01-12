import { baseUrl } from "@/config";
import axios from "axios";

class AuthService {
  constructor() {}

  async register(data: { full_name: string; email: string; password: string }) {
    const { full_name, email, password } = data;

    try {
      const response = await axios.post(`${baseUrl}/auth/register`, {
        full_name,
        email,
        password,
      });
      return response.data;
    } catch (error) {
      console.log("Error: ", error);
    }
  }

  async login(email: string, password: string, rememberMe: boolean) {
    try {
      const response = await axios.post(`${baseUrl}/auth/login`, {
        email,
        password,
        rememberMe
      });
      return response.data;
    } catch (error) {
      console.log("Error: ", error);
    }
  }
}

export default AuthService;
