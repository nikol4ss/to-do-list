import { apiEndpoints } from "@/lib/api";
import { ApiError, httpClient } from "@/lib/http";
import type {
  AuthCredentials,
  AuthResponse,
  SignupData,
  User,
} from "@/types/auth";

export const authService = {
  async login(credentials: AuthCredentials): Promise<AuthResponse> {
    const response = await httpClient.post<AuthResponse>(
      apiEndpoints.auth.login,
      {
        username: credentials.username,
        password: credentials.password,
      },
    );

    if (response.access) {
      httpClient.setAuthToken(response.access);
      if (response.refresh) {
        localStorage.setItem("refresh_token", response.refresh);
      }
    }

    return response;
  },

  async signup(signupData: SignupData): Promise<AuthResponse> {
    const normalizedData = {
      username: signupData.username,
      email: signupData.email,
      password: signupData.password,
      first_name: signupData.first_name,
      last_name: signupData.last_name,
    };

    const response = await httpClient.post<AuthResponse>(
      apiEndpoints.auth.register,
      normalizedData,
    );

    return response;
  },

  async getMe(): Promise<User> {
    try {
      const user = await httpClient.get<User>(apiEndpoints.auth.me);
      localStorage.setItem("auth_user", JSON.stringify(user));
      return user;
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        this.logout();
      }
      throw error;
    }
  },

  async updateProfile(profileData: Partial<User>): Promise<User> {
    const updatedUser = await httpClient.put<User>(
      apiEndpoints.auth.me,
      profileData,
    );
    localStorage.setItem("auth_user", JSON.stringify(updatedUser));
    return updatedUser;
  },

  async refreshToken(): Promise<AuthResponse> {
    const refreshToken = localStorage.getItem("refresh_token");

    if (!refreshToken) {
      this.logout();
      throw new ApiError(
        "Sessão expirada. Por favor, faça login novamente.",
        401,
        "NO_REFRESH_TOKEN",
      );
    }

    try {
      const response = await httpClient.post<AuthResponse>(
        apiEndpoints.auth.refresh,
        { refresh: refreshToken },
      );

      if (response.access) {
        httpClient.setAuthToken(response.access);
        if (response.refresh) {
          localStorage.setItem("refresh_token", response.refresh);
        }
      }

      return response;
    } catch (error) {
      this.logout();
      throw error;
    }
  },

  logout(): void {
    httpClient.clearAuthData();
    localStorage.removeItem("auth_user");
    localStorage.removeItem("refresh_token");
    window.dispatchEvent(new CustomEvent("auth:logout"));
  },

  getToken(): string | null {
    return httpClient.getAuthToken();
  },

  isAuthenticated(): boolean {
    return httpClient.isAuthenticated();
  },

  getCachedUser(): User | null {
    const userJson = localStorage.getItem("auth_user");
    if (!userJson) return null;

    try {
      return JSON.parse(userJson) as User;
    } catch {
      return null;
    }
  },
};
