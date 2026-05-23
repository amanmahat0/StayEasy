// src/context/AuthContext.tsx
import { createContext, useContext, useState, useEffect } from "react";
import API from "../services/api"; // Axios instance

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role?: string;
  user_type?: string;
  email_verified?: boolean;
}

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  login: (profileData?: User) => void;
  logout: () => void;
  fetchProfile: () => Promise<void>;
  backendAvailable: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export { AuthContext };

export const AuthProvider = ({ children }: any) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [backendAvailable, setBackendAvailable] = useState(true);

  // Fetch user profile from backend
  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("access");
      if (!token) {
        console.log("ℹ️  No auth token found - user not logged in");
        setBackendAvailable(true);
        return;
      }

      const res = await API.get("/profile/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
      setIsLoggedIn(true);
      setBackendAvailable(true);
    } catch (err: any) {
      // Check if it's a network error (backend not running)
      if (err.code === "ECONNREFUSED" || err.message === "Network Error" || !err.response) {
        console.warn("⚠️  Backend server is not available. Operating in limited mode.");
        setBackendAvailable(false);
        setUser(null);
        setIsLoggedIn(false);
      } else if (err.response?.status === 401) {
        console.log("ℹ️  Unauthorized - token invalid");
        localStorage.removeItem("access");
        setUser(null);
        setIsLoggedIn(false);
        setBackendAvailable(true);
      } else {
        console.error("Failed to fetch profile:", err.message);
        setUser(null);
        setIsLoggedIn(false);
        setBackendAvailable(true);
      }
    }
  };

  // Call this after login to set profile or fetch if needed
  const login = (profileData?: User) => {
    if (profileData) {
      setUser(profileData);
      setIsLoggedIn(true);
    } else {
      fetchProfile();
    }
  };

  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setIsLoggedIn(false);
    setUser(null);
  };

  // On mount, check if token exists and fetch profile
  useEffect(() => {
    const token = localStorage.getItem("access");
    if (token) {
      fetchProfile();
    }
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout, fetchProfile, backendAvailable }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
