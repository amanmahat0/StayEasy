// src/pages/Authentication/VerifyEmailInfo.tsx
import { Link } from "react-router-dom";

export default function VerifyEmailInfo() {
  return (
    <div style={{ padding: 40 }}>
      <h2>Verify your email</h2>

      <p>
        We’ve sent a verification link to your email.
        <br />
        Please check your inbox (or spam).
      </p>

      <p>
        After verification, you can{" "}
        <Link to="/login">login here</Link>.
      </p>
    </div>
  );
}
