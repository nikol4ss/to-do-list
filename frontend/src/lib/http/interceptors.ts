import {
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { parseAxiosError } from "./errors";

const DEBUG_MODE = (import.meta.env.DEV as boolean) || false;

export interface RetryConfig {
  maxRetries: number;
  retryDelay: number;
  backoffMultiplier: number;
}

const AUTH_ENDPOINTS = ["/auth/signin/", "/auth/signup/", "/auth/refresh/"];

function isAuthEndpoint(url?: string): boolean {
  if (!url) return false;
  return AUTH_ENDPOINTS.some((path) => url.includes(path));
}

function setupRequestInterceptor(axiosInstance: AxiosInstance): void {
  axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = localStorage.getItem("auth_token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      if (DEBUG_MODE) {
        console.group(`➡ ${config.method?.toUpperCase()} ${config.url}`);
        console.log("data:", config.data);
        console.groupEnd();
      }
      return config;
    },
    (error) => Promise.reject(error),
  );
}

function setupResponseInterceptor(axiosInstance: AxiosInstance): void {
  axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => {
      if (DEBUG_MODE) {
        console.log(
          `${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`,
        );
      }
      return response;
    },
    (error) => {
      if (DEBUG_MODE) {
        console.error(
          `${error.response?.status} ${error.config?.url}`,
          error.response?.data,
        );
      }

      if (
        error.response?.status === 401 &&
        !isAuthEndpoint(error.config?.url)
      ) {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("auth_user");

        window.dispatchEvent(
          new CustomEvent("auth:logout", {
            detail: { reason: "session_expired" },
          }),
        );
      }

      return Promise.reject(parseAxiosError(error));
    },
  );
}

function setupTimestampInterceptor(axiosInstance: AxiosInstance): void {
  axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      (config as any).requestTimestamp = Date.now();
      return config;
    },
  );
}

function setupRetryInterceptor(
  axiosInstance: AxiosInstance,
  config: RetryConfig,
): void {
  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalConfig = error.config as InternalAxiosRequestConfig & {
        __retryCount?: number;
      };

      if (!originalConfig || !error.response) return Promise.reject(error);

      const isRetryable = [408, 429, 500, 502, 503, 504].includes(
        error.response.status,
      );
      if (!isRetryable) return Promise.reject(error);

      originalConfig.__retryCount = originalConfig.__retryCount || 0;
      if (originalConfig.__retryCount >= config.maxRetries)
        return Promise.reject(error);

      originalConfig.__retryCount += 1;
      const delay =
        config.retryDelay *
        Math.pow(config.backoffMultiplier, originalConfig.__retryCount - 1);

      await new Promise((resolve) => setTimeout(resolve, delay));
      return axiosInstance(originalConfig);
    },
  );
}

export function setupInterceptors(
  axiosInstance: AxiosInstance,
  retryConfig: RetryConfig,
): void {
  setupRequestInterceptor(axiosInstance);
  setupTimestampInterceptor(axiosInstance);
  setupResponseInterceptor(axiosInstance);
  setupRetryInterceptor(axiosInstance, retryConfig);
}
