import "axios";

declare module "axios" {
  export interface AxiosRequestConfig {
    _skipRefreshRetry?: boolean; // 👈 allow custom property
    _retry?: boolean;
  }
}
