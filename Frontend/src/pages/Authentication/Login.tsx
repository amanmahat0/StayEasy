import React, { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Home, Check } from "lucide-react";
import API from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import "./Auth.css";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  // ===============================
  // STATE
  // ===============================
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ===============================
  // LOGIN SUBMIT
  // ===============================
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1️⃣ Login request
      const res = await API.post("login/", { email, password });
      const { access, refresh } = res.data;

      // Save tokens
      localStorage.setItem("access", access);
      localStorage.setItem("refresh", refresh);

      // 2️⃣ Fetch user profile (contains role)
      const profileRes = await API.get("profile/", {
        headers: {
          Authorization: `Bearer ${access}`,
        },
      });

      const userProfile = profileRes.data;

      // Update global auth state
      login(userProfile);

      // 3️⃣ Navigate based on REAL backend role
      if (userProfile.role === "admin") {
        navigate("/admin");
      } else if (userProfile.user_type === "tenant") {
        navigate("/home");
      } else if (userProfile.user_type === "owner") {
        navigate("/dashboard");
      } else {
        navigate("/");
      }

    } catch (err: any) {
      if (err.response?.status === 403) {
        setError("Please verify your email first");
      } else if (err.response?.status === 401) {
        setError("Invalid email or password");
      } else {
        setError("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // UI
  // ===============================
  return (
    <div className="auth-page-wrapper">
      <div className="auth-layout">

        {/* LEFT SIDE */}
        <div className="auth-left">
          <div className="auth-logo">
            <div className="logo-icon">
              <Home size={20} strokeWidth={2.5} color="white" />
            </div>
            <span className="logo-text">StayEasy</span>
          </div>

          <h1 className="auth-heading">Welcome Back!</h1>
          <p className="auth-subheading">
            Sign in to access your dashboard and manage your
            <br /> properties or bookings.
          </p>

          <div className="auth-features">
            {[
              "Verified Properties & Landlords",
              "Secure eSewa Payment Integration",
              "Digital Rental Agreements",
              "24/7 Customer Support",
            ].map((text, index) => (
              <div key={index} className="feature-item">
                <div className="check-circle">
                  <Check size={14} strokeWidth={3} />
                </div>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="auth-right">
          <div className="auth-card">

            {/* TABS */}
            <div className="tab-switcher">
              <button className="tab-btn active">Login</button>
              <button
                className="tab-btn"
                onClick={() => navigate("/signup")}
              >
                Sign Up
              </button>
            </div>

            {/* FORM */}
            <form onSubmit={handleSubmit} className="auth-form">

              {/* EMAIL */}
              <div className="form-group">
                <label className="input-label">
                  Email Address <span className="asterisk">*</span>
                </label>
                <div className="input-box">
                  <Mail size={18} className="input-icon" />
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div className="form-group">
                <label className="input-label">
                  Password <span className="asterisk">*</span>
                </label>
                <div className="input-box">
                  <Lock size={18} className="input-icon" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="eye-btn"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff size={18} className="input-icon" />
                    ) : (
                      <Eye size={18} className="input-icon" />
                    )}
                  </button>
                </div>
              </div>

              {/* FOOTER */}
              <div className="form-footer-row">
                <span className="remember-text">Remember me</span>
                <Link to="/forgot-password" className="forgot-link">
                  Forgot Password?
                </Link>
              </div>

              {error && <p className="auth-error">{error}</p>}

              {/* SUBMIT */}
              <button className="submit-btn" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>

            <div className="auth-bottom-text">
              Don't have an account?{" "}
              <Link to="/signup" className="signup-link">
                Sign Up
              </Link>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;