// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
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
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: any) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // Fetch user profile from backend
  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("access");
      if (!token) throw new Error("No token found");

      const res = await API.get("/profile/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
      setIsLoggedIn(true);
    } catch (err) {
      console.error("Failed to fetch profile:", err);
      setUser(null);
      setIsLoggedIn(false);
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
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout, fetchProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
