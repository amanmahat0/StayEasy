import { useState, useEffect } from "react";
import { Header } from "../../components/admin/Header";
import UserDetailModal from "../../components/admin/UserDetailModal";
import { Users, Building2, Loader2, Search, Mail, Calendar, ShieldCheck, ShieldAlert, ChevronRight } from "lucide-react";
import API from "../../services/api";

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  user_type: string;
  role: string;
  email_verified: boolean;
  kyc_status?: string;
  date_joined: string;
  bookings_count?: number;
  properties_count?: number;
  total_bookings?: number;
}

const UserManagement = () => {
  const [activeTab, setActiveTab] = useState<"users" | "landlords">("users");
  const [users, setUsers] = useState<User[]>([]);
  const [landlords, setLandlords] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const openUserDetail = (id: number) => {
    setSelectedUserId(id);
    setModalOpen(true);
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await API.get("admin/users/");
      const data = response.data;
      setUsers(Array.isArray(data) ? data : (data.results || []));
    } catch (err: any) {
      let errorMessage = "Failed to fetch users";
      if (err.response?.status === 401) errorMessage = "Unauthorized: Invalid or expired token. Please login again.";
      else if (err.response?.status === 403) errorMessage = "Forbidden: Admin access required.";
      else if (err.response?.data?.error) errorMessage = err.response.data.error;
      else if (err.message) errorMessage = err.message;
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchLandlords = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await API.get("admin/landlords/");
      const data = response.data;
      setLandlords(Array.isArray(data) ? data : (data.results || []));
    } catch (err: any) {
      let errorMessage = "Failed to fetch landlords";
      if (err.response?.status === 401) errorMessage = "Unauthorized: Invalid or expired token. Please login again.";
      else if (err.response?.status === 403) errorMessage = "Forbidden: Admin access required.";
      else if (err.response?.data?.error) errorMessage = err.response.data.error;
      else if (err.message) errorMessage = err.message;
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "users") fetchUsers();
    else fetchLandlords();
  }, [activeTab]);

  const data = activeTab === "users" ? users : landlords;

  const filtered = data.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.first_name.toLowerCase().includes(q) ||
      u.last_name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q)
    );
  });

  const isVerified = (u: User) =>
    activeTab === "users" ? u.email_verified : u.kyc_status === "approved";

  const verifiedCount = data.filter(isVerified).length;
  const unverifiedCount = data.length - verifiedCount;

  const getInitials = (first: string, last: string) => {
    return `${(first || '')[0] || ''}${(last || '')[0] || ''}`.toUpperCase() || '?';
  };

  const avatarColors = [
    'bg-purple-500', 'bg-blue-500', 'bg-green-500', 'bg-orange-500',
    'bg-pink-500', 'bg-teal-500', 'bg-indigo-500', 'bg-rose-500',
  ];

  const getAvatarColor = (id: number) => avatarColors[id % avatarColors.length];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100/50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-[#A989C8] to-purple-700 rounded-2xl shadow-md">
              <Users className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">User Management</h1>
              <p className="text-gray-500 mt-0.5">Manage tenants and property owners</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${activeTab === "users" ? "tenants" : "landlords"}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#A989C8]/30 focus:border-[#A989C8] outline-none transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-500">Total</p>
              <div className="p-1.5 bg-purple-50 rounded-lg">
                <Users size={16} className="text-[#A989C8]" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{data.length}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-500">Verified</p>
              <div className="p-1.5 bg-green-50 rounded-lg">
                <ShieldCheck size={16} className="text-green-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-green-600">{verifiedCount}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-500">Unverified</p>
              <div className="p-1.5 bg-yellow-50 rounded-lg">
                <ShieldAlert size={16} className="text-yellow-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-yellow-600">{unverifiedCount}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-500">{activeTab === "users" ? "Avg Bookings" : "Avg Properties"}</p>
              <div className="p-1.5 bg-blue-50 rounded-lg">
                <Building2 size={16} className="text-blue-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-blue-600">
              {data.length > 0
                ? (data.reduce((s, u) => s + (activeTab === "users" ? (u.bookings_count || 0) : (u.properties_count || 0)), 0) / data.length).toFixed(1)
                : '0'}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl border border-gray-200 p-1.5 mb-6 shadow-sm inline-flex">
          <button
            onClick={() => setActiveTab("users")}
            className={`relative px-6 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 transition-all ${
              activeTab === "users"
                ? "bg-gradient-to-r from-[#A989C8] to-purple-700 text-white shadow-md"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            <Users size={18} />
            Tenants
            <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
              activeTab === "users" ? "bg-white/25 text-white" : "bg-gray-200 text-gray-600"
            }`}>{users.length}</span>
          </button>
          <button
            onClick={() => setActiveTab("landlords")}
            className={`relative px-6 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 transition-all ${
              activeTab === "landlords"
                ? "bg-gradient-to-r from-[#A989C8] to-purple-700 text-white shadow-md"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            <Building2 size={18} />
            Landlords
            <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
              activeTab === "landlords" ? "bg-white/25 text-white" : "bg-gray-200 text-gray-600"
            }`}>{landlords.length}</span>
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm font-medium flex items-center gap-3">
            <ShieldAlert size={18} className="shrink-0" />
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-24">
            <div className="bg-white rounded-2xl p-10 border border-gray-200 shadow-sm text-center">
              <Loader2 size={40} className="animate-spin text-[#A989C8] mx-auto mb-4" />
              <p className="text-gray-500 font-medium">Loading {activeTab === "users" ? "tenants" : "landlords"}...</p>
            </div>
          </div>
        )}

        {/* User Cards */}
        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((u) => (
              <div
                key={u.id}
                onClick={() => openUserDetail(u.id)}
                className="group bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-lg hover:border-[#A989C8]/30 transition-all duration-200 cursor-pointer"
              >
                <div className="flex items-start gap-5">
                  {/* Avatar */}
                  <div className={`w-14 h-14 rounded-2xl ${getAvatarColor(u.id)} flex items-center justify-center text-white font-bold text-xl shadow-sm shrink-0`}>
                    {getInitials(u.first_name, u.last_name)}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg truncate">
                          {u.first_name} {u.last_name}
                        </h3>
                        <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-0.5">
                          <Mail size={13} className="shrink-0" />
                          <span className="truncate">{u.email}</span>
                          <span className="text-gray-300 mx-1">·</span>
                          <span className="text-gray-400">@{u.username}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Status Badge */}
                        <span
                          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 ${
                            isVerified(u)
                              ? "bg-green-50 text-green-700 border border-green-200"
                              : "bg-yellow-50 text-yellow-700 border border-yellow-200"
                          }`}
                        >
                          {isVerified(u) ? (
                            <ShieldCheck size={13} />
                          ) : (
                            <ShieldAlert size={13} />
                          )}
                          {activeTab === "users"
                            ? (isVerified(u) ? "Verified" : "Unverified")
                            : (u.kyc_status === "approved" ? "KYC Verified"
                              : u.kyc_status === "pending" ? "KYC Pending"
                              : u.kyc_status === "not_submitted" ? "KYC Not Submitted"
                              : "KYC Rejected")
                          }
                        </span>
                        <ChevronRight size={16} className="text-gray-300 group-hover:text-[#A989C8] transition-colors shrink-0" />
                      </div>
                    </div>

                    {/* Meta Row */}
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-1.5 mt-3 text-sm text-gray-500">
                      {activeTab === "users" ? (
                        <span className="inline-flex items-center gap-1.5">
                          <Building2 size={14} className="text-[#A989C8]" />
                          <span className="font-medium text-gray-700">{u.bookings_count || 0}</span> bookings
                        </span>
                      ) : (
                        <>
                          <span className="inline-flex items-center gap-1.5">
                            <Building2 size={14} className="text-orange-500" />
                            <span className="font-medium text-gray-700">{u.properties_count || 0}</span> properties
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <Users size={14} className="text-blue-500" />
                            <span className="font-medium text-gray-700">{u.total_bookings || 0}</span> total bookings
                          </span>
                        </>
                      )}
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar size={14} className="text-gray-400" />
                        Joined {new Date(u.date_joined).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filtered.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center shadow-sm">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-2xl flex items-center justify-center">
              {activeTab === "users" ? (
                <Users size={32} className="text-gray-400" />
              ) : (
                <Building2 size={32} className="text-gray-400" />
              )}
            </div>
            <p className="text-gray-600 font-medium text-lg">
              {search ? "No matching results" : `No ${activeTab === "users" ? "tenants" : "landlords"} found`}
            </p>
            {search && (
              <button
                onClick={() => setSearch("")}
                className="mt-3 text-sm text-[#A989C8] font-medium hover:text-purple-800 transition-colors"
              >
                Clear search
              </button>
            )}
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {selectedUserId && (
        <UserDetailModal
          userId={selectedUserId}
          userType={activeTab}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onKycUpdate={() => { if (activeTab === "landlords") fetchLandlords(); }}
        />
      )}
    </div>
  );
};

export default UserManagement;
