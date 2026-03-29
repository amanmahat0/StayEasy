import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// --- 1. AUTH & GENERAL DASHBOARD IMPORTS ---
import Landing from "./pages/Dashboard/Landing";
import Home from "./pages/Dashboard/Home";
import Login from "./pages/Authentication/Login";
import Signup from "./pages/Authentication/Signup";
import VerifyEmailInfo from "./pages/Authentication/VerifyEmailInfo";
import VerifyEmailConfirm from "./pages/Authentication/VerifyEmailConfirm";
import Dashboard from "./pages/Dashboard/Dashboard";
import Profile from "./pages/Profile/profile";
import AboutPage from "./pages/AboutUs/AboutUs";

// --- 2. USER FEATURES (KYC & PROPERTIES) ---
import KYCForm from "./pages/KYC/KYCForm";
import AddProperty from "./pages/AddProperty/AddProperty";
import Properties from "./pages/Properties/Properties";
import PropertyDetails from "./components/Home/Property/PropertyDetail";

// --- 3. BOOKING FEATURES ---
import Booking from "./components/Home/Booking/Booking";
import MyBooking from "./components/Home/MyBooking/MyBooking";

// --- 4. ADMIN MODULE IMPORTS ---
// Ensure these files exist in src/pages/Admin/ and use 'export default'
import AdminDashboard from "./pages/Admin/AdminDashboard";
import KYCVerifications from "./pages/Admin/KYCVerifications";
import UserManagement from "./pages/Admin/UserManagement";
import PropertyManagement from "./pages/Admin/PropertyManagement";
import BookingManagement from "./pages/Admin/BookingManagement";

import { useAuth } from "./context/AuthContext";

/**
 * ProtectedRoute Component
 * Wraps routes that require a user to be logged in.
 */
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isLoggedIn } = useAuth();
  // If not logged in, redirect to login page
  return isLoggedIn ? <>{children}</> : <Navigate to="/login" />;
};

export default function App() {
  return (
    <Routes>
      {/* ==========================================
          PUBLIC ROUTES
          ========================================== */}
      <Route path="/" element={<Landing />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/verify-email" element={<VerifyEmailInfo />} />
      <Route 
        path="/verify-email-confirm/:uid/:token" 
        element={<VerifyEmailConfirm />} 
      />

      {/* ==========================================
          PROTECTED USER ROUTES
          ========================================== */}
      <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/properties" element={<ProtectedRoute><Properties /></ProtectedRoute>} />
      <Route path="/property/:id" element={<ProtectedRoute><PropertyDetails /></ProtectedRoute>} />
      <Route path="/booking/:id" element={<ProtectedRoute><Booking /></ProtectedRoute>} />
      <Route path="/my-bookings" element={<ProtectedRoute><MyBooking /></ProtectedRoute>} />
      <Route path="/kyc" element={<ProtectedRoute><KYCForm /></ProtectedRoute>} />
      <Route path="/add-property" element={<ProtectedRoute><AddProperty /></ProtectedRoute>} />

      {/* ==========================================
          ADMIN MANAGEMENT ROUTES
          ========================================== */}
      
      {/* Main Admin Entry Point */}
      <Route 
        path="/admin" 
        element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} 
      />
      
      {/* KYC Review Section */}
      <Route 
        path="/admin/kyc" 
        element={<ProtectedRoute><KYCVerifications /></ProtectedRoute>} 
      />

      {/* User Management Section */}
      <Route 
        path="/admin/users" 
        element={<ProtectedRoute><UserManagement /></ProtectedRoute>} 
      />

      {/* Property/Listing Management Section */}
      <Route 
        path="/admin/properties" 
        element={<ProtectedRoute><PropertyManagement /></ProtectedRoute>} 
      />

      {/* Booking & Revenue Section */}
      <Route 
        path="/admin/bookings" 
        element={<ProtectedRoute><BookingManagement /></ProtectedRoute>} 
      />

      {/* ==========================================
          FALLBACK ROUTE (404 Handling)
          ========================================== */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}