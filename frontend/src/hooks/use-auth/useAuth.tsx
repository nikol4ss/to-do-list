import { useToast } from "@/hooks/use-toast";
import { handleApiError } from "@/lib/apiUtils";
import { authService } from "@/services/auth";
import type { User } from "@/types/auth";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  signup: (
    first_name: string,
    last_name: string,
    username: string,
    email: string,
    password: string,
  ) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const AUTH_ROUTES = ["/login", "/signup"];

function isOnAuthRoute(): boolean {
  return AUTH_ROUTES.some((r) => window.location.pathname.startsWith(r));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    async function checkAuth() {
      try {
        if (authService.isAuthenticated()) {
          const userData = await authService.getMe();
          setUser(userData);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        authService.logout();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    checkAuth();

    const handleLogout = (e: Event) => {
      const detail = (e as CustomEvent<{ reason?: string }>).detail;
      setUser(null);

      if (!isOnAuthRoute()) {
        if (detail?.reason === "session_expired") {
          addToast("Sessão expirada. Faça login novamente.", "error");
        }
        navigate("/login");
      }
    };

    window.addEventListener("auth:logout", handleLogout);
    return () => window.removeEventListener("auth:logout", handleLogout);
  }, [navigate, addToast]);

  const login = useCallback(
    async (username: string, password: string) => {
      try {
        await authService.login({
          username,
          password,
        });
        const userData = await authService.getMe();
        setUser(userData);
        addToast("Bem-vindo de volta!", "success");
      } catch (error) {
        throw error;
      }
    },
    [addToast],
  );

  const signup = useCallback(
    async (
      first_name: string,
      last_name: string,
      username: string,
      email: string,
      password: string,
    ) => {
      try {
        await authService.signup({
          first_name,
          last_name,
          username,
          email,
          password,
        });

        addToast("Conta criada com sucesso!", "success");
      } catch (error) {
        throw error;
      }
    },
    [addToast],
  );

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    addToast("Desconectado com sucesso", "success");
    navigate("/login");
  }, [addToast, navigate]);

  const updateProfile = useCallback(
    async (data: Partial<User>) => {
      try {
        const updated = await authService.updateProfile(data);
        setUser(updated);
        addToast("Perfil atualizado!", "success");
      } catch (error) {
        const { message } = handleApiError(error);
        addToast(message, "error");
        throw error;
      }
    },
    [addToast],
  );

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return context;
}
