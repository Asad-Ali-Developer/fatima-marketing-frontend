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

    if (!error.response) {
      return Promise.reject(error);
    }

    // ❌ If not 401 → stop
    if (error.response.status !== 401) {
      return Promise.reject(error);
    }

    // ❌ If already retried → stop
    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    // ❌ If refresh endpoint itself → stop
    if (originalRequest.url?.includes("/auth/refresh")) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        subscribeTokenRefresh(() => {
          resolve(apiClient(originalRequest));
        });
      });
    }

    isRefreshing = true;

    try {
      await apiClient.get("/auth/refresh");

      onTokenRefreshed("done");

      return apiClient(originalRequest);
    } catch (refreshError) {
      // ✅ HARD STOP — no loop
      const dispatch = getDispatch();
      dispatch(clearUser());

      window.location.href = "/signin";

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default apiClient;
