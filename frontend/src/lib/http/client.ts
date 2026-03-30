import { API_BASE_URL } from "@/lib/api";
import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  CancelToken,
  CreateAxiosDefaults,
} from "axios";
import { ApiError, parseAxiosError } from "./errors";
import { setupInterceptors } from "./interceptors";

export class HttpClient {
  private axiosInstance: AxiosInstance;
  private requestTimeout: number;
  private cancelTokens: Map<string, CancelToken> = new Map();

  constructor(config?: {
    baseURL?: string;
    timeout?: number;
    retryConfig?: {
      maxRetries: number;
      retryDelay: number;
      backoffMultiplier: number;
    };
  }) {
    const finalConfig: CreateAxiosDefaults = {
      baseURL: config?.baseURL || API_BASE_URL,
      timeout: config?.timeout || 30000,
      headers: {
        "Content-Type": "application/json",
        "Accept-Language": "pt-BR",
      },
    };

    this.axiosInstance = axios.create(finalConfig);
    this.requestTimeout = config?.timeout || 30000;

    const retryConfig = config?.retryConfig || {
      maxRetries: 3,
      retryDelay: 1000,
      backoffMultiplier: 2,
    };

    setupInterceptors(this.axiosInstance, retryConfig);
  }

  getAxiosInstance(): AxiosInstance {
    return this.axiosInstance;
  }

  async request<T = unknown>(config: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.axiosInstance.request<T>(config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.axiosInstance.get<T>(url, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async post<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    try {
      const response = await this.axiosInstance.post<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async put<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    try {
      const response = await this.axiosInstance.put<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async patch<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    try {
      const response = await this.axiosInstance.patch<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async delete<T = unknown>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    try {
      const response = await this.axiosInstance.delete<T>(url, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  createCancelToken(key: string): CancelToken {
    if (this.cancelTokens.has(key)) {
      this.cancelTokens.get(key);
    }

    const source = axios.CancelToken.source();
    this.cancelTokens.set(key, source.token);
    return source.token;
  }

  cancelRequest(key: string): void {
    this.cancelTokens.delete(key);
  }

  cancelAllRequests(): void {
    this.cancelTokens.clear();
  }

  private handleError(error: unknown): never {
    if (error instanceof Error && error.name === "ApiError") {
      throw error;
    }

    if (axios.isAxiosError(error)) {
      throw parseAxiosError(error);
    }

    if (error instanceof Error) {
      throw new ApiError(error.message, 500, "UNKNOWN_ERROR");
    }

    throw new ApiError("An unexpected error occurred", 500, "UNKNOWN_ERROR");
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem("auth_token");
    return !!token;
  }

  getAuthToken(): string | null {
    return localStorage.getItem("auth_token");
  }

  setAuthToken(token: string): void {
    localStorage.setItem("auth_token", token);
  }

  clearAuthData(): void {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("auth_user");
  }
}

export const httpClient = new HttpClient({
  timeout: 30000,
  retryConfig: {
    maxRetries: 3,
    retryDelay: 1000,
    backoffMultiplier: 2,
  },
});

export type { AxiosRequestConfig };
