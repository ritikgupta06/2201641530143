import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useLogger } from "../hooks/useLogger";

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const logger = useLogger();

  useEffect(() => {
    // Simulate checking session from localStorage
    const token = localStorage.getItem("auth_token");
    if (token) {
      const storedUser = JSON.parse(
        localStorage.getItem("auth_user") || "null"
      );
      if (storedUser) {
        setUser(storedUser);
        logger.info("User session restored (mock)", { userId: storedUser.id });
      }
    }
    setIsLoading(false);
  }, [logger]);

  const fakeDelay = (ms: number) => new Promise((res) => setTimeout(res, ms));

  const login = async (email: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    await fakeDelay(500); // simulate API delay

    const fakeUser: User = {
      id: Date.now().toString(),
      email,
      name: email.split("@")[0] || "Test User",
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem("auth_token", "fake_token");
    localStorage.setItem("auth_user", JSON.stringify(fakeUser));
    setUser(fakeUser);

    logger.info("Mock login successful", { userId: fakeUser.id });
    setIsLoading(false);
  };

  const signup = async (
    email: string,
    _password: string,
    name: string
  ): Promise<void> => {
    setIsLoading(true);
    setError(null);
    await fakeDelay(500); // simulate API delay

    const fakeUser: User = {
      id: Date.now().toString(),
      email,
      name,
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem("auth_token", "fake_token");
    localStorage.setItem("auth_user", JSON.stringify(fakeUser));
    setUser(fakeUser);

    logger.info("Mock signup successful", { userId: fakeUser.id });
    setIsLoading(false);
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    setUser(null);
    setError(null);
    logger.info("Mock logout");
  };

  const clearError = () => {
    setError(null);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    signup,
    logout,
    error,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
