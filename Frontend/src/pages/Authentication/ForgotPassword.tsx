import React, { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Mail, Home, Check, ArrowLeft } from "lucide-react";
import { forgotPasswordApi } from "../../services/api";
import "./Auth.css";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await forgotPasswordApi(email);
      setSent(true);
    } catch (err: any) {
      setError(err.response?.data?.error?.[0] || err.response?.data?.error || "Failed to send reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="auth-page-wrapper">
        <div className="auth-layout">
          <div className="auth-left">
            <div className="auth-logo">
              <div className="logo-icon"><Home size={20} strokeWidth={2.5} color="white" /></div>
              <span className="logo-text">StayEasy</span>
            </div>
            <h1 className="auth-heading">Check Your Email</h1>
            <p className="auth-subheading">We've sent a password reset link to <strong>{email}</strong> if an account exists.</p>
          </div>
          <div className="auth-right">
            <div className="auth-card" style={{ textAlign: "center" }}>
              <div style={{ fontSize: 56, marginBottom: 16, color: "#4caf50" }}><Check size={56} /></div>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: "#1e1e2d", marginBottom: 8 }}>Email Sent</h2>
              <p style={{ fontSize: 14, color: "#7a7a9d", lineHeight: 1.6, marginBottom: 20 }}>
                The link expires in 60 minutes. If you don't see it, check your spam folder.
              </p>
              <Link to="/login" className="submit-btn" style={{ display: "block", textDecoration: "none", lineHeight: "48px" }}>
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page-wrapper">
      <div className="auth-layout">
        <div className="auth-left">
          <div className="auth-logo">
            <div className="logo-icon"><Home size={20} strokeWidth={2.5} color="white" /></div>
            <span className="logo-text">StayEasy</span>
          </div>
          <h1 className="auth-heading">Forgot Password?</h1>
          <p className="auth-subheading">
            No worries! Enter your email and we'll send you a link to reset your password.
          </p>
          <div className="auth-features">
            {[
              "Quick email verification",
              "Secure password reset link",
              "Link expires in 60 minutes",
            ].map((text, i) => (
              <div key={i} className="feature-item">
                <div className="check-circle"><Check size={14} strokeWidth={3} /></div>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="auth-right">
          <div className="auth-card">
            <div className="tab-switcher">
              <button className="tab-btn" onClick={() => window.location.href = "/login"}>Login</button>
              <button className="tab-btn" onClick={() => window.location.href = "/signup"}>Sign Up</button>
            </div>
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label className="input-label">Email Address <span className="asterisk">*</span></label>
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
              {error && <p className="auth-error">{error}</p>}
              <button className="submit-btn" disabled={loading}>
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
            <div className="auth-bottom-text">
              <Link to="/login" style={{ color: "#a37bc8", textDecoration: "none", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}>
                <ArrowLeft size={14} /> Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
