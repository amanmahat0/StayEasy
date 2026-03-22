import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import "./Auth.css";

const VerifyEmailConfirm = () => {
  const { uid, token } = useParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        await axios.post("http://127.0.0.1:8000/api/users/verify-email/", {
          uid,
          token,
        });

        setStatus("success");
      } catch (error) {
        setStatus("error");
      }
    };

    if (uid && token) {
      verifyEmail();
    } else {
      setStatus("error");
    }
  }, [uid, token]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
      {status === "loading" && <p>Verifying your email...</p>}

      {status === "success" && (
        <div style={{ textAlign: "center" }}>
          <h2>Email Verified ✅</h2>
          <p>Your email has been verified successfully.</p>
          <Link to="/login">Go to Login</Link>
        </div>
      )}

      {status === "error" && (
        <div style={{ textAlign: "center" }}>
          <h2>Verification Failed ❌</h2>
          <p>The verification link is invalid or expired.</p>
          <Link to="/signup">Back to Signup</Link>
        </div>
      )}
    </div>
  );
};

export default VerifyEmailConfirm;
