import axios from "axios";
import { getDispatch } from "@/store"; // ✅ Import dispatch helper
import { clearUser } from "@/store/slices";
import { productionEnvoirnmentConfig } from "./env.live";
import { stagingEnvoirnmentConfig } from "./env.staging";

const stage = process.env.NODE_ENV;
export const config =
  stage === "production"
    ? productionEnvoirnmentConfig
    : stagingEnvoirnmentConfig;

export const baseUrl = config.serverUrl;

export const apiClient = axios.create({
  baseURL: baseUrl,
  withCredentials: true,
});

// ✅ Prevent multiple simultaneous refresh calls
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(callback: (token: string) => void) {
  refreshSubscribers.push(callback);
}

function onTokenRefreshed(newToken: string) {
  refreshSubscribers.forEach((callback) => callback(newToken));
  refreshSubscribers = [];
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Skip if not 401, already retried, or is refresh request itself
    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      originalRequest.url?.includes("/auth/refresh")
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    // ✅ If already refreshing, queue this request
    if (isRefreshing) {
      return new Promise((resolve) => {
        subscribeTokenRefresh(() => {
          resolve(apiClient(originalRequest));
        });
      });
    }

    isRefreshing = true;

    try {
      // ✅ Call refresh endpoint (cookies sent automatically)
      await apiClient.get("/auth/refresh");
      
      // Notify all queued requests
      onTokenRefreshed("refreshed"); // Value doesn't matter, cookies handle it
      
      return apiClient(originalRequest);
    } catch (refreshError) {
      console.error("Token refresh failed:", refreshError);
      
      // ✅ Clear Redux state using store dispatch
      const dispatch = getDispatch();
      dispatch(clearUser());
      
      // Redirect to login
      window.location.href = "/signin";
      
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default apiClient;