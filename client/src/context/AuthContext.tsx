import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import api from "../services/api";

export type UserRole = "user" | "admin";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    const token = localStorage.getItem("noir-token");

    if (!token) {
      setUser(null);
      return;
    }

    try {
      const response = await api.get("/user/me");

      const currentUser = response.data.user ?? response.data;

      if (
        currentUser.role !== "user" &&
        currentUser.role !== "admin"
      ) {
        throw new Error("Invalid user role");
      }

      setUser(currentUser);
    } catch (error) {
      localStorage.removeItem("noir-token");
      setUser(null);
      throw error;
    }
  };

  useEffect(() => {
    refreshUser()
      .catch((error) => console.error("Auth check failed:", error))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.post("/user/login", {
      email,
      password,
    });

    const token = response.data.token;
    const loggedUser = response.data.user;

    if (!token) {
      throw new Error("Login response does not contain a token");
    }

    localStorage.setItem("noir-token", token);

    let currentUser: User;

    if (loggedUser?.role) {
      currentUser = loggedUser;
    } else {
      const profileResponse = await api.get("/user/me");
      currentUser = profileResponse.data.user ?? profileResponse.data;
    }

    if (
      currentUser.role !== "user" &&
      currentUser.role !== "admin"
    ) {
      localStorage.removeItem("noir-token");
      throw new Error("Invalid user role");
    }

    setUser(currentUser);
    return currentUser;
  };

  const logout = async () => {
    try {
      await api.post("/user/logout");
    } finally {
      localStorage.removeItem("noir-token");
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
