import { useEffect, useState } from "react";
import { Plus, Home, Users, TrendingUp, ShieldCheck, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

import PublicNavbar from "../../components/Navbar/PublicNavbar";
import Footer from "../../components/Footer";
import { useAuth } from "../../context/AuthContext";

import StatCard from "../../components/Dashboard/StatCard";
import QuickActions from "../../components/Dashboard/QuickActions";
import RecentActivity from "../../components/Dashboard/RecentActivity";
import ProfileCard from "../../components/Profile/ProfileCard";
import { getKYCStatus, getLandlordDashboard, getLandlordProperties } from "../../services/api";

interface PropertyData {
  id: number;
  title: string;
  address: string;
  city: string;
  property_type: string;
  price: number;
  available: boolean;
  created_at: string;
  owner: number;
  description: string;
  images: Array<{
    id: number;
    image: string;
  }>;
}

interface DashboardData {
  kyc_status: string;
  total_properties: number;
  available_properties: number;
  can_add_property: boolean;
}

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [kyc, setKyc] = useState<any>(null);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [properties, setProperties] = useState<PropertyData[]>([]);
  const [loading, setLoading] = useState(true);

  const fullName = user ? `${user.first_name}` : "User";

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch KYC status
        const kycData = await getKYCStatus();
        setKyc(kycData);

        // Fetch dashboard stats
        const dashData = await getLandlordDashboard();
        setDashboard(dashData);

        // Fetch landlord properties
        const propsData = await getLandlordProperties();
        setProperties(propsData);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const kycLabel = kyc
    ? kyc.status === "approved"
      ? "Verified"
      : kyc.status === "pending"
      ? "Pending"
      : "Rejected"
    : "Not Submitted";

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
            <StatCard icon={Home} label="Total Properties" value={dashboard?.total_properties.toString() || "0"} />
            <StatCard icon={Users} label="Available Properties" value={dashboard?.available_properties.toString() || "0"} />
            <StatCard icon={TrendingUp} label="Your Properties" value={properties.length.toString()} />
            <StatCard icon={ShieldCheck} label="KYC Status" value={kycLabel} />
          </div>

          {/* KYC Warning */}
          {kyc && kyc.status !== "approved" && (
            <div className="mb-6 p-4 rounded-xl border border-yellow-300 bg-yellow-50 text-yellow-800">
              {kyc.status === "pending" &&
                "Your KYC is under review. Some features may be restricted."}
              {kyc.status === "rejected" &&
                "Your KYC was rejected. Please resubmit verification documents."}
            </div>
          )}

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* LEFT: Properties List or Empty State */}
            <div className="lg:col-span-2">
              {properties.length === 0 ? (
                <div className="bg-white rounded-2xl border p-10 flex flex-col items-center justify-center min-h-[300px]">
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
                    className="flex items-center gap-2 bg-[#A989C8] hover:bg-[#9b7bb8] text-white px-6 py-3 rounded-xl font-medium transition-all shadow-lg shadow-[#A989C8]/20 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => navigate("/add-property")}
                    disabled={dashboard ? !dashboard.can_add_property : false}
                  >
                    <Plus size={20} />
                    Add Your First Property
                  </button>
                  {dashboard && !dashboard.can_add_property && (
                    <p className="text-red-500 text-sm mt-4">*Approve your KYC first to add properties</p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-900">Your Properties</h2>
                    <button
                      className="flex items-center gap-2 bg-[#A989C8] hover:bg-[#9b7bb8] text-white px-4 py-2 rounded-xl text-sm font-medium transition-all"
                      onClick={() => navigate("/add-property")}
                    >
                      <Plus size={16} /> Add Property
                    </button>
                  </div>
                  {properties.map((property) => (
                    <div key={property.id} className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-lg transition-shadow">
                      <div className="flex gap-4">
                        {/* Image */}
                        <div className="w-32 h-32 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                          {property.images && property.images.length > 0 ? (
                            <img
                              src={`http://127.0.0.1:8000${property.images[0].image}`}
                              alt={property.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-400 text-sm">No image</span>
                            </div>
                          )}
                        </div>
                        {/* Details */}
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-gray-900">{property.title}</h3>
                          <p className="text-gray-600 text-sm">{property.address}</p>
                          <div className="flex items-center gap-4 mt-3 text-sm">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${property.available ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                              {property.available ? 'Available' : 'Booked'}
                            </span>
                            <span className="text-gray-700 font-semibold">NPR {property.price.toLocaleString()}/month</span>
                          </div>
                        </div>
                        {/* Action */}
                        <div className="flex items-center">
                          <button
                            className="text-[#A989C8] hover:text-[#9b7bb8] p-2 rounded-lg hover:bg-gray-100"
                            onClick={() => navigate(`/property/${property.id}`)}
                          >
                            <Eye size={20} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
