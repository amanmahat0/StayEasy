import { Routes, Route, Navigate } from "react-router-dom";

import Landing from "./pages/Dashboard/Landing";
import Home from "./pages/Dashboard/Home";
import Login from "./pages/Authentication/Login";
import Signup from "./pages/Authentication/Signup";
import VerifyEmailInfo from "./pages/Authentication/VerifyEmailInfo";
import VerifyEmailConfirm from "./pages/Authentication/VerifyEmailConfirm";
import Dashboard from "./pages/Dashboard/Dashboard";
import KYCForm from "./pages/KYC/KYCForm";
import AddProperty from "./pages/AddProperty/AddProperty";
import Profile from "./pages/Profile/profile";
import AboutPage from "./pages/AboutUs/AboutUs"; 
import Properties from "./pages/Properties/Properties";

// NEW IMPORTS
import PropertyDetails from "./components/Home/Property/PropertyDetail";
import Booking from "./components/Home/Booking/Booking";
import MyBooking from "./components/Home/MyBooking/MyBooking"; 

// ADMIN IMPORT (Adjust the path based on where you saved it)
import AdminDashboard from "./pages/AdminDashboard/AdminDashboard"; 

import { useAuth } from "./context/AuthContext";

export default function App() {
  const { isLoggedIn } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/verify-email" element={<VerifyEmailInfo />} />
      <Route path="/verify-email-confirm/:uid/:token" element={<VerifyEmailConfirm />} />

      {/* Protected Routes - Only accessible if logged in */}
      <Route
        path="/home"
        element={isLoggedIn ? <Home /> : <Navigate to="/login" />}
      />
      
      {/* Dynamic Property Details Route */}
      <Route
        path="/property/:id"
        element={isLoggedIn ? <PropertyDetails /> : <Navigate to="/login" />}
      />

      {/* Multi-step Booking Route */}
      <Route
        path="/booking/:id"
        element={isLoggedIn ? <Booking /> : <Navigate to="/login" />}
      />

      {/* My Bookings Route */}
      <Route
        path="/my-bookings"
        element={isLoggedIn ? <MyBooking /> : <Navigate to="/login" />}
      />

      {/* ADMIN DASHBOARD ROUTE */}
      <Route
        path="/admin"
        element={isLoggedIn ? <AdminDashboard /> : <Navigate to="/login" />}
      />

      <Route
        path="/dashboard"
        element={isLoggedIn ? <Dashboard /> : <Navigate to="/login" />}
      />

      <Route
        path="/profile"
        element={isLoggedIn ? <Profile /> : <Navigate to="/login" />}
      />

      <Route
        path="/kyc"
        element={isLoggedIn ? <KYCForm /> : <Navigate to="/login" />}
      />

      <Route
        path="/add-property"
        element={isLoggedIn ? <AddProperty /> : <Navigate to="/login" />}
      />

      <Route
        path="/properties"
        element={isLoggedIn ? <Properties /> : <Navigate to="/login" />}
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}