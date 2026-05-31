import { useState, useRef, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Mail, ArrowRight, Loader2, CheckCircle, XCircle } from "lucide-react";
import { verifyEmailApi } from "../../services/api";

export default function VerifyEmailInfo() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = (location.state as { email?: string })?.email || "";
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const fullCode = code.join("");
    if (fullCode.length !== 6) return;
    setStatus("loading");
    try {
      const res = await verifyEmailApi(email, fullCode);
      setStatus("success");
      setMessage(res.data?.message || "Email verified successfully!");
    } catch (err: any) {
      setStatus("error");
      setMessage(err.response?.data?.error || "Verification failed. Please try again.");
    }
  };

  if (status === "success") {
    return (
      <div className="min-h-screen bg-[#F8F9FD] flex flex-col items-center justify-center px-6">
        <div className="max-w-md w-full bg-white rounded-[2rem] shadow-sm border border-gray-100 p-10 text-center">
          <div className="w-16 h-16 bg-green-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={32} className="text-green-500" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#1A1A1A] mb-3">Email Verified!</h1>
          <p className="text-gray-500 text-sm mb-8">{message}</p>
          <button
            onClick={() => navigate("/login")}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-[#A989C8] text-white font-bold text-sm hover:bg-[#8d6aa9] transition-all shadow-lg shadow-[#A989C8]/20"
          >
            Go to Login <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FD] flex flex-col items-center justify-center px-6">
      <div className="max-w-md w-full bg-white rounded-[2rem] shadow-sm border border-gray-100 p-10 text-center">
        <div className="w-16 h-16 bg-[#A87DC2]/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <Mail size={32} className="text-[#A87DC2]" />
        </div>

        <h1 className="text-2xl font-extrabold text-[#1A1A1A] mb-3">Verify your email</h1>
        <p className="text-gray-500 text-sm leading-relaxed mb-2">
          We've sent a 6-digit code to <strong className="text-gray-700">{email}</strong>
        </p>
        <p className="text-gray-400 text-xs mb-8">
          Check your inbox (or spam folder) and enter the code below.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center justify-center gap-2 sm:gap-3">
            {code.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className="w-12 h-14 sm:w-14 sm:h-16 text-center text-xl font-bold border-2 border-gray-200 rounded-xl focus:border-[#A989C8] focus:outline-none focus:ring-2 focus:ring-[#A989C8]/20 transition-all"
              />
            ))}
          </div>

          {status === "error" && (
            <div className="flex items-center justify-center gap-2 text-red-500 text-sm">
              <XCircle size={16} />
              <span>{message}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={code.join("").length !== 6 || status === "loading"}
            className="w-full inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-[#A989C8] text-white font-bold text-sm hover:bg-[#8d6aa9] transition-all shadow-lg shadow-[#A989C8]/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === "loading" ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                Verify Email <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
