import { Link } from "react-router-dom";
import { Mail, CheckCircle, ArrowRight } from "lucide-react";

export default function VerifyEmailInfo() {
  return (
    <div className="min-h-screen bg-[#F8F9FD] flex flex-col items-center justify-center px-6">
      <div className="max-w-md w-full bg-white rounded-[2rem] shadow-sm border border-gray-100 p-10 text-center">
        <div className="w-16 h-16 bg-[#A87DC2]/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <Mail size={32} className="text-[#A87DC2]" />
        </div>

        <h1 className="text-2xl font-extrabold text-[#1A1A1A] mb-3">Verify your email</h1>

        <p className="text-gray-500 text-sm leading-relaxed mb-2">
          We've sent a verification link to your email address.
        </p>
        <p className="text-gray-400 text-xs mb-8">
          Please check your inbox (or spam folder) and click the link to activate your account.
        </p>

        <div className="bg-green-50 border border-green-100 rounded-xl p-4 mb-8 text-left flex items-start gap-3">
          <CheckCircle size={18} className="text-green-500 shrink-0 mt-0.5" />
          <p className="text-sm text-green-700">
            After verification, you'll be able to log in and start using StayEasy.
          </p>
        </div>

        <Link
          to="/login"
          className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-[#A989C8] text-white font-bold text-sm hover:bg-[#8d6aa9] transition-all shadow-lg shadow-[#A989C8]/20"
        >
          Go to Login <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
