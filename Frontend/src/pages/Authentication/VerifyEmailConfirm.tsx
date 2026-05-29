import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Loader2, CheckCircle, XCircle, ArrowRight, Mail } from "lucide-react";
import axios from "axios";

const VerifyEmailConfirm = () => {
  const { uid, token } = useParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        await axios.post("http://127.0.0.1:8000/api/users/verify-email/", { uid, token });
        setStatus("success");
      } catch (err: any) {
        setStatus("error");
        setErrorMsg(err.response?.data?.error || "The verification link is invalid or has expired.");
      }
    };

    if (uid && token) {
      verifyEmail();
    } else {
      setStatus("error");
      setErrorMsg("Missing verification parameters.");
    }
  }, [uid, token]);

  return (
    <div className="min-h-screen bg-[#F8F9FD] flex flex-col items-center justify-center px-6">
      <div className="max-w-md w-full bg-white rounded-[2rem] shadow-sm border border-gray-100 p-10 text-center">
        {status === "loading" && (
          <>
            <div className="w-16 h-16 bg-[#A87DC2]/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Mail size={32} className="text-[#A87DC2]" />
            </div>
            <Loader2 size={32} className="animate-spin text-[#A87DC2] mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Verifying your email...</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-16 h-16 bg-green-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={32} className="text-green-500" />
            </div>
            <h1 className="text-2xl font-extrabold text-[#1A1A1A] mb-3">Email Verified!</h1>
            <p className="text-gray-500 text-sm mb-8">
              Your email has been verified successfully. You can now log in to your account.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-[#A989C8] text-white font-bold text-sm hover:bg-[#8d6aa9] transition-all shadow-lg shadow-[#A989C8]/20"
            >
              Go to Login <ArrowRight size={16} />
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-16 h-16 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <XCircle size={32} className="text-red-500" />
            </div>
            <h1 className="text-2xl font-extrabold text-[#1A1A1A] mb-3">Verification Failed</h1>
            <p className="text-gray-500 text-sm mb-2">{errorMsg}</p>
            <p className="text-gray-400 text-xs mb-8">
              Please try signing up again or contact support.
            </p>
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-[#A989C8] text-white font-bold text-sm hover:bg-[#8d6aa9] transition-all shadow-lg shadow-[#A989C8]/20"
            >
              Back to Sign Up <ArrowRight size={16} />
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailConfirm;
