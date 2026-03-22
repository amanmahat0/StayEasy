import { useEffect, useState } from "react";
import { Plus, Home, Users, TrendingUp, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

import PublicNavbar from "../../components/Navbar/PublicNavbar";
import Footer from "../../components/Footer";
import { useAuth } from "../../context/AuthContext";

import StatCard from "../../components/Dashboard/StatCard";
import QuickActions from "../../components/Dashboard/QuickActions";
import RecentActivity from "../../components/Dashboard/RecentActivity";
import ProfileCard from "../../components/Profile/ProfileCard";
import { getKYCStatus } from "../../services/api";

interface KYCData {
  kyc_status: string;
  kyc_document: string | null;
  user_type: string;
  role: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [kyc, setKyc] = useState<KYCData | null>(null);

  const fullName = user ? `${user.first_name}` : "User";

  useEffect(() => {
    const fetchKYC = async () => {
      const data = await getKYCStatus();
      setKyc(data);
    };
    fetchKYC();
  }, []);

  const kycLabel = kyc
    ? kyc.kyc_status === "approved"
      ? "Verified"
      : kyc.kyc_status === "pending"
      ? "Pending"
      : "Rejected"
    : "Loading";

  return (
    <>
      <PublicNavbar />

      <main className="min-h-screen py-8 font-inter">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold font-poppins">
              Welcome back, {fullName}! 👋
            </h1>
            <p className="text-gray-500 mt-1">
              Manage your properties and tenants
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard icon={Home} label="Total Properties" value="0" />
            <StatCard icon={Users} label="Active Tenants" value="0" />
            <StatCard icon={TrendingUp} label="Monthly Revenue" value="NPR 0" />
            <StatCard icon={ShieldCheck} label="KYC Status" value={kycLabel} />
          </div>

          {/* KYC Warning */}
          {kyc && kyc.kyc_status !== "approved" && (
            <div className="mb-6 p-4 rounded-xl border border-yellow-300 bg-yellow-50 text-yellow-800">
              {kyc.kyc_status === "pending" &&
                "Your KYC is under review. Some features may be restricted."}
              {kyc.kyc_status === "rejected" &&
                "Your KYC was rejected. Please resubmit verification documents."}
            </div>
          )}

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* LEFT: Empty State / Add Property */}
            <div className="lg:col-span-2 bg-white rounded-2xl border p-10 flex flex-col items-center justify-center min-h-[300px]">
              <div className="w-20 h-20 bg-[#F3E8FF] rounded-full flex items-center justify-center mb-6">
                <Plus size={28} className="text-[#A989C8]" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                No Properties Listed Yet
              </h2>
              <p className="text-gray-500 max-w-md mx-auto mb-6 text-center leading-relaxed">
                Start building your rental portfolio by adding your first property. It only takes a few minutes!
              </p>
              <button
                className="flex items-center gap-2 bg-[#A989C8] hover:bg-[#9b7bb8] text-white px-6 py-3 rounded-xl font-medium transition-all shadow-lg shadow-[#A989C8]/20 hover:shadow-xl hover:-translate-y-0.5"
                onClick={() => navigate("/add-property")}
              >
                <Plus size={20} />
                Add Your First Property
              </button>
            </div>

            {/* RIGHT: Quick Actions + Recent Activity */}
            <div className="space-y-6">
              <QuickActions />
              <RecentActivity />
            </div>
          </div>
        </div>

        {/* Profile Card */}
        <ProfileCard name={fullName} />
      </main>

      <Footer />
    </>
  );
};

export default Dashboard;
