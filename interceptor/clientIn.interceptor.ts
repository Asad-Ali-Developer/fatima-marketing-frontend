// import { apiClient } from "@/config";

// apiClient.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;

//     // 🔒 Prevent infinite loop: skip if this is a refresh request
//     if (
//       error.response?.status === 401 &&
//       !originalRequest._retry &&
//       !originalRequest.url?.includes('/auth/refresh')
//     ) {
//       originalRequest._retry = true;

//       try {
//         // ✅ Mark refresh request to avoid re-entering interceptor
//         await apiClient.get("/auth/refresh", {
//           _skipRefreshRetry: true,
//         });

//         return apiClient(originalRequest);
//       } catch (refreshError) {
//         console.error("Token refresh failed:", refreshError);
//         if (typeof window !== "undefined") {
//           window.location.href = "/login?reason=sessionExpired";
//         }
//         return Promise.reject(refreshError);
//       }
//     }

//     return Promise.reject(error);
//   },
// );